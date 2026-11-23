import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop groceries', to: '/shop' },
  { label: 'Categories', to: '/shop#categories' },
  { label: 'Special offers', to: '/shop?offers=true' },
]

const serviceLinks = [
  { label: 'My orders', to: '/my-orders' },
  { label: 'My profile', to: '/profile' },
  { label: 'Contact us', to: '/contact' },
  { label: 'Customer support', to: '/contact' },
]

function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (event) => {
    event.preventDefault()
    setSubscribed(true)
    setEmail('')
  }

  return (
    <footer className="bg-brand-green text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.9fr_1.2fr]">
          <section>
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-[76px] w-[116px] items-center justify-center overflow-hidden rounded-xl bg-white px-2 shadow-sm">
                <img
                  src={logo}
                  alt="Grocery Delivery System"
                  className="h-14 w-auto object-contain"
                />
              </span>
            </Link>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
              Speed • Fresh • Direct
            </p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-200">
              Fast, fresh grocery delivery across Addis Ababa, Ethiopia. Get
              quality everyday essentials brought straight to your door.
            </p>
          </section>

          <nav aria-label="Quick links">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Quick Links
            </h2>
            <ul className="mt-4 space-y-3">
              {quickLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-gray-200 transition hover:text-brand-orange"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Customer service">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Customer Service
            </h2>
            <ul className="mt-4 space-y-3">
              {serviceLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-gray-200 transition hover:text-brand-orange"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Contact Info
            </h2>
            <address className="mt-4 space-y-3 not-italic">
              <a
                href="tel:+251912345678"
                className="flex items-center gap-3 text-sm text-gray-200 transition hover:text-white"
              >
                <Phone aria-hidden="true" size={16} className="shrink-0 text-brand-orange" />
                +251 962714305
              </a>
              <a
                href="mailto:desualegngood136@gmail.com"
                className="flex items-center gap-3 break-all text-sm text-gray-200 transition hover:text-white"
              >
                <Mail aria-hidden="true" size={16} className="shrink-0 text-brand-orange" />
                desualegngood136@gmail.com
              </a>
              <p className="flex items-start gap-3 text-sm text-gray-200">
                <MapPin aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-brand-orange" />
                Addis Ababa, Ethiopia
              </p>
            </address>
          </section>
        </div>

        <section className="mt-10 rounded-2xl border border-white/15 bg-white/5 p-5 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div className="max-w-md">
            <h2 className="font-bold text-white">Fresh news, straight to your inbox</h2>
            <p className="mt-1 text-sm text-gray-200">
              Get grocery tips, new arrivals, and local offers.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="mt-4 flex w-full max-w-lg gap-2 sm:mt-0">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Email address for newsletter</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setSubscribed(false)
                }}
                placeholder="Your email address"
                className="min-h-11 w-full rounded-lg border border-white/20 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-brand-fresh focus:ring-2 focus:ring-brand-fresh/30"
              />
            </label>
            <button
              type="submit"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-brand-orange px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Subscribe <ArrowRight aria-hidden="true" size={16} />
            </button>
          </form>
          {subscribed && (
            <p role="status" className="mt-3 text-sm font-medium text-emerald-200 sm:mt-0">
              Thanks for subscribing!
            </p>
          )}
        </section>

        <div className="mt-8 border-t border-white/15 pt-5 text-center text-xs text-gray-300 sm:flex sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Grocery Delivery System. All rights reserved.</p>
          <p className="mt-2 text-emerald-200 sm:mt-0">Speed • Fresh • Direct</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
