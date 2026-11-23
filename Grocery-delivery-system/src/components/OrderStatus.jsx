import { Check } from 'lucide-react'

const statuses = [
  'Pending',
  'Confirmed',
  'Packed',
  'Out for Delivery',
  'Delivered',
]

function OrderStatus({ status = 'Pending' }) {
  const currentIndex = statuses.findIndex(
    (step) => step.toLowerCase() === status.toLowerCase(),
  )
  const activeIndex = currentIndex < 0 ? 0 : currentIndex

  return (
    <ol
      aria-label={`Order status: ${status}`}
      role="list"
      className="flex w-full items-start"
    >
      {statuses.map((step, index) => {
        const isComplete = index < activeIndex
        const isCurrent = index === activeIndex
        const isReached = index <= activeIndex

        return (
          <li
            key={step}
            className="relative flex min-w-0 flex-1 flex-col items-center text-center"
            aria-current={isCurrent ? 'step' : undefined}
          >
            {index > 0 && (
              <span
                aria-hidden="true"
                className={`absolute right-1/2 top-4 h-0.5 w-full ${
                  isReached ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                isReached
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-300 bg-white text-slate-400'
              } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}
            >
              {isComplete ? (
                <Check aria-hidden="true" size={16} />
              ) : (
                <span className="text-xs font-semibold">{index + 1}</span>
              )}
            </span>
            <span
              className={`mt-2 px-1 text-[11px] leading-tight sm:text-sm ${
                isReached ? 'font-semibold text-emerald-800' : 'text-slate-500'
              }`}
            >
              {step}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default OrderStatus
