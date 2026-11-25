import { ChevronDown, PackageCheck, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import OrderStatus from '../../components/OrderStatus.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { loadOrders, products, saveOrder } from '../../data/mockData.js'
import formatCurrency from '../../utils/formatCurrency.js'

const orderFilters = ['All Orders', 'Active', 'Delivered', 'Canceled']

function normalizedStatus(status = '') {
  const normalized = status.toLowerCase()
  return normalized === 'cancelled' ? 'canceled' : normalized
}

function MyOrders() {
  const { orderId } = useParams()
  const { user, isAuthenticated } = useAuth()
  const { addToCart } = useCart()
  const [orders, setOrders] = useState(loadOrders)
  const [filter, setFilter] = useState('All Orders')
  const [actionMessage, setActionMessage] = useState('')

  const visibleOrders = orders
    .filter((order) => !isAuthenticated || order.customerId === user?.id)
    .filter((order) => {
      const status = normalizedStatus(order.status)
      if (filter === 'Active') {
        return !['delivered', 'canceled'].includes(status)
      }
      if (filter === 'Delivered') {
        return status === 'delivered'
      }
      if (filter === 'Canceled') {
        return status === 'canceled'
      }
      return true
    })

  const handleReorder = (order) => {
    try {
      let addedItems = 0
      order.items.forEach((item) => {
        const catalogProduct = products.find((product) => product.id === item.id)
        const product = catalogProduct
          ? { ...item, ...catalogProduct }
          : item
        const quantity = Number(item.quantity)

        if (
          !product ||
          (typeof product.id !== 'string' && typeof product.id !== 'number') ||
          !Number.isInteger(quantity) ||
          quantity <= 0
        ) {
          return
        }

        for (let count = 0; count < quantity; count += 1) {
          addToCart(product)
          addedItems += 1
        }
      })

      setActionMessage(
        addedItems > 0
          ? `${addedItems} ${addedItems === 1 ? 'item was' : 'items were'} added to your cart.`
          : 'No items from this order could be added.',
      )
    } catch (error) {
      console.error('Unable to reorder these items:', error)
      setActionMessage('We could not add these items. Please try again.')
    }
  }

  const handleCancelOrder = (order) => {
    const updatedOrder = { ...order, status: 'Canceled' }
    try {
      saveOrder(updatedOrder)
      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === order.id ? updatedOrder : currentOrder,
        ),
      )
      setActionMessage(`Order ${order.id} was canceled.`)
    } catch (error) {
      console.error(`Unable to cancel order ${order.id}:`, error)
      setActionMessage('We could not cancel this order. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-[#1E8E3E]">Your grocery history</p>
        <h1 className="mt-1 text-3xl font-bold text-[#0E532B]">My Orders</h1>
      </header>

      {!isAuthenticated && (
        <aside className="flex flex-col justify-between gap-3 rounded-2xl border border-[#0B4B8C]/15 bg-[#0B4B8C]/5 p-4 sm:flex-row sm:items-center sm:px-5">
          <p className="font-medium text-[#0B4B8C]">
            Sign in to sync orders across devices
          </p>
          <Link
            to="/login"
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#0B4B8C] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#083c70]"
          >
            Sign in
          </Link>
        </aside>
      )}

      {actionMessage && (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800"
        >
          {actionMessage}
        </p>
      )}

      <div role="group" aria-label="Filter orders" className="flex flex-wrap gap-2">
        {orderFilters.map((orderFilter) => (
          <button
            key={orderFilter}
            type="button"
            aria-pressed={filter === orderFilter}
            onClick={() => setFilter(orderFilter)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === orderFilter
                ? 'bg-[#1E8E3E] text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-[#0E532B]'
            }`}
          >
            {orderFilter}
          </button>
        ))}
      </div>

      {visibleOrders.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <PackageCheck aria-hidden="true" size={40} className="mx-auto text-[#1E8E3E]" />
          <h2 className="mt-3 font-semibold text-slate-900">No orders in this view</h2>
          <p className="mt-2 text-sm text-slate-500">
            Your grocery orders will appear here after you place them.
          </p>
          <Link
            to="/shop"
            className="mt-5 inline-flex rounded-xl bg-[#1E8E3E] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0E532B]"
          >
            Browse groceries
          </Link>
        </section>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order) => {
            const status = normalizedStatus(order.status)
            const canCancel = ['placed', 'pending'].includes(status)
            const address = order.address
              ? [
                  order.address.street,
                  order.address.city,
                  order.address.postalCode,
                ]
                  .filter(Boolean)
                  .join(', ')
              : order.deliveryAddress

            return (
              <details
                key={order.id}
                open={orderId === order.id || undefined}
                className="group rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
                  <div>
                    <p className="font-bold text-slate-900">Order {order.id}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(order.date).toLocaleDateString()} · {order.items.length}{' '}
                      {order.items.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700'
                          : status === 'canceled'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-[#0B4B8C]/10 text-[#0B4B8C]'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(order.total)}
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      size={18}
                      className="text-slate-400 transition group-open:rotate-180"
                    />
                  </div>
                </summary>
                <div className="space-y-5 border-t border-slate-100 px-5 py-5">
                  <OrderStatus status={order.status} />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <section>
                      <h2 className="text-sm font-semibold text-slate-800">Items</h2>
                      <ul className="mt-2 space-y-2">
                        {order.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex justify-between gap-3 text-sm text-slate-600"
                          >
                            <span>
                              {item.name} × {item.quantity}
                              {item.unit ? ` · ${item.unit}` : ''}
                            </span>
                            <span className="shrink-0">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="space-y-2 text-sm text-slate-600">
                      <h2 className="font-semibold text-slate-800">Delivery details</h2>
                      {order.deliverySlot && (
                        <p>
                          <span className="font-semibold text-slate-800">Time:</span>{' '}
                          {order.deliverySlot}
                        </p>
                      )}
                      {address && (
                        <p>
                          <span className="font-semibold text-slate-800">Address:</span>{' '}
                          {address}
                        </p>
                      )}
                      <p>
                        <span className="font-semibold text-slate-800">Payment:</span>{' '}
                        {order.paymentMethod}
                      </p>
                      {status !== 'canceled' && (
                        <p>
                          <span className="font-semibold text-slate-800">Delivery OTP:</span>{' '}
                          {order.deliveryOtp || '1234'}
                        </p>
                      )}
                    </section>
                  </div>

                  <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#1E8E3E] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0E532B]"
                    >
                      <RotateCcw aria-hidden="true" size={16} />
                      Reorder Items
                    </button>
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(order)}
                        className="inline-flex min-h-10 items-center rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-50"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </details>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyOrders
