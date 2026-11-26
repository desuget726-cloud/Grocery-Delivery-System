import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  authApi,
  getApiErrorMessage,
  normalizeRole,
} from '../services/api.js'
import { logAuditEvent } from '../services/auditLog.js'
import { useToast } from './ToastContext.jsx'

const AuthContext = createContext(null)
const AUTH_STORAGE_KEY = 'grocery-auth'
const roleNames = new Set(['customer', 'admin', 'delivery'])

function normalizeUser(user) {
  return {
    ...user,
    role: normalizeRole(user.role),
    phone: user.phone || '',
  }
}

function readAuthRecord(storage) {
  const saved = storage.getItem(AUTH_STORAGE_KEY)
  if (!saved) return null

  const record = JSON.parse(saved)
  if (
    !record ||
    typeof record.token !== 'string' ||
    !record.user ||
    typeof record.user.id !== 'string' ||
    typeof record.user.fullName !== 'string' ||
    typeof record.user.email !== 'string' ||
    !roleNames.has(normalizeRole(record.user.role))
  ) {
    throw new TypeError('Stored authentication data is invalid')
  }
  return { ...record, user: normalizeUser(record.user) }
}

function loadAuthRecord() {
  if (typeof window === 'undefined') return { user: null, token: null, rememberMe: false }
  for (const [storage, rememberMe] of [
    [window.localStorage, true],
    [window.sessionStorage, false],
  ]) {
    try {
      const record = readAuthRecord(storage)
      if (record) return { ...record, rememberMe }
    } catch (error) {
      console.error('Unable to load saved authentication:', error)
      storage.removeItem(AUTH_STORAGE_KEY)
      storage.removeItem('token')
    }
  }
  return { user: null, token: null, rememberMe: false }
}

function persistAuthRecord(record, rememberMe) {
  const destination = rememberMe ? window.localStorage : window.sessionStorage
  const other = rememberMe ? window.sessionStorage : window.localStorage
  destination.setItem(AUTH_STORAGE_KEY, JSON.stringify(record))
  destination.setItem('token', record.token)
  other.removeItem(AUTH_STORAGE_KEY)
  other.removeItem('token')
}

function clearPersistedAuth() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  window.localStorage.removeItem('token')
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
  window.sessionStorage.removeItem('token')
}

function getRoleRedirectPath(role) {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'delivery') return '/delivery/dashboard'
  return '/'
}

export function AuthProvider({ children }) {
  const toast = useToast()
  const [authRecord, setAuthRecord] = useState(loadAuthRecord)
  const [loading, setLoading] = useState(() => {
    if (typeof window === 'undefined') return false
    return Boolean(
      window.localStorage.getItem(AUTH_STORAGE_KEY) ||
      window.sessionStorage.getItem(AUTH_STORAGE_KEY),
    )
  })

  const saveAuthResponse = useCallback((response, rememberMe) => {
    const record = {
      token: response.token,
      user: normalizeUser(response.user),
      rememberMe,
    }
    persistAuthRecord(record, rememberMe)
    setAuthRecord(record)
    return record
  }, [])

  useEffect(() => {
    if (!authRecord.token) {
      return undefined
    }
    const token = authRecord.token
    const rememberMe = authRecord.rememberMe
    let active = true
    authApi.me()
      .then(({ data }) => {
        if (!active) return
        const record = {
          token,
          rememberMe,
          user: normalizeUser(data.user),
        }
        persistAuthRecord(record, rememberMe)
        setAuthRecord(record)
      })
      .catch((error) => {
        if (!active) return
        if (error.response?.status === 401) {
          clearPersistedAuth()
          setAuthRecord({ user: null, token: null, rememberMe: false })
        } else {
          toast.error(getApiErrorMessage(error, 'Could not verify your session with the server.'))
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [authRecord.token, authRecord.rememberMe, toast])

  const login = async (email, password, rememberMe = false) => {
    setLoading(true)
    try {
      if (!email?.trim() || !password) throw new Error('Enter your email and password.')
      const { data } = await authApi.login({ email: email.trim().toLowerCase(), password })
      const record = saveAuthResponse(data, rememberMe)
      logAuditEvent({ action: 'Signed in', category: 'Account', resource: 'Account' })
      toast.success('Welcome back!')
      return { user: record.user, redirectTo: getRoleRedirectPath(record.user.role) }
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to sign in.')
      toast.error(message)
      throw new Error(message, { cause: error })
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
      const { data } = await authApi.register({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      })
      const record = saveAuthResponse(data, true)
      logAuditEvent({ action: 'Account created', category: 'Account', resource: 'Account' })
      toast.success('Your account has been created successfully.')
      return { user: record.user, redirectTo: getRoleRedirectPath(record.user.role) }
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to create your account.')
      toast.error(message)
      throw new Error(message, { cause: error })
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates) => {
    if (!authRecord.user || !authRecord.token) throw new Error('You must be signed in to update your profile.')
    try {
      const { data } = await authApi.updateProfile({
        fullName: updates.fullName,
        phone: updates.phone,
        avatar: updates.avatar || null,
      })
      const record = { ...authRecord, user: normalizeUser(data.user) }
      persistAuthRecord(record, authRecord.rememberMe)
      setAuthRecord(record)
      logAuditEvent({ action: 'Profile updated', category: 'Account', resource: 'Account' })
      return record.user
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to save your profile.')
      toast.error(message)
      throw new Error(message, { cause: error })
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    if (!authRecord.user || !authRecord.token) throw new Error('You must be signed in to update your password.')
    try {
      await authApi.changePassword({ currentPassword, newPassword })
      logAuditEvent({ action: 'Password changed', category: 'Account', resource: 'Account' })
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to update your password.')
      toast.error(message)
      throw new Error(message, { cause: error })
    }
  }

  const requestPasswordReset = async (email) => {
    try {
      const { data } = await authApi.forgotPassword(email.trim().toLowerCase())
      return data
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to request a password reset.')
      toast.error(message)
      throw new Error(message, { cause: error })
    }
  }

  const verifyPasswordResetOtp = async (email, otp) => {
    try {
      await authApi.verifyOtp(email.trim().toLowerCase(), otp)
      return true
    } catch (error) {
      const message = getApiErrorMessage(error, 'The verification code is invalid or expired.')
      toast.error(message)
      throw new Error(message, { cause: error })
    }
  }

  const resetPassword = async (email, otp, newPassword) => {
    try {
      await authApi.resetPassword(email.trim().toLowerCase(), otp, newPassword)
      toast.success('Your password has been updated.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to reset your password.')
      toast.error(message)
      throw new Error(message, { cause: error })
    }
  }

  const createAddress = async (address) => {
    const { data } = await authApi.createAddress(address)
    const addresses = [...(authRecord.user.addresses || []), data.address]
    const record = { ...authRecord, user: { ...authRecord.user, addresses } }
    persistAuthRecord(record, authRecord.rememberMe)
    setAuthRecord(record)
    return data.address
  }

  const setDefaultAddress = async (id) => {
    await authApi.setDefaultAddress(id)
    const addresses = (authRecord.user.addresses || []).map((address) => ({
      ...address,
      isDefault: address.id === id,
    }))
    const record = { ...authRecord, user: { ...authRecord.user, addresses } }
    persistAuthRecord(record, authRecord.rememberMe)
    setAuthRecord(record)
  }

  const deleteAddress = async (id) => {
    await authApi.deleteAddress(id)
    const { data } = await authApi.me()
    const record = { ...authRecord, user: normalizeUser(data.user) }
    persistAuthRecord(record, authRecord.rememberMe)
    setAuthRecord(record)
  }

  const logout = () => {
    logAuditEvent({ action: 'Signed out', category: 'Account', resource: 'Account' })
    clearPersistedAuth()
    setAuthRecord({ user: null, token: null, rememberMe: false })
    toast.success('You have been logged out.')
  }

  const value = {
    user: authRecord.user,
    token: authRecord.token,
    login,
    register,
    requestPasswordReset,
    verifyPasswordResetOtp,
    resetPassword,
    updateProfile,
    changePassword,
    createAddress,
    setDefaultAddress,
    deleteAddress,
    logout,
    isAuthenticated: Boolean(authRecord.user && authRecord.token),
    loading,
    getRoleRedirectPath,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// The hook is intentionally exported alongside its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
