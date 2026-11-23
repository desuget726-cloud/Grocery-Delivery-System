import { CheckCircle2, Clock3, MapPin, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../../components/admin/AdminUI.jsx'
import { loadOrders } from '../../data/mockData.js'
import usePersistentState from '../../hooks/usePersistentState.js'
import formatCurrency from '../../utils/formatCurrency.js'

const COURIER_NAME = 'Jamie Brooks'
const filters = ['All', 'Delivered', 'Cancelled']
const DELIVERY_EARNING = 8.5

function History() {
  const [orders] = usePersistentState('grocery-orders', loadOrders)
  const [filter, setFilter] = useState('All')
  const completedOrders = orders.filter(
    (order) =>
      order.deliveryStaff === COURIER_NAME &&
      ['Delivered', 'Cancelled'].includes(order.status),
  )
  const visibleOrders = useMemo(
    () =>
      [...completedOrders]
        .filter((order) => filter === 'All' || order.status === filter)
        .sort(
          (a, b) =>
            new Date(b.deliveredAt || b.date) - new Date(a.deliveredAt || a.date),
        ),
    [completedOrders, filter],
  )
  const earnings = completedOrders
    .filter((order) => order.status === 'Delivered')
    .reduce(
      (sum, order) => sum + Number(order.deliveryEarnings || DELIVERY_EARNING),
      0,
    )

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-5">
        <p className="text-sm font-semibold text-emerald-700">Your completed work</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Delivery history</h1>
      </header>

      <section className="mb-5 grid grid-cols-2 gap-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle2 aria-hidden="true" size={19} />
          </span>
          <p className="mt-3 text-sm text-slate-500">Completed deliveries</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {completedOrders.filter((order) => order.status === 'Delivered').length}
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <Clock3 aria-hidden="true" size={19} />
          </span>
          <p className="mt-3 text-sm text-slate-500">Total earnings</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(earnings)}</p>
        </article>
      </section>

      <div className="mb-4 flex gap-2">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              filter === item
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {visibleOrders.length > 0 ? (
        <div className="space-y-3">
          {visibleOrders.map((order) => (
            <Link
              key={order.id}
              to={`/delivery/orders/${order.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Order {order.id}
                  </p>
                  <h2 className="mt-1 font-bold text-slate-900">
                    {order.customerName || 'Customer'}
                  </h2>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                <MapPin aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-emerald-700" />
                <span>{order.deliveryAddress || 'Address not provided'}</span>
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                <span className="text-slate-500">
                  {new Date(order.deliveredAt || order.date).toLocaleDateString()}
                </span>
                {order.status === 'Delivered' ? (
                  <span className="font-semibold text-emerald-700">
                    +{formatCurrency(order.deliveryEarnings || DELIVERY_EARNING)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <XCircle aria-hidden="true" size={15} /> No earnings
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
          <p className="text-sm text-slate-500">No {filter === 'All' ? 'completed or cancelled' : filter.toLowerCase()} deliveries in your history yet.</p>
        </section>
      )}
    </div>
  )
}

export default History
