import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth';
import { requireMinRole } from '../../middleware/rbac';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// GET /api/dashboard/summary — Overall financial summary (all roles)
router.get(
  '/summary',
  requireMinRole('VIEWER'),
  dashboardController.getSummary
);

// GET /api/dashboard/category-breakdown — Category-wise totals (all roles)
router.get(
  '/category-breakdown',
  requireMinRole('VIEWER'),
  dashboardController.getCategoryBreakdown
);

// GET /api/dashboard/recent-activity — Recent transactions (all roles)
router.get(
  '/recent-activity',
  requireMinRole('VIEWER'),
  dashboardController.getRecentActivity
);

// GET /api/dashboard/trends/monthly — Monthly trends (Analyst+ only)
router.get(
  '/trends/monthly',
  requireMinRole('ANALYST'),
  dashboardController.getMonthlyTrends
);

// GET /api/dashboard/trends/weekly — Weekly trends (Analyst+ only)
router.get(
  '/trends/weekly',
  requireMinRole('ANALYST'),
  dashboardController.getWeeklyTrends
);

export default router;
