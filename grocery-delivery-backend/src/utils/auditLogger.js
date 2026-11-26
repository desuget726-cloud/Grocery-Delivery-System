const prisma = require('../config/prisma')

async function logAudit({ req, user, action, entity, entityId, details }) {
  const actor = user || req?.user
  try {
    await prisma.auditLog.create({
      data: {
        actorId: typeof actor?.id === 'string' ? actor.id : null,
        actorName: actor?.fullName || actor?.name || 'System',
        actorRole: actor?.role || 'SYSTEM',
        action,
        entity,
        entityId: entityId || null,
        details: typeof details === 'string' ? details : String(details ?? ''),
        ipAddress: req?.ip || req?.socket?.remoteAddress || null,
      },
    })
  } catch (error) {
    console.error('Unable to write audit log:', error)
  }
}

module.exports = { logAudit }
