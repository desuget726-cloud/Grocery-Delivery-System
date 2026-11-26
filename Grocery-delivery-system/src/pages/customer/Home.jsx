import { ArrowRight, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../../components/ProductCard.jsx'
import { categories as categoriesApi, getApiErrorMessage, products as productsApi } from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'

const categoryDetails = {
  'Fruits & Vegetables': {
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=85',
    count: 24,
  },
  'Dairy & Eggs': {
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=700&q=85',
    count: 18,
  },
  'Bakery & Bread': {
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=85',
    count: 12,
  },
  'Meat & Seafood': {
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=700&q=85',
    count: 16,
  },
  'Pantry & Grains': {
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?auto=format&fit=crop&w=700&q=85',
    count: 20,
  },
  'Snacks & Nuts': {
    image: 'https://images.unsplash.com/photo-1621939514649-280e2aa5f1cf?auto=format&fit=crop&w=700&q=85',
    count: 32,
  },
  'Beverages & Juice': {
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=700&q=85',
    count: 14,
  },
  'Spices & Herbs': {
    image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=700&q=85',
    count: 20,
  },
}

function Home() {
  const toast = useToast()
  const [heroImageFailed, setHeroImageFailed] = useState(false)
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    let active = true
    Promise.all([categoriesApi.getAll(), productsApi.getAll({ sort: 'featured' })])
      .then(([nextCategories, nextProducts]) => {
        if (!active) return
        setCategories(nextCategories)
        setProducts(nextProducts)
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Could not load the catalog.')))
    return () => {
      active = false
    }
  }, [toast])

  return (
    <div className="space-y-12 sm:space-y-16">
      <section className="relative grid w-full grid-cols-1 items-center gap-8 overflow-hidden rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-[#F3FAF6] via-[#FFFDF9] to-[#FFF4EC] p-8 shadow-sm lg:grid-cols-12 lg:p-12">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-56 w-56 rounded-full bg-[#1E8E3E]/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-[#F04E00]/10 blur-3xl" />
        <div className="relative z-10 lg:col-span-7">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#0B4B8C]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0B4B8C]">
            Freshness at your doorstep
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            <span className="text-[#0E532B]">Good food.</span>
            <br />
            <span className="text-[#F04E00]">Good mood.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-gray-600 sm:text-lg">
            Shop farm-fresh groceries and pantry favorites, delivered right when
            you need them.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1E8E3E] px-6 py-3.5 font-bold text-white shadow-md transition-all hover:bg-[#0E532B]"
            >
              Shop fresh picks <ArrowRight aria-hidden="true" size={18} />
            </Link>
            <Link
              to="/shop?offers=true"
              className="inline-flex items-center rounded-xl bg-[#F04E00] px-6 py-3.5 font-bold text-white shadow-md transition-all hover:bg-[#d94400]"
            >
              Today&apos;s Offers
            </Link>
          </div>
        </div>

        <div className="relative z-10 lg:col-span-5">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white p-2 ring-4 ring-white shadow-xl">
            {heroImageFailed ? (
              <div className="h-full rounded-2xl bg-gradient-to-br from-emerald-300 via-[#1E8E3E] to-[#072916]" />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=85"
                alt="A colorful basket of fresh market produce"
                onError={() => setHeroImageFailed(true)}
                className="h-full w-full rounded-2xl object-cover"
              />
            )}
            <div className="absolute bottom-3 left-3 flex w-max max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm font-bold text-[#0E532B] shadow-xl sm:bottom-4 sm:left-4 sm:max-w-none">
              <Zap aria-hidden="true" size={18} className="shrink-0 fill-[#F04E00] text-[#F04E00]" />
              <span>30-Min Delivery in Addis Ababa</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Browse the aisles</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Shop by category</h2>
          </div>
          <Link
            to="/shop"
            className="hidden items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800 sm:inline-flex"
          >
            View all <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((categoryRecord) => {
            const category = categoryRecord.name
            const aliases = {
              Bakery: 'Bakery & Bread',
              'Meat & Poultry': 'Meat & Seafood',
              'Pantry Staples': 'Pantry & Grains',
              Beverages: 'Beverages & Juice',
              Snacks: 'Snacks & Nuts',
            }
            const details = categoryDetails[category] || categoryDetails[aliases[category]] || {
              image: categoryRecord.image || '',
              count: categoryRecord._count?.products || 0,
            }
            return (
              <Link
                key={categoryRecord.id}
                to={`/shop?category=${encodeURIComponent(categoryRecord.slug)}`}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                <div className="relative h-24 overflow-hidden bg-emerald-50">
                  <img
                    src={details.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <span className="absolute right-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-[#0E532B] shadow-sm">
                    {categoryRecord._count?.products ?? details.count} Items
                  </span>
                </div>
                <span className="block p-3 text-left text-sm font-semibold text-slate-800">
                  {category}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Picked for you</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Trending & fresh
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Shop all <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products
            .filter((product) => product.stock > 0)
            .slice(0, 5)
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-lime-100 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
            A little more goodness
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Save on seasonal favorites
          </h2>
          <p className="mt-2 text-slate-700">
            Discover fresh picks and weekly deals for your kitchen.
          </p>
          <Link
            to="/shop"
            className="mt-5 inline-flex font-semibold text-emerald-800 hover:underline"
          >
            Explore this week&apos;s picks
          </Link>
        </div>
        <div className="rounded-2xl bg-amber-50 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-800">
            Delivery made easy
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            Free delivery on orders over 500 ETB
          </h2>
          <p className="mt-2 text-slate-700">
            Stock up on the things you love and we&apos;ll bring them to you.
          </p>
          <Link
            to="/shop"
            className="mt-5 inline-flex font-semibold text-amber-900 hover:underline"
          >
            Start your basket
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
