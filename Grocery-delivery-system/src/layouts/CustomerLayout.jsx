import { ArrowLeft } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function CustomerLayout() {
  const { user } = useAuth()
  const previewRole =
    user?.role === 'admin'
      ? { label: 'Administrator', destination: '/admin/dashboard', dashboard: 'Admin Dashboard' }
      : user?.role === 'delivery'
        ? { label: 'Delivery Staff', destination: '/delivery/dashboard', dashboard: 'Delivery Dashboard' }
        : null

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      {previewRole && (
        <div className="flex items-center justify-between gap-3 bg-[#0B4B8C] px-4 py-1.5 text-xs text-white">
          <span className="min-w-0 truncate">
            Preview Mode: Viewing Storefront as {previewRole.label}
          </span>
          <Link
            to={previewRole.destination}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#F04E00] px-3 py-1.5 font-semibold text-white transition hover:bg-[#d94500]"
          >
            <ArrowLeft aria-hidden="true" size={14} />
            Back to {previewRole.dashboard}
          </Link>
        </div>
      )}
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 pb-12 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default CustomerLayout
