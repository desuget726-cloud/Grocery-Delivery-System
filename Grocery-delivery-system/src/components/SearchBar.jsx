import { Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const categories = [
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Bakery',
  'Beverages',
  'Meat & Fish',
]

function SearchBar({
  initialValue = '',
  initialCategory = '',
  onSearch,
}) {
  const navigate = useNavigate()
  const [query, setQuery] = useState(initialValue)
  const [category, setCategory] = useState(initialCategory)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (onSearch) {
      onSearch(query.trim(), category)
      return
    }

    const params = new URLSearchParams()
    if (query.trim()) {
      params.set('search', query.trim())
    }
    if (category) {
      params.set('category', category)
    }

    navigate(`/shop${params.size ? `?${params.toString()}` : ''}`)
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex min-w-0 w-full items-center overflow-hidden rounded-lg border border-gray-200 bg-white transition focus-within:border-[#1E8E3E] focus-within:ring-2 focus-within:ring-[#1E8E3E]/10"
    >
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search for fresh groceries..."
        aria-label="Search for fresh groceries"
        className="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400 sm:px-4"
      />
      <label className="block shrink-0 border-l border-gray-200">
        <span className="sr-only">Select a category</span>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="max-w-[108px] cursor-pointer bg-white py-3 pl-2 pr-5 text-[10px] text-gray-600 outline-none sm:max-w-40 sm:pl-3 sm:pr-7 sm:text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        aria-label="Search"
        className="flex h-11 w-12 shrink-0 items-center justify-center bg-[#1E8E3E] text-white transition hover:bg-[#0E532B] sm:w-auto sm:gap-2 sm:px-4"
      >
        <Search aria-hidden="true" size={18} />
        <span className="hidden text-sm font-semibold sm:inline">Search</span>
      </button>
    </form>
  )
}

export default SearchBar
