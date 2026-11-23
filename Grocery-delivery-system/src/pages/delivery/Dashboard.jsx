import { ArrowRight, CheckCircle2, Clock3, DollarSign, MapPin, Power } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatusBadge } from '../../components/admin/AdminUI.jsx'
import { loadOrders } from '../../data/mockData.js'
import usePersistentState from '../../hooks/usePersistentState.js'
import formatCurrency from '../../utils/formatCurrency.js'

const COURIER_NAME = 'Jamie Brooks'
const DELIVERY_EARNING = 8.5

function Dashboard() {
  const [online, setOnline] = usePersistentState('delivery-online', true)
  const [orders] = usePersistentState('grocery-orders', loadOrders)
  const today = new Date().toLocaleDateString()
  const completedToday = orders.filter(
    (order) =>
      order.deliveryStaff === COURIER_NAME &&
      order.status === 'Delivered' &&
      new Date(order.deliveredAt || order.date).toLocaleDateString() === today,
  )
  const assignedOrders = orders.filter(
    (order) =>
      order.deliveryStaff === COURIER_NAME &&
      !['Delivered', 'Cancelled'].includes(order.status),
  )
  const earnings = completedToday.reduce(
    (sum, order) => sum + Number(order.deliveryEarnings || DELIVERY_EARNING),
    0,
  )

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <p className="text-sm font-semibold text-emerald-700">Delivery partner</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
          Hi, Jamie
        </h1>
        <p className="mt-1 text-sm text-slate-500">Ready for a fresh day of deliveries?</p>
      </header>

      <section
        className={`flex items-center justify-between gap-4 rounded-2xl p-5 ${
          online ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
            <Power aria-hidden="true" size={21} />
          </span>
          <div>
            <p className="font-bold">{online ? 'You’re online' : 'You’re offline'}</p>
            <p className="mt-0.5 text-sm text-white/75">
              {online ? 'You can receive delivery assignments.' : 'You won’t receive new assignments.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={online}
          aria-label="Toggle online availability"
          onClick={() => setOnline((current) => !current)}
          className={`relative h-8 w-14 shrink-0 rounded-full transition ${
            online ? 'bg-emerald-300' : 'bg-slate-500'
          }`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
              online ? 'left-7' : 'left-1'
            }`}
          />
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 aria-hidden="true" size={20} />
          </span>
          <p className="mt-4 text-sm text-slate-500">Completed today</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{completedToday.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <DollarSign aria-hidden="true" size={20} />
          </span>
          <p className="mt-4 text-sm text-slate-500">Today’s earnings</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(earnings)}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900">Your route today</h2>
            <p className="mt-1 text-sm text-slate-500">
              {assignedOrders.length} {assignedOrders.length === 1 ? 'active delivery' : 'active deliveries'}
            </p>
          </div>
          <Clock3 aria-hidden="true" size={20} className="text-emerald-700" />
        </div>

        {assignedOrders.length > 0 ? (
          <div className="mt-4 space-y-3">
            {assignedOrders.slice(0, 2).map((order) => (
              <Link
                key={order.id}
                to={`/delivery/orders/${order.id}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-emerald-50"
              >
                <span className="min-w-0">
                  <span className="block font-semibold text-slate-900">{order.customerName}</span>
                  <span className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                    <MapPin aria-hidden="true" size={13} /> {order.deliveryAddress}
                  </span>
                </span>
                <StatusBadge status={order.status} />
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            No active deliveries assigned right now.
          </p>
        )}

        <Link
          to="/delivery/assigned-orders"
          className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
        >
          View assigned orders <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </section>

      <p className="px-2 text-center text-xs text-slate-500">
        Availability changes are saved on this device.
      </p>
    </div>
  )
}

export default Dashboard
