import { Apple, ArrowLeft, Eye, EyeOff, Globe, Leaf, LockKeyhole, Mail } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import freshBowl from '../../assets/fresh-bowl.svg'
import { useAuth } from '../../context/AuthContext.jsx'

const demoAccounts = [
  {
    label: 'Fill Customer',
    email: 'customer@grocery.et',
    password: 'Customer@123',
  },
  {
    label: 'Fill Delivery',
    email: 'delivery@grocery.et',
    password: 'Delivery@123',
  },
  {
    label: 'Fill Admin',
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
    <main className="flex min-h-screen items-center justify-center bg-[#143322] p-4 sm:p-6">
      <section className="relative grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Back
        </button>

        <div className="relative hidden min-h-[640px] overflow-hidden md:block">
          <img
            src={freshBowl}
            alt="A colorful bowl of fresh salad and greens"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#4FE3A1] via-[#4FE3A1]/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-9 text-[#143322]">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em]">
              <Leaf aria-hidden="true" size={18} />
              Fresh Basket
            </div>
            <h2 className="mt-4 max-w-sm text-3xl font-bold leading-tight">
              A little fresher.
              <br />
              A lot closer.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-emerald-950/80">
              Your favorite fresh groceries, thoughtfully delivered to your door.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 md:hidden">
                <Leaf aria-hidden="true" size={25} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Login</h1>
              <span className="mx-auto mt-3 block h-1 w-12 rounded-full bg-[#4FE3A1]" />
              <p className="mt-3 text-sm text-slate-500">
                Welcome back. Sign in to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm font-semibold text-slate-700">
                Email
                <span className="relative mt-2 block">
                  <Mail
                    aria-hidden="true"
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  />
                </span>
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Password
                <span className="relative mt-2 block">
                  <LockKeyhole
                    aria-hidden="true"
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
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
                <label className="flex cursor-pointer items-center gap-2 text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-emerald-500"
                  />
                  Remember me for 30 days
                </label>
                <a
                  href="mailto:support@freshbasket.com?subject=Password%20reset"
                  className="font-semibold text-emerald-700 transition hover:text-emerald-800"
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
                className="flex min-h-12 w-full items-center justify-center rounded-full bg-[#4FE3A1] px-5 py-3 font-bold text-[#143322] transition hover:bg-[#3bd392] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-wait disabled:opacity-70"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <details className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
              <summary className="cursor-pointer text-xs font-semibold text-emerald-800">
                Demo Quick Login
              </summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => fillDemoCredentials(account)}
                    className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:border-emerald-400 hover:bg-emerald-100"
                  >
                    {account.label}
                  </button>
                ))}
              </div>
            </details>

            <div className="my-6 flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-xs font-medium text-slate-400">OR</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => showSocialSignInMessage('Google')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Globe aria-hidden="true" size={17} /> Google
              </button>
              <button
                type="button"
                onClick={() => showSocialSignInMessage('Apple')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Apple aria-hidden="true" size={17} /> Apple
              </button>
            </div>

            <p className="mt-7 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-bold text-emerald-700 hover:text-emerald-800">
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
