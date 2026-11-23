import { Link, NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { label: 'Dashboard', to: '/delivery', end: true },
  { label: 'Assigned Orders', to: '/delivery/assigned-orders' },
  { label: 'History', to: '/delivery/history' },
]

function DeliveryLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link to="/delivery" className="text-lg font-bold text-emerald-700">
            Grocery Basket Delivery
          </Link>
          <nav aria-label="Delivery navigation" className="hidden gap-2 sm:flex">
            {navigation.map(({ label, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-5xl px-4 py-6 pb-24 sm:px-6 sm:pb-8">
        <Outlet />
      </main>

      <nav
        aria-label="Delivery navigation"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-slate-200 bg-white px-2 pb-[env(safe-area-inset-bottom)] sm:hidden"
      >
        {navigation.map(({ label, to, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `px-1 py-3 text-center text-xs font-medium ${
                isActive ? 'text-emerald-700' : 'text-slate-500'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default DeliveryLayout
