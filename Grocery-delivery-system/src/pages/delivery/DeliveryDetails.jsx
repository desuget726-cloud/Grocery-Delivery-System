import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CircleDollarSign,
  MapPin,
  Navigation,
  PackageCheck,
  Phone,
  WalletCards,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDelivery } from '../../context/DeliveryContext.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const progressSteps = ['Accepted', 'Picked Up', 'Out for Delivery', 'Delivered']
const issueReasons = ['Customer not answering', 'Wrong address', 'Item damaged']

function DeliveryDetails() {
  const toast = useToast()
  const { t } = useLanguage()
  const { orderId } = useParams()
  const {
    acceptOrder,
    activeOrders,
    advanceOrderStatus,
    completeDelivery,
    completedHistory,
    reportDeliveryIssue,
    toggleItemChecked,
  } = useDelivery()
  const [otp, setOtp] = useState('')
  const [deliveryNote, setDeliveryNote] = useState('')
  const [cashCollected, setCashCollected] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [issueModalOpen, setIssueModalOpen] = useState(false)

  const order =
    activeOrders.find((item) => item.id === orderId) ||
    completedHistory.find((item) => item.id === orderId)
  const isCompleted = order?.status === 'Delivered'
  const isCod = order?.paymentMethod === 'COD'
  const currentStep = Math.max(progressSteps.indexOf(order?.status), 0)
  const mapsUrl = order
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.address)}`
    : ''

  const reportActionError = (error) => {
    setErrorMessage(error.message)
    if (error.message.includes('Verify every grocery item')) {
      toast.warning(error.message)
    } else if (error.message.includes('OTP')) {
      toast.error('Invalid OTP code. Please verify with customer.')
    } else if (error.message.includes('cash')) {
      toast.error('Confirm that the cash was collected before completing this COD order.')
    } else {
      toast.error(error.message || 'Unable to update this delivery.')
    }
  }

  const runOrderAction = async (action, successMessage) => {
    setErrorMessage('')
    try {
      await action()
      toast.success(successMessage)
    } catch (error) {
      reportActionError(error)
    }
  }

  const handleCompleteDelivery = async () => {
    setErrorMessage('')
    try {
      await completeDelivery(order.id, {
        otp,
        note: deliveryNote,
        cashCollected: isCod ? cashCollected : true,
      })
      setSuccess(true)
      toast.success('Delivery completed successfully.')
    } catch (error) {
      reportActionError(error)
    }
  }

  const handleReportIssue = async (reason) => {
    setErrorMessage('')
    try {
      await reportDeliveryIssue(order.id, reason)
      setIssueModalOpen(false)
      toast.warning(`Delivery issue reported: ${reason}.`)
    } catch (error) {
      reportActionError(error)
    }
  }

  const handleToggleItem = (item) => {
    toggleItemChecked(order.id, item.id)
    toast.info(item.checked ? `${item.name} unchecked.` : `${item.name} checked.`)
  }

  if (!order) {
    return (
      <div className="w-full px-4 py-10 sm:px-6 lg:px-10">
        <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-extrabold text-slate-900">Delivery not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            This order is not in your active deliveries or completed history.
          </p>
          <Link
            to="/delivery/assigned-orders"
            className="mt-5 inline-flex rounded-xl bg-[#1E8E3E] px-4 py-2.5 text-sm font-bold text-white"
          >
            Back to Assigned Orders
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="w-full space-y-5 px-4 py-6 pb-24 sm:px-6 lg:px-10">
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
            {order.status}
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

      {order.exception && (
        <p role="status" className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm font-semibold text-[#F04E00]">
          Issue reported: {order.issueReason}
        </p>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="font-extrabold text-slate-900">{t('customerNavigation')}</h2>
          <div className="mt-4 flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-slate-900">{order.customerName}</p>
              <p className="mt-1 text-sm font-medium text-slate-500">{order.customerPhone}</p>
            </div>
            <a
              href={`tel:${order.customerPhone.replace(/\s/g, '')}`}
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
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="relative flex min-h-44 overflow-hidden rounded-2xl border border-[#0B4B8C]/10 bg-[#0B4B8C]/5 p-5"
        >
          <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(30deg,#0B4B8C_12%,transparent_12.5%,transparent_87%,#0B4B8C_87.5%),linear-gradient(150deg,#0B4B8C_12%,transparent_12.5%,transparent_87%,#0B4B8C_87.5%)] [background-size:48px_84px]" />
          <div className="relative m-auto text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0B4B8C] text-white shadow-lg">
              <Navigation aria-hidden="true" size={22} />
            </span>
            <p className="mt-3 font-extrabold text-[#0B4B8C]">
              {[order.distance, order.eta && `Est. ${order.eta}`].filter(Boolean).join(' • ') || 'Addis Ababa'}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-500">{t('openRouteInMaps')}</p>
          </div>
        </a>
      </section>

      {isCod ? (
        <section className="flex items-center gap-3 rounded-2xl bg-[#F04E00]/10 p-5 text-[#F04E00]">
          <WalletCards aria-hidden="true" size={28} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide">{t('paymentCollection')}</p>
            <p className="mt-1 font-extrabold">
              {t('collectCashFromCustomer')} {Number(order.total).toFixed(2)} ETB
            </p>
          </div>
        </section>
      ) : (
        <section className="flex items-center gap-3 rounded-2xl bg-[#1E8E3E]/10 p-5 text-[#1E8E3E]">
          <CircleDollarSign aria-hidden="true" size={28} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide">{t('paymentComplete')}</p>
            <p className="mt-1 font-extrabold">{t('alreadyPaidViaTelebirr')}</p>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-extrabold text-slate-900">{t('groceryItemsVerification')}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {order.items.filter((item) => item.checked).length} of {order.items.length} items verified
            </p>
          </div>
          <PackageCheck aria-hidden="true" size={22} className="text-[#1E8E3E]" />
        </div>
        <div className="mt-3 divide-y divide-slate-100">
          {order.items.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={item.checked}
              disabled={isCompleted}
              onClick={() => handleToggleItem(item)}
              className="flex w-full items-center gap-3 py-3 text-left disabled:cursor-default"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                  item.checked
                    ? 'border-[#1E8E3E] bg-[#1E8E3E] text-white'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {item.checked && <Check aria-hidden="true" size={15} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-sm font-bold ${item.checked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                  {item.name} × {item.quantity}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">{item.unit}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      {errorMessage && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {errorMessage}
        </p>
      )}

      {success || isCompleted ? (
        <p
          role="status"
          className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[#1E8E3E]/10 px-4 py-3 text-center font-bold text-[#1E8E3E]"
        >
          <CheckCircle2 aria-hidden="true" size={20} /> 🎉 Delivery completed successfully!
        </p>
      ) : (
        <>
          {order.status === 'Incoming' && (
            <button
              type="button"
              onClick={() => runOrderAction(() => acceptOrder(order.id), 'Order accepted.')}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-4 py-3 font-bold text-white hover:bg-[#0E532B]"
            >
              Accept Order
            </button>
          )}
          {order.status === 'Accepted' && (
            <button
              type="button"
              onClick={() => runOrderAction(() => advanceOrderStatus(order.id, 'Picked Up'), 'Order marked as picked up.')}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-4 py-3 font-bold text-white hover:bg-[#0E532B]"
            >
              <PackageCheck aria-hidden="true" size={19} /> Mark Picked Up
            </button>
          )}
          {order.status === 'Picked Up' && (
            <button
              type="button"
              onClick={() => runOrderAction(() => advanceOrderStatus(order.id, 'Out for Delivery'), 'Delivery started.')}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-4 py-3 font-bold text-white hover:bg-[#0E532B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Navigation aria-hidden="true" size={19} /> Start Delivery
            </button>
          )}
          {order.status === 'Out for Delivery' && (
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="font-extrabold text-slate-900">{t('customerOtpVerification')}</h2>
              <label className="mt-4 block text-sm font-bold text-slate-700">
                Customer OTP
                <input
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  value={otp}
                  onChange={(event) => {
                    setOtp(event.target.value.replace(/\D/g, '').slice(0, 4))
                    setErrorMessage('')
                  }}
                  placeholder="••••"
                  className="mt-2 block h-12 w-full rounded-xl border border-slate-300 px-4 text-center text-lg font-extrabold tracking-[0.5em] outline-none focus:border-[#1E8E3E]"
                />
              </label>

              {isCod && (
                <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-orange-50 p-4 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={cashCollected}
                    onChange={(event) => setCashCollected(event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#F04E00]"
                  />
                  <span>
                    Confirmed: Collected {Number(order.total).toFixed(2)} ETB cash
                  </span>
                </label>
              )}

              <label className="mt-4 block text-sm font-bold text-slate-700">
                Delivery note <span className="font-normal text-slate-400">(optional)</span>
                <textarea
                  value={deliveryNote}
                  onChange={(event) => setDeliveryNote(event.target.value)}
                  rows="3"
                  placeholder="Add a note about this delivery..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#1E8E3E]"
                />
              </label>

              <button
                type="button"
                onClick={handleCompleteDelivery}
                className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-4 py-3 font-bold text-white hover:bg-[#0E532B] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 aria-hidden="true" size={19} /> Verify OTP &amp; Complete Delivery
              </button>
            </section>
          )}

          {!['Incoming', 'Accepted', 'Picked Up', 'Out for Delivery'].includes(order.status) && (
            <p className="rounded-xl bg-slate-100 p-4 text-center text-sm font-semibold text-slate-600">
              This delivery is currently marked “{order.status}”.
            </p>
          )}

          {!isCompleted && (
            <button
              type="button"
              onClick={() => setIssueModalOpen(true)}
              className="flex min-h-11 w-full items-center justify-center rounded-xl border border-rose-200 px-4 font-bold text-rose-700 hover:bg-rose-50"
            >
              Report Issue
            </button>
          )}
        </>
      )}

      {issueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delivery-issue-title"
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id="delivery-issue-title" className="text-lg font-extrabold text-slate-900">
                Report a delivery issue
              </h2>
              <button
                type="button"
                onClick={() => setIssueModalOpen(false)}
                aria-label="Close issue dialog"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Choose a reason. The admin team will be notified.
            </p>
            <div className="mt-4 grid gap-2">
              {issueReasons.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => handleReportIssue(reason)}
                  className="min-h-11 rounded-xl border border-slate-200 px-4 text-left text-sm font-semibold text-slate-700 hover:border-[#F04E00] hover:bg-orange-50"
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIssueModalOpen(false)}
              className="mt-4 w-full rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700"
            >
              Cancel
            </button>
          </section>
        </div>
      )}
    </div>
  )
}

export default DeliveryDetails
