import { Router } from 'express';
import { dashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth';
import { requireMinRole } from '../../middleware/rbac';

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

/**
 * @openapi
 * tags:
 *   name: Dashboard
 *   description: Financial dashboard analytics and trends
 */

/**
 * @openapi
 * /dashboard/summary:
 *   get:
 *     summary: Overall financial summary
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial summary metrics
 */
router.get(
  '/summary',
  requireMinRole('VIEWER'),
  dashboardController.getSummary
);

/**
 * @openapi
 * /dashboard/category-breakdown:
 *   get:
 *     summary: Category-wise transaction totals
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category breakdown data
 */
router.get(
  '/category-breakdown',
  requireMinRole('VIEWER'),
  dashboardController.getCategoryBreakdown
);

/**
 * @openapi
 * /dashboard/recent-activity:
 *   get:
 *     summary: Recent transactions list
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity data
 */
router.get(
  '/recent-activity',
  requireMinRole('VIEWER'),
  dashboardController.getRecentActivity
);

/**
 * @openapi
 * /dashboard/trends/monthly:
 *   get:
 *     summary: Monthly financial trends (Analyst+)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly trends data
 */
router.get(
  '/trends/monthly',
  requireMinRole('ANALYST'),
  dashboardController.getMonthlyTrends
);

/**
 * @openapi
 * /dashboard/trends/weekly:
 *   get:
 *     summary: Weekly financial trends (Analyst+)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weekly trends data
 */
router.get(
  '/trends/weekly',
  requireMinRole('ANALYST'),
  dashboardController.getWeeklyTrends
);

export default router;
