import { ArrowLeft, Image, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../../context/CartContext.jsx'
import { products } from '../../data/mockData.js'
import formatCurrency from '../../utils/formatCurrency.js'

function ProductDetails() {
  const { productId } = useParams()
  const product = products.find((item) => item.id === productId)
  const { cart, addToCart, updateQuantity } = useCart()
  const [quantity, setQuantity] = useState(1)

  if (!product) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Product not found</h1>
        <Link to="/shop" className="mt-4 inline-block font-semibold text-emerald-700">
          Return to shop
        </Link>
      </section>
    )
  }

  const cartItem = cart.find((item) => item.id === product.id)
  const inStock = product.stock > 0
  const image = product.image || product.imageUrl

  const handleAddToCart = () => {
    if (cartItem) {
      updateQuantity(product.id, cartItem.quantity + quantity)
    } else {
      addToCart(product)
      for (let count = 1; count < quantity; count += 1) {
        addToCart(product)
      }
    }
  }

  return (
    <div className="space-y-6">
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
      >
        <ArrowLeft aria-hidden="true" size={17} /> Back to shop
      </Link>

      <section className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-2">
        <div className="flex min-h-72 items-center justify-center overflow-hidden rounded-2xl bg-emerald-50 sm:min-h-96">
          {image ? (
            <img src={image} alt={product.name} className="h-full max-h-[480px] w-full object-cover" />
          ) : (
            <Image aria-hidden="true" size={72} strokeWidth={1.2} className="text-emerald-300" />
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-sm font-semibold text-emerald-700">{product.category}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {product.name}
          </h1>
          <p className="mt-2 text-slate-500">{product.unit}</p>
          <p className="mt-5 text-2xl font-bold text-slate-900">
            {formatCurrency(product.price)}
          </p>
          <p className={`mt-3 text-sm font-semibold ${inStock ? 'text-emerald-700' : 'text-rose-600'}`}>
            {inStock ? `${product.stock} in stock` : 'Currently out of stock'}
          </p>
          <p className="mt-5 leading-7 text-slate-600">{product.description}</p>

          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <h2 className="font-semibold text-slate-900">Nutrition information</h2>
            <dl className="mt-3 grid grid-cols-3 gap-3">
              {Object.entries(product.nutrition || {}).map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
              <div>
                <dt className="text-xs text-slate-500">Package size</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-800">{product.unit}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-3 pt-7">
            <div className="flex items-center rounded-xl border border-slate-200 p-1">
              <button
                type="button"
                aria-label="Decrease quantity"
                disabled={quantity <= 1}
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                <Minus aria-hidden="true" size={17} />
              </button>
              <span className="min-w-9 text-center font-semibold">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={!inStock || quantity >= product.stock}
                onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                <Plus aria-hidden="true" size={17} />
              </button>
            </div>
            <button
              type="button"
              disabled={!inStock}
              onClick={handleAddToCart}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <ShoppingCart aria-hidden="true" size={18} />
              {inStock ? 'Add to Cart' : 'Out of stock'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProductDetails
