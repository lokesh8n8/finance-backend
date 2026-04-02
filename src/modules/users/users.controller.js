const usersService = require('./users.service')
const { updateUserSchema } = require('./users.schema')
const { sendSuccess } = require('../../utils/response')

const getAllUsers = async (req, res, next) => {
  try {
    const result = await usersService.getAllUsers(req.query)
    return sendSuccess(res, result, 'Users fetched successfully')
  } catch (err) {
    next(err)
  }
}

const getUserById = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id)
    return sendSuccess(res, user, 'User fetched successfully')
  } catch (err) {
    next(err)
  }
}

const updateUser = async (req, res, next) => {
  try {
    const data = updateUserSchema.parse(req.body)
    const user = await usersService.updateUser(req.params.id, data, req.user.id)
    return sendSuccess(res, user, 'User updated successfully')
  } catch (err) {
    next(err)
  }
}

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await usersService.toggleUserStatus(req.params.id, req.user.id)
    return sendSuccess(res, user, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`)
  } catch (err) {
    next(err)
  }
}

const deleteUser = async (req, res, next) => {
  try {
    await usersService.deleteUser(req.params.id, req.user.id)
    return sendSuccess(res, null, 'User deleted successfully')
  } catch (err) {
    next(err)
  }
}

module.exports = { getAllUsers, getUserById, updateUser, toggleUserStatus, deleteUser }