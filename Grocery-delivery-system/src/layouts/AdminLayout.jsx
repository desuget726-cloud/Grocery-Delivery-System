import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  Bike,
  Bell,
  Boxes,
  Check,
  ChevronDown,
  ClipboardList,
  ExternalLink,
  Globe,
  Languages,
  LogOut,
  Menu,
  MessageSquareText,
  Package,
  PackagePlus,
  Plus,
  Search,
  Settings,
  Shield,
  TicketPercent,
  UserRound,
} from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { LANGUAGES, useLanguage } from '../context/LanguageContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import useAdminNotifications from '../hooks/useAdminNotifications.js'

const pageNames = {
  categories: 'categories',
  customers: 'customers',
  dashboard: 'dashboard',
  'delivery-staff': 'deliveryStaff',
  inventory: 'inventory',
  orders: 'allOrders',
  payments: 'transactions',
  products: 'products',
  promotions: 'couponCode',
  reports: 'reports',
  reviews: 'review',
  notifications: 'openNotificationBoard',
  settings: 'settings',
  support: 'help',
}

const searchRecords = [
  {
    title: 'GDS-2531 • Abebe Kebede',
    detail: 'Order · Bole delivery',
    href: '/admin/orders',
    keywords: 'gds-2531 order abebe kebede bole',
    icon: ClipboardList,
    tone: 'bg-blue-50 text-[#0B4B8C]',
  },
  {
    title: 'Organic Hass Avocados',
    detail: 'Product · Fresh produce',
    href: '/admin/products',
    keywords: 'organic hass avocados product produce',
    icon: Package,
    tone: 'bg-emerald-50 text-[#1E8E3E]',
  },
  {
    title: 'Coupons',
    detail: 'Promotions and discounts',
    href: '/admin/promotions',
    keywords: 'coupons promotions discounts',
    icon: TicketPercent,
    tone: 'bg-orange-50 text-[#F04E00]',
  },
  {
    title: 'Inventory',
    detail: 'Stock levels and replenishment',
    href: '/admin/inventory',
    keywords: 'inventory stock replenishment',
    icon: Boxes,
    tone: 'bg-blue-50 text-[#0B4B8C]',
  },
  {
    title: 'Customers',
    detail: 'Shopper accounts and loyalty',
    href: '/admin/customers',
    keywords: 'customers shoppers loyalty',
    icon: UserRound,
    tone: 'bg-emerald-50 text-[#0E532B]',
  },
  {
    title: 'Delivery Staff',
    detail: 'Riders and fleet',
    href: '/admin/delivery-staff',
    keywords: 'riders delivery staff fleet',
    icon: Bike,
    tone: 'bg-blue-50 text-[#0B4B8C]',
  },
]

const quickActions = [
  { translationKey: 'addProduct', href: '/admin/products', icon: PackagePlus },
  { translationKey: 'createCoupon', href: '/admin/promotions', icon: TicketPercent },
  { translationKey: 'addRider', href: '/admin/delivery-staff', icon: Bike },
  { translationKey: 'recordStockIn', href: '/admin/inventory', icon: Boxes },
]

const STORE_SETTINGS_KEY = 'grocery_admin_settings'

function getStoreIsOpen() {
  try {
    const savedSettings = window.localStorage.getItem(STORE_SETTINGS_KEY)
    if (!savedSettings) return true
    return JSON.parse(savedSettings)?.storeProfile?.isOpen !== false
  } catch (error) {
    console.error('Unable to load store availability:', error)
    return true
  }
}

function getPageTitle(pathname, t) {
  const segments = pathname.split('/').filter(Boolean)
  const segment = segments.length > 1 ? segments[segments.length - 1] : 'dashboard'
  return pageNames[segment]
    ? t(pageNames[segment])
    : segment.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openPopover, setOpenPopover] = useState(null)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifications, setNotifications] = useAdminNotifications()
  const [storeIsOpen, setStoreIsOpen] = useState(getStoreIsOpen)
  const unreadCount = notifications.filter((notification) => notification.unread).length
  const { language, setLanguage, t } = useLanguage()
  const { logout, user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const searchInputRef = useRef(null)
  const searchAreaRef = useRef(null)
  const quickAddRef = useRef(null)
  const notificationsRef = useRef(null)
  const languageRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    const syncStoreStatus = (event) => {
      if (event.type === 'grocery-store-status-change') {
        setStoreIsOpen(event.detail?.isOpen !== false)
      } else if (event.key === STORE_SETTINGS_KEY || event.key === null) {
        setStoreIsOpen(getStoreIsOpen())
      }
    }

    window.addEventListener('grocery-store-status-change', syncStoreStatus)
    window.addEventListener('storage', syncStoreStatus)
    return () => {
      window.removeEventListener('grocery-store-status-change', syncStoreStatus)
      window.removeEventListener('storage', syncStoreStatus)
    }
  }, [])

  const pageTitle = getPageTitle(location.pathname, t)
  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return searchRecords.slice(0, 5)
    return searchRecords
      .filter((record) => `${record.title} ${record.detail} ${record.keywords}`.toLowerCase().includes(query))
      .slice(0, 6)
  }, [search])

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!searchAreaRef.current?.contains(event.target)) setSearchOpen(false)
      if (openPopover === 'quickAdd' && !quickAddRef.current?.contains(event.target)) {
        setOpenPopover(null)
      }
      if (openPopover === 'notifications' && !notificationsRef.current?.contains(event.target)) {
        setOpenPopover(null)
      }
      if (openPopover === 'language' && !languageRef.current?.contains(event.target)) {
        setOpenPopover(null)
      }
      if (openPopover === 'profile' && !profileRef.current?.contains(event.target)) {
        setOpenPopover(null)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [openPopover])

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpenPopover(null)
        setSearchOpen(true)
        searchInputRef.current?.focus()
      }
      if (event.key === 'Escape') {
        setOpenPopover(null)
        setSearchOpen(false)
        searchInputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const togglePopover = (name) => {
    setOpenPopover((current) => current === name ? null : name)
  }

  const handleLogout = () => {
    setOpenPopover(null)
    logout()
    navigate('/login')
  }

  const clearSearch = () => {
    setSearch('')
    setSearchOpen(false)
  }

  const openNotification = (notification) => {
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, unread: false } : item,
      ),
    )
    if (notification.unread) toast.success('Notification marked as read.')
    setOpenPopover(null)
    navigate(`/admin/notifications?highlight=${encodeURIComponent(notification.id)}`)
  }

  const markAllNotificationsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, unread: false })),
    )
    if (unreadCount > 0) toast.success('All notifications marked as read.')
  }

  return (
    <div className="flex min-h-screen bg-[#F5F7FA] text-slate-900">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-gray-200/80 bg-white/95 px-3 backdrop-blur-md sm:gap-3 sm:px-4 lg:gap-4 lg:px-6">
          <div className="flex min-w-0 shrink-0 items-center gap-2 lg:gap-4">
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu aria-hidden="true" size={20} />
            </button>
            <div className="min-w-0">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-400">
                <span className="hidden sm:inline">{t('adminSection')}</span>
                <span aria-hidden="true" className="hidden sm:inline">/</span>
                <span className="truncate font-semibold text-[#0E532B]">{pageTitle}</span>
              </nav>
              <p className="hidden text-[10px] font-medium uppercase tracking-[0.12em] sm:block">
                <span className="font-bold text-[#0E532B]">GROCERY</span>{' '}
                <span className="font-bold text-[#F04E00]">DELIVERY</span>{' '}
                <span className="font-bold text-[#0B4B8C]">SYSTEM</span>
              </p>
            </div>
            <Link
              to="/admin/settings"
              className={`hidden items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium transition xl:flex ${
                storeIsOpen
                  ? 'border-emerald-200 bg-emerald-50 text-[#1E8E3E] hover:bg-emerald-100'
                  : 'border-orange-200 bg-orange-50 text-[#F04E00] hover:bg-orange-100'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-40 ${storeIsOpen ? 'bg-[#1E8E3E]' : 'bg-[#F04E00]'}`} />
                <span className={`relative inline-flex h-2 w-2 rounded-full ${storeIsOpen ? 'bg-[#1E8E3E]' : 'bg-[#F04E00]'}`} />
              </span>
              {t(storeIsOpen ? 'storeOpen' : 'Store Closed')}
            </Link>
          </div>

          <div ref={searchAreaRef} className="relative hidden min-w-0 max-w-md flex-1 md:flex">
            <div className="flex w-full items-center gap-2 rounded-xl bg-gray-100/80 px-3.5 py-2 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-[#1E8E3E]/30">
              <Search aria-hidden="true" size={18} className="shrink-0 text-gray-400" />
              <input
                ref={searchInputRef}
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setSearchOpen(true)
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder={t('searchPlaceholder')}
                aria-label={t('searchPlaceholder')}
                aria-expanded={searchOpen}
                aria-controls="admin-global-search-results"
                className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
              <kbd className="hidden shrink-0 rounded-md border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-400 xl:inline">
                Ctrl K
              </kbd>
            </div>
            {searchOpen && (
              <div
                id="admin-global-search-results"
                className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl"
              >
                <div className="flex items-center justify-between px-2 py-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {search.trim() ? t('searchResults') : t('quickLinks')}
                  </p>
                  {search && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="text-xs font-medium text-[#1E8E3E] hover:underline"
                    >
                      {t('clear')}
                    </button>
                  )}
                </div>
                {searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.map((record) => {
                      const Icon = record.icon
                      return (
                        <Link
                          key={record.title}
                          to={record.href}
                          onClick={clearSearch}
                          className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-gray-50"
                        >
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${record.tone}`}>
                            <Icon aria-hidden="true" size={17} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-gray-800">{record.title}</span>
                            <span className="mt-0.5 block truncate text-xs text-gray-400">{record.detail}</span>
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <p className="px-3 py-8 text-center text-sm text-gray-500">
                    {t('noMatchingRecords')}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <div ref={quickAddRef} className="relative">
              <button
                type="button"
                aria-expanded={openPopover === 'quickAdd'}
                aria-haspopup="menu"
                onClick={() => togglePopover('quickAdd')}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#1E8E3E] px-2.5 text-sm font-semibold text-white transition hover:bg-[#0E532B] sm:px-3"
              >
                <Plus aria-hidden="true" size={17} />
                <span className="hidden lg:inline">{t('quickAdd')}</span>
              </button>
              {openPopover === 'quickAdd' && (
                <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                  <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {t('quickCreate')}
                  </p>
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <Link
                        key={action.translationKey}
                        role="menuitem"
                        to={action.href}
                        onClick={() => setOpenPopover(null)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-emerald-50 hover:text-[#0E532B]"
                      >
                        <Icon aria-hidden="true" size={17} className="text-[#1E8E3E]" />
                        {t(action.translationKey)}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            <Link
              to="/"
              aria-label={t('viewLiveStore')}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-2.5 text-sm font-medium text-gray-700 transition hover:border-[#1E8E3E] hover:text-[#1E8E3E] sm:px-3"
            >
              <Globe aria-hidden="true" size={17} />
              <span className="hidden sm:inline">{t('liveStore')}</span>
              <ExternalLink aria-hidden="true" size={13} className="hidden md:block" />
            </Link>

            <div ref={notificationsRef} className="relative">
              <button
                type="button"
                aria-label={`${t('notifications')}${unreadCount ? `, ${unreadCount} ${t('unread')}` : ''}`}
                aria-expanded={openPopover === 'notifications'}
                aria-haspopup="dialog"
                onClick={() => togglePopover('notifications')}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <Bell aria-hidden="true" size={19} />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#F04E00] px-1 text-[9px] font-bold leading-none text-white">
                    {unreadCount}
                  </span>
                )}
              </button>
              {openPopover === 'notifications' && (
                <section
                  aria-label={t('notifications')}
                  className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5">
                    <div>
                      <h2 className="text-sm font-bold text-[#0E532B]">
                        {t('notifications')}
                      </h2>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {t('latestStoreActivity')}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={unreadCount === 0}
                      onClick={markAllNotificationsRead}
                      className="text-xs font-semibold text-[#1E8E3E] transition hover:text-[#0E532B] disabled:cursor-default disabled:text-gray-400"
                    >
                      {t('markAllRead')}
                    </button>
                  </div>
                  <div className="max-h-[min(60vh,28rem)] divide-y divide-gray-50 overflow-y-auto">
                    {notifications.map((notification) => {
                      const Icon =
                        notification.category === 'Inventory'
                          ? AlertTriangle
                          : notification.category === 'Reviews' ||
                              notification.category === 'Support'
                            ? MessageSquareText
                            : ClipboardList
                      const tone =
                        notification.category === 'Inventory'
                          ? 'bg-orange-50 text-[#F04E00]'
                          : notification.category === 'Reviews'
                            ? 'bg-blue-50 text-[#0B4B8C]'
                            : 'bg-emerald-50 text-[#1E8E3E]'
                      return (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => openNotification(notification)}
                          className="flex w-full gap-3 px-4 py-3.5 text-left transition hover:bg-gray-50"
                        >
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                            <Icon aria-hidden="true" size={17} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold leading-5 text-gray-800">{notification.title}</span>
                            <span className="mt-0.5 block text-xs text-gray-400">{notification.description}</span>
                          </span>
                          {notification.unread && (
                            <span aria-label="Unread" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#F04E00]" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                  {unreadCount === 0 && (
                    <p className="border-t border-gray-100 px-4 py-2.5 text-center text-xs text-gray-400">
                      {t('caughtUp')}
                    </p>
                  )}
                  <Link
                    to="/admin/notifications"
                    onClick={() => setOpenPopover(null)}
                    className="block border-t border-gray-100 bg-gray-50 px-4 py-3 text-center text-sm font-semibold text-[#1E8E3E] transition hover:bg-emerald-50 hover:text-[#0E532B]"
                  >
                    {t('openNotificationBoard')} →
                  </Link>
                </section>
              )}
            </div>

            <div ref={languageRef} className="relative">
              <button
                type="button"
                aria-label={`Language: ${LANGUAGES.find((item) => item.code === language)?.label}`}
                aria-expanded={openPopover === 'language'}
                aria-haspopup="menu"
                onClick={() => togglePopover('language')}
                className="inline-flex h-10 items-center gap-1 rounded-xl px-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 sm:px-2.5"
              >
                <Languages aria-hidden="true" size={16} />
                <span>
                  {LANGUAGES.find((item) => item.code === language)?.short}
                </span>
                <ChevronDown aria-hidden="true" size={13} className="hidden sm:block" />
              </button>
              {openPopover === 'language' && (
                <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-40 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                  {LANGUAGES.map(({ code, label }) => (
                    <button
                      key={code}
                      type="button"
                      role="menuitemradio"
                      aria-checked={language === code}
                      onClick={() => {
                        setLanguage(code)
                        setOpenPopover(null)
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      {label}
                      {language === code && <Check aria-hidden="true" size={15} className="text-[#1E8E3E]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div ref={profileRef} className="relative">
              <button
                type="button"
                aria-label={t('administrator')}
                aria-expanded={openPopover === 'profile'}
                aria-haspopup="menu"
                onClick={() => togglePopover('profile')}
                className="flex h-10 items-center gap-2 rounded-xl px-1.5 transition hover:bg-gray-100 sm:px-2"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0E532B] text-xs font-bold text-white">
                  AD
                </span>
                <span className="hidden text-left lg:block">
                  <span className="block max-w-28 truncate text-xs font-semibold text-gray-800">
                    {user?.fullName || t('administrator')}
                  </span>
                  <span className="block text-[10px] text-gray-400">
                    {t('adminRole')}
                  </span>
                </span>
                <ChevronDown aria-hidden="true" size={15} className="hidden text-gray-400 sm:block" />
              </button>
              {openPopover === 'profile' && (
                <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">
                  <div className="border-b border-gray-100 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {user?.fullName || t('administrator')}
                    </p>
                    <p className="text-xs text-gray-400">
                      Grocery Delivery {t('adminRole')}
                    </p>
                  </div>
                  <Link
                    role="menuitem"
                    to="/admin/settings"
                    onClick={() => setOpenPopover(null)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    <Settings aria-hidden="true" size={16} className="text-gray-400" /> {t('storeSettings')}
                  </Link>
                  <Link
                    role="menuitem"
                    to="/admin/settings"
                    onClick={() => setOpenPopover(null)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    <Shield aria-hidden="true" size={16} className="text-gray-400" /> {t('security')}
                  </Link>
                  <Link
                    role="menuitem"
                    to="/"
                    onClick={() => setOpenPopover(null)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    <Globe aria-hidden="true" size={16} className="text-gray-400" /> {t('viewLiveStore')}
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#F04E00] transition hover:bg-orange-50"
                  >
                    <LogOut aria-hidden="true" size={16} /> {t('logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
