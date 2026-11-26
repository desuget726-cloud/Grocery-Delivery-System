const AUDIT_LOG_STORAGE_KEY = 'grocery-audit-log'
const AUDIT_LOG_CHANGE_EVENT = 'grocery-audit-log-change'
const MAX_AUDIT_LOGS = 1000

function getCurrentActor() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    const savedAuth = storage.getItem('grocery-auth')
    if (!savedAuth) continue

    const record = JSON.parse(savedAuth)
    if (record?.user && typeof record.user.id === 'string') {
      return {
        id: record.user.id,
        name: record.user.fullName || record.user.email || 'Unknown user',
        role: record.user.role || 'unknown',
      }
    }
  }

  return { id: 'anonymous', name: 'Guest', role: 'guest' }
}

export function readAuditLogs() {
  const savedLogs = window.localStorage.getItem(AUDIT_LOG_STORAGE_KEY)
  if (savedLogs === null) return []

  const logs = JSON.parse(savedLogs)
  if (!Array.isArray(logs)) {
    throw new TypeError('Stored audit logs must be an array')
  }
  return logs
}

export function logAuditEvent({ action, category, resource, details = '' }) {
  if (!action || !category || !resource) {
    throw new TypeError('Audit events require an action, category, and resource')
  }

  try {
    const event = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date().toISOString(),
      actor: getCurrentActor(),
      action: String(action),
      category: String(category),
      resource: String(resource),
      details: String(details).slice(0, 500),
    }
    const nextLogs = [event, ...readAuditLogs()].slice(0, MAX_AUDIT_LOGS)
    window.localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(nextLogs))
    window.dispatchEvent(new Event(AUDIT_LOG_CHANGE_EVENT))
    return event
  } catch (error) {
    console.error('Unable to save audit log event:', error)
    return null
  }
}

export { AUDIT_LOG_CHANGE_EVENT, AUDIT_LOG_STORAGE_KEY }
