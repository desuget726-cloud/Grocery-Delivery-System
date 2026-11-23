import {
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  UserRound,
} from 'lucide-react'
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
  const riderName = user?.fullName || 'Dawit Tadesse'
  const riderInitials = riderName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/delivery" className="flex shrink-0 items-center gap-2.5">
            <img src={logo} alt="" className="h-9 w-auto object-contain" />
            <div className="hidden items-baseline lg:flex">
              <span className="text-[#0E532B] font-extrabold">GROCERY</span>
              <span className="ml-1 text-[#F04E00] font-extrabold">DELIVERY</span>
            </div>
            <span className="rounded-full bg-[#0B4B8C]/10 px-2.5 py-1 text-[10px] font-bold text-[#0B4B8C]">
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
                  `relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[#1E8E3E]/10 text-[#0E532B]'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
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
            <LanguageSwitcher className="text-slate-600" />
            <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0E532B]/10 text-xs font-bold text-[#0E532B] sm:flex">
              {riderInitials || <UserRound aria-hidden="true" size={17} />}
            </div>
            <span className="hidden whitespace-nowrap text-sm font-semibold text-slate-800 lg:block">
              {riderName}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              aria-label={t('logout')}
              className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-slate-500 transition hover:text-[#F04E00]"
            >
              <LogOut aria-hidden="true" size={19} />
              <span className="hidden text-sm font-semibold sm:inline">
                {t('logout')}
              </span>
            </button>
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
