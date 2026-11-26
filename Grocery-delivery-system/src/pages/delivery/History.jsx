import { CheckCircle2, CircleDollarSign, MapPin, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDelivery } from '../../context/DeliveryContext.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'

const filters = ['All', 'Delivered']

function History() {
  const { t } = useLanguage()
  const { completedHistory } = useDelivery()
  const [filter, setFilter] = useState('All')
  const visible = useMemo(
    () => completedHistory.filter((order) => filter === 'All' || order.status === filter),
    [completedHistory, filter],
  )
  const earned = completedHistory.reduce(
    (sum, order) => sum + (Number(order.earnings) || Number(order.deliveryFee) || 0),
    0,
  )
  const codCollected = completedHistory
    .filter((order) => order.paymentMethod === 'COD')
    .reduce(
      (sum, order) => sum + (Number(order.cashCollected) || Number(order.total) || 0),
      0,
    )

  return (
    <div className="w-full px-4 py-6 pb-24 sm:px-6 lg:px-10">
      <header>
        <p className="text-sm font-semibold text-[#1E8E3E]">{t('yourCompletedWork')}</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900">{t('deliveryHistory')}</h1>
      </header>

      <section className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            labelKey: 'totalCompletedTrips',
            value: String(completedHistory.length),
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
            value: `${codCollected.toFixed(2)} ETB`,
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
            aria-pressed={filter === item}
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

      {visible.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          Completed deliveries will appear here.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {visible.map((order) => {
            const neighborhood = order.address.split(',')[0]
            const timestamp = order.completedAt || order.date
            return (
              <Link
                key={order.id}
                to={`/delivery/details/${order.id}`}
                className="block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-[#1E8E3E]/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-[#0B4B8C]">{order.id}</p>
                    <h2 className="mt-1 font-bold text-slate-900">{order.customerName}</h2>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#1E8E3E]/10 px-3 py-1.5 text-xs font-bold text-[#1E8E3E]">
                    <CheckCircle2 aria-hidden="true" size={14} />
                    {t('Delivered')}
                  </span>
                </div>
                <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                  <MapPin aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-[#0B4B8C]" />
                  {neighborhood} • {order.address}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <div>
                    <p className="text-xs text-slate-500">
                      {timestamp
                        ? new Date(timestamp).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : 'Completed'}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Telebirr'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-[#0E532B]">
                      +{(Number(order.earnings) || Number(order.deliveryFee) || 0).toFixed(2)} ETB
                    </p>
                    {order.paymentMethod === 'COD' && (
                      <p className="mt-1 text-xs font-bold text-[#F04E00]">
                        Cash +{(Number(order.cashCollected) || Number(order.total) || 0).toFixed(2)} ETB
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default History
