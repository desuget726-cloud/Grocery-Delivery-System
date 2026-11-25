import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)
const AUTH_STORAGE_KEY = 'grocery-auth'
const REGISTERED_USERS_KEY = 'registeredUsers'
const MOCK_PASSWORDS_STORAGE_KEY = 'grocery_mock_passwords'
const PROFILES_STORAGE_KEY = 'grocery_profiles'
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

function loadSavedProfiles() {
  const savedProfiles = window.localStorage.getItem(PROFILES_STORAGE_KEY)
  if (!savedProfiles) return {}

  const parsedProfiles = JSON.parse(savedProfiles)
  if (!parsedProfiles || Array.isArray(parsedProfiles) || typeof parsedProfiles !== 'object') {
    throw new TypeError('Saved profile data must be an object')
  }
  return parsedProfiles
}

function restoreSavedProfile(user) {
  try {
    const savedProfile = loadSavedProfiles()[user.id]
    if (!savedProfile || typeof savedProfile !== 'object') return user

    return {
      ...user,
      ...(typeof savedProfile.fullName === 'string' && { fullName: savedProfile.fullName }),
      ...(typeof savedProfile.email === 'string' && { email: savedProfile.email }),
      ...(typeof savedProfile.phone === 'string' && { phone: savedProfile.phone }),
      ...(typeof savedProfile.avatar === 'string' && { avatar: savedProfile.avatar }),
    }
  } catch (error) {
    console.error('Unable to load saved profile data:', error)
    return user
  }
}

function loadAuthRecord() {
  if (typeof window === 'undefined') {
    return { user: null, token: null }
  }

  try {
    const savedAuth = readAuthRecord(window.localStorage, 'local')
    if (savedAuth) {
      return { ...savedAuth, user: restoreSavedProfile(savedAuth.user) }
    }
  } catch (error) {
    console.error('Unable to load authentication from localStorage:', error)
  }

  try {
    const savedAuth = readAuthRecord(window.sessionStorage, 'session')
    if (savedAuth) {
      return { ...savedAuth, user: restoreSavedProfile(savedAuth.user) }
    }
  } catch (error) {
    console.error('Unable to load authentication from sessionStorage:', error)
  }

  return { user: null, token: null }
}

function persistAuthRecord(record, rememberMe) {
  const durableStorage = rememberMe ? window.localStorage : window.sessionStorage
  const otherStorage = rememberMe ? window.sessionStorage : window.localStorage
  const persistedRecord = { ...record, user: { ...record.user } }
  delete persistedRecord.user.avatar

  durableStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(persistedRecord))
  durableStorage.setItem('token', persistedRecord.token)
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

function loadMockPasswords() {
  const savedPasswords = window.localStorage.getItem(MOCK_PASSWORDS_STORAGE_KEY)
  if (!savedPasswords) return {}

  const parsedPasswords = JSON.parse(savedPasswords)
  if (!parsedPasswords || Array.isArray(parsedPasswords) || typeof parsedPasswords !== 'object') {
    throw new TypeError('Saved mock password data must be an object')
  }
  return parsedPasswords
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
      const savedMockPasswords = loadMockPasswords()
      const matchingMockUser = mockUsers.find(
        (mockUser) =>
          mockUser.email === normalizedEmail &&
          (savedMockPasswords[mockUser.id] ?? mockUser.password) === password,
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

      const user = restoreSavedProfile({
        id: matchedUser.id,
        fullName: matchedUser.fullName,
        email: matchedUser.email,
        phone: matchedUser.phone,
        role: matchedUser.role,
      })
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

      const user = restoreSavedProfile({
        id: `user-${normalizedEmail}`,
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        role: 'customer',
      })
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

  const updateProfile = (updates) => {
    if (!authRecord.user || !authRecord.token) {
      throw new Error('You must be signed in to update your profile.')
    }

    const user = {
      ...authRecord.user,
      fullName: updates.fullName,
      email: updates.email,
      phone: updates.phone,
      avatar: updates.avatar || '',
    }
    const nextRecord = { ...authRecord, user }

    try {
      const savedProfiles = loadSavedProfiles()
      savedProfiles[user.id] = {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
      }
      window.localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(savedProfiles))
      persistAuthRecord(nextRecord, authRecord.expiresAt !== undefined)
      const registeredUsers = loadRegisteredUsers()
      const registeredUserIndex = registeredUsers.findIndex(
        (registeredUser) => registeredUser.id === user.id,
      )
      if (registeredUserIndex !== -1) {
        registeredUsers[registeredUserIndex] = {
          ...registeredUsers[registeredUserIndex],
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
        }
        window.localStorage.setItem(
          REGISTERED_USERS_KEY,
          JSON.stringify(registeredUsers),
        )
      }
      setAuthRecord(nextRecord)
    } catch (error) {
      console.error('Unable to save profile changes:', error)
      throw new Error('Unable to save your profile. Please try again.', { cause: error })
    }
  }

  const changePassword = (currentPassword, nextPassword) => {
    if (!authRecord.user || !authRecord.token) {
      throw new Error('You must be signed in to update your password.')
    }

    const mockUser = mockUsers.find(({ id }) => id === authRecord.user.id)
    if (mockUser) {
      const savedPasswords = loadMockPasswords()
      if ((savedPasswords[mockUser.id] ?? mockUser.password) !== currentPassword) {
        throw new Error('Current password is incorrect.')
      }
      savedPasswords[mockUser.id] = nextPassword
      window.localStorage.setItem(
        MOCK_PASSWORDS_STORAGE_KEY,
        JSON.stringify(savedPasswords),
      )
      return
    }

    const registeredUsers = loadRegisteredUsers()
    const registeredUser = registeredUsers.find(({ id }) => id === authRecord.user.id)
    if (!registeredUser || registeredUser.password !== currentPassword) {
      throw new Error('Current password is incorrect.')
    }
    registeredUser.password = nextPassword
    window.localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers))
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
    updateProfile,
    changePassword,
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
