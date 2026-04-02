const prisma = require('../../config/db')

const getSummary = async (userId, userRole) => {
  const where = {
    deletedAt: null,
    ...(userRole === 'VIEWER' ? { createdById: userId } : {}),
  }

  const [incomeAgg, expenseAgg, recentRecords] = await Promise.all([
    prisma.financialRecord.aggregate({
      where: { ...where, type: 'INCOME' },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.financialRecord.aggregate({
      where: { ...where, type: 'EXPENSE' },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.financialRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 5,
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        date: true,
        notes: true,
      },
    }),
  ])

  const totalIncome = incomeAgg._sum.amount || 0
  const totalExpenses = expenseAgg._sum.amount || 0
  const netBalance = totalIncome - totalExpenses

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    totalRecords: incomeAgg._count + expenseAgg._count,
    recentActivity: recentRecords,
  }
}

const getCategoryBreakdown = async (userId, userRole) => {
  const where = {
    deletedAt: null,
    ...(userRole === 'VIEWER' ? { createdById: userId } : {}),
  }

  const records = await prisma.financialRecord.groupBy({
    by: ['category', 'type'],
    where,
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: 'desc' } },
  })

  // Structure it nicely for frontend charts
  const breakdown = {}
  records.forEach(({ category, type, _sum, _count }) => {
    if (!breakdown[category]) {
      breakdown[category] = { category, income: 0, expense: 0, total: 0, count: 0 }
    }
    if (type === 'INCOME') breakdown[category].income += _sum.amount || 0
    if (type === 'EXPENSE') breakdown[category].expense += _sum.amount || 0
    breakdown[category].total += _sum.amount || 0
    breakdown[category].count += _count
  })

  return Object.values(breakdown)
}

const getMonthlyTrends = async (userId, userRole) => {
  const where = {
    deletedAt: null,
    ...(userRole === 'VIEWER' ? { createdById: userId } : {}),
  }

  const records = await prisma.financialRecord.findMany({
    where,
    select: { amount: true, type: true, date: true },
    orderBy: { date: 'asc' },
  })

  // Group by year-month
  const trends = {}
  records.forEach(({ amount, type, date }) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!trends[key]) {
      trends[key] = { month: key, income: 0, expense: 0, net: 0 }
    }
    if (type === 'INCOME') trends[key].income += amount
    if (type === 'EXPENSE') trends[key].expense += amount
    trends[key].net = trends[key].income - trends[key].expense
  })

  return Object.values(trends)
}

const getAdminStats = async () => {
  const [totalUsers, activeUsers, roleBreakdown, auditLogs] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.groupBy({
      by: ['role'],
      _count: true,
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        performedBy: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    }),
  ])

  return {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    roleBreakdown: roleBreakdown.map(({ role, _count }) => ({ role, count: _count })),
    recentAuditLogs: auditLogs,
  }
}

module.exports = { getSummary, getCategoryBreakdown, getMonthlyTrends, getAdminStats }