import { CheckCircle2, ClipboardList, PackageCheck, Truck } from 'lucide-react'

const steps = [
  { label: 'Placed', Icon: ClipboardList },
  { label: 'Confirmed', Icon: CheckCircle2 },
  { label: 'Out for Delivery', Icon: Truck },
  { label: 'Delivered', Icon: PackageCheck },
]

function normalizeStatus(status = '') {
  const normalized = String(status).trim().toLowerCase().replace(/[_-]+/g, ' ')
  const aliases = {
    pending: 'placed',
    accepted: 'confirmed',
    packed: 'confirmed',
    'picked up': 'out for delivery',
    cancelled: 'canceled',
  }
  return aliases[normalized] || normalized
}

function OrderStatus({ status = 'Placed' }) {
  const currentStatus = normalizeStatus(status)
  if (currentStatus === 'canceled') {
    return (
      <p
        role="status"
        className="flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
      >
        This order was canceled.
      </p>
    )
  }

  const currentIndex = steps.findIndex(
    (step) => step.label.toLowerCase() === currentStatus,
  )
  const activeIndex = currentIndex < 0 ? 0 : currentIndex
  const currentLabel = steps[activeIndex].label

  return (
    <ol
      aria-label={`Order status: ${currentLabel}`}
      className="flex w-full items-start"
    >
      {steps.map(({ label, Icon }, index) => {
        const isComplete = index < activeIndex
        const isCurrent = index === activeIndex
        const isReached = index <= activeIndex

        return (
          <li
            key={label}
            className="relative flex min-w-0 flex-1 flex-col items-center text-center"
            aria-current={isCurrent ? 'step' : undefined}
          >
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute left-1/2 top-5 z-0 h-0.5 w-full transition-colors duration-500 ${
                  isComplete ? 'bg-[#1E8E3E]' : 'bg-gray-200'
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
                isReached
                  ? 'border-[#1E8E3E] bg-[#1E8E3E] text-white'
                  : 'border-gray-200 bg-white text-gray-400'
              }`}
            >
              {isCurrent && (
                <span
                  aria-hidden="true"
                  className="absolute -inset-1 rounded-full border border-[#1E8E3E]/35 motion-safe:animate-pulse"
                />
              )}
              <Icon aria-hidden="true" size={18} strokeWidth={2.2} />
            </span>
            <span
              className={`mt-2 px-1 text-[10px] leading-tight sm:text-xs ${
                isReached ? 'font-bold text-[#0E532B]' : 'font-medium text-gray-400'
              }`}
            >
              {label}
            </span>
            {isCurrent && (
              <span className="sr-only">
                Current step: {label}{isComplete ? ' (complete)' : ''}
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default OrderStatus
