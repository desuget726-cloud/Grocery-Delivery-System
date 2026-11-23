import { ArrowRight, ShoppingBasket } from 'lucide-react'
import { Link } from 'react-router-dom'
import CartItem from '../../components/CartItem.jsx'
import { useCart } from '../../context/CartContext.jsx'
import formatCurrency from '../../utils/formatCurrency.js'

const FREE_DELIVERY_THRESHOLD = 50
const DELIVERY_FEE = 5.99

function Cart() {
  const { cart, totalPrice } = useCart()
  const deliveryFee =
    totalPrice === 0 || totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE
  const total = totalPrice + deliveryFee

  if (cart.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <ShoppingBasket aria-hidden="true" size={42} className="mx-auto text-emerald-600" />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Your basket is empty</h1>
        <p className="mt-2 text-slate-600">Find something fresh for your table.</p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Start shopping <ArrowRight aria-hidden="true" size={18} />
        </Link>
      </section>
    )
  }

  return (
    <div>
      <header className="mb-6">
        <p className="text-sm font-semibold text-emerald-700">Almost yours</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Your cart</h1>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-2xl border border-slate-200 bg-white px-4 sm:px-6">
          <h2 className="sr-only">Cart items</h2>
          {cart.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">Order summary</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <dt>Subtotal</dt>
              <dd className="font-medium text-slate-900">{formatCurrency(totalPrice)}</dd>
            </div>
            <div className="flex justify-between text-slate-600">
              <dt>Delivery</dt>
              <dd className="font-medium text-slate-900">
                {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee)}
              </dd>
            </div>
            {deliveryFee > 0 && (
              <p className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
                Add {formatCurrency(FREE_DELIVERY_THRESHOLD - totalPrice)} more for free delivery.
              </p>
            )}
            <div className="flex justify-between border-t border-slate-100 pt-4 text-base font-bold text-slate-900">
              <dt>Total</dt>
              <dd>{formatCurrency(total)}</dd>
            </div>
          </dl>
          <Link
            to="/checkout"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700"
          >
            Proceed to Checkout <ArrowRight aria-hidden="true" size={18} />
          </Link>
          <Link
            to="/shop"
            className="mt-4 block text-center text-sm font-semibold text-emerald-700 hover:underline"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  )
}

export default Cart
