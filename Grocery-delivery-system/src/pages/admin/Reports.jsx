import { Download, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AdminPageHeader, StatCard, StatusBadge } from '../../components/admin/AdminUI.jsx'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { loadOrders, products as initialProducts } from '../../data/mockData.js'
import usePersistentState from '../../hooks/usePersistentState.js'
import formatCurrency from '../../utils/formatCurrency.js'

function Reports() {
  const { t } = useLanguage()
  const [orders] = usePersistentState('grocery-orders', loadOrders)
  const [products] = usePersistentState('admin-products', initialProducts)
  const todayDate = new Date()
  const today = todayDate.toISOString().slice(0, 10)
  const monthAgoDate = new Date(todayDate)
  monthAgoDate.setDate(monthAgoDate.getDate() - 29)
  const monthAgo = monthAgoDate.toISOString().slice(0, 10)
  const [startDate, setStartDate] = useState(monthAgo)
  const [endDate, setEndDate] = useState(today)

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const orderDate = new Date(order.date).toISOString().slice(0, 10)
        return orderDate >= startDate && orderDate <= endDate
      }),
    [endDate, orders, startDate],
  )

  const totalSales = filteredOrders.reduce((sum, order) => sum + Number(order.total || 0), 0)
  const deliveredOrders = filteredOrders.filter((order) => order.status === 'Delivered').length
  const deliveryRate = filteredOrders.length
    ? Math.round((deliveredOrders / filteredOrders.length) * 100)
    : 0

  const categoryPerformance = useMemo(() => {
    const categories = new Map()
    const categoryByProduct = new Map(products.map((product) => [product.id, product.category]))

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const category = categoryByProduct.get(item.id) || 'Other'
        const current = categories.get(category) || { category, sales: 0, units: 0 }
        current.sales += item.price * item.quantity
        current.units += item.quantity
        categories.set(category, current)
      })
    })

    return [...categories.values()].sort((a, b) => b.sales - a.sales)
  }, [filteredOrders, products])

  const dailySales = useMemo(() => {
    const sales = new Map()
    filteredOrders.forEach((order) => {
      const date = new Date(order.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
      sales.set(date, (sales.get(date) || 0) + Number(order.total || 0))
    })
    return [...sales.entries()]
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [filteredOrders])

  const exportReport = () => {
    const escapeCsv = (value) => `"${String(value).replaceAll('"', '""')}"`
    const rows = [
      ['Order ID', 'Date', 'Status', 'Items', 'Total'],
      ...filteredOrders.map((order) => [
        order.id,
        new Date(order.date).toLocaleDateString(),
        order.status,
        order.items.reduce((sum, item) => sum + item.quantity, 0),
        order.total,
      ]),
    ]
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `grocery-sales-${startDate}-to-${endDate}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const chartMax = Math.max(1, ...dailySales.map((item) => item.amount))

  return (
    <div>
      <AdminPageHeader
        title="Reports"
        description="Review sales, category performance, and delivery outcomes."
        action={
          <button
            type="button"
            onClick={exportReport}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0B4B8C]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#0B4B8C] transition hover:bg-[#0B4B8C] hover:text-white"
          >
            <Download aria-hidden="true" size={17} /> Export CSV
          </button>
        }
      />

      <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <label className="text-sm font-medium text-slate-700">
          From
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="mt-1.5 block rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1E8E3E]"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          To
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={today}
            onChange={(event) => setEndDate(event.target.value)}
            className="mt-1.5 block rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1E8E3E]"
          />
        </label>
        <p className="text-sm text-slate-500 sm:ml-auto">
          {filteredOrders.length} orders in selected date range
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Sales" value={formatCurrency(totalSales)} detail="For selected period" icon={TrendingUp} />
        <StatCard label="Orders" value={filteredOrders.length} detail="For selected period" tone="blue" />
        <StatCard label="Delivery completion" value={`${deliveryRate}%`} detail={`${deliveredOrders} delivered orders`} tone="emerald" />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-bold text-[#0E532B]">{t('salesOverTime')}</h2>
          <p className="mt-1 text-sm text-slate-500">Order revenue by delivery date</p>
          {dailySales.length > 0 ? (
            <div className="mt-7 flex h-56 items-end gap-3 overflow-x-auto border-b border-l border-slate-100 px-3">
              {dailySales.map(({ date, amount }) => (
                <div key={date} className="flex h-full min-w-12 flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] font-semibold text-[#0E532B]">{formatCurrency(amount)}</span>
                  <div
                    className="w-full max-w-14 rounded-t-lg bg-[#1E8E3E]"
                    style={{ height: `${Math.max(4, (amount / chartMax) * 70)}%` }}
                    title={`${date}: ${formatCurrency(amount)}`}
                  />
                  <span className="whitespace-nowrap text-[10px] text-slate-500">{date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-8 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
              No sales found for this date range.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-bold text-[#0E532B]">{t('categoryPerformance')}</h2>
          <p className="mt-1 text-sm text-slate-500">Sales by grocery category</p>
          {categoryPerformance.length > 0 ? (
            <div className="mt-5 space-y-4">
              {categoryPerformance.map(({ category, sales, units }) => (
                <div key={category}>
                  <div className="mb-1.5 flex justify-between gap-3 text-sm">
                    <span className="font-medium text-slate-700">{category}</span>
                    <span className="font-semibold text-[#0E532B]">{formatCurrency(sales)} · {units} units</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#1E8E3E]"
                      style={{ width: `${Math.max(4, (sales / Math.max(1, ...categoryPerformance.map((item) => item.sales))) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-8 rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-500">
              No category sales found for this date range.
            </p>
          )}
        </section>
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-[#0E532B]">{t('deliveryEfficiency')}</h2>
          <p className="mt-1 text-sm text-slate-500">Fulfillment status in the selected period</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[#0E532B]/75">
              <tr><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 font-semibold">Orders</th><th className="px-5 py-3 font-semibold">Share</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {['Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered'].map((status) => {
                const count = filteredOrders.filter((order) => order.status === status).length
                const share = filteredOrders.length ? Math.round((count / filteredOrders.length) * 100) : 0
                return (
                  <tr key={status}>
                    <td className="px-5 py-3"><StatusBadge status={status} /></td>
                    <td className="px-5 py-3 text-slate-700">{count}</td>
                    <td className="px-5 py-3 text-slate-700">{share}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default Reports
