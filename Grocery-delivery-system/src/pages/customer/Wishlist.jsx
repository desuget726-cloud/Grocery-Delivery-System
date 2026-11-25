import { Heart, Image, ShoppingCart, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext.jsx'
import { useWishlist } from '../../context/WishlistContext.jsx'
import formatCurrency from '../../utils/formatCurrency.js'

function Wishlist() {
  const { addToCart } = useCart()
  const {
    wishlistItems,
    wishlistCount,
    removeFromWishlist,
    clearWishlist,
  } = useWishlist()
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const moveToCart = (product) => {
    try {
      addToCart(product)
      removeFromWishlist(product.id)
      setErrorMessage('')
      setStatusMessage(`${product.name} moved to your cart.`)
    } catch (error) {
      console.error(`Unable to move ${product.name} to the cart:`, error)
      setErrorMessage('We could not move this item to your cart. Please try again.')
    }
  }

  const moveAllToCart = () => {
    try {
      wishlistItems.forEach((product) => addToCart(product))
      clearWishlist()
      setErrorMessage('')
      setStatusMessage('All wishlist items moved to your cart.')
    } catch (error) {
      console.error('Unable to move wishlist items to the cart:', error)
      setErrorMessage('We could not move all items to your cart. Please try again.')
    }
  }

  const handleClearWishlist = () => {
    try {
      clearWishlist()
      setErrorMessage('')
      setStatusMessage('Your wishlist has been cleared.')
    } catch (error) {
      console.error('Unable to clear the wishlist:', error)
      setErrorMessage('We could not clear your wishlist. Please try again.')
    }
  }

  const handleRemove = (product) => {
    try {
      removeFromWishlist(product.id)
      setErrorMessage('')
      setStatusMessage(`${product.name} removed from your wishlist.`)
    } catch (error) {
      console.error(`Unable to remove ${product.name} from the wishlist:`, error)
      setErrorMessage('We could not remove this item. Please try again.')
    }
  }

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10">
      <header className="flex flex-col gap-5 border-b border-gray-100 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0E532B]">
              My Wishlist
            </h1>
            <span className="rounded-full bg-[#F04E00]/10 px-3 py-1 text-sm font-bold text-[#F04E00]">
              {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Keep your favorite fresh groceries close at hand.
          </p>
        </div>
        {wishlistCount > 0 && (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={moveAllToCart}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0E532B]"
            >
              <ShoppingCart aria-hidden="true" size={17} />
              Move All to Cart
            </button>
            <button
              type="button"
              onClick={handleClearWishlist}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-[#F04E00]"
            >
              <Trash2 aria-hidden="true" size={16} />
              Clear Wishlist
            </button>
          </div>
        )}
      </header>

      {(statusMessage || errorMessage) && (
        <p
          role={errorMessage ? 'alert' : 'status'}
          className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium ${
            errorMessage
              ? 'bg-rose-50 text-rose-700'
              : 'bg-emerald-50 text-[#1E8E3E]'
          }`}
        >
          {errorMessage || statusMessage}
        </p>
      )}

      {wishlistItems.length === 0 ? (
        <section className="mt-8 rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F04E00]/10 text-[#F04E00]">
            <Heart aria-hidden="true" size={26} />
          </span>
          <h2 className="mt-5 text-xl font-bold text-[#0E532B]">
            Your wishlist is empty
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Save the groceries you love and they&apos;ll be waiting here.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0E532B]"
          >
            Browse Fresh Groceries →
          </Link>
        </section>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {wishlistItems.map((product) => {
            const image = product.image || product.imageUrl
            return (
              <article
                key={product.id}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Link
                  to={`/product/${product.id}`}
                  aria-label={`View ${product.name}`}
                  className="relative block aspect-[4/3] overflow-hidden bg-emerald-50"
                >
                  {image ? (
                    <img
                      src={image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-emerald-300">
                      <Image aria-hidden="true" size={42} strokeWidth={1.5} />
                    </span>
                  )}
                  <span className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#F04E00] shadow-sm">
                    <Heart aria-hidden="true" size={17} className="fill-[#F04E00]" />
                  </span>
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#0B4B8C]">
                    {typeof product.category === 'string'
                      ? product.category
                      : product.category?.name}
                  </p>
                  <h2 className="mt-1 font-bold text-[#0E532B]">{product.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {product.unit || product.weight || 'Grocery item'}
                  </p>
                  <p className="mt-4 text-lg font-extrabold text-[#1E8E3E]">
                    {formatCurrency(Number(product.price) || 0)}
                  </p>
                  <div className="mt-auto grid gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => moveToCart(product)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#0E532B]"
                    >
                      <ShoppingCart aria-hidden="true" size={16} />
                      Move to Cart
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(product)}
                      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-[#F04E00] transition hover:bg-orange-50"
                    >
                      <Heart aria-hidden="true" size={15} className="fill-[#F04E00]" />
                      Remove ♥
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Wishlist
