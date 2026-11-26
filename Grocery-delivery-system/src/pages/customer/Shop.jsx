import { SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../../components/ProductCard.jsx'
import SearchBar from '../../components/SearchBar.jsx'
import { categories as categoriesApi, getApiErrorMessage, products as productsApi } from '../../services/api.js'
import { useToast } from '../../context/ToastContext.jsx'
import categorySlug from '../../utils/categorySlug.js'
import formatCurrency from '../../utils/formatCurrency.js'

const legacyCategoryAliases = {
  Bakery: 'Bakery & Bread',
  Pantry: 'Pantry & Grains',
  Snacks: 'Snacks & Nuts',
}

function Shop() {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [catalogProducts, setCatalogProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [priceLimit, setPriceLimit] = useState(1000)
  const [sortBy, setSortBy] = useState('featured')
  const [onSaleOnly, setOnSaleOnly] = useState(searchParams.get('offers') === 'true')
  const query = searchParams.get('search') || ''
  const selectedCategoryValues = (searchParams.get('category') || '')
    .split(',')
    .filter(Boolean)
  const selectedCategories = selectedCategoryValues.map((value) =>
    categories.find((category) => category.slug === value || category.id === value)?.name ||
    legacyCategoryAliases[value] ||
    value,
  )
  const maximumPrice = useMemo(
    () => Math.ceil(Math.max(100, ...catalogProducts.map((product) => Number(product.price) || 0))),
    [catalogProducts],
  )

  useEffect(() => {
    let active = true
    Promise.all([
      productsApi.getAll(query ? { search: query } : undefined),
      categoriesApi.getAll(),
    ])
      .then(([nextProducts, nextCategories]) => {
        if (!active) return
        setCatalogProducts(nextProducts)
        setCategories(nextCategories)
        setPriceLimit((current) => Math.min(current, Math.ceil(Math.max(100, ...nextProducts.map((product) => Number(product.price) || 0)))))
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Could not load products.')))
    return () => {
      active = false
    }
  }, [query, toast])

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
      nextParams.set('category', categorySlug(category))
    } else {
      nextParams.delete('category')
    }
    setSearchParams(nextParams)
  }

  const toggleCategory = (category) => {
    const nextCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((item) => item !== category)
      : [...selectedCategories, category]
    updateQuery('category', nextCategories.map(categorySlug).join(','))
  }

  const clearFilters = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('search')
    nextParams.delete('category')
    setSearchParams(nextParams)
    setPriceLimit(maximumPrice)
    setOnSaleOnly(false)
    setSortBy('featured')
  }

  const normalizedQuery = query.trim().toLowerCase()
  const filteredProducts = catalogProducts.filter((product) => {
    const matchesQuery =
      !normalizedQuery ||
      `${product.name} ${product.category}`.toLowerCase().includes(normalizedQuery)
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category)
    const matchesPrice = product.price <= priceLimit
    const matchesSale =
      !onSaleOnly ||
      (Number(product.originalPrice) > Number(product.price) &&
        Number(product.originalPrice) > 0)
    return matchesQuery && matchesCategory && matchesPrice && matchesSale
  })

  if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => Number(a.price) - Number(b.price))
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => Number(b.price) - Number(a.price))
  } else if (sortBy === 'top-rated') {
    filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-[#1E8E3E]">The grocery aisle</p>
        <h1 className="mt-1 text-3xl font-bold text-[#0E532B]">Shop all products</h1>
        <p className="mt-2 text-gray-600">
          Fresh Ethiopian favorites and everyday essentials, all in one place.
          Free delivery on orders over 500 ETB.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal aria-hidden="true" size={18} className="text-[#1E8E3E]" />
            <h2 className="font-semibold text-[#0E532B]">Filters</h2>
          </div>

          <fieldset id="categories" className="mt-6">
            <legend className="text-sm font-semibold text-slate-800">Category</legend>
            <div className="mt-3 space-y-3">
              {categories.map(({ name: category }) => (
                <label key={category} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="h-4 w-4 rounded border-slate-300 accent-[#1E8E3E]"
                  />
                  {category}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <label htmlFor="price-limit" className="flex justify-between gap-2 text-sm font-semibold text-slate-800">
              <span>Max Price</span>
              <span>{formatCurrency(priceLimit)}</span>
            </label>
            <input
              id="price-limit"
              type="range"
              min="1"
              max={maximumPrice}
              step="1"
              value={priceLimit}
              onChange={(event) => setPriceLimit(Number(event.target.value))}
              className="mt-3 w-full accent-[#1E8E3E]"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{formatCurrency(1)}</span>
              <span>{formatCurrency(maximumPrice)}+</span>
            </div>
          </div>

          <label
            htmlFor="on-sale-only"
            className="mt-5 flex cursor-pointer items-center gap-2 border-t border-slate-100 pt-5 text-sm font-semibold text-slate-700"
          >
            <input
              id="on-sale-only"
              type="checkbox"
              checked={onSaleOnly}
              onChange={(event) => setOnSaleOnly(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-[#F04E00]"
            />
            On Sale Only
          </label>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 w-full rounded-xl border border-[#0E532B] px-4 py-2.5 text-sm font-bold text-[#0E532B] transition hover:bg-[#0E532B] hover:text-white"
          >
            Clear Filters
          </button>
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
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="top-rated">Top Rated</option>
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
