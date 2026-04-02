const prisma = require('../../config/db')
const logAudit = require('../../middleware/auditLogger')

const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
}

const getAllUsers = async ({ page = 1, limit = 10, role, isActive }) => {
  const where = {}
  if (role) where.role = role
  if (isActive !== undefined) where.isActive = isActive === 'true'

  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: safeUserSelect,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ])

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  }
}

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: safeUserSelect,
  })

  if (!user) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  return user
}

const updateUser = async (id, data, performedById) => {
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: safeUserSelect,
  })

  await logAudit({
    action: 'UPDATE',
    entity: 'User',
    entityId: id,
    changes: data,
    performedById,
  })

  return updated
}

const toggleUserStatus = async (id, performedById) => {
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: !existing.isActive },
    select: safeUserSelect,
  })

  await logAudit({
    action: 'UPDATE',
    entity: 'User',
    entityId: id,
    changes: { isActive: updated.isActive },
    performedById,
  })

  return updated
}

const deleteUser = async (id, performedById) => {
  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) {
    const error = new Error('User not found')
    error.statusCode = 404
    throw error
  }

  await prisma.user.delete({ where: { id } })

  await logAudit({
    action: 'DELETE',
    entity: 'User',
    entityId: id,
    changes: null,
    performedById,
  })
}

module.exports = { getAllUsers, getUserById, updateUser, toggleUserStatus, deleteUser }