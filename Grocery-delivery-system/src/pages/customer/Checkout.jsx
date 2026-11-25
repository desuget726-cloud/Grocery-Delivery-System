import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  ShoppingBasket,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { loadOrders, saveOrder } from '../../data/mockData.js'
import {
  getDeliveryFee,
  getDiscountAmount,
} from '../../utils/cartPricing.js'
import formatCurrency from '../../utils/formatCurrency.js'

const deliveryZones = ['Bole', 'Kazanchis', 'CMC / Ayat', 'Sarbet', 'Piassa']
const deliverySlots = [
  'Express (30–45 mins)',
  'Morning (8AM–11AM)',
  'Afternoon (12PM–4PM)',
  'Evening (5PM–9PM)',
]
const paymentMethods = ['Telebirr', 'CBE Birr', 'Chapa Card', 'Cash on Delivery']
const PAYMENT_TRANSACTIONS_STORAGE_KEY = 'grocery_admin_transactions'

function createTransactionId() {
  return `TXN-${Math.floor(9000 + Math.random() * 999)}`
}

function savePaymentTransaction(transaction) {
  const savedTransactions = JSON.parse(
    window.localStorage.getItem(PAYMENT_TRANSACTIONS_STORAGE_KEY) || '[]',
  )
  if (!Array.isArray(savedTransactions)) {
    throw new TypeError('Saved payment transactions must be an array')
  }
  window.localStorage.setItem(
    PAYMENT_TRANSACTIONS_STORAGE_KEY,
    JSON.stringify([
      transaction,
      ...savedTransactions.filter((savedTransaction) => savedTransaction.id !== transaction.id),
    ]),
  )
}

function createOrderId() {
  const existingIds = new Set(loadOrders().map((order) => order.id))

  for (let attempt = 0; attempt < 900; attempt += 1) {
    const candidate = `GDS-${Math.floor(2540 + Math.random() * 900)}`
    if (!existingIds.has(candidate)) {
      return candidate
    }
  }

  let candidate = `GDS-${Date.now()}`
  while (existingIds.has(candidate)) {
    candidate = `GDS-${Date.now()}-${Math.floor(Math.random() * 10000)}`
  }
  return candidate
}

function generateDeliveryOtp() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function Checkout() {
  const { cart, totalPrice, clearCart, promoCode } = useCart()
  const { user } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery')
  const [deliverySlot, setDeliverySlot] = useState(deliverySlots[0])
  const [errorMessage, setErrorMessage] = useState('')
  const [placedOrder, setPlacedOrder] = useState(null)
  const [pendingOrder, setPendingOrder] = useState(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [paymentPhone, setPaymentPhone] = useState('')
  const [chapaMethod, setChapaMethod] = useState('Card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const discount = getDiscountAmount(promoCode, totalPrice)
  const deliveryFee = getDeliveryFee(promoCode, totalPrice)
  const total = Math.max(0, totalPrice - discount) + deliveryFee

  const finishOrder = (order, paymentStatus) => {
    const transactionId = createTransactionId()
    const completedOrder = {
      ...order,
      paymentStatus,
      transactionId,
    }
    const transaction = {
      id: transactionId,
      orderId: completedOrder.id,
      customer: completedOrder.address.name,
      email: user?.email || '',
      method: completedOrder.paymentMethod,
      date: completedOrder.date,
      amount: completedOrder.total,
      subtotal: completedOrder.subtotal,
      deliveryFee: completedOrder.deliveryFee,
      discount: completedOrder.discount,
      status: paymentStatus === 'Paid' ? 'Completed' : 'Pending',
    }

    try {
      saveOrder(completedOrder)
      savePaymentTransaction(transaction)
      clearCart()
      setPlacedOrder(completedOrder)
      setIsPaymentModalOpen(false)
      setPendingOrder(null)
      setPaymentError('')
    } catch (error) {
      console.error('Unable to save the order and payment:', error)
      const message = 'We could not save your order. Please try again.'
      if (paymentStatus === 'Paid') {
        setPaymentError(message)
      } else {
        setErrorMessage(message)
      }
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty. Add items before placing an order.')
      return
    }

    const formData = new FormData(event.currentTarget)
    const zone = String(formData.get('zone'))
    const street = String(formData.get('street')).trim()
    const order = {
      id: createOrderId(),
      date: new Date().toISOString(),
      status: 'Placed',
      subtotal: totalPrice,
      discount,
      deliveryFee,
      total,
      promoCode: promoCode || undefined,
      deliverySlot,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending COD' : 'Pending',
      customerId: user?.id,
      deliveryOtp: generateDeliveryOtp(),
      address: {
        name: String(formData.get('name')).trim(),
        phone: String(formData.get('phone')).trim(),
        street: `${zone} — ${street}`,
        city: 'Addis Ababa',
        zone,
      },
      items: cart.map((item) => ({ ...item })),
    }

    if (paymentMethod === 'Cash on Delivery') {
      finishOrder(order, 'Pending COD')
    } else {
      setPendingOrder(order)
      setPaymentPhone(order.address.phone)
      setPaymentError('')
      setIsPaymentModalOpen(true)
    }
  }

  const handlePayment = async (event) => {
    event.preventDefault()
    setPaymentError('')
    if (!pendingOrder) {
      setPaymentError('Your payment session has expired. Please try again.')
      return
    }

    if (paymentMethod !== 'Chapa Card') {
      const normalizedPhone = paymentPhone.replace(/[\s()-]/g, '')
      if (!/^(?:\+251|0)9\d{8}$/.test(normalizedPhone)) {
        setPaymentError('Enter a valid Ethiopian mobile number, such as +251 9XXXXXXXX.')
        return
      }
    }

    setIsProcessing(true)
    await new Promise((resolve) => window.setTimeout(resolve, 1500))
    setIsProcessing(false)
    finishOrder(pendingOrder, 'Paid')
  }

  if (placedOrder) {
    const isCashOnDelivery = placedOrder.paymentMethod === 'Cash on Delivery'
    return (
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-emerald-100 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
        <CheckCircle2 aria-hidden="true" size={54} className="mx-auto text-[#1E8E3E]" />
        <p className="mt-5 text-sm font-bold uppercase tracking-wide text-[#1E8E3E]">
          Order confirmed
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#0E532B]">
          Thank you for your order!
        </h1>
        <p className="mt-3 text-slate-600">
          We&apos;re preparing your groceries for delivery in Addis Ababa.
        </p>
        <p
          className={`mx-auto mt-5 inline-flex rounded-full px-4 py-2 text-sm font-bold ${
            isCashOnDelivery
              ? 'bg-orange-50 text-[#F04E00]'
              : 'bg-emerald-50 text-[#1E8E3E]'
          }`}
        >
          {isCashOnDelivery ? 'Cash on Delivery' : `Paid via ${placedOrder.paymentMethod}`}
        </p>
        <div className="mt-7 grid gap-4 rounded-2xl bg-[#F0F7F1] p-5 text-left sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment Status</p>
            <p className="mt-1 font-bold text-[#0E532B]">{placedOrder.paymentStatus}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Transaction ID</p>
            <p className="mt-1 font-bold text-[#0E532B]">{placedOrder.transactionId}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order ID</p>
            <p className="mt-1 font-bold text-[#0E532B]">{placedOrder.id}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Delivery OTP</p>
            <p className="mt-1 text-xl font-extrabold tracking-[0.2em] text-[#0B4B8C]">
              {placedOrder.deliveryOtp}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {isCashOnDelivery
            ? 'Give this OTP to the rider when paying cash.'
            : 'Keep your OTP ready to confirm delivery.'}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            to="/my-orders"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1E8E3E] px-6 py-3 font-bold text-white transition hover:bg-[#0E532B]"
          >
            Track My Order →
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center rounded-xl border border-slate-200 px-6 py-3 font-bold text-slate-700 transition hover:border-[#1E8E3E] hover:text-[#0E532B]"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    )
  }

  if (cart.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <ShoppingBasket aria-hidden="true" size={40} className="mx-auto text-[#1E8E3E]" />
        <h1 className="mt-3 text-2xl font-bold text-[#0E532B]">Nothing to check out</h1>
        <p className="mt-2 text-slate-600">Add a few groceries to your cart first.</p>
        <Link
          to="/shop"
          className="mt-5 inline-block font-semibold text-[#1E8E3E] hover:underline"
        >
          Browse products
        </Link>
      </section>
    )
  }

  return (
    <div className="w-full">
      <header className="mb-6">
        <p className="text-sm font-semibold text-[#1E8E3E]">Almost there</p>
        <h1 className="mt-1 text-3xl font-bold text-[#0E532B]">Checkout</h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid w-full items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
      >
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-[#0E532B]">Customer Contact</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Full Name
                <input
                  required
                  name="name"
                  autoComplete="name"
                  defaultValue={user?.fullName || ''}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Phone (+251)
                <input
                  required
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+251 9..."
                  defaultValue={user?.phone || ''}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <MapPin aria-hidden="true" size={19} className="text-[#F04E00]" />
              <h2 className="text-lg font-bold text-[#0E532B]">Addis Ababa Delivery Zone</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Delivery Zone
                <select
                  required
                  name="zone"
                  defaultValue=""
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15"
                >
                  <option value="" disabled>Select your zone</option>
                  {deliveryZones.map((zone) => (
                    <option key={zone} value={zone}>{zone}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                Street / Landmark
                <input
                  required
                  name="street"
                  autoComplete="street-address"
                  placeholder="Street, building, or nearby landmark"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Clock3 aria-hidden="true" size={19} className="text-[#0B4B8C]" />
              <h2 className="text-lg font-bold text-[#0E532B]">Delivery Time Slot</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {deliverySlots.map((slot) => (
                <label
                  key={slot}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${
                    deliverySlot === slot
                      ? 'border-[#1E8E3E] bg-[#1E8E3E]/5 text-[#0E532B]'
                      : 'border-slate-200 text-slate-700 hover:border-[#1E8E3E]/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliverySlot"
                    value={slot}
                    checked={deliverySlot === slot}
                    onChange={() => setDeliverySlot(slot)}
                    className="h-4 w-4 accent-[#1E8E3E]"
                  />
                  <span className="font-medium">{slot}</span>
                </label>
              ))}
            </div>
          </section>

          <fieldset className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <legend className="px-1 text-lg font-bold text-[#0E532B]">Payment Method</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((method) => (
                <label
                  key={method}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                    paymentMethod === method
                      ? 'border-[#1E8E3E] bg-[#1E8E3E]/5'
                      : 'border-slate-200 hover:border-[#1E8E3E]/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="h-4 w-4 accent-[#1E8E3E]"
                  />
                  <span className="font-semibold text-slate-800">{method}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {errorMessage && (
            <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
              {errorMessage}
            </p>
          )}
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-[#0E532B]">Order Summary</h2>
          <ul className="mt-4 max-h-56 space-y-3 overflow-y-auto border-b border-slate-100 pb-4">
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 text-sm">
                <span className="text-slate-600">
                  {item.name} × {item.quantity}
                </span>
                <span className="shrink-0 font-medium text-slate-900">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3 text-slate-600">
              <dt>Subtotal</dt>
              <dd>{formatCurrency(totalPrice)}</dd>
            </div>
            <div className="flex justify-between gap-3 text-slate-600">
              <dt>Discount{promoCode ? ` (${promoCode})` : ''}</dt>
              <dd className="text-[#1E8E3E]">
                {discount > 0 ? `−${formatCurrency(discount)}` : formatCurrency(0)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 text-slate-600">
              <dt>Delivery Fee</dt>
              <dd>{deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}</dd>
            </div>
            <div className="flex justify-between gap-3 border-t border-slate-100 pt-4 text-base font-bold text-[#0E532B]">
              <dt>Total</dt>
              <dd>{formatCurrency(total)}</dd>
            </div>
          </dl>
          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-[#1E8E3E] px-4 py-3 font-bold text-white transition hover:bg-[#0E532B]"
          >
            {paymentMethod === 'Cash on Delivery'
              ? 'Place Order (Cash on Delivery)'
              : `Pay ${formatCurrency(total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-slate-500">
            Your order details will be saved on this device.
          </p>
        </aside>
      </form>

      {isPaymentModalOpen && pendingOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isProcessing) {
              setIsPaymentModalOpen(false)
              setPaymentError('')
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <header className="relative bg-gradient-to-br from-[#0E532B] to-[#1E8E3E] px-6 py-6 text-white">
              <button
                type="button"
                aria-label="Close payment"
                disabled={isProcessing}
                onClick={() => {
                  setIsPaymentModalOpen(false)
                  setPaymentError('')
                }}
                className="absolute right-4 top-4 rounded-full p-2 text-white/80 transition hover:bg-white/15 hover:text-white disabled:opacity-50"
              >
                <X aria-hidden="true" size={18} />
              </button>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
                Secure checkout
              </p>
              <h2 id="payment-modal-title" className="mt-2 text-2xl font-extrabold">
                {paymentMethod === 'Telebirr'
                  ? 'Telebirr Express Pay'
                  : paymentMethod === 'CBE Birr'
                    ? 'CBE Birr'
                    : 'Chapa Checkout'}
              </h2>
              <p className="mt-3 text-3xl font-extrabold">{formatCurrency(total)}</p>
              <p className="mt-1 text-sm text-emerald-100">Order reference: {pendingOrder.id}</p>
            </header>

            <form onSubmit={handlePayment} className="space-y-5 p-6">
              {paymentMethod === 'Chapa Card' ? (
                <label className="block text-sm font-semibold text-slate-700">
                  Payment method
                  <select
                    value={chapaMethod}
                    onChange={(event) => setChapaMethod(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15"
                  >
                    <option>Card</option>
                    <option>Bank transfer</option>
                  </select>
                </label>
              ) : (
                <label className="block text-sm font-semibold text-slate-700">
                  Registered mobile number
                  <input
                    required
                    type="tel"
                    autoComplete="tel"
                    value={paymentPhone}
                    onChange={(event) => setPaymentPhone(event.target.value)}
                    placeholder="+251 9XXXXXXXX"
                    className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15"
                  />
                </label>
              )}
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                {paymentMethod === 'Chapa Card'
                  ? `Continue securely with Chapa ${chapaMethod.toLowerCase()}.`
                  : 'A simulated verification will be sent to your registered mobile number.'}
              </div>
              {paymentError && (
                <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
                  {paymentError}
                </p>
              )}
              <button
                type="submit"
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-4 py-3 font-bold text-white transition hover:bg-[#0E532B] disabled:cursor-wait disabled:opacity-80"
              >
                {isProcessing ? (
                  <>
                    <LoaderCircle aria-hidden="true" size={18} className="animate-spin" />
                    Processing payment...
                  </>
                ) : paymentMethod === 'Chapa Card' ? (
                  'Authorize Payment'
                ) : (
                  'Confirm Payment'
                )}
              </button>
              <p className="text-center text-xs text-slate-400">
                This is a simulated payment. No real funds will be charged.
              </p>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default Checkout
