import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categories, products } from '../../data/mockData.js'
import categorySlug from '../../utils/categorySlug.js'

const aisleDetails = {
  'Fruits & Vegetables': {
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=85',
    description: 'Colorful, seasonal produce selected for freshness and flavor.',
    popularItems: ['Avocados', 'Strawberries', 'Baby spinach'],
  },
  'Dairy & Eggs': {
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1000&q=85',
    description: 'Everyday dairy favorites and fresh eggs for your kitchen.',
    popularItems: ['Whole milk', 'Free-range eggs', 'Yogurt'],
  },
  'Bakery & Bread': {
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=85',
    description: 'Freshly baked loaves and treats for every table.',
    popularItems: ['Sourdough', 'Fresh bread', 'Pastries'],
  },
  'Meat & Seafood': {
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1000&q=85',
    description: 'Quality proteins, carefully handled and ready to cook.',
    popularItems: ['Chicken breast', 'Beef', 'Fresh fish'],
  },
  'Pantry & Grains': {
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9c8a213?auto=format&fit=crop&w=1000&q=85',
    description: 'Staple grains and pantry essentials to stock your shelves.',
    popularItems: ['Rolled oats', 'Rice', 'Pasta'],
  },
  'Snacks & Nuts': {
    image: 'https://images.unsplash.com/photo-1621939514649-280e2aa5f1cf?auto=format&fit=crop&w=1000&q=85',
    description: 'Tasty bites and nourishing snacks for any time of day.',
    popularItems: ['Trail mix', 'Almonds', 'Dried fruit'],
  },
  'Beverages & Juice': {
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1000&q=85',
    description: 'Refreshing juices and drinks to pour, share, and enjoy.',
    popularItems: ['Orange juice', 'Sparkling water', 'Coffee'],
  },
  'Spices & Herbs': {
    image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=1000&q=85',
    description: 'Aromatic herbs and spices that bring every recipe to life.',
    popularItems: ['Berbere', 'Turmeric', 'Fresh herbs'],
  },
}

function Categories() {
  return (
    <div className="space-y-8">
      <header className="rounded-3xl bg-gradient-to-br from-[#F3FAF6] via-white to-[#FFF4EC] p-6 sm:p-9">
        <p className="text-sm font-bold uppercase tracking-wider text-[#0B4B8C]">
          Find your favorites
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0E532B] sm:text-4xl">
          Shop by category
        </h1>
        <p className="mt-3 max-w-2xl text-gray-600">
          Browse eight fresh aisles, then choose a category to see its available
          products.
        </p>
      </header>

      <section
        aria-label="Grocery aisles"
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        {categories.map((category) => {
          const details = aisleDetails[category]
          const itemCount = products.filter(
            (product) => product.category === category,
          ).length

          return (
            <Link
              key={category}
              to={`/shop?category=${categorySlug(category)}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E8E3E]"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-emerald-50">
                <img
                  src={details.image}
                  alt={category}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#0E532B] shadow-sm">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-lg font-bold text-[#0E532B]">{category}</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {details.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {details.popularItems.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-[#0E532B]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#1E8E3E]">
                  Browse aisle <ArrowRight aria-hidden="true" size={16} />
                </span>
              </div>
            </Link>
          )
        })}
      </section>
    </div>
  )
}

export default Categories
