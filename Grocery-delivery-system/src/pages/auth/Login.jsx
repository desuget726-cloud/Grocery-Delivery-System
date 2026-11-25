import {
  Apple,
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { useAuth } from '../../context/AuthContext.jsx'

const demoAccounts = [
  {
    label: 'Customer',
    email: 'customer@grocery.et',
    password: 'Customer@123',
  },
  {
    label: 'Delivery',
    email: 'delivery@grocery.et',
    password: 'Delivery@123',
  },
  {
    label: 'Admin',
    email: 'admin@grocery.et',
    password: 'Admin@123',
  },
]

function Login() {
  const { user, isAuthenticated, loading, login, getRoleRedirectPath } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [heroImageFailed, setHeroImageFailed] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={getRoleRedirectPath(user.role)} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    try {
      const result = await login(email, password, rememberMe)
      navigate(result.redirectTo, { replace: true })
    } catch (error) {
      setErrorMessage(error.message || 'Unable to sign in. Please try again.')
    }
  }

  const showSocialSignInMessage = (provider) => {
    setErrorMessage(`${provider} sign-in is not connected yet. Use your email and password.`)
  }

  const fillDemoCredentials = ({ email: demoEmail, password: demoPassword }) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setErrorMessage('')
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#072916] via-[#0E532B] to-[#062213] p-4 sm:p-8">
      <section className="grid min-h-[640px] w-full max-w-6xl grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-12">
        <div className="relative isolate flex min-h-[360px] flex-col justify-between overflow-hidden p-6 sm:min-h-[420px] sm:p-9 lg:col-span-6 lg:min-h-[640px] lg:p-10">
          {!heroImageFailed ? (
            <img
              src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1600&q=85"
              alt="A fresh assortment of colorful produce and greens"
              onError={() => setHeroImageFailed(true)}
              className="absolute inset-0 -z-20 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#1E8E3E] via-[#0E532B] to-[#072916]" />
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#072916] via-[#0E532B]/70 to-black/20" />

          <Link
            to="/"
            className="flex w-fit items-center gap-1.5 rounded-2xl bg-white px-3 py-2.5 shadow-lg sm:gap-2.5 sm:px-4"
          >
            <img src={logo} alt="" className="h-9 w-9 shrink-0 object-contain" />
            <span className="text-sm font-extrabold text-[#0E532B] sm:text-base">GROCERY</span>
            <span className="text-sm font-extrabold text-[#F04E00] sm:text-base">DELIVERY</span>
            <span className="text-xs font-bold text-[#0B4B8C] sm:text-sm">SYSTEM</span>
          </Link>

          <div className="max-w-lg pt-10 text-white sm:pt-14 lg:pt-0">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
              Fresh from the market
            </p>
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              Fresh Groceries, Delivered Fast.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/85 sm:text-base">
              Order farm-fresh produce, dairy, and pantry essentials in Addis Ababa — Speed • Fresh • Direct.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['30-Min Delivery', '100% Fresh', 'Telebirr & COD'].map((trustLabel) => (
                <span
                  key={trustLabel}
                  className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm"
                >
                  {trustLabel}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex flex-col justify-center p-8 sm:p-12 lg:col-span-6">
          <Link
            to="/"
            className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-[#1E8E3E] hover:text-[#0E532B] sm:right-8 sm:top-8 sm:text-sm"
          >
            <ArrowLeft aria-hidden="true" size={15} />
            Back to Home
          </Link>

          <div className="mx-auto w-full max-w-md pt-12 sm:pt-8">
            <div className="mb-7 text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-[#0E532B]">
                Welcome Back
              </h1>
              <span className="mx-auto mt-3 flex h-1 w-16 overflow-hidden rounded-full">
                <span className="w-2/3 bg-[#1E8E3E]" />
                <span className="w-1/3 bg-[#F04E00]" />
              </span>
              <p className="mt-3 text-sm text-gray-500">
                Sign in to your Grocery Delivery account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Email
                <span className="relative mt-2 block">
                  <Mail
                    aria-hidden="true"
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-normal text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#1E8E3E] focus:bg-white focus:ring-4 focus:ring-[#1E8E3E]/10"
                  />
                </span>
              </label>

              <label className="block text-sm font-semibold text-gray-700">
                Password
                <span className="relative mt-2 block">
                  <LockKeyhole
                    aria-hidden="true"
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-12 text-sm font-normal text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#1E8E3E] focus:bg-white focus:ring-4 focus:ring-[#1E8E3E]/10"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff aria-hidden="true" size={18} />
                    ) : (
                      <Eye aria-hidden="true" size={18} />
                    )}
                  </button>
                </span>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-[#1E8E3E]"
                  />
                  Remember me for 30 days
                </label>
                <a
                  href="mailto:support@freshbasket.com?subject=Password%20reset"
                  className="font-medium text-[#0B4B8C] transition hover:text-[#F04E00]"
                >
                  Forgot password?
                </a>
              </div>

              {errorMessage && (
                <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1E8E3E] py-3.5 font-bold text-white shadow-md transition-all hover:bg-[#0E532B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E8E3E] disabled:cursor-wait disabled:opacity-70"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <details className="mt-4 rounded-xl border border-[#1E8E3E]/20 bg-emerald-50/60 px-4 py-3">
              <summary className="cursor-pointer text-sm font-semibold text-[#0E532B]">
                Demo Quick Login
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => fillDemoCredentials(account)}
                    className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#0E532B] transition hover:border-[#1E8E3E] hover:bg-emerald-50"
                  >
                    {account.label}
                  </button>
                ))}
              </div>
            </details>

            <div className="my-5 flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-medium text-gray-400">OR</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => showSocialSignInMessage('Google')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <svg aria-hidden="true" viewBox="0 0 48 48" className="h-[18px] w-[18px]">
                  <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-1.9 4.7-4.1 6.1v5h6.6c3.9-3.6 6.1-8.8 6.1-14.8Z" />
                  <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.2C9.2 39.6 16 44 24 44Z" />
                  <path fill="#FBBC05" d="M12.6 27.8a12 12 0 0 1 0-7.6V15H5.8a20 20 0 0 0 0 18Z" />
                  <path fill="#EA4335" d="M24 11.8c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 5.8 29.5 4 24 4 16 4 9.2 8.4 5.8 15l6.8 5.2c1.6-4.8 6.1-8.4 11.4-8.4Z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => showSocialSignInMessage('Apple')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <Apple aria-hidden="true" size={18} /> Apple
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-[#F04E00] hover:text-[#0E532B]">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Login
