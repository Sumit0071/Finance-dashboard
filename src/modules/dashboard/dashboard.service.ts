import prisma from '../../config/database';

export class DashboardService {
  /**
   * Get overall financial summary — total income, total expenses, net balance.
   */
  async getSummary() {
    const [incomeResult, expenseResult, recordCount] = await Promise.all([
      prisma.financialRecord.aggregate({
        _sum: { amount: true },
        _count: true,
        where: { type: 'INCOME', deleted: false },
      }),
      prisma.financialRecord.aggregate({
        _sum: { amount: true },
        _count: true,
        where: { type: 'EXPENSE', deleted: false },
      }),
      prisma.financialRecord.count({ where: { deleted: false } }),
    ]);

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpenses = expenseResult._sum.amount || 0;
    const netBalance = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      totalRecords: recordCount,
      incomeCount: incomeResult._count,
      expenseCount: expenseResult._count,
      savingsRate: totalIncome > 0
        ? Math.round((netBalance / totalIncome) * 10000) / 100
        : 0,
    };
  }

  /**
   * Get totals grouped by category.
   */
  async getCategoryBreakdown() {
    const records = await prisma.financialRecord.groupBy({
      by: ['category', 'type'],
      _sum: { amount: true },
      _count: true,
      where: { deleted: false },
      orderBy: { _sum: { amount: 'desc' } },
    });

    // Structure as { category: { income, expense, net } }
    const breakdown: Record<string, {
      category: string;
      income: number;
      expense: number;
      net: number;
      transactionCount: number;
    }> = {};

    for (const record of records) {
      if (!breakdown[record.category]) {
        breakdown[record.category] = {
          category: record.category,
          income: 0,
          expense: 0,
          net: 0,
          transactionCount: 0,
        };
      }

      const amount = record._sum.amount || 0;
      breakdown[record.category].transactionCount += record._count;

      if (record.type === 'INCOME') {
        breakdown[record.category].income += amount;
      } else {
        breakdown[record.category].expense += amount;
      }
      breakdown[record.category].net =
        breakdown[record.category].income - breakdown[record.category].expense;
    }

    return Object.values(breakdown).sort((a, b) => {
      const totalA = a.income + a.expense;
      const totalB = b.income + b.expense;
      return totalB - totalA;
    });
  }

  /**
   * Get monthly trends for the past N months.
   */
  async getMonthlyTrends(months = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const records = await prisma.financialRecord.findMany({
      where: {
        deleted: false,
        date: { gte: startDate },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
      orderBy: { date: 'asc' },
    });

    // Group by month
    const monthlyData: Record<string, { month: string; income: number; expense: number; net: number; count: number }> = {};

    for (const record of records) {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          income: 0,
          expense: 0,
          net: 0,
          count: 0,
        };
      }

      monthlyData[monthKey].count++;
      if (record.type === 'INCOME') {
        monthlyData[monthKey].income += record.amount;
      } else {
        monthlyData[monthKey].expense += record.amount;
      }
      monthlyData[monthKey].net = monthlyData[monthKey].income - monthlyData[monthKey].expense;
    }

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Get recent activity — last N transactions.
   */
  async getRecentActivity(limit = 10) {
    const records = await prisma.financialRecord.findMany({
      where: { deleted: false },
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        date: true,
        description: true,
        createdAt: true,
        createdBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return records;
  }

  /**
   * Get weekly trends for the past N weeks.
   */
  async getWeeklyTrends(weeks = 12) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);
    startDate.setHours(0, 0, 0, 0);

    const records = await prisma.financialRecord.findMany({
      where: {
        deleted: false,
        date: { gte: startDate },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
      orderBy: { date: 'asc' },
    });

    // Group by ISO week
    const weeklyData: Record<string, { week: string; income: number; expense: number; net: number; count: number }> = {};

    for (const record of records) {
      const date = new Date(record.date);
      const weekStart = new Date(date);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      weekStart.setDate(diff);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          income: 0,
          expense: 0,
          net: 0,
          count: 0,
        };
      }

      weeklyData[weekKey].count++;
      if (record.type === 'INCOME') {
        weeklyData[weekKey].income += record.amount;
      } else {
        weeklyData[weekKey].expense += record.amount;
      }
      weeklyData[weekKey].net = weeklyData[weekKey].income - weeklyData[weekKey].expense;
    }

    return Object.values(weeklyData).sort((a, b) => a.week.localeCompare(b.week));
  }
}

export const dashboardService = new DashboardService();
