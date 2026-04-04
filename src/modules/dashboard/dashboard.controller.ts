import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/response';

export class DashboardController {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await dashboardService.getSummary();
      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBreakdown(req: Request, res: Response, next: NextFunction) {
    try {
      const breakdown = await dashboardService.getCategoryBreakdown();
      sendSuccess(res, breakdown);
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const months = parseInt(req.query.months as string) || 12;
      const trends = await dashboardService.getMonthlyTrends(months);
      sendSuccess(res, trends);
    } catch (error) {
      next(error);
    }
  }

  async getWeeklyTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const weeks = parseInt(req.query.weeks as string) || 12;
      const trends = await dashboardService.getWeeklyTrends(weeks);
      sendSuccess(res, trends);
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activity = await dashboardService.getRecentActivity(limit);
      sendSuccess(res, activity);
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
