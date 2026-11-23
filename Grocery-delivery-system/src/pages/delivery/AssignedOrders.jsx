import { ArrowRight, Navigation, Phone } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext.jsx'

const deliveries = [
  {
    id: 'GDS-2538',
    status: 'Out for Delivery',
    customer: 'Abebe Kebede',
    phone: '+251911234567',
    dropoff: 'Bole Medhanialem, Near Edna Mall',
    distance: '2.4 km',
    eta: '10 mins',
    payment: 'COD',
    paymentLabel: 'COD: 680.00 ETB',
    payout: '+75.00 ETB',
  },
  {
    id: 'GDS-2539',
    status: 'Ready for Pickup',
    customer: 'Selam Tesfaye',
    phone: '+251911345678',
    dropoff: 'Guinea Conakry Street, Kazanchis',
    distance: '3.1 km',
    eta: '15 mins',
    payment: 'Paid',
    paymentLabel: 'Paid: Telebirr',
    payout: '+80.00 ETB',
  },
  {
    id: 'GDS-2540',
    status: 'Out for Delivery',
    customer: 'Yared Lemma',
    phone: '+251922456789',
    dropoff: 'Sunshine Real Estate, Sarbet',
    distance: '4.8 km',
    eta: '22 mins',
    payment: 'COD',
    paymentLabel: 'COD: 920.00 ETB',
    payout: '+65.00 ETB',
  },
  {
    id: 'GDS-2541',
    status: 'Ready for Pickup',
    customer: 'Meron Assefa',
    phone: '+251933567890',
    dropoff: 'Around Megenagna Square',
    distance: '5.3 km',
    eta: '25 mins',
    payment: 'Paid',
    paymentLabel: 'Paid: Telebirr',
    payout: '+70.00 ETB',
  },
]

const filters = ['All Active', 'Ready for Pickup', 'Out for Delivery']

function AssignedOrders() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState('All Active')
  const visibleDeliveries =
    filter === 'All Active'
      ? deliveries
      : deliveries.filter((delivery) => delivery.status === filter)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8">
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
                  {delivery.distance} • {delivery.eta}
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
                  <p className="mt-1 font-bold text-slate-900">{delivery.customer}</p>
                  <p className="mt-1 text-sm text-slate-600">{delivery.dropoff}, Addis Ababa</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{delivery.phone}</p>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4 rounded-xl bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`rounded-lg px-3 py-2 text-sm font-extrabold ${
                      delivery.payment === 'COD'
                        ? 'bg-[#F04E00]/10 text-[#F04E00]'
                        : 'bg-[#1E8E3E]/10 text-[#1E8E3E]'
                    }`}
                  >
                    {delivery.paymentLabel}
                  </span>
                  <span className="text-sm font-extrabold text-[#0E532B]">{delivery.payout}</span>
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  {t('riderTripPayout')}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <a
                href={`tel:${delivery.phone}`}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <Phone aria-hidden="true" size={17} /> {t('call')}
              </a>
              <Link
                to={`/delivery/details/${delivery.id}`}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-3 text-sm font-bold text-white hover:bg-[#0E532B]"
              >
                {delivery.status === 'Ready for Pickup'
                  ? t('startDelivery')
                  : t('continue')}
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default AssignedOrders
