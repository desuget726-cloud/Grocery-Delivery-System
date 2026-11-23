import {
  Archive,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Home,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Tag,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'

const orderStatuses = [
  { translationKey: 'allOrders', status: 'all' },
  { translationKey: 'pending', status: 'placed' },
  { translationKey: 'onTheWay', status: 'on_the_way' },
  { translationKey: 'delivered', status: 'delivered' },
  { translationKey: 'returnsRefunds', status: 'canceled' },
]

function getRouteGroup(pathname) {
  if (pathname === '/admin/orders') return 'orders'
  if (pathname === '/admin/products' || pathname === '/admin/categories') {
    return 'products'
  }
  if (
    pathname === '/admin/customers' ||
    pathname === '/admin/delivery-staff'
  ) {
    return 'users'
  }
  return null
}

function Sidebar({ open, onClose }) {
  const { logout } = useAuth()
  const { t } = useLanguage()
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const [lastPathname, setLastPathname] = useState(pathname)
  const [collapsed, setCollapsed] = useState(false)
  const [openGroup, setOpenGroup] = useState(() => getRouteGroup(pathname))
  const isOrdersRoute = pathname === '/admin/orders'
  const selectedOrderStatus = new URLSearchParams(search).get('status') ?? 'all'

  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setOpenGroup(getRouteGroup(pathname))
  }

  const toggleGroup = (group) => {
    setOpenGroup((current) => (current === group ? null : group))
  }

  const closeAfterNavigation = () => {
    onClose?.()
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
      collapsed ? 'lg:justify-center lg:px-2' : ''
    } ${
      isActive
        ? 'bg-[#1E8E3E] font-semibold text-white shadow-sm'
        : 'text-gray-600 hover:bg-emerald-50 hover:text-[#0E532B]'
    }`

  const groupButtonClass = (group, active) =>
    `flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
      collapsed ? 'lg:justify-center lg:px-2' : ''
    } ${
      active || openGroup === group
        ? 'bg-[#1E8E3E] font-semibold text-white shadow-sm'
        : 'text-gray-600 hover:bg-emerald-50 hover:text-[#0E532B]'
    }`

  const accordion = (group, label, Icon, active, children) => (
    <div key={group}>
      <button
        type="button"
        title={label}
        aria-expanded={openGroup === group}
        aria-controls={`sidebar-${group}-submenu`}
        onClick={() => toggleGroup(group)}
        className={groupButtonClass(group, active)}
      >
        <Icon aria-hidden="true" size={18} className="shrink-0" />
        <span className={`min-w-0 flex-1 ${collapsed ? 'lg:hidden' : ''}`}>
          {label}
        </span>
        <ChevronDown
          aria-hidden="true"
          size={15}
          className={`shrink-0 transition-transform ${
            collapsed ? 'lg:hidden' : ''
          } ${openGroup === group ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        id={`sidebar-${group}-submenu`}
        aria-hidden={openGroup !== group}
        inert={openGroup !== group}
        className={`grid transition-[grid-template-rows,opacity] duration-200 ${
          openGroup === group
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-1 py-1">{children}</div>
        </div>
      </div>
    </div>
  )

  const subLinkClass = (active) =>
    `flex min-h-9 items-center gap-3 rounded-lg py-2 pl-10 pr-3 text-sm transition-colors ${
      collapsed ? 'lg:justify-center lg:px-2' : ''
    } ${
      active
        ? 'font-medium text-[#0E532B]'
        : 'text-gray-600 hover:bg-emerald-50 hover:text-[#0E532B]'
    }`

  return (
    <aside
      aria-label={t('adminSection')}
      className={`fixed inset-y-0 left-0 z-40 flex h-screen shrink-0 flex-col border-r border-gray-200 bg-white text-gray-700 transition-[width,transform] duration-200 lg:sticky lg:top-0 lg:translate-x-0 ${
        collapsed ? 'w-64 lg:w-20' : 'w-64'
      } ${open ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-gray-200 px-3">
        <Link
          to="/admin/dashboard"
          aria-label={`Grocery Delivery ${t('dashboard')}`}
          onClick={closeAfterNavigation}
          className={`flex min-w-0 items-center gap-3 ${
            collapsed ? 'lg:mx-auto' : ''
          }`}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white p-1.5">
            <img
              src={logo}
              alt=""
              className="h-full w-full object-contain"
            />
          </span>
          <span
            className={`flex flex-col text-sm font-bold tracking-tight leading-tight ${
              collapsed ? 'lg:hidden' : ''
            }`}
          >
            <span className="whitespace-nowrap">
              <span className="text-[#0E532B]">GROCERY</span>{' '}
              <span className="text-[#F04E00]">DELIVERY</span>
            </span>
            <span className="text-[#0B4B8C]">SYSTEM</span>
          </span>
        </Link>
        <button
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((value) => !value)}
          className="hidden h-9 w-9 items-center justify-center rounded-lg text-2xl font-semibold leading-none text-gray-600 transition hover:bg-emerald-50 hover:text-[#0E532B] lg:flex"
        >
          <span aria-hidden="true">≡</span>
        </button>
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeAfterNavigation}
          className="rounded-lg p-2 text-gray-600 transition hover:bg-emerald-50 hover:text-[#0E532B] lg:hidden"
        >
          <X aria-hidden="true" size={19} />
        </button>
      </div>

      <nav
        aria-label="Admin navigation"
        className="min-h-0 flex-1 overflow-y-auto px-3 py-5"
      >
        <p
          className={`mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#0E532B]/60 ${
            collapsed ? 'lg:hidden' : ''
          }`}
        >
          {t('mainMenu')}
        </p>
        <div className="space-y-1">
          <Link
            to="/admin/dashboard"
            title={t('dashboard')}
            onClick={closeAfterNavigation}
            className={linkClass({
              isActive:
                pathname === '/admin/dashboard' || pathname === '/admin',
            })}
          >
            <Home aria-hidden="true" size={18} className="shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>
              {t('dashboard')}
            </span>
          </Link>

          {accordion(
            'orders',
            t('orderManagement'),
            ShoppingBag,
            isOrdersRoute,
            orderStatuses.map(({ translationKey, status }) => {
              const active =
                isOrdersRoute && selectedOrderStatus === status
              return (
                <Link
                  key={status}
                  to={`/admin/orders?status=${status}`}
                  onClick={closeAfterNavigation}
                  className={subLinkClass(active)}
                >
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      active ? 'bg-[#1E8E3E]' : 'bg-gray-300'
                    }`}
                  />
                  <span className={collapsed ? 'lg:hidden' : ''}>
                    {t(translationKey)}
                  </span>
                </Link>
              )
            }),
          )}

          {accordion(
            'products',
            t('productList'),
            Package,
            pathname === '/admin/products' || pathname === '/admin/categories',
            <>
              <Link
                to="/admin/products"
                onClick={closeAfterNavigation}
                className={subLinkClass(pathname === '/admin/products')}
              >
                <span className={collapsed ? 'lg:hidden' : ''}>
                  {t('products')}
                </span>
              </Link>
              <Link
                to="/admin/categories"
                onClick={closeAfterNavigation}
                className={subLinkClass(pathname === '/admin/categories')}
              >
                <span className={collapsed ? 'lg:hidden' : ''}>
                  {t('categories')}
                </span>
              </Link>
            </>,
          )}

          <Link
            to="/admin/promotions"
            onClick={closeAfterNavigation}
            className={linkClass({ isActive: pathname === '/admin/promotions' })}
          >
            <Tag aria-hidden="true" size={18} className="shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>
              {t('couponCode')}
            </span>
          </Link>
          <Link
            to="/admin/inventory"
            onClick={closeAfterNavigation}
            className={linkClass({ isActive: pathname === '/admin/inventory' })}
          >
            <Archive aria-hidden="true" size={18} className="shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>
              {t('inventory')}
            </span>
          </Link>
          <Link
            to="/admin/payments"
            onClick={closeAfterNavigation}
            className={linkClass({ isActive: pathname === '/admin/payments' })}
          >
            <CreditCard aria-hidden="true" size={18} className="shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>
              {t('transactions')}
            </span>
          </Link>
          <Link
            to="/admin/reviews"
            onClick={closeAfterNavigation}
            className={linkClass({ isActive: pathname === '/admin/reviews' })}
          >
            <Star aria-hidden="true" size={18} className="shrink-0" />
            <span className={`flex-1 ${collapsed ? 'lg:hidden' : ''}`}>
              {t('review')}
            </span>
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-md bg-[#F04E00] px-1.5 text-[10px] font-bold text-white ${
                collapsed ? 'lg:hidden' : ''
              }`}
            >
              10
            </span>
          </Link>
        </div>

        <div className="my-5 border-t border-gray-200" />
        <p
          className={`mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#0E532B]/60 ${
            collapsed ? 'lg:hidden' : ''
          }`}
        >
          {t('adminSection')}
        </p>
        <div className="space-y-1">
          <Link
            to="/admin/settings"
            onClick={closeAfterNavigation}
            className={linkClass({ isActive: pathname === '/admin/settings' })}
          >
            <Settings aria-hidden="true" size={18} className="shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>
              {t('settings')}
            </span>
          </Link>
          {accordion(
            'users',
            t('manageUsers'),
            Users,
            pathname === '/admin/customers' ||
              pathname === '/admin/delivery-staff',
            <>
              <Link
                to="/admin/customers"
                onClick={closeAfterNavigation}
                className={subLinkClass(pathname === '/admin/customers')}
              >
                <span className={collapsed ? 'lg:hidden' : ''}>
                  {t('customers')}
                </span>
              </Link>
              <Link
                to="/admin/delivery-staff"
                onClick={closeAfterNavigation}
                className={subLinkClass(pathname === '/admin/delivery-staff')}
              >
                <span className={collapsed ? 'lg:hidden' : ''}>
                  {t('deliveryStaff')}
                </span>
              </Link>
            </>,
          )}
          <Link
            to="/admin/support"
            onClick={closeAfterNavigation}
            className={linkClass({ isActive: pathname === '/admin/support' })}
          >
            <CircleHelp aria-hidden="true" size={18} className="shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>{t('help')}</span>
          </Link>
        </div>
      </nav>

      <div className="sticky bottom-0 z-10 mt-auto min-h-16 shrink-0 border-t border-gray-200 bg-white p-3">
        <button
          type="button"
          onClick={handleLogout}
          title={t('logout')}
          className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-emerald-50 hover:text-[#0E532B] ${
            collapsed ? 'lg:justify-center lg:px-2' : ''
          }`}
        >
          <LogOut aria-hidden="true" size={18} className="shrink-0" />
          <span className={collapsed ? 'lg:hidden' : ''}>
            {t('logout')}
          </span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
