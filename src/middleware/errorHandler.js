const { sendError } = require('../utils/response')

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`)

  if (err.name === 'ZodError') {
    return sendError(res, 'Validation failed', 422, err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    })))
  }

  if (err.code === 'P2002') {
    return sendError(res, 'A record with this value already exists', 409)
  }

  if (err.code === 'P2025') {
    return sendError(res, 'Record not found', 404)
  }

  return sendError(res, err.message || 'Internal server error', err.statusCode || 500)
}

module.exports = errorHandler