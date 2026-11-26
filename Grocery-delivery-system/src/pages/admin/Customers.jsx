import { useEffect, useMemo, useState } from 'react'
import formatCurrency from '../../utils/formatCurrency.js'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { logAuditEvent } from '../../services/auditLog.js'
import { customers as customersApi, getApiErrorMessage } from '../../services/api.js'
import {
  Award,
  Check,
  Download,
  Eye,
  MapPin,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react'

const initialCustomers = [
  {
    id: 'C-1001',
    name: 'Abebe Kebede',
    email: 'abebe.kebede@email.com',
    phone: '+251 911 234 567',
    area: 'Bole',
    orders: 22,
    spent: 15400,
    lastOrder: '2 days ago',
    tier: 'VIP',
    status: 'Active',
    createdAt: '2024-02-14',
    addresses: ['Bole, near Friendship City Center', 'Bole Atlas'],
    recentOrders: [
      { id: 'GDS-2531', date: 'Nov 22, 2026', amount: 1250, status: 'Delivered' },
      { id: 'GDS-2478', date: 'Nov 19, 2026', amount: 860, status: 'Delivered' },
      { id: 'GDS-2412', date: 'Nov 15, 2026', amount: 1740, status: 'Delivered' },
    ],
  },
  {
    id: 'C-1002',
    name: 'Selam Tesfaye',
    email: 'selam.tesfaye@email.com',
    phone: '+251 912 345 678',
    area: 'Kazanchis',
    orders: 17,
    spent: 10800,
    lastOrder: 'Yesterday',
    tier: 'VIP',
    status: 'Active',
    createdAt: '2024-05-09',
    addresses: ['Kazanchis, Guinea Conakry Street'],
    recentOrders: [
      { id: 'GDS-2530', date: 'Nov 23, 2026', amount: 740, status: 'Processing' },
      { id: 'GDS-2491', date: 'Nov 20, 2026', amount: 1120, status: 'Delivered' },
      { id: 'GDS-2438', date: 'Nov 16, 2026', amount: 950, status: 'Delivered' },
    ],
  },
  {
    id: 'C-1003',
    name: 'Yared Lemma',
    email: 'yared.lemma@email.com',
    phone: '+251 913 456 789',
    area: 'CMC',
    orders: 14,
    spent: 8200,
    lastOrder: '4 days ago',
    tier: 'VIP',
    status: 'Active',
    createdAt: '2024-07-22',
    addresses: ['CMC, around Sunshine Real Estate'],
    recentOrders: [
      { id: 'GDS-2518', date: 'Nov 19, 2026', amount: 980, status: 'Delivered' },
      { id: 'GDS-2463', date: 'Nov 17, 2026', amount: 540, status: 'Delivered' },
      { id: 'GDS-2395', date: 'Nov 11, 2026', amount: 1320, status: 'Delivered' },
    ],
  },
  {
    id: 'C-1004',
    name: 'Hiwot Abera',
    email: 'hiwot.abera@email.com',
    phone: '+251 914 567 890',
    area: 'Sarbet',
    orders: 1,
    spent: 780,
    lastOrder: 'Today',
    tier: 'New',
    status: 'Active',
    createdAt: '2026-11-18',
    addresses: ['Sarbet, Africa Avenue'],
    recentOrders: [
      { id: 'GDS-2529', date: 'Nov 23, 2026', amount: 780, status: 'Processing' },
    ],
  },
  {
    id: 'C-1005',
    name: 'Mesfin Tadesse',
    email: 'mesfin.tadesse@email.com',
    phone: '+251 915 678 901',
    area: 'Piassa',
    orders: 11,
    spent: 6340,
    lastOrder: '1 week ago',
    tier: 'Regular',
    status: 'Active',
    createdAt: '2024-08-03',
    addresses: ['Piassa, near St. George Cathedral'],
    recentOrders: [
      { id: 'GDS-2484', date: 'Nov 16, 2026', amount: 680, status: 'Delivered' },
      { id: 'GDS-2391', date: 'Nov 12, 2026', amount: 925, status: 'Delivered' },
      { id: 'GDS-2314', date: 'Nov 05, 2026', amount: 460, status: 'Delivered' },
    ],
  },
  {
    id: 'C-1006',
    name: 'Tigist Hailu',
    email: 'tigist.hailu@email.com',
    phone: '+251 916 789 012',
    area: 'Bole',
    orders: 8,
    spent: 4200,
    lastOrder: '3 days ago',
    tier: 'Regular',
    status: 'Active',
    createdAt: '2025-01-17',
    addresses: ['Bole, Woreda 03'],
    recentOrders: [
      { id: 'GDS-2522', date: 'Nov 20, 2026', amount: 510, status: 'Delivered' },
      { id: 'GDS-2450', date: 'Nov 14, 2026', amount: 720, status: 'Delivered' },
    ],
  },
  {
    id: 'C-1007',
    name: 'Dawit Bekele',
    email: 'dawit.bekele@email.com',
    phone: '+251 917 890 123',
    area: 'Kazanchis',
    orders: 6,
    spent: 3200,
    lastOrder: '2 weeks ago',
    tier: 'Regular',
    status: 'Suspended',
    createdAt: '2025-03-26',
    addresses: ['Kazanchis, near UNECA'],
    recentOrders: [
      { id: 'GDS-2376', date: 'Nov 09, 2026', amount: 890, status: 'Delivered' },
      { id: 'GDS-2298', date: 'Nov 02, 2026', amount: 420, status: 'Delivered' },
    ],
  },
]

const segments = ['All', 'Active', 'VIP', 'New', 'Suspended']
const avatarColors = [
  'bg-emerald-100 text-[#0E532B]',
  'bg-orange-100 text-[#F04E00]',
  'bg-blue-100 text-[#0B4B8C]',
  'bg-[#F0F7F1] text-[#0E532B]',
  'bg-orange-100 text-[#F04E00]',
  'bg-[#F0F7F1] text-[#0E532B]',
  'bg-emerald-100 text-[#1E8E3E]',
]

const formatEtb = formatCurrency

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function csvCell(value) {
  const text = String(value ?? '')
  const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text
  return `"${safeText.replaceAll('"', '""')}"`
}

function CustomerAvatar({ customer, size = 'h-11 w-11' }) {
  const color = avatarColors[Number(customer.id.split('-').at(-1)) % avatarColors.length]

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full text-sm font-bold ${size} ${color}`}
    >
      {initials(customer.name)}
    </span>
  )
}

function TierBadge({ tier }) {
  const { t } = useLanguage()
  const styles = {
    VIP: 'bg-orange-50 text-[#F04E00]',
    Regular: 'bg-blue-50 text-[#0B4B8C]',
    New: 'bg-emerald-50 text-[#0E532B]',
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[tier]}`}>
      {t(tier)}
    </span>
  )
}

function CustomerModal({ onClose, onAdd }) {
  const { t } = useLanguage()
  const [form, setForm] = useState({ name: '', email: '', phone: '+251 ', area: '', password: '' })
  const update = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const submit = (event) => {
    event.preventDefault()
    onAdd(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <button
        type="button"
        aria-label={t('common.close')}
        className="fixed inset-0 bg-slate-950/50"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-customer-title"
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 id="add-customer-title" className="text-lg font-bold text-[#0E532B]">
              {t('customers.addCustomer')}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{t('customers.createShopperAccount')}</p>
          </div>
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <form noValidate onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">{t('customers.fullName')}</span>
            <input
              required
              autoFocus
              value={form.name}
              onChange={update('name')}
              placeholder="e.g. Hana Girma"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#1E8E3E] focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">Temporary password</span>
            <input
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={update('password')}
              autoComplete="new-password"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#1E8E3E] focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-gray-700">{t('customers.emailAddress')}</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="name@email.com"
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#1E8E3E] focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-700">{t('customers.phoneNumber')}</span>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={update('phone')}
                placeholder="+251 9..."
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#1E8E3E] focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-gray-700">{t('customers.deliveryArea')}</span>
              <select
                required
                value={form.area}
                onChange={update('area')}
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#1E8E3E] focus:ring-2 focus:ring-emerald-100"
              >
                <option value="" disabled>{t('customers.selectArea')}</option>
                <option>Bole</option>
                <option>Kazanchis</option>
                <option>CMC</option>
                <option>Sarbet</option>
                <option>Piassa</option>
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#0B4B8C]/30 px-4 py-2.5 text-sm font-semibold text-[#0B4B8C] transition hover:bg-[#0B4B8C] hover:text-white"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#1E8E3E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0E532B]"
            >
              {t('customers.addCustomer')}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function CustomerDrawer({ customer, onClose, onToggleStatus }) {
  const { t } = useLanguage()
  if (!customer) return null

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label={t('common.close')}
        className="absolute inset-0 bg-slate-950/40"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-drawer-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1E8E3E]">{t('common.customer360')}</p>
            <h2 id="customer-drawer-title" className="mt-1 text-lg font-bold text-[#0E532B]">
              {t('customers.customerProfile')}
            </h2>
          </div>
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          <div className="flex items-center gap-4">
            <CustomerAvatar customer={customer} size="h-16 w-16 text-lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-bold text-[#0E532B]">{customer.name}</h3>
                <TierBadge tier={customer.tier} />
              </div>
              <p className="mt-1 text-sm text-gray-500">{t('customers.customerSince')} {customer.createdAt}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a
              href={`tel:${customer.phone.replaceAll(' ', '')}`}
              className="flex items-center gap-3 rounded-xl border border-gray-100 p-3.5 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-[#1E8E3E]">
                <Phone aria-hidden="true" size={17} />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] text-gray-400">{t('common.phone')}</span>
                <span className="block truncate font-medium">{customer.phone}</span>
              </span>
            </a>
            <a
              href={`mailto:${customer.email}`}
              className="flex items-center gap-3 rounded-xl border border-gray-100 p-3.5 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0B4B8C]">
                <Mail aria-hidden="true" size={17} />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] text-gray-400">{t('common.email')}</span>
                <span className="block truncate font-medium">{customer.email}</span>
              </span>
            </a>
          </div>

          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0E532B]">{t('customers.savedAddresses')}</h3>
              <span className="text-xs text-gray-400">{customer.addresses.length}</span>
            </div>
            <div className="space-y-2">
              {customer.addresses.map((address) => (
                <div key={address} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3.5">
                  <MapPin aria-hidden="true" size={17} className="mt-0.5 shrink-0 text-[#1E8E3E]" />
                  <p className="text-sm text-gray-700">{address}, Addis Ababa</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0E532B]">{t('customers.recentOrders')}</h3>
              <span className="text-xs text-gray-400">{customer.orders} {t('totalOrders')}</span>
            </div>
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
              {customer.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-[#0B4B8C]">{order.id}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#0E532B]">{formatEtb(order.amount)}</p>
                    <p className={`mt-0.5 text-xs ${order.status === 'Delivered' ? 'text-[#1E8E3E]' : 'text-[#0B4B8C]'}`}>
                      {t(order.status)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="flex flex-col gap-3 border-t border-gray-100 p-5 sm:flex-row sm:px-7">
          <a
            href={`mailto:${customer.email}?subject=${encodeURIComponent('A fresh offer from GROCERY DELIVERY')}&body=${encodeURIComponent('Enjoy 10% off your next grocery order with promo code FRESH10.')}`}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-[#0B4B8C]/30 px-4 py-2.5 text-sm font-semibold text-[#0B4B8C] transition hover:bg-[#0B4B8C] hover:text-white"
          >
            {t('common.sendPromoCode')}
          </a>
          <button
            type="button"
            onClick={() => onToggleStatus(customer)}
            className={`inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
              customer.status === 'Active'
                ? 'bg-[#F04E00] hover:bg-[#C54100]'
                : 'bg-[#1E8E3E] hover:bg-[#0E532B]'
            }`}
          >
            {customer.status === 'Active' ? t('common.suspendAccount') : t('common.activateAccount')}
          </button>
        </div>
      </aside>
    </div>
  )
}

function Customers() {
  const { t } = useLanguage()
  const toast = useToast()
  const [customers, setCustomers] = useState(initialCustomers)
  const [search, setSearch] = useState('')
  const [segment, setSegment] = useState('All')
  const [sort, setSort] = useState('spent')
  const [selectedId, setSelectedId] = useState(null)
  const [addModalOpen, setAddModalOpen] = useState(false)

  useEffect(() => {
    let active = true
    customersApi.getAll()
      .then(({ data }) => {
        if (!active) return
        setCustomers((data.users || []).map((customer) => ({
          id: customer.id,
          name: customer.fullName,
          email: customer.email,
          phone: customer.phone || '',
          area: customer.addresses?.[0]?.zone || '',
          orders: 0,
          spent: 0,
          lastOrder: 'No orders yet',
          tier: 'New',
          status: customer.status === 'SUSPENDED' ? 'Suspended' : 'Active',
          createdAt: customer.createdAt,
          addresses: (customer.addresses || []).map((address) => address.street),
          recentOrders: [],
        })))
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Could not load customers.')))
    return () => {
      active = false
    }
  }, [toast])

  const visibleCustomers = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = customers.filter((customer) => {
      const matchesSearch = `${customer.name} ${customer.email} ${customer.phone} ${customer.area}`
        .toLowerCase()
        .includes(query)
      const matchesSegment =
        segment === 'All' ||
        (segment === 'VIP' || segment === 'New'
          ? customer.tier === segment
          : customer.status === segment)
      return matchesSearch && matchesSegment
    })

    return filtered.sort((first, second) => {
      if (sort === 'orders') return second.orders - first.orders
      if (sort === 'newest') return second.createdAt.localeCompare(first.createdAt)
      if (sort === 'name') return first.name.localeCompare(second.name)
      return second.spent - first.spent
    })
  }, [customers, search, segment, sort])

  const selectedCustomer = customers.find((customer) => customer.id === selectedId)
  const totalSpent = customers.reduce((total, customer) => total + customer.spent, 0)
  const vipCount = customers.filter((customer) => customer.tier === 'VIP').length
  const activeCount = customers.filter((customer) => customer.status === 'Active').length

  const toggleStatus = async (customer) => {
    const nextStatus = customer.status === 'Active' ? 'Suspended' : 'Active'
    try {
      await customersApi.update(customer.id, { status: nextStatus.toUpperCase() })
      setCustomers((current) => current.map((item) =>
        item.id === customer.id ? { ...item, status: nextStatus } : item,
      ))
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not update this account.'))
      return
    }
    logAuditEvent({
      action: nextStatus === 'Suspended' ? 'Suspended customer' : 'Activated customer',
      category: 'Administration',
      resource: customer.name,
    })
    toast.success(`${customer.name}'s account ${customer.status === 'Active' ? 'suspended' : 'activated'}.`)
  }

  const addCustomer = async (form) => {
    if (
      !form.name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ||
      !form.phone.trim() ||
      !form.area ||
      form.password.length < 8
    ) {
      toast.error('Enter a valid name, email, phone number, and delivery area.')
      return
    }
    if (customers.some((customer) => customer.email.toLowerCase() === form.email.trim().toLowerCase())) {
      toast.error('A customer with this email already exists.')
      return
    }
    let nextCustomer
    try {
      const { data } = await customersApi.create({
        fullName: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      })
      nextCustomer = {
        id: data.user.id,
        name: data.user.fullName,
        email: data.user.email,
        phone: data.user.phone || '',
        area: form.area,
        orders: 0,
        spent: 0,
        lastOrder: 'No orders yet',
        tier: 'New',
        status: 'Active',
        createdAt: data.user.createdAt,
        addresses: [form.area],
        recentOrders: [],
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not create this customer account.'))
      return
    }
    setCustomers((current) => [nextCustomer, ...current])
    logAuditEvent({
      action: 'Added customer record',
      category: 'Administration',
      resource: nextCustomer.email,
    })
    setAddModalOpen(false)
    toast.success(`${nextCustomer.name} added successfully.`)
  }

  const deleteCustomer = async (customer) => {
    if (!window.confirm(`Delete ${customer.name}'s customer record?`)) return
    try {
      await customersApi.remove(customer.id)
      setCustomers((current) => current.filter((item) => item.id !== customer.id))
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not delete this customer account.'))
      return
    }
    logAuditEvent({
      action: 'Deleted customer record',
      category: 'Administration',
      resource: customer.email,
    })
    if (selectedId === customer.id) setSelectedId(null)
    toast.success(`${customer.name} deleted successfully.`)
  }

  const exportCsv = () => {
    const headers = ['Customer', 'Email', 'Phone', 'Delivery area', 'Orders', 'Total spent (ETB)', 'Last order', 'Tier', 'Status']
    const rows = customers.map((customer) => [
      customer.name,
      customer.email,
      customer.phone,
      `${customer.area}, Addis Ababa`,
      customer.orders,
      customer.spent.toFixed(2),
      customer.lastOrder,
      customer.tier,
      customer.status,
    ])
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'grocery-customers.csv'
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success('Customer list exported successfully.')
  }

  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0E532B] sm:text-3xl">
            {t('customers')}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-gray-500">
            {t('customers.description')}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0B4B8C]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#0B4B8C] shadow-sm transition hover:bg-[#0B4B8C] hover:text-white"
          >
            <Download aria-hidden="true" size={16} />
            {t('common.exportCsv')}
          </button>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0E532B]"
          >
            <Plus aria-hidden="true" size={17} />
            {t('customers.addCustomer')}
          </button>
        </div>
      </header>

      <section aria-label={t('common.customerMetrics')} className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { labelKey: 'totalCustomers', value: customers.length.toLocaleString('en-US'), icon: Users, tone: 'bg-emerald-50 text-[#1E8E3E]' },
          { labelKey: 'activeAccounts', value: activeCount.toLocaleString('en-US'), icon: UserCheck, tone: 'bg-emerald-50 text-[#0E532B]' },
          { labelKey: 'vipRepeatBuyers', value: vipCount.toLocaleString('en-US'), icon: Award, tone: 'bg-orange-50 text-[#F04E00]' },
          { labelKey: 'lifetimeSales', value: formatEtb(totalSpent), icon: Wallet, tone: 'bg-blue-50 text-[#0B4B8C]' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <article key={stat.labelKey} className="flex min-h-[112px] items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 sm:text-sm">{t(stat.labelKey)}</p>
                <p className={`mt-2 truncate font-bold tracking-tight text-[#0E532B] ${stat.labelKey === 'lifetimeSales' ? 'text-lg sm:text-xl' : 'text-2xl'}`}>
                  {stat.value}
                </p>
              </div>
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}>
                <Icon aria-hidden="true" size={21} />
              </span>
            </article>
          )
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="space-y-4 border-b border-gray-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <label className="relative block min-w-0 flex-1 xl:max-w-xl">
              <Search aria-hidden="true" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('customers.searchPlaceholder')}
                aria-label={t('customers.searchPlaceholder')}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1E8E3E] focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-500">
              <span className="shrink-0">{t('common.sortBy')}</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label={t('customers.sortCustomers')}
                className="min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-[#1E8E3E]"
              >
                <option value="spent">{t('customers.highestSpent')}</option>
                <option value="orders">{t('customers.mostOrders')}</option>
                <option value="newest">{t('customers.newestFirst')}</option>
                <option value="name">{t('products.nameAToZ')}</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2" aria-label={t('common.customerSegments')}>
            {segments.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={segment === item}
                onClick={() => setSegment(item)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  segment === item
                    ? 'bg-[#1E8E3E] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t(item)}
                {item === 'All' && <span className="ml-1.5 opacity-70">({customers.length})</span>}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400">
              {visibleCustomers.length} {visibleCustomers.length === 1 ? 'customer' : 'customers'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-gray-50/80 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0E532B]/75">
              <tr>
                <th scope="col" className="px-5 py-3.5">{t('common.customer')}</th>
                <th scope="col" className="px-5 py-3.5">{t('customers.phoneDeliveryArea')}</th>
                <th scope="col" className="px-5 py-3.5">{t('common.totalOrders')}</th>
                <th scope="col" className="px-5 py-3.5">{t('customers.totalSpent')}</th>
                <th scope="col" className="px-5 py-3.5">{t('status')}</th>
                <th scope="col" className="px-5 py-3.5 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleCustomers.map((customer) => (
                <tr key={customer.id} className="transition hover:bg-gray-50/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <CustomerAvatar customer={customer} />
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setSelectedId(customer.id)}
                          className="truncate text-left font-semibold text-[#0E532B] hover:text-[#1E8E3E]"
                        >
                          {customer.name}
                        </button>
                        <div className="mt-1 flex items-center gap-2">
                          <TierBadge tier={customer.tier} />
                          <span className="max-w-[180px] truncate text-xs text-gray-500">{customer.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">{customer.phone}</p>
                    <p className="mt-1 text-xs text-gray-500">{customer.area}, Addis Ababa</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800">
                      {customer.orders} {t(customer.orders === 1 ? 'common.order' : 'orders')}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{t('common.last')}: {customer.lastOrder}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#0E532B]">{formatEtb(customer.spent)}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      customer.status === 'Active' ? 'bg-emerald-50 text-[#1E8E3E]' : 'bg-orange-50 text-[#F04E00]'
                    }`}>
                      <span className={`mr-1.5 mt-1 h-1.5 w-1.5 rounded-full ${
                        customer.status === 'Active' ? 'bg-[#1E8E3E]' : 'bg-[#F04E00]'
                      }`} />
                      {t(customer.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        aria-label={`${t('common.viewDetails')} ${customer.name}`}
                        title={t('common.viewDetails')}
                        onClick={() => setSelectedId(customer.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#0B4B8C]/30 px-2.5 py-2 text-xs font-semibold text-[#0B4B8C] transition hover:bg-[#0B4B8C] hover:text-white"
                      >
                        <Eye aria-hidden="true" size={16} />
                        <span>{t('common.viewDetails')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStatus(customer)}
                        aria-label={`${t(customer.status === 'Active' ? 'common.suspend' : 'common.activate')} ${customer.name}`}
                        title={t(customer.status === 'Active' ? 'common.suspendAccount' : 'common.activateAccount')}
                        className={`rounded-lg p-2 transition ${
                          customer.status === 'Active'
                            ? 'text-orange-600 hover:bg-orange-50'
                            : 'text-[#1E8E3E] hover:bg-emerald-50'
                        }`}
                      >
                        {customer.status === 'Active' ? <X aria-hidden="true" size={17} /> : <Check aria-hidden="true" size={17} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCustomer(customer)}
                        aria-label={`Delete ${customer.name}`}
                        title={t('common.delete')}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-orange-50 hover:text-[#F04E00]"
                      >
                        <Trash2 aria-hidden="true" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleCustomers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-14 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                      <Search aria-hidden="true" size={19} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-gray-700">{t('customers.noCustomersFound')}</p>
                    <p className="mt-1 text-xs text-gray-500">{t('customers.tryAnotherSearchSegment')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3.5 text-xs text-gray-500">
          <span>{t('common.showing')} {visibleCustomers.length} / {customers.length} {t('customers.customers')}</span>
          <span className="hidden sm:inline">{t('customers.allAmountsEtb')}</span>
        </div>
      </section>

      {addModalOpen && <CustomerModal onClose={() => setAddModalOpen(false)} onAdd={addCustomer} />}
      <CustomerDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedId(null)}
        onToggleStatus={toggleStatus}
      />
    </div>
  )
}

export default Customers
