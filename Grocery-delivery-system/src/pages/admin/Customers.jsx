import { Search, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AdminPageHeader, StatusBadge, StatCard } from '../../components/admin/AdminUI.jsx'
import { mockCustomers } from '../../data/adminMockData.js'
import formatCurrency from '../../utils/formatCurrency.js'

function Customers() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const visibleCustomers = useMemo(
    () =>
      mockCustomers.filter((customer) => {
        const matchesSearch = `${customer.name} ${customer.email}`
          .toLowerCase()
          .includes(search.trim().toLowerCase())
        return matchesSearch && (statusFilter === 'All' || customer.status === statusFilter)
      }),
    [search, statusFilter],
  )

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        description="Review customer accounts and their order history."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total customers" value={mockCustomers.length} icon={Users} />
        <StatCard
          label="Active accounts"
          value={mockCustomers.filter((customer) => customer.status === 'Active').length}
          tone="emerald"
        />
        <StatCard
          label="Lifetime sales"
          value={formatCurrency(mockCustomers.reduce((total, customer) => total + customer.totalSpent, 0))}
          detail="Across listed customers"
          tone="blue"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <Search aria-hidden="true" size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email..."
              aria-label="Search customers"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
            />
          </label>
          <select
            aria-label="Filter customers by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
          >
            <option>All</option>
            <option>Active</option>
            <option>Suspended</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Customer</th>
                <th className="px-5 py-3 font-semibold">Phone</th>
                <th className="px-5 py-3 font-semibold">Total orders</th>
                <th className="px-5 py-3 font-semibold">Total spent</th>
                <th className="px-5 py-3 font-semibold">Account status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{customer.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{customer.email}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{customer.phone}</td>
                  <td className="px-5 py-4 text-slate-700">{customer.totalOrders}</td>
                  <td className="px-5 py-4 font-medium text-slate-900">{formatCurrency(customer.totalSpent)}</td>
                  <td className="px-5 py-4"><StatusBadge status={customer.status} /></td>
                </tr>
              ))}
              {visibleCustomers.length === 0 && (
                <tr><td colSpan="5" className="px-5 py-12 text-center text-slate-500">No customers match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default Customers
