import {
  ChevronDown,
  Heart,
  Home,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShoppingCart,
  Truck,
  UserRound,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import SearchBar from './SearchBar.jsx'

const navigation = [
  { label: 'Home', to: '/', end: true, icon: Home },
  { label: 'Shop', to: '/shop' },
  { label: 'Categories', to: '/shop#categories' },
  { label: 'My Orders', to: '/my-orders' },
  { label: 'Offers', to: '/shop?offers=true', badge: 'Hot' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
]

function Navbar() {
  const { totalItems } = useCart()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setAccountMenuOpen(false)
    navigate('/')
  }

  const renderNavigation = (mobile = false) => (
    <nav
      aria-label="Main navigation"
      className={mobile ? 'flex flex-col gap-1 py-2' : 'flex items-center justify-center gap-1'}
    >
      {navigation.map(({ label, to, end, icon: Icon, badge }) => (
        <NavLink
          key={label}
          to={to}
          end={end}
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            `relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition ${
              isActive
                ? 'font-semibold text-[#1E8E3E]'
                : 'font-medium text-gray-600 hover:text-[#0E532B]'
            } ${mobile ? 'w-full' : ''}`
          }
        >
          {Icon && <Icon aria-hidden="true" size={16} />}
          <span>{label}</span>
          {badge && (
            <span className="rounded-full bg-[#F04E00] px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none text-white">
              {badge}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <header className="relative z-30 bg-white">
      <div className="bg-[#0E532B] py-2 text-xs text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 sm:px-6 lg:px-8">
          <p className="flex items-center gap-2">
            <Truck aria-hidden="true" size={15} className="text-[#F04E00]" />
            <span>
              Free delivery on orders over <strong className="text-[#FF9B70]">500 ETB</strong>
            </span>
          </p>
          <div className="hidden items-center gap-5 lg:flex">
            <a href="tel:+251962714305" className="inline-flex items-center gap-1.5 hover:text-emerald-100">
              <Phone aria-hidden="true" size={13} /> +251 962714305
            </a>
            <a href="mailto:desuget726@gmail.com" className="inline-flex items-center gap-1.5 hover:text-emerald-100">
              <Mail aria-hidden="true" size={13} /> desuget726@gmail.com
            </a>
            <span className="inline-flex items-center gap-1.5">
              <MapPin aria-hidden="true" size={13} /> Addis Ababa, Ethiopia
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-100 bg-white py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 sm:px-6 lg:flex-nowrap lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <img src={logo} alt="Grocery Delivery System logo" className="h-11 w-auto object-contain" />
            <span className="flex flex-col leading-none">
              <span className="whitespace-nowrap text-sm font-extrabold tracking-tight sm:text-base">
                <span className="text-[#0E532B]">GROCERY</span>{' '}
                <span className="text-[#F04E00]">DELIVERY</span>
              </span>
              <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#0B4B8C] sm:text-[10px] sm:tracking-widest">
                SPEED • FRESH • DIRECT
              </span>
            </span>
          </Link>

          <div className="order-last w-full lg:order-none lg:mx-5 lg:max-w-2xl lg:flex-1">
            <SearchBar />
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => setAccountMenuOpen((open) => !open)}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:gap-2 sm:px-3"
                >
                  <UserRound aria-hidden="true" size={19} className="text-[#0E532B]" />
                  <span className="max-w-20 truncate text-xs sm:max-w-28 sm:text-sm">{user.fullName}</span>
                  {user.role === 'admin' && (
                    <span className="rounded-full bg-[#F04E00]/10 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-[#F04E00]">
                      Admin
                    </span>
                  )}
                  <ChevronDown aria-hidden="true" size={15} className="hidden sm:block" />
                </button>
                {accountMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl"
                  >
                    {user.role === 'admin' && (
                      <Link
                        role="menuitem"
                        to="/admin/dashboard"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#0E532B] hover:bg-emerald-50"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      role="menuitem"
                      to="/profile"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#0E532B]"
                    >
                      Profile
                    </Link>
                    <Link
                      role="menuitem"
                      to="/my-orders"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#0E532B]"
                    >
                      My Orders
                    </Link>
                    <button
                      role="menuitem"
                      type="button"
                      onClick={handleLogout}
                      className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-[#0E532B] hover:bg-emerald-50 sm:gap-2 sm:px-3"
              >
                <UserRound aria-hidden="true" size={19} />
                <span className="hidden sm:inline">Login / Register</span>
              </Link>
            )}

            <Link
              to="/wishlist"
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-[#0E532B] sm:gap-2 sm:px-3"
            >
              <span className="relative">
                <Heart aria-hidden="true" size={20} />
                <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-[#F04E00]" />
              </span>
              <span className="hidden xl:inline">Wishlist</span>
            </Link>

            <Link
              to="/cart"
              aria-label={`Cart, ${totalItems} ${totalItems === 1 ? 'item' : 'items'}`}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-[#0E532B] hover:bg-emerald-50 sm:gap-2 sm:px-3"
            >
              <span className="relative">
                <ShoppingCart aria-hidden="true" size={21} />
                <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#F04E00] px-1 text-[10px] font-bold leading-none text-white">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              </span>
              <span className="hidden xl:inline">Cart</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-11 items-center justify-between md:justify-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0E532B] md:hidden">
              Browse
            </span>
            <div className="hidden w-full md:block">{renderNavigation()}</div>
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[#0E532B] hover:bg-emerald-50 md:hidden"
            >
              {mobileMenuOpen ? <X aria-hidden="true" size={21} /> : <Menu aria-hidden="true" size={21} />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="border-t border-gray-100 pb-2 md:hidden">
              {renderNavigation(true)}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
