function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next)
}

function httpError(status, message) {
  const error = new Error(message)
  error.status = status
  return error
}

function safeUser(user) {
  if (!user) return null
  const { passwordHash, resetOtp, resetOtpExpires, ...publicUser } = user
  return publicUser
}

function requiredString(value, name) {
  if (typeof value !== 'string' || !value.trim()) {
    throw httpError(400, `${name} is required`)
  }
  return value.trim()
}

function positiveInteger(value, name) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw httpError(400, `${name} must be a positive integer`)
  }
  return parsed
}

module.exports = { asyncHandler, httpError, positiveInteger, requiredString, safeUser }
