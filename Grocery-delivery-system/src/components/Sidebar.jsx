import {
  Archive,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Home,
  LogOut,
  Menu,
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

const orderStatuses = [
  { label: 'All Orders', status: 'all' },
  { label: 'Pending', status: 'placed' },
  { label: 'On The Way', status: 'on_the_way' },
  { label: 'Delivered', status: 'delivered' },
  { label: 'Returns / Refunds', status: 'canceled' },
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
        ? 'bg-[#1E8E3E] font-semibold text-white'
        : 'text-white/75 hover:bg-white/10 hover:text-white'
    }`

  const groupButtonClass = (group, active) =>
    `flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${
      collapsed ? 'lg:justify-center lg:px-2' : ''
    } ${
      active || openGroup === group
        ? 'bg-white/10 font-semibold text-white'
        : 'text-white/75 hover:bg-white/10 hover:text-white'
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
        ? 'font-medium text-white'
        : 'text-white/65 hover:text-white'
    }`

  return (
    <aside
      aria-label="Admin sidebar"
      className={`fixed inset-y-0 left-0 z-40 flex h-screen shrink-0 flex-col bg-[#072916] text-white transition-[width,transform] duration-200 lg:sticky lg:top-0 lg:translate-x-0 ${
        collapsed ? 'w-64 lg:w-20' : 'w-64'
      } ${open ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-3">
        <Link
          to="/admin/dashboard"
          aria-label="Grocery Delivery dashboard"
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
            className={`whitespace-nowrap text-sm font-bold tracking-tight ${
              collapsed ? 'lg:hidden' : ''
            }`}
          >
            <span className="text-white">GROCERY</span>{' '}
            <span className="text-[#F04E00]">DELIVERY</span>
          </span>
        </Link>
        <button
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((value) => !value)}
          className="hidden rounded-lg p-2 text-white/75 transition hover:bg-white/10 hover:text-white lg:flex"
        >
          <Menu aria-hidden="true" size={19} />
        </button>
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={closeAfterNavigation}
          className="rounded-lg p-2 text-white/75 transition hover:bg-white/10 hover:text-white lg:hidden"
        >
          <X aria-hidden="true" size={19} />
        </button>
      </div>

      <nav
        aria-label="Admin navigation"
        className="min-h-0 flex-1 overflow-y-auto px-3 py-5"
      >
        <p
          className={`mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/45 ${
            collapsed ? 'lg:hidden' : ''
          }`}
        >
          Main menu
        </p>
        <div className="space-y-1">
          <Link
            to="/admin/dashboard"
            title="Dashboard"
            onClick={closeAfterNavigation}
            className={linkClass({
              isActive:
                pathname === '/admin/dashboard' || pathname === '/admin',
            })}
          >
            <Home aria-hidden="true" size={18} className="shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>Dashboard</span>
          </Link>

          {accordion(
            'orders',
            'Order Management',
            ShoppingBag,
            isOrdersRoute,
            orderStatuses.map(({ label, status }) => {
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
                      active ? 'bg-[#1E8E3E]' : 'bg-white/35'
                    }`}
                  />
                  <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
                </Link>
              )
            }),
          )}

          {accordion(
            'products',
            'Product List',
            Package,
            pathname === '/admin/products' || pathname === '/admin/categories',
            <>
              <Link
                to="/admin/products"
                onClick={closeAfterNavigation}
                className={subLinkClass(pathname === '/admin/products')}
              >
                <span className={collapsed ? 'lg:hidden' : ''}>Products</span>
              </Link>
              <Link
                to="/admin/categories"
                onClick={closeAfterNavigation}
                className={subLinkClass(pathname === '/admin/categories')}
              >
                <span className={collapsed ? 'lg:hidden' : ''}>Categories</span>
              </Link>
            </>,
          )}

          <Link
            to="/admin/promotions"
            onClick={closeAfterNavigation}
            className={linkClass({ isActive: pathname === '/admin/promotions' })}
          >
            <Tag aria-hidden="true" size={18} className="shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>Coupon Code</span>
          </Link>
          <Link
            to="/admin/inventory"
            onClick={closeAfterNavigation}
            className={linkClass({ isActive: pathname === '/admin/inventory' })}
          >
            <Archive aria-hidden="true" size={18} className="shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>Inventory</span>
          </Link>
          <Link
            to="/admin/payments"
            onClick={closeAfterNavigation}
            className={linkClass({ isActive: pathname === '/admin/payments' })}
          >
            <CreditCard aria-hidden="true" size={18} className="shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>Transactions</span>
          </Link>
          <Link
            to="/admin/reviews"
            onClick={closeAfterNavigation}
            className={linkClass({ isActive: pathname === '/admin/reviews' })}
          >
            <Star aria-hidden="true" size={18} className="shrink-0" />
            <span className={`flex-1 ${collapsed ? 'lg:hidden' : ''}`}>
              Review
            </span>
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-md bg-[#1E8E3E] px-1.5 text-[10px] font-bold text-white ${
                collapsed ? 'lg:hidden' : ''
              }`}
            >
              10
            </span>
          </Link>
        </div>

        <div className="my-5 border-t border-white/10" />
        <p
          className={`mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/45 ${
            collapsed ? 'lg:hidden' : ''
          }`}
        >
          Admin
        </p>
        <div className="space-y-1">
          <Link
            to="/admin/settings"
            onClick={closeAfterNavigation}
            className={linkClass({ isActive: pathname === '/admin/settings' })}
          >
            <Settings aria-hidden="true" size={18} className="shrink-0" />
            <span className={collapsed ? 'lg:hidden' : ''}>Settings</span>
          </Link>
          {accordion(
            'users',
            'Manage Users',
            Users,
            pathname === '/admin/customers' ||
              pathname === '/admin/delivery-staff',
            <>
              <Link
                to="/admin/customers"
                onClick={closeAfterNavigation}
                className={subLinkClass(pathname === '/admin/customers')}
              >
                <span className={collapsed ? 'lg:hidden' : ''}>Customers</span>
              </Link>
              <Link
                to="/admin/delivery-staff"
                onClick={closeAfterNavigation}
                className={subLinkClass(pathname === '/admin/delivery-staff')}
              >
                <span className={collapsed ? 'lg:hidden' : ''}>
                  Delivery Staff
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
            <span className={collapsed ? 'lg:hidden' : ''}>Help</span>
          </Link>
        </div>
      </nav>

      <div className="sticky bottom-0 z-10 mt-auto min-h-16 shrink-0 border-t border-white/10 bg-[#072916] p-3">
        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:bg-white/5 hover:text-[#F04E00] ${
            collapsed ? 'lg:justify-center lg:px-2' : ''
          }`}
        >
          <LogOut aria-hidden="true" size={18} className="shrink-0" />
          <span className={collapsed ? 'lg:hidden' : ''}>Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
