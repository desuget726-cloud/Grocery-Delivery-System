import { ArrowRight, Clock3, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../../components/admin/AdminUI.jsx'
import { loadOrders } from '../../data/mockData.js'
import usePersistentState from '../../hooks/usePersistentState.js'
import formatCurrency from '../../utils/formatCurrency.js'

const COURIER_NAME = 'Jamie Brooks'

function AssignedOrders() {
  const [orders] = usePersistentState('grocery-orders', loadOrders)
  const assignedOrders = orders.filter(
    (order) =>
      order.deliveryStaff === COURIER_NAME &&
      !['Delivered', 'Cancelled'].includes(order.status),
  )

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-5">
        <p className="text-sm font-semibold text-emerald-700">Your route</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Assigned orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          {assignedOrders.length} active {assignedOrders.length === 1 ? 'delivery' : 'deliveries'}
        </p>
      </header>

      {assignedOrders.length > 0 ? (
        <div className="space-y-4">
          {assignedOrders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Order {order.id}
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">
                    {order.customerName || 'Customer'}
                  </h2>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="mt-4 space-y-2.5 text-sm">
                <p className="flex items-start gap-2 text-slate-600">
                  <MapPin aria-hidden="true" size={17} className="mt-0.5 shrink-0 text-emerald-700" />
                  <span>{order.deliveryAddress || 'Address not provided'}</span>
                </p>
                <p className="flex items-center gap-2 text-slate-600">
                  <Clock3 aria-hidden="true" size={17} className="shrink-0 text-emerald-700" />
                  <span>{order.distance || 'Route'} · {order.estimatedTime || order.deliverySlot}</span>
                </p>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-slate-500">Order total</span>
                  <span className="font-bold text-slate-900">{formatCurrency(order.total)}</span>
                </div>
                {order.paymentMethod === 'Cash on Delivery' && (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                    Collect {formatCurrency(order.total)} cash on delivery
                  </p>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <a
                  href={`tel:${order.customerPhone || ''}`}
                  aria-disabled={!order.customerPhone}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-semibold ${
                    order.customerPhone
                      ? 'text-slate-700 hover:bg-slate-50'
                      : 'pointer-events-none text-slate-400'
                  }`}
                >
                  <Phone aria-hidden="true" size={16} /> Call
                </a>
                <Link
                  to={`/delivery/orders/${order.id}`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Open delivery <ArrowRight aria-hidden="true" size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
          <MapPin aria-hidden="true" size={36} className="mx-auto text-emerald-600" />
          <h2 className="mt-3 font-bold text-slate-900">You’re all caught up</h2>
          <p className="mt-2 text-sm text-slate-500">New assigned orders will appear here.</p>
          <Link to="/delivery" className="mt-5 inline-block font-semibold text-emerald-700">
            Back to dashboard
          </Link>
        </section>
      )}
    </div>
  )
}

export default AssignedOrders
