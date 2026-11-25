import {
  Bike,
  CalendarDays,
  CreditCard,
  Eye,
  MapPin,
  PackageCheck,
  Phone,
  Search,
  ShoppingBasket,
  Truck,
  UserRound,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AdminPageHeader, Modal } from '../../components/admin/AdminUI.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import usePersistentState from '../../hooks/usePersistentState.js'
import formatCurrency from '../../utils/formatCurrency.js'

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Placed', value: 'placed' },
  { label: 'Processing', value: 'processing' },
  { label: 'On The Way', value: 'on_the_way' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Canceled', value: 'canceled' },
]

const statusColors = {
  Placed: 'bg-orange-50 text-[#F04E00]',
  Processing: 'bg-blue-50 text-[#0B4B8C]',
  'On The Way': 'bg-blue-50 text-[#0B4B8C]',
  Delivered: 'bg-blue-50 text-[#0B4B8C]',
  Canceled: 'bg-orange-50 text-[#F04E00]',
}

const orderStatuses = statusTabs.slice(1).map(({ label }) => label)

const riders = [
  { id: 'R-101', name: 'Dawit Tadesse', available: true },
  { id: 'R-102', name: 'Yonas Girma', available: true },
  { id: 'R-103', name: 'Biniyam Alemu', available: true },
  { id: 'R-104', name: 'Mekdes Bekele', available: true },
  { id: 'R-105', name: 'Henok Worku', available: true },
  { id: 'R-106', name: 'Samiya Mohammed', available: true },
  { id: 'R-107', name: 'Fitsum Haile', available: true },
]

const hoursAgo = (hours) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

const initialOrders = [
  {
    id: 'GDS-1056',
    customerName: 'Hana Tesfaye',
    customerPhone: '+251 911 234 567',
    date: hoursAgo(1),
    status: 'Placed',
    total: 1285,
    deliveryStaff: '',
    deliveryAddress: 'Bole, near Friendship Square, Addis Ababa',
    paymentMethod: 'Cash on Delivery',
    items: [
      { id: 'injera', name: 'Fresh Sourdough Injera', unit: 'Pack of 5', price: 180, quantity: 2 },
      { id: 'tomatoes', name: 'Roma Tomatoes', unit: '1 kg', price: 95, quantity: 3 },
      { id: 'coffee', name: 'Yirgacheffe Coffee', unit: '500 g', price: 420, quantity: 1 },
    ],
  },
  {
    id: 'GDS-1057',
    customerName: 'Abebe Kebede',
    customerPhone: '+251 922 345 678',
    date: hoursAgo(2),
    status: 'Processing',
    total: 2140,
    deliveryStaff: 'Dawit Tadesse',
    deliveryAddress: 'Kazanchis, Guinea Conakry Street, Addis Ababa',
    paymentMethod: 'Telebirr',
    items: [
      { id: 'teff', name: 'White Teff Flour', unit: '2 kg', price: 720, quantity: 2 },
      { id: 'honey', name: 'Highland Honey', unit: '500 g', price: 350, quantity: 2 },
    ],
  },
  {
    id: 'GDS-1058',
    customerName: 'Selamawit Bekele',
    customerPhone: '+251 933 456 789',
    date: hoursAgo(4),
    status: 'On The Way',
    total: 890,
    deliveryStaff: 'Yonas Girma',
    deliveryAddress: 'Piassa, near St. George Cathedral, Addis Ababa',
    paymentMethod: 'Cash on Delivery',
    items: [
      { id: 'bananas', name: 'Ripe Bananas', unit: '1 kg', price: 160, quantity: 2 },
      { id: 'avocado', name: 'Fresh Avocados', unit: 'Each', price: 75, quantity: 4 },
    ],
  },
  {
    id: 'GDS-1059',
    customerName: 'Dawit Mekonnen',
    customerPhone: '+251 944 567 890',
    date: hoursAgo(6),
    status: 'Delivered',
    total: 1560,
    deliveryStaff: 'Biniyam Alemu',
    deliveryAddress: 'Megenagna, CMC Road, Addis Ababa',
    paymentMethod: 'Card',
    items: [
      { id: 'eggs', name: 'Farm Fresh Eggs', unit: 'Tray of 30', price: 650, quantity: 1 },
      { id: 'milk', name: 'Fresh Whole Milk', unit: '1 litre', price: 110, quantity: 4 },
      { id: 'spinach', name: 'Fresh Spinach', unit: 'Bunch', price: 85, quantity: 2 },
    ],
  },
  {
    id: 'GDS-1060',
    customerName: 'Mekdes Alemu',
    customerPhone: '+251 955 678 901',
    date: hoursAgo(28),
    status: 'Canceled',
    total: 675,
    deliveryStaff: '',
    deliveryAddress: 'Sar Bet, Old Airport Road, Addis Ababa',
    paymentMethod: 'Cash on Delivery',
    items: [
      { id: 'onions', name: 'Red Onions', unit: '1 kg', price: 110, quantity: 2 },
      { id: 'potatoes', name: 'Local Potatoes', unit: '2 kg', price: 145, quantity: 2 },
    ],
  },
  {
    id: 'GDS-1061',
    customerName: 'Yonas Girma',
    customerPhone: '+251 966 789 012',
    date: hoursAgo(8),
    status: 'Processing',
    total: 1120,
    deliveryStaff: '',
    deliveryAddress: 'Lideta, near Mexico Square, Addis Ababa',
    paymentMethod: 'Telebirr',
    items: [
      { id: 'lentils', name: 'Red Lentils', unit: '1 kg', price: 210, quantity: 2 },
      { id: 'oil', name: 'Sunflower Cooking Oil', unit: '1 litre', price: 350, quantity: 2 },
    ],
  },
  {
    id: 'GDS-1062',
    customerName: 'Rahel Worku',
    customerPhone: '+251 977 890 123',
    date: hoursAgo(30),
    status: 'Placed',
    total: 740,
    deliveryStaff: '',
    deliveryAddress: 'Kirkos, Africa Avenue, Addis Ababa',
    paymentMethod: 'Cash on Delivery',
    items: [
      { id: 'mangoes', name: 'Seasonal Mangoes', unit: '1 kg', price: 220, quantity: 2 },
      { id: 'carrots', name: 'Fresh Carrots', unit: '1 kg', price: 150, quantity: 2 },
    ],
  },
]

function Orders() {
  const { t } = useLanguage()
  const [orders, setOrders] = usePersistentState('admin-grocery-orders', initialOrders)
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [unassignedOnly, setUnassignedOnly] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const requestedStatus = searchParams.get('status') ?? 'all'
  const selectedStatus = statusTabs.some(({ value }) => value === requestedStatus)
    ? requestedStatus
    : 'all'

  const todayCount = orders.filter(
    (order) => new Date(order.date).toDateString() === new Date().toDateString(),
  ).length
  const unassignedCount = orders.filter((order) => !order.deliveryStaff).length
  const searchText = search.trim().toLowerCase()
  const searchDigits = search.replace(/\D/g, '')

  const filteredOrders = useMemo(
    () =>
      [...orders]
        .filter((order) => {
          if (selectedStatus === 'all') return true
          return order.status.toLowerCase().replaceAll(' ', '_') === selectedStatus
        })
        .filter((order) => !unassignedOnly || !order.deliveryStaff)
        .filter((order) => {
          if (!searchText) return true

          const phoneDigits = order.customerPhone.replace(/\D/g, '')
          const localPhoneDigits = phoneDigits.startsWith('251')
            ? `0${phoneDigits.slice(3)}`
            : phoneDigits
          return (
            order.id.toLowerCase().includes(searchText) ||
            order.customerName.toLowerCase().includes(searchText) ||
            (searchDigits.length > 0 &&
              (phoneDigits.includes(searchDigits) ||
                localPhoneDigits.includes(searchDigits)))
          )
        })
        .sort((first, second) => new Date(second.date) - new Date(first.date)),
    [orders, searchDigits, searchText, selectedStatus, unassignedOnly],
  )

  const selectedOrder = orders.find((order) => order.id === selectedOrderId)

  const updateOrder = (orderId, update) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, ...update } : order,
      ),
    )
  }

  const selectStatus = (status) => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('status', status)
    setSearchParams(nextParams)
  }

  const toggleUnassigned = () => setUnassignedOnly((current) => !current)

  return (
    <div>
      <AdminPageHeader
        title={t('orders')}
        description={t('orders.ordersDescription')}
      />

      <section className="mb-6 rounded-2xl bg-gradient-to-r from-[#0E532B] to-[#1E8E3E] p-5 text-white">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label={t('totalOrders')}
            value={orders.length}
            icon={ShoppingBasket}
            iconClass="bg-[#1E8E3E] text-white"
          />
          <button
            type="button"
            aria-pressed={unassignedOnly}
            onClick={toggleUnassigned}
            className={`rounded-xl bg-white p-4 text-left text-slate-900 transition hover:-translate-y-0.5 hover:shadow-md ${
              unassignedOnly ? 'ring-2 ring-[#F04E00]' : ''
            }`}
          >
            <SummaryCardContent
              label={t('orders.unassignedOrders')}
              value={unassignedCount}
              icon={UserRound}
              iconClass="bg-[#F04E00] text-white"
            />
          </button>
          <SummaryCard
            label={t('orders.todaysOrders')}
            value={todayCount}
            icon={CalendarDays}
            iconClass="bg-blue-600 text-white"
          />
          <SummaryCard
            label={t('orders.activeRiders')}
            value={riders.filter((rider) => rider.available).length}
            icon={Bike}
            iconClass="bg-[#F04E00] text-white"
            detail={t('orders.availableDeliveryStaff')}
          />
        </div>
      </section>

      <section className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-2" aria-label={t('orders.filterOrdersByStatus')}>
          {statusTabs.map(({ label, value }) => {
            const count =
              value === 'all'
                ? orders.length
                : orders.filter(
                    (order) =>
                      order.status.toLowerCase().replaceAll(' ', '_') === value,
                  ).length
            const active = selectedStatus === value

            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => selectStatus(value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-[#1E8E3E] text-white shadow-sm'
                    : 'bg-white text-slate-600 ring-1 ring-gray-200 hover:text-[#0E532B]'
                }`}
              >
                {t(label)}
                <span className="ml-1.5 opacity-75">{count}</span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block flex-1">
            <Search
              aria-hidden="true"
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('orders.searchOrdersPlaceholder')}
              aria-label={t('orders.searchOrdersLabel')}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15"
            />
          </label>
          <button
            type="button"
            aria-pressed={unassignedOnly}
            onClick={toggleUnassigned}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
              unassignedOnly
                ? 'border-[#F04E00] bg-orange-50 text-[#C54100]'
                : 'border-gray-200 bg-white text-slate-600 hover:border-[#1E8E3E] hover:text-[#0E532B]'
            }`}
          >
            <Users aria-hidden="true" size={16} />
            {t('orders.unassignedOnly')}
            {unassignedOnly && <span className="text-xs">{t('orders.on')}</span>}
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-[#0E532B]/75">
              <tr>
                <th scope="col" className="px-4 py-3.5 font-semibold">{t('orderId')}</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">{t('common.customer')}</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">{t('common.dateTime')}</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">{t('common.items')}</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">{t('common.totalEtb')}</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">{t('common.deliveryRider')}</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">{t('status')}</th>
                <th scope="col" className="px-4 py-3.5 text-right font-semibold">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-emerald-50/30">
                  <td className="whitespace-nowrap px-4 py-4 font-bold text-[#0E532B]">
                    {order.id}
                  </td>
                  <td className="px-4 py-4">
                    <p className="whitespace-nowrap font-semibold text-slate-800">
                      {order.customerName}
                    </p>
                    <p className="mt-1 whitespace-nowrap text-xs text-slate-500">
                      {order.customerPhone}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    <p>{new Date(order.date).toLocaleDateString('en-ET', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(order.date).toLocaleTimeString('en-ET', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    {order.items.reduce((total, item) => total + item.quantity, 0)} {t('common.items')}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 font-semibold text-[#0E532B]">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-4 py-4">
                    <label className="sr-only" htmlFor={`rider-${order.id}`}>
                      {t('orders.assignRider')} {order.id}
                    </label>
                    <div className="relative">
                      <Truck
                        aria-hidden="true"
                        size={15}
                        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#1E8E3E]"
                      />
                      <select
                        id={`rider-${order.id}`}
                        value={order.deliveryStaff}
                        onChange={(event) =>
                          updateOrder(order.id, { deliveryStaff: event.target.value })
                        }
                        className={`max-w-48 appearance-none rounded-lg border py-2 pl-8 pr-7 text-xs font-medium outline-none focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15 ${
                          order.deliveryStaff
                            ? 'border-gray-200 bg-white text-slate-700'
                            : 'border-orange-200 bg-orange-50 text-[#C54100]'
                        }`}
                      >
                        <option value="">
                          {t(order.deliveryStaff ? 'orders.changeRider' : 'orders.assignRider')}
                        </option>
                        {riders.filter((rider) => rider.available).map((rider) => (
                          <option key={rider.id} value={rider.name}>
                            {rider.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`mb-1.5 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        statusColors[order.status] ?? 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t(order.status)}
                    </span>
                    <label className="sr-only" htmlFor={`status-${order.id}`}>
                      {t('orders.updateOrderStatus')} {order.id}
                    </label>
                    <select
                      id={`status-${order.id}`}
                      value={order.status}
                      onChange={(event) =>
                        updateOrder(order.id, { status: event.target.value })
                      }
                      className="block max-w-36 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-slate-600 outline-none focus:border-[#1E8E3E]"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>{t(status)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      aria-label={`${t('orders.viewOrderDetails')} ${order.id}`}
                      onClick={() => setSelectedOrderId(order.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-emerald-50 hover:text-[#1E8E3E] focus:outline-none focus:ring-2 focus:ring-[#1E8E3E]/30"
                    >
                      <Eye aria-hidden="true" size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-5 py-14 text-center">
                    <ShoppingBasket aria-hidden="true" size={30} className="mx-auto text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-700">{t('orders.noOrdersFound')}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {t('orders.tryDifferentStatusSearchFilter')}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedOrder && (
        <Modal
          title={`${t('common.order')} ${selectedOrder.id}`}
          onClose={() => setSelectedOrderId(null)}
          size="max-w-2xl"
        >
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-emerald-50 p-4">
              <div>
                <p className="font-semibold text-[#0E532B]">{selectedOrder.customerName}</p>
                <a
                  href={`tel:${selectedOrder.customerPhone}`}
                  className="mt-1 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-[#1E8E3E]"
                >
                  <Phone aria-hidden="true" size={14} />
                  {selectedOrder.customerPhone}
                </a>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  statusColors[selectedOrder.status] ?? 'bg-slate-100 text-slate-700'
                }`}
              >
                {t(selectedOrder.status)}
              </span>
            </div>

            <section>
              <h3 className="flex items-center gap-2 text-sm font-bold text-[#0E532B]">
                <PackageCheck aria-hidden="true" size={17} className="text-[#1E8E3E]" />
                {t('orders.groceryItems')}
              </h3>
              <ul className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-100">
                {selectedOrder.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-4 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.unit} · {t('common.quantity')} {item.quantity}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-sm font-semibold text-slate-700">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-sm">
                <span className="font-semibold text-slate-600">{t('orders.orderTotal')}</span>
                <span className="font-bold text-[#0E532B]">
                  {formatCurrency(selectedOrder.total)}
                </span>
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <section className="rounded-xl border border-gray-100 p-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#0E532B]">
                  <MapPin aria-hidden="true" size={16} className="text-[#1E8E3E]" />
                  {t('orders.deliveryAddress')}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedOrder.deliveryAddress}
                </p>
              </section>
              <section className="rounded-xl border border-gray-100 p-3">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#0E532B]">
                  <CreditCard aria-hidden="true" size={16} className="text-[#1E8E3E]" />
                  {t('orders.paymentMethod')}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {selectedOrder.paymentMethod}
                </p>
                <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays aria-hidden="true" size={14} />
                  {new Date(selectedOrder.date).toLocaleString('en-ET')}
                </p>
              </section>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function SummaryCard({ label, value, icon: Icon, iconClass, detail }) {
  return (
    <article className="rounded-xl bg-white p-4 text-slate-900">
      <SummaryCardContent
        label={label}
        value={value}
        icon={Icon}
        iconClass={iconClass}
        detail={detail}
      />
    </article>
  )
}

function SummaryCardContent({ label, value, icon: Icon, iconClass, detail }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-[#0E532B]">{value}</p>
        {detail && <p className="mt-0.5 text-xs text-slate-500">{detail}</p>}
      </div>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
        <Icon aria-hidden="true" size={20} />
      </span>
    </div>
  )
}

export default Orders
