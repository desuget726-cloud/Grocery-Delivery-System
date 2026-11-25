import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  ClipboardList,
  CreditCard,
  Headset,
  MessageSquareText,
  Package,
  Search,
  Star,
  Trash2,
} from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../../context/LanguageContext.jsx'
import useAdminNotifications from '../../hooks/useAdminNotifications.js'

const filters = ['All', 'Unread', 'Orders', 'Inventory', 'Reviews', 'Payments', 'Support']
const filterTranslationKeys = {
  All: 'All',
  Unread: 'unread',
  Orders: 'orders',
  Inventory: 'inventory',
  Reviews: 'review',
  Payments: 'transactions',
  Support: 'help',
}

const categoryStyles = {
  Orders: 'bg-blue-50 text-[#0B4B8C]',
  Inventory: 'bg-orange-50 text-[#F04E00]',
  Reviews: 'bg-emerald-50 text-[#1E8E3E]',
  Payments: 'bg-blue-50 text-[#0B4B8C]',
  Support: 'bg-emerald-50 text-[#1E8E3E]',
}

const categoryIcons = {
  Orders: ClipboardList,
  Inventory: Package,
  Reviews: Star,
  Payments: CreditCard,
  Support: Headset,
}

const priorityStyles = {
  Urgent: 'bg-orange-50 text-[#F04E00]',
  High: 'bg-blue-50 text-[#0B4B8C]',
  Normal: 'bg-slate-100 text-slate-600',
}

const kpiCards = [
  { translationKey: 'unreadAlerts', icon: Bell, color: 'text-[#F04E00]', getValue: (items) => items.filter((item) => item.unread).length },
  { translationKey: 'orderAlerts', icon: ClipboardList, color: 'text-[#0B4B8C]', getValue: (items) => items.filter((item) => item.category === 'Orders').length },
  { translationKey: 'stockAndExpiry', icon: AlertTriangle, color: 'text-[#F04E00]', getValue: (items) => items.filter((item) => item.category === 'Inventory').length },
  { translationKey: 'reviewsAndSupport', icon: MessageSquareText, color: 'text-[#1E8E3E]', getValue: (items) => items.filter((item) => ['Reviews', 'Support'].includes(item.category)).length },
]

function Notifications() {
  const { t } = useLanguage()
  const [notifications, setNotifications] = useAdminNotifications()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const highlightedId = searchParams.get('highlight')
  const highlightedCard = useRef(null)
  const unreadCount = notifications.filter((notification) => notification.unread).length
  const readCount = notifications.length - unreadCount

  const visibleNotifications = useMemo(() => {
    const query = search.trim().toLowerCase()
    return notifications.filter((notification) => {
      const matchesFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Unread'
          ? notification.unread
          : notification.category === activeFilter)
      const matchesSearch =
        !query ||
        `${notification.title} ${notification.category} ${notification.priority} ${notification.description}`
          .toLowerCase()
          .includes(query)
      return matchesFilter && matchesSearch
    })
  }, [notifications, activeFilter, search])

  useEffect(() => {
    if (highlightedId) highlightedCard.current?.scrollIntoView({ block: 'center' })
  }, [highlightedId])

  const markAllRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, unread: false })),
    )
  }

  const toggleRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, unread: !notification.unread }
          : notification,
      ),
    )
  }

  const deleteNotification = (id) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id))
  }

  const clearRead = () => {
    setNotifications((current) => current.filter((notification) => notification.unread))
  }

  return (
    <div className="mx-auto max-w-[1440px]">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
            <span className="h-2 w-2 rounded-full bg-[#1E8E3E]" />
            <span className="font-bold text-[#0E532B]">GROCERY</span>
            <span className="font-bold text-[#F04E00]">DELIVERY</span>
            <span className="font-bold text-[#0B4B8C]">SYSTEM</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0E532B] sm:text-[30px]">
            {t('notificationBoard')}
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500">
            {t('common.notificationsDescription')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#1E8E3E] hover:text-[#1E8E3E] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck aria-hidden="true" size={16} />
            {t('common.markAllRead')}
          </button>
          <button
            type="button"
            onClick={clearRead}
            disabled={readCount === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#F04E00] hover:text-[#F04E00] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 aria-hidden="true" size={16} />
            {t('common.clearRead')}
          </button>
          <Link
            to="/admin/settings"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0E532B] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1E8E3E]"
          >
            {t('common.alertSettings')}
          </Link>
        </div>
      </header>

      <section aria-label={t('common.notificationSummary')} className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpiCards.map(({ translationKey, icon: Icon, color, getValue }) => (
          <article key={translationKey} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{t(translationKey)}</p>
                <p className="mt-1.5 text-2xl font-bold text-[#0E532B]">{getValue(notifications)}</p>
              </div>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 ${color}`}>
                <Icon aria-hidden="true" size={20} />
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label={t('common.filterNotifications')}>
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    activeFilter === filter
                      ? 'bg-[#0E532B] text-white'
                      : 'text-slate-500 hover:bg-emerald-50 hover:text-[#0E532B]'
                  }`}
                >
                  {t(filterTranslationKeys[filter])}
                </button>
              ))}
            </div>
            <label className="relative block w-full xl:max-w-xs">
              <Search aria-hidden="true" size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('search')}
                  aria-label={t('search')}
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#1E8E3E] focus:ring-2 focus:ring-emerald-100"
              />
            </label>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {visibleNotifications.map((notification) => {
            const Icon = categoryIcons[notification.category] || Bell
            const isHighlighted = highlightedId === notification.id
            return (
              <article
                key={notification.id}
                id={`notification-${notification.id}`}
                ref={isHighlighted ? highlightedCard : null}
                className={`border-l-4 p-4 transition sm:p-5 ${
                  notification.unread || isHighlighted
                    ? 'border-l-[#F04E00] bg-orange-50/30'
                    : 'border-l-transparent'
                } ${isHighlighted ? 'ring-2 ring-inset ring-[#F04E00]/30' : ''}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${categoryStyles[notification.category] || 'bg-slate-100 text-slate-600'}`}>
                    <Icon aria-hidden="true" size={20} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryStyles[notification.category] || 'bg-slate-100 text-slate-600'}`}>
                        {t(filterTranslationKeys[notification.category] || notification.category)}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityStyles[notification.priority] || priorityStyles.Normal}`}>
                        {t(notification.priority)}
                      </span>
                      {notification.unread && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F04E00]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#F04E00]" />
                          {t('unread')}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-2 text-base font-bold text-[#0E532B]">{notification.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{notification.description}</p>
                    <p className="mt-2 text-xs font-medium text-slate-400">{notification.timestamp}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(notification.actionPath)}
                        className="inline-flex items-center rounded-xl bg-[#1E8E3E] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#0E532B]"
                      >
                        {t('common.goToAction')}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleRead(notification.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#1E8E3E] hover:text-[#1E8E3E]"
                      >
                        {notification.unread ? (
                          <Check aria-hidden="true" size={15} />
                        ) : (
                          <Bell aria-hidden="true" size={15} />
                        )}
                        {notification.unread ? t('common.markAsRead') : t('common.markAsUnread')}
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${notification.title}`}
                        title={t('delete')}
                        onClick={() => deleteNotification(notification.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-slate-400 transition hover:border-red-200 hover:text-red-600"
                      >
                        <Trash2 aria-hidden="true" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
          {visibleNotifications.length === 0 && (
            <div className="px-5 py-14 text-center">
              <Bell aria-hidden="true" size={28} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-[#0E532B]">{t('common.noNotificationsFound')}</p>
              <p className="mt-1 text-sm text-slate-500">{t('common.tryAnotherFilterSearch')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Notifications
