import { Request, Response, NextFunction } from 'express';
import { recordsService } from './records.service';
import { sendSuccess, sendPaginated } from '../../utils/response';

export class RecordsController {
  async createRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await recordsService.createRecord(req.body, req.user!.userId);
      sendSuccess(res, record, 201, 'Record created successfully');
    } catch (error) {
      next(error);
    }
  }

  async listRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const { records, total, page, limit } = await recordsService.listRecords(req.query as any);
      sendPaginated(res, records, total, page, limit);
    } catch (error) {
      next(error);
    }
  }

  async getRecordById(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await recordsService.getRecordById(req.params.id as string);
      sendSuccess(res, record);
    } catch (error) {
      next(error);
    }
  }

  async updateRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const record = await recordsService.updateRecord(req.params.id as string, req.body);
      sendSuccess(res, record, 200, 'Record updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteRecord(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await recordsService.deleteRecord(req.params.id as string);
      sendSuccess(res, result, 200, 'Record deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const recordsController = new RecordsController();
