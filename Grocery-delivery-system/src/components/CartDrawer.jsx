import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import formatCurrency from '../utils/formatCurrency.js'

const FREE_DELIVERY_THRESHOLD = 500
function CartDrawer() {
  const {
    cart,
    closeCart,
    isCartOpen,
    removeFromCart,
    totalItems,
    totalPrice,
    updateQuantity,
  } = useCart()
  const remainingForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - totalPrice)
  const deliveryProgress = Math.min(
    100,
    (totalPrice / FREE_DELIVERY_THRESHOLD) * 100,
  )

  useEffect(() => {
    if (!isCartOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeCart()
      }
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeCart, isCartOpen])

  return (
    <>
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close cart drawer"
            onClick={closeCart}
            className="absolute inset-0 cursor-default bg-slate-950/45"
          />
          <aside
            id="mini-cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mini-cart-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 id="mini-cart-title" className="text-xl font-bold text-slate-900">
                  Your cart
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close cart drawer"
                onClick={closeCart}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X aria-hidden="true" size={21} />
              </button>
            </header>

            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <p className="font-semibold text-slate-800">
                  {remainingForFreeDelivery > 0
                    ? `Add ${formatCurrency(remainingForFreeDelivery)} more for FREE delivery!`
                    : '🎉 You unlocked FREE delivery!'}
                </p>
                <span className="shrink-0 text-xs text-slate-500">500 ETB</span>
              </div>
              <div
                role="progressbar"
                aria-label="Free delivery progress"
                aria-valuemin={0}
                aria-valuemax={FREE_DELIVERY_THRESHOLD}
                aria-valuenow={Math.min(totalPrice, FREE_DELIVERY_THRESHOLD)}
                className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
              >
                <div
                  className="h-full rounded-full bg-[#1E8E3E] transition-[width] duration-300"
                  style={{ width: `${deliveryProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Free delivery on orders over 500 ETB
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-5">
              {cart.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {cart.map((item) => {
                    const image = item.image || item.imageUrl
                    return (
                      <li key={item.id} className="flex gap-3 py-4">
                        {image ? (
                          <img
                            src={image}
                            alt=""
                            className="h-16 w-16 shrink-0 rounded-xl bg-emerald-50 object-cover"
                          />
                        ) : (
                          <div
                            aria-hidden="true"
                            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"
                          >
                            <ShoppingCart aria-hidden="true" size={20} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold text-slate-900">
                            {item.name || item.title || 'Grocery item'}
                          </h3>
                          {item.unit && (
                            <p className="mt-0.5 text-xs text-slate-500">{item.unit}</p>
                          )}
                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                          <div className="mt-2 inline-flex items-center gap-1 rounded-lg border border-slate-200 p-0.5">
                            <button
                              type="button"
                              aria-label={`Decrease ${item.name || 'item'} quantity`}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="rounded-md p-1 text-slate-600 hover:bg-slate-100"
                            >
                              <Minus aria-hidden="true" size={14} />
                            </button>
                            <span aria-live="polite" className="min-w-6 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              aria-label={`Increase ${item.name || 'item'} quantity`}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="rounded-md p-1 text-slate-600 hover:bg-slate-100"
                            >
                              <Plus aria-hidden="true" size={14} />
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${item.name || 'item'} from cart`}
                          onClick={() => removeFromCart(item.id)}
                          className="h-fit rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 aria-hidden="true" size={17} />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="grid h-full content-center justify-items-center text-center">
                  <ShoppingCart aria-hidden="true" size={36} className="text-slate-300" />
                  <p className="mt-3 font-semibold text-slate-800">Your cart is empty</p>
                  <p className="mt-1 text-sm text-slate-500">Add something fresh to get started.</p>
                </div>
              )}
            </div>

            <footer className="border-t border-slate-100 bg-white px-5 py-4">
              <div className="flex items-center justify-between text-base font-bold text-slate-900">
                <span>Subtotal</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <Link
                to="/checkout"
                onClick={closeCart}
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#1E8E3E] px-4 py-3 font-bold text-white transition hover:bg-[#0E532B]"
              >
                Checkout Now →
              </Link>
              <Link
                to="/cart"
                onClick={closeCart}
                className="mt-3 block text-center text-sm font-semibold text-[#0E532B] hover:underline"
              >
                View Full Cart
              </Link>
            </footer>
          </aside>
        </div>
      )}
    </>
  )
}

export default CartDrawer
