const router = require("express").Router();
const controller = require("./records.controller");
const authenticate = require("../../middleware/auth");
const roleGuard = require("../../middleware/roleGuard");

/**
 * @swagger
 * tags:
 *   name: Records
 *   description: Financial records management
 */

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create a new financial record
 *     tags: [Records]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, type, category, date]
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Record created successfully
 *       403:
 *         description: Forbidden
 */
router.post(
  "/",
  authenticate,
  roleGuard("ADMIN", "ANALYST"),
  controller.createRecord,
);

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: Get all records with filters and pagination
 *     tags: [Records]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Keyword search across category and notes
 *     responses:
 *       200:
 *         description: Records fetched successfully
 */
router.get(
  "/",
  authenticate,
  roleGuard("ADMIN", "ANALYST", "VIEWER"),
  controller.getAllRecords,
);

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get a record by ID
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record fetched successfully
 *       404:
 *         description: Record not found
 */
router.get(
  "/:id",
  authenticate,
  roleGuard("ADMIN", "ANALYST", "VIEWER"),
  controller.getRecordById,
);

/**
 * @swagger
 * /api/records/{id}:
 *   patch:
 *     summary: Update a financial record
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Record updated successfully
 */
router.patch(
  "/:id",
  authenticate,
  roleGuard("ADMIN", "ANALYST"),
  controller.updateRecord,
);

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     summary: Soft delete a financial record
 *     tags: [Records]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Record deleted successfully
 *       403:
 *         description: Forbidden — admin only
 */
router.delete(
  "/:id",
  authenticate,
  roleGuard("ADMIN"),
  controller.deleteRecord,
);

module.exports = router;
