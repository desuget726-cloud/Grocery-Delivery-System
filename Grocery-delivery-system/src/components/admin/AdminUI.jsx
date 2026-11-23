import { X } from 'lucide-react'

export function AdminPageHeader({ title, description, action }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </header>
  )
}

export function StatCard({ label, value, detail, icon: Icon, tone = 'emerald' }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    violet: 'bg-violet-50 text-violet-700',
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
        </div>
        {Icon && (
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone] || tones.emerald}`}>
            <Icon aria-hidden="true" size={20} />
          </span>
        )}
      </div>
    </article>
  )
}

export function StatusBadge({ status }) {
  const statusStyles = {
    pending: 'bg-amber-50 text-amber-700',
    confirmed: 'bg-blue-50 text-blue-700',
    packed: 'bg-violet-50 text-violet-700',
    'out for delivery': 'bg-sky-50 text-sky-700',
    delivered: 'bg-emerald-50 text-emerald-700',
    active: 'bg-emerald-50 text-emerald-700',
    offline: 'bg-slate-100 text-slate-600',
    suspended: 'bg-rose-50 text-rose-700',
    'in stock': 'bg-emerald-50 text-emerald-700',
    'low stock': 'bg-amber-50 text-amber-700',
    'out of stock': 'bg-rose-50 text-rose-700',
  }
  const style = statusStyles[String(status).toLowerCase()] || 'bg-slate-100 text-slate-600'

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>
      {status}
    </span>
  )
}

export function Modal({ title, onClose, children, size = 'max-w-lg' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="fixed inset-0 bg-slate-950/50"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className={`relative z-10 max-h-[90vh] w-full ${size} overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6`}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id="admin-modal-title" className="text-lg font-bold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}
