import {
  ArrowRight,
  CheckCircle2,
  MapPin,
  Navigation,
  Package,
  Phone,
  Star,
  TriangleAlert,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useDelivery } from '../../context/DeliveryContext.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

function Dashboard() {
  const toast = useToast()
  const { t } = useLanguage()
  const { user } = useAuth()
  const {
    activeOrders,
    codCashHeld,
    completedTodayCount,
    isOnline: online,
    todayEarnings,
    toggleOnline,
  } = useDelivery()
  const riderName = user?.fullName || 'Dawit Tadesse'
  const activeDelivery =
    activeOrders.find((order) => order.status === 'Out for Delivery') ||
    activeOrders[0]
  const routeOrders = activeOrders.filter((order) => order.id !== activeDelivery?.id)

  const getDirectionsUrl = (address) =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`

  return (
    <div className="w-full space-y-6 px-4 sm:px-6 lg:px-10 py-6 pb-24">
      <section
        className={`flex items-center justify-between gap-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-l-4 ${
          online ? 'border-l-[#1E8E3E]' : 'border-l-gray-300'
        }`}
      >
        <div>
          <span className="inline-flex rounded-full bg-[#0B4B8C]/10 text-[#0B4B8C] text-xs font-semibold px-3 py-1">
            {t('deliveryPartner')}
          </span>
          <h1 className="mt-3 text-[#0E532B] text-2xl font-extrabold">Hi, {riderName} 👋</h1>
          <p className="mt-1 text-gray-500 text-sm">Motorbike • AA-23451 • Bole Zone</p>
          {online ? (
            <p className="mt-3 inline-flex items-center gap-2 bg-emerald-50 text-[#1E8E3E] border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#1E8E3E]" />
              Online • Receiving live assignments
            </p>
          ) : (
            <p className="mt-3 inline-flex items-center rounded-full bg-gray-100 text-gray-600 px-3 py-1 text-xs font-semibold">
              Offline
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className={`hidden text-sm font-semibold sm:block ${online ? 'text-[#1E8E3E]' : 'text-gray-500'}`}>
            {online ? 'Accepting Orders' : 'Paused'}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={online}
            aria-label={t('online')}
            onClick={toggleOnline}
            className={`relative h-12 w-20 shrink-0 rounded-full transition ${
              online ? 'bg-[#1E8E3E]' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1.5 h-9 w-9 rounded-full bg-white shadow-lg transition ${
                online ? 'left-9' : 'left-1.5'
              }`}
            />
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0E532B]/10 text-[#0E532B]">
            <Wallet aria-hidden="true" size={21} />
          </span>
          <p className="mt-4 text-sm text-slate-500">{t('todaysEarnings')}</p>
          <p className="mt-1 text-lg font-extrabold text-[#0E532B]">{todayEarnings.toFixed(2)} ETB</p>
        </article>
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 aria-hidden="true" size={21} />
          </span>
          <p className="mt-4 text-sm text-slate-500">{t('completedToday')}</p>
          <p className="mt-1 text-lg font-extrabold text-slate-900">{completedTodayCount} Trips</p>
        </article>
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F04E00]/10 text-[#F04E00]">
            <TriangleAlert aria-hidden="true" size={21} />
          </span>
          <p className="mt-4 text-sm text-slate-500">{t('codCashHeld')}</p>
          <p className="mt-1 text-lg font-extrabold text-[#F04E00]">{codCashHeld.toFixed(2)} ETB</p>
        </article>
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B4B8C]/10 text-[#0B4B8C]">
            <Star aria-hidden="true" size={21} fill="currentColor" />
          </span>
          <p className="mt-4 text-sm text-slate-500">{t('riderRating')}</p>
          <p className="mt-1 text-lg font-extrabold text-slate-900">4.9 ★</p>
          <p className="mt-1 text-xs font-semibold text-[#0B4B8C]">
            98% {t('onTime')}
          </p>
        </article>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                {t('priorityDropoff')}
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                {t('activeDeliveryNow')}
              </h2>
            </div>
            {activeDelivery && (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#0B4B8C]/10 px-3 py-1.5 text-xs font-bold text-[#0B4B8C]">
                  {activeDelivery.status}
                </span>
                <span className="text-sm font-bold text-slate-500">{activeDelivery.orderCode}</span>
              </div>
            )}
          </div>

          {activeDelivery ? (
            <>
              <div className="mt-5 grid gap-5 md:grid-cols-[1fr_auto]">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{activeDelivery.customerName}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">{activeDelivery.customerPhone}</p>
                  <div className="mt-4 flex items-start gap-2 text-sm text-slate-700">
                    <MapPin aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-[#0B4B8C]" />
                    <div>
                      <p>{activeDelivery.address}</p>
                      {(activeDelivery.distance || activeDelivery.eta) && (
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {[activeDelivery.distance, activeDelivery.eta && `~${activeDelivery.eta} away`].filter(Boolean).join(' • ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                    <Package aria-hidden="true" size={16} />
                    {activeDelivery.items.length} Grocery Items
                  </div>
                </div>
                <div className="flex items-start md:justify-end">
                  <div className="rounded-xl bg-[#F04E00]/10 px-4 py-3 text-sm font-extrabold text-[#F04E00]">
                    {activeDelivery.paymentMethod === 'COD'
                      ? `Collect Cash (COD): ${Number(activeDelivery.total).toFixed(2)} ETB`
                      : 'Payment received via Telebirr'}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 sm:flex">
                <a
                  href={`tel:${activeDelivery.customerPhone.replace(/\s/g, '')}`}
                  onClick={() => toast.info(`Calling ${activeDelivery.customerName}...`)}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Phone aria-hidden="true" size={17} /> Call Customer
                </a>
                <a
                  href={getDirectionsUrl(activeDelivery.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Navigation aria-hidden="true" size={17} /> Directions
                </a>
                <Link
                  to={`/delivery/details/${activeDelivery.id}`}
                  className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-4 text-sm font-bold text-white transition hover:bg-[#0E532B] sm:ml-auto"
                >
                  Open Delivery &amp; Complete <ArrowRight aria-hidden="true" size={17} />
                </Link>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="font-semibold text-slate-700">No active deliveries right now.</p>
              <Link to="/delivery/assigned-orders" className="mt-3 inline-flex font-bold text-[#1E8E3E]">
                View assigned orders <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 lg:col-span-5">
          <h2 className="text-lg font-extrabold text-slate-900">Your Route Today</h2>
          <p className="mt-1 text-sm text-slate-500">{t('queuedOrders')}</p>
          <div className="mt-4 divide-y divide-slate-100">
            {routeOrders.length > 0 ? routeOrders.map((order) => (
              <Link
                key={order.id}
                to={`/delivery/details/${order.id}`}
                className="flex items-center justify-between gap-3 py-4 first:pt-1"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {order.orderCode} • {order.customerName} • {order.address.split(',')[0]}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-[#0B4B8C]">
                    {order.status}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-[#0E532B]">
                  +{Number(order.deliveryFee).toFixed(2)} ETB fee
                </span>
              </Link>
            )) : (
              <p className="py-5 text-sm text-slate-500">No other deliveries in your route.</p>
            )}
          </div>
          <div className="mt-2 grid gap-2">
            <Link
              to="/delivery/assigned-orders"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-4 text-sm font-bold text-white transition hover:bg-[#0E532B]"
            >
              View All Assigned Orders <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
