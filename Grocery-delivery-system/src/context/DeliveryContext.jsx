import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { delivery as deliveryApi, getApiErrorMessage } from '../services/api.js'
import { logAuditEvent } from '../services/auditLog.js'
import { useAuth } from './AuthContext.jsx'
import { useToast } from './ToastContext.jsx'

const DeliveryContext = createContext(null)

const emptyState = {
  isOnline: false,
  activeOrders: [],
  completedHistory: [],
  todayEarnings: 0,
  completedTodayCount: 0,
  codCashHeld: 0,
  assignedZone: '',
  rating: 0,
}

function deliveryStatus(order) {
  const statuses = {
    PLACED: 'Incoming',
    CONFIRMED: 'Accepted',
    PACKED: 'Picked Up',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELED: 'Canceled',
  }
  return statuses[order.orderStatus] || order.status
}

function toDeliveryOrder(order) {
  const status = deliveryStatus(order)
  const address = [order.deliveryZone, order.deliveryStreet].filter(Boolean).join(', ')
  return {
    ...order,
    status,
    orderCode: order.orderCode || order.code || order.id,
    customerName: order.customerName || order.customer?.fullName || '',
    customerPhone: order.customerPhone || order.customer?.phone || '',
    address,
    paymentMethod: order.paymentMethod === 'Cash on Delivery' ? 'COD' : order.paymentMethod,
    total: Number(order.total) || 0,
    deliveryFee: Number(order.deliveryFee) || 0,
    items: (order.items || []).map((item) => ({
      ...item,
      quantity: Number(item.quantity ?? item.qty) || 1,
      checked: false,
    })),
  }
}

function metrics(completedOrders) {
  const now = new Date()
  const todaysOrders = completedOrders.filter((order) => {
    const createdAt = new Date(order.createdAt || order.date || 0)
    return createdAt.toDateString() === now.toDateString()
  })
  return {
    todayEarnings: todaysOrders.reduce((sum, order) => sum + (Number(order.deliveryFee) || 0), 0),
    completedTodayCount: todaysOrders.length,
  }
}

export function DeliveryProvider({ children }) {
  const toast = useToast()
  const { isAuthenticated, user } = useAuth()
  const [deliveryState, setDeliveryState] = useState(emptyState)
  const [loading, setLoading] = useState(false)
  const stateRef = useRef(deliveryState)

  const commitState = useCallback((update) => {
    const next = typeof update === 'function' ? update(stateRef.current) : update
    stateRef.current = next
    setDeliveryState(next)
    return next
  }, [])

  const refreshDashboard = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'delivery') {
      commitState(emptyState)
      return
    }
    setLoading(true)
    try {
      const dashboard = await deliveryApi.getDashboard()
      const activeOrders = (dashboard.activeOrders || []).map(toDeliveryOrder)
      const completedHistory = (dashboard.completedOrders || []).map(toDeliveryOrder)
      commitState({
        ...emptyState,
        isOnline: Boolean(dashboard.availability),
        codCashHeld: Number(dashboard.codCashHeld) || 0,
        assignedZone: dashboard.assignedZone || '',
        rating: Number(user.rating) || 0,
        activeOrders,
        completedHistory,
        ...metrics(completedHistory),
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not load delivery assignments.'))
    } finally {
      setLoading(false)
    }
  }, [commitState, isAuthenticated, toast, user])

  useEffect(() => {
    Promise.resolve().then(refreshDashboard)
  }, [refreshDashboard])

  const toggleOnline = useCallback(async () => {
    const nextStatus = !stateRef.current.isOnline
    try {
      await deliveryApi.setAvailability(nextStatus)
      commitState((current) => ({ ...current, isOnline: nextStatus }))
      logAuditEvent({
        action: nextStatus ? 'Went online' : 'Went offline',
        category: 'Delivery',
        resource: 'Availability',
      })
      toast.info(nextStatus ? 'You are now online.' : 'You are now offline.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to update availability.'))
      throw new Error(getApiErrorMessage(error, 'Unable to update availability.'), { cause: error })
    }
  }, [commitState, toast])

  const acceptOrder = useCallback(async (orderId) => {
    const order = stateRef.current.activeOrders.find((item) => item.id === orderId)
    if (!order) throw new Error('This order is no longer active.')
    if (order.status === 'Accepted') return order
    if (order.status !== 'Incoming') throw new Error('Only incoming orders can be accepted.')
    try {
      await deliveryApi.advance(orderId, 'CONFIRMED')
      const updated = { ...order, status: 'Accepted' }
      commitState((current) => ({
        ...current,
        activeOrders: current.activeOrders.map((item) => item.id === orderId ? updated : item),
      }))
      logAuditEvent({ action: 'Accepted delivery', category: 'Delivery', resource: order.orderCode })
      return updated
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to accept this order.'), { cause: error })
    }
  }, [commitState])

  const declineOrder = useCallback(async (orderId) => {
    const order = stateRef.current.activeOrders.find((item) => item.id === orderId)
    if (!order) throw new Error('This order is no longer active.')
    try {
      await deliveryApi.decline(orderId)
      commitState((current) => ({
        ...current,
        activeOrders: current.activeOrders.filter((item) => item.id !== orderId),
      }))
      logAuditEvent({ action: 'Declined delivery', category: 'Delivery', resource: order.orderCode })
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to decline this order.'), { cause: error })
    }
  }, [commitState])

  const advanceOrderStatus = useCallback(async (orderId, nextStatus) => {
    const order = stateRef.current.activeOrders.find((item) => item.id === orderId)
    if (!order) throw new Error('This order is no longer active.')
    const transitions = {
      Accepted: { label: 'Picked Up', apiStatus: 'PACKED' },
      'Picked Up': { label: 'Out for Delivery', apiStatus: 'OUT_FOR_DELIVERY' },
    }
    const transition = transitions[order.status]
    if (!transition || nextStatus !== transition.label) {
      throw new Error(`Cannot move this order from ${order.status} to ${nextStatus}.`)
    }
    if (nextStatus === 'Out for Delivery' && order.items.some((item) => !item.checked)) {
      throw new Error('Verify every grocery item before starting the delivery.')
    }
    try {
      await deliveryApi.advance(orderId, transition.apiStatus)
      const updated = { ...order, status: nextStatus }
      commitState((current) => ({
        ...current,
        activeOrders: current.activeOrders.map((item) => item.id === orderId ? updated : item),
      }))
      logAuditEvent({
        action: 'Updated delivery status',
        category: 'Delivery',
        resource: order.orderCode,
        details: `${order.status} to ${nextStatus}`,
      })
      return updated
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to advance this delivery.'), { cause: error })
    }
  }, [commitState])

  const toggleItemChecked = useCallback((orderId, itemId) => {
    const order = stateRef.current.activeOrders.find((item) => item.id === orderId)
    const checkedItem = order?.items.find((item) => item.id === itemId)
    commitState((current) => ({
      ...current,
      activeOrders: current.activeOrders.map((currentOrder) => currentOrder.id !== orderId
        ? currentOrder
        : {
            ...currentOrder,
            items: currentOrder.items.map((item) =>
              item.id === itemId ? { ...item, checked: !item.checked } : item,
            ),
          }),
    }))
    if (checkedItem) {
      logAuditEvent({
        action: checkedItem.checked ? 'Unchecked delivery item' : 'Verified delivery item',
        category: 'Delivery',
        resource: order.orderCode,
        details: checkedItem.name,
      })
    }
  }, [commitState])

  const completeDelivery = useCallback(async (orderId, { otp, note = '', cashCollected = false }) => {
    const order = stateRef.current.activeOrders.find((item) => item.id === orderId)
    if (!order) throw new Error('This order is no longer active.')
    if (order.status !== 'Out for Delivery') throw new Error('Start the delivery before marking it complete.')
    if (order.items.some((item) => !item.checked)) throw new Error('Verify every grocery item before completing delivery.')
    if (order.paymentMethod === 'COD' && cashCollected !== true) {
      throw new Error('Confirm that the cash was collected before completing this COD order.')
    }
    try {
      const { data } = await deliveryApi.complete(orderId, {
        deliveryOtp: String(otp || '').trim(),
        note: note.trim(),
        cashCollected,
      })
      const completed = toDeliveryOrder(data.order)
      commitState((current) => {
        const history = [completed, ...current.completedHistory.filter((item) => item.id !== orderId)]
        const today = metrics(history)
        return {
          ...current,
          activeOrders: current.activeOrders.filter((item) => item.id !== orderId),
          completedHistory: history,
          todayEarnings: today.todayEarnings,
          completedTodayCount: today.completedTodayCount,
          codCashHeld: current.codCashHeld + (order.paymentMethod === 'COD' ? order.total : 0),
        }
      })
      logAuditEvent({
        action: 'Completed delivery',
        category: 'Delivery',
        resource: order.orderCode,
        details: `Payment method: ${order.paymentMethod}`,
      })
      return completed
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to complete this delivery.'), { cause: error })
    }
  }, [commitState])

  const reportDeliveryIssue = useCallback(async (orderId, reason) => {
    const order = stateRef.current.activeOrders.find((item) => item.id === orderId)
    if (!order) throw new Error('This order is no longer active.')
    if (!reason?.trim()) throw new Error('Choose a reason for reporting this issue.')
    try {
      await deliveryApi.issue(orderId, reason.trim())
      const updated = { ...order, exception: true, issueReason: reason.trim() }
      commitState((current) => ({
        ...current,
        activeOrders: current.activeOrders.map((item) => item.id === orderId ? updated : item),
      }))
      logAuditEvent({
        action: 'Reported delivery issue',
        category: 'Delivery',
        resource: order.orderCode,
        details: reason.trim(),
      })
      return updated
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to report this delivery issue.'), { cause: error })
    }
  }, [commitState])

  const simulateNewOrder = useCallback(() => {
    const error = new Error('New deliveries are assigned by the store team.')
    toast.info(error.message)
    throw error
  }, [toast])

  const value = {
    ...deliveryState,
    loading,
    refreshDashboard,
    acceptOrder,
    advanceOrderStatus,
    completeDelivery,
    declineOrder,
    reportDeliveryIssue,
    simulateNewOrder,
    toggleItemChecked,
    toggleOnline,
  }

  return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDelivery() {
  const context = useContext(DeliveryContext)
  if (context === null) throw new Error('useDelivery must be used within a DeliveryProvider')
  return context
}
