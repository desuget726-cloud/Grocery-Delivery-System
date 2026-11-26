import {
  CheckCircle2,
  Clock3,
  MapPin,
  ShoppingBasket,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { getApiErrorMessage, orders as ordersApi, payments as paymentsApi } from '../../services/api.js'
import { getDeliveryFee } from '../../utils/cartPricing.js'
import formatCurrency from '../../utils/formatCurrency.js'

const deliveryZones = ['Bole', 'Kazanchis', 'CMC / Ayat', 'Sarbet', 'Piassa']
const deliverySlots = [
  'Express (30–45 mins)',
  'Morning (8AM–11AM)',
  'Afternoon (12PM–4PM)',
  'Evening (5PM–9PM)',
]
const paymentMethods = ['Chapa Card', 'Cash on Delivery']

function Checkout() {
  const toast = useToast()
  const { cart, totalPrice, clearCart, promoCode, coupon } = useCart()
  const { user } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery')
  const [deliverySlot, setDeliverySlot] = useState(deliverySlots[0])
  const [errorMessage, setErrorMessage] = useState('')
  const [placedOrder, setPlacedOrder] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const discount = coupon?.discountType === 'PERCENTAGE'
    ? Math.min(totalPrice, totalPrice * Number(coupon.value) / 100)
    : coupon?.discountType === 'FIXED'
      ? Math.min(totalPrice, Number(coupon.value))
      : 0
  const deliveryFee = getDeliveryFee(
    coupon?.discountType === 'FREE_DELIVERY' ? 'FREEDEL' : '',
    totalPrice,
  )
  const total = Math.max(0, totalPrice - discount) + deliveryFee

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (cart.length === 0) {
      const message = 'Your cart is empty. Add items before placing an order.'
      setErrorMessage(message)
      toast.error(message)
      return
    }

    const formData = new FormData(event.currentTarget)
    const zone = String(formData.get('zone'))
    const name = String(formData.get('name')).trim()
    const phone = String(formData.get('phone')).trim()
    const street = String(formData.get('street')).trim()
    const phoneDigits = phone.replace(/\D/g, '')
    if (name.length < 2) {
      const message = 'Enter your full name to place this order.'
      setErrorMessage(message)
      toast.error(message)
      return
    }
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      const message = 'Enter a valid phone number for delivery updates.'
      setErrorMessage(message)
      toast.error(message)
      return
    }
    if (!deliveryZones.includes(zone) || !street) {
      const message = 'Choose a delivery zone and enter your street or landmark.'
      setErrorMessage(message)
      toast.error(message)
      return
    }
    setIsProcessing(true)
    try {
      const { data } = await ordersApi.create({
        items: cart.map((item) => ({ productId: item.id, qty: item.quantity })),
        deliveryZone: zone,
        deliveryStreet: street,
        customerPhone: phone,
        timeSlot: deliverySlot,
        paymentMethod: paymentMethod === 'Cash on Delivery' ? 'COD' : 'CHAPA',
        couponCode: promoCode || undefined,
      })
      const order = data.order
      clearCart()
      if (paymentMethod === 'Cash on Delivery') {
        setPlacedOrder(order)
        toast.success(`Order ${order.code || order.id} placed successfully.`)
        return
      }

      setPlacedOrder(order)
      setPaymentError('')
      setErrorMessage('')
      toast.success(`Order ${order.code || order.id} created. Continue to Chapa to pay.`)
    } catch (error) {
      const message = getApiErrorMessage(error, 'We could not place your order. Please try again.')
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayment = async () => {
    setPaymentError('')
    if (!placedOrder) {
      const message = 'Your order could not be found. Please place it again.'
      setPaymentError(message)
      toast.error(message)
      return
    }

    setIsProcessing(true)
    try {
      const { data } = await paymentsApi.initializeChapa(placedOrder.id)
      if (!data.checkoutUrl) throw new Error('Chapa did not provide a checkout URL.')
      window.location.assign(data.checkoutUrl)
    } catch (error) {
      const message = getApiErrorMessage(error, 'Could not initialize Chapa payment.')
      setPaymentError(message)
      toast.error(message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (placedOrder) {
    const isCashOnDelivery = placedOrder.paymentMethod === 'Cash on Delivery'
    const orderCode = placedOrder.code || placedOrder.id
    return (
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-emerald-100 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
        <CheckCircle2 aria-hidden="true" size={54} className="mx-auto text-[#1E8E3E]" />
        <p className="mt-5 text-sm font-bold uppercase tracking-wide text-[#1E8E3E]">
          {isCashOnDelivery ? 'Order confirmed' : 'Order reserved'}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-[#0E532B]">
          {isCashOnDelivery ? 'Thank you for your order!' : 'Complete your payment to confirm.'}
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
          {isCashOnDelivery ? 'Cash on Delivery' : `Payment ${String(placedOrder.paymentStatus || 'PENDING').toLowerCase()}`}
        </p>
        <div className="mt-7 grid gap-4 rounded-2xl bg-[#F0F7F1] p-5 text-left sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment Status</p>
            <p className="mt-1 font-bold text-[#0E532B]">{placedOrder.paymentStatus || 'PENDING_COD'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Payment reference</p>
            <p className="mt-1 font-bold text-[#0E532B]">{orderCode}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Order ID</p>
            <p className="mt-1 font-bold text-[#0E532B]">{orderCode}</p>
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
          {!isCashOnDelivery && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePayment}
              className="inline-flex items-center rounded-xl bg-[#1E8E3E] px-6 py-3 font-bold text-white transition hover:bg-[#0E532B]"
            >
              {isProcessing ? 'Connecting to Chapa…' : 'Continue to payment'}
            </button>
          )}
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
        {paymentError && (
          <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            {paymentError}
          </p>
        )}
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
        noValidate
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
            disabled={isProcessing}
            className="mt-6 w-full rounded-xl bg-[#1E8E3E] px-4 py-3 font-bold text-white transition hover:bg-[#0E532B]"
          >
            {isProcessing ? 'Placing order…' : paymentMethod === 'Cash on Delivery'
              ? 'Place Order (Cash on Delivery)'
              : `Pay ${formatCurrency(total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-slate-500">
            Order inventory and payment are processed securely by the backend.
          </p>
        </aside>
      </form>

    </div>
  )
}

export default Checkout
