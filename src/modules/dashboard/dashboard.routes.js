const router = require('express').Router()
const controller = require('./dashboard.controller')
const authenticate = require('../../middleware/auth')
const roleGuard = require('../../middleware/roleGuard')

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Aggregated analytics and summary data
 */

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get total income, expenses, net balance and recent activity
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard summary fetched successfully
 */
router.get(
  '/summary',
  authenticate,
  roleGuard('ADMIN', 'ANALYST', 'VIEWER'),
  controller.getSummary
)

/**
 * @swagger
 * /api/dashboard/categories:
 *   get:
 *     summary: Get income and expense breakdown by category
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Category breakdown fetched successfully
 */
router.get(
  '/categories',
  authenticate,
  roleGuard('ADMIN', 'ANALYST'),
  controller.getCategoryBreakdown
)

/**
 * @swagger
 * /api/dashboard/trends:
 *   get:
 *     summary: Get monthly income and expense trends
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Monthly trends fetched successfully
 */
router.get(
  '/trends',
  authenticate,
  roleGuard('ADMIN', 'ANALYST'),
  controller.getMonthlyTrends
)

/**
 * @swagger
 * /api/dashboard/admin-stats:
 *   get:
 *     summary: Get user stats and recent audit logs — Admin only
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Admin stats fetched successfully
 *       403:
 *         description: Forbidden
 */
router.get(
  '/admin-stats',
  authenticate,
  roleGuard('ADMIN'),
  controller.getAdminStats
)

module.exports = router