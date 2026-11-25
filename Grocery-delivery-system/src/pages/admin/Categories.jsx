import {
  Check,
  Eye,
  EyeOff,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Search,
  ShoppingBasket,
  Star,
  Trash2,
  Upload,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageHeader, Modal } from '../../components/admin/AdminUI.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import usePersistentState from '../../hooks/usePersistentState.js'
import formatCurrency from '../../utils/formatCurrency.js'

const initialCategories = [
  {
    id: 'grocery-fruits-vegetables',
    name: 'Fruits & Vegetables',
    slug: 'fruits-vegetables',
    description: 'Fresh-picked local produce, leafy greens, and everyday favorites.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=85',
    productCount: 24,
    weeklySales: 58500,
    order: 1,
    active: true,
    featured: true,
    tags: ['Local produce', 'Organic', 'Seasonal'],
  },
  {
    id: 'grocery-dairy-eggs',
    name: 'Dairy & Eggs',
    slug: 'dairy-eggs',
    description: 'Farm-fresh milk, cultured dairy, butter, and free-range eggs.',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=1200&q=85',
    productCount: 18,
    weeklySales: 36200,
    order: 2,
    active: true,
    featured: false,
    tags: ['Farm fresh', 'Chilled', 'Everyday'],
  },
  {
    id: 'grocery-bakery-bread',
    name: 'Bakery & Bread',
    slug: 'bakery-bread',
    description: 'Oven-fresh loaves, rolls, pastries, and traditional bakes.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=85',
    productCount: 14,
    weeklySales: 28750,
    order: 3,
    active: true,
    featured: false,
    tags: ['Baked today', 'Artisan', 'Local'],
  },
  {
    id: 'grocery-meat-seafood',
    name: 'Meat & Seafood',
    slug: 'meat-seafood',
    description: 'Quality cuts and fresh seafood, prepared with care.',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1200&q=85',
    productCount: 12,
    weeklySales: 42100,
    order: 4,
    active: true,
    featured: false,
    tags: ['Fresh cuts', 'Protein', 'Chilled'],
  },
  {
    id: 'grocery-pantry-grains',
    name: 'Pantry & Grains (Teff, Pasta, Oil)',
    slug: 'pantry-grains',
    description: 'Kitchen staples, Ethiopian teff, grains, pasta, and cooking oils.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=85',
    productCount: 30,
    weeklySales: 51800,
    order: 5,
    active: true,
    featured: true,
    tags: ['Teff & grains', 'Cooking oil', 'Essentials'],
  },
  {
    id: 'grocery-snacks-nuts',
    name: 'Snacks & Nuts',
    slug: 'snacks-nuts',
    description: 'A little something for every break, from nuts to crunchy bites.',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=1200&q=85',
    productCount: 16,
    weeklySales: 21400,
    order: 6,
    active: true,
    featured: false,
    tags: ['On the go', 'Nuts', 'Treats'],
  },
  {
    id: 'grocery-beverages-juice',
    name: 'Beverages & Juice',
    slug: 'beverages-juice',
    description: 'Refreshing juices, bottled drinks, coffee, and tea.',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=1200&q=85',
    productCount: 20,
    weeklySales: 32800,
    order: 7,
    active: true,
    featured: false,
    tags: ['Juice', 'Coffee & tea', 'Refresh'],
  },
  {
    id: 'grocery-spices-herbs',
    name: 'Spices & Herbs',
    slug: 'spices-herbs',
    description: 'Fragrant spices, fresh herbs, and blends for bold flavor.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85',
    productCount: 15,
    weeklySales: 19500,
    order: 8,
    active: false,
    featured: false,
    tags: ['Ethiopian spices', 'Fresh herbs', 'Seasoning'],
  },
]

const emptyCategory = {
  name: '',
  description: '',
  image: '',
  order: String(initialCategories.length + 1),
  active: true,
  featured: false,
  productCount: 0,
  weeklySales: 0,
  tags: [],
}

const presetImages = initialCategories.slice(0, 6)

const slugify = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const legacyNames = {
  bakery: 'grocery-bakery-bread',
  pantry: 'grocery-pantry-grains',
  snacks: 'grocery-snacks-nuts',
}

function normalizeCategories(savedCategories) {
  const saved = Array.isArray(savedCategories)
    ? savedCategories.filter((category) => category && typeof category === 'object')
    : []
  if (saved.some((category) => category.schemaVersion === 2)) return saved

  const consumed = new Set()
  const seeded = initialCategories.map((defaultCategory) => {
    const matchesCategory = (category) => {
      const key = String(category.slug || slugify(category.name || '')).toLowerCase()
      return category.id === defaultCategory.id
        || category.id === defaultCategory.id.replace('grocery-', 'category-')
        || key === defaultCategory.slug
        || key === slugify(defaultCategory.name)
        || legacyNames[key] === defaultCategory.id
    }
    const matches = saved.filter(matchesCategory)
    const existing = matches.find((category) => category.id === defaultCategory.id) || matches[0]
    matches.forEach((category) => consumed.add(category))
    return {
      ...defaultCategory,
      ...(existing || {}),
      id: defaultCategory.id,
      name: existing?.name ? (
        legacyNames[slugify(existing.name)] === defaultCategory.id
          ? defaultCategory.name
          : existing.name
      ) : defaultCategory.name,
      slug: existing?.slug || defaultCategory.slug,
      description: existing?.description || defaultCategory.description,
      image: existing?.image || defaultCategory.image,
      productCount: Number.isFinite(Number(existing?.productCount))
        ? Number(existing.productCount)
        : defaultCategory.productCount,
      weeklySales: Number.isFinite(Number(existing?.weeklySales))
        ? Number(existing.weeklySales)
        : defaultCategory.weeklySales,
      order: Number.isFinite(Number(existing?.order))
        ? Number(existing.order)
        : defaultCategory.order,
      active: typeof existing?.active === 'boolean' ? existing.active : defaultCategory.active,
      featured: typeof existing?.featured === 'boolean' ? existing.featured : defaultCategory.featured,
      tags: Array.isArray(existing?.tags) ? existing.tags : defaultCategory.tags,
      schemaVersion: 2,
    }
  })
  const custom = saved
    .filter((category) => !consumed.has(category))
    .map((category, index) => ({
      ...emptyCategory,
      ...category,
      slug: category.slug || slugify(category.name || ''),
      order: Number(category.order) || seeded.length + index + 1,
      active: typeof category.active === 'boolean' ? category.active : true,
      featured: Boolean(category.featured),
      productCount: Number(category.productCount) || 0,
      weeklySales: Number(category.weeklySales) || 0,
      tags: Array.isArray(category.tags) ? category.tags : [],
      schemaVersion: 2,
    }))
  return [...seeded, ...custom]
}

function CategoryImage({ src, name, className = '' }) {
  const [failedSrc, setFailedSrc] = useState('')

  if (!src || failedSrc === src) {
    return (
      <div className={`flex items-center justify-center bg-[#F0F7F1] text-[#1E8E3E] ${className}`}>
        <ShoppingBasket aria-hidden="true" size={28} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setFailedSrc(src)}
      className={className}
    />
  )
}

function VisibilitySwitch({ category, onToggle, compact = false }) {
  const { t } = useLanguage()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(category.active)}
      aria-label={`${t(category.active ? 'products.hide' : 'products.show')} ${category.name} ${t('products.onStorefront')}`}
      onClick={onToggle}
      className={`relative inline-flex shrink-0 items-center rounded-full transition ${compact ? 'h-5 w-9' : 'h-6 w-11'} ${category.active ? 'bg-[#1E8E3E]' : 'bg-slate-300'}`}
    >
      <span
        className={`absolute rounded-full bg-white shadow-sm transition-all ${compact ? 'top-0.5 h-4 w-4' : 'top-0.5 h-5 w-5'} ${category.active ? (compact ? 'left-[18px]' : 'left-[22px]') : 'left-0.5'}`}
      />
    </button>
  )
}

function Categories() {
  const { t } = useLanguage()
  const [categories, setCategories] = usePersistentState(
    'admin-categories',
    initialCategories,
    normalizeCategories,
  )
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('order')
  const [view, setView] = useState('grid')
  const [editingCategory, setEditingCategory] = useState(null)
  const [draft, setDraft] = useState(emptyCategory)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [localPreview, setLocalPreview] = useState('')

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview)
  }, [localPreview])

  const visibleCategories = categories
  const totalProducts = visibleCategories.reduce(
    (total, category) => total + (Number(category.productCount) || 0),
    0,
  )
  const activeCount = visibleCategories.filter((category) => category.active).length
  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = visibleCategories.filter((category) => {
      const matchesSearch = `${category.name} ${category.slug} ${category.description || ''}`
        .toLowerCase()
        .includes(query)
      const matchesStatus = statusFilter === 'All'
        || (statusFilter === 'Active' && category.active)
        || (statusFilter === 'Hidden' && !category.active)
        || (statusFilter === 'Featured' && category.featured)
      return matchesSearch && matchesStatus
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'products') return Number(b.productCount) - Number(a.productCount)
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return Number(a.order) - Number(b.order)
    })
  }, [search, sortBy, statusFilter, visibleCategories])

  const updateCategory = (category, changes) => {
    setCategories((current) =>
      current.map((item) => item.id === category.id ? { ...item, ...changes } : item),
    )
  }

  const openAddModal = () => {
    setEditingCategory(null)
    setDraft({ ...emptyCategory, order: String(visibleCategories.length + 1) })
    setLocalPreview('')
    setModalOpen(true)
  }

  const openEditModal = (category) => {
    setEditingCategory(category)
    setDraft({
      ...emptyCategory,
      ...category,
      order: String(category.order),
      tags: Array.isArray(category.tags) ? category.tags : [],
    })
    setLocalPreview('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setLocalPreview('')
  }

  const handleSave = (event) => {
    event.preventDefault()
    const updatedCategory = {
      ...draft,
      id: editingCategory?.id || `category-${Date.now()}`,
      name: draft.name.trim(),
      slug: slugify(draft.name),
      image: draft.image.trim(),
      order: Math.max(1, Number(draft.order) || 1),
      schemaVersion: 2,
    }

    setCategories((current) =>
      editingCategory
        ? current.map((item) => item.id === editingCategory.id ? updatedCategory : item)
        : [...current, updatedCategory],
    )
    closeModal()
    setEditingCategory(null)
  }

  const confirmDelete = () => {
    setCategories((current) => current.filter((category) => category.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (localPreview) URL.revokeObjectURL(localPreview)
    setLocalPreview(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onload = () => setDraft((current) => ({ ...current, image: String(reader.result || '') }))
    reader.onerror = () => console.error('Unable to preview the selected category image.')
    reader.readAsDataURL(file)
  }

  const toggleVisibility = (category) => updateCategory(category, { active: !category.active })

  const categoryLink = (category) =>
    `/admin/products?category=${encodeURIComponent(category.name)}`

  return (
    <div className="mx-auto max-w-[1600px]">
      <AdminPageHeader
        title={t('categories')}
        description={t('products.categoriesDescription')}
        action={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="relative min-w-0 sm:w-56">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('products.searchCategories')}
                aria-label={t('products.searchCategories')}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#1E8E3E]"
              />
            </label>
            <div role="group" aria-label={t('products.categoryView')} className="flex w-fit rounded-xl border border-slate-200 bg-white p-1">
              <button
                type="button"
                aria-label={t('products.gridView')}
                aria-pressed={view === 'grid'}
                onClick={() => setView('grid')}
                className={`rounded-lg p-2 ${view === 'grid' ? 'bg-[#F0F7F1] text-[#0E532B]' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <LayoutGrid aria-hidden="true" size={17} />
              </button>
              <button
                type="button"
                aria-label={t('products.tableView')}
                aria-pressed={view === 'table'}
                onClick={() => setView('table')}
                className={`rounded-lg p-2 ${view === 'table' ? 'bg-[#F0F7F1] text-[#0E532B]' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <List aria-hidden="true" size={17} />
              </button>
            </div>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0E532B]"
            >
              <Plus aria-hidden="true" size={17} /> {t('products.addCategory')}
            </button>
          </div>
        }
      />

      <section aria-label={t('products.categoryStatistics')} className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { labelKey: 'totalCategories', value: visibleCategories.length, badge: 'bg-[#F0F7F1] text-[#0E532B]', icon: ShoppingBasket },
          { labelKey: 'activeOnStorefront', value: activeCount, badge: 'bg-emerald-50 text-[#1E8E3E]', icon: Eye },
          { labelKey: 'totalListedProducts', value: totalProducts, badge: 'bg-blue-50 text-[#0B4B8C]', icon: ImageIcon },
          { labelKey: 'topCategory', value: 'Fruits & Vegetables', badge: 'bg-orange-50 text-[#F04E00]', icon: Star },
        ].map(({ labelKey, value, badge, icon: Icon }) => (
          <article key={labelKey} className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">{t(labelKey)}</p>
              <p className={`mt-1 truncate font-bold tracking-tight ${labelKey === 'topCategory' ? 'text-base text-[#0E532B]' : 'text-2xl text-[#0E532B]'}`}>
                {value}
              </p>
            </div>
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${badge}`}>
              <Icon aria-hidden="true" size={19} />
            </span>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div role="group" aria-label={t('products.filterCategoriesByStatus')} className="flex flex-wrap gap-1.5">
            {['All', 'Active', 'Hidden', 'Featured'].map((status) => (
              <button
                key={status}
                type="button"
                aria-pressed={statusFilter === status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${statusFilter === status ? 'bg-[#1E8E3E] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {t(status === 'Featured' ? 'products.featuredCategory' : status)}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="text-xs font-medium text-slate-500">
              {filteredCategories.length} {t(filteredCategories.length === 1 ? 'products.categoryFound' : 'categories')}
            </span>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
              {t('common.sortBy')}
              <select
                aria-label={t('common.sortBy')}
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#1E8E3E]"
              >
                <option value="order">{t('products.displayOrder')}</option>
                <option value="products">{t('products.mostProducts')}</option>
                <option value="name">{t('products.nameAToZ')}</option>
              </select>
            </label>
          </div>
        </div>

        {view === 'grid' ? (
          <div className="grid grid-cols-1 gap-5 p-4 md:grid-cols-2 xl:grid-cols-3 sm:p-5">
            {filteredCategories.map((category) => (
              <article
                key={category.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative h-36 overflow-hidden bg-slate-100">
                  <CategoryImage
                    src={category.image}
                    name={category.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-800 shadow-sm">
                    #{category.order}
                  </span>
                  {category.featured && (
                    <span className="absolute left-[4.3rem] top-3 inline-flex items-center gap-1 rounded-full bg-[#F04E00] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                      <Star aria-hidden="true" size={12} fill="currentColor" /> {t('products.featuredCategory')}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleVisibility(category)}
                    aria-label={`${t(category.active ? 'products.hide' : 'products.show')} ${category.name} ${t('products.onStorefront')}`}
                    className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm transition ${category.active ? 'bg-white/95 text-[#1E8E3E]' : 'bg-slate-900/80 text-white'}`}
                  >
                    {category.active ? <Eye aria-hidden="true" size={13} /> : <EyeOff aria-hidden="true" size={13} />}
                    {t(category.active ? 'Active' : 'Hidden')}
                  </button>
                  <p className="absolute bottom-3 left-4 text-xs font-medium text-white">
                    /shop?category={category.slug}
                  </p>
                </div>

                <div className="p-4">
                  <div className="min-h-[58px]">
                    <h2 className="font-semibold leading-snug text-[#0E532B]">{category.name}</h2>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">{category.description}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#F0F7F1] px-2.5 py-1 text-xs font-semibold text-[#0E532B]">
                      {category.productCount} {t('products')}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-[#0E532B]">
                      ~{formatCurrency(category.weeklySales)}/wk
                    </span>
                  </div>
                  <div className="mt-3 flex min-h-6 flex-wrap gap-1.5">
                    {(category.tags || []).slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <footer className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                    <Link
                      to={categoryLink(category)}
                      className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-[#1E8E3E] transition hover:text-[#0E532B]"
                    >
                      {t('products.viewProducts')} <span aria-hidden="true">→</span>
                    </Link>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        aria-label={`Edit ${category.name}`}
                        title={t('products.editCategory')}
                        onClick={() => openEditModal(category)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-[#0E532B]"
                      >
                        <Pencil aria-hidden="true" size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label={`${category.active ? 'Hide' : 'Show'} ${category.name}`}
                        title={`${t(category.active ? 'products.hide' : 'products.show')} ${t('shop.category')}`}
                        onClick={() => toggleVisibility(category)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-[#0E532B]"
                      >
                        {category.active ? <EyeOff aria-hidden="true" size={15} /> : <Eye aria-hidden="true" size={15} />}
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${category.name}`}
                        title={`${t('common.delete')} ${t('shop.category')}`}
                        onClick={() => setDeleteTarget(category)}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-orange-50 hover:text-[#F04E00]"
                      >
                        <Trash2 aria-hidden="true" size={15} />
                      </button>
                    </div>
                  </footer>
                </div>
              </article>
            ))}
            {filteredCategories.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-slate-300 py-14 text-center">
                <p className="font-semibold text-slate-800">{t('products.noCategoriesFound')}</p>
                <p className="mt-1 text-sm text-slate-500">{t('common.tryChangingSearchFilters')}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.08em] text-[#0E532B]/75">
                <tr>
                  <th scope="col" className="px-4 py-3.5 font-semibold">{t('shop.category')}</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">{t('common.description')}</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">{t('products')}</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">{t('common.order')}</th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">{t('common.active')}</th>
                  <th scope="col" className="px-4 py-3.5 text-right font-semibold">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="transition hover:bg-slate-50/70">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <CategoryImage src={category.image} name={category.name} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                        <div className="min-w-0">
                          <p className="max-w-[230px] truncate font-semibold text-slate-900">{category.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">/shop?category={category.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[290px] px-4 py-3.5 text-xs text-slate-600">{category.description}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-700">{category.productCount} {t('products')}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">#{category.order}</td>
                    <td className="px-4 py-3.5">
                      <VisibilitySwitch category={category} onToggle={() => toggleVisibility(category)} compact />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`Edit ${category.name}`}
                          onClick={() => openEditModal(category)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-[#0E532B]"
                        >
                          <Pencil aria-hidden="true" size={16} />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${category.name}`}
                          onClick={() => setDeleteTarget(category)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-orange-50 hover:text-[#F04E00]"
                        >
                          <Trash2 aria-hidden="true" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCategories.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-5 py-14 text-center text-sm text-slate-500">
                      {t('products.noCategoriesFound')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalOpen && (
        <Modal
          title={editingCategory ? `${t('common.edit')} ${t('shop.category')}` : t('products.addCategory')}
          onClose={closeModal}
          size="max-w-4xl"
        >
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-[240px_1fr]">
              <aside>
                <p className="mb-2 text-sm font-semibold text-slate-700">{t('products.storefrontPreview')}</p>
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative h-28 overflow-hidden bg-slate-100">
                    <CategoryImage
                      src={localPreview || draft.image}
                      name={draft.name || 'Category preview'}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <span className="absolute bottom-2 left-3 text-sm font-semibold text-white">
                      {draft.name || 'Category name'}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="truncate text-xs text-slate-500">/shop?category={slugify(draft.name) || 'category-name'}</p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-[#0E532B]">{draft.productCount || 0} Products</span>
                      <span className={draft.active ? 'text-[#1E8E3E]' : 'text-slate-400'}>
                        {draft.active ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </div>

                <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
                  <Upload aria-hidden="true" size={15} /> {t('common.uploadImage')}
                  <input type="file" accept="image/*" className="sr-only" onChange={handleImageUpload} />
                </label>
                <p className="mb-2 mt-4 text-xs font-semibold text-slate-600">{t('products.quickImagePresets')}</p>
                <div className="grid grid-cols-3 gap-2">
                  {presetImages.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      aria-label={`Use ${preset.name} image`}
                      title={preset.name}
                      onClick={() => {
                        setLocalPreview('')
                        setDraft((current) => ({ ...current, image: preset.image }))
                      }}
                      className="overflow-hidden rounded-lg border border-slate-200 transition hover:border-[#1E8E3E] hover:ring-2 hover:ring-[#1E8E3E]/15"
                    >
                      <CategoryImage src={preset.image} name={preset.name} className="h-12 w-full object-cover" />
                    </button>
                  ))}
                </div>
              </aside>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    {t('products.categoryName')}
                    <input
                      required
                      autoFocus
                      value={draft.name}
                      onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    {t('products.autoGeneratedSlug')}
                    <input
                      readOnly
                      value={slugify(draft.name)}
                      placeholder="category-name"
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 outline-none"
                    />
                  </label>
                </div>
                <label className="block text-sm font-medium text-slate-700">
                  {t('common.description')}
                  <textarea
                    rows="3"
                    value={draft.description}
                    onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                    className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  {t('common.imageUrl')}
                  <input
                    type="text"
                    value={draft.image.startsWith('data:') ? '' : draft.image}
                    onChange={(event) => {
                      setLocalPreview('')
                      setDraft((current) => ({ ...current, image: event.target.value }))
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]"
                  />
                </label>
                <label className="block max-w-[200px] text-sm font-medium text-slate-700">
                  {t('products.displayOrder')}
                  <input
                    required
                    min="1"
                    step="1"
                    type="number"
                    value={draft.order}
                    onChange={(event) => setDraft((current) => ({ ...current, order: event.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]"
                  />
                </label>
                <div className="flex flex-wrap gap-5 pt-1">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(draft.active)}
                      onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))}
                      className="h-4 w-4 accent-[#1E8E3E]"
                    />
                    {t('products.activeOnStorefront')}
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(draft.featured)}
                      onChange={(event) => setDraft((current) => ({ ...current, featured: event.target.checked }))}
                      className="h-4 w-4 accent-[#F04E00]"
                    />
                    {t('products.featuredCategory')}
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-[#0B4B8C]/30 px-4 py-2.5 text-sm font-semibold text-[#0B4B8C] transition hover:bg-[#0B4B8C] hover:text-white"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-[#1E8E3E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0E532B]"
              >
                <Check aria-hidden="true" size={16} />
                {editingCategory ? t('saveChanges') : t('products.addCategory')}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title={`${t('common.delete')} ${t('shop.category')}?`} onClose={() => setDeleteTarget(null)} size="max-w-md">
          <p className="text-sm leading-6 text-slate-600">
            {t('products.removeCategoryConfirmation')}
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-lg bg-[#F04E00] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#C54100]"
            >
              {t('products.deleteCategory')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Categories
