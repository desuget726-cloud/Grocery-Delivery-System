import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
const AUTH_STORAGE_KEY = 'grocery-auth'
const REGISTERED_USERS_KEY = 'registeredUsers'
const roles = ['customer', 'admin', 'delivery']
const mockUsers = [
  {
    id: 'mock-customer',
    fullName: 'Abebe Kebede',
    email: 'customer@grocery.et',
    phone: '+251911223344',
    password: 'Customer@123',
    role: 'customer',
  },
  {
    id: 'mock-delivery',
    fullName: 'Dawit Tadesse',
    email: 'delivery@grocery.et',
    phone: '+251922334455',
    password: 'Delivery@123',
    role: 'delivery',
  },
  {
    id: 'mock-admin',
    fullName: 'Administrator',
    email: 'admin@grocery.et',
    phone: '+251933445566',
    password: 'Admin@123',
    role: 'admin',
  },
]

function isValidAuthRecord(value) {
  return (
    value &&
    typeof value.token === 'string' &&
    value.user &&
    typeof value.user.id === 'string' &&
    typeof value.user.fullName === 'string' &&
    typeof value.user.email === 'string' &&
    typeof value.user.phone === 'string' &&
    (value.expiresAt === undefined || Number.isFinite(value.expiresAt)) &&
    roles.includes(value.user.role)
  )
}

function readAuthRecord(storage, storageName) {
  const savedValue = storage.getItem(AUTH_STORAGE_KEY)
  if (!savedValue) {
    return null
  }

  const record = JSON.parse(savedValue)
  if (!isValidAuthRecord(record)) {
    throw new TypeError(`Stored ${storageName} authentication data is invalid`)
  }
  if (record.expiresAt !== undefined && record.expiresAt <= Date.now()) {
    storage.removeItem(AUTH_STORAGE_KEY)
    storage.removeItem('token')
    return null
  }
  if (record.user.id === 'mock-admin' && record.user.role === 'admin') {
    return {
      ...record,
      user: { ...record.user, fullName: 'Administrator' },
    }
  }
  return record
}

function loadAuthRecord() {
  if (typeof window === 'undefined') {
    return { user: null, token: null }
  }

  try {
    const savedAuth = readAuthRecord(window.localStorage, 'local')
    if (savedAuth) {
      return savedAuth
    }
  } catch (error) {
    console.error('Unable to load authentication from localStorage:', error)
  }

  try {
    const savedAuth = readAuthRecord(window.sessionStorage, 'session')
    if (savedAuth) {
      return savedAuth
    }
  } catch (error) {
    console.error('Unable to load authentication from sessionStorage:', error)
  }

  return { user: null, token: null }
}

function persistAuthRecord(record, rememberMe) {
  const durableStorage = rememberMe ? window.localStorage : window.sessionStorage
  const otherStorage = rememberMe ? window.sessionStorage : window.localStorage

  durableStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(record))
  durableStorage.setItem('token', record.token)
  otherStorage.removeItem(AUTH_STORAGE_KEY)
  otherStorage.removeItem('token')
}

function getRoleRedirectPath(role) {
  if (role === 'admin') {
    return '/admin/dashboard'
  }
  if (role === 'delivery') {
    return '/delivery/dashboard'
  }
  return '/'
}

function loadRegisteredUsers() {
  const savedUsers = window.localStorage.getItem(REGISTERED_USERS_KEY)
  if (!savedUsers) {
    return []
  }

  const parsedUsers = JSON.parse(savedUsers)
  if (!Array.isArray(parsedUsers)) {
    throw new TypeError('Registered user data must be an array')
  }
  return parsedUsers.filter(
    (registeredUser) =>
      registeredUser &&
      registeredUser.role === 'customer' &&
      typeof registeredUser.email === 'string' &&
      typeof registeredUser.password === 'string',
  )
}

export function AuthProvider({ children }) {
  const [authRecord, setAuthRecord] = useState(loadAuthRecord)
  const [loading, setLoading] = useState(false)

  const login = async (email, password, rememberMe = false) => {
    setLoading(true)
    try {
      if (!email?.trim() || !password) {
        throw new Error('Invalid email or password')
      }

      const normalizedEmail = email.trim().toLowerCase()
      const matchingMockUser = mockUsers.find(
        (mockUser) =>
          mockUser.email === normalizedEmail && mockUser.password === password,
      )
      const matchingRegisteredUser = matchingMockUser
        ? null
        : loadRegisteredUsers().find(
            (registeredUser) =>
              registeredUser.email.trim().toLowerCase() === normalizedEmail &&
              registeredUser.password === password,
          )
      const matchedUser = matchingMockUser || matchingRegisteredUser

      if (!matchedUser) {
        throw new Error('Invalid email or password')
      }

      const user = {
        id: matchedUser.id,
        fullName: matchedUser.fullName,
        email: matchedUser.email,
        phone: matchedUser.phone,
        role: matchedUser.role,
      }
      const token = `mock-token-${user.role}-${Date.now()}`
      const nextRecord = {
        user,
        token,
        ...(rememberMe && { expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 }),
      }

      persistAuthRecord(nextRecord, rememberMe)
      setAuthRecord(nextRecord)

      return { user, redirectTo: getRoleRedirectPath(user.role) }
    } finally {
      setLoading(false)
    }
  }

  const register = async ({ fullName, email, phone, password }) => {
    setLoading(true)
    try {
      if (!fullName?.trim() || !email?.trim() || !phone?.trim() || !password) {
        throw new Error('Complete all fields to create your account.')
      }

      if (typeof window === 'undefined') {
        throw new Error('Registration is only available in a browser')
      }
      const normalizedEmail = email.trim().toLowerCase()
      const existingUsers = loadRegisteredUsers()
      const emailAlreadyUsed =
        mockUsers.some((mockUser) => mockUser.email === normalizedEmail) ||
        existingUsers.some(
          (registeredUser) =>
            registeredUser.email.trim().toLowerCase() === normalizedEmail,
        )

      if (emailAlreadyUsed) {
        throw new Error('An account with this email already exists.')
      }

      const user = {
        id: `user-${normalizedEmail}`,
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        role: 'customer',
      }
      const registeredUser = { ...user, password }
      window.localStorage.setItem(
        REGISTERED_USERS_KEY,
        JSON.stringify([...existingUsers, registeredUser]),
      )
      const nextRecord = {
        user,
        token: `mock-token-${user.role}-${Date.now()}`,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      }

      persistAuthRecord(nextRecord, true)
      setAuthRecord(nextRecord)
      return { user, redirectTo: getRoleRedirectPath(user.role) }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY)
      window.localStorage.removeItem('token')
      window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
      window.sessionStorage.removeItem('token')
      setAuthRecord({ user: null, token: null })
    } catch (error) {
      console.error('Unable to clear saved authentication:', error)
      throw error
    }
  }

  const isAuthenticated = Boolean(authRecord.user && authRecord.token)
  const value = {
    user: authRecord.user,
    token: authRecord.token,
    login,
    register,
    logout,
    isAuthenticated,
    loading,
    getRoleRedirectPath,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// The hook is intentionally exported alongside its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
