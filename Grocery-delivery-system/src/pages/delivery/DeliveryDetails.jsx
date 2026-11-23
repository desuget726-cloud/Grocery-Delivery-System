import { ArrowLeft, Check, CheckCircle2, MapPin, Navigation, PackageCheck, Phone } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StatusBadge } from '../../components/admin/AdminUI.jsx'
import { loadOrders } from '../../data/mockData.js'
import usePersistentState from '../../hooks/usePersistentState.js'
import formatCurrency from '../../utils/formatCurrency.js'

function DeliveryDetails() {
  const { orderId } = useParams()
  const [orders, setOrders] = usePersistentState('grocery-orders', loadOrders)
  const [checkedItems, setCheckedItems] = useState([])
  const [deliveryNote, setDeliveryNote] = useState('')
  const [otp, setOtp] = useState('')
  const order = orders.find((item) => item.id === orderId)

  if (!order) {
    return (
      <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-xl font-bold text-slate-900">Delivery not found</h1>
        <Link to="/delivery/assigned-orders" className="mt-4 inline-block font-semibold text-emerald-700">
          Return to assigned orders
        </Link>
      </section>
    )
  }

  const isDelivered = order.status === 'Delivered'
  const isCancelled = order.status === 'Cancelled'
  const isOutForDelivery = order.status === 'Out for Delivery'
  const updateDeliveryStatus = () => {
    const now = new Date().toISOString()
    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? isOutForDelivery
            ? {
                ...item,
                status: 'Delivered',
                deliveredAt: now,
                deliveryEarnings: item.deliveryEarnings || 8.5,
                deliveryNote: deliveryNote.trim(),
                deliveryOtp: otp.trim(),
              }
            : { ...item, status: 'Out for Delivery', pickedUpAt: now }
          : item,
      ),
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        to="/delivery/assigned-orders"
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
      >
        <ArrowLeft aria-hidden="true" size={17} /> Assigned orders
      </Link>

      <header className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Delivery {order.id}
          </p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">
            {order.customerName || 'Customer'}
          </h1>
        </div>
        <StatusBadge status={order.status} />
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-900">Customer</h2>
            <p className="mt-1 text-sm text-slate-600">{order.customerName || 'Customer'}</p>
            <p className="mt-1 text-sm text-slate-500">{order.customerPhone || 'Phone not provided'}</p>
          </div>
          <a
            href={`tel:${order.customerPhone || ''}`}
            aria-label={`Call ${order.customerName || 'customer'}`}
            aria-disabled={!order.customerPhone}
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              order.customerPhone
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                : 'pointer-events-none bg-slate-100 text-slate-400'
            }`}
          >
            <Phone aria-hidden="true" size={20} />
          </a>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-start gap-3 p-5">
          <MapPin aria-hidden="true" size={20} className="mt-0.5 shrink-0 text-emerald-700" />
          <div>
            <h2 className="font-bold text-slate-900">Delivery address</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {order.deliveryAddress || 'Address not provided'}
            </p>
          </div>
        </div>
        <div className="flex h-36 items-center justify-center border-t border-slate-100 bg-slate-100">
          <div className="text-center text-slate-500">
            <Navigation aria-hidden="true" size={25} className="mx-auto text-emerald-700" />
            <p className="mt-2 text-sm font-medium">Map preview</p>
            <p className="mt-1 text-xs">{order.distance || order.deliveryAddress}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900">Verify grocery items</h2>
            <p className="mt-1 text-sm text-slate-500">{order.items.length} items in this order</p>
          </div>
          <PackageCheck aria-hidden="true" size={21} className="text-emerald-700" />
        </div>
        <ul className="mt-3 divide-y divide-slate-100">
          {order.items.map((item) => {
            const checked = checkedItems.includes(item.id)
            return (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <button
                  type="button"
                  aria-label={`${checked ? 'Uncheck' : 'Verify'} ${item.name}`}
                  aria-pressed={checked}
                  onClick={() =>
                    setCheckedItems((current) =>
                      checked
                        ? current.filter((id) => id !== item.id)
                        : [...current, item.id],
                    )
                  }
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                    checked
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-300 bg-white text-transparent'
                  }`}
                >
                  <Check aria-hidden="true" size={15} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.unit}</p>
                </div>
                <span className="text-sm font-semibold text-slate-700">× {item.quantity}</span>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Order total</span>
          <span className="font-bold text-slate-900">{formatCurrency(order.total)}</span>
        </div>
        {order.paymentMethod === 'Cash on Delivery' && (
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            Collect {formatCurrency(order.total)} from the customer.
          </p>
        )}
      </section>

      {!isDelivered && !isCancelled && (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
          {isOutForDelivery && (
            <>
              <label className="block text-sm font-medium text-slate-700">
                Delivery note <span className="font-normal text-slate-400">(optional)</span>
                <textarea
                  value={deliveryNote}
                  onChange={(event) => setDeliveryNote(event.target.value)}
                  rows="2"
                  placeholder="Add a note about this delivery..."
                  className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Customer OTP <span className="font-normal text-slate-400">(optional)</span>
                <input
                  inputMode="numeric"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="Enter delivery code"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500"
                />
              </label>
            </>
          )}
          <button
            type="button"
            onClick={updateDeliveryStatus}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white transition hover:bg-emerald-700"
          >
            {isOutForDelivery ? (
              <>
                <CheckCircle2 aria-hidden="true" size={19} /> Mark as Delivered
              </>
            ) : (
              <>
                <PackageCheck aria-hidden="true" size={19} /> Mark as Picked Up
              </>
            )}
          </button>
        </section>
      )}

      {isDelivered && (
        <p role="status" className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          <CheckCircle2 aria-hidden="true" size={19} /> Delivery completed
        </p>
      )}
      {isCancelled && (
        <p role="status" className="rounded-2xl bg-slate-100 p-4 text-center text-sm font-semibold text-slate-600">
          This delivery was cancelled.
        </p>
      )}
    </div>
  )
}

export default DeliveryDetails
