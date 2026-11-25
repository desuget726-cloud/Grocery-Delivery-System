import {
  BadgeCheck,
  Camera,
  Check,
  Eye,
  EyeOff,
  Heart,
  KeyRound,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useWishlist } from '../../context/WishlistContext.jsx'
import { loadOrders } from '../../data/mockData.js'

const ADDRESS_STORAGE_KEY = 'grocery_saved_addresses'
const ADDIS_ZONES = ['Bole', 'Kazanchis', 'CMC', 'Sarbet', 'Piassa']
const PROFILE_INPUT =
  'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1E8E3E] focus:ring-4 focus:ring-[#1E8E3E]/10'
const PASSWORD_INPUT =
  'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#1E8E3E] focus:ring-4 focus:ring-[#1E8E3E]/10'

function loadSavedAddresses() {
  try {
    const storedAddresses = window.localStorage.getItem(ADDRESS_STORAGE_KEY)
    if (!storedAddresses) return []

    const parsedAddresses = JSON.parse(storedAddresses)
    if (
      !Array.isArray(parsedAddresses) ||
      parsedAddresses.some(
        (address) =>
          !address ||
          typeof address.id !== 'string' ||
          typeof address.label !== 'string' ||
          typeof address.zone !== 'string' ||
          typeof address.details !== 'string',
      )
    ) {
      throw new TypeError('Saved address data is invalid')
    }

    return parsedAddresses
  } catch (error) {
    console.error('Unable to load saved delivery addresses:', error)
    return []
  }
}

function ProfileField({ icon: Icon, label, name, onChange, type = 'text', value, placeholder }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <span className="relative mt-2 block">
        <Icon
          aria-hidden="true"
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          required
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={PROFILE_INPUT}
        />
      </span>
    </label>
  )
}

function Profile() {
  const { user, updateProfile } = useAuth()
  const { wishlistCount } = useWishlist()
  const photoInputRef = useRef(null)
  const [profile, setProfile] = useState({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    avatar: user?.avatar ?? '',
  })
  const [addresses, setAddresses] = useState(loadSavedAddresses)
  const [addressDraft, setAddressDraft] = useState({
    label: 'Home',
    zone: ADDIS_ZONES[0],
    details: '',
  })
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [passwordVisibility, setPasswordVisibility] = useState({
    current: false,
    next: false,
    confirm: false,
  })
  const [toast, setToast] = useState(null)
  const ordersCount = loadOrders().filter((order) => order.customerId === user?.id).length
  const displayName = profile.fullName.trim() || 'Guest Shopper'
  const displayEmail = profile.email || 'Add an email address'
  const displayPhone = profile.phone || 'Add a phone number'
  const defaultDeliveryZone =
    addresses.find((address) => address.isDefault)?.zone || 'Not set yet'

  useEffect(() => {
    if (!toast) return undefined
    const timeoutId = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

  const showToast = (type, message) => setToast({ type, message })

  const handleProfileChange = (event) => {
    const { name, value } = event.target
    setProfile((current) => ({ ...current, [name]: value }))
  }

  const handleProfileSubmit = (event) => {
    event.preventDefault()
    const updates = {
      fullName: profile.fullName.trim(),
      email: profile.email.trim(),
      phone: profile.phone.trim(),
      avatar: profile.avatar,
    }

    try {
      updateProfile(updates)
      setProfile(updates)
      showToast('success', 'Your profile has been saved.')
    } catch (error) {
      showToast('error', error.message || 'Unable to save your profile.')
    }
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Choose an image file to update your photo.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'Your profile photo must be 2 MB or smaller.')
      return
    }

    const reader = new FileReader()
    reader.onerror = () => showToast('error', 'We could not read that image. Please try again.')
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        showToast('error', 'We could not read that image. Please try again.')
        return
      }

      const updates = { ...profile, avatar: reader.result }
      try {
        updateProfile(updates)
        setProfile(updates)
        showToast('success', 'Your profile photo has been updated.')
      } catch (error) {
        showToast('error', error.message || 'Unable to save your profile photo.')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    const updates = { ...profile, avatar: '' }
    try {
      updateProfile(updates)
      setProfile(updates)
      showToast('success', 'Your profile photo has been removed.')
    } catch (error) {
      showToast('error', error.message || 'Unable to remove your profile photo.')
    }
  }

  const persistAddresses = (nextAddresses, successMessage) => {
    try {
      window.localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(nextAddresses))
      setAddresses(nextAddresses)
      if (successMessage) showToast('success', successMessage)
      return true
    } catch (error) {
      console.error('Unable to save delivery addresses:', error)
      showToast('error', 'Unable to save this address. Please try again.')
      return false
    }
  }

  const handleAddressSubmit = (event) => {
    event.preventDefault()
    const details = addressDraft.details.trim()
    if (!details) return

    const nextAddresses = [
      ...addresses,
      {
        id: `address-${Date.now()}`,
        label: addressDraft.label,
        zone: addressDraft.zone,
        details,
        isDefault: addresses.length === 0,
      },
    ]
    if (persistAddresses(nextAddresses, 'Your delivery address has been added.')) {
      setAddressDraft((current) => ({ ...current, details: '' }))
    }
  }

  const setDefaultAddress = (addressId) => {
    persistAddresses(
      addresses.map((address) => ({ ...address, isDefault: address.id === addressId })),
      'Your default delivery address has been updated.',
    )
  }

  const deleteAddress = (addressId) => {
    const remainingAddresses = addresses.filter((address) => address.id !== addressId)
    if (addresses.find((address) => address.id === addressId)?.isDefault && remainingAddresses.length) {
      remainingAddresses[0] = { ...remainingAddresses[0], isDefault: true }
    }
    persistAddresses(remainingAddresses, 'The delivery address has been removed.')
  }

  const handlePasswordSubmit = (event) => {
    event.preventDefault()
    if (passwords.next.length < 8) {
      showToast('error', 'Your new password must be at least 8 characters.')
      return
    }
    if (passwords.next !== passwords.confirm) {
      showToast('error', 'Your new passwords do not match.')
      return
    }

    showToast(
      'error',
      'Password changes are not connected to the secure account service yet.',
    )
  }

  const stats = [
    { label: 'Orders', value: ordersCount, icon: Package, color: 'text-[#0B4B8C]', to: '/my-orders' },
    { label: 'Wishlist', value: wishlistCount, icon: Heart, color: 'text-[#F04E00]', to: '/wishlist' },
    { label: 'Addresses', value: addresses.length, icon: MapPin, color: 'text-[#1E8E3E]' },
  ]

  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10">
      {toast && (
        <div
          role={toast.type === 'error' ? 'alert' : 'status'}
          className={`fixed right-4 top-24 z-50 flex max-w-sm items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${
            toast.type === 'success'
              ? 'border-emerald-200 bg-white text-[#0E532B]'
              : 'border-rose-200 bg-white text-rose-700'
          }`}
        >
          {toast.type === 'success' ? (
            <Check aria-hidden="true" size={18} />
          ) : (
            <ShieldCheck aria-hidden="true" size={18} />
          )}
          {toast.message}
        </div>
      )}

      <header className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#F04E00]">
            Grocery Delivery System
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[#0E532B] sm:text-4xl">
            My Account
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your profile, delivery addresses, and account security.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0B4B8C]/5 px-3 py-2 text-xs font-semibold text-[#0B4B8C]">
          <ShieldCheck aria-hidden="true" size={16} />
          Your account, all in one place
        </span>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-4">
          <section className="sticky top-24 self-start overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="h-28 bg-gradient-to-r from-[#0E532B] to-[#1E8E3E]" />
            <div className="px-5 pb-5 sm:px-6">
              <div className="-mt-12">
                <div className="relative h-24 w-24">
                  <div className="h-full w-full overflow-hidden rounded-full border-4 border-white bg-emerald-50 shadow-md">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={`${displayName}'s profile`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#1E8E3E]">
                        <UserRound aria-hidden="true" size={36} />
                      </div>
                    )}
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    aria-label="Upload profile photo"
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    aria-label="Upload profile photo"
                    className="absolute bottom-0 right-0 inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#1E8E3E] text-white shadow-md transition hover:bg-[#0E532B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E8E3E]"
                  >
                    <Camera aria-hidden="true" size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <h2 className="break-words text-xl font-extrabold text-[#0E532B]">{displayName}</h2>
                <p className="mt-1 break-all text-sm text-slate-500">{displayEmail}</p>
                <p className="mt-1 text-sm text-slate-500">{displayPhone}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#1E8E3E]/10 px-3 py-1.5 text-xs font-bold text-[#0E532B]">
                  <BadgeCheck aria-hidden="true" size={15} />
                  Verified Fresh Member
                </span>
                {profile.avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="ml-3 text-xs font-semibold text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-[#F04E00]"
                  >
                    Remove photo
                  </button>
                )}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                {stats.map(({ label, value, icon: Icon, color, to }) => {
                  const statContent = (
                    <>
                      <Icon aria-hidden="true" size={17} className={`mx-auto ${color}`} />
                      <p className="mt-1 text-lg font-extrabold text-[#0E532B]">{value}</p>
                      <p className="text-[11px] font-medium text-slate-500">{label}</p>
                    </>
                  )

                  return to ? (
                    <Link
                      key={label}
                      to={to}
                      className="rounded-2xl border border-transparent bg-slate-50 px-2 py-3 text-center transition hover:border-[#1E8E3E]/40 hover:bg-emerald-50/40"
                    >
                      {statContent}
                    </Link>
                  ) : (
                    <div key={label} className="rounded-2xl bg-slate-50 px-2 py-3 text-center">
                      {statContent}
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 space-y-2.5 border-t border-gray-100 pt-4 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Member Since</span>
                  <span className="font-semibold text-gray-700">Nov 2026</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Default Delivery Zone</span>
                  <span className="font-semibold text-gray-700">{defaultDeliveryZone}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500">Active Perk</span>
                  <span className="rounded-full bg-orange-50 px-2.5 py-1 font-bold text-[#F04E00]">
                    10% Off • WELCOME10
                  </span>
                </div>
              </div>
            </div>
          </section>
        </aside>

        <div className="space-y-6 lg:col-span-8">
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1E8E3E]/10 text-[#1E8E3E]">
                <UserRound aria-hidden="true" size={21} />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-[#0E532B]">Personal Information</h2>
                <p className="mt-1 text-sm text-slate-500">Keep your contact details up to date.</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
              <ProfileField
                icon={UserRound}
                label="Full Name"
                name="fullName"
                value={profile.fullName}
                onChange={handleProfileChange}
                placeholder="Your full name"
              />
              <ProfileField
                icon={Mail}
                label="Email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleProfileChange}
                placeholder="you@example.com"
              />
              <div className="sm:col-span-2">
                <ProfileField
                  icon={Phone}
                  label="Phone (+251 9...)"
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  placeholder="+251 9XX XXX XXX"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1E8E3E] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0E532B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E8E3E]"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0B4B8C]/10 text-[#0B4B8C]">
                <MapPin aria-hidden="true" size={21} />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-[#0E532B]">Saved Addis Ababa Delivery Addresses</h2>
                <p className="mt-1 text-sm text-slate-500">Choose where your fresh groceries should arrive.</p>
              </div>
            </div>

            {addresses.length ? (
              <ul className="mt-5 space-y-3">
                {addresses.map((address) => (
                  <li
                    key={address.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#0B4B8C]/10 px-2.5 py-1 text-xs font-bold text-[#0B4B8C]">
                          {address.label}
                        </span>
                        <span className="text-sm font-extrabold text-[#0E532B]">{address.zone}</span>
                        {address.isDefault && (
                          <span className="rounded-full bg-[#1E8E3E]/10 px-2.5 py-1 text-[11px] font-bold text-[#1E8E3E]">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="mt-2 break-words text-sm text-slate-600">{address.details}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {!address.isDefault && (
                        <button
                          type="button"
                          onClick={() => setDefaultAddress(address.id)}
                          className="rounded-lg px-2.5 py-2 text-xs font-bold text-[#1E8E3E] transition hover:bg-emerald-50"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteAddress(address.id)}
                        aria-label={`Delete ${address.label} address`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 aria-hidden="true" size={17} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                No saved addresses yet. Add one below for a faster checkout.
              </p>
            )}

            <form onSubmit={handleAddressSubmit} className="mt-5 border-t border-slate-100 pt-5">
              <h3 className="text-sm font-bold text-slate-800">Add New Address</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">
                  Label
                  <select
                    value={addressDraft.label}
                    onChange={(event) =>
                      setAddressDraft((current) => ({ ...current, label: event.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#1E8E3E] focus:ring-4 focus:ring-[#1E8E3E]/10"
                  >
                    <option>Home</option>
                    <option>Work</option>
                    <option>Other</option>
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700">
                  Addis Ababa Zone
                  <select
                    value={addressDraft.zone}
                    onChange={(event) =>
                      setAddressDraft((current) => ({ ...current, zone: event.target.value }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#1E8E3E] focus:ring-4 focus:ring-[#1E8E3E]/10"
                  >
                    {ADDIS_ZONES.map((zone) => <option key={zone}>{zone}</option>)}
                  </select>
                </label>
                <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
                  Street / Landmark
                  <input
                    required
                    value={addressDraft.details}
                    onChange={(event) =>
                      setAddressDraft((current) => ({ ...current, details: event.target.value }))
                    }
                    placeholder="Street name, building, or nearby landmark"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#1E8E3E] focus:ring-4 focus:ring-[#1E8E3E]/10"
                  />
                </label>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#1E8E3E]/30 px-4 py-2.5 text-sm font-bold text-[#1E8E3E] transition hover:bg-[#1E8E3E] hover:text-white"
                  >
                    <Plus aria-hidden="true" size={17} />
                    Add Address
                  </button>
                </div>
              </div>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#F04E00]">
                <KeyRound aria-hidden="true" size={21} />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-[#0E532B]">Security &amp; Update Password</h2>
                <p className="mt-1 text-sm text-slate-500">Use a strong password to protect your account.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
              {[
                { key: 'current', label: 'Current Password', autoComplete: 'current-password' },
                { key: 'next', label: 'New Password', autoComplete: 'new-password' },
                { key: 'confirm', label: 'Confirm New Password', autoComplete: 'new-password' },
              ].map(({ key, label, autoComplete }) => (
                <label key={key} className="block text-sm font-semibold text-slate-700">
                  {label}
                  <span className="relative mt-2 block">
                    <KeyRound
                      aria-hidden="true"
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      required
                      type={passwordVisibility[key] ? 'text' : 'password'}
                      autoComplete={autoComplete}
                      value={passwords[key]}
                      onChange={(event) =>
                        setPasswords((current) => ({ ...current, [key]: event.target.value }))
                      }
                      className={PASSWORD_INPUT}
                    />
                    <button
                      type="button"
                      aria-label={passwordVisibility[key] ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                      aria-pressed={passwordVisibility[key]}
                      onClick={() =>
                        setPasswordVisibility((current) => ({ ...current, [key]: !current[key] }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      {passwordVisibility[key] ? (
                        <EyeOff aria-hidden="true" size={18} />
                      ) : (
                        <Eye aria-hidden="true" size={18} />
                      )}
                    </button>
                  </span>
                  {key === 'next' && (
                    <span className="mt-1 block text-xs font-normal text-slate-400">
                      Use at least 8 characters.
                    </span>
                  )}
                </label>
              ))}
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0B4B8C] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#083c70]"
              >
                Update Password
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Profile
