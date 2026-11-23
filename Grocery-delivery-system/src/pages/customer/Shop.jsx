import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../../components/ProductCard.jsx'
import SearchBar from '../../components/SearchBar.jsx'
import { categories, products } from '../../data/mockData.js'

const maximumPrice = Math.ceil(Math.max(...products.map((product) => product.price)))

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [priceLimit, setPriceLimit] = useState(maximumPrice)
  const [sortBy, setSortBy] = useState('featured')
  const query = searchParams.get('search') || ''
  const selectedCategories = (searchParams.get('category') || '')
    .split(',')
    .filter(Boolean)

  const updateQuery = (key, value) => {
    const nextParams = new URLSearchParams(searchParams)
    if (value) {
      nextParams.set(key, value)
    } else {
      nextParams.delete(key)
    }
    setSearchParams(nextParams)
  }

  const handleSearch = (search, category) => {
    const nextParams = new URLSearchParams(searchParams)
    if (search) {
      nextParams.set('search', search)
    } else {
      nextParams.delete('search')
    }
    if (category) {
      nextParams.set('category', category)
    } else {
      nextParams.delete('category')
    }
    setSearchParams(nextParams)
  }

  const toggleCategory = (category) => {
    const nextCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((item) => item !== category)
      : [...selectedCategories, category]
    updateQuery('category', nextCategories.join(','))
  }

  const normalizedQuery = query.trim().toLowerCase()
  const filteredProducts = products.filter((product) => {
    const matchesQuery =
      !normalizedQuery ||
      `${product.name} ${product.category}`.toLowerCase().includes(normalizedQuery)
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category)
    return matchesQuery && matchesCategory && product.price <= priceLimit
  })

  if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price)
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price)
  } else if (sortBy === 'name') {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-emerald-700">The grocery aisle</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Shop all products</h1>
        <p className="mt-2 text-slate-600">
          Fresh ingredients and everyday essentials, all in one place.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal aria-hidden="true" size={18} className="text-emerald-700" />
            <h2 className="font-semibold text-slate-900">Filters</h2>
          </div>

          <fieldset id="categories" className="mt-6">
            <legend className="text-sm font-semibold text-slate-800">Category</legend>
            <div className="mt-3 space-y-3">
              {categories.map((category) => (
                <label key={category} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
                  />
                  {category}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <label htmlFor="price-limit" className="flex justify-between text-sm font-semibold text-slate-800">
              <span>Maximum price</span>
              <span>${priceLimit}</span>
            </label>
            <input
              id="price-limit"
              type="range"
              min="1"
              max={maximumPrice}
              step="1"
              value={priceLimit}
              onChange={(event) => setPriceLimit(Number(event.target.value))}
              className="mt-3 w-full accent-emerald-600"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>$1</span>
              <span>${maximumPrice}+</span>
            </div>
          </div>
        </aside>

        <section>
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchBar
              key={`${query}-${selectedCategories.join(',')}`}
              initialValue={query}
              initialCategory={selectedCategories.length === 1 ? selectedCategories[0] : ''}
              onSearch={handleSearch}
            />
            <label className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600">
              <span className="sr-only">Sort products</span>
              <select
                aria-label="Sort products"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="min-h-11 bg-transparent pr-2 font-medium text-slate-800 outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>

          {filteredProducts.length > 0 ? (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <h2 className="font-semibold text-slate-900">No products found</h2>
              <p className="mt-2 text-sm text-slate-500">
                Try a different search or adjust your filters.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Shop
