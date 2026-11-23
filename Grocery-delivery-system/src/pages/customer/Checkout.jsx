import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext.jsx'
import { saveOrder } from '../../data/mockData.js'
import formatCurrency from '../../utils/formatCurrency.js'

const DELIVERY_FEE = 5.99
const FREE_DELIVERY_THRESHOLD = 50
const deliverySlots = [
  'Today, 2:00 PM - 4:00 PM',
  'Today, 4:00 PM - 6:00 PM',
  'Tomorrow, 9:00 AM - 11:00 AM',
  'Tomorrow, 11:00 AM - 1:00 PM',
]

function Checkout() {
  const { cart, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery')
  const [deliverySlot, setDeliverySlot] = useState(deliverySlots[0])
  const [errorMessage, setErrorMessage] = useState('')
  const deliveryFee =
    totalPrice === 0 || totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = totalPrice + deliveryFee

  const handleSubmit = (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (cart.length === 0) {
      setErrorMessage('Your cart is empty. Add items before placing an order.')
      return
    }

    const formData = new FormData(event.currentTarget)
    const order = {
      id: `FB-${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString(),
      status: 'Pending',
      total,
      deliverySlot,
      paymentMethod,
      address: {
        name: formData.get('name'),
        phone: formData.get('phone'),
        street: formData.get('street'),
        city: formData.get('city'),
        postalCode: formData.get('postalCode'),
      },
      items: cart,
    }

    try {
      saveOrder(order)
      clearCart()
      navigate('/my-orders')
    } catch (error) {
      console.error('Unable to place order:', error)
      setErrorMessage('We could not save your order. Please try again.')
    }
  }

  if (cart.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <CheckCircle2 aria-hidden="true" size={40} className="mx-auto text-emerald-600" />
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Nothing to check out</h1>
        <p className="mt-2 text-slate-600">Add a few groceries to your cart first.</p>
        <Link to="/shop" className="mt-5 inline-block font-semibold text-emerald-700">
          Browse products
        </Link>
      </section>
    )
  }

  return (
    <div>
      <header className="mb-6">
        <p className="text-sm font-semibold text-emerald-700">Almost there</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Checkout</h1>
      </header>

      <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Delivery address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Full name
                <input required name="name" autoComplete="name" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Phone number
                <input required name="phone" type="tel" autoComplete="tel" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
              </label>
              <label className="text-sm font-medium text-slate-700 sm:col-span-2">
                Street address
                <input required name="street" autoComplete="street-address" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                City
                <input required name="city" autoComplete="address-level2" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                ZIP / Postal code
                <input required name="postalCode" autoComplete="postal-code" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <label htmlFor="delivery-slot" className="text-lg font-bold text-slate-900">
              Delivery time
            </label>
            <select
              id="delivery-slot"
              value={deliverySlot}
              onChange={(event) => setDeliverySlot(event.target.value)}
              className="mt-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {deliverySlots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </section>

          <fieldset className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <legend className="text-lg font-bold text-slate-900">Payment method</legend>
            <div className="mt-3 space-y-3">
              {['Cash on Delivery', 'Card'].map((method) => (
                <label key={method} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-emerald-300">
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <span className="font-medium text-slate-800">{method}</span>
                </label>
              ))}
            </div>
            {paymentMethod === 'Card' && (
              <p className="mt-3 text-sm text-slate-500">
                Card payment will be available when online payments are connected.
              </p>
            )}
          </fieldset>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">Order summary</h2>
          <ul className="mt-4 max-h-52 space-y-3 overflow-y-auto border-b border-slate-100 pb-4">
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 text-sm">
                <span className="text-slate-600">{item.name} × {item.quantity}</span>
                <span className="shrink-0 font-medium text-slate-900">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <dt>Subtotal</dt><dd>{formatCurrency(totalPrice)}</dd>
            </div>
            <div className="flex justify-between text-slate-600">
              <dt>Delivery</dt><dd>{deliveryFee ? formatCurrency(deliveryFee) : 'Free'}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-4 text-base font-bold text-slate-900">
              <dt>Total</dt><dd>{formatCurrency(total)}</dd>
            </div>
          </dl>
          {errorMessage && (
            <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
              {errorMessage}
            </p>
          )}
          <button
            type="submit"
            className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            Place Order
          </button>
        </aside>
      </form>
    </div>
  )
}

export default Checkout
