import { useMemo, useState } from 'react'
import {
  Bike,
  CheckCircle,
  ClipboardList,
  Download,
  Eye,
  Mail,
  MapPin,
  Navigation,
  Pencil,
  Phone,
  Plus,
  Search,
  Star,
  Trash2,
  Truck,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import { Modal } from '../../components/admin/AdminUI.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import usePersistentState from '../../hooks/usePersistentState.js'
import formatCurrency from '../../utils/formatCurrency.js'

const zones = ['Bole', 'Kazanchis', 'CMC / Ayat', 'Sarbet', 'Piassa']
const statuses = ['All', 'Available', 'On Delivery', 'Offline']
const vehicleTypes = ['Motorbike', 'Delivery Van', 'Electric Scooter']

const initialFleet = [
  {
    id: 'RDR-01',
    name: 'Dawit Tadesse',
    phone: '+251 911 234 567',
    email: 'dawit.tadesse@grocerydelivery.et',
    vehicle: 'Motorbike',
    plate: 'AA-23451',
    zone: 'Bole',
    activeOrders: 1,
    completed: 142,
    rating: 4.9,
    codHeld: 1240,
    status: 'Available',
    recentDeliveries: [
      { id: 'GDS-2531', area: 'Bole', date: 'Nov 22, 2026', amount: 680 },
      { id: 'GDS-2504', area: 'Bole', date: 'Nov 21, 2026', amount: 1250 },
      { id: 'GDS-2472', area: 'Bole', date: 'Nov 20, 2026', amount: 940 },
    ],
  },
  {
    id: 'RDR-02',
    name: 'Yonas Girma',
    phone: '+251 912 345 678',
    email: 'yonas.girma@grocerydelivery.et',
    vehicle: 'Delivery Van',
    plate: 'AA-78124',
    zone: 'Kazanchis',
    activeOrders: 2,
    completed: 126,
    rating: 4.8,
    codHeld: 860,
    status: 'On Delivery',
    recentDeliveries: [
      { id: 'GDS-2526', area: 'Kazanchis', date: 'Nov 22, 2026', amount: 520 },
      { id: 'GDS-2496', area: 'Piassa', date: 'Nov 21, 2026', amount: 1780 },
      { id: 'GDS-2460', area: 'Kazanchis', date: 'Nov 19, 2026', amount: 610 },
    ],
  },
  {
    id: 'RDR-03',
    name: 'Biniyam Alemu',
    phone: '+251 913 456 789',
    email: 'biniyam.alemu@grocerydelivery.et',
    vehicle: 'Electric Scooter',
    plate: 'AA-59036',
    zone: 'CMC / Ayat',
    activeOrders: 0,
    completed: 98,
    rating: 4.8,
    codHeld: 0,
    status: 'Available',
    recentDeliveries: [
      { id: 'GDS-2517', area: 'CMC', date: 'Nov 22, 2026', amount: 740 },
      { id: 'GDS-2482', area: 'Ayat', date: 'Nov 20, 2026', amount: 560 },
      { id: 'GDS-2441', area: 'CMC', date: 'Nov 18, 2026', amount: 920 },
    ],
  },
  {
    id: 'RDR-04',
    name: 'Henok Solomon',
    phone: '+251 914 567 890',
    email: 'henok.solomon@grocerydelivery.et',
    vehicle: 'Motorbike',
    plate: 'AA-31608',
    zone: 'Sarbet',
    activeOrders: 0,
    completed: 76,
    rating: 4.7,
    codHeld: 0,
    status: 'Offline',
    recentDeliveries: [
      { id: 'GDS-2508', area: 'Sarbet', date: 'Nov 21, 2026', amount: 435 },
      { id: 'GDS-2457', area: 'Old Airport', date: 'Nov 19, 2026', amount: 890 },
      { id: 'GDS-2418', area: 'Sarbet', date: 'Nov 16, 2026', amount: 720 },
    ],
  },
  {
    id: 'RDR-05',
    name: 'Bereket Teshome',
    phone: '+251 915 678 901',
    email: 'bereket.teshome@grocerydelivery.et',
    vehicle: 'Delivery Van',
    plate: 'AA-45219',
    zone: 'Piassa',
    activeOrders: 2,
    completed: 113,
    rating: 4.9,
    codHeld: 2150,
    status: 'On Delivery',
    recentDeliveries: [
      { id: 'GDS-2521', area: 'Piassa', date: 'Nov 22, 2026', amount: 1200 },
      { id: 'GDS-2489', area: 'Arat Kilo', date: 'Nov 20, 2026', amount: 540 },
      { id: 'GDS-2445', area: 'Piassa', date: 'Nov 18, 2026', amount: 760 },
    ],
  },
  {
    id: 'RDR-06',
    name: 'Natnael Bekele',
    phone: '+251 916 789 012',
    email: 'natnael.bekele@grocerydelivery.et',
    vehicle: 'Electric Scooter',
    plate: 'AA-82743',
    zone: 'Bole',
    activeOrders: 0,
    completed: 64,
    rating: 4.8,
    codHeld: 0,
    status: 'Available',
    recentDeliveries: [
      { id: 'GDS-2513', area: 'Bole', date: 'Nov 22, 2026', amount: 610 },
      { id: 'GDS-2476', area: 'Bole', date: 'Nov 20, 2026', amount: 980 },
      { id: 'GDS-2429', area: 'Bole', date: 'Nov 17, 2026', amount: 350 },
    ],
  },
]

const initialUnassignedOrders = [
  { id: 'GDS-2538', zone: 'Bole', address: 'Bole, near Friendship Square', amount: 680, paymentMethod: 'Cash on Delivery' },
  { id: 'GDS-2539', zone: 'Kazanchis', address: 'Kazanchis, Guinea Conakry Street', amount: 1240, paymentMethod: 'Telebirr' },
  { id: 'GDS-2540', zone: 'CMC / Ayat', address: 'CMC, around Sunshine Real Estate', amount: 920, paymentMethod: 'Cash on Delivery' },
  { id: 'GDS-2541', zone: 'Sarbet', address: 'Sarbet, Africa Avenue', amount: 540, paymentMethod: 'Cash on Delivery' },
  { id: 'GDS-2542', zone: 'Piassa', address: 'Piassa, near St. George Cathedral', amount: 875, paymentMethod: 'Telebirr' },
]

const blankDraft = {
  name: '',
  phone: '+251 ',
  email: '',
  vehicle: 'Motorbike',
  plate: '',
  zone: 'Bole',
  status: 'Available',
}

const avatarTones = [
  'bg-emerald-100 text-[#0E532B]',
  'bg-orange-100 text-[#F04E00]',
  'bg-blue-100 text-[#0B4B8C]',
  'bg-[#F0F7F1] text-[#0E532B]',
  'bg-orange-100 text-[#F04E00]',
  'bg-emerald-100 text-[#1E8E3E]',
]

const formatEtb = formatCurrency

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
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

function RiderAvatar({ rider, size = 'h-11 w-11' }) {
  const suffix = Number(rider.id.match(/\d+$/)?.[0] || 1)
  const tone = avatarTones[(suffix - 1) % avatarTones.length]

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full text-sm font-bold ${size} ${tone}`}
    >
      {getInitials(rider.name)}
    </span>
  )
}

function StatusPill({ status, onClick }) {
  const { t } = useLanguage()
  const statusLabels = {
    Available: 'delivery.available',
    'On Delivery': 'delivery.onDelivery',
    Offline: 'delivery.offline',
  }
  const style = {
    Available: 'bg-emerald-50 text-[#1E8E3E]',
    'On Delivery': 'bg-orange-50 text-[#F04E00]',
    Offline: 'bg-gray-100 text-gray-600',
  }[status] || 'bg-gray-100 text-gray-600'
  const dot = {
    Available: 'bg-[#1E8E3E]',
    'On Delivery': 'bg-[#F04E00]',
    Offline: 'bg-gray-400',
  }[status] || 'bg-gray-400'

  const content = (
    <>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {t(statusLabels[status] || status)}
    </>
  )

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      title={t('delivery.changeRiderStatus')}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition hover:ring-2 hover:ring-gray-200 ${style}`}
    >
      {content}
    </button>
  ) : (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ${style}`}>
      {content}
    </span>
  )
}

function VehicleIcon({ vehicle, size = 17 }) {
  if (vehicle === 'Delivery Van') return <Truck aria-hidden="true" size={size} />
  if (vehicle === 'Electric Scooter') return <Zap aria-hidden="true" size={size} />
  return <Bike aria-hidden="true" size={size} />
}

function RiderModal({ rider, draft, setDraft, onClose, onSave }) {
  const { t } = useLanguage()
  const update = (field) => (event) =>
    setDraft((current) => ({ ...current, [field]: event.target.value }))

  return (
    <Modal title={rider ? t('delivery.editRider') : t('common.addRider')} onClose={onClose} size="max-w-xl">
      <form onSubmit={onSave} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('customers.fullName')}
            <input
              required
              autoFocus
              value={draft.name}
              onChange={update('name')}
              placeholder="e.g. Hana Girma"
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#1E8E3E] focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            {t('common.phone')}
            <input
              required
              type="tel"
              value={draft.phone}
              onChange={update('phone')}
              placeholder="+251 9..."
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#1E8E3E] focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700 sm:col-span-2">
            {t('customers.emailAddress')}
            <input
              required
              type="email"
              value={draft.email}
              onChange={update('email')}
              placeholder="name@grocerydelivery.et"
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#1E8E3E] focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            {t('delivery.vehicleType')}
            <select
              value={draft.vehicle}
              onChange={update('vehicle')}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]"
            >
              {vehicleTypes.map((vehicle) => <option key={vehicle} value={vehicle}>{t(`delivery.${vehicle === 'Motorbike' ? 'motorbike' : vehicle === 'Delivery Van' ? 'deliveryVan' : 'electricScooter'}`)}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            {t('delivery.plateNumber')}
            <input
              required
              value={draft.plate}
              onChange={update('plate')}
              placeholder="AA-23451"
              className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]"
            />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            {t('delivery.assignedZone')}
            <select
              value={draft.zone}
              onChange={update('zone')}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]"
            >
              {zones.map((zone) => <option key={zone}>{zone}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            {t('status')}
            <select
              value={draft.status}
              onChange={update('status')}
              className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1E8E3E]"
            >
              {statuses.slice(1).map((status) => <option key={status} value={status}>{t(status === 'Available' ? 'delivery.available' : status === 'On Delivery' ? 'delivery.onDelivery' : 'delivery.offline')}</option>)}
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
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
            {rider ? t('saveChanges') : t('common.addRider')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function AssignOrderModal({ rider, orders, onClose, onAssign }) {
  const { t } = useLanguage()
  const availableOrders = orders.filter((order) => !order.assignedRiderId)

  return (
    <Modal title={`${t('delivery.assignOrder')} · ${rider.name}`} onClose={onClose} size="max-w-xl">
      <p className="mb-4 text-sm text-gray-500">
        Choose an unassigned order for {rider.name}. The order will be added to their active route.
      </p>
      {availableOrders.length > 0 ? (
        <div className="space-y-2">
          {availableOrders.map((order) => (
            <div key={order.id} className="flex flex-col gap-3 rounded-xl border border-gray-100 p-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#1E8E3E]">
                  <ClipboardList aria-hidden="true" size={17} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0B4B8C]">{order.id}</p>
                  <p className="mt-0.5 truncate text-xs text-gray-500">{order.zone} · {order.address}</p>
                  <p className="mt-1 text-[11px] text-gray-400">{order.paymentMethod}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                <span className="text-sm font-bold text-[#0E532B]">{formatEtb(order.amount)}</span>
                <button
                  type="button"
                  onClick={() => onAssign(order)}
                  className="rounded-lg bg-[#1E8E3E] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0E532B]"
                >
                  {t('delivery.assign')}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center">
          <CheckCircle aria-hidden="true" size={28} className="mx-auto text-[#1E8E3E]" />
          <p className="mt-3 text-sm font-semibold text-gray-800">{t('delivery.allCaughtUp')}</p>
          <p className="mt-1 text-xs text-gray-500">{t('delivery.noUnassignedOrders')}</p>
        </div>
      )}
    </Modal>
  )
}

function RiderDrawer({ rider, onClose, onSettleCod }) {
  const { t } = useLanguage()
  if (!rider) return null

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label={t('common.close')}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="rider-drawer-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1E8E3E]">Fleet profile · {rider.id}</p>
            <h2 id="rider-drawer-title" className="mt-1 text-lg font-bold text-[#0E532B]">{t('delivery.riderProfile')}</h2>
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
            <RiderAvatar rider={rider} size="h-16 w-16 text-lg" />
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-[#0E532B]">{rider.name}</h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <StatusPill status={rider.status} />
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500">
                  <MapPin aria-hidden="true" size={13} /> {rider.zone}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a href={`tel:${rider.phone.replaceAll(' ', '')}`} className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-100 p-3.5 text-sm text-gray-700 transition hover:bg-gray-50">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-[#1E8E3E]"><Phone aria-hidden="true" size={17} /></span>
              <span className="min-w-0"><span className="block text-[11px] text-gray-400">{t('common.phone')}</span><span className="block truncate font-medium">{rider.phone}</span></span>
            </a>
            <a href={`mailto:${rider.email}`} className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-100 p-3.5 text-sm text-gray-700 transition hover:bg-gray-50">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#0B4B8C]"><Mail aria-hidden="true" size={17} /></span>
              <span className="min-w-0"><span className="block text-[11px] text-gray-400">{t('common.email')}</span><span className="block truncate font-medium">{rider.email}</span></span>
            </a>
          </div>

          <section className="mt-7">
            <h3 className="mb-3 text-sm font-bold text-[#0E532B]">{t('delivery.vehicleAndAssignment')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 p-3.5">
                <p className="text-[11px] font-medium text-gray-400">{t('delivery.vehicleType')}</p>
                <p className="mt-1.5 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <span className="text-[#1E8E3E]"><VehicleIcon vehicle={rider.vehicle} /></span>{rider.vehicle}
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3.5">
                <p className="text-[11px] font-medium text-gray-400">{t('delivery.plateNumber')}</p>
                <p className="mt-1.5 text-sm font-semibold text-gray-800">{rider.plate}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3.5">
                <p className="text-[11px] font-medium text-gray-400">{t('delivery.activeOrders')}</p>
                <p className="mt-1.5 text-sm font-semibold text-gray-800">{rider.activeOrders} {t('common.active')}</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3.5">
                <p className="text-[11px] font-medium text-gray-400">{t('delivery.customerRating')}</p>
                <p className="mt-1.5 flex items-center gap-1 text-sm font-semibold text-gray-800">
                  <Star aria-hidden="true" size={14} className="fill-[#F04E00] text-[#F04E00]" /> {rider.rating ? rider.rating.toFixed(1) : 'New'}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#0E532B]">{t('delivery.pendingCodCash')}</h3>
                <p className="mt-0.5 text-xs text-gray-400">{t('delivery.cashHeldByRider')}</p>
              </div>
              <p className="text-lg font-bold text-[#0E532B]">{formatEtb(rider.codHeld)}</p>
            </div>
            <button
              type="button"
              disabled={rider.codHeld <= 0}
              onClick={() => onSettleCod(rider)}
              className="w-full rounded-xl border border-[#0B4B8C]/30 px-4 py-2.5 text-sm font-semibold text-[#0B4B8C] transition hover:bg-[#0B4B8C] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('delivery.markCodSettled')}
            </button>
          </section>

          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0E532B]">{t('delivery.recentCompletedDeliveries')}</h3>
              <span className="text-xs text-gray-400">{rider.completed} {t('delivery.totalCompleted')}</span>
            </div>
            <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
              {rider.recentDeliveries.length > 0 ? rider.recentDeliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#1E8E3E]">
                      <CheckCircle aria-hidden="true" size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0B4B8C]">{delivery.id}</p>
                      <p className="mt-0.5 truncate text-xs text-gray-400">{delivery.area} · {delivery.date}</p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-[#0E532B]">{formatEtb(delivery.amount)}</p>
                </div>
              )) : (
                <p className="px-4 py-8 text-center text-sm text-gray-500">{t('delivery.noCompletedDeliveries')}</p>
              )}
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}

function DeliveryStaff() {
  const { t } = useLanguage()
  const [fleet, setFleet] = usePersistentState('admin-fleet-riders', initialFleet)
  const [orders, setOrders] = usePersistentState('admin-fleet-orders', initialUnassignedOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [zoneFilter, setZoneFilter] = useState('All Zones')
  const [view, setView] = useState('Table')
  const [selectedRiderId, setSelectedRiderId] = useState(null)
  const [editingRider, setEditingRider] = useState(null)
  const [draft, setDraft] = useState(blankDraft)
  const [riderModalOpen, setRiderModalOpen] = useState(false)
  const [assigningRiderId, setAssigningRiderId] = useState(null)

  const filteredFleet = useMemo(() => {
    const query = search.trim().toLowerCase()
    return fleet.filter((rider) => {
      const matchesSearch = `${rider.name} ${rider.id} ${rider.phone} ${rider.email} ${rider.plate} ${rider.zone} ${rider.vehicle}`
        .toLowerCase()
        .includes(query)
      const matchesStatus = statusFilter === 'All' || rider.status === statusFilter
      const matchesZone = zoneFilter === 'All Zones' || rider.zone === zoneFilter
      return matchesSearch && matchesStatus && matchesZone
    })
  }, [fleet, search, statusFilter, zoneFilter])

  const selectedRider = fleet.find((rider) => rider.id === selectedRiderId)
  const assigningRider = fleet.find((rider) => rider.id === assigningRiderId)
  const availableCount = fleet.filter((rider) => rider.status === 'Available').length
  const onDeliveryCount = fleet.filter((rider) => rider.status === 'On Delivery').length
  const totalCod = fleet.reduce((total, rider) => total + Number(rider.codHeld || 0), 0)

  const startAddRider = () => {
    setEditingRider(null)
    setDraft(blankDraft)
    setRiderModalOpen(true)
  }

  const startEditRider = (rider) => {
    setEditingRider(rider)
    setDraft({
      name: rider.name,
      phone: rider.phone,
      email: rider.email,
      vehicle: rider.vehicle,
      plate: rider.plate,
      zone: rider.zone,
      status: rider.status,
    })
    setRiderModalOpen(true)
  }

  const saveRider = (event) => {
    event.preventDefault()
    const riderDetails = {
      ...draft,
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      plate: draft.plate.trim().toUpperCase(),
    }

    if (editingRider) {
      setFleet((current) =>
        current.map((rider) =>
          rider.id === editingRider.id ? { ...rider, ...riderDetails } : rider,
        ),
      )
    } else {
      const nextNumber = fleet.reduce((max, rider) => {
        const number = Number(rider.id.match(/\d+$/)?.[0] || 0)
        return Math.max(max, number)
      }, 0) + 1
      setFleet((current) => [
        {
          id: `RDR-${String(nextNumber).padStart(2, '0')}`,
          ...riderDetails,
          activeOrders: 0,
          completed: 0,
          rating: 0,
          codHeld: 0,
          recentDeliveries: [],
        },
        ...current,
      ])
    }
    setRiderModalOpen(false)
    setEditingRider(null)
  }

  const updateStatus = (rider) => {
    const nextStatus = rider.status === 'Offline' ? 'Available' : 'Offline'
    setFleet((current) =>
      current.map((item) => item.id === rider.id ? { ...item, status: nextStatus } : item),
    )
  }

  const removeRider = (rider) => {
    if (!window.confirm(`Remove ${rider.name} from the fleet?`)) return
    setFleet((current) => current.filter((item) => item.id !== rider.id))
    if (selectedRiderId === rider.id) setSelectedRiderId(null)
  }

  const assignOrder = (order) => {
    if (!assigningRider) return
    setOrders((current) =>
      current.map((item) =>
        item.id === order.id ? { ...item, assignedRiderId: assigningRider.id } : item,
      ),
    )
    setFleet((current) =>
      current.map((rider) =>
        rider.id === assigningRider.id
          ? {
              ...rider,
              activeOrders: rider.activeOrders + 1,
              status: 'On Delivery',
            }
          : rider,
      ),
    )
    setAssigningRiderId(null)
  }

  const settleCod = (rider) => {
    setFleet((current) =>
      current.map((item) => item.id === rider.id ? { ...item, codHeld: 0 } : item),
    )
  }

  const exportCsv = () => {
    const headers = ['Rider ID', 'Full name', 'Phone', 'Email', 'Vehicle type', 'Plate number', 'Zone', 'Active orders', 'Completed deliveries', 'Rating', 'COD held (ETB)', 'Status']
    const rows = fleet.map((rider) => [
      rider.id,
      rider.name,
      rider.phone,
      rider.email,
      rider.vehicle,
      rider.plate,
      rider.zone,
      rider.activeOrders,
      rider.completed,
      rider.rating ? rider.rating.toFixed(1) : '',
      Number(rider.codHeld || 0).toFixed(2),
      rider.status,
    ])
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'grocery-delivery-fleet.csv'
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const openAssignModal = (rider) => {
    setAssigningRiderId(rider.id)
  }

  const renderActions = (rider) => (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={rider.status === 'Offline'}
        onClick={() => openAssignModal(rider)}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-50 px-2.5 py-2 text-xs font-semibold text-[#0E532B] transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus aria-hidden="true" size={14} /> {t('delivery.assignOrder')}
      </button>
      <button
        type="button"
        aria-label={`${t('delivery.viewProfile')} ${rider.name}`}
        title={t('delivery.viewProfile')}
        onClick={() => setSelectedRiderId(rider.id)}
        className="rounded-lg p-2 text-[#0B4B8C] transition hover:bg-blue-50"
      >
        <Eye aria-hidden="true" size={16} />
      </button>
      <button
        type="button"
        aria-label={`Edit ${rider.name}`}
        title={t('delivery.editRider')}
        onClick={() => startEditRider(rider)}
        className="rounded-lg p-2 text-gray-500 transition hover:bg-emerald-50 hover:text-[#1E8E3E]"
      >
        <Pencil aria-hidden="true" size={16} />
      </button>
      <button
        type="button"
        aria-label={`Delete ${rider.name}`}
        title={t('common.delete')}
        onClick={() => removeRider(rider)}
        className="rounded-lg p-2 text-gray-400 transition hover:bg-orange-50 hover:text-[#F04E00]"
      >
        <Trash2 aria-hidden="true" size={16} />
      </button>
    </div>
  )

  return (
    <div className="mx-auto max-w-[1500px]">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0E532B] sm:text-3xl">
            {t('deliveryStaffFleet')}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-gray-500">
            {t('delivery.description')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label={t('delivery.fleetView')} className="flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {['Table', 'Grid'].map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                onClick={() => setView(option)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  view === option ? 'bg-[#1E8E3E] text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {option === 'Table' ? t('products.tableView') : t('products.gridView')}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0B4B8C]/30 bg-white px-3.5 py-2.5 text-sm font-semibold text-[#0B4B8C] shadow-sm transition hover:bg-[#0B4B8C] hover:text-white"
          >
            <Download aria-hidden="true" size={16} /> {t('delivery.exportFleetCsv')}
          </button>
          <button
            type="button"
            onClick={startAddRider}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0E532B]"
          >
            <Plus aria-hidden="true" size={17} /> {t('common.addRider')}
          </button>
        </div>
      </header>

      <section aria-label={t('common.fleetMetrics')} className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { labelKey: 'totalFleetRiders', value: fleet.length.toLocaleString('en-US'), icon: Users, tone: 'bg-emerald-50 text-[#1E8E3E]' },
          { labelKey: 'availableNow', value: availableCount.toLocaleString('en-US'), icon: CheckCircle, tone: 'bg-emerald-50 text-[#0E532B]' },
          { labelKey: 'currentlyOnDelivery', value: onDeliveryCount.toLocaleString('en-US'), icon: Navigation, tone: 'bg-orange-50 text-[#F04E00]' },
          { labelKey: 'pendingCodCash', value: formatEtb(totalCod), icon: Wallet, tone: 'bg-blue-50 text-[#0B4B8C]' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <article key={stat.labelKey} className="flex min-h-[112px] items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 sm:text-sm">{t(stat.labelKey)}</p>
                <p className={`mt-2 truncate font-bold tracking-tight text-[#0E532B] ${stat.labelKey === 'pendingCodCash' ? 'text-lg sm:text-xl' : 'text-2xl'}`}>
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
                placeholder={t('delivery.searchPlaceholder')}
                aria-label={t('delivery.searchPlaceholder')}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1E8E3E] focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-500">
              <span className="shrink-0">{t('delivery.deliveryZone')}</span>
              <select
                value={zoneFilter}
                onChange={(event) => setZoneFilter(event.target.value)}
                aria-label={t('delivery.deliveryZone')}
                className="min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 outline-none focus:border-[#1E8E3E]"
              >
                <option value="All Zones">{t('delivery.allZones')}</option>
                {zones.map((zone) => <option key={zone}>{zone}</option>)}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2" aria-label={t('delivery.filterRidersByStatus')}>
            {statuses.map((status) => (
              <button
                key={status}
                type="button"
                aria-pressed={statusFilter === status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  statusFilter === status
                    ? 'bg-[#1E8E3E] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t(status)}
                {status === 'All' && <span className="ml-1.5 opacity-70">({fleet.length})</span>}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-400">
              {filteredFleet.length} {filteredFleet.length === 1 ? 'rider' : 'riders'}
            </span>
          </div>
        </div>

        {view === 'Table' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="bg-gray-50/80 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0E532B]/75">
                <tr>
                  <th scope="col" className="px-5 py-3.5">{t('delivery.rider')}</th>
                  <th scope="col" className="px-5 py-3.5">{t('delivery.contact')}</th>
                  <th scope="col" className="px-5 py-3.5">{t('delivery.vehicleAndPlate')}</th>
                  <th scope="col" className="px-5 py-3.5">{t('delivery.activeTotal')}</th>
                  <th scope="col" className="px-5 py-3.5">{t('delivery.ratingAndCodCash')}</th>
                  <th scope="col" className="px-5 py-3.5">{t('status')}</th>
                  <th scope="col" className="px-5 py-3.5 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFleet.map((rider) => (
                  <tr key={rider.id} className="transition hover:bg-gray-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <RiderAvatar rider={rider} />
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => setSelectedRiderId(rider.id)}
                            className="block truncate text-left font-semibold text-[#0E532B] transition hover:text-[#1E8E3E]"
                          >
                            {rider.name}
                          </button>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-[#0B4B8C]">{rider.id}</span>
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-[#0E532B]">{rider.zone}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">{rider.phone}</p>
                      <p className="mt-1 max-w-[210px] truncate text-xs text-gray-500">{rider.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="flex items-center gap-2 font-medium text-gray-800">
                        <span className="text-[#1E8E3E]"><VehicleIcon vehicle={rider.vehicle} /></span>{rider.vehicle}
                      </p>
                      <p className="mt-1 pl-6 text-xs text-gray-500">{rider.plate}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">{rider.activeOrders} active</p>
                      <p className="mt-1 text-xs text-gray-500">{rider.completed} completed</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="flex items-center gap-1 font-semibold text-gray-800">
                        <Star aria-hidden="true" size={14} className="fill-[#F04E00] text-[#F04E00]" />
                        {rider.rating ? rider.rating.toFixed(1) : 'New'}
                      </p>
                      <p className="mt-1 text-xs font-medium text-[#0E532B]">{formatEtb(rider.codHeld)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={rider.status} onClick={() => updateStatus(rider)} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">{renderActions(rider)}</div>
                    </td>
                  </tr>
                ))}
                {filteredFleet.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-5 py-14 text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                        <Search aria-hidden="true" size={19} />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-gray-700">{t('delivery.noRidersFound')}</p>
                      <p className="mt-1 text-xs text-gray-500">{t('delivery.tryAnotherSearchStatusZone')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 p-4 md:grid-cols-2 xl:grid-cols-3 sm:p-5">
            {filteredFleet.map((rider) => (
              <article key={rider.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <RiderAvatar rider={rider} />
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => setSelectedRiderId(rider.id)}
                        className="block max-w-full truncate text-left font-bold text-[#0E532B] hover:text-[#1E8E3E]"
                      >
                        {rider.name}
                      </button>
                      <p className="mt-0.5 text-xs text-[#0B4B8C]">{rider.id}</p>
                    </div>
                  </div>
                  <StatusPill status={rider.status} onClick={() => updateStatus(rider)} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-[#0E532B]">
                    <MapPin aria-hidden="true" size={13} /> {rider.zone}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-gray-600">
                    <Star aria-hidden="true" size={14} className="fill-[#F04E00] text-[#F04E00]" />
                    {rider.rating ? rider.rating.toFixed(1) : 'New'}
                  </span>
                </div>
                <div className="mt-4 space-y-3 rounded-xl bg-gray-50 p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-[#1E8E3E]"><VehicleIcon vehicle={rider.vehicle} /></span>{rider.vehicle}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">{rider.plate}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200/70 pt-3 text-xs">
                    <span className="text-gray-500">{rider.activeOrders} active · {rider.completed} completed</span>
                    <span className="font-semibold text-[#0E532B]">{formatEtb(rider.codHeld)}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    disabled={rider.status === 'Offline'}
                    onClick={() => openAssignModal(rider)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1E8E3E] px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0E532B] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus aria-hidden="true" size={16} /> {t('delivery.assignOrder')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRiderId(rider.id)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#0B4B8C]/30 px-3 py-2.5 text-sm font-semibold text-[#0B4B8C] transition hover:bg-[#0B4B8C] hover:text-white"
                  >
                    <Eye aria-hidden="true" size={16} /> {t('common.details')}
                  </button>
                  <button
                    type="button"
                    aria-label={`Edit ${rider.name}`}
                    onClick={() => startEditRider(rider)}
                    className="rounded-xl border border-[#0B4B8C]/30 px-3 py-2.5 text-[#0B4B8C] transition hover:bg-[#0B4B8C] hover:text-white"
                  >
                    <Pencil aria-hidden="true" size={16} />
                  </button>
                </div>
              </article>
            ))}
            {filteredFleet.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-200 px-5 py-14 text-center md:col-span-2 xl:col-span-3">
                <Search aria-hidden="true" size={22} className="mx-auto text-gray-400" />
                <p className="mt-3 text-sm font-semibold text-gray-700">{t('delivery.noRidersFound')}</p>
                <p className="mt-1 text-xs text-gray-500">{t('delivery.tryAnotherSearchStatusZone')}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3.5 text-xs text-gray-500">
          <span>{t('common.showing')} {filteredFleet.length} / {fleet.length} {t('delivery.riders')}</span>
          <span className="hidden sm:inline">{t('delivery.allSettlementsEtb')}</span>
        </div>
      </section>

      {riderModalOpen && (
        <RiderModal
          rider={editingRider}
          draft={draft}
          setDraft={setDraft}
          onClose={() => setRiderModalOpen(false)}
          onSave={saveRider}
        />
      )}
      {assigningRider && assigningRider.status !== 'Offline' && (
        <AssignOrderModal
          rider={assigningRider}
          orders={orders}
          onClose={() => setAssigningRiderId(null)}
          onAssign={assignOrder}
        />
      )}
      <RiderDrawer
        rider={selectedRider}
        onClose={() => setSelectedRiderId(null)}
        onSettleCod={settleCod}
      />
    </div>
  )
}

export default DeliveryStaff
