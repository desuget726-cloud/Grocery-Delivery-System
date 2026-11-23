import { Image, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)

function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity } = useCart()
  const cartItem = cart.find((item) => item.id === product.id)
  const price = Number(product.price) || 0
  const originalPrice = Number(product.originalPrice)
  const discount =
    Number(product.discount ?? product.discountPercent) ||
    (originalPrice > price && originalPrice > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0)
  const image = product.image || product.imageUrl
  const category =
    typeof product.category === 'string'
      ? product.category
      : product.category?.name
  const unit = product.unit || product.weight

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-emerald-50">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-emerald-300">
            <Image aria-hidden="true" size={40} strokeWidth={1.5} />
          </div>
        )}
        {category && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
            {category}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-rose-600 px-2.5 py-1 text-xs font-bold text-white">
            {Math.round(discount)}% OFF
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-slate-900">{product.name}</h3>
        {unit && <p className="mt-1 text-sm text-slate-500">{unit}</p>}

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="font-bold text-slate-900">{formatCurrency(price)}</p>
            {originalPrice > price && (
              <p className="text-xs text-slate-400 line-through">
                {formatCurrency(originalPrice)}
              </p>
            )}
          </div>

          {cartItem ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-1">
              <button
                type="button"
                aria-label={`Decrease ${product.name} quantity`}
                className="rounded-lg p-1.5 text-emerald-800 hover:bg-white"
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
              >
                <Minus aria-hidden="true" size={16} />
              </button>
              <span aria-live="polite" className="min-w-5 text-center text-sm font-semibold">
                {cartItem.quantity}
              </span>
              <button
                type="button"
                aria-label={`Increase ${product.name} quantity`}
                className="rounded-lg p-1.5 text-emerald-800 hover:bg-white"
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
              >
                <Plus aria-hidden="true" size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => addToCart(product)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <ShoppingCart aria-hidden="true" size={16} />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default ProductCard
