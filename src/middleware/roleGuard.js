const { sendError } = require('../utils/response')

const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return sendError(res, 'Forbidden — insufficient permissions', 403)
    }
    next()
  }
}

module.exports = roleGuard