import { Plus, Trash2, UserRound } from 'lucide-react'
import { useState } from 'react'

const initialAddresses = [
  { id: 'home', label: 'Home', address: 'Add your delivery address' },
]

function Profile() {
  const [profile, setProfile] = useState({ name: 'Alex Morgan', email: 'alex@example.com', phone: '' })
  const [addresses, setAddresses] = useState(initialAddresses)
  const [addressDraft, setAddressDraft] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  const handleProfileSubmit = (event) => {
    event.preventDefault()
    setProfileMessage('Your profile details have been saved.')
  }

  const handleAddressSubmit = (event) => {
    event.preventDefault()
    const address = addressDraft.trim()
    if (!address) {
      return
    }
    setAddresses((current) => [
      ...current,
      { id: `${Date.now()}`, label: 'Delivery address', address },
    ])
    setAddressDraft('')
  }

  const handlePasswordSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newPassword = formData.get('newPassword')
    const confirmPassword = formData.get('confirmPassword')

    if (newPassword !== confirmPassword) {
      setPasswordMessage('The new passwords do not match.')
      return
    }
    setPasswordMessage('Your password has been updated.')
    event.currentTarget.reset()
  }

  return (
    <div className="w-full space-y-6">
      <header>
        <p className="text-sm font-semibold text-emerald-700">Account settings</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Your profile</h1>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <UserRound aria-hidden="true" size={22} />
          </span>
          <div>
            <h2 className="font-bold text-slate-900">Personal information</h2>
            <p className="text-sm text-slate-500">Keep your contact details up to date.</p>
          </div>
        </div>
        <form onSubmit={handleProfileSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Full name
            <input
              required
              value={profile.name}
              onChange={(event) => setProfile({ ...profile, name: event.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Email
            <input
              required
              type="email"
              value={profile.email}
              onChange={(event) => setProfile({ ...profile, email: event.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Phone
            <input
              type="tel"
              value={profile.phone}
              onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
              Save profile
            </button>
            {profileMessage && <p role="status" className="mt-3 text-sm text-emerald-700">{profileMessage}</p>}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="font-bold text-slate-900">Saved delivery addresses</h2>
        <ul className="mt-4 space-y-3">
          {addresses.map((savedAddress) => (
            <li key={savedAddress.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{savedAddress.label}</p>
                <p className="mt-1 text-sm text-slate-600">{savedAddress.address}</p>
              </div>
              <button
                type="button"
                aria-label={`Remove ${savedAddress.label} address`}
                onClick={() => setAddresses((current) => current.filter((item) => item.id !== savedAddress.id))}
                className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 aria-hidden="true" size={17} />
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddressSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={addressDraft}
            onChange={(event) => setAddressDraft(event.target.value)}
            placeholder="Street, city, ZIP / postal code"
            aria-label="New delivery address"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">
            <Plus aria-hidden="true" size={17} /> Add address
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="font-bold text-slate-900">Update password</h2>
        <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Current password
            <input required type="password" name="currentPassword" autoComplete="current-password" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              New password
              <input required minLength="8" type="password" name="newPassword" autoComplete="new-password" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Confirm new password
              <input required minLength="8" type="password" name="confirmPassword" autoComplete="new-password" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
            </label>
          </div>
          <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            Update password
          </button>
          {passwordMessage && <p role="status" className="text-sm text-emerald-700">{passwordMessage}</p>}
        </form>
      </section>
    </div>
  )
}

export default Profile
