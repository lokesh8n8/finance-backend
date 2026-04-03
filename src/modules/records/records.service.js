const prisma = require('../../config/db')
const logAudit = require('../../middleware/auditLogger')

const createRecord = async (data, userId) => {
  const record = await prisma.financialRecord.create({
    data: {
      ...data,
      date: new Date(data.date),
      createdById: userId,
    },
  })

  await logAudit({
    action: 'CREATE',
    entity: 'FinancialRecord',
    entityId: record.id,
    changes: data,
    performedById: userId,
  })

  return record
}

const getAllRecords = async ({ type, category, startDate, endDate, search, page = 1, limit = 10 }, userRole, userId) => {
  const where = {
    deletedAt: null,
  }

  if (type) where.type = type
  if (category) where.category = { contains: category, mode: 'insensitive' }
  if (startDate || endDate) {
    where.date = {}
    if (startDate) where.date.gte = new Date(startDate)
    if (endDate) where.date.lte = new Date(endDate)
  }

  // Keyword search across category and notes
  if (search) {
    where.OR = [
      { category: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (userRole === 'VIEWER') where.createdById = userId

  const skip = (Number(page) - 1) * Number(limit)

  const [records, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { date: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.financialRecord.count({ where }),
  ])

  return {
    records,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  }
}

const getRecordById = async (id, userRole, userId) => {
  const record = await prisma.financialRecord.findFirst({
    where: {
      id,
      deletedAt: null,
      ...(userRole === 'VIEWER' ? { createdById: userId } : {}),
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  })

  if (!record) {
    const error = new Error('Record not found')
    error.statusCode = 404
    throw error
  }

  return record
}

const updateRecord = async (id, data, userRole, userId) => {
  const existing = await prisma.financialRecord.findFirst({
    where: { id, deletedAt: null },
  })

  if (!existing) {
    const error = new Error('Record not found')
    error.statusCode = 404
    throw error
  }

  if (userRole !== 'ADMIN') {
    const error = new Error('Forbidden — only admins can update records')
    error.statusCode = 403
    throw error
  }

  const updated = await prisma.financialRecord.update({
    where: { id },
    data: {
      ...data,
      ...(data.date ? { date: new Date(data.date) } : {}),
    },
  })

  await logAudit({
    action: 'UPDATE',
    entity: 'FinancialRecord',
    entityId: id,
    changes: data,
    performedById: userId,
  })

  return updated
}

const deleteRecord = async (id, userRole, userId) => {
  const existing = await prisma.financialRecord.findFirst({
    where: { id, deletedAt: null },
  })

  if (!existing) {
    const error = new Error('Record not found')
    error.statusCode = 404
    throw error
  }

  // Only admins can delete
  if (userRole !== 'ADMIN') {
    const error = new Error('Forbidden — only admins can delete records')
    error.statusCode = 403
    throw error
  }

  // Soft delete
  await prisma.financialRecord.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  await logAudit({
    action: 'DELETE',
    entity: 'FinancialRecord',
    entityId: id,
    changes: null,
    performedById: userId,
  })
}

module.exports = { createRecord, getAllRecords, getRecordById, updateRecord, deleteRecord }