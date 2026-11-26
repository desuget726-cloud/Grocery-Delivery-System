import { useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Banknote,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Eye,
  Landmark,
  MoreVertical,
  Smartphone,
  Trash2,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import formatCurrency from '../../utils/formatCurrency.js'

const kpis = [
  {
    titleKey: 'totalRevenue',
    value: formatCurrency(350420),
    trendValue: '20.4%',
    trendKey: 'fromLastMonth',
    direction: 'up',
    color: '#1E8E3E',
    values: [17, 24, 21, 33, 28, 39, 36, 48, 44, 58, 54, 68],
    to: '/admin/reports',
  },
  {
    titleKey: 'totalOrders',
    value: '15.5k',
    trendValue: '10.4%',
    trendKey: 'fromLastMonth',
    direction: 'up',
    color: '#1E8E3E',
    values: [22, 18, 30, 25, 38, 34, 43, 40, 55, 49, 63, 70],
    to: '/admin/orders',
  },
  {
    titleKey: 'totalNewCustomer',
    value: '2,153',
    trendValue: '4.04%',
    trendKey: 'visitorsDecreased',
    direction: 'down',
    color: '#F04E00',
    values: [67, 59, 64, 48, 52, 43, 46, 34, 40, 29, 34, 23],
    to: '/admin/customers',
  },
  {
    titleKey: 'repeatPurchaseRate',
    value: '35%',
    trendValue: '10.4%',
    trendKey: 'fromLastMonth',
    direction: 'up',
    color: '#1E8E3E',
    values: [20, 25, 19, 34, 30, 40, 35, 44, 42, 55, 53, 67],
    to: '/admin/customers',
  },
]

const sellingProducts = [
  { rank: '01.', emoji: '🥑', name: 'Fresh Hass Avocados', sold: 558 },
  { rank: '02.', emoji: '🍅', name: 'Organic Red Tomatoes', sold: 360 },
  { rank: '03.', emoji: '🌾', name: 'White Teff Flour (5kg)', sold: 185 },
  { rank: '04.', emoji: '🥛', name: 'Farm Fresh Milk (1L)', sold: 325 },
]

const initialOrders = [
  { id: 'GDS-2531', customer: 'Abebe Kebede', product: 'Fresh Hass Avocados', amount: 580.5, status: 'Pending' },
  { id: 'GDS-2532', customer: 'Selam Tesfaye', product: 'Organic Red Tomatoes', amount: 360, status: 'Confirm' },
  { id: 'GDS-2533', customer: 'Yared Lemma', product: 'White Teff Flour (5kg)', amount: 940, status: 'Delivered' },
  { id: 'GDS-2534', customer: 'Hiwot Abera', product: 'Farm Fresh Milk (1L)', amount: 760, status: 'Pending' },
  { id: 'GDS-2535', customer: 'Mesfin Tadesse', product: 'Red Onions & Berbere', amount: 425.5, status: 'Confirm' },
  { id: 'GDS-2536', customer: 'Tigist Hailu', product: 'Ethiopian Coffee Beans', amount: 1_250, status: 'Delivered' },
  { id: 'GDS-2537', customer: 'Dawit Bekele', product: 'Fresh Injera (Pack of 5)', amount: 315, status: 'Confirm' },
]

const transactions = [
  { method: 'Telebirr Payment Received', date: 'Today, 10:42 AM', amount: `+${formatCurrency(580.5)}`, icon: Smartphone, tone: 'bg-blue-50 text-[#0B4B8C]', positive: true },
  { method: 'CBE Birr Transfer', date: 'Today, 09:18 AM', amount: `+${formatCurrency(360)}`, icon: Landmark, tone: 'bg-emerald-50 text-[#1E8E3E]', positive: true },
  { method: 'Chapa Card Payment', date: 'Yesterday, 06:35 PM', amount: `+${formatCurrency(940)}`, icon: CreditCard, tone: 'bg-blue-50 text-[#0B4B8C]', positive: true },
  { method: 'Cash on Delivery', date: 'Yesterday, 04:22 PM', amount: `+${formatCurrency(760)}`, icon: Banknote, tone: 'bg-emerald-50 text-[#1E8E3E]', positive: true },
  { method: 'Awash Birr Transfer', date: 'Nov 21, 02:10 PM', amount: `+${formatCurrency(425.5)}`, icon: Wallet, tone: 'bg-orange-50 text-[#F04E00]', positive: true },
  { method: 'Telebirr Refund Issued', date: 'Nov 21, 11:03 AM', amount: `-${formatCurrency(185)}`, icon: CircleDollarSign, tone: 'bg-orange-50 text-[#F04E00]', positive: false },
  { method: 'CBE Birr Transfer', date: 'Nov 20, 05:46 PM', amount: `+${formatCurrency(1250)}`, icon: Landmark, tone: 'bg-emerald-50 text-[#1E8E3E]', positive: true },
  { method: 'Cash on Delivery', date: 'Nov 20, 01:15 PM', amount: `+${formatCurrency(315)}`, icon: Banknote, tone: 'bg-emerald-50 text-[#1E8E3E]', positive: true },
]

const salesSeries = [
  { nameKey: 'revenue', color: '#1E8E3E', values: [31, 39, 30, 42, 38, 47, 42] },
  { nameKey: 'orders', color: '#0B4B8C', values: [22, 30, 24, 27, 35, 32, 39] },
]
const weekDays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const chart = { left: 48, right: 544, top: 28, bottom: 174 }

function getSparklinePath(values, width = 126, height = 48) {
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const points = values.map((value, index) => ({
    x: (index / (values.length - 1)) * width,
    y: height - 4 - ((value - min) / range) * (height - 10),
  }))

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`
    const previous = points[index - 1]
    const offset = (point.x - previous.x) / 3
    return `${path} C ${previous.x + offset} ${previous.y}, ${point.x - offset} ${point.y}, ${point.x} ${point.y}`
  }, '')
}

function SparklineCard({ item }) {
  const { t } = useLanguage()
  const TrendIcon = item.direction === 'up' ? ArrowUp : ArrowDown

  return (
    <article className="flex min-h-[150px] items-stretch justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex min-w-0 flex-col justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">{t(item.titleKey)}</p>
          <p className="mt-1 text-xl font-bold tracking-tight text-[#0E532B] sm:text-2xl xl:text-lg">
            {item.value}
          </p>
        </div>
        <p
          className={`mt-3 flex items-center gap-1 text-[11px] font-medium ${
            item.direction === 'up' ? 'text-[#1E8E3E]' : 'text-[#F04E00]'
          }`}
        >
          <TrendIcon aria-hidden="true" size={14} />
          {item.trendValue} {t(item.trendKey)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-between">
        <svg
          viewBox="0 0 126 48"
          role="img"
          aria-label={`${t(item.titleKey)} ${t('dashboard.trend')}`}
          className="h-10 w-20 shrink-0"
        >
          <path
            d={getSparklinePath(item.values)}
            fill="none"
            stroke={item.color}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
        <Link
          to={item.to}
          className="rounded-full border border-[#0B4B8C]/30 px-3 py-1 text-[10px] font-semibold text-[#0B4B8C] transition hover:bg-[#0B4B8C] hover:text-white"
        >
          {t('details')}
        </Link>
      </div>
    </article>
  )
}

function getLinePath(points) {
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`
    const previous = points[index - 1]
    const offset = (point.x - previous.x) / 3
    return `${path} C ${previous.x + offset} ${previous.y}, ${point.x - offset} ${point.y}, ${point.x} ${point.y}`
  }, '')
}

function SalesReport() {
  const { t } = useLanguage()
  const pointsFor = (values) =>
    values.map((value, index) => ({
      x: chart.left + (index * (chart.right - chart.left)) / (values.length - 1),
      y: chart.bottom - (value / 50) * (chart.bottom - chart.top),
    }))
  const revenuePoints = pointsFor(salesSeries[0].values)
  const orderPoints = pointsFor(salesSeries[1].values)
  const revenuePath = getLinePath(revenuePoints)
  const orderPath = getLinePath(orderPoints)
  const areaPath = `${orderPath} L ${chart.right} ${chart.bottom} L ${chart.left} ${chart.bottom} Z`
  const wednesdayX = orderPoints[3].x
  const tooltipX = wednesdayX - 69

  return (
    <article className="h-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#0E532B]">
            {t('salesReportThisWeek')}
          </h2>
          <div className="mt-2 flex items-center gap-4 text-[11px] text-gray-500">
            {salesSeries.map((series) => (
              <span key={series.name} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: series.color }} />
                {t(series.nameKey)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <SelectPill ariaLabel="dashboard.salesReportPeriod" value="This week" options={['This week', 'Last week', 'This month']} />
          <button
            type="button"
            aria-label={t('dashboard.moreSalesReportOptions')}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
          >
            <MoreVertical aria-hidden="true" size={18} />
          </button>
        </div>
      </div>

      <div className="mt-3 h-56 w-full overflow-hidden">
        <svg
          viewBox="0 0 560 220"
          preserveAspectRatio="none"
          role="img"
          aria-label={t('dashboard.weeklySalesChartDescription')}
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="sales-blue-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0B4B8C" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0B4B8C" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {[50, 40, 30, 20, 10, 0].map((value) => {
            const y = chart.bottom - (value / 50) * (chart.bottom - chart.top)
            return (
              <g key={value}>
                <line
                  x1={chart.left}
                  x2={chart.right}
                  y1={y}
                  y2={y}
                  stroke="#E9EFEB"
                  strokeDasharray={value === 0 ? undefined : '3 5'}
                />
                <text
                  x={chart.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-gray-400"
                  fontSize="10"
                >
                  {value === 0 ? '0 ETB' : `${value}k ETB`}
                </text>
              </g>
            )
          })}
          <path d={areaPath} fill="url(#sales-blue-area)" />
          <line
            x1={wednesdayX}
            x2={wednesdayX}
            y1={chart.top}
            y2={chart.bottom}
            stroke="#A8B5C4"
            strokeDasharray="4 5"
          />
          <path
            d={revenuePath}
            fill="none"
            stroke="#1E8E3E"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={orderPath}
            fill="none"
            stroke="#0B4B8C"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {weekDays.map((day, index) => (
            <g key={day}>
              <circle
                cx={revenuePoints[index].x}
                cy={revenuePoints[index].y}
                r="3.5"
                fill="white"
                stroke="#1E8E3E"
                strokeWidth="2"
              />
              <circle
                cx={orderPoints[index].x}
                cy={orderPoints[index].y}
                r="3.5"
                fill="white"
                stroke="#0B4B8C"
                strokeWidth="2"
              />
              <text
                x={revenuePoints[index].x}
                y={chart.bottom + 24}
                textAnchor="middle"
                className="fill-gray-500"
                fontSize="10"
              >
                {t(`dashboard.weekDays.${day}`)}
              </text>
            </g>
          ))}
          <g>
            <rect
              x={tooltipX}
              y="3"
              width="138"
              height="44"
              rx="9"
              fill="#072916"
            />
            <text x={tooltipX + 11} y="20" fill="white" fontSize="10" fontWeight="600">
              {t('dashboard.weekDays.wed')}
            </text>
            <text x={tooltipX + 11} y="36" fill="#B9DDBF" fontSize="11">
              27k ETB
            </text>
          </g>
        </svg>
      </div>
    </article>
  )
}

function SelectPill({ ariaLabel, value, options, green = false, onChange }) {
  const { t } = useLanguage()

  const getOptionLabel = (option) => {
    const optionKeys = {
      'This week': 'thisWeek',
      'This Week': 'thisWeek',
      'Last week': 'lastWeek',
      'Last Week': 'lastWeek',
      'This month': 'thisMonth',
      'This Month': 'thisMonth',
      'Show All': 'showAll',
      Pending: 'pending',
      Confirm: 'confirm',
      Delivered: 'delivered',
    }
    const itemsPerPage = option.match(/^Items per page: (\d+)$/)
    if (itemsPerPage) {
      return `${t('itemsPerPage')}: ${itemsPerPage[1]}`
    }
    return t(optionKeys[option] || option)
  }

  return (
    <span
      className={`relative inline-flex items-center rounded-full ${
        green ? 'bg-emerald-50 text-[#1E8E3E]' : 'border border-gray-200 bg-white text-gray-600'
      }`}
    >
      <select
        aria-label={t(ariaLabel)}
        defaultValue={value}
        onChange={(event) => onChange?.(event.target.value)}
        className="appearance-none rounded-full bg-transparent py-2 pl-3 pr-7 text-[11px] font-semibold outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {getOptionLabel(option)}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        size={13}
        className="pointer-events-none absolute right-2"
      />
    </span>
  )
}

function TopSellingProducts() {
  const { t } = useLanguage()

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-[#0E532B]">
            {t('topSellingProducts')}
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            {t('mostPurchasedThisWeek')}
          </p>
        </div>
        <button
          type="button"
          aria-label={t('dashboard.moreTopProductOptions')}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
        >
          <MoreVertical aria-hidden="true" size={18} />
        </button>
      </div>
      <ol className="mt-4 flex-1 divide-y divide-gray-100">
        {sellingProducts.map((product) => (
          <li key={product.rank} className="flex items-center gap-2.5 py-3 first:pt-1">
            <span className="text-[11px] font-semibold text-gray-400">{product.rank}</span>
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-xl"
            >
              {product.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-gray-800">{product.name}</p>
              <p className="mt-0.5 text-[10px] text-gray-500">
                {product.sold} {t('itemsSold')}
              </p>
            </div>
            <Link
              to="/admin/products"
              aria-label={`${t('dashboard.detailsFor')} ${product.name}`}
              className="shrink-0 rounded-full border border-[#0B4B8C]/30 px-2 py-1 text-[10px] font-semibold text-[#0B4B8C] transition hover:bg-[#0B4B8C] hover:text-white"
            >
              {t('details')}
            </Link>
          </li>
        ))}
      </ol>
      <div className="mt-2 flex justify-end">
        <SelectPill ariaLabel="dashboard.topProductsPerPage" value="Items per page: 4" options={['Items per page: 4', 'Items per page: 8']} />
      </div>
    </article>
  )
}

function OrderSummary() {
  const { t } = useLanguage()
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const segments = [
    { translationKey: 'completed', value: 60, color: '#1E8E3E' },
    { translationKey: 'newOrder', value: 30, color: '#0B4B8C' },
    { translationKey: 'pending', value: 10, color: '#F04E00' },
  ]
  let offset = 0

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-[#0E532B]">
            {t('orderSummary')}
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            {t('currentOrderStatus')}
          </p>
        </div>
        <button
          type="button"
          aria-label={t('dashboard.moreOrderSummaryOptions')}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
        >
          <MoreVertical aria-hidden="true" size={18} />
        </button>
      </div>
      <div className="my-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
        {segments.map((segment) => (
          <span key={segment.translationKey} className="inline-flex items-center gap-1.5 whitespace-nowrap text-gray-600">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: segment.color }} />
            {t(segment.translationKey)} {segment.value}%
          </span>
        ))}
      </div>
      <div className="flex justify-center">
        <svg
          viewBox="0 0 160 160"
          role="img"
          aria-label={t('dashboard.orderSummaryChartDescription')}
          className="mx-auto h-40 w-40 shrink-0"
        >
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#F1F5F2" strokeWidth="22" />
          {segments.map((segment) => {
            const length = (segment.value / 100) * circumference
            const currentOffset = offset
            offset += length
            return (
              <circle
                key={segment.label}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth="22"
                strokeDasharray={`${length} ${circumference}`}
                strokeDashoffset={-currentOffset}
                transform="rotate(-90 80 80)"
              />
            )
          })}
          <text x="80" y="68" textAnchor="middle" className="fill-gray-400" fontSize="11">
            {t('totalOrders')}
          </text>
          <text x="80" y="90" textAnchor="middle" fill="currentColor" className="text-2xl font-bold text-gray-800">
            100%
          </text>
        </svg>
      </div>
    </article>
  )
}

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
}

function RecentOrders() {
  const { t } = useLanguage()
  const toast = useToast()
  const [orders, setOrders] = useState(initialOrders)
  const [statusFilter, setStatusFilter] = useState('Show All')
  const [openActionId, setOpenActionId] = useState(null)
  const filteredOrders = orders.filter(
    (order) => statusFilter === 'Show All' || order.status === statusFilter,
  )
  const removedCount = initialOrders.length - orders.length
  const totalOrders = 50 - removedCount

  const deleteOrder = (orderId) => {
    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== orderId),
    )
    setOpenActionId(null)
    toast.success(`${orderId} deleted from recent orders.`)
  }

  return (
    <article
      id="recent-orders"
      className="rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-base font-bold text-[#0E532B]">
            {t('recentOrders')}
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            {t('latestGroceryPurchases')}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <SelectPill
            ariaLabel="dashboard.filterOrders"
            value={statusFilter}
            options={['Show All', 'Pending', 'Confirm', 'Delivered']}
            onChange={setStatusFilter}
          />
          <SelectPill
            ariaLabel="dashboard.recentOrdersPeriod"
            value="This week"
            options={['This week', 'Last week', 'This month']}
            green
          />
          <button
            type="button"
            aria-label={t('dashboard.moreRecentOrdersOptions')}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
          >
            <MoreVertical aria-hidden="true" size={18} />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-xs">
          <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-[#0E532B]/75">
            <tr>
              <th scope="col" className="px-3 py-3 font-semibold">{t('orderId')}</th>
              <th scope="col" className="px-3 py-3 font-semibold">{t('customerName')}</th>
              <th scope="col" className="px-3 py-3 font-semibold">{t('product')}</th>
              <th scope="col" className="px-3 py-3 font-semibold">{t('amount')}</th>
              <th scope="col" className="px-3 py-3 font-semibold">{t('status')}</th>
              <th scope="col" className="px-3 py-3 font-semibold">{t('action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.map((order, index) => {
              const statusTone = {
                Pending: 'bg-orange-50 text-[#F04E00]',
                Confirm: 'bg-emerald-50 text-[#1E8E3E]',
                Delivered: 'bg-blue-50 text-[#0B4B8C]',
              }[order.status]
              const avatarColors = [
                'bg-emerald-100 text-[#0E532B]',
                'bg-blue-100 text-[#0B4B8C]',
                'bg-orange-100 text-[#F04E00]',
                'bg-[#F0F7F1] text-[#0E532B]',
              ]

              return (
                <tr key={order.id} className="transition hover:bg-gray-50/70">
                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#0B4B8C]">
                    {order.id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className="inline-flex items-center gap-2 text-gray-700">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold ${avatarColors[index % avatarColors.length]}`}>
                        {initials(order.customer)}
                      </span>
                      {order.customer}
                    </span>
                  </td>
                  <td className="max-w-[170px] truncate px-3 py-3 text-gray-600">
                    {order.product}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#0E532B]">
                    {formatCurrency(order.amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusTone}`}>
                      {t(order.status)}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap px-3 py-3">
                    <span className="inline-flex items-center gap-1">
                      <Link
                        to="/admin/orders?status=all"
                        aria-label={`${t('dashboard.viewOrder')} ${order.id}`}
                        className="rounded-md border border-[#0B4B8C]/30 p-1.5 text-[#0B4B8C] hover:bg-[#0B4B8C] hover:text-white"
                      >
                        <Eye aria-hidden="true" size={15} />
                      </Link>
                      <button
                        type="button"
                        aria-label={`${t('dashboard.deleteOrder')} ${order.id}`}
                        onClick={() => deleteOrder(order.id)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-orange-50 hover:text-[#F04E00]"
                      >
                        <Trash2 aria-hidden="true" size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label={`${t('dashboard.moreActionsFor')} ${order.id}`}
                        aria-expanded={openActionId === order.id}
                        onClick={() =>
                          setOpenActionId((current) =>
                            current === order.id ? null : order.id,
                          )
                        }
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <MoreVertical aria-hidden="true" size={15} />
                      </button>
                    </span>
                    {openActionId === order.id && (
                      <div className="absolute right-8 top-10 z-10 w-32 rounded-lg border border-gray-100 bg-white p-1 shadow-lg">
                        <Link
                          to="/admin/orders?status=all"
                          onClick={() => setOpenActionId(null)}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-[#0B4B8C] hover:bg-blue-50"
                        >
                          <Eye aria-hidden="true" size={13} />
                          {t('dashboard.viewOrder')}
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteOrder(order.id)}
                          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-[#F04E00] hover:bg-orange-50"
                        >
                          <Trash2 aria-hidden="true" size={13} />
                          {t('dashboard.deleteOrder')}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan="6" className="px-5 py-10 text-center text-sm text-gray-500">
                  {t('dashboard.noOrdersMatchFilter')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 sm:px-5">
        <SelectPill
          ariaLabel="dashboard.ordersPerPage"
          value="Items per page: 7"
          options={['Items per page: 7', 'Items per page: 14']}
        />
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span className="mr-2">
            {filteredOrders.length ? `1 - ${filteredOrders.length}` : '0'} {t('common.of')} {totalOrders}
          </span>
          <button
            type="button"
            aria-label={t('dashboard.previousPage')}
            disabled
            className="rounded-md p-1.5 text-gray-300"
          >
            <ChevronLeft aria-hidden="true" size={16} />
          </button>
          <button
            type="button"
            aria-label={t('dashboard.nextPage')}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <ChevronRight aria-hidden="true" size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}

function TransactionHistory() {
  const { t } = useLanguage()

  return (
    <article className="flex min-h-[440px] flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lg:col-span-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-[#0E532B]">
          {t('transactionHistory')}
        </h2>
        <SelectPill
          ariaLabel="dashboard.transactionHistoryPeriod"
          value="This Week"
          options={['This Week', 'Last Week', 'This Month']}
        />
      </div>
      <ul className="mt-3 min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto">
        {transactions.map(({ method, date, amount, icon: Icon, tone, positive }, index) => (
          <li key={`${method}-${date}`} className="flex items-center gap-3 py-3">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tone}`}>
              <Icon aria-hidden="true" size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-gray-800">{method}</p>
              <p className="mt-1 text-[10px] text-gray-500">{date}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                positive
                  ? 'bg-emerald-50 text-[#1E8E3E]'
                  : 'bg-orange-50 text-[#F04E00]'
              }`}
            >
              {amount}
            </span>
            {index === 0 && <span className="sr-only">{t('dashboard.mostRecentTransaction')}</span>}
          </li>
        ))}
      </ul>
      <div className="mt-2 flex justify-end border-t border-gray-100 pt-3">
        <SelectPill
          ariaLabel="dashboard.transactionsPerPage"
          value="Items per page: 8"
          options={['Items per page: 8', 'Items per page: 16']}
        />
      </div>
    </article>
  )
}

function Dashboard() {
  const { t } = useLanguage()

  return (
    <div>
      <section
        aria-label={t('dashboard.keyPerformanceIndicators')}
        className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {kpis.map((item) => (
          <SparklineCard key={item.title} item={item} />
        ))}
      </section>

      <section
        aria-label={t('dashboard.analytics')}
        className="mb-5 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12"
      >
        <div className="lg:col-span-5 xl:col-span-6">
          <SalesReport />
        </div>
        <div className="lg:col-span-4 xl:col-span-3">
          <TopSellingProducts />
        </div>
        <div className="lg:col-span-3">
          <OrderSummary />
        </div>
      </section>

      <section
        aria-label={t('dashboard.ordersAndTransactions')}
        className="grid grid-cols-1 gap-5 lg:grid-cols-12"
      >
        <RecentOrders />
        <TransactionHistory />
      </section>
    </div>
  )
}

export default Dashboard
