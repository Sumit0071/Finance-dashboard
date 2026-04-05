import { Router } from 'express';
import { recordsController } from './records.controller';
import { validate } from '../../middleware/validate';
import {
  createRecordSchema,
  updateRecordSchema,
  listRecordsQuerySchema,
  recordIdParamSchema,
} from './records.validation';
import { authenticate } from '../../middleware/auth';
import { requireRole, requireMinRole } from '../../middleware/rbac';

const router = Router();

// All records routes require authentication
router.use(authenticate);

/**
 * @openapi
 * tags:
 *   name: Records
 *   description: Financial records management
 */

/**
 * @openapi
 * /records:
 *   get:
 *     summary: Get a list of financial records
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: Number of records per page
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Return list of records
 */
router.get(
  '/',
  requireMinRole('VIEWER'),
  validate({ query: listRecordsQuerySchema }),
  recordsController.listRecords
);

/**
 * @openapi
 * /records/{id}:
 *   get:
 *     summary: Get a specific record by ID
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Record ID
 *     responses:
 *       200:
 *         description: The record object
 *       404:
 *         description: Record not found
 */
router.get(
  '/:id',
  requireMinRole('VIEWER'),
  validate({ params: recordIdParamSchema }),
  recordsController.getRecordById
);

/**
 * @openapi
 * /records:
 *   post:
 *     summary: Create a new financial record
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *               - category
 *             properties:
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Record created successfully
 */
router.post(
  '/',
  requireRole('ADMIN'),
  validate({ body: createRecordSchema }),
  recordsController.createRecord
);

/**
 * @openapi
 * /records/{id}:
 *   patch:
 *     summary: Update an existing record
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Record ID
 *     requestBody:
 *       required: false
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
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Record updated successfully
 *       404:
 *         description: Record not found
 */
router.patch(
  '/:id',
  requireRole('ADMIN'),
  validate({ params: recordIdParamSchema, body: updateRecordSchema }),
  recordsController.updateRecord
);

/**
 * @openapi
 * /records/{id}:
 *   delete:
 *     summary: Delete a record
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Record ID
 *     responses:
 *       204:
 *         description: Record deleted successfully
 *       404:
 *         description: Record not found
 */
router.delete(
  '/:id',
  requireRole('ADMIN'),
  validate({ params: recordIdParamSchema }),
  recordsController.deleteRecord
);

export default router;
