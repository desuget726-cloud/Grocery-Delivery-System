const authMiddleware = require('./authMiddleware')

function optionalAuthMiddleware(req, res, next) {
  if (!req.get('authorization')) return next()
  return authMiddleware(req, res, next)
}

module.exports = optionalAuthMiddleware
