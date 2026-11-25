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
import { useLanguage } from '../context/LanguageContext.jsx'
import { useWishlist } from '../context/WishlistContext.jsx'
import CartDrawer from './CartDrawer.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import SearchBar from './SearchBar.jsx'

const navigation = [
  { translationKey: 'home', to: '/', end: true, icon: Home },
  { translationKey: 'shop', to: '/shop' },
  { translationKey: 'categories', to: '/categories' },
  { translationKey: 'myOrders', to: '/my-orders' },
  { translationKey: 'offers', to: '/offers', badge: 'Hot' },
  { translationKey: 'aboutUs', to: '/about' },
  { translationKey: 'contactUs', to: '/contact' },
]

function Navbar() {
  const { t } = useLanguage()
  const { totalItems, isCartOpen, openCart } = useCart()
  const { wishlistCount } = useWishlist()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const userInitials =
    user?.fullName
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((namePart) => namePart[0])
      .join('')
      .toUpperCase() || 'U'

  const handleLogout = () => {
    logout()
    setAccountMenuOpen(false)
    navigate('/')
  }

  const renderNavigation = (mobile = false) => (
    <nav
      aria-label={t('mainMenu')}
      className={mobile ? 'flex flex-col gap-1 py-2' : 'flex items-center justify-center gap-1'}
    >
      {navigation.map(({ translationKey, to, end, icon: Icon, badge }) => (
        <NavLink
          key={translationKey}
          to={to}
          end={end}
          onClick={() => setMobileMenuOpen(false)}
          className={({ isActive }) =>
            `relative inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition ${
              isActive
                ? 'font-bold text-[#1E8E3E]'
                : 'font-medium text-gray-600 hover:text-[#0E532B]'
            } ${mobile ? 'w-full' : ''}`
          }
        >
          {Icon && <Icon aria-hidden="true" size={16} />}
          <span>{t(translationKey)}</span>
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
    <>
    <header className="relative z-30 bg-white">
      <div className="bg-[#0E532B] py-2 text-xs text-white">
        <div className="w-full px-4 sm:px-6 lg:px-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <p className="flex items-center gap-2">
            <Truck aria-hidden="true" size={15} className="text-[#F04E00]" />
            <span>
              {t('freeDeliveryOver')}{' '}
              <strong className="text-[#FF9B70]">500 ETB</strong>
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
          <LanguageSwitcher className="shrink-0" />
        </div>
      </div>

      <div className="border-b border-gray-100 bg-white py-3">
        <div className="w-full px-4 sm:px-6 lg:px-10 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 lg:flex-nowrap">
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

          <div className="flex items-center gap-4 shrink-0 lg:gap-6">
            <Link
              to="/wishlist"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-medium text-gray-700 transition hover:text-[#0E532B]"
            >
              <span className="relative inline-flex">
                <Heart aria-hidden="true" size={20} />
                {wishlistCount >= 0 && (
                  <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F04E00] text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </span>
              <span>{t('wishlist')}</span>
            </Link>

            <button
              type="button"
              aria-controls="mini-cart-drawer"
              aria-expanded={isCartOpen}
              aria-label={`${t('cart')}, ${totalItems} ${totalItems === 1 ? 'item' : 'items'}`}
              onClick={openCart}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-gray-700 transition hover:text-[#0E532B]"
            >
              <span className="relative inline-flex">
                <ShoppingCart aria-hidden="true" size={21} />
                <span className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#1E8E3E] text-white text-[10px] font-bold flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              </span>
              <span>{t('cart')}</span>
            </button>

            <span aria-hidden="true" className="hidden h-6 w-px bg-gray-200 sm:block" />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => setAccountMenuOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0E532B] text-xs font-bold text-white">
                      {userInitials}
                    </span>
                  )}
                  <span className="max-w-24 truncate sm:max-w-32">{user.fullName}</span>
                  <ChevronDown aria-hidden="true" size={16} className="shrink-0 text-gray-500" />
                </button>
                {accountMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-gray-100 bg-white py-2 shadow-xl"
                  >
                    <div className="border-b border-gray-100 px-4 pb-3 pt-1">
                      <p className="truncate text-sm font-bold text-[#0E532B]">{user.fullName}</p>
                      <p className="mt-0.5 truncate text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        role="menuitem"
                        to="/profile"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#0E532B]"
                      >
                        {t('profile')}
                      </Link>
                      <Link
                        role="menuitem"
                        to="/my-orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#0E532B]"
                      >
                        {t('myOrders')}
                      </Link>
                      <Link
                        role="menuitem"
                        to="/wishlist"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#0E532B]"
                      >
                        {t('wishlist')}
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          role="menuitem"
                          to="/admin/dashboard"
                          onClick={() => setAccountMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm font-medium text-[#0E532B] hover:bg-emerald-50"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      {user.role === 'delivery' && (
                        <Link
                          role="menuitem"
                          to="/delivery/dashboard"
                          onClick={() => setAccountMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm font-medium text-[#0E532B] hover:bg-emerald-50"
                        >
                          Rider Dashboard
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-100 pt-1">
                      <button
                        role="menuitem"
                        type="button"
                        onClick={handleLogout}
                        className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-[#F04E00] hover:bg-orange-50"
                      >
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-semibold text-[#0E532B] transition hover:bg-gray-100"
              >
                <UserRound aria-hidden="true" size={19} />
                <span>{t('loginRegister')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex min-h-11 items-center justify-between md:justify-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0E532B] md:hidden">
              {t('shop')}
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
    <CartDrawer />
    </>
  )
}

export default Navbar
