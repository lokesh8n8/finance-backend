const prisma = require('../config/db')

// Call this inside service functions after mutations
const logAudit = async ({ action, entity, entityId, changes, performedById }) => {
  try {
    await prisma.auditLog.create({
      data: { action, entity, entityId, changes, performedById },
    })
  } catch (err) {
    console.error('[AUDIT LOG ERROR]', err.message)
  }
}

module.exports = logAudit