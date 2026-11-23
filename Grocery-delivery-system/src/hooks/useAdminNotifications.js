import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ADMIN_NOTIFICATIONS_KEY,
  initialAdminNotifications,
} from '../data/adminNotifications.js'

const notificationEvent = 'grocery-admin-notifications-change'

function readNotifications() {
  try {
    const saved = window.localStorage.getItem(ADMIN_NOTIFICATIONS_KEY)
    if (saved !== null) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed
      console.error(`${ADMIN_NOTIFICATIONS_KEY} must contain an array.`)
      return initialAdminNotifications
    }

    window.localStorage.setItem(
      ADMIN_NOTIFICATIONS_KEY,
      JSON.stringify(initialAdminNotifications),
    )
  } catch (error) {
    console.error(`Unable to load ${ADMIN_NOTIFICATIONS_KEY} from localStorage:`, error)
  }

  return initialAdminNotifications
}

function useAdminNotifications() {
  const [notifications, setNotificationsState] = useState(readNotifications)
  const notificationsRef = useRef(notifications)

  useEffect(() => {
    const syncNotifications = (event) => {
      const next = event.type === notificationEvent ? event.detail : readNotifications()
      if (Array.isArray(next)) {
        notificationsRef.current = next
        setNotificationsState(next)
      }
    }

    window.addEventListener(notificationEvent, syncNotifications)
    window.addEventListener('storage', syncNotifications)
    return () => {
      window.removeEventListener(notificationEvent, syncNotifications)
      window.removeEventListener('storage', syncNotifications)
    }
  }, [])

  const setNotifications = useCallback((update) => {
    const next =
      typeof update === 'function' ? update(notificationsRef.current) : update
    if (!Array.isArray(next)) {
      console.error('Admin notifications must be stored as an array.')
      return
    }

    notificationsRef.current = next
    setNotificationsState(next)
    try {
      window.localStorage.setItem(ADMIN_NOTIFICATIONS_KEY, JSON.stringify(next))
    } catch (error) {
      console.error(`Unable to save ${ADMIN_NOTIFICATIONS_KEY} to localStorage:`, error)
    }
    window.dispatchEvent(new CustomEvent(notificationEvent, { detail: next }))
  }, [])

  return [notifications, setNotifications]
}

export default useAdminNotifications
