import { Bike, Pencil, Plus, Trash2, Truck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AdminPageHeader, Modal, StatusBadge } from '../../components/admin/AdminUI.jsx'
import { initialDeliveryStaff } from '../../data/adminMockData.js'
import { loadOrders } from '../../data/mockData.js'
import usePersistentState from '../../hooks/usePersistentState.js'

const blankStaff = { name: '', email: '', phone: '', vehicle: 'Bicycle' }

function DeliveryStaff() {
  const [staff, setStaff] = usePersistentState('admin-delivery-staff', initialDeliveryStaff)
  const [orders] = usePersistentState('grocery-orders', loadOrders)
  const [search, setSearch] = useState('')
  const [editingStaff, setEditingStaff] = useState(null)
  const [draft, setDraft] = useState(blankStaff)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filteredStaff = useMemo(
    () =>
      staff.filter((person) =>
        `${person.name} ${person.email}`.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [search, staff],
  )

  const openAddModal = () => {
    setEditingStaff(null)
    setDraft(blankStaff)
    setModalOpen(true)
  }

  const openEditModal = (person) => {
    setEditingStaff(person)
    setDraft({
      name: person.name,
      email: person.email,
      phone: person.phone,
      vehicle: person.vehicle,
    })
    setModalOpen(true)
  }

  const handleSave = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const staffMember = {
      id: editingStaff?.id || `D-${Date.now()}`,
      name: String(formData.get('name')).trim(),
      email: String(formData.get('email')).trim(),
      phone: String(formData.get('phone')).trim(),
      vehicle: String(formData.get('vehicle')),
      status: editingStaff?.status || 'Active',
    }

    setStaff((current) =>
      editingStaff
        ? current.map((person) => person.id === editingStaff.id ? staffMember : person)
        : [staffMember, ...current],
    )
    setModalOpen(false)
    setEditingStaff(null)
  }

  const toggleStatus = (person) => {
    setStaff((current) =>
      current.map((member) =>
        member.id === person.id
          ? { ...member, status: member.status === 'Active' ? 'Offline' : 'Active' }
          : member,
      ),
    )
  }

  const confirmDelete = () => {
    setStaff((current) => current.filter((person) => person.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div>
      <AdminPageHeader
        title="Delivery staff"
        description="Manage your delivery team and monitor their availability."
        action={
          <button type="button" onClick={openAddModal} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            <Plus aria-hidden="true" size={17} /> Add staff member
          </button>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Team members</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{staff.length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Active now</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{staff.filter((person) => person.status === 'Active').length}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Orders assigned</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{orders.filter((order) => order.deliveryStaff).length}</p>
        </article>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search delivery staff..."
            aria-label="Search delivery staff"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 sm:max-w-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Staff member</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
                <th className="px-5 py-3 font-semibold">Vehicle</th>
                <th className="px-5 py-3 font-semibold">Assigned orders</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((person) => {
                const assignedCount = orders.filter(
                  (order) => order.deliveryStaff === person.name && order.status !== 'Delivered',
                ).length
                const VehicleIcon = person.vehicle === 'Car' ? Truck : Bike
                return (
                  <tr key={person.id}>
                    <td className="px-5 py-4 font-semibold text-slate-900">{person.name}</td>
                    <td className="px-5 py-4">
                      <p className="text-slate-700">{person.email}</p>
                      <p className="mt-1 text-xs text-slate-500">{person.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 text-slate-600">
                        <VehicleIcon aria-hidden="true" size={16} /> {person.vehicle}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700">{assignedCount}</td>
                    <td className="px-5 py-4">
                      <button type="button" onClick={() => toggleStatus(person)} title="Toggle availability">
                        <StatusBadge status={person.status} />
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <button type="button" aria-label={`Edit ${person.name}`} onClick={() => openEditModal(person)} className="rounded-lg p-2 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700">
                          <Pencil aria-hidden="true" size={16} />
                        </button>
                        <button type="button" aria-label={`Remove ${person.name}`} onClick={() => setDeleteTarget(person)} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600">
                          <Trash2 aria-hidden="true" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredStaff.length === 0 && (
                <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-500">No delivery staff found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <Modal title={editingStaff ? 'Edit staff member' : 'Add staff member'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Full name
              <input required name="name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input required type="email" name="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Phone
              <input required type="tel" name="phone" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-emerald-500" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Vehicle
              <select name="vehicle" value={draft.vehicle} onChange={(event) => setDraft({ ...draft, vehicle: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-emerald-500">
                <option>Bicycle</option><option>Scooter</option><option>Car</option>
              </select>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
              <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Save member</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Remove staff member?" onClose={() => setDeleteTarget(null)} size="max-w-md">
          <p className="text-sm text-slate-600">Remove {deleteTarget.name} from the delivery team?</p>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            <button type="button" onClick={confirmDelete} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">Remove</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default DeliveryStaff
