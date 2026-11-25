import {
  ArrowLeft,
  Check,
  CheckCircle2,
  MapPin,
  Navigation,
  Phone,
  PackageCheck,
  WalletCards,
  CircleDollarSign,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext.jsx'

const mockOrder = {
  id: 'GDS-2538',
  status: 'Out for Delivery',
  customerName: 'Abebe Kebede',
  customerPhone: '+251 911 234 567',
  address: 'Bole Medhanialem, Near Edna Mall, Addis Ababa',
  distance: '2.4 km',
  eta: '10 mins',
  paymentMethod: 'Cash on Delivery',
  amount: '680.00',
  items: [
    { id: 'avocados', name: 'Fresh Hass Avocados', unit: '2 kg' },
    { id: 'milk', name: 'Farm Fresh Milk', unit: '2 L' },
    { id: 'teff', name: 'White Teff Flour', unit: '5 kg' },
  ],
}

const progressSteps = ['Accepted', 'Picked Up', 'Out for Delivery', 'Delivered']

function DeliveryDetails() {
  const { t } = useLanguage()
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [checkedItems, setCheckedItems] = useState([])
  const [otp, setOtp] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')
  const [otpError, setOtpError] = useState('')
  const [success, setSuccess] = useState(false)

  const order =
    orderId === 'GDS-2539'
      ? {
          ...mockOrder,
          id: 'GDS-2539',
          status: 'Ready for Pickup',
          customerName: 'Selam Tesfaye',
          customerPhone: '+251 911 345 678',
          address: 'Guinea Conakry Street, Kazanchis, Addis Ababa',
          distance: '3.1 km',
          eta: '15 mins',
          paymentMethod: 'Telebirr',
          amount: '1240.00',
        }
      : orderId && orderId !== 'GDS-2538'
        ? {
            ...mockOrder,
            id: orderId,
            status: orderId === 'GDS-2540' ? 'Out for Delivery' : 'Ready for Pickup',
            customerName: orderId === 'GDS-2540' ? 'Yared Lemma' : 'Meron Assefa',
            customerPhone:
              orderId === 'GDS-2540' ? '+251 922 456 789' : '+251 933 567 890',
            address:
              orderId === 'GDS-2540'
                ? 'Sunshine Real Estate, Sarbet, Addis Ababa'
                : 'Around Megenagna Square, Addis Ababa',
            distance: orderId === 'GDS-2540' ? '4.8 km' : '5.3 km',
            eta: orderId === 'GDS-2540' ? '22 mins' : '25 mins',
            paymentMethod: orderId === 'GDS-2540' ? 'Cash on Delivery' : 'Telebirr',
            amount: orderId === 'GDS-2540' ? '920.00' : '840.00',
          }
        : mockOrder

  const currentStep =
    order.status === 'Accepted'
      ? 0
      : order.status === 'Ready for Pickup'
        ? 1
        : order.status === 'Out for Delivery'
          ? 2
          : 3

  const verifyAndDeliver = () => {
    if (otp !== '1234') {
      setOtpError('Enter the demo OTP 1234 to verify this delivery.')
      return
    }
    setOtpError('')
    setSuccess(true)
    window.setTimeout(() => navigate('/delivery/history'), 1200)
  }

  return (
    <div className="w-full space-y-5 px-4 sm:px-6 lg:px-10 py-6 pb-24">
      <Link
        to="/delivery/assigned-orders"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#0E532B]"
      >
        <ArrowLeft aria-hidden="true" size={17} /> {t('assignedDeliveries')}
      </Link>

      <header className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              {t('delivery')}
            </p>
            <h1 className="mt-1 text-xl font-extrabold text-[#0B4B8C]">{order.id}</h1>
          </div>
          <span className="rounded-full bg-[#0B4B8C]/10 px-3 py-1.5 text-xs font-bold text-[#0B4B8C]">
            {t(order.status)}
          </span>
        </div>

        <ol className="mt-5 grid grid-cols-4" aria-label="Delivery progress">
          {progressSteps.map((step, index) => (
            <li key={step} className="relative flex flex-col items-center text-center">
              {index < progressSteps.length - 1 && (
                <span
                  className={`absolute left-1/2 top-3 h-0.5 w-full ${
                    index < currentStep ? 'bg-[#1E8E3E]' : 'bg-slate-200'
                  }`}
                />
              )}
              <span
                className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                  index <= currentStep
                    ? 'border-[#1E8E3E] bg-[#1E8E3E] text-white'
                    : 'border-slate-300 bg-white text-slate-300'
                }`}
              >
                {index < currentStep ? <Check aria-hidden="true" size={13} /> : index + 1}
              </span>
              <span
                className={`mt-2 text-[10px] font-bold sm:text-xs ${
                  index <= currentStep ? 'text-[#0E532B]' : 'text-slate-400'
                }`}
              >
                {t(step)}
              </span>
            </li>
          ))}
        </ol>
      </header>

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-slate-900">
            {t('customerNavigation')}
          </h2>
          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-slate-900">{order.customerName}</p>
              <p className="mt-1 text-sm font-medium text-slate-500">{order.customerPhone}</p>
            </div>
            <a
              href={`tel:${order.customerPhone.replaceAll(' ', '')}`}
              aria-label={`Call ${order.customerName}`}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0B4B8C]/10 text-[#0B4B8C]"
            >
              <Phone aria-hidden="true" size={19} />
            </a>
          </div>
          <div className="mt-4 flex items-start gap-2 text-sm text-slate-700">
            <MapPin aria-hidden="true" size={18} className="mt-0.5 shrink-0 text-[#F04E00]" />
            {order.address}
          </div>
        </article>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`}
          target="_blank"
          rel="noreferrer"
          className="relative flex min-h-44 overflow-hidden rounded-2xl border border-[#0B4B8C]/10 bg-[#0B4B8C]/5 p-5"
        >
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(30deg,#0B4B8C_12%,transparent_12.5%,transparent_87%,#0B4B8C_87.5%),linear-gradient(150deg,#0B4B8C_12%,transparent_12.5%,transparent_87%,#0B4B8C_87.5%)] [background-size:48px 84px]" />
          <div className="relative m-auto text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0B4B8C] text-white shadow-lg">
              <Navigation aria-hidden="true" size={22} />
            </span>
            <p className="mt-3 font-extrabold text-[#0B4B8C]">{order.distance} • Est. {order.eta}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">
              {t('openRouteInMaps')}
            </p>
          </div>
        </a>
      </section>

      {order.paymentMethod === 'Cash on Delivery' ? (
        <section className="flex items-center gap-3 rounded-2xl bg-[#F04E00]/10 p-5 text-[#F04E00]">
          <WalletCards aria-hidden="true" size={28} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide">
              {t('paymentCollection')}
            </p>
            <p className="mt-1 font-extrabold">
              {t('collectCashFromCustomer')} {order.amount} ETB
            </p>
          </div>
        </section>
      ) : (
        <section className="flex items-center gap-3 rounded-2xl bg-[#1E8E3E]/10 p-5 text-[#1E8E3E]">
          <CircleDollarSign aria-hidden="true" size={28} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide">
              {t('paymentComplete')}
            </p>
            <p className="mt-1 font-extrabold">{t('alreadyPaidViaTelebirr')}</p>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-extrabold text-slate-900">
              {t('groceryItemsVerification')}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {checkedItems.length} of {order.items.length} items verified
            </p>
          </div>
          <PackageCheck aria-hidden="true" size={22} className="text-[#1E8E3E]" />
        </div>
        <div className="mt-3 divide-y divide-slate-100">
          {order.items.map((item) => {
            const checked = checkedItems.includes(item.id)
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={checked}
                onClick={() =>
                  setCheckedItems((current) =>
                    checked
                      ? current.filter((id) => id !== item.id)
                      : [...current, item.id],
                  )
                }
                className="flex w-full items-center gap-3 py-3 text-left"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                    checked
                      ? 'border-[#1E8E3E] bg-[#1E8E3E] text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {checked && <Check aria-hidden="true" size={15} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-bold ${checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {item.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">{item.unit}</span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {order.status === 'Out for Delivery' && (
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-slate-900">
            {t('customerOtpVerification')}
          </h2>
          <label className="mt-4 block text-sm font-bold text-slate-700">
            {t('deliveryOtp')}
            <input
              inputMode="numeric"
              maxLength={4}
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, '').slice(0, 4))
                setOtpError('')
              }}
              placeholder="••••"
              className="mt-2 block h-12 w-full rounded-xl border border-slate-300 px-4 text-center text-lg font-extrabold tracking-[0.5em] outline-none focus:border-[#1E8E3E]"
            />
            <span className="mt-2 block text-xs font-semibold text-[#0B4B8C]">
              {t('demoOtp')}: 1234
            </span>
          </label>
          {otpError && <p className="mt-2 text-sm font-semibold text-[#F04E00]">{otpError}</p>}

          <label className="mt-4 block text-sm font-bold text-slate-700">
            {t('deliveryNote')}{' '}
            <span className="font-normal text-slate-400">
              ({t('optional')})
            </span>
            <textarea
              value={deliveryNote}
              onChange={(event) => setDeliveryNote(event.target.value)}
              rows="3"
              placeholder="Add a note about this delivery..."
              className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#1E8E3E]"
            />
          </label>

          {success ? (
            <p
              role="status"
              className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1E8E3E]/10 font-bold text-[#1E8E3E]"
            >
              <CheckCircle2 aria-hidden="true" size={19} /> {t('deliveryCompletedSuccessfully')}
            </p>
          ) : (
            <button
              type="button"
              onClick={verifyAndDeliver}
              className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-4 py-3 font-bold text-white hover:bg-[#0E532B]"
            >
              <CheckCircle2 aria-hidden="true" size={19} /> {t('verifyMarkDelivered')}
            </button>
          )}
        </section>
      )}

      {order.status !== 'Out for Delivery' && (
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-4 py-3 font-bold text-white"
        >
          <PackageCheck aria-hidden="true" size={19} /> Continue Pickup Process
        </button>
      )}
    </div>
  )
}

export default DeliveryDetails
