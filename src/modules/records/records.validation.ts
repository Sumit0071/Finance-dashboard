import { z } from 'zod';

const RECORD_TYPES = ['INCOME', 'EXPENSE'] as const;

export const createRecordSchema = z.object({
  amount: z
    .number({ error: 'Amount is required and must be a number' })
    .positive('Amount must be a positive number'),
  type: z.enum(RECORD_TYPES, {
    error: `Type must be one of: ${RECORD_TYPES.join(', ')}`,
  }),
  category: z
    .string({ error: 'Category is required' })
    .min(1, 'Category is required')
    .max(100, 'Category must not exceed 100 characters')
    .trim(),
  date: z
    .string({ error: 'Date is required' })
    .refine(
      (val) => !isNaN(Date.parse(val)),
      { message: 'Date must be a valid date string (ISO 8601 or YYYY-MM-DD)' }
    ),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .trim()
    .optional()
    .nullable(),
});

export const updateRecordSchema = z.object({
  amount: z.number().positive('Amount must be a positive number').optional(),
  type: z.enum(RECORD_TYPES, {
    error: `Type must be one of: ${RECORD_TYPES.join(', ')}`,
  }).optional(),
  category: z
    .string()
    .min(1)
    .max(100)
    .trim()
    .optional(),
  date: z
    .string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      { message: 'Date must be a valid date string (ISO 8601 or YYYY-MM-DD)' }
    )
    .optional(),
  description: z
    .string()
    .max(500)
    .trim()
    .optional()
    .nullable(),
});

export const listRecordsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  type: z.enum(RECORD_TYPES).optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt', 'category']).default('date').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

export const recordIdParamSchema = z.object({
  id: z.string().uuid('Invalid record ID format'),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type ListRecordsQuery = z.infer<typeof listRecordsQuerySchema>;
