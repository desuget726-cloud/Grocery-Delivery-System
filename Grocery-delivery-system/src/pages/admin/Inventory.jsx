import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowDownUp,
  ArrowUpRight,
  Boxes,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  Download,
  FileSpreadsheet,
  Leaf,
  Package,
  Plus,
  Search,
  TrendingUp,
  X,
} from 'lucide-react'
import { Modal } from '../../components/admin/AdminUI.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { logAuditEvent } from '../../services/auditLog.js'
import { getApiErrorMessage, products as productsApi } from '../../services/api.js'
import formatCurrency from '../../utils/formatCurrency.js'

const initialInventory = [
  {
    id: 'organic-hass-avocados',
    name: 'Organic Hass Avocados',
    sku: 'GDS-INV-01',
    category: 'Fruits & Vegetables',
    unit: 'kg',
    stock: 24,
    capacity: 40,
    minimum: 10,
    unitCost: 550,
    supplier: 'Green Valley Farms',
    expiryDays: 6,
    image: 'photo-1523049673857-eb18f1d7b578',
  },
  {
    id: 'fresh-whole-milk',
    name: 'Fresh Whole Milk',
    sku: 'GDS-INV-02',
    category: 'Dairy & Eggs',
    unit: 'Liters',
    stock: 4,
    capacity: 30,
    minimum: 8,
    unitCost: 115,
    supplier: 'Addis Dairy Co.',
    expiryDays: 2,
    image: 'photo-1563636619-e9143da7973b',
  },
  {
    id: 'red-roma-tomatoes',
    name: 'Red Roma Tomatoes',
    sku: 'GDS-INV-03',
    category: 'Fruits & Vegetables',
    unit: 'kg',
    stock: 0,
    capacity: 50,
    minimum: 12,
    unitCost: 160,
    supplier: 'Green Valley Farms',
    expiryDays: 0,
    image: 'photo-1546094096-0df4bcaaa337',
  },
  {
    id: 'white-teff-flour',
    name: 'White Teff Flour',
    sku: 'GDS-INV-04',
    category: 'Pantry',
    unit: 'kg',
    stock: 65,
    capacity: 100,
    minimum: 20,
    unitCost: 240,
    supplier: 'Highland Grains',
    expiryDays: 90,
    image: 'photo-1586201375761-83865001e31c',
  },
  {
    id: 'free-range-eggs',
    name: 'Free-Range Eggs',
    sku: 'GDS-INV-05',
    category: 'Dairy & Eggs',
    unit: 'Dozen',
    stock: 18,
    capacity: 36,
    minimum: 8,
    unitCost: 240,
    supplier: 'Sunrise Poultry',
    expiryDays: 14,
    image: 'photo-1506976785307-8732e854ad03',
  },
  {
    id: 'artisan-sourdough',
    name: 'Artisan Sourdough Bread',
    sku: 'GDS-INV-06',
    category: 'Bakery',
    unit: 'Loaves',
    stock: 3,
    capacity: 24,
    minimum: 6,
    unitCost: 220,
    supplier: 'Addis Artisan Bakery',
    expiryDays: 1,
    image: 'photo-1585478259715-876acc5be8eb',
  },
  {
    id: 'extra-virgin-olive-oil',
    name: 'Extra Virgin Olive Oil',
    sku: 'GDS-INV-07',
    category: 'Pantry',
    unit: 'Liters',
    stock: 15,
    capacity: 30,
    minimum: 7,
    unitCost: 1500,
    supplier: 'Mediterranean Select',
    expiryDays: 240,
    image: 'photo-1474979266404-7eaacbcd87c5',
  },
  {
    id: 'roasted-coffee-beans',
    name: 'Roasted Coffee Beans',
    sku: 'GDS-INV-08',
    category: 'Pantry',
    unit: 'kg',
    stock: 28,
    capacity: 60,
    minimum: 12,
    unitCost: 2200,
    supplier: 'Yirgacheffe Coffee Co.',
    expiryDays: 180,
    image: 'photo-1559056199-641a0ac8b55e',
  },
  {
    id: 'red-lentils',
    name: 'Red Split Lentils',
    sku: 'GDS-INV-09',
    category: 'Pantry',
    unit: 'kg',
    stock: 45,
    capacity: 80,
    minimum: 15,
    unitCost: 250,
    supplier: 'Highland Grains',
    expiryDays: 120,
    image: 'photo-1515543904379-3d757f8802a1',
  },
  {
    id: 'ethiopian-bananas',
    name: 'Ethiopian Bananas',
    sku: 'GDS-INV-10',
    category: 'Fruits & Vegetables',
    unit: 'kg',
    stock: 32,
    capacity: 60,
    minimum: 14,
    unitCost: 120,
    supplier: 'Green Valley Farms',
    expiryDays: 5,
    image: 'photo-1571771894821-ce9b6c11b08e',
  },
]

const statusFilters = ['All', 'In Stock', 'Low Stock', 'Out of Stock', 'Expiring Soon']
const movementOptions = ['Stock In (+)', 'Damaged/Spoiled (-)', 'Expired (-)']
const money = formatCurrency

function formatMovementTime(timestamp) {
  const elapsedMinutes = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000))
  if (elapsedMinutes === 0) return 'Just now'
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`
  if (elapsedMinutes < 1440) return `${Math.floor(elapsedMinutes / 60)}h ago`
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getStockStatus(item) {
  if (item.stock <= 0) return 'Out of Stock'
  if (item.stock <= item.minimum) return 'Low Stock'
  return 'In Stock'
}

function getFreshness(item) {
  if (item.expiryDays < 0 || item.stock <= 0) return 'Expired/Out'
  if (item.expiryDays <= 3) return 'Expiring Soon'
  return 'Fresh'
}

function Inventory() {
  const { t } = useLanguage()
  const toast = useToast()
  const [inventory, setInventory] = useState(initialInventory)
  const [movements, setMovements] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All categories')
  const [statusFilter, setStatusFilter] = useState('All')
  const [activeTab, setActiveTab] = useState('Stock Levels')
  const [quickAmounts, setQuickAmounts] = useState({})
  const [modalItemId, setModalItemId] = useState(null)
  const [movementType, setMovementType] = useState(movementOptions[0])
  const [movementQuantity, setMovementQuantity] = useState('')
  const [movementNote, setMovementNote] = useState('')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    let active = true
    productsApi.getAll({ includeInactive: 'true' })
      .then((items) => {
        if (!active) return
        setInventory(items.map((item) => ({
          ...item,
          unitCost: Number(item.price) || 0,
          capacity: Number(item.stock) || 0,
          minimum: Number(item.lowStockThreshold) || 0,
          expiryDays: item.expiryDate
            ? Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / 86400000)
            : Number.POSITIVE_INFINITY,
          supplier: item.supplier || '—',
          category: item.category || 'Uncategorized',
        })))
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Could not load inventory.')))
    return () => {
      active = false
    }
  }, [toast])

  const categories = useMemo(
    () => [...new Set(inventory.map((item) => item.category))],
    [inventory],
  )
  const filteredInventory = useMemo(() => {
    const query = search.trim().toLowerCase()
    return inventory.filter((item) => {
      const matchesSearch = `${item.name} ${item.sku} ${item.supplier}`.toLowerCase().includes(query)
      const matchesCategory = category === 'All categories' || item.category === category
      const stockStatus = getStockStatus(item)
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'critical'
          ? stockStatus === 'Out of Stock' || getFreshness(item) === 'Expiring Soon'
          : statusFilter === 'Expiring Soon'
            ? getFreshness(item) === 'Expiring Soon'
            : stockStatus === statusFilter)
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [inventory, search, category, statusFilter])

  const totalStockValue = inventory.reduce((sum, item) => sum + item.stock * item.unitCost, 0)
  const healthyCount = inventory.filter((item) => getStockStatus(item) === 'In Stock').length
  const lowCount = inventory.filter((item) => getStockStatus(item) === 'Low Stock').length
  const criticalCount = inventory.filter(
    (item) => getStockStatus(item) === 'Out of Stock' || getFreshness(item) === 'Expiring Soon',
  ).length
  const selectedItem = inventory.find((item) => item.id === modalItemId)

  const openMovementModal = (itemId = '') => {
    setModalItemId(itemId)
    setMovementType(movementOptions[0])
    setMovementQuantity('')
    setMovementNote('')
    setFormError('')
  }

  const recordMovement = async (itemId, type, quantity, note = '') => {
    const numericQuantity = Number(quantity)
    if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
      return 'Enter a quantity greater than zero.'
    }
    const item = inventory.find((entry) => entry.id === itemId)
    if (!item) return 'Select an inventory item.'
    const isStockIn = type === movementOptions[0]
    if (!isStockIn && numericQuantity > item.stock) {
      return `Only ${item.stock} ${item.unit} are currently available.`
    }

    const change = isStockIn ? numericQuantity : -numericQuantity
    const movementTypes = {
      [movementOptions[0]]: 'RESTOCK',
      [movementOptions[1]]: 'DAMAGED',
      [movementOptions[2]]: 'EXPIRED',
    }
    try {
      const { data } = await productsApi.updateStock(itemId, {
        quantity: change,
        type: movementTypes[type],
        note,
      })
      setInventory((current) => current.map((entry) =>
        entry.id === itemId ? { ...entry, stock: Number(data.product.stock) } : entry,
      ))
    } catch (error) {
      return getApiErrorMessage(error, 'Could not record this stock movement.')
    }
    setMovements((current) => [
      {
        id: `${Date.now()}-${itemId}`,
        itemId,
        itemName: item.name,
        unit: item.unit,
        quantity: numericQuantity,
        type,
        note: note.trim(),
        timestamp: new Date().toISOString(),
        administrator: 'Administrator',
      },
      ...current,
    ])
    logAuditEvent({
      action: type,
      category: 'Administration',
      resource: item.name,
      details: `${numericQuantity} ${item.unit}${note.trim() ? `; ${note.trim()}` : ''}`,
    })
    return ''
  }

  const handleModalSubmit = async (event) => {
    event.preventDefault()
    const error = await recordMovement(modalItemId, movementType, movementQuantity, movementNote)
    if (error) {
      setFormError(error)
      toast.error(error)
      return
    }
    toast.success(movementType === movementOptions[0] ? 'Stock restocked successfully.' : 'Stock spoiled/removed successfully.')
    setModalItemId(null)
  }

  const handleQuickRestock = async (item) => {
    const error = await recordMovement(item.id, movementOptions[0], quickAmounts[item.id])
    if (error) {
      setQuickAmounts((current) => ({ ...current, [`error-${item.id}`]: error }))
      toast.error(error)
      return
    }
    setQuickAmounts((current) => ({ ...current, [item.id]: '', [`error-${item.id}`]: '' }))
    toast.success(`${item.name} restocked successfully.`)
  }

  const exportCsv = () => {
    const headers = ['SKU', 'Product', 'Category', 'Supplier', 'Stock', 'Unit', 'Capacity', 'Minimum', 'Unit Cost (ETB)', 'Stock Value (ETB)', 'Freshness', 'Status']
    const rows = inventory.map((item) => [
      item.sku,
      item.name,
      item.category,
      item.supplier,
      item.stock,
      item.unit,
      item.capacity,
      item.minimum,
      item.unitCost,
      item.stock * item.unitCost,
      getFreshness(item),
      getStockStatus(item),
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'grocery-warehouse-stock.csv'
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Inventory report exported successfully.')
  }

  return (
    <div className="mx-auto max-w-[1600px]">
      <header className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1E8E3E]">
            <span className="h-2 w-2 rounded-full bg-[#1E8E3E]" />
            <span className="text-[#0E532B]">GROCERY</span>{' '}
            <span className="text-[#F04E00]">DELIVERY</span>{' '}
            <span className="text-slate-300">/</span> WAREHOUSE
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0E532B] sm:text-[30px]">
            {t('inventoryManagement')}
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500">
            {t('inventory.inventoryDescription')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#0B4B8C]/30 bg-white px-4 text-sm font-semibold text-[#0B4B8C] shadow-sm transition hover:bg-[#0B4B8C] hover:text-white"
          >
            <Download size={17} /> {t('inventory.exportStockCsv')}
          </button>
          <button
            type="button"
            onClick={() => openMovementModal()}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1E8E3E] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0E532B]"
          >
            <Plus size={18} strokeWidth={2.5} /> {t('recordStockIn')}
          </button>
        </div>
      </header>

      <section aria-label={t('inventory')} className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-500 sm:text-sm">{t('inventory.totalStockValue')}</p>
              <p className="mt-3 text-xl font-bold tracking-tight text-[#0E532B] sm:text-2xl">{money(totalStockValue)}</p>
              <p className="mt-1.5 text-xs text-slate-500">{inventory.length} {t('inventory.warehouseItems')}</p>
            </div>
            <span className="rounded-xl bg-[#EAF5EC] p-2.5 text-[#1E8E3E]"><TrendingUp size={19} /></span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-[#1E8E3E]">
            <ArrowUpRight size={14} /> {t('inventory.inventoryAtUnitCost')}
          </div>
        </article>
        <article className="rounded-2xl border border-[#DDEEE0] bg-[#F0F7F1] p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-[#0E532B] sm:text-sm">{t('inventory.healthyStock')}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[#0E532B]">{healthyCount}</p>
              <p className="mt-1.5 text-xs text-[#477153]">{t('inventory.itemsAboveReorderPoint')}</p>
            </div>
            <span className="rounded-xl bg-white/80 p-2.5 text-[#1E8E3E]"><Package size={19} /></span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-[#1E8E3E]">
            <Check size={14} /> {t('In Stock')}
          </div>
        </article>
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'Low Stock' ? 'All' : 'Low Stock')}
          className={`rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition sm:p-5 ${statusFilter === 'Low Stock' ? 'ring-2 ring-[#F04E00]/20' : 'hover:border-orange-200'}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-[#F04E00] sm:text-sm">{t('inventory.lowStockAlerts')}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[#0E532B]">{lowCount}</p>
              <p className="mt-1.5 text-xs text-slate-500">{t('inventory.atOrBelowReorderPoint')}</p>
            </div>
            <span className="rounded-xl bg-orange-50 p-2.5 text-[#F04E00]"><AlertTriangle size={19} /></span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-[#F04E00]">
            {t('inventory.viewLowStock')} <ArrowUpRight size={14} />
          </div>
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter(statusFilter === 'critical' ? 'All' : 'critical')}
          className={`rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition sm:p-5 ${statusFilter === 'critical' ? 'ring-2 ring-[#F04E00]/20' : 'hover:border-orange-200'}`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-[#B53B05] sm:text-sm">{t('inventory.outOfStockExpiring')}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[#0E532B]">{criticalCount}</p>
              <p className="mt-1.5 text-xs text-slate-500">{t('inventory.needsAttentionToday')}</p>
            </div>
            <span className="rounded-xl bg-white/80 p-2.5 text-[#F04E00]"><CircleAlert size={19} /></span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-[#B53B05]">
            {t('inventory.viewCriticalItems')} <ArrowUpRight size={14} />
          </div>
        </button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
              {['Stock Levels', 'Movement Log'].map((tab) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${activeTab === tab ? 'bg-white text-[#0E532B] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {tab === 'Stock Levels' ? <Boxes size={16} /> : <ArrowDownUp size={16} />}
                  {t(tab === 'Stock Levels' ? 'stockLevels' : 'movementLog')}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-slate-200 px-3 text-slate-400 focus-within:border-[#1E8E3E] sm:w-[330px]">
                <Search size={16} className="shrink-0" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('inventory.searchInventory')}
                  aria-label={t('inventory.searchInventory')}
                  className="min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 sm:text-sm"
                />
              </label>
              <label className="relative flex h-10 items-center rounded-xl border border-slate-200 px-3">
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  aria-label={t('products.filterByCategory')}
                  className="h-full w-full appearance-none bg-transparent pr-6 text-xs font-medium text-slate-600 outline-none sm:text-sm"
                >
                  <option>{t('common.allCategories')}</option>
                  {categories.map((entry) => <option key={entry}>{entry}</option>)}
                </select>
                <ChevronDown size={15} className="pointer-events-none absolute right-3 text-slate-400" />
              </label>
            </div>
          </div>
          {activeTab === 'Stock Levels' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
              {statusFilters.map((filter) => (
                <button
                  type="button"
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${statusFilter === filter ? 'bg-[#1E8E3E] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  {t(filter === 'Expiring Soon' ? 'expiringSoon' : filter)}
                  {filter === 'Low Stock' && <span className="ml-1.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] text-[#F04E00]">{lowCount}</span>}
                </button>
              ))}
              {statusFilter === 'critical' && (
                <button
                  type="button"
                  onClick={() => setStatusFilter('All')}
                  className="shrink-0 rounded-full bg-orange-100 px-3.5 py-1.5 text-xs font-semibold text-[#B53B05]"
                >
                  {t('inventory.critical')} <X size={12} className="ml-1 inline" />
                </button>
              )}
            </div>
          )}
        </div>

        {activeTab === 'Stock Levels' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] text-left">
              <thead className="bg-[#F8FAF8] text-[10px] font-bold uppercase tracking-[0.1em] text-[#0E532B]/75">
                <tr>
                  <th className="px-5 py-3.5">{t('common.product')}</th>
                  <th className="px-4 py-3.5">{t('shop.category')}</th>
                  <th className="px-4 py-3.5">{t('inventory.stockLevel')}</th>
                  <th className="px-4 py-3.5">{t('inventory.freshnessExpiry')}</th>
                  <th className="px-4 py-3.5">{t('inventory.stockValue')}</th>
                  <th className="px-4 py-3.5">{t('status')}</th>
                  <th className="px-4 py-3.5">{t('inventory.quickRestock')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map((item) => {
                  const stockStatus = getStockStatus(item)
                  const freshness = getFreshness(item)
                  const progress = Math.min(100, (item.stock / item.capacity) * 100)
                  const amountError = quickAmounts[`error-${item.id}`]
                  return (
                    <tr key={item.id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=120&h=120&q=80`}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-xl bg-slate-100 object-cover"
                          />
                          <div className="min-w-[190px]">
                            <p className="text-sm font-semibold text-[#0E532B]">{item.name}</p>
                            <p className="mt-0.5 text-[11px] text-slate-400"><span className="text-[#0B4B8C]">{item.sku}</span> <span className="px-1">·</span> {item.supplier}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-slate-600">{item.category}</td>
                      <td className="w-[185px] px-4 py-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-bold text-[#0E532B]">{item.stock}</span>
                          <span className="text-xs text-slate-500">{item.unit}</span>
                          <span className="ml-auto text-[10px] text-slate-400">/ {item.capacity}</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${stockStatus === 'Out of Stock' || stockStatus === 'Low Stock' ? 'bg-[#F04E00]' : 'bg-[#1E8E3E]'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-1.5 text-[10px] text-slate-400">Min: {item.minimum} {item.unit}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${freshness === 'Fresh' ? 'bg-emerald-50 text-[#1E8E3E]' : 'bg-orange-50 text-[#F04E00]'}`}>
                          {freshness === 'Fresh' ? <Leaf size={12} /> : <Clock3 size={12} />}
                          {t(freshness === 'Expired/Out' ? 'inventory.expiredOut' : freshness === 'Expiring Soon' ? 'expiringSoon' : 'Fresh')}
                        </span>
                        <p className="mt-1.5 text-[10px] text-slate-400">
                          {item.expiryDays < 0 ? 'Expired' : item.expiryDays === 0 ? 'Expires today' : item.expiryDays === 1 ? 'Expires tomorrow' : `${freshness === 'Fresh' ? 'Fresh' : 'Expires'} ${item.expiryDays}d`}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="whitespace-nowrap text-sm font-semibold text-[#0E532B]">{money(item.stock * item.unitCost)}</p>
                        <p className="mt-1 whitespace-nowrap text-[10px] text-[#0E532B]">{money(item.unitCost)} / {item.unit}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${stockStatus === 'In Stock' ? 'bg-emerald-50 text-[#1E8E3E]' : 'bg-orange-50 text-[#F04E00]'}`}>
                          {t(stockStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={quickAmounts[item.id] ?? ''}
                            onChange={(event) => setQuickAmounts((current) => ({ ...current, [item.id]: event.target.value, [`error-${item.id}`]: '' }))}
                            aria-label={`Restock quantity for ${item.name}`}
                            placeholder={t('common.qty')}
                            className="h-8 w-[58px] rounded-lg border border-slate-200 px-2 text-xs outline-none focus:border-[#1E8E3E]"
                          />
                          <button
                            type="button"
                            onClick={() => handleQuickRestock(item)}
                            className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#1E8E3E] px-2.5 text-xs font-semibold text-white transition hover:bg-[#0E532B]"
                          >
                            <Plus size={13} /> {t('common.add')}
                          </button>
                          <button
                            type="button"
                            onClick={() => openMovementModal(item.id)}
                            className="h-8 rounded-lg border border-[#0B4B8C]/30 px-2.5 text-xs font-semibold text-[#0B4B8C] transition hover:bg-[#0B4B8C] hover:text-white"
                          >
                            {t('common.adjust')}
                          </button>
                        </div>
                        {amountError && <p role="alert" className="mt-1.5 max-w-[190px] text-[10px] text-[#B53B05]">{amountError}</p>}
                      </td>
                    </tr>
                  )
                })}
                {filteredInventory.length === 0 && (
                  <tr><td colSpan="7" className="px-5 py-16 text-center text-sm text-slate-500">{t('inventory.noInventoryItemsMatch')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-[#0E532B]">{t('inventory.recentStockMovements')}</h2>
                <p className="mt-1 text-xs text-slate-500">{t('inventory.auditTrail')}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{movements.length} {t('inventory.entries')}</span>
            </div>
            {movements.length ? (
              <div className="divide-y divide-slate-100">
                {movements.map((entry) => {
                  const incoming = entry.type === movementOptions[0]
                  return (
                    <div key={entry.id} className="flex items-start gap-3 px-5 py-4">
                      <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${incoming ? 'bg-[#EAF5EC] text-[#1E8E3E]' : 'bg-orange-50 text-[#F04E00]'}`}>
                        {incoming ? <ArrowDownToLine size={17} /> : <AlertTriangle size={17} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800">
                          <span className={incoming ? 'text-[#1E8E3E]' : 'text-[#F04E00]'}>{incoming ? '+' : '-'}{entry.quantity} {entry.unit}</span>
                          {' '}{entry.itemName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {t(entry.type)} <span className="px-1">·</span> {entry.note || `${t(incoming ? 'inventory.restocked' : 'common.adjusted')} ${t('common.by')} ${entry.administrator}`}
                        </p>
                      </div>
                      <time className="shrink-0 pt-1 text-[11px] text-slate-400" dateTime={entry.timestamp}>
                        {formatMovementTime(entry.timestamp)}
                      </time>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="px-5 py-16 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400"><FileSpreadsheet size={22} /></span>
                <p className="mt-3 text-sm font-semibold text-slate-700">{t('inventory.noMovementsRecorded')}</p>
                <p className="mt-1 text-xs text-slate-500">{t('inventory.restocksWillAppear')}</p>
              </div>
            )}
          </div>
        )}
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-[#FCFDFC] px-5 py-3 text-[11px] text-slate-500">
          <span>{activeTab === 'Stock Levels' ? `${t('common.showing')} ${filteredInventory.length} ${t('common.of')} ${inventory.length} ${t('products')}` : t('inventory.warehouseActivityLog')}</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#1E8E3E]" /> {t('inventory.stockDataSavedLocally')}</span>
        </footer>
      </section>

      {modalItemId !== null && (
        <Modal
          title={selectedItem ? t('inventory.adjustInventory') : t('inventory.recordStockMovement')}
          onClose={() => setModalItemId(null)}
        >
          <form onSubmit={handleModalSubmit} className="space-y-4">
            <div>
              <label htmlFor="inventory-item" className="mb-1.5 block text-xs font-semibold text-slate-700">{t('common.product')}</label>
              <select
                id="inventory-item"
                value={modalItemId || ''}
                onChange={(event) => setModalItemId(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#1E8E3E]"
              >
                <option value="">{t('inventory.chooseInventoryItem')}</option>
                {inventory.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.stock} {item.unit})</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="movement-type" className="mb-1.5 block text-xs font-semibold text-slate-700">{t('inventory.movementType')}</label>
              <select
                id="movement-type"
                value={movementType}
                onChange={(event) => setMovementType(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#1E8E3E]"
              >
                {movementOptions.map((option) => <option key={option} value={option}>{t(option)}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="movement-quantity" className="mb-1.5 block text-xs font-semibold text-slate-700">{t('common.quantity')} {selectedItem && <span className="font-normal text-slate-400">({selectedItem.unit})</span>}</label>
              <input
                id="movement-quantity"
                type="number"
                min="0.1"
                step="any"
                value={movementQuantity}
                onChange={(event) => setMovementQuantity(event.target.value)}
                placeholder={t('common.enterQuantity')}
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#1E8E3E]"
              />
            </div>
            <div>
              <label htmlFor="movement-note" className="mb-1.5 block text-xs font-semibold text-slate-700">{t('common.note')} <span className="font-normal text-slate-400">({t('optional')})</span></label>
              <textarea
                id="movement-note"
                value={movementNote}
                onChange={(event) => setMovementNote(event.target.value)}
                rows="3"
                placeholder={t('inventory.movementNotePlaceholder')}
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]"
              />
            </div>
            {formError && <p role="alert" className="text-xs font-medium text-[#B53B05]">{formError}</p>}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setModalItemId(null)} className="h-10 rounded-xl border border-[#0B4B8C]/30 px-4 text-sm font-semibold text-[#0B4B8C] hover:bg-[#0B4B8C] hover:text-white">{t('common.cancel')}</button>
              <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1E8E3E] px-4 text-sm font-semibold text-white hover:bg-[#0E532B]">
                <Check size={16} /> {t('inventory.saveMovement')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default Inventory
