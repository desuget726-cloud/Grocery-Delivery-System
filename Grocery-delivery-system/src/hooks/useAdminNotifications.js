import { useCallback, useEffect, useRef, useState } from 'react'
import { getApiErrorMessage, notifications as notificationsApi } from '../services/api.js'
import { useToast } from '../context/ToastContext.jsx'

const categoryNames = {
  ORDER: 'Orders',
  INVENTORY: 'Inventory',
  REVIEW: 'Reviews',
  PAYMENT: 'Payments',
  SUPPORT: 'Support',
}

const categoryValues = Object.fromEntries(
  Object.entries(categoryNames).map(([key, value]) => [value, key]),
)

function normalizeNotification(notification) {
  return {
    ...notification,
    category: categoryNames[notification.category] || notification.category,
    description: notification.message,
    unread: !notification.isRead,
    priority: String(notification.priority || 'NORMAL').toLowerCase().replace(/^./, (letter) => letter.toUpperCase()),
  }
}

function useAdminNotifications() {
  const toast = useToast()
  const [notifications, setNotifications] = useState([])
  const notificationsRef = useRef(notifications)

  useEffect(() => {
    let active = true
    notificationsApi.getAll()
      .then(({ data }) => {
        if (!active) return
        const items = (data.notifications || []).map(normalizeNotification)
        notificationsRef.current = items
        setNotifications(items)
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Could not load notifications.')))
    return () => {
      active = false
    }
  }, [toast])

  const updateNotifications = useCallback((update) => {
    const previous = notificationsRef.current
    const next = typeof update === 'function' ? update(previous) : update
    if (!Array.isArray(next)) {
      toast.error('Notifications could not be updated.')
      return
    }
    notificationsRef.current = next
    setNotifications(next)

    const nextById = new Map(next.map((item) => [item.id, item]))
    const previousById = new Map(previous.map((item) => [item.id, item]))
    const requests = []
    for (const oldItem of previous) {
      if (!nextById.has(oldItem.id)) {
        requests.push(notificationsApi.remove(oldItem.id))
      } else if (oldItem.unread && !nextById.get(oldItem.id).unread) {
        requests.push(notificationsApi.markRead(oldItem.id))
      }
    }
    for (const item of next) {
      if (previousById.has(item.id)) continue
      requests.push(notificationsApi.create({
        title: item.title,
        message: item.description || item.message || '',
        category: categoryValues[item.category] || 'ORDER',
        priority: String(item.priority || 'NORMAL').toUpperCase(),
        actionPath: item.actionPath,
      }))
    }
    Promise.all(requests).catch((error) => {
      toast.error(getApiErrorMessage(error, 'Could not save notification changes.'))
    })
  }, [toast])

  return [notifications, updateNotifications]
}

export default useAdminNotifications
