import {
  CalendarDays,
  Check,
  CircleDollarSign,
  Clock3,
  Copy,
  Pencil,
  Plus,
  Search,
  Ticket,
  Trash2,
  UsersRound,
  WandSparkles,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { AdminPageHeader, Modal } from '../../components/admin/AdminUI.jsx'
import usePersistentState from '../../hooks/usePersistentState.js'

const localDateString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const dateOffset = (days) => {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return localDateString(date)
}

const initialCoupons = [
  {
    id: 'coupon-welcome10',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrder: 300,
    usageLimit: 100,
    used: 42,
    startDate: dateOffset(-21),
    expiryDate: dateOffset(28),
    description: 'A warm welcome discount for your first grocery order.',
    active: true,
    discountGiven: 3024,
  },
  {
    id: 'coupon-fresh100',
    code: 'FRESH100',
    discountType: 'fixed',
    discountValue: 100,
    minimumOrder: 800,
    usageLimit: 50,
    used: 18,
    startDate: dateOffset(-14),
    expiryDate: dateOffset(6),
    description: 'Save 100 ETB on a fresh market basket of 800 ETB or more.',
    active: true,
    discountGiven: 1800,
  },
  {
    id: 'coupon-freedel',
    code: 'FREEDEL',
    discountType: 'freeDelivery',
    discountValue: 0,
    minimumOrder: 500,
    usageLimit: 200,
    used: 65,
    startDate: dateOffset(-14),
    expiryDate: dateOffset(25),
    description: 'Enjoy free delivery on orders over 500 ETB.',
    active: true,
    discountGiven: 3250,
  },
  {
    id: 'coupon-weekend15',
    code: 'WEEKEND15',
    discountType: 'percentage',
    discountValue: 15,
    minimumOrder: 600,
    usageLimit: 75,
    used: 34,
    startDate: dateOffset(-28),
    expiryDate: dateOffset(-7),
    description: 'Weekend savings on produce, pantry staples, and more.',
    active: true,
    discountGiven: 2040,
  },
]

const emptyCoupon = {
  code: '',
  discountType: 'percentage',
  discountValue: '',
  minimumOrder: '',
  usageLimit: '',
  startDate: dateOffset(0),
  expiryDate: dateOffset(14),
  description: '',
  active: true,
  used: 0,
  discountGiven: 0,
}

const statusFor = (coupon, today = localDateString(new Date())) => {
  if (coupon.expiryDate < today) return 'Expired'
  if (!coupon.active) return 'Paused'
  if (coupon.startDate > today) return 'Scheduled'
  return 'Active'
}

const discountLabel = (coupon) => {
  if (coupon.discountType === 'freeDelivery') return 'Free Delivery'
  if (coupon.discountType === 'fixed') return `${Number(coupon.discountValue).toLocaleString('en-US')} ETB Off`
  return `${Number(coupon.discountValue)}% Off`
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`))
}

const formatMoney = (amount) =>
  `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(amount) || 0)} ETB`

function UsageMeter({ used, limit }) {
  const safeLimit = Math.max(0, Number(limit) || 0)
  const safeUsed = Math.max(0, Number(used) || 0)
  const percentage = safeLimit ? Math.min(100, (safeUsed / safeLimit) * 100) : 0

  return (
    <div className="min-w-[120px]">
      <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-slate-700">
          {safeUsed} <span className="font-normal text-slate-400">/ {safeLimit || '∞'}</span>
        </span>
        <span className="text-slate-400">{Math.round(percentage)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${percentage >= 90 ? 'bg-[#F04E00]' : 'bg-[#1E8E3E]'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function CouponStatus({ status }) {
  const tones = {
    Active: 'bg-emerald-50 text-[#1E8E3E]',
    Scheduled: 'bg-blue-50 text-blue-700',
    Expired: 'bg-slate-100 text-slate-500',
    Paused: 'bg-amber-50 text-amber-700',
  }

  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tones[status]}`}>
      {status}
    </span>
  )
}

function ActiveSwitch({ coupon, onToggle, compact = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(coupon.active)}
      aria-label={`${coupon.active ? 'Pause' : 'Activate'} ${coupon.code}`}
      onClick={onToggle}
      className={`relative inline-flex shrink-0 items-center rounded-full transition ${compact ? 'h-5 w-9' : 'h-6 w-11'} ${coupon.active ? 'bg-[#1E8E3E]' : 'bg-slate-300'}`}
    >
      <span
        className={`absolute rounded-full bg-white shadow-sm transition-all ${compact ? 'top-0.5 h-4 w-4' : 'top-0.5 h-5 w-5'} ${coupon.active ? (compact ? 'left-[18px]' : 'left-[22px]') : 'left-0.5'}`}
      />
    </button>
  )
}

function Coupons() {
  const [coupons, setCoupons] = usePersistentState('admin-coupons', initialCoupons)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [draft, setDraft] = useState(emptyCoupon)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [copiedCode, setCopiedCode] = useState('')
  const [notice, setNotice] = useState('')
  const [formError, setFormError] = useState('')

  const today = localDateString(new Date())
  const totals = useMemo(() => ({
    active: coupons.filter((coupon) => statusFor(coupon, today) === 'Active').length,
    redemptions: coupons.reduce((sum, coupon) => sum + (Number(coupon.used) || 0), 0),
    discountGiven: coupons.reduce((sum, coupon) => sum + (Number(coupon.discountGiven) || 0), 0),
    expiringSoon: coupons.filter((coupon) => {
      if (statusFor(coupon, today) !== 'Active') return false
      const daysUntilExpiry = Math.ceil(
        (new Date(`${coupon.expiryDate}T12:00:00`) - new Date(`${today}T12:00:00`))
        / (24 * 60 * 60 * 1000),
      )
      return daysUntilExpiry >= 0 && daysUntilExpiry <= 7
    }).length,
  }), [coupons, today])

  const filteredCoupons = useMemo(() => {
    const query = search.trim().toLowerCase()
    return coupons.filter((coupon) => {
      const matchesSearch = `${coupon.code} ${coupon.description} ${discountLabel(coupon)}`
        .toLowerCase()
        .includes(query)
      const matchesStatus = statusFilter === 'All' || statusFor(coupon, today) === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [coupons, search, statusFilter, today])

  const openCreateModal = () => {
    setEditingCoupon(null)
    setDraft({ ...emptyCoupon, startDate: dateOffset(0), expiryDate: dateOffset(14) })
    setFormError('')
    setModalOpen(true)
  }

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon)
    setDraft({ ...emptyCoupon, ...coupon })
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setFormError('')
  }

  const generateCode = () => {
    const baseCode = `FRESH${Date.now().toString().slice(-5)}`
    let code = baseCode
    let suffix = 2
    while (coupons.some((coupon) => coupon.code.toUpperCase() === code)) {
      code = `${baseCode}${suffix}`
      suffix += 1
    }
    setDraft((current) => ({ ...current, code }))
  }

  const handleSave = (event) => {
    event.preventDefault()
    const code = draft.code.trim().toUpperCase()
    if (coupons.some((coupon) => coupon.code.toUpperCase() === code && coupon.id !== editingCoupon?.id)) {
      setFormError('A coupon with this code already exists.')
      return
    }
    if (draft.expiryDate < draft.startDate) {
      setFormError('Expiry date must be on or after the start date.')
      return
    }

    const coupon = {
      ...draft,
      id: editingCoupon?.id || `coupon-${Date.now()}`,
      code,
      discountValue: draft.discountType === 'freeDelivery' ? 0 : Number(draft.discountValue),
      minimumOrder: Number(draft.minimumOrder) || 0,
      usageLimit: Number(draft.usageLimit) || 0,
      used: Number(draft.used) || 0,
      discountGiven: Number(draft.discountGiven) || 0,
    }
    setCoupons((current) =>
      editingCoupon
        ? current.map((item) => item.id === editingCoupon.id ? coupon : item)
        : [coupon, ...current],
    )
    closeModal()
    setEditingCoupon(null)
  }

  const toggleCoupon = (coupon) => {
    setCoupons((current) =>
      current.map((item) => item.id === coupon.id ? { ...item, active: !item.active } : item),
    )
  }

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setNotice(`${code} copied to clipboard.`)
    } catch (error) {
      console.error('Unable to copy the coupon code:', error)
      setNotice(`Could not copy ${code}. Select and copy the code manually.`)
    }
  }

  const confirmDelete = () => {
    setCoupons((current) => current.filter((coupon) => coupon.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const actionButtons = (coupon) => (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        aria-label={`Edit ${coupon.code}`}
        title="Edit coupon"
        onClick={() => openEditModal(coupon)}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-[#0E532B]"
      >
        <Pencil aria-hidden="true" size={16} />
      </button>
      <button
        type="button"
        aria-label={`Delete ${coupon.code}`}
        title="Delete coupon"
        onClick={() => setDeleteTarget(coupon)}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
      >
        <Trash2 aria-hidden="true" size={16} />
      </button>
    </div>
  )

  const couponCode = (coupon) => (
    <div className="inline-flex items-center gap-1.5">
      <span className="rounded-lg border border-dashed border-emerald-200 bg-[#F0F7F1] px-2.5 py-1.5 font-mono text-xs font-bold tracking-wide text-[#0E532B]">
        {coupon.code}
      </span>
      <button
        type="button"
        aria-label={`${copiedCode === coupon.code ? 'Copied' : 'Copy'} ${coupon.code}`}
        title={copiedCode === coupon.code ? 'Copied' : 'Copy code'}
        onClick={() => copyCode(coupon.code)}
        className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-[#0E532B]"
      >
        {copiedCode === coupon.code
          ? <Check aria-hidden="true" size={14} className="text-[#1E8E3E]" />
          : <Copy aria-hidden="true" size={14} />}
      </button>
    </div>
  )

  return (
    <div className="mx-auto max-w-[1600px]">
      <AdminPageHeader
        title="Coupon Codes & Promotions"
        description="Create and track discounts that keep your grocery customers coming back."
        action={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0E532B]"
          >
            <Plus aria-hidden="true" size={17} /> Create Coupon
          </button>
        }
      />

      <section aria-label="Coupon statistics" className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Active Coupons', value: totals.active, icon: Ticket, tone: 'bg-emerald-50 text-[#1E8E3E]' },
          { label: 'Total Redemptions', value: totals.redemptions.toLocaleString('en-US'), icon: UsersRound, tone: 'bg-blue-50 text-blue-700' },
          { label: 'Total Discount Given (ETB)', value: formatMoney(totals.discountGiven), icon: CircleDollarSign, tone: 'bg-orange-50 text-[#F04E00]' },
          { label: 'Expiring Soon', value: totals.expiringSoon, icon: Clock3, tone: 'bg-amber-50 text-amber-700' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-1 truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{value}</p>
            </div>
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
              <Icon aria-hidden="true" size={19} />
            </span>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-4 border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative min-w-0 sm:w-80">
              <Search aria-hidden="true" size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search coupon code or promotion..."
                aria-label="Search coupon codes"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#1E8E3E] focus:bg-white"
              />
            </label>
            <span className="text-xs font-medium text-slate-500">
              {filteredCoupons.length} {filteredCoupons.length === 1 ? 'coupon' : 'coupons'}
            </span>
          </div>
          <div role="group" aria-label="Filter coupons by status" className="flex flex-wrap gap-1.5">
            {['All', 'Active', 'Scheduled', 'Expired', 'Paused'].map((status) => (
              <button
                key={status}
                type="button"
                aria-pressed={statusFilter === status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${statusFilter === status ? 'bg-[#0E532B] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {notice && (
          <div role="status" className="flex items-center justify-between gap-3 border-b border-emerald-100 bg-[#F0F7F1] px-4 py-2.5 text-sm text-[#0E532B] sm:px-5">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice('')} className="text-xs font-semibold underline underline-offset-2">
              Dismiss
            </button>
          </div>
        )}

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[1150px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3.5 font-semibold">Coupon Code</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">Discount</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">Min Order (ETB)</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">Usage</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">Expiry Date</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">Active</th>
                <th scope="col" className="px-4 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCoupons.map((coupon) => {
                const status = statusFor(coupon, today)
                return (
                  <tr key={coupon.id} className="transition hover:bg-slate-50/70">
                    <td className="px-4 py-4">
                      <div>{couponCode(coupon)}</div>
                      <p className="mt-1.5 max-w-[230px] truncate text-xs text-slate-500">{coupon.description}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-800">{discountLabel(coupon)}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">{formatMoney(coupon.minimumOrder)}</td>
                    <td className="px-4 py-4"><UsageMeter used={coupon.used} limit={coupon.usageLimit} /></td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">{formatDate(coupon.expiryDate)}</td>
                    <td className="px-4 py-4"><CouponStatus status={status} /></td>
                    <td className="px-4 py-4">
                      <ActiveSwitch coupon={coupon} onToggle={() => toggleCoupon(coupon)} compact />
                    </td>
                    <td className="px-4 py-4">{actionButtons(coupon)}</td>
                  </tr>
                )
              })}
              {filteredCoupons.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-5 py-14 text-center text-sm text-slate-500">
                    No coupons match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 lg:hidden">
          {filteredCoupons.map((coupon) => {
            const status = statusFor(coupon, today)
            return (
              <article key={coupon.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {couponCode(coupon)}
                    <p className="mt-2 text-sm font-semibold text-slate-900">{discountLabel(coupon)}</p>
                  </div>
                  <CouponStatus status={status} />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{coupon.description}</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400">Minimum order</p>
                    <p className="mt-1 font-semibold text-slate-700">{formatMoney(coupon.minimumOrder)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Expires</p>
                    <p className="mt-1 font-semibold text-slate-700">{formatDate(coupon.expiryDate)}</p>
                  </div>
                </div>
                <div className="mt-3"><UsageMeter used={coupon.used} limit={coupon.usageLimit} /></div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <ActiveSwitch coupon={coupon} onToggle={() => toggleCoupon(coupon)} compact />
                    Active
                  </div>
                  {actionButtons(coupon)}
                </div>
              </article>
            )
          })}
          {filteredCoupons.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              No coupons match your search or filters.
            </div>
          )}
        </div>
      </section>

      {modalOpen && (
        <Modal
          title={editingCoupon ? 'Edit coupon' : 'Create coupon'}
          onClose={closeModal}
          size="max-w-3xl"
        >
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Coupon code
                <div className="mt-1.5 flex gap-2">
                  <input
                    required
                    value={draft.code}
                    onChange={(event) => setDraft((current) => ({
                      ...current,
                      code: event.target.value.toUpperCase().replace(/\s+/g, ''),
                    }))}
                    placeholder="e.g. FRESH20"
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm uppercase outline-none focus:border-[#1E8E3E]"
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-emerald-200 bg-[#F0F7F1] px-3 py-2 text-xs font-semibold text-[#0E532B] transition hover:bg-emerald-100"
                  >
                    <WandSparkles aria-hidden="true" size={14} /> Generate Code
                  </button>
                </div>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Discount type
                <select
                  value={draft.discountType}
                  onChange={(event) => setDraft((current) => ({ ...current, discountType: event.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]"
                >
                  <option value="percentage">Percentage %</option>
                  <option value="fixed">Fixed Amount ETB</option>
                  <option value="freeDelivery">Free Delivery</option>
                </select>
              </label>
              {draft.discountType !== 'freeDelivery' && (
                <label className="block text-sm font-medium text-slate-700">
                  Discount value {draft.discountType === 'percentage' ? '(%)' : '(ETB)'}
                  <input
                    required
                    min="0.01"
                    max={draft.discountType === 'percentage' ? '100' : undefined}
                    step="0.01"
                    type="number"
                    value={draft.discountValue}
                    onChange={(event) => setDraft((current) => ({ ...current, discountValue: event.target.value }))}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]"
                  />
                </label>
              )}
              <label className="block text-sm font-medium text-slate-700">
                Minimum order amount (ETB)
                <input
                  min="0"
                  step="0.01"
                  type="number"
                  value={draft.minimumOrder}
                  onChange={(event) => setDraft((current) => ({ ...current, minimumOrder: event.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Usage limit
                <input
                  required
                  min="1"
                  step="1"
                  type="number"
                  value={draft.usageLimit}
                  onChange={(event) => setDraft((current) => ({ ...current, usageLimit: event.target.value }))}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Start date
                <span className="relative mt-1.5 block">
                  <CalendarDays aria-hidden="true" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type="date"
                    value={draft.startDate}
                    onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1E8E3E]"
                  />
                </span>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Expiry date
                <span className="relative mt-1.5 block">
                  <CalendarDays aria-hidden="true" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type="date"
                    value={draft.expiryDate}
                    onChange={(event) => setDraft((current) => ({ ...current, expiryDate: event.target.value }))}
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#1E8E3E]"
                  />
                </span>
              </label>
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Description
              <textarea
                rows="3"
                value={draft.description}
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                placeholder="What should customers know about this promotion?"
                className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]"
              />
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(draft.active)}
                onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))}
                className="h-4 w-4 accent-[#1E8E3E]"
              />
              Enable coupon
            </label>
            {formError && <p role="alert" className="text-sm font-medium text-rose-600">{formError}</p>}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#1E8E3E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0E532B]"
              >
                {editingCoupon ? 'Save changes' : 'Create coupon'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete coupon?" onClose={() => setDeleteTarget(null)} size="max-w-md">
          <p className="text-sm leading-6 text-slate-600">
            Delete <span className="font-mono font-bold text-slate-900">{deleteTarget.code}</span>?
            This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Delete coupon
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Coupons
