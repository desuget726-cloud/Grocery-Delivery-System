import {
  ChevronDown,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Package,
  UserRound,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import LanguageSwitcher from '../components/LanguageSwitcher.jsx'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const navigation = [
  { translationKey: 'dashboard', to: '/delivery', end: true },
  { translationKey: 'assignedOrders', to: '/delivery/assigned-orders' },
  { translationKey: 'history', to: '/delivery/history' },
]

function DeliveryLayout() {
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)
  const riderName = user?.fullName || 'Dawit Tadesse'
  const riderInitials = riderName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!profileRef.current?.contains(event.target)) {
        setProfileOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 w-full bg-gradient-to-r from-[#072916] via-[#0E532B] to-[#0B3D2E] text-white border-b-2 border-[#F04E00]/70 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
          <Link to="/delivery" className="flex shrink-0 items-center gap-2.5">
            <span className="bg-white p-1 rounded-xl shadow-sm shrink-0">
              <img src={logo} alt="" className="h-7 w-auto object-contain" />
            </span>
            <div className="hidden items-baseline lg:flex">
              <span className="text-white font-extrabold tracking-tight">GROCERY</span>
              <span className="ml-1 text-[#FF6B2C] font-extrabold tracking-tight">DELIVERY</span>
            </div>
            <span className="bg-[#0B4B8C] text-sky-100 border border-sky-400/30 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {t('riderApp')}
            </span>
          </Link>

          <nav aria-label={t('deliveryStaff')} className="hidden items-center gap-2 md:flex">
            {navigation.map(({ translationKey, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-[#1E8E3E] text-white font-semibold shadow-sm'
                      : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {t(translationKey)}
                {translationKey === 'assignedOrders' && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F04E00] px-1.5 text-[10px] font-bold text-white">
                    2
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-3">
            <LanguageSwitcher
              triggerClassName="inline-flex h-9 items-center gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl px-3 py-1.5 text-sm"
            />
            <div ref={profileRef} className="relative">
              <button
                type="button"
                aria-label={riderName}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                onClick={() => setProfileOpen((current) => !current)}
                className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-white/10"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#0E532B] font-bold">
                  {riderInitials || <UserRound aria-hidden="true" size={17} />}
                </span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block max-w-28 truncate text-sm font-bold text-white">
                    {riderName}
                  </span>
                  <span className="block text-xs text-emerald-100/80">
                    Delivery Rider
                  </span>
                </span>
                <ChevronDown
                  aria-hidden="true"
                  size={15}
                  className={`hidden text-emerald-100 transition-transform sm:block ${
                    profileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {profileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-gray-100 bg-white py-2 text-gray-800 shadow-xl"
                >
                  <div className="px-4 py-2">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {riderName}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Bole Zone • AA-23451
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#1E8E3E]">
                      <span className="h-2 w-2 rounded-full bg-[#1E8E3E]" />
                      Online
                    </p>
                  </div>
                  <div className="mt-1 border-t border-gray-100 py-1">
                    <Link
                      role="menuitem"
                      to="/delivery/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <LayoutDashboard aria-hidden="true" size={16} />
                      Dashboard
                    </Link>
                    <Link
                      role="menuitem"
                      to="/delivery/orders"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Package aria-hidden="true" size={16} />
                      Assigned Orders
                    </Link>
                    <Link
                      role="menuitem"
                      to="/delivery/history"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <History aria-hidden="true" size={16} />
                      Delivery History
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="text-[#F04E00] hover:bg-orange-50 w-full text-left px-4 py-2 flex items-center gap-2 font-medium"
                  >
                    <LogOut aria-hidden="true" size={16} />
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>

      <nav
        aria-label={t('deliveryStaff')}
        className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-gray-200 bg-white py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:hidden"
      >
        {navigation.map(({ translationKey, to, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-w-20 flex-col items-center gap-1 text-[11px] font-semibold ${
                isActive ? 'text-[#0E532B]' : 'text-slate-500'
              }`
            }
          >
            {translationKey === 'dashboard' && <LayoutDashboard aria-hidden="true" size={20} />}
            {translationKey === 'assignedOrders' && <ClipboardList aria-hidden="true" size={20} />}
            {translationKey === 'history' && <History aria-hidden="true" size={20} />}
            {translationKey === 'assignedOrders'
              ? t('orders')
              : t(translationKey)}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default DeliveryLayout
