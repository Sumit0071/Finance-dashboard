import prisma from '../../config/database';
import { AppError } from '../../utils/errors';
import { CreateRecordInput, UpdateRecordInput, ListRecordsQuery } from './records.validation';

const RECORD_SELECT = {
  id: true,
  amount: true,
  type: true,
  category: true,
  date: true,
  description: true,
  deleted: true,
  createdAt: true,
  updatedAt: true,
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

export class RecordsService {
  /**
   * Create a new financial record.
   */
  async createRecord(data: CreateRecordInput, userId: string) {
    const record = await prisma.financialRecord.create({
      data: {
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: new Date(data.date),
        description: data.description || null,
        createdById: userId,
      },
      select: RECORD_SELECT,
    });

    return record;
  }

  /**
   * List records with comprehensive filtering, sorting, and pagination.
   */
  async listRecords(query: ListRecordsQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || 'date';
    const sortOrder = query.sortOrder || 'desc';

    const where: any = { deleted: false };

    // Apply filters
    if (query.type) where.type = query.type;
    if (query.category) where.category = { contains: query.category };

    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) where.date.lte = new Date(query.endDate);
    }

    if (query.minAmount !== undefined || query.maxAmount !== undefined) {
      where.amount = {};
      if (query.minAmount !== undefined) where.amount.gte = query.minAmount;
      if (query.maxAmount !== undefined) where.amount.lte = query.maxAmount;
    }

    if (query.search) {
      where.OR = [
        { description: { contains: query.search } },
        { category: { contains: query.search } },
      ];
    }

    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where,
        select: RECORD_SELECT,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.financialRecord.count({ where }),
    ]);

    return { records, total, page, limit };
  }

  /**
   * Get a single record by ID.
   */
  async getRecordById(id: string) {
    const record = await prisma.financialRecord.findUnique({
      where: { id },
      select: RECORD_SELECT,
    });

    if (!record || record.deleted) {
      throw AppError.notFound('Financial record not found');
    }

    return record;
  }

  /**
   * Update a financial record.
   */
  async updateRecord(id: string, data: UpdateRecordInput) {
    const existing = await prisma.financialRecord.findUnique({ where: { id } });

    if (!existing || existing.deleted) {
      throw AppError.notFound('Financial record not found');
    }

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }

    const record = await prisma.financialRecord.update({
      where: { id },
      data: updateData,
      select: RECORD_SELECT,
    });

    return record;
  }

  /**
   * Soft-delete a financial record.
   */
  async deleteRecord(id: string) {
    const existing = await prisma.financialRecord.findUnique({ where: { id } });

    if (!existing || existing.deleted) {
      throw AppError.notFound('Financial record not found');
    }

    await prisma.financialRecord.update({
      where: { id },
      data: { deleted: true },
    });

    return { message: 'Record deleted successfully' };
  }
}

export const recordsService = new RecordsService();
