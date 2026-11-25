import { X } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext.jsx'

export function AdminPageHeader({ title, description, action }) {
  const { t } = useLanguage()
  const titleKeys = {
    Categories: 'categories',
    Products: 'products',
    Orders: 'allOrders',
    'Coupon Codes & Promotions': 'couponCodesPromotions',
    Reports: 'reports',
  }

  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0E532B] sm:text-3xl">
          {t(titleKeys[title] || title)}
        </h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </header>
  )
}

export function StatCard({ label, value, detail, icon: Icon, tone = 'emerald' }) {
  const { t } = useLanguage()
  const labelKeys = {
    Sales: 'sales',
    Orders: 'orders',
    'Delivery completion': 'deliveryCompletion',
  }
  const tones = {
    emerald: 'bg-emerald-50 text-[#1E8E3E]',
    blue: 'bg-blue-50 text-[#0B4B8C]',
    amber: 'bg-orange-50 text-[#F04E00]',
    rose: 'bg-orange-50 text-[#F04E00]',
    violet: 'bg-blue-50 text-[#0B4B8C]',
  }

  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {t(labelKeys[label] || label)}
          </p>
          <p className="mt-2 text-2xl font-bold text-[#0E532B]">{value}</p>
          {detail && <p className="mt-1 text-xs text-slate-500">{t(detail)}</p>}
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
  const { t } = useLanguage()
  const statusStyles = {
    pending: 'bg-orange-50 text-[#F04E00]',
    confirmed: 'bg-emerald-50 text-[#1E8E3E]',
    packed: 'bg-emerald-50 text-[#1E8E3E]',
    'out for delivery': 'bg-blue-50 text-[#0B4B8C]',
    delivered: 'bg-blue-50 text-[#0B4B8C]',
    active: 'bg-emerald-50 text-[#1E8E3E]',
    offline: 'bg-slate-100 text-slate-600',
    suspended: 'bg-orange-50 text-[#F04E00]',
    'in stock': 'bg-emerald-50 text-[#1E8E3E]',
    'low stock': 'bg-orange-50 text-[#F04E00]',
    'out of stock': 'bg-orange-50 text-[#F04E00]',
  }
  const style = statusStyles[String(status).toLowerCase()] || 'bg-slate-100 text-slate-600'

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>
      {t(status)}
    </span>
  )
}

export function Modal({ title, onClose, children, size = 'max-w-lg' }) {
  const { t } = useLanguage()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <button
        type="button"
        aria-label={t('common.closeDialog')}
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
          <h2 id="admin-modal-title" className="text-lg font-bold text-[#0E532B]">
            {title}
          </h2>
          <button
            type="button"
            aria-label={t('common.closeDialog')}
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
