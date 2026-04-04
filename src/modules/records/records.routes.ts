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

// GET /api/records — List records (all authenticated users)
router.get(
  '/',
  requireMinRole('VIEWER'),
  validate({ query: listRecordsQuerySchema }),
  recordsController.listRecords
);

// GET /api/records/:id — Get a single record (all authenticated users)
router.get(
  '/:id',
  requireMinRole('VIEWER'),
  validate({ params: recordIdParamSchema }),
  recordsController.getRecordById
);

// POST /api/records — Create record (Admin only)
router.post(
  '/',
  requireRole('ADMIN'),
  validate({ body: createRecordSchema }),
  recordsController.createRecord
);

// PATCH /api/records/:id — Update record (Admin only)
router.patch(
  '/:id',
  requireRole('ADMIN'),
  validate({ params: recordIdParamSchema, body: updateRecordSchema }),
  recordsController.updateRecord
);

// DELETE /api/records/:id — Soft-delete record (Admin only)
router.delete(
  '/:id',
  requireRole('ADMIN'),
  validate({ params: recordIdParamSchema }),
  recordsController.deleteRecord
);

export default router;
