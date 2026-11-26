import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  Banknote,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  Download,
  Eye,
  Filter,
  Printer,
  RotateCcw,
  Search,
  Smartphone,
} from 'lucide-react'
import logo from '../../assets/logo.png'
import { Modal } from '../../components/admin/AdminUI.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { logAuditEvent } from '../../services/auditLog.js'
import { getApiErrorMessage, orders as ordersApi, payments as paymentsApi } from '../../services/api.js'
import formatCurrency from '../../utils/formatCurrency.js'

const dateDaysAgo = (days, hour = 10) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(hour, 20, 0, 0)
  return date.toISOString()
}

const initialTransactions = [
  {
    id: 'TXN-9041',
    orderId: 'GDS-2531',
    customer: 'Abebe Kebede',
    email: 'abebe.kebede@example.com',
    method: 'Telebirr',
    date: dateDaysAgo(0, 9),
    amount: 580.5,
    subtotal: 520.5,
    deliveryFee: 60,
    discount: 0,
    status: 'Completed',
  },
  {
    id: 'TXN-9040',
    orderId: 'GDS-2530',
    customer: 'Selam Tesfaye',
    email: 'selam.tesfaye@example.com',
    method: 'CBE Birr',
    date: dateDaysAgo(0, 8),
    amount: 1250,
    subtotal: 1200,
    deliveryFee: 80,
    discount: 30,
    status: 'Completed',
  },
  {
    id: 'TXN-9039',
    orderId: 'GDS-2529',
    customer: 'Yared Lemma',
    email: 'yared.lemma@example.com',
    method: 'Chapa Card',
    date: dateDaysAgo(1, 16),
    amount: 890,
    subtotal: 850,
    deliveryFee: 80,
    discount: 40,
    status: 'Completed',
  },
  {
    id: 'TXN-9038',
    orderId: 'GDS-2528',
    customer: 'Hana Girma',
    email: 'hana.girma@example.com',
    method: 'Cash on Delivery',
    date: dateDaysAgo(0, 11),
    amount: 740,
    subtotal: 700,
    deliveryFee: 70,
    discount: 30,
    status: 'Pending',
  },
  {
    id: 'TXN-9037',
    orderId: 'GDS-2527',
    customer: 'Dawit Bekele',
    email: 'dawit.bekele@example.com',
    method: 'Telebirr',
    date: dateDaysAgo(2, 14),
    amount: 240,
    subtotal: 200,
    deliveryFee: 60,
    discount: 20,
    status: 'Refunded',
  },
  {
    id: 'TXN-9036',
    orderId: 'GDS-2526',
    customer: 'Rahel Mamo',
    email: 'rahel.mamo@example.com',
    method: 'Cash on Delivery',
    date: dateDaysAgo(1, 13),
    amount: 960,
    subtotal: 900,
    deliveryFee: 80,
    discount: 20,
    status: 'Pending',
  },
  {
    id: 'TXN-9035',
    orderId: 'GDS-2525',
    customer: 'Mulugeta Tadesse',
    email: 'mulugeta.tadesse@example.com',
    method: 'CBE Birr',
    date: dateDaysAgo(3, 10),
    amount: 420,
    subtotal: 350,
    deliveryFee: 70,
    discount: 0,
    status: 'Failed',
  },
  {
    id: 'TXN-9034',
    orderId: 'GDS-2524',
    customer: 'Eden Worku',
    email: 'eden.worku@example.com',
    method: 'Chapa Card',
    date: dateDaysAgo(5, 15),
    amount: 1725,
    subtotal: 1700,
    deliveryFee: 75,
    discount: 50,
    status: 'Completed',
  },
  {
    id: 'TXN-9033',
    orderId: 'GDS-2523',
    customer: 'Bereket Alemu',
    email: 'bereket.alemu@example.com',
    method: 'Cash on Delivery',
    date: dateDaysAgo(9, 12),
    amount: 635,
    subtotal: 600,
    deliveryFee: 75,
    discount: 40,
    status: 'Completed',
  },
  {
    id: 'TXN-9032',
    orderId: 'GDS-2522',
    customer: 'Senait Haile',
    email: 'senait.haile@example.com',
    method: 'Telebirr',
    date: dateDaysAgo(15, 9),
    amount: 1340,
    subtotal: 1250,
    deliveryFee: 100,
    discount: 10,
    status: 'Completed',
  },
]

const methods = ['Telebirr', 'CBE Birr', 'Chapa Card', 'Cash on Delivery']
const statuses = ['All', 'Completed', 'Pending', 'Refunded', 'Failed']
const dateRanges = ['Today', 'This Week', 'This Month']
const statusClassNames = {
  Completed: 'bg-emerald-50 text-[#1E8E3E]',
  Pending: 'bg-orange-50 text-[#F04E00]',
  Refunded: 'bg-orange-50 text-[#F04E00]',
  Failed: 'bg-orange-50 text-[#F04E00]',
}
const methodStyles = {
  Telebirr: 'bg-blue-50 text-[#0B4B8C]',
  'CBE Birr': 'bg-blue-50 text-[#0B4B8C]',
  'Chapa Card': 'bg-emerald-50 text-[#1E8E3E]',
  'Cash on Delivery': 'bg-orange-50 text-[#F04E00]',
}
const methodIcons = {
  Telebirr: Smartphone,
  'CBE Birr': Banknote,
  'Chapa Card': CreditCard,
  'Cash on Delivery': Banknote,
}
const money = formatCurrency
function getRangeStart(range) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  if (range === 'This Week') {
    const daysSinceMonday = (start.getDay() + 6) % 7
    start.setDate(start.getDate() - daysSinceMonday)
  } else if (range === 'This Month') {
    start.setDate(1)
  }
  return start
}

function formatTransactionDate(value) {
  return new Date(value).toLocaleString('en-ET', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function PaymentReceiptBarcode({ value }) {
  const bits = `101${String(value)
    .split('')
    .map((character) => character.charCodeAt(0).toString(2).padStart(7, '0'))
    .join('')}101`
  const width = bits.length * 2
  const offset = (180 - width) / 2

  return (
    <svg aria-hidden="true" viewBox="0 0 180 40" className="mx-auto h-10 w-44">
      {bits.split('').map((bit, index) =>
        bit === '1' ? (
          <rect
            key={index}
            x={offset + index * 2}
            y="1"
            width="1.5"
            height="34"
            rx="0.3"
            fill="#0E532B"
          />
        ) : null,
      )}
    </svg>
  )
}

function Payments() {
  const { t } = useLanguage()
  const toast = useToast()
  const [transactions, setTransactions] = useState(initialTransactions)
  const [dateRange, setDateRange] = useState('This Month')
  const [statusFilter, setStatusFilter] = useState('All')
  const [methodFilter, setMethodFilter] = useState('All Methods')
  const [search, setSearch] = useState('')
  const [receiptId, setReceiptId] = useState(null)

  useEffect(() => {
    let active = true
    ordersApi.getAll()
      .then((orders) => {
        if (!active) return
        setTransactions(orders.flatMap((order) => (order.transactions || []).map((transaction) => {
          const methodNames = {
            COD: 'Cash on Delivery',
            CHAPA: 'Chapa Card',
            CBE_BIRR: 'CBE Birr',
            TELEBIRR: 'Telebirr',
          }
          const statusNames = {
            PENDING: 'Pending',
            PENDING_COD: 'Pending',
            PAID: 'Completed',
            COMPLETED: 'Completed',
            FAILED: 'Failed',
          }
          return {
            id: transaction.txnCode || transaction.txRef || transaction.id,
            orderId: order.code || order.id,
            customer: order.customerName || 'Customer',
            email: order.email || '',
            method: methodNames[transaction.method] || transaction.method,
            date: transaction.createdAt || order.date,
            amount: Number(transaction.amount) || 0,
            subtotal: Number(order.subtotal) || 0,
            deliveryFee: Number(order.deliveryFee) || 0,
            discount: Number(order.discount) || 0,
            status: statusNames[transaction.status] || transaction.status,
            riderId: order.rider?.id,
          }
        })))
      })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Could not load payment transactions.')))
    return () => {
      active = false
    }
  }, [toast])

  const rangeStart = getRangeStart(dateRange)
  const rangeTransactions = useMemo(
    () => transactions.filter((transaction) => new Date(transaction.date) >= rangeStart),
    [transactions, rangeStart],
  )
  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase()
    return rangeTransactions.filter((transaction) => {
      const matchesSearch = `${transaction.id} ${transaction.orderId} ${transaction.customer}`
        .toLowerCase()
        .includes(query)
      const matchesStatus = statusFilter === 'All' || transaction.status === statusFilter
      const matchesMethod = methodFilter === 'All Methods' || transaction.method === methodFilter
      return matchesSearch && matchesStatus && matchesMethod
    })
  }, [rangeTransactions, search, statusFilter, methodFilter])

  const completedTransactions = rangeTransactions.filter((item) => item.status === 'Completed')
  const pendingTransactions = rangeTransactions.filter((item) => item.status === 'Pending')
  const attentionTransactions = rangeTransactions.filter(
    (item) => item.status === 'Refunded' || item.status === 'Failed',
  )
  const grossRevenue = completedTransactions.reduce((sum, item) => sum + item.amount, 0)
  const completedTotal = grossRevenue
  const pendingTotal = pendingTransactions.reduce((sum, item) => sum + item.amount, 0)
  const attentionTotal = attentionTransactions.reduce((sum, item) => sum + item.amount, 0)
  const selectedReceipt = transactions.find((item) => item.id === receiptId)
  const selectedReceiptPaid = selectedReceipt?.status === 'Completed'
  const selectedReceiptMethod = selectedReceipt?.method || 'Not specified'
  const selectedReceiptIsCod = /cash|cod/i.test(selectedReceiptMethod)
  const receiptPaymentLabel = selectedReceiptPaid
    ? `✓ Paid via ${selectedReceiptMethod}`
    : selectedReceiptIsCod && selectedReceipt?.status === 'Pending'
      ? 'Cash on Delivery (Pending)'
      : `${selectedReceipt ? t(selectedReceipt.status) : ''} via ${selectedReceiptMethod}`
  const receiptTotalLabel =
    selectedReceipt?.status === 'Completed'
      ? t('transactions.totalPaid')
      : selectedReceipt?.status === 'Refunded'
        ? 'Total Refunded'
        : 'Total Due'

  const markSettled = async (transaction) => {
    if (!transaction.riderId) {
      toast.error('This COD transaction is not associated with a delivery rider.')
      return
    }
    try {
      await paymentsApi.settleCod({ riderId: transaction.riderId, amount: transaction.amount })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not settle this COD transaction.'))
      return
    }
    setTransactions((current) => current.map((item) =>
      item.id === transaction.id ? { ...item, status: 'Completed', settledAt: new Date().toISOString() } : item,
    ))
    logAuditEvent({
      action: 'Settled cash payment',
      category: 'Administration',
      resource: transaction.id,
      details: `Order ${transaction.orderId}`,
    })
    toast.success(`COD payment for ${transaction.orderId} settled.`)
  }

  const refundTransaction = (transaction) => {
    if (
      !window.confirm(
        `Refund ${money(transaction.amount)} for ${transaction.id} (${transaction.customer})?`,
      )
    ) {
      return
    }
    toast.warning('Refunds are not available through the current payment API.')
  }

  const exportCsv = () => {
    const rows = [
      ['Transaction ID', 'Order ID', 'Customer', 'Payment Method', 'Date', 'Amount (ETB)', 'Status'],
      ...filteredTransactions.map((transaction) => [
        transaction.id,
        transaction.orderId,
        transaction.customer,
        transaction.method,
        new Date(transaction.date).toLocaleString(),
        transaction.status === 'Refunded' ? -transaction.amount : transaction.amount,
        transaction.status,
      ]),
    ]
    const csv = rows
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `grocery-transactions-${dateRange.toLowerCase().replaceAll(' ', '-')}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
    toast.success('Transaction report exported successfully.')
  }

  const methodBreakdown = methods.map((method) => {
    const methodTransactions = rangeTransactions.filter(
      (transaction) => transaction.method === method,
    )
    const revenue = methodTransactions
      .filter((transaction) => transaction.status === 'Completed')
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    const count = methodTransactions.length
    const share = grossRevenue ? Math.round((revenue / grossRevenue) * 100) : 0
    return { method, revenue, count, share }
  })

  return (
    <div className="mx-auto max-w-[1600px]">
      <header className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
            <span className="h-2 w-2 rounded-full bg-[#1E8E3E]" />
            <span className="font-bold text-[#0E532B]">GROCERY</span>{' '}
            <span className="font-bold text-[#F04E00]">DELIVERY</span>{' '}
            <span className="font-bold text-[#0B4B8C]">SYSTEM</span>
            <span className="text-slate-300">/</span> {t('transactions.finance')}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0E532B] sm:text-[30px]">
            {t('transactionsPayments')}
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500">
            {t('transactions.description')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div role="group" aria-label={t('common.dateRange')} className="flex h-11 items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            {dateRanges.map((range) => (
              <button
                type="button"
                key={range}
                onClick={() => setDateRange(range)}
                aria-pressed={dateRange === range}
                className={`h-9 rounded-lg px-3 text-xs font-semibold transition ${dateRange === range ? 'bg-[#1E8E3E] text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
              >
                {t(range)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#0B4B8C]/30 bg-white px-4 text-sm font-semibold text-[#0B4B8C] shadow-sm transition hover:bg-[#0B4B8C] hover:text-white"
          >
            <Download size={17} /> {t('common.exportCsv')}
          </button>
        </div>
      </header>

      <section aria-label={t('common.financialOverview')} className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-500 sm:text-sm">{t('transactions.grossRevenue')}</p>
              <p className="mt-3 text-xl font-bold tracking-tight text-[#0E532B] sm:text-2xl">{money(grossRevenue)}</p>
              <p className="mt-1.5 text-xs text-slate-500">{t(dateRange)} · {t('transactions.completedTransactions')}</p>
            </div>
            <span className="rounded-xl bg-[#EAF5EC] p-2.5 text-[#1E8E3E]"><ArrowUpRight size={19} /></span>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-[#1E8E3E]"><CheckCircle2 size={14} /> {t('transactions.capturedRevenue')}</div>
        </article>
        <article className="rounded-2xl border border-[#DDEEE0] bg-[#F0F7F1] p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-[#0E532B] sm:text-sm">{t('transactions.completedPayments')}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[#0E532B]">{completedTransactions.length}</p>
              <p className="mt-1.5 text-xs text-[#477153]">{money(completedTotal)} {t('transactions.settled')}</p>
            </div>
            <span className="rounded-xl bg-white/80 p-2.5 text-[#1E8E3E]"><Check size={19} /></span>
          </div>
          <div className="mt-4"><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#0E722F]">{t('Completed')}</span></div>
        </article>
        <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-[#F04E00] sm:text-sm">{t('transactions.pendingCodToSettle')}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[#0E532B]">{pendingTransactions.length}</p>
              <p className="mt-1.5 text-xs text-[#0E532B]">{money(pendingTotal)} {t('transactions.waitingForRider')}</p>
            </div>
            <span className="rounded-xl bg-orange-50 p-2.5 text-[#F04E00]"><Clock3 size={19} /></span>
          </div>
          <div className="mt-4"><span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-semibold text-[#F04E00]">{t('transactions.awaitingSettlement')}</span></div>
        </article>
        <article className="rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-[#F04E00] sm:text-sm">{t('transactions.refundedFailed')}</p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[#B53B05]">{attentionTransactions.length}</p>
              <p className="mt-1.5 text-xs text-[#0E532B]">{money(attentionTotal)} {t('transactions.totalAmount')}</p>
            </div>
            <span className="rounded-xl bg-white/80 p-2.5 text-[#F04E00]"><RotateCcw size={19} /></span>
          </div>
          <div className="mt-4"><span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#B53B05]">{t('common.needsReview')}</span></div>
        </article>
      </section>

      <section aria-label={t('common.paymentMethodBreakdown')} className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#0E532B]">{t('transactions.paymentMethodBreakdown')}</h2>
            <p className="mt-0.5 text-xs text-slate-500">Share of completed revenue · {dateRange}</p>
          </div>
          <span className="hidden text-[11px] font-medium text-slate-400 sm:inline">{t('transactions.revenueTransactionVolume')}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {methodBreakdown.map(({ method, revenue, count, share }) => {
            const MethodIcon = methodIcons[method]
            return (
              <div key={method} className="rounded-xl border border-slate-100 bg-[#FCFDFC] p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${methodStyles[method]}`}>
                    <MethodIcon size={13} /> {method === 'Cash on Delivery' ? 'Cash on Delivery (COD)' : method}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{share}%</span>
                </div>
                <div className="mt-3 flex items-end justify-between gap-2">
                  <span className="text-sm font-bold text-[#0E532B]">{money(revenue)}</span>
                  <span className="text-[11px] text-slate-400">{count} {t('transactions.transactions')}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${method === 'Telebirr' || method === 'CBE Birr' ? 'bg-[#0B4B8C]' : method === 'Chapa Card' ? 'bg-[#1E8E3E]' : 'bg-[#F04E00]'}`}
                    style={{ width: `${share}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#0E532B]">{t('transactions.transactionHistory')}</h2>
              <p className="mt-0.5 text-xs text-slate-500">Payments, settlements, and refunds for {dateRange.toLowerCase()}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-slate-200 px-3 text-slate-400 focus-within:border-[#1E8E3E] sm:w-[340px]">
                <Search size={16} className="shrink-0" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('transactions.searchPlaceholder')}
                  aria-label={t('transactions.searchPlaceholder')}
                  className="min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 sm:text-sm"
                />
              </label>
              <label className="relative flex h-10 items-center rounded-xl border border-slate-200 px-3">
                <Filter size={15} className="mr-2 shrink-0 text-slate-400" />
                <select
                  value={methodFilter}
                  onChange={(event) => setMethodFilter(event.target.value)}
                  aria-label={t('transactions.filterByPaymentMethod')}
                  className="h-full w-full appearance-none bg-transparent pr-5 text-xs font-medium text-slate-600 outline-none sm:text-sm"
                >
                  <option>{t('transactions.allMethods')}</option>
                  {methods.map((method) => <option key={method} value={method}>{method}</option>)}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 text-slate-400" />
              </label>
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            {statuses.map((status) => {
              const count = status === 'All'
                ? rangeTransactions.length
                : rangeTransactions.filter((item) => item.status === status).length
              return (
                <button
                  type="button"
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  aria-pressed={statusFilter === status}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${statusFilter === status ? 'bg-[#1E8E3E] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  {t(status)}<span className={`text-[10px] ${statusFilter === status ? 'text-white/75' : 'text-slate-400'}`}>{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-[#F8FAF8] text-[10px] font-bold uppercase tracking-[0.1em] text-[#0E532B]/75">
              <tr>
                <th className="px-5 py-3.5">{t('transactions.transactionOrder')}</th>
                <th className="px-4 py-3.5">{t('common.customer')}</th>
                <th className="px-4 py-3.5">{t('transactions.paymentMethod')}</th>
                <th className="px-4 py-3.5">{t('common.dateTime')}</th>
                <th className="px-4 py-3.5">{t('common.amount')}</th>
                <th className="px-4 py-3.5">{t('status')}</th>
                <th className="px-4 py-3.5 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((transaction) => {
                const MethodIcon = methodIcons[transaction.method]
                const amountPrefix = transaction.status === 'Refunded' ? '-' : transaction.status === 'Completed' ? '+' : ''
                return (
                  <tr key={transaction.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-[#0B4B8C]">{transaction.id}</p>
                      <p className="mt-1 text-[11px] font-medium text-[#0B4B8C]">{transaction.orderId}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-slate-700">{transaction.customer}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{transaction.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${methodStyles[transaction.method]}`}>
                        <MethodIcon size={13} /> {transaction.method === 'Cash on Delivery' ? 'Cash on Delivery (COD)' : transaction.method}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">{formatTransactionDate(transaction.date)}</td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <p className="text-sm font-bold text-[#0E532B]">
                        {amountPrefix}{money(transaction.amount)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClassNames[transaction.status]}`}>
                        {t(transaction.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {transaction.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => markSettled(transaction)}
                            className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#1E8E3E] px-2.5 text-xs font-semibold text-white transition hover:bg-[#0E532B]"
                          >
                            <Check size={13} /> {t('transactions.markSettled')}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setReceiptId(transaction.id)}
                          aria-label={`${t('transactions.viewReceipt')} ${transaction.id}`}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#0B4B8C]/30 px-2.5 text-xs font-semibold text-[#0B4B8C] transition hover:bg-[#0B4B8C] hover:text-white"
                        >
                          <Eye size={14} /> {t('transactions.receipt')}
                        </button>
                        {transaction.status === 'Completed' && (
                          <button
                            type="button"
                            onClick={() => refundTransaction(transaction)}
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-orange-200 px-2.5 text-xs font-semibold text-[#B53B05] transition hover:bg-orange-50"
                          >
                            <RotateCcw size={13} /> {t('transactions.refund')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredTransactions.length === 0 && (
                <tr><td colSpan="7" className="px-5 py-16 text-center text-sm text-slate-500">{t('transactions.noMatchingTransactions')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-[#FCFDFC] px-5 py-3 text-[11px] text-slate-500">
          <span>{t('common.showing')} {filteredTransactions.length} / {rangeTransactions.length} {t('transactions.transactions')}</span>
          <span>{t(dateRange)} · {money(grossRevenue)} {t('transactions.completedRevenue')}</span>
        </footer>
      </section>

      {selectedReceipt && (
        <Modal title={t('transactions.paymentReceipt')} onClose={() => setReceiptId(null)} size="max-w-2xl">
          <style>{`
            @media print {
              body * { visibility: hidden !important; }
              .payment-receipt-print, .payment-receipt-print * { visibility: visible !important; }
              .payment-receipt-print { position: fixed !important; inset: 0 !important; width: 100% !important; max-width: none !important; height: 100vh !important; margin: 0 !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; background: white !important; }
              .payment-receipt-no-print { display: none !important; }
            }
          `}</style>
          <div className="payment-receipt-print overflow-hidden rounded-xl border border-gray-200 bg-white">
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-dashed border-gray-300 bg-gradient-to-r from-[#F3FAF6] via-white to-[#FFF4EC] px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="" className="h-11 w-11 rounded-xl bg-white p-1 shadow-sm" />
                  <div>
                    <p className="text-sm font-extrabold tracking-tight">
                      <span className="text-[#0E532B]">GROCERY</span>{' '}
                      <span className="text-[#F04E00]">DELIVERY</span>{' '}
                      <span className="text-[#0B4B8C]">SYSTEM</span>
                    </p>
                    <p className="mt-0.5 text-[10px] font-semibold tracking-[0.16em] text-gray-500">
                      SPEED • FRESH • DIRECT
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-5 text-gray-500">
                  Bole Road, Addis Ababa • +251 962714305 • TIN: 0048291042
                </p>
              </div>
              <span className="rounded-full border border-[#0B4B8C]/15 bg-white/80 px-3 py-1.5 text-[11px] font-bold text-[#0B4B8C]">
                Receipt # RCP-{selectedReceipt.orderId || selectedReceipt.id}
              </span>
            </header>

            <section className="border-b border-dashed border-gray-200 px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  selectedReceiptPaid
                    ? 'bg-emerald-100 text-[#0E722F]'
                    : selectedReceiptIsCod
                      ? 'bg-orange-50 text-[#F04E00]'
                      : 'bg-amber-50 text-amber-700'
                }`}>
                  {receiptPaymentLabel}
                </span>
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusClassNames[selectedReceipt.status]}`}>
                  {t(selectedReceipt.status)}
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-xs sm:grid-cols-2">
                <div>
                  <dt className="text-gray-400">{t('transactions.orderId')}</dt>
                  <dd className="mt-1 font-extrabold text-[#0B4B8C]">{selectedReceipt.orderId}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">{t('common.dateTime')}</dt>
                  <dd className="mt-1 font-semibold text-gray-800">{formatTransactionDate(selectedReceipt.date)}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">{t('common.customer')}</dt>
                  <dd className="mt-1 font-semibold text-gray-800">{selectedReceipt.customer}</dd>
                  <dd className="mt-0.5 text-gray-500">{selectedReceipt.email}</dd>
                </div>
                <div>
                  <dt className="text-gray-400">{t('transactions.transactionId')}</dt>
                  <dd className="mt-1 font-semibold text-[#0B4B8C]">{selectedReceipt.id}</dd>
                </div>
              </dl>
            </section>

            <section className="px-5 py-4 sm:px-6">
              <div className="rounded-xl bg-gray-50 p-4 text-xs">
                <div className="flex justify-between gap-4 text-gray-600">
                  <span>{t('transactions.subtotal')}</span>
                  <span>{money(selectedReceipt.subtotal)}</span>
                </div>
                <div className="mt-2 flex justify-between gap-4 text-gray-600">
                  <span>{t('transactions.discount')}</span>
                  <span className="text-[#1E8E3E]">−{money(selectedReceipt.discount)}</span>
                </div>
                <div className="mt-2 flex justify-between gap-4 text-gray-600">
                  <span>{t('transactions.deliveryFee')}</span>
                  <span>{money(selectedReceipt.deliveryFee)}</span>
                </div>
                <div className="mt-3 flex justify-between gap-4 border-t border-gray-200 pt-3 text-lg font-extrabold text-[#0E532B]">
                  <span>{receiptTotalLabel}</span>
                  <span>{money(selectedReceipt.amount)}</span>
                </div>
              </div>
            </section>

            <footer className="border-t border-dashed border-gray-300 px-5 py-4 text-center sm:px-6">
              <PaymentReceiptBarcode value={selectedReceipt.orderId || selectedReceipt.id} />
              <p className="mt-1 font-mono text-xs font-semibold tracking-[0.22em] text-gray-600">
                *{selectedReceipt.orderId || selectedReceipt.id}*
              </p>
              <p className="mt-3 text-xs font-medium text-gray-500">
                Thank you for shopping fresh with Grocery Delivery System!
              </p>
              <div className="payment-receipt-no-print mt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReceiptId(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#0B4B8C] hover:text-[#0B4B8C]"
                >
                  {t('common.close')}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1E8E3E] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0E532B]"
                >
                  <Printer aria-hidden="true" size={16} />
                  Print / Save PDF
                </button>
              </div>
            </footer>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Payments
