import { useState } from 'react'
import {
  Bell,
  ChevronDown,
  Globe,
  Menu,
  Search,
  Settings,
  UserRound,
  LogOut,
} from 'lucide-react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
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
        <header className="sticky top-0 z-20 flex min-h-[68px] items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu aria-hidden="true" size={20} />
            </button>
            <label className="flex h-10 w-80 max-w-full items-center gap-2 rounded-full bg-gray-100 px-4 text-sm text-gray-500 sm:max-w-[320px]">
              <Search aria-hidden="true" size={17} className="shrink-0" />
              <input
                type="search"
                placeholder="Search data, users, or reports"
                aria-label="Search data, users, or reports"
                className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
            </label>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <button
              type="button"
              aria-label="Language: English"
              className="hidden rounded-full bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 sm:inline-flex"
            >
              En
            </button>
            <Link
              to="/"
              aria-label="Visit live store"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 sm:text-sm"
            >
              <Globe aria-hidden="true" size={17} />
              <span className="hidden sm:inline">Live Store</span>
            </Link>
            <button
              type="button"
              aria-label="Notifications, 3 unread"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <Bell aria-hidden="true" size={19} />
              <span className="absolute right-1.5 top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#F04E00] px-1 text-[9px] font-bold leading-none text-white">
                3
              </span>
            </button>
            <Link
              to="/admin/settings"
              aria-label="Settings"
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <Settings aria-hidden="true" size={19} />
            </Link>
            <div className="relative">
              <button
                type="button"
                aria-label="Administrator menu"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
                onClick={() => setUserMenuOpen((isOpen) => !isOpen)}
                className="flex items-center gap-2 rounded-full p-1 transition hover:bg-gray-100"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#072916] text-sm font-semibold text-white">
                  <UserRound aria-hidden="true" size={18} />
                </span>
                <span className="hidden text-left text-xs font-semibold text-gray-700 xl:block">
                  Administrator
                </span>
                <ChevronDown
                  aria-hidden="true"
                  size={15}
                  className="hidden text-gray-500 sm:block"
                />
              </button>
              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-30 mt-2 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-lg"
                >
                  <p className="px-3 py-2 text-xs font-semibold text-gray-500">
                    Administrator
                  </p>
                  <Link
                    to="/admin/settings"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-[#F04E00]"
                  >
                    <LogOut aria-hidden="true" size={16} />
                    Logout
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
