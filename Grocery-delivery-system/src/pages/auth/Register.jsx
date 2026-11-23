import {
  Apple,
  ArrowLeft,
  Eye,
  EyeOff,
  Globe,
  Heart,
  Leaf,
  LockKeyhole,
  Mail,
  Phone,
  Sprout,
  UserRound,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import saladBowl from '../../assets/register-salad.svg'
import { useAuth } from '../../context/AuthContext.jsx'

const initialValues = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

function Register() {
  const { loading, register } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState(initialValues)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  const updateValue = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const validate = () => {
    const nextErrors = {}
    const phoneDigits = values.phone.replace(/\D/g, '')
    const validPhoneCharacters = /^\+?[\d\s().-]+$/.test(values.phone.trim())

    if (!values.fullName.trim()) {
      nextErrors.fullName = 'Enter your full name.'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!validPhoneCharacters || phoneDigits.length < 7 || phoneDigits.length > 15) {
      nextErrors.phone = 'Enter a valid phone number with 7 to 15 digits.'
    }
    if (values.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }
    if (!values.confirmPassword || values.confirmPassword !== values.password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }
    if (!termsAccepted) {
      nextErrors.terms = 'Please agree to the Terms of Service and Privacy Policy.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    if (!validate()) {
      return
    }

    try {
      await register({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
      })
      navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(error.message || 'Unable to create your account. Please try again.')
    }
  }

  const showSocialSignInMessage = (provider) => {
    setSubmitError(`${provider} sign-up is not connected yet. Please use the form above.`)
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <section className="relative flex min-h-[660px] flex-col overflow-hidden bg-[#F6F8F2] px-6 py-8 sm:px-10 sm:py-10 lg:min-h-screen lg:px-14 lg:py-12">
        <Link
          to="/"
          className="relative z-10 flex w-fit items-center gap-2 text-xl font-bold tracking-tight text-[#283B2D]"
        >
          <Leaf aria-hidden="true" size={25} className="text-[#4D7C0F]" />
          FreshBite
        </Link>

        <div className="relative z-10 mt-12 max-w-xl sm:mt-16 lg:mt-20">
          <h1 className="font-serif text-4xl font-bold leading-[1.12] tracking-tight text-[#24352A] sm:text-5xl">
            Good food, great mood, better life.
          </h1>
          <div className="relative mt-3 inline-block">
            <p className="font-serif text-2xl italic text-[#4D7C0F] sm:text-3xl">
              Eat healthy, live happy.
            </p>
            <svg
              aria-hidden="true"
              viewBox="0 0 310 16"
              className="absolute -bottom-3 left-0 h-3 w-full text-[#9BBE69]"
            >
              <path
                d="M3 11C79 2 219 2 306 10"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="4"
              />
            </svg>
          </div>
        </div>

        <ul className="relative z-10 mt-10 space-y-5 sm:mt-12">
          <li className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E4EDDA] text-[#4D7C0F]">
              <Leaf aria-hidden="true" size={21} />
            </span>
            <span>
              <span className="block font-semibold text-[#283B2D]">100% Fresh Ingredients</span>
              <span className="mt-1 block text-sm text-[#738074]">Carefully selected for your health</span>
            </span>
          </li>
          <li className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E4EDDA] text-[#4D7C0F]">
              <Heart aria-hidden="true" size={21} />
            </span>
            <span>
              <span className="block font-semibold text-[#283B2D]">Healthy &amp; Delicious</span>
              <span className="mt-1 block text-sm text-[#738074]">Nutritious groceries you&apos;ll love</span>
            </span>
          </li>
          <li className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E4EDDA] text-[#4D7C0F]">
              <Sprout aria-hidden="true" size={22} />
            </span>
            <span>
              <span className="block font-semibold text-[#283B2D]">Better Lifestyle</span>
              <span className="mt-1 block text-sm text-[#738074]">Small change, big difference</span>
            </span>
          </li>
        </ul>

        <div className="absolute bottom-28 right-7 z-20 flex h-28 w-28 rotate-6 flex-col items-center justify-center rounded-full bg-[#4D7C0F] text-center text-white shadow-lg sm:bottom-32 sm:right-12 sm:h-32 sm:w-32">
          <span className="text-2xl font-bold leading-none">10%</span>
          <span className="mt-1 text-[11px] font-semibold leading-tight">
            Discount for
            <br />
            2 orders
          </span>
        </div>
        <img
          src={saladBowl}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-12 right-0 w-72 max-w-[75%] sm:w-96 lg:-bottom-14 lg:right-4 lg:w-[440px]"
        />
      </section>

      <section className="flex min-h-screen flex-col bg-white px-5 py-6 sm:px-10 sm:py-8 lg:px-12">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-slate-500 transition hover:text-[#4D7C0F]"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            Back
          </button>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <header className="mb-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#25352A]">
              Create Your Account
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Join us and start your fresh grocery journey today!
            </p>
          </header>

          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            <label className="block text-sm font-medium text-slate-700">
              Full Name
              <span className={`mt-1.5 flex items-center rounded-xl border bg-white px-3 transition focus-within:ring-4 ${
                errors.fullName
                  ? 'border-rose-300 focus-within:ring-rose-50'
                  : 'border-slate-200 focus-within:border-[#84A94B] focus-within:ring-[#EAF1E1]'
              }`}>
                <UserRound aria-hidden="true" size={18} className="shrink-0 text-slate-400" />
                <input
                  required
                  autoComplete="name"
                  value={values.fullName}
                  onChange={updateValue('fullName')}
                  placeholder="Your full name"
                  aria-invalid={Boolean(errors.fullName)}
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </span>
              {errors.fullName && <span className="mt-1 block text-xs text-rose-600">{errors.fullName}</span>}
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Email Address
              <span className={`mt-1.5 flex items-center rounded-xl border bg-white px-3 transition focus-within:ring-4 ${
                errors.email
                  ? 'border-rose-300 focus-within:ring-rose-50'
                  : 'border-slate-200 focus-within:border-[#84A94B] focus-within:ring-[#EAF1E1]'
              }`}>
                <Mail aria-hidden="true" size={18} className="shrink-0 text-slate-400" />
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={updateValue('email')}
                  placeholder="you@example.com"
                  aria-invalid={Boolean(errors.email)}
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </span>
              {errors.email && <span className="mt-1 block text-xs text-rose-600">{errors.email}</span>}
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Phone Number
              <span className={`mt-1.5 flex items-center rounded-xl border bg-white px-3 transition focus-within:ring-4 ${
                errors.phone
                  ? 'border-rose-300 focus-within:ring-rose-50'
                  : 'border-slate-200 focus-within:border-[#84A94B] focus-within:ring-[#EAF1E1]'
              }`}>
                <Phone aria-hidden="true" size={18} className="shrink-0 text-slate-400" />
                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  value={values.phone}
                  onChange={updateValue('phone')}
                  placeholder="e.g., +251 911 234 567"
                  aria-invalid={Boolean(errors.phone)}
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </span>
              {errors.phone && <span className="mt-1 block text-xs text-rose-600">{errors.phone}</span>}
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Password
              <span className={`mt-1.5 flex items-center rounded-xl border bg-white px-3 transition focus-within:ring-4 ${
                errors.password
                  ? 'border-rose-300 focus-within:ring-rose-50'
                  : 'border-slate-200 focus-within:border-[#84A94B] focus-within:ring-[#EAF1E1]'
              }`}>
                <LockKeyhole aria-hidden="true" size={18} className="shrink-0 text-slate-400" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={values.password}
                  onChange={updateValue('password')}
                  placeholder="Create a password"
                  aria-invalid={Boolean(errors.password)}
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((shown) => !shown)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
                </button>
              </span>
              <span className="mt-1 block text-xs text-slate-400">
                Password must be at least 8 characters
              </span>
              {errors.password && <span className="mt-1 block text-xs text-rose-600">{errors.password}</span>}
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Confirm Password
              <span className={`mt-1.5 flex items-center rounded-xl border bg-white px-3 transition focus-within:ring-4 ${
                errors.confirmPassword
                  ? 'border-rose-300 focus-within:ring-rose-50'
                  : 'border-slate-200 focus-within:border-[#84A94B] focus-within:ring-[#EAF1E1]'
              }`}>
                <LockKeyhole aria-hidden="true" size={18} className="shrink-0 text-slate-400" />
                <input
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={updateValue('confirmPassword')}
                  placeholder="Re-enter your password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'}
                  aria-pressed={showConfirmPassword}
                  onClick={() => setShowConfirmPassword((shown) => !shown)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  {showConfirmPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
                </button>
              </span>
              {errors.confirmPassword && <span className="mt-1 block text-xs text-rose-600">{errors.confirmPassword}</span>}
            </label>

            <div>
              <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-slate-600">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => {
                    setTermsAccepted(event.target.checked)
                    setErrors((current) => ({ ...current, terms: '' }))
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-[#4D7C0F]"
                />
                <span>
                  I agree to the{' '}
                  <a href="#terms" className="font-semibold text-[#4D7C0F] hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#privacy" className="font-semibold text-[#4D7C0F] hover:underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
              {errors.terms && <p className="mt-1 text-xs text-rose-600">{errors.terms}</p>}
            </div>

            {submitError && (
              <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="min-h-12 w-full rounded-full bg-[#4D7C0F] px-5 py-3 text-sm font-bold tracking-wide text-white transition hover:bg-[#3F650C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4D7C0F] disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? 'CREATING ACCOUNT…' : 'SIGN UP'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">or sign up with</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => showSocialSignInMessage('Google')}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Globe aria-hidden="true" size={17} /> Continue with Google
            </button>
            <button
              type="button"
              onClick={() => showSocialSignInMessage('Apple')}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Apple aria-hidden="true" size={17} /> Continue with Apple
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#4D7C0F] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default Register
