const dashboardService = require('./dashboard.service')
const { sendSuccess } = require('../../utils/response')

const getSummary = async (req, res, next) => {
  try {
    const data = await dashboardService.getSummary(req.user.id, req.user.role)
    return sendSuccess(res, data, 'Dashboard summary fetched successfully')
  } catch (err) {
    next(err)
  }
}

const getCategoryBreakdown = async (req, res, next) => {
  try {
    const data = await dashboardService.getCategoryBreakdown(req.user.id, req.user.role)
    return sendSuccess(res, data, 'Category breakdown fetched successfully')
  } catch (err) {
    next(err)
  }
}

const getMonthlyTrends = async (req, res, next) => {
  try {
    const data = await dashboardService.getMonthlyTrends(req.user.id, req.user.role)
    return sendSuccess(res, data, 'Monthly trends fetched successfully')
  } catch (err) {
    next(err)
  }
}

const getAdminStats = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminStats()
    return sendSuccess(res, data, 'Admin stats fetched successfully')
  } catch (err) {
    next(err)
  }
}

module.exports = { getSummary, getCategoryBreakdown, getMonthlyTrends, getAdminStats }