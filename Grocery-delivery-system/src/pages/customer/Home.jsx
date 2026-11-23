import { Apple, ArrowRight, Carrot, Coffee, Milk, Wheat } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductCard from '../../components/ProductCard.jsx'
import { categories, products } from '../../data/mockData.js'

const categoryIcons = [Apple, Milk, Wheat, Carrot, Coffee, Apple]

function Home() {
  return (
    <div className="space-y-12 sm:space-y-16">
      <section className="relative overflow-hidden rounded-3xl bg-emerald-800 px-6 py-12 text-white sm:px-10 sm:py-16">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-200">
            Freshness at your doorstep
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Good food.
            <br />
            Good mood.
          </h1>
          <p className="mt-4 max-w-lg text-emerald-50">
            Shop farm-fresh groceries and pantry favorites, delivered right when
            you need them.
          </p>
          <Link
            to="/shop"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-emerald-800 transition hover:bg-emerald-50"
          >
            Shop fresh picks <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-14 h-72 w-72 rounded-full border-[36px] border-emerald-700/70 sm:right-8 sm:top-1/2 sm:-translate-y-1/2"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 right-24 h-52 w-52 rounded-full bg-lime-400/20"
        />
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category, index) => {
            const Icon = categoryIcons[index % categoryIcons.length]
            return (
              <Link
                key={category}
                to={`/shop?category=${encodeURIComponent(category)}`}
                className="group rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100">
                  <Icon aria-hidden="true" size={23} />
                </span>
                <span className="mt-3 block text-sm font-semibold text-slate-800">
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products
            .filter((product) => product.stock > 0)
            .slice(0, 4)
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
            Free delivery on $50+
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
