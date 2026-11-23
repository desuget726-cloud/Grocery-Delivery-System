import { CheckCircle2, CircleDollarSign, MapPin, Wallet, XCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext.jsx'

const history = [
  {
    id: 'GDS-2531',
    customer: 'Hiwot Alemu',
    neighborhood: 'Bole',
    address: 'Bole Atlas, Addis Ababa',
    status: 'Delivered',
    payment: 'Cash on Delivery',
    earnings: 80,
    tip: 20,
    timestamp: '2026-11-23T18:42:00',
  },
  {
    id: 'GDS-2529',
    customer: 'Yonatan Bekele',
    neighborhood: 'Kazanchis',
    address: 'Guinea Conakry Street, Addis Ababa',
    status: 'Delivered',
    payment: 'Telebirr',
    earnings: 75,
    tip: 15,
    timestamp: '2026-11-23T16:18:00',
  },
  {
    id: 'GDS-2527',
    customer: 'Liya Girma',
    neighborhood: 'CMC',
    address: 'Sunshine Real Estate, Addis Ababa',
    status: 'Canceled',
    payment: 'Cash on Delivery',
    earnings: 0,
    tip: 0,
    timestamp: '2026-11-23T14:05:00',
  },
  {
    id: 'GDS-2524',
    customer: 'Daniel Haile',
    neighborhood: 'Sarbet',
    address: 'Bisrate Gebriel, Addis Ababa',
    status: 'Delivered',
    payment: 'Cash on Delivery',
    earnings: 70,
    tip: 10,
    timestamp: '2026-11-22T19:30:00',
  },
]

const filters = ['All', 'Delivered', 'Canceled']

function History() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState('All')
  const visible = useMemo(
    () => history.filter((order) => filter === 'All' || order.status === filter),
    [filter],
  )
  const delivered = history.filter((order) => order.status === 'Delivered')
  const earned = delivered.reduce((sum, order) => sum + order.earnings + order.tip, 0)
  const codSettled = delivered
    .filter((order) => order.payment === 'Cash on Delivery')
    .reduce((sum) => sum + 680, 0)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8">
      <header>
        <p className="text-sm font-semibold text-[#1E8E3E]">
          {t('yourCompletedWork')}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
          {t('deliveryHistory')}
        </h1>
      </header>

      <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            labelKey: 'totalCompletedTrips',
            value: String(delivered.length),
            icon: CheckCircle2,
            tone: 'bg-[#1E8E3E]/10 text-[#1E8E3E]',
          },
          {
            labelKey: 'totalEarned',
            value: `${earned.toFixed(2)} ETB`,
            icon: CircleDollarSign,
            tone: 'bg-[#0E532B]/10 text-[#0E532B]',
          },
          {
            labelKey: 'codCashSettled',
            value: `${codSettled.toFixed(2)} ETB`,
            icon: Wallet,
            tone: 'bg-[#F04E00]/10 text-[#F04E00]',
          },
        ].map(({ labelKey, value, icon: Icon, tone }) => (
          <article key={labelKey} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
              <Icon aria-hidden="true" size={20} />
            </span>
            <p className="mt-4 text-sm text-slate-500">{t(labelKey)}</p>
            <p className="mt-1 text-xl font-extrabold text-slate-900">{value}</p>
          </article>
        ))}
      </section>

      <div className="mt-6 flex gap-2">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-sm font-bold ${
              filter === item
                ? 'bg-[#0E532B] text-white'
                : 'border border-slate-200 bg-white text-slate-600'
            }`}
          >
            {t(item)}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {visible.map((order) => (
          <Link
            key={order.id}
            to={`/delivery/details/${order.id}`}
            className="block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-[#1E8E3E]/30"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-[#0B4B8C]">{order.id}</p>
                <h2 className="mt-1 font-bold text-slate-900">{order.customer}</h2>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
                  order.status === 'Delivered'
                    ? 'bg-[#1E8E3E]/10 text-[#1E8E3E]'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {order.status === 'Delivered'
                  ? <CheckCircle2 aria-hidden="true" size={14} />
                  : <XCircle aria-hidden="true" size={14} />}
                {t(order.status)}
              </span>
            </div>
            <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
              <MapPin aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-[#0B4B8C]" />
              {order.neighborhood} • {order.address}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <div>
                <p className="text-xs text-slate-500">
                  {order.status === 'Delivered'
                    ? new Date(order.timestamp).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'Canceled delivery'}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{order.payment}</p>
              </div>
              {order.status === 'Delivered' && (
                <div className="text-right">
                  <p className="text-sm font-extrabold text-[#0E532B]">+{order.earnings.toFixed(2)} ETB</p>
                  <p className="mt-1 text-xs font-bold text-[#F04E00]">Tip +{order.tip.toFixed(2)} ETB</p>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default History
