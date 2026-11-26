import { ArrowRight, Navigation, Phone } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDelivery } from '../../context/DeliveryContext.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const filters = ['All Active', 'Incoming', 'Accepted', 'Picked Up', 'Out for Delivery', 'Issue Reported']

function AssignedOrders() {
  const toast = useToast()
  const { t } = useLanguage()
  const { activeOrders, acceptOrder, advanceOrderStatus, declineOrder } = useDelivery()
  const [filter, setFilter] = useState('All Active')
  const [actionError, setActionError] = useState('')
  const visibleDeliveries =
    filter === 'All Active'
      ? activeOrders
      : activeOrders.filter((delivery) =>
          filter === 'Issue Reported'
            ? delivery.exception
            : delivery.status === filter,
        )

  const runOrderAction = async (action, successMessage, successType = 'success') => {
    setActionError('')
    try {
      await action()
      toast[successType](successMessage)
    } catch (error) {
      setActionError(error.message)
      if (error.message.includes('Verify every grocery item')) {
        toast.warning(error.message)
      } else {
        toast.error(error.message || 'Unable to update this delivery.')
      }
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 py-6 pb-24">
      <header>
        <p className="text-sm font-semibold text-[#1E8E3E]">{t('todaysRoute')}</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900">
          {t('assignedDeliveries')}
        </h1>
      </header>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
              filter === item
                ? 'bg-[#0E532B] text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-[#1E8E3E]'
            }`}
          >
            {t(item)}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {visibleDeliveries.map((delivery) => (
          <article key={delivery.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-extrabold text-[#0B4B8C]">{delivery.id}</p>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                  <Navigation aria-hidden="true" size={15} />
                  {[delivery.distance, delivery.eta].filter(Boolean).join(' • ') || 'Addis Ababa'}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  delivery.status === 'Out for Delivery'
                    ? 'bg-[#0B4B8C]/10 text-[#0B4B8C]'
                    : 'bg-[#F04E00]/10 text-[#F04E00]'
                }`}
              >
                {t(delivery.status)}
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr]">
              <div className="relative pl-7">
                <span className="absolute left-1.5 top-2 h-[calc(100%-1.25rem)] w-px bg-slate-200" />
                <div className="relative">
                  <span className="absolute -left-7 top-0.5 h-4 w-4 rounded-full border-4 border-[#1E8E3E] bg-white" />
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    {t('pickup')}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-800">Grocery Delivery Hub, Bole</p>
                </div>
                <div className="relative mt-5">
                  <span className="absolute -left-7 top-0.5 h-4 w-4 rounded-full border-4 border-[#F04E00] bg-white" />
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    {t('dropoff')}
                  </p>
                  <p className="mt-1 font-bold text-slate-900">{delivery.customerName}</p>
                  <p className="mt-1 text-sm text-slate-600">{delivery.address}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{delivery.customerPhone}</p>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4 rounded-xl bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`rounded-lg px-3 py-2 text-sm font-extrabold ${
                      delivery.paymentMethod === 'COD'
                        ? 'bg-[#F04E00]/10 text-[#F04E00]'
                        : 'bg-[#1E8E3E]/10 text-[#1E8E3E]'
                    }`}
                  >
                    {delivery.paymentMethod === 'COD'
                      ? `COD: ${Number(delivery.total).toFixed(2)} ETB`
                      : 'Paid: Telebirr'}
                  </span>
                  <span className="text-sm font-extrabold text-[#0E532B]">
                    +{Number(delivery.deliveryFee).toFixed(2)} ETB
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  {t('riderTripPayout')}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <a
                href={`tel:${delivery.customerPhone.replace(/\s/g, '')}`}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <Phone aria-hidden="true" size={17} /> Call
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.address)}`}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <Navigation aria-hidden="true" size={17} /> Directions
              </a>
              {delivery.status === 'Incoming' ? (
                <>
                  <button
                    type="button"
                    onClick={() => runOrderAction(() => acceptOrder(delivery.id), 'Order accepted.')}
                    className="flex min-h-12 items-center justify-center rounded-xl bg-[#1E8E3E] px-3 text-sm font-bold text-white hover:bg-[#0E532B]"
                  >
                    Accept Order
                  </button>
                  <button
                    type="button"
                    onClick={() => runOrderAction(() => declineOrder(delivery.id), 'Order declined.', 'info')}
                    className="flex min-h-12 items-center justify-center rounded-xl border border-rose-200 px-3 text-sm font-bold text-rose-700 hover:bg-rose-50"
                  >
                    Decline
                  </button>
                </>
              ) : delivery.status === 'Accepted' ? (
                <button
                  type="button"
                  onClick={() => runOrderAction(() => advanceOrderStatus(delivery.id, 'Picked Up'), 'Order marked as picked up.')}
                  className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-3 text-sm font-bold text-white hover:bg-[#0E532B]"
                >
                  Mark Picked Up <ArrowRight aria-hidden="true" size={17} />
                </button>
              ) : delivery.status === 'Picked Up' ? (
                <>
                  <button
                    type="button"
                    onClick={() => runOrderAction(() => advanceOrderStatus(delivery.id, 'Out for Delivery'), 'Delivery started.')}
                    className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-3 text-sm font-bold text-white hover:bg-[#0E532B] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Start Delivery <ArrowRight aria-hidden="true" size={17} />
                  </button>
                  {!delivery.items.every((item) => item.checked) && (
                    <Link
                      to={`/delivery/details/${delivery.id}`}
                      className="col-span-2 text-center text-xs font-semibold text-[#0B4B8C] hover:underline"
                    >
                      Verify items before starting
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  to={`/delivery/details/${delivery.id}`}
                  className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-3 text-sm font-bold text-white hover:bg-[#0E532B]"
                >
                  View &amp; Complete <ArrowRight aria-hidden="true" size={17} />
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
      {actionError && (
        <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {actionError}
        </p>
      )}
      {visibleDeliveries.length === 0 && (
        <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No orders match this filter.
        </p>
      )}
    </div>
  )
}

export default AssignedOrders
