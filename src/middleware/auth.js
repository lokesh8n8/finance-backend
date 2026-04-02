const jwt = require('jsonwebtoken')
const prisma = require('../config/db')
const { sendError } = require('../utils/response')

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Unauthorized — token missing', 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({ where: { id: decoded.id } })

    if (!user || !user.isActive) {
      return sendError(res, 'Unauthorized — user not found or inactive', 401)
    }

    req.user = user
    next()
  } catch {
    return sendError(res, 'Unauthorized — invalid token', 401)
  }
}

module.exports = authenticate