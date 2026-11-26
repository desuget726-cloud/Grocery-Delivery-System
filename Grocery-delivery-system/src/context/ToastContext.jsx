import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const ToastContext = createContext(null)
const TOAST_DURATION = 3500
let nextToastId = 0

const toastTypes = {
  success: {
    title: 'Success',
    color: '#1E8E3E',
    Icon: CheckCircle2,
  },
  error: {
    title: 'Error',
    color: '#DC2626',
    Icon: XCircle,
  },
  warning: {
    title: 'Warning',
    color: '#F59E0B',
    Icon: AlertTriangle,
  },
  info: {
    title: 'Information',
    color: '#0B4B8C',
    Icon: Info,
  },
}

function ToastCard({ toast, onDismiss }) {
  const { title, color, Icon } = toastTypes[toast.type]

  useEffect(() => {
    const timeoutId = window.setTimeout(() => onDismiss(toast.id), TOAST_DURATION)
    return () => window.clearTimeout(timeoutId)
  }, [onDismiss, toast.id])

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className="pointer-events-auto flex animate-slide-in items-start gap-3 rounded-2xl border border-gray-100 border-l-4 bg-white p-3.5 shadow-xl"
      style={{ borderLeftColor: color }}
    >
      <Icon aria-hidden="true" size={21} className="mt-0.5 shrink-0" style={{ color }} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-gray-900">{title}</p>
        <p className="mt-0.5 break-words text-sm leading-5 text-gray-600">{toast.message}</p>
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
        className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
      >
        <X aria-hidden="true" size={16} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
  }, [])

  const notify = useCallback((type, message) => {
    if (typeof message !== 'string' || !message.trim()) {
      throw new TypeError('Toast notifications require a non-empty message')
    }

    const id = ++nextToastId
    setToasts((currentToasts) => [...currentToasts, { id, type, message }].slice(-4))
    return id
  }, [])

  const toast = useMemo(() => ({
    success: (message) => notify('success', message),
    error: (message) => notify('error', message),
    warning: (message) => notify('warning', message),
    info: (message) => notify('info', message),
  }), [notify])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed right-5 top-20 z-[100] flex w-full max-w-sm flex-col gap-2.5">
        {toasts.map((item) => (
          <ToastCard key={item.id} toast={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// The hook is intentionally exported alongside its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext)
  if (context === null) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
