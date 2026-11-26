import { ArrowRight, ShoppingBasket, Tag } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import CartItem from '../../components/CartItem.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { coupons as couponsApi, getApiErrorMessage } from '../../services/api.js'
import {
  FREE_DELIVERY_THRESHOLD,
  getDeliveryFee,
} from '../../utils/cartPricing.js'
import formatCurrency from '../../utils/formatCurrency.js'

function Cart() {
  const toast = useToast()
  const { cart, promoCode, setPromoCode, coupon, setCoupon, totalPrice } = useCart()
  const [promoInput, setPromoInput] = useState(promoCode)
  const [promoError, setPromoError] = useState('')
  const [promoMessage, setPromoMessage] = useState('')
  const [isValidatingPromo, setIsValidatingPromo] = useState(false)
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

  const applyPromoCode = async (event) => {
    event.preventDefault()
    const normalizedCode = promoInput.trim().toUpperCase()

    if (!normalizedCode) {
      const message = 'Enter a promo code first.'
      setPromoError(message)
      setPromoMessage('')
      toast.error(message)
      return
    }

    setIsValidatingPromo(true)
    try {
      const { data } = await couponsApi.validate({ code: normalizedCode, subtotal: totalPrice })
      setCoupon(data.coupon)
      setPromoCode(normalizedCode)
      setPromoInput(normalizedCode)
      setPromoError('')
      setPromoMessage(`${normalizedCode} applied successfully.`)
      toast.success(`${normalizedCode} applied successfully.`)
    } catch (error) {
      const message = getApiErrorMessage(error, 'That promo code is not valid.')
      setPromoError(message)
      setPromoMessage('')
      toast.error(message)
    } finally {
      setIsValidatingPromo(false)
    }
  }

  const removePromoCode = () => {
    setPromoCode('')
    setCoupon(null)
    setPromoInput('')
    setPromoError('')
    setPromoMessage('')
    toast.info('Promo code removed.')
  }

  if (cart.length === 0) {
    return (
      <section className="w-full rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <ShoppingBasket aria-hidden="true" size={42} className="mx-auto text-[#1E8E3E]" />
        <h1 className="mt-4 text-2xl font-bold text-[#0E532B]">Your basket is empty</h1>
        <p className="mt-2 text-slate-600">Find something fresh for your table.</p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1E8E3E] px-5 py-3 font-semibold text-white transition hover:bg-[#0E532B]"
        >
          Continue Shopping <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </section>
    )
  }

  return (
    <div className="w-full">
      <header className="mb-6">
        <p className="text-sm font-semibold text-[#1E8E3E]">Almost yours</p>
        <h1 className="mt-1 text-3xl font-bold text-[#0E532B]">Your Cart</h1>
      </header>

      <div className="grid w-full items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-4">
            <h2 className="font-bold text-slate-900">
              Cart Items <span className="font-medium text-slate-500">({cart.length})</span>
            </h2>
            <Link
              to="/shop"
              className="text-sm font-semibold text-[#0E532B] hover:text-[#1E8E3E] hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
          {cart.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-[#0E532B]">Order Summary</h2>

          <form onSubmit={applyPromoCode} className="mt-5">
            <label htmlFor="promo-code" className="text-sm font-semibold text-slate-700">
              Promo Code
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="promo-code"
                name="promoCode"
                value={promoInput}
                onChange={(event) => setPromoInput(event.target.value)}
                placeholder="Enter code"
                autoComplete="off"
                className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm uppercase outline-none focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15"
              />
              <button
                type="submit"
                disabled={isValidatingPromo}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B4B8C] px-3 py-2.5 text-sm font-bold text-white transition hover:bg-[#083c70]"
              >
                <Tag aria-hidden="true" size={15} />
                {isValidatingPromo ? 'Checking…' : 'Apply'}
              </button>
            </div>
            {promoError && (
              <p role="alert" className="mt-2 text-xs font-medium text-rose-700">
                {promoError}
              </p>
            )}
            {promoMessage && (
              <p role="status" className="mt-2 text-xs font-medium text-[#1E8E3E]">
                {promoMessage}
              </p>
            )}
            {!promoError && promoCode && (
              <button
                type="button"
                onClick={removePromoCode}
                className="mt-2 text-xs font-semibold text-slate-500 underline hover:text-[#F04E00]"
              >
                Remove {promoCode}
              </button>
            )}
            {!promoCode && (
              <p className="mt-2 text-xs text-slate-500">
                Apply a coupon code from our current offers.
              </p>
            )}
          </form>

          <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between gap-3 text-slate-600">
              <dt>Subtotal</dt>
              <dd className="font-medium text-slate-900">{formatCurrency(totalPrice)}</dd>
            </div>
            <div className="flex justify-between gap-3 text-slate-600">
              <dt>
                Discount{promoCode ? ` (${promoCode})` : ''}
              </dt>
              <dd className="font-medium text-[#1E8E3E]">
                {discount > 0 ? `−${formatCurrency(discount)}` : formatCurrency(0)}
              </dd>
            </div>
            <div className="flex justify-between gap-3 text-slate-600">
              <dt>Delivery Fee</dt>
              <dd className="font-medium text-slate-900">
                {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
              </dd>
            </div>
            {deliveryFee > 0 && (
              <p className="rounded-lg bg-emerald-50 p-3 text-xs text-[#0E532B]">
                Add {formatCurrency(FREE_DELIVERY_THRESHOLD - totalPrice)} more for free delivery.
              </p>
            )}
            <div className="flex justify-between gap-3 border-t border-slate-100 pt-4 text-base font-bold text-[#0E532B]">
              <dt>Total</dt>
              <dd>{formatCurrency(total)}</dd>
            </div>
          </dl>

          <Link
            to="/checkout"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-4 py-3 font-bold text-white transition hover:bg-[#0E532B]"
          >
            Proceed to Checkout <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </aside>
      </div>
    </div>
  )
}

export default Cart
