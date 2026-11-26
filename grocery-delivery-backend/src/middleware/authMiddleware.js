const jwt = require('jsonwebtoken')
const prisma = require('../config/prisma')
const { httpError, safeUser } = require('../utils/http')

async function authMiddleware(req, res, next) {
  const authorization = req.get('authorization')
  const match = authorization && authorization.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    return next(httpError(401, 'A Bearer token is required'))
  }
  if (!process.env.JWT_SECRET) {
    return next(httpError(500, 'JWT_SECRET is not configured'))
  }

  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET)
    if (!payload || typeof payload.sub !== 'string') {
      throw new Error('Invalid token subject')
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } })
    if (!user || user.status !== 'ACTIVE') {
      return next(httpError(401, 'Your session is invalid or your account is suspended'))
    }

    req.user = safeUser(user)
    return next()
  } catch (error) {
    if (error.status) return next(error)
    return next(httpError(401, 'Invalid or expired token'))
  }
}

module.exports = authMiddleware
