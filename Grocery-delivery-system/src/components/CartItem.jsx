import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import formatCurrency from '../utils/formatCurrency.js'

function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart()
  const image = item.image || item.imageUrl
  const title = item.name || item.title || 'Grocery item'

  return (
    <article className="flex flex-wrap items-center gap-4 border-b border-slate-100 py-4 last:border-b-0">
      {image ? (
        <img
          src={image}
          alt=""
          className="h-20 w-20 rounded-xl bg-emerald-50 object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="h-20 w-20 rounded-xl bg-emerald-50"
        />
      )}

      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-slate-900">{title}</h3>
        {item.unit && <p className="mt-1 text-sm text-slate-500">{item.unit}</p>}
        <p className="mt-1 text-sm font-medium text-slate-700">
          {formatCurrency(item.price)} each
        </p>
      </div>

      <div className="flex items-center rounded-xl border border-slate-200 p-1">
        <button
          type="button"
          aria-label={`Decrease ${title} quantity`}
          disabled={item.quantity <= 1}
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus aria-hidden="true" size={16} />
        </button>
        <span aria-live="polite" className="min-w-8 text-center text-sm font-semibold">
          {item.quantity}
        </span>
        <button
          type="button"
          aria-label={`Increase ${title} quantity`}
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          <Plus aria-hidden="true" size={16} />
        </button>
      </div>

      <p className="w-20 text-right font-bold text-slate-900">
        {formatCurrency(item.price * item.quantity)}
      </p>

      <button
        type="button"
        aria-label={`Remove ${title} from cart`}
        onClick={() => removeFromCart(item.id)}
        className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
      >
        <Trash2 aria-hidden="true" size={18} />
      </button>
    </article>
  )
}

export default CartItem
