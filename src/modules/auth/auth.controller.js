const authService = require('./auth.service')
const { registerSchema, loginSchema } = require('./auth.schema')
const { sendSuccess, sendError } = require('../../utils/response')

const register = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body)
    const result = await authService.register(data)
    return sendSuccess(res, result, 'User registered successfully', 201)
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body)
    const result = await authService.login(data)
    return sendSuccess(res, result, 'Login successful')
  } catch (err) {
    next(err)
  }
}

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id)
    return sendSuccess(res, user, 'User fetched successfully')
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, getMe }