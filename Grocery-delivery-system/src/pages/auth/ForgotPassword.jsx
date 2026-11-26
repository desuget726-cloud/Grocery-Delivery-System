import { useEffect, useState } from 'react'
import { ArrowLeft, Check, Eye, EyeOff, KeyRound, Mail } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const steps = ['Email', 'Verify Code', 'New Password']

function ForgotPassword() {
  const toast = useToast()
  const { requestPasswordReset, verifyPasswordResetOtp, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [enteredCode, setEnteredCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [heroImageFailed, setHeroImageFailed] = useState(false)

  useEffect(() => {
    if (step !== 2 || countdown === 0) return undefined

    const timer = window.setTimeout(() => {
      setCountdown((remaining) => Math.max(remaining - 1, 0))
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [step, countdown])

  const startVerification = async () => {
    const result = await requestPasswordReset(email)
    setVerificationCode(result.developmentOtp || '')
    setEnteredCode('')
    setCountdown(30)
    setErrorMessage('')
    toast.info('Password reset verification code sent.')
  }

  const handleEmailSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    try {
      await startVerification()
      setStep(2)
    } catch (error) {
      const message = error.message || 'Unable to verify this account.'
      setErrorMessage(message)
      toast.error(message)
    }
  }

  const handleCodeSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (!/^\d{6}$/.test(enteredCode)) {
      setErrorMessage('Enter the 6-digit verification code.')
      toast.error('Enter the 6-digit verification code.')
      return
    }
    try {
      await verifyPasswordResetOtp(email, enteredCode)
      setStep(3)
      toast.success('Verification code accepted.')
    } catch (error) {
      const message = error.message || 'That verification code is invalid or expired.'
      setErrorMessage(message)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage('')

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters.')
      toast.error('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      toast.error('Passwords do not match.')
      return
    }

    try {
      await resetPassword(email, enteredCode, newPassword)
      setStep(4)
    } catch (error) {
      const message = error.message || 'Unable to reset your password.'
      setErrorMessage(message)
      toast.error(message)
    }
  }

  const strength = [
    newPassword.length >= 8,
    /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
    /\d/.test(newPassword),
    /[^a-zA-Z0-9]/.test(newPassword),
  ].filter(Boolean).length
  const strengthLabel = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['bg-gray-200', 'bg-rose-500', 'bg-amber-500', 'bg-lime-500', 'bg-[#1E8E3E]'][strength]

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
              Your account, secure
            </p>
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              A fresh start is just a moment away.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/85 sm:text-base">
              Verify your account and choose a new password to get back to fresh groceries, delivered fast.
            </p>
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
            {step < 4 ? (
              <>
                <div className="mb-7 text-center">
                  <h1 className="text-3xl font-extrabold tracking-tight text-[#0E532B]">
                    Forgot Password?
                  </h1>
                  <p className="mt-2 text-sm text-gray-500">
                    Follow the steps to securely reset your password.
                  </p>
                </div>

                <ol aria-label="Password reset steps" className="mb-7 flex items-center">
                  {steps.map((label, index) => {
                    const number = index + 1
                    const active = step === number
                    const complete = step > number
                    return (
                      <li key={label} className="flex flex-1 items-center last:flex-none">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                            active || complete ? 'bg-[#1E8E3E] text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {complete ? <Check aria-hidden="true" size={16} /> : number}
                          </span>
                          <span className={`whitespace-nowrap text-[11px] font-semibold sm:text-xs ${
                            active || complete ? 'text-[#0E532B]' : 'text-gray-400'
                          }`}>
                            {number}. {label}
                          </span>
                        </div>
                        {number < steps.length && (
                          <span className={`mb-5 mx-2 h-0.5 flex-1 ${
                            complete ? 'bg-[#1E8E3E]' : 'bg-gray-200'
                          }`} />
                        )}
                      </li>
                    )
                  })}
                </ol>

                {step === 1 && (
                  <form noValidate onSubmit={handleEmailSubmit} className="space-y-5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email
                      <span className="relative mt-2 block">
                        <Mail aria-hidden="true" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
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
                    {errorMessage && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>}
                    <button type="submit" className="w-full rounded-xl bg-[#1E8E3E] py-3.5 font-bold text-white shadow-md transition-all hover:bg-[#0E532B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E8E3E]">
                      Send Verification Code
                    </button>
                    <Link to="/login" className="block text-center text-sm font-semibold text-[#0B4B8C] transition hover:text-[#F04E00]">
                      ← Back to Login
                    </Link>
                  </form>
                )}

                {step === 2 && (
                  <form noValidate onSubmit={handleCodeSubmit} className="space-y-5">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Enter the 6-digit code sent to <span className="font-semibold text-gray-800">{email}</span>
                      </p>
                      {verificationCode && (
                        <p className="mt-3 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-[#0E532B]">
                          Development reset code: <span className="ml-1 font-extrabold tracking-widest">{verificationCode}</span>
                        </p>
                      )}
                    </div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Verification Code
                      <span className="relative mt-2 block">
                        <KeyRound aria-hidden="true" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          required
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          pattern="[0-9]{6}"
                          value={enteredCode}
                          onChange={(event) => setEnteredCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Enter 6-digit code"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-center text-lg font-bold tracking-[0.35em] text-gray-900 outline-none transition placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400 focus:border-[#1E8E3E] focus:bg-white focus:ring-4 focus:ring-[#1E8E3E]/10"
                        />
                      </span>
                    </label>
                    {errorMessage && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>}
                    <button type="submit" className="w-full rounded-xl bg-[#1E8E3E] py-3.5 font-bold text-white shadow-md transition-all hover:bg-[#0E532B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E8E3E]">
                      Verify Code
                    </button>
                    <div className="flex items-center justify-between text-sm">
                      <button
                        type="button"
                        disabled={countdown > 0}
                        onClick={() => startVerification().catch((error) => {
                          const message = error.message || 'Unable to send a new verification code.'
                          setErrorMessage(message)
                          toast.error(message)
                        })}
                        className="font-semibold text-[#0B4B8C] transition hover:text-[#F04E00] disabled:cursor-not-allowed disabled:text-gray-400"
                      >
                        Resend Code
                      </button>
                      <span className="text-gray-500">
                        {countdown > 0 ? `Resend in 00:${String(countdown).padStart(2, '0')}` : 'You can request a new code'}
                      </span>
                    </div>
                  </form>
                )}

                {step === 3 && (
                  <form noValidate onSubmit={handlePasswordSubmit} className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">
                      New Password
                      <span className="relative mt-2 block">
                        <KeyRound aria-hidden="true" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          required
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          minLength={8}
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          placeholder="Create a new password"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-12 text-sm font-normal text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#1E8E3E] focus:bg-white focus:ring-4 focus:ring-[#1E8E3E]/10"
                        />
                        <button
                          type="button"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          aria-pressed={showPassword}
                          onClick={() => setShowPassword((visible) => !visible)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
                        </button>
                      </span>
                      <span className="mt-2 flex items-center gap-2">
                        <span className="flex flex-1 gap-1" aria-hidden="true">
                          {[1, 2, 3, 4].map((level) => (
                            <span key={level} className={`h-1.5 flex-1 rounded-full ${strength >= level ? strengthColor : 'bg-gray-200'}`} />
                          ))}
                        </span>
                        <span className="text-xs font-medium text-gray-500">{newPassword ? strengthLabel : '8+ characters'}</span>
                      </span>
                    </label>
                    <label className="block text-sm font-semibold text-gray-700">
                      Confirm Password
                      <span className="relative mt-2 block">
                        <KeyRound aria-hidden="true" size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          required
                          type="password"
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          placeholder="Re-enter your new password"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-normal text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#1E8E3E] focus:bg-white focus:ring-4 focus:ring-[#1E8E3E]/10"
                        />
                      </span>
                    </label>
                    {errorMessage && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>}
                    <button type="submit" className="w-full rounded-xl bg-[#1E8E3E] py-3.5 font-bold text-white shadow-md transition-all hover:bg-[#0E532B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E8E3E]">
                      Reset Password
                    </button>
                  </form>
                )}
              </>
            ) : (
              <div className="py-8 text-center">
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-[#1E8E3E]">
                  <Check aria-hidden="true" size={40} strokeWidth={3} />
                </span>
                <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-[#0E532B]">
                  Password Reset Successfully!
                </h1>
                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Your password has been updated. Sign in with your new password to continue.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/login', { replace: true })}
                  className="mt-7 w-full rounded-xl bg-[#1E8E3E] py-3.5 font-bold text-white shadow-md transition-all hover:bg-[#0E532B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E8E3E]"
                >
                  Sign In with New Password →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default ForgotPassword
