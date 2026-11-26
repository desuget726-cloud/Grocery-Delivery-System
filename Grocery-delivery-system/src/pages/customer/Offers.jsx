import { Check, Copy, Heart, ShoppingCart, Tag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCart } from '../../context/CartContext.jsx'
import { useWishlist } from '../../context/WishlistContext.jsx'
import { coupons as couponsApi, getApiErrorMessage, products as productsApi } from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import formatCurrency from '../../utils/formatCurrency.js'

function Offers() {
  const toast = useToast()
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [promoCodes, setPromoCodes] = useState([])
  const [discountedProducts, setDiscountedProducts] = useState([])
  const [copyStatus, setCopyStatus] = useState({})
  const [addedProductId, setAddedProductId] = useState('')
  const [wishlistError, setWishlistError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([couponsApi.getAll(), productsApi.getAll({ onSale: 'true' })])
      .then(([couponResponse, products]) => {
        if (!active) return
        setPromoCodes(couponResponse.data.coupons || [])
        setDiscountedProducts(products.map((product) => ({
          ...product,
          discount: product.originalPrice
            ? Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)
            : 0,
        })))
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Could not load current offers.')))
    return () => {
      active = false
    }
  }, [toast])

  const copyPromoCode = async (code) => {
    if (!navigator.clipboard?.writeText) {
      setCopyStatus((current) => ({
        ...current,
        [code]: 'Clipboard access is unavailable in this browser.',
      }))
      return
    }

    try {
      await navigator.clipboard.writeText(code)
      setCopyStatus((current) => ({ ...current, [code]: 'Copied!' }))
    } catch (error) {
      console.error('Unable to copy the promo code:', error)
      setCopyStatus((current) => ({
        ...current,
        [code]: 'Could not copy. Please select the code and copy it.',
      }))
    }
  }

  const handleAddToCart = (product) => {
    addToCart(product)
    setAddedProductId(product.id)
    window.setTimeout(() => setAddedProductId(''), 1800)
  }

  const handleWishlistToggle = async (event, product) => {
    event.preventDefault()
    event.stopPropagation()
    try {
      await toggleWishlist(product)
      setWishlistError('')
    } catch (error) {
      setWishlistError(error.message || 'Wishlist could not be saved. Please try again.')
    }
  }

  return (
    <div className="space-y-10">
      <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#F04E00] to-[#0E532B] px-6 py-10 text-white sm:px-10 sm:py-14">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/80">
          Fresh savings, every week
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl">
          Hot Deals &amp; Weekly Grocery Offers
        </h1>
        <p className="mt-4 max-w-xl text-white/90">
          Shop seasonal favorites and enjoy a little extra value with every
          delivery across Addis Ababa.
        </p>
      </header>

      <section>
        <div className="mb-5">
          <p className="text-sm font-semibold text-[#F04E00]">Use at checkout</p>
          <h2 className="mt-1 text-2xl font-bold text-[#0E532B]">Promo codes</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {promoCodes.map((coupon) => {
            const description = coupon.discountType === 'PERCENTAGE'
              ? `${Number(coupon.value)}% Off`
              : coupon.discountType === 'FIXED'
                ? `${formatCurrency(Number(coupon.value))} Off`
                : 'Free Delivery'
            const detail = coupon.description || `Minimum order ${formatCurrency(Number(coupon.minOrder || 0))}.`
            return (
            <article
              key={coupon.id}
              className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F04E00]/10 text-[#F04E00]">
                  <Tag aria-hidden="true" size={20} />
                </span>
                <strong className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-[#0E532B]">
                  {description}
                </strong>
              </div>
              <p className="mt-4 text-sm text-gray-600">{detail}</p>
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-emerald-200 bg-[#F3FAF6] p-3">
                <code className="font-bold tracking-wider text-[#0E532B]">{coupon.code}</code>
                <button
                  type="button"
                  onClick={() => copyPromoCode(coupon.code)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0B4B8C] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#083c70] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B4B8C]"
                >
                  {copyStatus[coupon.code] === 'Copied!' ? (
                    <Check aria-hidden="true" size={14} />
                  ) : (
                    <Copy aria-hidden="true" size={14} />
                  )}
                  {copyStatus[coupon.code] === 'Copied!' ? 'Copied' : 'Copy Code'}
                </button>
              </div>
              {copyStatus[coupon.code] && (
                <p
                  role="status"
                  className={`mt-2 text-xs ${
                    copyStatus[coupon.code] === 'Copied!'
                      ? 'text-emerald-700'
                      : 'text-rose-700'
                  }`}
                >
                  {copyStatus[coupon.code]}
                </p>
              )}
            </article>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-5">
          <p className="text-sm font-semibold text-[#F04E00]">Limited-time picks</p>
          <h2 className="mt-1 text-2xl font-bold text-[#0E532B]">
            Fresh deals for your basket
          </h2>
          {wishlistError && (
            <p role="alert" className="mt-2 text-sm font-medium text-rose-700">
              {wishlistError}
            </p>
          )}
        </div>
        {discountedProducts.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {discountedProducts.map((product) => (
              <article
                key={product.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-emerald-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`${isInWishlist(product.id) ? 'Remove' : 'Add'} ${product.name} ${isInWishlist(product.id) ? 'from' : 'to'} wishlist`}
                    aria-pressed={isInWishlist(product.id)}
                    onClick={(event) => handleWishlistToggle(event, product)}
                    className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#F04E00] shadow transition hover:scale-105"
                  >
                    <Heart
                      aria-hidden="true"
                      size={19}
                      className={isInWishlist(product.id) ? 'fill-[#F04E00] text-[#F04E00]' : ''}
                    />
                  </button>
                  <span className="absolute right-3 top-3 rounded-full bg-[#F04E00] px-3 py-1.5 text-xs font-extrabold text-white shadow">
                    {product.discount}% OFF
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#0B4B8C]">
                    {product.category}
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-[#0E532B]">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{product.unit}</p>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-[#1E8E3E]">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-sm text-gray-400 line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-4 py-3 font-bold text-white transition hover:bg-[#0E532B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E8E3E]"
                  >
                    <ShoppingCart aria-hidden="true" size={17} />
                    {addedProductId === product.id ? 'Added to Cart' : 'Add to Cart'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-gray-600">
            No discounted products are available right now. Check back soon.
          </p>
        )}
      </section>
    </div>
  )
}

export default Offers
