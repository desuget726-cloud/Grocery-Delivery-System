const { httpError } = require('../utils/http')

const allowedRoles = new Set(['ADMIN', 'DELIVERY', 'CUSTOMER'])

function roleMiddleware(...roles) {
  const acceptedRoles = roles.flat()
  if (acceptedRoles.some((role) => !allowedRoles.has(role))) {
    throw new TypeError('roleMiddleware received an unsupported role')
  }

  return (req, res, next) => {
    if (!req.user) return next(httpError(401, 'Authentication is required'))
    if (!acceptedRoles.includes(req.user.role)) {
      return next(httpError(403, 'You do not have permission to access this resource'))
    }
    return next()
  }
}

module.exports = roleMiddleware
