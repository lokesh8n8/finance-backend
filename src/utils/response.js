const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data })
}

const sendError = (res, error, statusCode = 400, details = []) => {
  return res.status(statusCode).json({ success: false, error, details })
}

module.exports = { sendSuccess, sendError }