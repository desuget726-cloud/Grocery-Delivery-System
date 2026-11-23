import {
  ArrowDownUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Minus,
  Package,
  Pencil,
  Plus,
  Search,
  ShoppingBasket,
  Star,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AdminPageHeader, Modal } from '../../components/admin/AdminUI.jsx'
import { categories as categoryOptions } from '../../data/mockData.js'
import usePersistentState from '../../hooks/usePersistentState.js'

const initialProducts = [
  { id: 'gds-frt-01', name: 'Red Apples', sku: 'GDS-FRT-01', category: 'Fruits & Vegetables', unit: '1 kg', price: 185, compareAtPrice: 220, stock: 32, lowStockThreshold: 8, image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=85', description: 'Crisp, sweet red apples selected fresh from the orchard.', active: true, featured: true },
  { id: 'gds-fvt-02', name: 'Ripe Avocados', sku: 'GDS-FRT-02', category: 'Fruits & Vegetables', unit: '500 g', price: 120, stock: 4, lowStockThreshold: 8, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=85', description: 'Creamy, perfectly ripe avocados, ready to enjoy.', active: true, featured: false },
  { id: 'gds-fvt-03', name: 'Fresh Tomatoes', sku: 'GDS-FRT-03', category: 'Fruits & Vegetables', unit: '1 kg', price: 95, stock: 24, lowStockThreshold: 8, image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=800&q=85', description: 'Juicy, vine-ripened tomatoes for everyday cooking.', active: true, featured: false },
  { id: 'gds-dry-01', name: 'Whole Milk', sku: 'GDS-DRY-01', category: 'Dairy & Eggs', unit: '1 Liter', price: 110, stock: 18, lowStockThreshold: 6, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=85', description: 'Fresh, rich whole milk from local dairy farms.', active: true, featured: true },
  { id: 'gds-dry-02', name: 'Farm Fresh Eggs', sku: 'GDS-DRY-02', category: 'Dairy & Eggs', unit: '12 pcs', price: 165, compareAtPrice: 190, stock: 0, lowStockThreshold: 6, image: 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?auto=format&fit=crop&w=800&q=85', description: 'A dozen farm-fresh eggs, packed with care.', active: false, featured: false },
  { id: 'gds-bak-01', name: 'Traditional Bread', sku: 'GDS-BAK-01', category: 'Bakery', unit: '1 Loaf', price: 75, stock: 14, lowStockThreshold: 5, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=85', description: 'Soft, freshly baked bread with a golden crust.', active: true, featured: false },
  { id: 'gds-pan-01', name: 'Long Grain Rice', sku: 'GDS-PAN-01', category: 'Pantry', unit: '2 kg', price: 260, stock: 9, lowStockThreshold: 5, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=85', description: 'Light, fluffy long-grain rice for the family table.', active: true, featured: false },
  { id: 'gds-pan-02', name: 'Arabica Coffee', sku: 'GDS-PAN-02', category: 'Pantry', unit: '500 g', price: 480, compareAtPrice: 550, stock: 6, lowStockThreshold: 5, image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=800&q=85', description: 'Aromatic, freshly roasted Arabica coffee beans.', active: true, featured: true },
  { id: 'gds-fvt-04', name: 'Yellow Bananas', sku: 'GDS-FRT-04', category: 'Fruits & Vegetables', unit: '1 kg', price: 85, stock: 42, lowStockThreshold: 8, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=85', description: 'Naturally sweet bananas, a perfect everyday snack.', active: true, featured: false },
  { id: 'gds-fvt-05', name: 'Russet Potatoes', sku: 'GDS-FRT-05', category: 'Fruits & Vegetables', unit: '1 kg', price: 70, stock: 2, lowStockThreshold: 8, image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=85', description: 'Versatile, hearty potatoes for roasting, mashing, and more.', active: true, featured: false },
]

const emptyProduct = {
  name: '',
  sku: '',
  category: categoryOptions[0],
  unit: '1 kg',
  regularPrice: '',
  price: '',
  compareAtPrice: '',
  stock: '',
  lowStockThreshold: '5',
  image: '',
  description: '',
  active: true,
  featured: false,
}

const statusFor = (product) =>
  product.stock <= 0
    ? 'Out of Stock'
    : product.stock <= (Number(product.lowStockThreshold) || 5)
      ? 'Low Stock'
      : 'In Stock'

const money = (value) => `${Number(value || 0).toFixed(2)} ETB`

function ProductImage({ src, name, className = '' }) {
  const [failedSrc, setFailedSrc] = useState('')

  if (!src || failedSrc === src) {
    return (
      <div className={`flex items-center justify-center bg-[#F0F7F1] text-[#1E8E3E] ${className}`}>
        <ImageIcon aria-hidden="true" size={24} />
      </div>
    )
  }
  return <img src={src} alt={name} onError={() => setFailedSrc(src)} className={className} />
}

function Products() {
  const [products, setProducts] = usePersistentState('admin-products', initialProducts)
  const [managedCategories] = usePersistentState(
    'admin-categories',
    () => categoryOptions.map((name, index) => ({ id: `category-${index + 1}`, name })),
  )
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [stockFilter, setStockFilter] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [view, setView] = useState('table')
  const [selectedIds, setSelectedIds] = useState([])
  const [page, setPage] = useState(1)
  const [editingProduct, setEditingProduct] = useState(null)
  const [draft, setDraft] = useState(emptyProduct)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [localPreview, setLocalPreview] = useState('')

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview)
    }
  }, [localPreview])

  const categories = useMemo(
    () => [...new Set([...managedCategories.map((category) => category.name), ...products.map((product) => product.category)])],
    [managedCategories, products],
  )
  const counts = useMemo(() => ({
    total: products.length,
    inStock: products.filter((product) => statusFor(product) === 'In Stock').length,
    low: products.filter((product) => statusFor(product) === 'Low Stock').length,
    out: products.filter((product) => statusFor(product) === 'Out of Stock').length,
  }), [products])
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    const results = products.filter((product) => {
      const matchesSearch = `${product.name} ${product.sku || ''} ${product.category}`.toLowerCase().includes(query)
      const matchesCategory = categoryFilter === 'All categories' || product.category === categoryFilter
      const matchesStock = stockFilter === 'All' || statusFor(product) === stockFilter
      return matchesSearch && matchesCategory && matchesStock
    })
    return [...results].sort((a, b) => {
      if (sortBy === 'price') return Number(a.price) - Number(b.price)
      if (sortBy === 'stock') return Number(a.stock) - Number(b.stock)
      return a.name.localeCompare(b.name)
    })
  }, [categoryFilter, products, search, sortBy, stockFilter])
  const pageSize = 8
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const pageProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize)
  const visibleSelected = pageProducts.length > 0 && pageProducts.every((product) => selectedIds.includes(product.id))

  const updateProduct = (id, changes) => {
    setProducts((current) => current.map((product) => (product.id === id ? { ...product, ...changes } : product)))
  }
  const openAddModal = () => {
    setEditingProduct(null)
    setDraft({ ...emptyProduct, sku: `GDS-${Date.now().toString().slice(-6)}` })
    setLocalPreview('')
    setProductModalOpen(true)
  }
  const openEditModal = (product) => {
    setEditingProduct(product)
    setDraft({
      ...emptyProduct,
      ...product,
      regularPrice: String(product.compareAtPrice || product.price || ''),
      price: product.compareAtPrice ? String(product.price ?? '') : '',
      compareAtPrice: '',
      stock: String(product.stock ?? ''),
      lowStockThreshold: String(product.lowStockThreshold ?? 5),
    })
    setLocalPreview('')
    setProductModalOpen(true)
  }
  const closeProductModal = () => {
    setProductModalOpen(false)
    setLocalPreview('')
  }
  const handleSaveProduct = (event) => {
    event.preventDefault()
    const regularPrice = Number(draft.regularPrice || draft.price)
    const salePrice = Number(draft.price)
    const hasSale = Boolean(draft.price) && salePrice < regularPrice
    const product = {
      ...draft,
      id: editingProduct?.id || `product-${Date.now()}`,
      name: draft.name.trim(),
      sku: draft.sku.trim(),
      price: hasSale ? salePrice : regularPrice,
      compareAtPrice: hasSale ? regularPrice : null,
      stock: Math.max(0, Number(draft.stock)),
      lowStockThreshold: Math.max(0, Number(draft.lowStockThreshold)),
    }
    setProducts((current) => editingProduct
      ? current.map((item) => (item.id === editingProduct.id ? product : item))
      : [product, ...current])
    closeProductModal()
  }
  const toggleSelection = (id) => setSelectedIds((current) => (
    current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]
  ))
  const selectVisible = () => setSelectedIds((current) => (
    visibleSelected
      ? current.filter((id) => !pageProducts.some((product) => product.id === id))
      : [...new Set([...current, ...pageProducts.map((product) => product.id)])]
  ))
  const deleteSelected = () => {
    setProducts((current) => current.filter((product) => !selectedIds.includes(product.id)))
    setSelectedIds([])
    setPage(1)
  }
  const exportCsv = () => {
    const columns = ['SKU', 'Name', 'Category', 'Unit', 'Price ETB', 'Sale Price ETB', 'Stock', 'Status', 'Active']
    const rows = filteredProducts.map((product) => [
      product.sku, product.name, product.category, product.unit, product.price,
      product.compareAtPrice || '', product.stock, statusFor(product), product.active ? 'Yes' : 'No',
    ])
    const csv = [columns, ...rows].map((row) => row.map((field) => `"${String(field ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'grocery-products.csv'
    link.click()
    URL.revokeObjectURL(url)
  }
  const duplicateProduct = (product) => {
    setProducts((current) => [{ ...product, id: `product-${Date.now()}`, name: `${product.name} (copy)`, sku: `${product.sku}-COPY` }, ...current])
  }
  const adjustStock = (product, amount) => updateProduct(product.id, { stock: Math.max(0, Number(product.stock) + amount) })
  const setStatusFilter = (status) => {
    setStockFilter(status)
    setPage(1)
  }

  const renderStock = (product, compact = false) => {
    const status = statusFor(product)
    const color = status === 'In Stock' ? 'bg-[#1E8E3E]' : status === 'Low Stock' ? 'bg-amber-500' : 'bg-rose-500'
    const width = product.stock <= 0 ? 0 : Math.min(100, Math.max(8, (Number(product.stock) / Math.max(12, Number(product.lowStockThreshold) * 3)) * 100))
    return (
      <div className={compact ? '' : 'min-w-[136px]'}>
        <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-800">{product.stock} <span className="font-normal text-slate-500">units</span></span>
          {!compact && (
            <div className="flex items-center gap-1">
              <button type="button" aria-label={`Decrease ${product.name} stock`} onClick={() => adjustStock(product, -1)} className="rounded-md border border-slate-200 p-1 text-slate-500 hover:bg-slate-50"><Minus size={12} /></button>
              <button type="button" aria-label={`Increase ${product.name} stock`} onClick={() => adjustStock(product, 1)} className="rounded-md border border-slate-200 p-1 text-slate-500 hover:bg-slate-50"><Plus size={12} /></button>
            </div>
          )}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
        </div>
      </div>
    )
  }

  const renderActions = (product, compact = false) => (
    <div className={`flex items-center ${compact ? 'gap-1' : 'justify-end gap-0.5'}`}>
      <button type="button" aria-label={`Edit ${product.name}`} onClick={() => openEditModal(product)} className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-[#0E532B]"><Pencil size={16} /></button>
      {!compact && <button type="button" aria-label={`Duplicate ${product.name}`} onClick={() => duplicateProduct(product)} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"><Copy size={16} /></button>}
      <button type="button" aria-label={`Delete ${product.name}`} onClick={() => setDeleteTarget(product)} className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
    </div>
  )

  return (
    <div className="mx-auto max-w-[1600px]">
      <AdminPageHeader
        title="Products"
        description="Manage your grocery catalog, pricing, discounts, and live inventory"
        action={
          <div className="flex items-center gap-2">
            <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
              <Download size={16} /> <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button type="button" onClick={openAddModal} className="inline-flex items-center gap-2 rounded-xl bg-[#1E8E3E] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0E532B]">
              <Plus size={17} /> Add Product
            </button>
          </div>
        }
      />

      <section aria-label="Product statistics" className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Products', value: counts.total, icon: ShoppingBasket, tone: 'bg-[#F0F7F1] text-[#0E532B]' },
          { label: 'In Stock', value: counts.inStock, icon: Package, tone: 'bg-emerald-50 text-emerald-700' },
          { label: 'Low Stock Alert', value: counts.low, icon: ArrowDownUp, tone: 'bg-amber-50 text-amber-700', filter: 'Low Stock' },
          { label: 'Out of Stock', value: counts.out, icon: X, tone: 'bg-rose-50 text-rose-700', filter: 'Out of Stock' },
        ].map(({ label, value, icon: Icon, tone, filter }) => {
          const Card = filter ? 'button' : 'article'
          return (
            <Card key={label} type={filter ? 'button' : undefined} onClick={filter ? () => setStatusFilter(stockFilter === filter ? 'All' : filter) : undefined} className={`flex w-full items-center justify-between rounded-2xl border bg-white p-4 text-left shadow-sm transition sm:p-5 ${filter ? 'border-slate-200 hover:border-slate-300 hover:shadow' : 'border-slate-200'}`}>
              <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</p></div>
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon size={20} /></span>
            </Card>
          )
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <label className="relative min-w-0 flex-1">
              <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search by product name, SKU, or category..." aria-label="Search products by name, SKU, or category" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#1E8E3E] focus:bg-white" />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <select aria-label="Filter by category" value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setPage(1) }} className="min-w-[155px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#1E8E3E]">
                <option>All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}
              </select>
              <select aria-label="Sort products" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="min-w-[150px] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#1E8E3E]">
                <option value="name">Name A-Z</option><option value="price">Price: Low-High</option><option value="stock">Stock: Low-High</option>
              </select>
              <div role="group" aria-label="Product view" className="flex rounded-xl border border-slate-200 p-1">
                <button type="button" aria-label="Table View" aria-pressed={view === 'table'} onClick={() => setView('table')} className={`rounded-lg p-2 ${view === 'table' ? 'bg-[#F0F7F1] text-[#0E532B]' : 'text-slate-500 hover:bg-slate-50'}`}><List size={17} /></button>
                <button type="button" aria-label="Grid View" aria-pressed={view === 'grid'} onClick={() => setView('grid')} className={`rounded-lg p-2 ${view === 'grid' ? 'bg-[#F0F7F1] text-[#0E532B]' : 'text-slate-500 hover:bg-slate-50'}`}><LayoutGrid size={17} /></button>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div role="group" aria-label="Filter by stock status" className="flex flex-wrap gap-1.5">
              {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((status) => (
                <button key={status} type="button" onClick={() => setStatusFilter(status)} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${stockFilter === status ? 'bg-[#0E532B] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{status}</button>
              ))}
            </div>
            <span className="text-xs font-medium text-slate-500">{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found</span>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-col gap-3 border-b border-emerald-100 bg-[#F0F7F1] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm font-semibold text-[#0E532B]">{selectedIds.length} selected</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={deleteSelected} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"><Trash2 size={14} /> Delete Selected</button>
              <button type="button" onClick={() => { setProducts((current) => current.map((product) => selectedIds.includes(product.id) ? { ...product, stock: 0, active: false } : product)); setSelectedIds([]) }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Mark Out of Stock</button>
              <button type="button" aria-label="Clear selection" onClick={() => setSelectedIds([])} className="rounded-lg p-2 text-slate-500 hover:bg-white"><X size={15} /></button>
            </div>
          </div>
        )}

        {view === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="w-12 px-4 py-3.5"><input type="checkbox" aria-label="Select all visible products" checked={visibleSelected} onChange={selectVisible} className="h-4 w-4 rounded border-slate-300 accent-[#1E8E3E]" /></th>
                  <th className="px-3 py-3.5 font-semibold">Product</th><th className="px-4 py-3.5 font-semibold">Category</th><th className="px-4 py-3.5 font-semibold">Price</th><th className="px-4 py-3.5 font-semibold">Stock</th><th className="px-4 py-3.5 font-semibold">Status</th><th className="px-4 py-3.5 font-semibold">Active</th><th className="px-4 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageProducts.map((product) => {
                  const status = statusFor(product)
                  const statusTone = status === 'In Stock' ? 'bg-emerald-50 text-emerald-700' : status === 'Low Stock' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                  return (
                    <tr key={product.id} className="transition hover:bg-slate-50/70">
                      <td className="px-4 py-3.5"><input type="checkbox" aria-label={`Select ${product.name}`} checked={selectedIds.includes(product.id)} onChange={() => toggleSelection(product.id)} className="h-4 w-4 rounded border-slate-300 accent-[#1E8E3E]" /></td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-3">
                          <ProductImage src={product.image} name={product.name} className="h-12 w-12 shrink-0 rounded-xl object-cover shadow-sm" />
                          <div className="min-w-0"><p className="truncate font-semibold text-slate-900">{product.name}</p><p className="mt-0.5 text-xs text-slate-500">{product.sku} <span className="mx-1 text-slate-300">·</span>{product.unit}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><span className="inline-flex max-w-[170px] rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{product.category}</span></td>
                      <td className="px-4 py-3.5"><div className="whitespace-nowrap font-semibold text-slate-900">{money(product.price)}</div>{product.compareAtPrice > product.price && <div className="mt-1 flex items-center gap-1.5 whitespace-nowrap"><span className="text-xs text-slate-400 line-through">{money(product.compareAtPrice)}</span><span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-[#F04E00]">Sale</span></div>}</td>
                      <td className="px-4 py-3.5">{renderStock(product)}</td>
                      <td className="px-4 py-3.5"><span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone}`}>{status}</span></td>
                      <td className="px-4 py-3.5"><button type="button" role="switch" aria-checked={Boolean(product.active)} aria-label={`${product.active ? 'Deactivate' : 'Activate'} ${product.name}`} onClick={() => updateProduct(product.id, { active: !product.active })} className={`relative h-6 w-11 rounded-full transition ${product.active ? 'bg-[#1E8E3E]' : 'bg-slate-300'}`}><span className={`absolute top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-all ${product.active ? 'left-[22px]' : 'left-0.5'}`}>{product.active && <Check size={11} className="text-[#1E8E3E]" />}</span></button></td>
                      <td className="px-4 py-3.5">{renderActions(product)}</td>
                    </tr>
                  )
                })}
                {pageProducts.length === 0 && <tr><td colSpan="8" className="px-5 py-14 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><ShoppingBasket size={22} /></div><p className="mt-3 font-semibold text-slate-800">No products found</p><p className="mt-1 text-sm text-slate-500">Try changing your search or filters.</p></td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
            {pageProducts.map((product) => {
              const status = statusFor(product)
              const tone = status === 'In Stock' ? 'text-emerald-700' : status === 'Low Stock' ? 'text-amber-700' : 'text-rose-700'
              return (
                <article key={product.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="relative h-48 bg-slate-50">
                    <ProductImage src={product.image} name={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                    {product.compareAtPrice > product.price && <span className="absolute left-3 top-3 rounded-full bg-[#F04E00] px-2.5 py-1 text-xs font-bold text-white">Sale</span>}
                    <button type="button" aria-label={`${product.featured ? 'Remove' : 'Mark'} ${product.name} ${product.featured ? 'from' : 'as'} featured`} onClick={() => updateProduct(product.id, { featured: !product.featured })} className={`absolute right-3 top-3 rounded-full bg-white/95 p-2 shadow-sm ${product.featured ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}><Star size={16} fill={product.featured ? 'currentColor' : 'none'} /></button>
                  </div>
                  <div className="p-4">
                    <span className="rounded-full bg-[#F0F7F1] px-2.5 py-1 text-[11px] font-semibold text-[#0E532B]">{product.category}</span>
                    <div className="mt-3 flex items-start justify-between gap-2">
                      <div><h3 className="font-semibold text-slate-900">{product.name}</h3><p className="mt-1 text-xs text-slate-500">{product.sku} · {product.unit}</p></div>
                      <button type="button" aria-label={`${product.featured ? 'Unfeature' : 'Feature'} ${product.name}`} onClick={() => updateProduct(product.id, { featured: !product.featured })} className="hidden"><Star size={14} /></button>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2"><span className="font-bold text-slate-900">{money(product.price)}</span>{product.compareAtPrice > product.price && <span className="text-xs text-slate-400 line-through">{money(product.compareAtPrice)}</span>}</div>
                    <div className="mt-4">{renderStock(product, true)}<p className={`mt-1.5 text-xs font-semibold ${tone}`}>{status}</p></div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">{renderActions(product, true)}<button type="button" role="switch" aria-checked={Boolean(product.active)} aria-label={`${product.active ? 'Deactivate' : 'Activate'} ${product.name}`} onClick={() => updateProduct(product.id, { active: !product.active })} className={`relative h-5 w-9 rounded-full transition ${product.active ? 'bg-[#1E8E3E]' : 'bg-slate-300'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${product.active ? 'left-[18px]' : 'left-0.5'}`} /></button></div>
                  </div>
                </article>
              )
            })}
            {pageProducts.length === 0 && <div className="col-span-full py-14 text-center text-sm text-slate-500">No products match your search or filters.</div>}
          </div>
        )}

        <footer className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="text-xs text-slate-500">Showing {filteredProducts.length === 0 ? 0 : (page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredProducts.length)} of {filteredProducts.length} products</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={15} /> Previous</button>
            <span className="px-1 text-xs text-slate-500">Page {page} of {pageCount}</span>
            <button type="button" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight size={15} /></button>
          </div>
        </footer>
      </section>

      {productModalOpen && (
        <Modal title={editingProduct ? 'Edit product' : 'Add product'} onClose={closeProductModal} size="max-w-3xl">
          <form onSubmit={handleSaveProduct} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-[200px_1fr]">
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">Product image</p>
                <ProductImage src={localPreview || draft.image} name={draft.name || 'Product preview'} className="h-40 w-full rounded-xl object-cover" />
                <label className="mt-2 block cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-600 hover:bg-slate-50">
                  Upload image
                  <input type="file" accept="image/*" className="sr-only" onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    if (localPreview) URL.revokeObjectURL(localPreview)
                    setLocalPreview(URL.createObjectURL(file))
                    const reader = new FileReader()
                    reader.onload = () => setDraft((current) => ({ ...current, image: String(reader.result || '') }))
                    reader.onerror = () => console.error('Unable to preview the selected product image.')
                    reader.readAsDataURL(file)
                  }} />
                </label>
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Image URL
                  <input type="url" value={draft.image.startsWith('data:') ? '' : draft.image} onChange={(event) => { setLocalPreview(''); setDraft((current) => ({ ...current, image: event.target.value })) }} placeholder="https://..." className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]" />
                </label>
                <label className="block text-sm font-medium text-slate-700">Product name
                  <input required value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]" />
                </label>
                <label className="block text-sm font-medium text-slate-700">SKU
                  <input required value={draft.sku} onChange={(event) => setDraft((current) => ({ ...current, sku: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]" />
                </label>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-medium text-slate-700">Category
                <select value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]">{categories.map((category) => <option key={category}>{category}</option>)}</select>
              </label>
              <label className="text-sm font-medium text-slate-700">Unit
                <select value={draft.unit} onChange={(event) => setDraft((current) => ({ ...current, unit: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]">{['1 kg', '500 g', '1 Liter', 'Pack', 'Dozen', '12 pcs', '1 Loaf'].map((unit) => <option key={unit}>{unit}</option>)}</select>
              </label>
              <label className="text-sm font-medium text-slate-700">Regular price <span className="text-slate-400">(ETB)</span>
                <input required min="0" step="0.01" type="number" value={draft.regularPrice} onChange={(event) => setDraft((current) => ({ ...current, regularPrice: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]" />
              </label>
              <label className="text-sm font-medium text-slate-700">Sale price <span className="text-slate-400">(ETB, optional)</span>
                <input min="0" step="0.01" type="number" value={draft.price} onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]" />
              </label>
              <label className="text-sm font-medium text-slate-700">Stock quantity
                <input required min="0" step="1" type="number" value={draft.stock} onChange={(event) => setDraft((current) => ({ ...current, stock: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]" />
              </label>
              <label className="text-sm font-medium text-slate-700">Low stock threshold
                <input required min="0" step="1" type="number" value={draft.lowStockThreshold} onChange={(event) => setDraft((current) => ({ ...current, lowStockThreshold: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]" />
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-700">Description
              <textarea rows="3" value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]" />
            </label>
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft((current) => ({ ...current, featured: event.target.checked }))} className="h-4 w-4 accent-[#1E8E3E]" /> Featured product</label>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeProductModal} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="rounded-lg bg-[#1E8E3E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0E532B]">{editingProduct ? 'Save changes' : 'Add product'}</button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete product?" onClose={() => setDeleteTarget(null)} size="max-w-md">
          <p className="text-sm text-slate-600">Delete <span className="font-semibold text-slate-900">{deleteTarget.name}</span> from your catalog? This action cannot be undone.</p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            <button type="button" onClick={() => { setProducts((current) => current.filter((product) => product.id !== deleteTarget.id)); setSelectedIds((current) => current.filter((id) => id !== deleteTarget.id)); setPage(1); setDeleteTarget(null) }} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">Delete product</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Products
