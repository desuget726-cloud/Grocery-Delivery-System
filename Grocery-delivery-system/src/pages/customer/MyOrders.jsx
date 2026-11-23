import { ChevronDown, PackageCheck } from 'lucide-react'
import { useParams } from 'react-router-dom'
import OrderStatus from '../../components/OrderStatus.jsx'
import { loadOrders } from '../../data/mockData.js'
import formatCurrency from '../../utils/formatCurrency.js'

function MyOrders() {
  const { orderId } = useParams()
  const orders = loadOrders()

  return (
    <div>
      <header className="mb-6">
        <p className="text-sm font-semibold text-emerald-700">Your grocery history</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">My orders</h1>
      </header>

      {orders.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <PackageCheck aria-hidden="true" size={40} className="mx-auto text-emerald-600" />
          <h2 className="mt-3 font-semibold text-slate-900">No orders yet</h2>
          <p className="mt-2 text-sm text-slate-500">Your orders will show up here.</p>
        </section>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <details
              key={order.id}
              open={orderId === order.id || undefined}
              className="group rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
                <div>
                  <p className="font-bold text-slate-900">Order {order.id}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {new Date(order.date).toLocaleDateString()} · {order.items.length}{' '}
                    {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{formatCurrency(order.total)}</span>
                  <ChevronDown
                    aria-hidden="true"
                    size={18}
                    className="text-slate-400 transition group-open:rotate-180"
                  />
                </div>
              </summary>
              <div className="space-y-5 border-t border-slate-100 px-5 py-5">
                <OrderStatus status={order.status} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">Items</h2>
                    <ul className="mt-2 space-y-2">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between gap-3 text-sm text-slate-600">
                          <span>{item.name} × {item.quantity}</span>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold text-slate-800">Delivery:</span> {order.deliverySlot}</p>
                    <p><span className="font-semibold text-slate-800">Payment:</span> {order.paymentMethod}</p>
                    {order.address && (
                      <p>
                        <span className="font-semibold text-slate-800">Address:</span>{' '}
                        {order.address.street}, {order.address.city} {order.address.postalCode}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyOrders
