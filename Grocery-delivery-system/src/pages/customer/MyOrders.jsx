import {
  AlertTriangle,
  Banknote,
  CalendarDays,
  ChevronDown,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  PackageCheck,
  Printer,
  ReceiptText,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import logo from '../../assets/logo.png'
import OrderStatus from '../../components/OrderStatus.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getApiErrorMessage, orders as ordersApi } from '../../services/api.js'

const orderFilters = ['All Orders', 'Active', 'Delivered', 'Canceled']

function normalizedStatus(status = '') {
  const normalized = String(status).trim().toLowerCase().replace(/[_-]+/g, ' ')
  const aliases = {
    pending: 'placed',
    accepted: 'confirmed',
    packed: 'confirmed',
    'picked up': 'out for delivery',
    cancelled: 'canceled',
  }
  return aliases[normalized] || normalized
}

function statusLabel(status = '') {
  const normalized = normalizedStatus(status)
  const labels = {
    placed: 'Placed',
    confirmed: 'Confirmed',
    'out for delivery': 'Out for Delivery',
    delivered: 'Delivered',
    canceled: 'Canceled',
  }
  return labels[normalized] || status || 'Placed'
}

function statusPillClasses(status) {
  const normalized = normalizedStatus(status)
  if (normalized === 'delivered') return 'bg-emerald-50 text-[#1E8E3E]'
  if (normalized === 'canceled') return 'bg-rose-50 text-rose-700'
  if (normalized === 'placed') return 'bg-orange-50 text-[#F04E00]'
  if (normalized === 'out for delivery') return 'bg-[#0B4B8C]/10 text-[#0B4B8C]'
  return 'bg-emerald-50 text-[#0E532B]'
}

function paymentLabel(paymentMethod = '') {
  const method = String(paymentMethod).trim()
  const normalized = method.toLowerCase()
  if (normalized === 'cod' || normalized.includes('cash')) return 'COD'
  if (normalized.includes('cbe')) return 'CBE Birr'
  if (normalized.includes('telebirr')) return 'Telebirr'
  return method || 'Payment pending'
}

function formatETB(amount) {
  const value = Number(amount)
  return `${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)} ETB`
}

function formatOrderDate(date) {
  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-ET', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsedDate)
}

function getOrderTotals(order) {
  const itemsSubtotal = (Array.isArray(order.items) ? order.items : []).reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0,
  )
  const subtotal = Number(order.subtotal ?? itemsSubtotal)
  const discount = Number(order.discount) || 0
  const total = Number(order.total ?? itemsSubtotal)
  const deliveryFee = Number(
    order.deliveryFee ?? Math.max(0, total - subtotal + discount),
  )

  return { subtotal, discount, deliveryFee, total }
}

function getOrderAddress(order) {
  if (typeof order.deliveryAddress === 'string' && order.deliveryAddress.trim()) {
    return order.deliveryAddress
  }
  if (typeof order.address === 'string' && order.address.trim()) {
    return order.address
  }
  if (order.address && typeof order.address === 'object') {
    return [
      order.address.street,
      order.address.zone,
      order.address.city,
    ]
      .filter(Boolean)
      .join(', ')
  }
  return 'Addis Ababa'
}

function ProductThumbnail({ item }) {
  const image = item.image || item.imageUrl
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-emerald-50 text-[#1E8E3E]">
      {image && !imageFailed ? (
        <img
          src={image}
          alt=""
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <Package aria-hidden="true" size={21} />
      )}
    </span>
  )
}

function ReceiptBarcode({ value }) {
  const bits = `101${String(value)
    .split('')
    .map((character) => character.charCodeAt(0).toString(2).padStart(7, '0'))
    .join('')}101`
  const width = bits.length * 2
  const offset = (180 - width) / 2

  return (
    <svg aria-hidden="true" viewBox="0 0 180 40" className="mx-auto h-10 w-44">
      {bits.split('').map((bit, index) =>
        bit === '1' ? (
          <rect
            key={index}
            x={offset + index * 2}
            y="1"
            width="1.5"
            height="34"
            rx="0.3"
            fill="#0E532B"
          />
        ) : null,
      )}
    </svg>
  )
}

function ReceiptModal({ order, onClose }) {
  const { subtotal, discount, deliveryFee, total } = getOrderTotals(order)
  const paymentMethod = order.paymentMethod || 'Not specified'
  const isCod = paymentLabel(paymentMethod) === 'COD'
  const paymentStatus = String(order.paymentStatus || '').toLowerCase()
  const isPaid =
    paymentStatus === 'paid' ||
    paymentStatus === 'completed' ||
    normalizedStatus(order.status) === 'delivered' ||
    (!paymentStatus && !isCod)
  const paymentStamp = isPaid
    ? `✓ Paid via ${paymentMethod}`
    : isCod
      ? 'Cash on Delivery (Pending)'
      : `Payment Pending via ${paymentMethod}`
  const customerName = order.address?.name || order.customerName || 'Customer'
  const customerPhone = order.address?.phone || order.customerPhone || ''
  const address = getOrderAddress(order)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="order-receipt-overlay fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .customer-order-receipt, .customer-order-receipt * { visibility: visible !important; }
          .customer-order-receipt {
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            border: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }
          .customer-receipt-no-print { display: none !important; }
        }
      `}</style>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-receipt-title"
        className="customer-order-receipt w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
      >
        <h2 id="order-receipt-title" className="sr-only">Order Receipt</h2>
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-dashed border-gray-300 bg-gradient-to-r from-[#F3FAF6] via-white to-[#FFF4EC] px-6 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <img src={logo} alt="" className="h-11 w-11 rounded-xl bg-white p-1 shadow-sm" />
              <div>
                <p className="text-sm font-extrabold tracking-tight">
                  <span className="text-[#0E532B]">GROCERY</span>{' '}
                  <span className="text-[#F04E00]">DELIVERY</span>{' '}
                  <span className="text-[#0B4B8C]">SYSTEM</span>
                </p>
                <p className="mt-0.5 text-[10px] font-semibold tracking-[0.16em] text-gray-500">
                  SPEED • FRESH • DIRECT
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-gray-500">
              Bole Road, Addis Ababa • +251 962714305 • TIN: 0048291042
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full border border-[#0B4B8C]/15 bg-white/80 px-3 py-1.5 text-[11px] font-bold text-[#0B4B8C]">
              Receipt # RCP-{order.id}
            </span>
            <button
              type="button"
              aria-label="Close receipt"
              onClick={onClose}
              className="customer-receipt-no-print rounded-full p-2 text-gray-500 transition hover:bg-white hover:text-gray-800"
            >
              <X aria-hidden="true" size={18} />
            </button>
          </div>
        </header>

        <section className="border-b border-dashed border-gray-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              isPaid ? 'bg-emerald-100 text-[#0E722F]' : 'bg-orange-50 text-[#F04E00]'
            }`}>
              {paymentStamp}
            </span>
            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusPillClasses(order.status)}`}>
              {statusLabel(order.status)}
            </span>
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-xs sm:grid-cols-2">
            <div>
              <dt className="text-gray-400">Order ID</dt>
              <dd className="mt-1 font-extrabold text-[#0B4B8C]">{order.id}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Date &amp; Time</dt>
              <dd className="mt-1 font-semibold text-gray-800">{formatOrderDate(order.date)}</dd>
            </div>
            <div>
              <dt className="text-gray-400">Customer &amp; Phone</dt>
              <dd className="mt-1 font-semibold text-gray-800">
                {customerName}{customerPhone ? ` • ${customerPhone}` : ''}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">Delivery Address</dt>
              <dd className="mt-1 font-semibold leading-5 text-gray-800">{address}</dd>
            </div>
          </dl>
        </section>

        <section className="px-6 py-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th scope="col" className="py-2.5 pr-3">Item</th>
                  <th scope="col" className="px-3 py-2.5 text-center">Qty</th>
                  <th scope="col" className="px-3 py-2.5 text-right">Unit Price</th>
                  <th scope="col" className="py-2.5 pl-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(order.items || []).map((item, index) => (
                  <tr key={`${item.id}-${index}`}>
                    <td className="py-3 pr-3">
                      <span className="block font-semibold text-gray-800">{item.name}</span>
                      {item.unit && <span className="mt-0.5 block text-[11px] text-gray-400">{item.unit}</span>}
                    </td>
                    <td className="px-3 py-3 text-center font-medium text-gray-600">{item.quantity}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{formatETB(item.price)}</td>
                    <td className="py-3 pl-3 text-right font-semibold text-gray-800">
                      {formatETB((Number(item.price) || 0) * (Number(item.quantity) || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-2 rounded-xl bg-gray-50 p-4 text-xs">
            <div className="flex justify-between gap-4 text-gray-600">
              <span>Subtotal</span><span>{formatETB(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between gap-4 text-[#1E8E3E]">
                <span>Discount</span><span>−{formatETB(discount)}</span>
              </div>
            )}
            <div className="flex justify-between gap-4 text-gray-600">
              <span>Delivery Fee</span><span>{formatETB(deliveryFee)}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-gray-200 pt-3 text-lg font-extrabold text-[#0E532B]">
              <span>Total {isPaid ? 'Paid' : 'Due'}</span><span>{formatETB(total)}</span>
            </div>
          </div>
        </section>

        <footer className="border-t border-dashed border-gray-300 px-6 py-5 text-center">
          <ReceiptBarcode value={order.id} />
          <p className="mt-1 font-mono text-xs font-semibold tracking-[0.22em] text-gray-600">
            *{order.id}*
          </p>
          <p className="mt-3 text-xs font-medium text-gray-500">
            Thank you for shopping fresh with Grocery Delivery System!
          </p>
          <div className="customer-receipt-no-print mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#0B4B8C] hover:text-[#0B4B8C]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1E8E3E] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0E532B]"
            >
              <Printer aria-hidden="true" size={16} />
              Print / Save PDF
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}

function CancelOrderModal({ order, onCancel, onConfirm }) {
  if (!order) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-order-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertTriangle aria-hidden="true" size={23} />
        </span>
        <h2 id="cancel-order-title" className="mt-4 text-xl font-extrabold text-slate-900">
          Cancel this order?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Order <span className="font-bold text-[#0B4B8C]">{order.id}</span> will be marked as canceled.
          This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Keep Order
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-rose-700"
          >
            Confirm Cancellation
          </button>
        </div>
      </section>
    </div>
  )
}

function MyOrders() {
  const toast = useToast()
  const { orderId } = useParams()
  const { addToCart } = useCart()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('All Orders')
  const [search, setSearch] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState(false)
  const [receiptOrder, setReceiptOrder] = useState(null)
  const [orderToCancel, setOrderToCancel] = useState(null)
  const [expandedOrders, setExpandedOrders] = useState(() => new Set())

  useEffect(() => {
    let active = true
    ordersApi.getMyOrders()
      .then((items) => {
        if (active) setOrders(items)
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Could not load your orders.')))
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [toast])

  const customerOrders = orders
  const visibleOrders = useMemo(() => {
    const query = search.trim().toLowerCase()
    return customerOrders.filter((order) => {
      const status = normalizedStatus(order.status)
      const matchesFilter =
        filter === 'Active'
          ? !['delivered', 'canceled'].includes(status)
          : filter === 'Delivered'
            ? status === 'delivered'
            : filter === 'Canceled'
              ? status === 'canceled'
              : true
      const matchesSearch =
        !query ||
        String(order.code || order.id).toLowerCase().includes(query) ||
        order.items.some((item) => String(item.name || '').toLowerCase().includes(query))
      return matchesFilter && matchesSearch
    })
  }, [customerOrders, filter, search])

  const activeCount = customerOrders.filter(
    (order) => !['delivered', 'canceled'].includes(normalizedStatus(order.status)),
  ).length
  const deliveredCount = customerOrders.filter(
    (order) => normalizedStatus(order.status) === 'delivered',
  ).length
  const totalSpent = customerOrders
    .filter((order) => normalizedStatus(order.status) !== 'canceled')
    .reduce((sum, order) => sum + (Number(order.total) || 0), 0)

  const toggleOrder = (id) => {
    setExpandedOrders((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleReorder = (order) => {
    setActionMessage('')
    setActionError(false)
    try {
      let addedItems = 0
      order.items.forEach((item) => {
        const product = { ...item, id: item.productId || item.id }
        const quantity = Number(item.quantity)

        if (
          !product ||
          (typeof product.id !== 'string' && typeof product.id !== 'number') ||
          !Number.isInteger(quantity) ||
          quantity <= 0
        ) {
          return
        }

        addToCart(product, quantity, false)
        addedItems += quantity
      })

      const message = addedItems > 0
        ? `${addedItems} ${addedItems === 1 ? 'item was' : 'items were'} added to your cart.`
        : 'No items from this order could be added.'
      setActionMessage(message)
      if (addedItems > 0) toast.success('Your previous order has been added to the cart.')
      else toast.warning(message)
    } catch (error) {
      console.error('Unable to reorder these items:', error)
      setActionMessage('We could not add these items. Please try again.')
      setActionError(true)
      toast.error('We could not reorder these items. Please try again.')
    }
  }

  const handleCancelOrder = async () => {
    if (!orderToCancel) return

    setActionMessage('')
    setActionError(false)
    try {
      await ordersApi.cancel(orderToCancel.id)
      setOrders((currentOrders) => currentOrders.map((currentOrder) =>
        currentOrder.id === orderToCancel.id
          ? { ...currentOrder, status: 'Canceled', orderStatus: 'CANCELED' }
          : currentOrder,
      ))
      const code = orderToCancel.code || orderToCancel.id
      setActionMessage(`Order ${code} was canceled.`)
      toast.success(`Order ${code} was canceled.`)
      setOrderToCancel(null)
    } catch (error) {
      const message = getApiErrorMessage(error, 'We could not cancel this order. Please try again.')
      setActionMessage(message)
      setActionError(true)
      toast.error(message)
    }
  }

  const stats = [
    { label: 'Total Orders', value: customerOrders.length, Icon: ShoppingBag, tone: 'text-[#0B4B8C] bg-blue-50' },
    { label: 'Active in Transit', value: activeCount, Icon: Truck, tone: 'text-[#F04E00] bg-orange-50' },
    { label: 'Delivered', value: deliveredCount, Icon: PackageCheck, tone: 'text-[#1E8E3E] bg-emerald-50' },
    { label: 'Total Spent ETB', value: formatETB(totalSpent), Icon: Banknote, tone: 'text-[#0E532B] bg-emerald-50' },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#1E8E3E]">Your grocery history</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#0E532B]">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track deliveries and revisit your past grocery orders.
          </p>
        </div>
      </header>

      <section aria-label="Order summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, Icon, tone }) => (
          <div key={label} className="flex min-w-0 items-center gap-3 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
              <Icon aria-hidden="true" size={19} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium text-gray-500">{label}</span>
              <span className="mt-0.5 block truncate text-lg font-extrabold text-[#0E532B]">{value}</span>
            </span>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div role="group" aria-label="Filter orders" className="flex flex-wrap gap-2">
          {orderFilters.map((orderFilter) => (
            <button
              key={orderFilter}
              type="button"
              aria-pressed={filter === orderFilter}
              onClick={() => setFilter(orderFilter)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === orderFilter
                  ? 'bg-[#0E532B] text-white shadow-sm'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:text-[#0E532B]'
              }`}
            >
              {orderFilter}
            </button>
          ))}
        </div>
        <label className="relative block w-full xl:max-w-sm">
          <Search aria-hidden="true" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by GDS- order ID or item..."
            aria-label="Search orders by order ID or item"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1E8E3E] focus:ring-4 focus:ring-[#1E8E3E]/10"
          />
        </label>
      </section>

      {isLoading && <p className="rounded-xl bg-white p-5 text-center text-sm text-slate-500">Loading your orders…</p>}
      {actionMessage && (
        <p
          role={actionError ? 'alert' : 'status'}
          className={`rounded-xl border p-3 text-sm font-medium ${
            actionError
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          {actionMessage}
        </p>
      )}

      {!isLoading && visibleOrders.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
          <PackageCheck aria-hidden="true" size={42} className="mx-auto text-[#1E8E3E]" />
          <h2 className="mt-3 font-semibold text-gray-900">
            {customerOrders.length === 0 ? 'No orders yet' : 'No orders match your search'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {customerOrders.length === 0
              ? 'Your grocery orders will appear here after you place them.'
              : 'Try a different order ID, item name, or filter.'}
          </p>
          {customerOrders.length === 0 && (
            <Link
              to="/shop"
              className="mt-5 inline-flex rounded-xl bg-[#1E8E3E] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0E532B]"
            >
              Browse groceries
            </Link>
          )}
        </section>
      ) : !isLoading && (
        <div className="space-y-4">
          {visibleOrders.map((order) => {
            const status = normalizedStatus(order.status)
            const displayStatus = statusLabel(order.status)
            const canCancel = ['placed', 'pending'].includes(status)
            const isExpanded = expandedOrders.has(order.id) || orderId === order.id
            const { subtotal, discount, deliveryFee, total } = getOrderTotals(order)
            const itemCount = order.items.reduce(
              (sum, item) => sum + (Number(item.quantity) || 0),
              0,
            )
            const riderName = order.rider?.fullName || order.riderName || order.deliveryRider || ''

            return (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm"
              >
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={`order-details-${order.id}`}
                  onClick={() => toggleOrder(order.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/80 px-5 py-4 text-left transition hover:bg-gray-50 sm:px-6"
                >
                  <span className="min-w-[220px] flex-1">
                    <span className="block text-base font-extrabold text-[#0B4B8C]">{order.code || order.id}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays aria-hidden="true" size={13} />
                        {formatOrderDate(order.date)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
                      <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 font-semibold text-gray-600">
                        {paymentLabel(order.paymentMethod)}
                      </span>
                    </span>
                  </span>
                  <span className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusPillClasses(status)}`}>
                      {displayStatus}
                    </span>
                    <span className="text-base font-extrabold text-[#0E532B]">{formatETB(order.total)}</span>
                    <ChevronDown
                      aria-hidden="true"
                      size={19}
                      className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>

                {isExpanded && (
                  <div id={`order-details-${order.id}`}>
                    <section className="border-b border-gray-100 px-5 py-5 sm:px-6">
                      <OrderStatus status={order.status} />
                    </section>

                    <div className="grid grid-cols-1 items-start gap-6 p-5 sm:p-6 lg:grid-cols-12">
                      <section aria-labelledby={`items-title-${order.id}`} className="lg:col-span-5">
                        <h2 id={`items-title-${order.id}`} className="text-sm font-bold text-gray-900">
                          Ordered Items
                        </h2>
                        <ul className="mt-4 space-y-3">
                          {order.items.map((item, index) => (
                            <li key={`${item.id}-${index}`} className="flex items-center gap-3">
                              <ProductThumbnail item={item} />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-gray-800">{item.name}</span>
                                <span className="mt-0.5 block text-xs text-gray-500">
                                  {[item.unit, `× ${item.quantity}`].filter(Boolean).join(' ')}
                                </span>
                              </span>
                              <span className="shrink-0 text-sm font-bold text-gray-800">
                                {formatETB((Number(item.price) || 0) * (Number(item.quantity) || 0))}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm">
                          <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span><span>{formatETB(subtotal)}</span>
                          </div>
                          {discount > 0 && (
                            <div className="flex justify-between text-[#1E8E3E]">
                              <span>Discount</span><span>−{formatETB(discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-gray-500">
                            <span>Delivery Fee</span><span>{formatETB(deliveryFee)}</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-100 pt-2 font-extrabold text-[#0E532B]">
                            <span>Total</span><span>{formatETB(total)}</span>
                          </div>
                        </div>
                      </section>

                      <section
                        aria-labelledby={`delivery-title-${order.id}`}
                        className="space-y-3 rounded-xl bg-gray-50/70 p-4 text-sm lg:col-span-4"
                      >
                        <h2 id={`delivery-title-${order.id}`} className="font-bold text-gray-900">
                          Delivery Details
                        </h2>
                        <p className="flex items-start gap-2.5 text-gray-600">
                          <Clock3 aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-[#0B4B8C]" />
                          <span><span className="font-semibold text-gray-800">Time slot:</span> {order.deliverySlot || 'To be confirmed'}</span>
                        </p>
                        <p className="flex items-start gap-2.5 text-gray-600">
                          <MapPin aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-[#F04E00]" />
                          <span><span className="font-semibold text-gray-800">Address:</span> {getOrderAddress(order)}</span>
                        </p>
                        <p className="flex items-start gap-2.5 text-gray-600">
                          <CreditCard aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-[#0B4B8C]" />
                          <span><span className="font-semibold text-gray-800">Payment:</span> {order.paymentMethod || 'Not specified'}</span>
                        </p>
                        {riderName && (
                          <p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-[#0B4B8C]">
                            <UserRound aria-hidden="true" size={14} />
                            Rider: {riderName}
                          </p>
                        )}
                      </section>

                      <section aria-label="Order security and actions" className="lg:col-span-3">
                        {!['delivered', 'canceled'].includes(status) && (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                            <ShieldCheck aria-hidden="true" size={21} className="mx-auto text-[#1E8E3E]" />
                            <p className="mt-2 text-[10px] font-extrabold tracking-[0.16em] text-[#0E532B]">
                              DELIVERY OTP PIN
                            </p>
                            <p className="mt-1 font-mono text-2xl font-extrabold tracking-[0.25em] text-[#0E532B]">
                              {String(order.deliveryOtp || order.otp || '1234').split('').join(' ')}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-emerald-800">
                              Share this PIN with your rider on arrival.
                            </p>
                          </div>
                        )}
                        <div className="mt-4 flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleReorder(order)}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0E532B]"
                          >
                            <RotateCcw aria-hidden="true" size={16} />
                            Reorder Items
                          </button>
                          <button
                            type="button"
                            onClick={() => setReceiptOrder(order)}
                            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-bold text-gray-700 transition hover:border-[#0B4B8C] hover:text-[#0B4B8C]"
                          >
                            <ReceiptText aria-hidden="true" size={16} />
                            Receipt
                          </button>
                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => setOrderToCancel(order)}
                              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-200 px-3.5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                            >
                              <X aria-hidden="true" size={16} />
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </section>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {receiptOrder && (
        <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />
      )}
      <CancelOrderModal
        order={orderToCancel}
        onCancel={() => setOrderToCancel(null)}
        onConfirm={handleCancelOrder}
      />
    </div>
  )
}

export default MyOrders
