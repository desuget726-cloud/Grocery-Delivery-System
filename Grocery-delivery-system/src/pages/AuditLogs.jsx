import { ClipboardList, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  AUDIT_LOG_CHANGE_EVENT,
  readAuditLogs,
} from '../services/auditLog.js'

function AuditLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const refreshLogs = () => {
      try {
        setLogs(readAuditLogs())
        setLoadError('')
      } catch (error) {
        console.error('Unable to load audit logs:', error)
        setLoadError('Audit logs could not be loaded from this browser.')
      }
    }

    refreshLogs()
    window.addEventListener(AUDIT_LOG_CHANGE_EVENT, refreshLogs)
    window.addEventListener('storage', refreshLogs)
    return () => {
      window.removeEventListener(AUDIT_LOG_CHANGE_EVENT, refreshLogs)
      window.removeEventListener('storage', refreshLogs)
    }
  }, [])

  const visibleLogs = useMemo(() => {
    const query = search.trim().toLowerCase()
    return logs
      .filter((entry) => user?.role === 'admin' || entry.actor?.id === user?.id)
      .filter((entry) => category === 'All' || entry.category === category)
      .filter((entry) => {
        if (!query) return true
        return [
          entry.actor?.name,
          entry.actor?.role,
          entry.action,
          entry.category,
          entry.resource,
          entry.details,
        ].some((value) => String(value || '').toLowerCase().includes(query))
      })
  }, [category, logs, search, user?.id, user?.role])

  const categories = useMemo(
    () => ['All', ...new Set(logs.map((entry) => entry.category).filter(Boolean))],
    [logs],
  )

  return (
    <div className={`mx-auto w-full max-w-6xl space-y-6 ${user?.role === 'delivery' ? 'px-4 py-8 sm:px-6 lg:px-10' : ''}`}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#1E8E3E]">Activity &amp; compliance</p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900">Audit logs</h1>
          <p className="mt-2 text-sm text-slate-500">
            {user?.role === 'admin'
              ? 'Review recorded customer, delivery, and administration activity.'
              : 'Review activity recorded for your account.'}
          </p>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
          Stored in this browser
        </span>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row">
          <label className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-[#1E8E3E]">
            <Search aria-hidden="true" size={17} className="text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search actor, action, resource..."
              aria-label="Search audit logs"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter audit logs by category"
            className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
          >
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>

        {loadError ? (
          <p role="alert" className="p-8 text-center text-sm font-medium text-rose-700">
            {loadError}
          </p>
        ) : visibleLogs.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">Date &amp; time</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Actor</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Action</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Resource</th>
                  <th scope="col" className="px-5 py-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleLogs.map((entry) => (
                  <tr key={entry.id} className="align-top hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{entry.actor?.name || 'Unknown user'}</p>
                      <p className="mt-0.5 capitalize text-xs text-slate-500">{entry.actor?.role || 'unknown'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{entry.action}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{entry.category}</p>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">{entry.resource}</td>
                    <td className="max-w-sm whitespace-normal px-5 py-4 text-slate-600">{entry.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <ClipboardList aria-hidden="true" size={32} className="mx-auto text-slate-300" />
            <p className="mt-3 font-semibold text-slate-700">No audit activity found</p>
            <p className="mt-1 text-sm text-slate-500">
              Activity will appear here as users and staff perform actions.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

export default AuditLogs
