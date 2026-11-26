import { ArrowLeft, Heart, Image, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ProductCard from '../../components/ProductCard.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { useWishlist } from '../../context/WishlistContext.jsx'
import { getApiErrorMessage, products as productsApi } from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import categorySlug from '../../utils/categorySlug.js'
import formatCurrency from '../../utils/formatCurrency.js'

function ProductDetails() {
  const { id, productId } = useParams()
  const toast = useToast()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loadedProductId, setLoadedProductId] = useState(null)
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [quantity, setQuantity] = useState(1)
  const [wishlistError, setWishlistError] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    let active = true
    productsApi.getById(id || productId)
      .then((result) => {
        if (!active) return
        setProduct(result.product)
        setRelatedProducts(result.relatedProducts)
      })
      .catch((error) => {
        if (!active) return
        setProduct(null)
        toast.error(getApiErrorMessage(error, 'Could not load this product.'))
      })
      .finally(() => {
        if (active) setLoadedProductId(id || productId)
      })
    return () => {
      active = false
    }
  }, [id, productId, toast])

  if (loadedProductId !== (id || productId)) {
    return <p className="rounded-2xl bg-white p-8 text-center text-slate-500">Loading product…</p>
  }

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

  const inStock = product.stock > 0
  const image = product.image || product.imageUrl
  const isWishlisted = isInWishlist(product.id)
  const isDiscounted = Number(product.originalPrice) > Number(product.price)
  const handleWishlistToggle = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    try {
      await toggleWishlist(product)
      setWishlistError('')
      } catch (error) {
        setWishlistError(error.message || 'Wishlist could not be saved. Please try again.')
    }
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
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
        <div className="relative overflow-hidden rounded-2xl bg-emerald-50">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-[360px] w-full rounded-2xl object-cover sm:h-[440px]"
            />
          ) : (
            <div className="flex h-[360px] w-full items-center justify-center sm:h-[440px]">
              <Image aria-hidden="true" size={72} strokeWidth={1.2} className="text-emerald-300" />
            </div>
          )}
          {isDiscounted && (
            <span className="absolute left-4 top-4 rounded-full bg-[#F04E00] px-3 py-1.5 text-sm font-bold text-white shadow-sm">
              14% OFF
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-sm font-semibold text-emerald-700">{product.category}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {product.name}
          </h1>
          <p className="mt-2 text-slate-500">{product.unit}</p>
          <p className="mt-3 text-sm font-semibold text-slate-700">
            <span className="text-[#F04E00]">{Number(product.rating || 0).toFixed(1)} ★</span> • {product.reviews?.length || 0} Reviews
          </p>
          <button
            type="button"
            aria-label={`${isWishlisted ? 'Remove' : 'Add'} ${product.name} ${isWishlisted ? 'from' : 'to'} wishlist`}
            aria-pressed={isWishlisted}
            onClick={handleWishlistToggle}
            className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-[#F04E00]"
          >
            <Heart
              aria-hidden="true"
              size={17}
              className={isWishlisted ? 'fill-[#F04E00] text-[#F04E00]' : ''}
            />
            {isWishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
          </button>
          {wishlistError && (
            <p role="alert" className="mt-2 text-xs font-medium text-rose-700">
              {wishlistError}
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(product.price)}</p>
            {isDiscounted && (
              <p className="text-base text-slate-400 line-through">
                {formatCurrency(product.originalPrice)}
              </p>
            )}
          </div>
          <p className={`mt-3 text-sm font-semibold ${inStock ? 'text-emerald-700' : 'text-rose-600'}`}>
            {inStock ? `${product.stock} in stock` : 'Currently out of stock'}
          </p>
          <p className="mt-4 w-fit rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
            ⚡ Fast 30–45 min delivery in Addis Ababa • Free over 500 ETB
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

      <section aria-labelledby="similar-products-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2
            id="similar-products-heading"
            className="text-xl font-extrabold text-[#0E532B]"
          >
            Similar in {product.category}
          </h2>
          <Link
            to={`/shop?category=${encodeURIComponent(categorySlug(product.category))}`}
            className="text-sm font-semibold text-[#1E8E3E] transition hover:text-[#0E532B]"
          >
            View all in {product.category} →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {relatedProducts.map((relatedProduct) => (
            <ProductCard key={relatedProduct.id} product={relatedProduct} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default ProductDetails
