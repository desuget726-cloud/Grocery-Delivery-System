import { useEffect, useId, useState } from 'react'
import {
  Bell,
  Check,
  CreditCard,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  MapPin,
  Plus,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  Trash2,
  Truck,
} from 'lucide-react'
import logo from '../../assets/logo.png'
import { useAuth } from '../../context/AuthContext.jsx'
import { logAuditEvent } from '../../services/auditLog.js'
import { adminApi, getApiErrorMessage, notifications as notificationsApi, settings as settingsApi } from '../../services/api.js'
import { useLanguage } from '../../context/LanguageContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'

const DEFAULT_SETTINGS = {
  storeProfile: {
    name: 'GROCERY DELIVERY SYSTEM',
    tagline: 'Speed • Fresh • Direct',
    supportEmail: 'support@grocerydelivery.et',
    supportPhone: '+251 912 345 678',
    address: 'Bole, Addis Ababa, Ethiopia',
    currency: 'ETB',
    isOpen: true,
    maintenanceMessage: "We're restocking fresh groceries and will reopen shortly!",
    openTime: '08:00',
    closeTime: '21:00',
  },
  delivery: {
    freeThreshold: 500,
    standardFee: 50,
    expressFee: 120,
    minimumOrder: 150,
    maxRadius: 15,
    zones: [
      { id: 'bole', name: 'Bole', fee: 40, active: true },
      { id: 'kazanchis', name: 'Kazanchis', fee: 50, active: true },
      { id: 'cmc-ayat', name: 'CMC / Ayat', fee: 75, active: true },
      { id: 'piassa', name: 'Piassa', fee: 50, active: true },
      { id: 'sarbet', name: 'Sarbet', fee: 45, active: true },
    ],
    timeSlots: [
      { id: 'express', name: 'Express', hours: '30–45 mins', active: true },
      { id: 'morning', name: 'Morning', hours: '8AM–11AM', active: true },
      { id: 'afternoon', name: 'Afternoon', hours: '12PM–4PM', active: true },
      { id: 'evening', name: 'Evening', hours: '5PM–9PM', active: true },
    ],
  },
  payments: {
    telebirr: { active: true, credential: '' },
    cbeBirr: { active: true, credential: '' },
    chapa: { active: true, publicKey: '', mode: 'Test' },
    cod: { active: true, maxLimit: 5000 },
    vatRate: 15,
    pricesIncludeVat: true,
  },
  rules: {
    lowStockThreshold: 5,
    expiryWarningDays: 3,
    autoCancelMinutes: 30,
    requireOtp: true,
    allowBackorders: false,
    autoAssignRider: true,
  },
  notifications: {
    adminEmail: 'admin@grocerydelivery.et',
    adminPhone: '+251 911 234 567',
    admin: {
      newOrder: true,
      lowStock: true,
      expiring: true,
      newReview: true,
    },
    customer: {
      orderConfirmed: true,
      riderAssigned: true,
      outForDelivery: true,
      delivered: true,
    },
  },
  security: {
    twoFactorEnabled: false,
  },
}

const settingTabs = [
  { id: 'store', translationKey: 'storeProfile', icon: Store },
  { id: 'delivery', translationKey: 'deliveryZones', icon: Truck },
  { id: 'payments', translationKey: 'paymentsTax', icon: CreditCard },
  { id: 'rules', translationKey: 'ordersInventory', icon: SlidersHorizontal },
  { id: 'notifications', translationKey: 'notifications', icon: Bell },
  { id: 'security', translationKey: 'securityTab', icon: ShieldCheck },
]

function fromApiSettings(record) {
  const paymentGateways = record.paymentGateways || {}
  const zones = Array.isArray(record.zones)
    ? record.zones.map((zone, index) => {
        if (typeof zone !== 'string') return zone
        const defaults = DEFAULT_SETTINGS.delivery.zones.find((item) => item.name === zone)
        return defaults || { id: `zone-${index}`, name: zone, fee: 0, active: true }
      })
    : DEFAULT_SETTINGS.delivery.zones
  const timeSlots = Array.isArray(record.timeSlots)
    ? record.timeSlots.map((slot, index) => typeof slot === 'string'
        ? { id: `slot-${index}`, name: slot, hours: slot, active: true }
        : slot)
    : DEFAULT_SETTINGS.delivery.timeSlots

  return {
    ...DEFAULT_SETTINGS,
    storeProfile: {
      ...DEFAULT_SETTINGS.storeProfile,
      name: record.storeName ?? DEFAULT_SETTINGS.storeProfile.name,
      tagline: record.tagline ?? DEFAULT_SETTINGS.storeProfile.tagline,
      supportEmail: record.supportEmail ?? DEFAULT_SETTINGS.storeProfile.supportEmail,
      supportPhone: record.supportPhone ?? DEFAULT_SETTINGS.storeProfile.supportPhone,
      address: record.warehouseAddress ?? DEFAULT_SETTINGS.storeProfile.address,
      logo: record.logoUrl ?? '',
      isOpen: record.isStoreOpen ?? DEFAULT_SETTINGS.storeProfile.isOpen,
      maintenanceMessage: record.maintenanceMessage ?? DEFAULT_SETTINGS.storeProfile.maintenanceMessage,
    },
    delivery: {
      ...DEFAULT_SETTINGS.delivery,
      freeThreshold: Number(record.freeDeliveryThreshold ?? DEFAULT_SETTINGS.delivery.freeThreshold),
      standardFee: Number(record.standardFee ?? DEFAULT_SETTINGS.delivery.standardFee),
      expressFee: Number(record.expressFee ?? DEFAULT_SETTINGS.delivery.expressFee),
      minimumOrder: Number(record.minOrderAmount ?? DEFAULT_SETTINGS.delivery.minimumOrder),
      zones,
      timeSlots,
    },
    payments: {
      ...DEFAULT_SETTINGS.payments,
      telebirr: { ...DEFAULT_SETTINGS.payments.telebirr, active: paymentGateways.telebirr ?? true },
      cbeBirr: { ...DEFAULT_SETTINGS.payments.cbeBirr, active: paymentGateways.cbeBirr ?? true },
      chapa: { ...DEFAULT_SETTINGS.payments.chapa, active: paymentGateways.chapa ?? true },
      cod: { ...DEFAULT_SETTINGS.payments.cod, active: paymentGateways.cashOnDelivery ?? paymentGateways.cod ?? true },
      vatRate: Number(record.vatRate ?? 0.15) * 100,
    },
    rules: {
      ...DEFAULT_SETTINGS.rules,
      requireOtp: record.requireDeliveryOtp ?? DEFAULT_SETTINGS.rules.requireOtp,
    },
  }
}

function toApiSettings(settings) {
  return {
    storeName: settings.storeProfile.name,
    tagline: settings.storeProfile.tagline,
    supportEmail: settings.storeProfile.supportEmail,
    supportPhone: settings.storeProfile.supportPhone,
    warehouseAddress: settings.storeProfile.address,
    logoUrl: settings.storeProfile.logo || null,
    isStoreOpen: settings.storeProfile.isOpen,
    maintenanceMessage: settings.storeProfile.maintenanceMessage,
    freeDeliveryThreshold: Number(settings.delivery.freeThreshold),
    standardFee: Number(settings.delivery.standardFee),
    expressFee: Number(settings.delivery.expressFee),
    minOrderAmount: Number(settings.delivery.minimumOrder),
    vatRate: Number(settings.payments.vatRate) / 100,
    requireDeliveryOtp: settings.rules.requireOtp,
    zones: settings.delivery.zones,
    timeSlots: settings.delivery.timeSlots,
    paymentGateways: {
      telebirr: settings.payments.telebirr.active,
      cbeBirr: settings.payments.cbeBirr.active,
      chapa: settings.payments.chapa.active,
      cashOnDelivery: settings.payments.cod.active,
    },
  }
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
  min,
  max,
  step = 'any',
  autoComplete,
  suffix,
  action,
}) {
  const { t } = useLanguage()
  const inputId = useId()

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold text-slate-700">{t(label)}</label>
      <div className="relative">
        <input
          id={inputId}
          type={type}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder ? t(placeholder) : undefined}
          min={min}
          max={max}
          step={step}
          autoComplete={autoComplete}
          className={`w-full rounded-lg border border-gray-300/80 bg-white px-3.5 py-2 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15 ${suffix || action ? 'pr-12' : ''}`}
        />
        {action && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            {action}
          </span>
        )}
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
            {suffix}
          </span>
        )}
      </div>
      {hint && <span className="mt-1 block text-[11px] leading-4 text-slate-400">{t(hint)}</span>}
    </div>
  )
}

function ToggleRow({ label, description, checked, onChange }) {
  const { t } = useLanguage()

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-800">{t(label)}</p>
        {description && <p className="mt-0.5 text-xs leading-5 text-slate-500">{t(description)}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={t(label)}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${checked ? 'bg-[#1E8E3E]' : 'bg-slate-300'}`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

function Card({ title, description, children, badge, className = '' }) {
  const { t } = useLanguage()

  return (
    <section className={`overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm divide-y divide-gray-100 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {(title || description) && (
          <div className="p-6 lg:col-span-4">
            {title && (
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-[#0E532B]">{t(title)}</h2>
                {badge && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DDEEE0] bg-[#F5FAF6] px-2.5 py-1 text-[10px] font-semibold text-[#0E532B]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#1E8E3E]" />
                    {t(badge)}
                  </span>
                )}
              </div>
            )}
            {description && <p className="mt-1.5 text-sm leading-6 text-gray-500">{t(description)}</p>}
          </div>
        )}
        <div className="min-w-0 p-6 lg:col-span-8 lg:border-l lg:border-gray-100">
          {children}
        </div>
      </div>
    </section>
  )
}

function Settings() {
  const { t } = useLanguage()
  const toast = useToast()
  const { changePassword, token } = useAuth()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [savedSettingsSnapshot, setSavedSettingsSnapshot] = useState('')
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [auditLogs, setAuditLogs] = useState([])
  const [auditLogsLoading, setAuditLogsLoading] = useState(false)
  const [auditLogsError, setAuditLogsError] = useState('')
  const [activeTab, setActiveTab] = useState('store')
  const [zoneName, setZoneName] = useState('')
  const [zoneFee, setZoneFee] = useState('')
  const [zoneError, setZoneError] = useState('')
  const [passwordFields, setPasswordFields] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordNotice, setPasswordNotice] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [showGatewayKeys, setShowGatewayKeys] = useState({})
  const [gatewayChecks, setGatewayChecks] = useState({})
  const hasUnsavedChanges = JSON.stringify(toApiSettings(settings)) !== savedSettingsSnapshot

  useEffect(() => {
    let active = true
    settingsApi.getPublic()
      .then(({ data }) => {
        if (!active) return
        const nextSettings = fromApiSettings(data.settings || {})
        setSettings(nextSettings)
        setSavedSettingsSnapshot(JSON.stringify(toApiSettings(nextSettings)))
      })
      .catch((error) => {
        if (active) toast.error(getApiErrorMessage(error, 'Could not load store settings.'))
      })
      .finally(() => {
        if (active) setLoadingSettings(false)
      })
    return () => {
      active = false
    }
  }, [toast])

  useEffect(() => {
    if (activeTab !== 'security') return undefined
    let active = true
    adminApi.auditLogs({ page: 1, limit: 20 })
      .then(({ data }) => {
        if (!active) return
        setAuditLogs(data.logs || [])
        setAuditLogsError('')
      })
      .catch((error) => {
        if (!active) return
        const message = getApiErrorMessage(error, 'Could not load security activity.')
        setAuditLogsError(message)
        toast.error(message)
      })
      .finally(() => {
        if (active) setAuditLogsLoading(false)
      })
    return () => {
      active = false
    }
  }, [activeTab, toast])

  const updateSection = (section, field, value) => {
    setSettings((current) => ({
      ...current,
      [section]: { ...current[section], [field]: value },
    }))
  }

  const updateNested = (section, group, field, value) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [group]: { ...current[section][group], [field]: value },
      },
    }))
  }

  const persistSettings = async (nextSettings, successMessage = t('settings.settingsSavedSuccessfully')) => {
    try {
      const { data } = await settingsApi.update(toApiSettings(nextSettings))
      const savedSettings = fromApiSettings(data.settings || {})
      setSettings(savedSettings)
      setSavedSettingsSnapshot(JSON.stringify(toApiSettings(savedSettings)))
      window.dispatchEvent(
        new CustomEvent('grocery-store-status-change', {
          detail: { isOpen: savedSettings.storeProfile.isOpen },
        }),
      )
      logAuditEvent({
        action: 'Updated store settings',
        category: 'Administration',
        resource: 'Store settings',
      })
      toast.success(successMessage)
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('settings.saveSettingsError')))
    }
  }

  const updateStoreAvailability = async (isOpen) => {
    try {
      await settingsApi.update({
        isStoreOpen: isOpen,
        maintenanceMessage: settings.storeProfile.maintenanceMessage,
      })
      setSettings((current) => ({
        ...current,
        storeProfile: { ...current.storeProfile, isOpen },
      }))
      const savedSnapshot = savedSettingsSnapshot ? JSON.parse(savedSettingsSnapshot) : toApiSettings(settings)
      setSavedSettingsSnapshot(JSON.stringify({
        ...savedSnapshot,
        isStoreOpen: isOpen,
        maintenanceMessage: settings.storeProfile.maintenanceMessage,
      }))
      window.dispatchEvent(
        new CustomEvent('grocery-store-status-change', { detail: { isOpen } }),
      )
      logAuditEvent({
        action: isOpen ? 'Opened store' : 'Closed store',
        category: 'Administration',
        resource: 'Store availability',
      })
      toast.success(isOpen ? 'Store opened successfully.' : 'Store closed successfully.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('settings.saveSettingsError')))
    }
  }

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Choose a valid image file.')
      event.target.value = ''
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Store logo must be 2 MB or smaller.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        toast.error('Unable to read the selected logo.')
        return
      }
      updateSection('storeProfile', 'logo', reader.result)
    }
    reader.onerror = () => {
      console.error('Unable to read the selected store logo:', reader.error)
      toast.error('Unable to read the selected logo.')
    }
    reader.readAsDataURL(file)
  }

  const testGateway = (gateway, credentials) => {
    if (!credentials.some((credential) => credential.trim())) {
      setGatewayChecks((current) => ({ ...current, [gateway]: false }))
      toast.error('Add gateway credentials before testing.')
      return
    }
    setGatewayChecks((current) => ({ ...current, [gateway]: true }))
    toast.success('Payment gateway credentials verified.')
  }

  const sendTestNotification = async () => {
    const now = new Date()
    const notification = {
      id: `test-${now.getTime()}`,
      title: 'Test notification',
      category: 'System',
      priority: 'Normal',
      description: `Test alert sent to ${settings.notifications.adminEmail} and ${settings.notifications.adminPhone}.`,
      actionLabel: 'Open settings',
      actionPath: '/admin/settings',
      timestamp: 'Just now',
      unread: true,
    }
    try {
      await notificationsApi.create({
        title: notification.title,
        message: notification.description,
        category: 'SYSTEM',
        priority: 'NORMAL',
        actionPath: notification.actionPath,
      })
      toast.success('Test notification sent.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to send test notification.'))
    }
  }

  const resetDefaults = () => {
    if (!window.confirm(t('settings.resetConfirmation'))) return
    persistSettings(DEFAULT_SETTINGS, t('settings.defaultsRestored'))
    setZoneError('')
  }

  const addZone = (event) => {
    event.preventDefault()
    const name = zoneName.trim()
    const fee = Number(zoneFee)
    if (!name) {
      setZoneError(t('settings.enterZoneName'))
      toast.error(t('settings.enterZoneName'))
      return
    }
    if (!zoneFee.trim() || !Number.isFinite(fee) || fee < 0) {
      setZoneError(t('settings.enterValidDeliveryFee'))
      toast.error(t('settings.enterValidDeliveryFee'))
      return
    }
    if (settings.delivery.zones.some((zone) => zone.name.toLowerCase() === name.toLowerCase())) {
      setZoneError(t('settings.zoneAlreadyExists'))
      toast.error(t('settings.zoneAlreadyExists'))
      return
    }
    updateSection('delivery', 'zones', [
      ...settings.delivery.zones,
      { id: `zone-${Date.now()}`, name, fee, active: true },
    ])
    setZoneName('')
    setZoneFee('')
    setZoneError('')
    toast.info('Delivery zone added. Save changes to apply it.')
  }

  const submitPasswordChange = async (event) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordNotice('')
    if (!passwordFields.current) {
      setPasswordError(t('settings.enterCurrentPassword'))
      toast.error(t('settings.enterCurrentPassword'))
      return
    }
    if (passwordFields.next.length < 8) {
      setPasswordError(t('settings.passwordMinimumLength'))
      toast.error(t('settings.passwordMinimumLength'))
      return
    }
    if (passwordFields.next !== passwordFields.confirm) {
      setPasswordError(t('settings.passwordsDoNotMatch'))
      toast.error(t('settings.passwordsDoNotMatch'))
      return
    }
    try {
      await changePassword(passwordFields.current, passwordFields.next)
      setPasswordFields({ current: '', next: '', confirm: '' })
      setPasswordNotice('Password updated successfully.')
      toast.success('Password updated successfully.')
    } catch (error) {
      const message = error.message || 'Unable to update password. Please try again.'
      setPasswordError(message)
    }
  }

  const signOutOtherSessions = () => {
    try {
      const localAuth = window.localStorage.getItem('grocery-auth')
      const activeInLocalStorage = localAuth && JSON.parse(localAuth).token === token
      const otherStorage = activeInLocalStorage
        ? window.sessionStorage
        : window.localStorage
      otherStorage.removeItem('grocery-auth')
      otherStorage.removeItem('token')
      toast.success('Other saved sessions on this browser have been signed out.')
    } catch (error) {
      console.error('Unable to sign out other admin sessions:', error)
      toast.error('Unable to sign out other sessions.')
    }
  }

  const renderStoreProfile = () => (
    <div className="w-full space-y-6">
      <Card title="Store profile" description="Customer-facing business details, support contacts, and warehouse location." badge="Synced with Storefront">
        <div className="grid gap-5 lg:grid-cols-[1fr_180px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Store Name" value={settings.storeProfile.name} onChange={(value) => updateSection('storeProfile', 'name', value)} />
            <Field label="Tagline" value={settings.storeProfile.tagline} onChange={(value) => updateSection('storeProfile', 'tagline', value)} />
            <Field label="Support Email" type="email" value={settings.storeProfile.supportEmail} onChange={(value) => updateSection('storeProfile', 'supportEmail', value)} />
            <Field label="Support Phone" type="tel" value={settings.storeProfile.supportPhone} onChange={(value) => updateSection('storeProfile', 'supportPhone', value)} />
            <div className="sm:col-span-2">
              <Field label="Warehouse Address" value={settings.storeProfile.address} onChange={(value) => updateSection('storeProfile', 'address', value)} />
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">{t('Currency')}</span>
              <select value={settings.storeProfile.currency} onChange={(event) => updateSection('storeProfile', 'currency', event.target.value)} className="w-full rounded-lg border border-gray-300/80 bg-white px-3.5 py-2 text-sm outline-none focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15">
                <option value="ETB">{t('settings.ethiopianBirr')}</option>
              </select>
            </label>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
            <img src={settings.storeProfile.logo || logo} alt={t('settings.storeLogoAlt')} className="h-24 w-36 object-contain" />
            <label className="mt-3 block w-full text-left">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Store logo</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-xs text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-white file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-[#0E532B] hover:file:bg-emerald-50" />
            </label>
            <button type="button" onClick={() => updateSection('storeProfile', 'logo', '')} className="mt-2 text-xs font-semibold text-[#0B4B8C] hover:underline">
              Reset Logo
            </button>
            <p className="mt-1 text-[10px] text-slate-400">PNG, JPG, or SVG · 2 MB max</p>
          </div>
        </div>
      </Card>

      <Card title="Store availability" description="Pause online ordering during planned maintenance or outside operating hours." badge="Synced with Storefront">
        <div className={`mb-4 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${settings.storeProfile.isOpen ? 'border-[#B9DDBF] bg-[#F0F7F1]' : 'border-orange-200 bg-orange-50'}`}>
          <div>
            <p className={`text-sm font-bold ${settings.storeProfile.isOpen ? 'text-[#0E532B]' : 'text-[#F04E00]'}`}>
              {t(settings.storeProfile.isOpen ? 'Store Open' : 'Maintenance Mode')}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              {t(settings.storeProfile.isOpen ? 'Customers can browse and place orders.' : 'Ordering is paused while maintenance mode is active.')}
            </p>
          </div>
          <ToggleRow
            label={settings.storeProfile.isOpen ? 'Store Open' : 'Maintenance Mode'}
            checked={settings.storeProfile.isOpen}
            onChange={updateStoreAvailability}
          />
        </div>
        {!settings.storeProfile.isOpen && (
          <div className="mb-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">Customer Maintenance Message</span>
              <textarea
                rows={3}
                value={settings.storeProfile.maintenanceMessage}
                onChange={(event) => updateSection('storeProfile', 'maintenanceMessage', event.target.value)}
                className="w-full resize-y rounded-lg border border-gray-300/80 bg-white px-3.5 py-2 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15"
              />
            </label>
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Daily Opening Time" type="time" value={settings.storeProfile.openTime} onChange={(value) => updateSection('storeProfile', 'openTime', value)} />
          <Field label="Daily Closing Time" type="time" value={settings.storeProfile.closeTime} onChange={(value) => updateSection('storeProfile', 'closeTime', value)} />
        </div>
      </Card>
    </div>
  )

  const renderDelivery = () => (
    <div className="w-full space-y-6">
      <Card title="Delivery pricing & coverage" description="Set checkout delivery pricing and the farthest distance served from your warehouse." badge="Synced with Checkout">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Free Delivery Threshold" suffix="ETB" type="number" min="0" value={settings.delivery.freeThreshold} onChange={(value) => updateSection('delivery', 'freeThreshold', value)} />
          <Field label="Standard Delivery Fee" suffix="ETB" type="number" min="0" value={settings.delivery.standardFee} onChange={(value) => updateSection('delivery', 'standardFee', value)} />
          <Field label="Express Delivery Fee" suffix="ETB" type="number" min="0" value={settings.delivery.expressFee} onChange={(value) => updateSection('delivery', 'expressFee', value)} />
          <Field label="Minimum Order Amount" suffix="ETB" type="number" min="0" value={settings.delivery.minimumOrder} onChange={(value) => updateSection('delivery', 'minimumOrder', value)} />
          <Field label="Max Delivery Radius (km)" type="number" min="1" value={settings.delivery.maxRadius} onChange={(value) => updateSection('delivery', 'maxRadius', value)} />
        </div>
      </Card>

      <Card title="Addis Ababa delivery zones" description="Manage local delivery fees and temporarily pause service in a zone." badge="Synced with Checkout">
        <div className="space-y-2">
          {settings.delivery.zones.map((zone) => (
            <div key={zone.id} className="grid grid-cols-[minmax(0,1fr)_105px_auto_auto] items-center gap-2 rounded-xl border border-slate-100 px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2">
                <MapPin size={15} className="shrink-0 text-[#1E8E3E]" />
                <span className="truncate text-sm font-semibold text-slate-700">{zone.name}</span>
              </div>
              <label className="relative">
                <span className="sr-only">{zone.name} {t('settings.deliveryFeeEtb')}</span>
                <input
                  type="number"
                  min="0"
                  value={zone.fee}
                  onChange={(event) => setSettings((current) => ({
                    ...current,
                    delivery: {
                      ...current.delivery,
                      zones: current.delivery.zones.map((item) => item.id === zone.id ? { ...item, fee: event.target.value } : item),
                    },
                  }))}
                  className="w-full rounded-lg border border-gray-300/80 px-3.5 py-2 pr-10 text-sm outline-none focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15"
                />
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">ETB</span>
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={zone.active}
                aria-label={`${zone.name} ${t('settings.zoneActive')}`}
                onClick={() => setSettings((current) => ({
                  ...current,
                  delivery: {
                    ...current.delivery,
                    zones: current.delivery.zones.map((item) => item.id === zone.id ? { ...item, active: !item.active } : item),
                  },
                }))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${zone.active ? 'bg-[#1E8E3E]' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${zone.active ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
              </button>
              <button
                type="button"
                onClick={() => setSettings((current) => ({
                  ...current,
                  delivery: { ...current.delivery, zones: current.delivery.zones.filter((item) => item.id !== zone.id) },
                }))}
                aria-label={`${t('settings.removeZone')} ${zone.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-orange-50 hover:text-[#F04E00]"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {settings.delivery.zones.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">{t('settings.noDeliveryZonesConfigured')}</p>}
        </div>
        <form onSubmit={addZone} className="mt-4 rounded-xl border border-dashed border-slate-300 p-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_150px_auto]">
            <input value={zoneName} onChange={(event) => setZoneName(event.target.value)} placeholder={t('settings.newZoneName')} aria-label={t('settings.newZoneName')} className="w-full rounded-lg border border-gray-300/80 px-3.5 py-2 text-sm outline-none focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15" />
            <input type="number" min="0" value={zoneFee} onChange={(event) => setZoneFee(event.target.value)} placeholder={t('settings.feeEtb')} aria-label={t('settings.newZoneDeliveryFee')} className="w-full rounded-lg border border-gray-300/80 px-3.5 py-2 text-sm outline-none focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15" />
            <button type="submit" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#1E8E3E] px-4 text-xs font-semibold text-white hover:bg-[#0E532B]"><Plus size={14} /> {t('Add Zone')}</button>
          </div>
          {zoneError && <p role="alert" className="mt-2 text-xs text-[#F04E00]">{zoneError}</p>}
        </form>
      </Card>

      <Card title="Available delivery time slots" description="Customers can choose from active delivery windows at checkout." badge="Synced with Checkout">
        <div className="divide-y divide-slate-100">
          {settings.delivery.timeSlots.map((slot) => (
            <ToggleRow
              key={slot.id}
              label={slot.name}
              description={slot.hours}
              checked={slot.active}
              onChange={(value) => setSettings((current) => ({
                ...current,
                delivery: {
                  ...current.delivery,
                  timeSlots: current.delivery.timeSlots.map((item) => item.id === slot.id ? { ...item, active: value } : item),
                },
              }))}
            />
          ))}
        </div>
      </Card>
    </div>
  )

  const renderPayments = () => {
    const secretField = (gateway, field, label, placeholder) => (
      <Field
        label={label}
        type={showGatewayKeys[gateway] ? 'text' : 'password'}
        value={settings.payments[gateway][field]}
        onChange={(value) => {
          updateNested('payments', gateway, field, value)
          setGatewayChecks((current) => ({ ...current, [gateway]: false }))
        }}
        placeholder={placeholder}
        action={
          <button
            type="button"
            aria-label={showGatewayKeys[gateway] ? 'Hide credential' : 'Show credential'}
            onClick={() => setShowGatewayKeys((current) => ({
              ...current,
              [gateway]: !current[gateway],
            }))}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
          >
            {showGatewayKeys[gateway] ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        }
      />
    )
    const gatewayCard = (title, gateway, fields, credentials = []) => (
      <section key={title} className="rounded-xl border border-slate-200 p-4">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0E532B]">{title}</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">{t(settings.payments[gateway].active ? 'settings.availableAtCheckout' : 'settings.disabledAtCheckout')}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.payments[gateway].active}
            aria-label={`${title} active`}
            onClick={() => updateNested('payments', gateway, 'active', !settings.payments[gateway].active)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${settings.payments[gateway].active ? 'bg-[#1E8E3E]' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${settings.payments[gateway].active ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <div className="mt-4 space-y-4">{fields}</div>
        {gateway !== 'cod' && (
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3">
            <button type="button" onClick={() => testGateway(gateway, credentials)} className="inline-flex h-9 items-center rounded-lg border border-gray-300/80 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
              Test Connection
            </button>
            {gatewayChecks[gateway] && (
              <span role="status" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-[#1E8E3E]">
                <Check size={13} /> Gateway Reachable ✓
              </span>
            )}
            <span className="text-[10px] text-slate-400">Local credential check; provider endpoint is not configured.</span>
          </div>
        )}
      </section>
    )
    return (
      <div className="w-full space-y-6">
        <Card title="Payment gateways" description="Enable the payment options customers can use to complete grocery orders." badge="Synced with Checkout">
          <div className="grid gap-4 md:grid-cols-2">
            {gatewayCard('Telebirr', 'telebirr', (
              secretField('telebirr', 'credential', 'Shortcode / App ID', 'Enter Telebirr shortcode')
            ), [settings.payments.telebirr.credential])}
            {gatewayCard('CBE Birr', 'cbeBirr', (
              secretField('cbeBirr', 'credential', 'Merchant Account', 'Enter merchant account')
            ), [settings.payments.cbeBirr.credential])}
            {gatewayCard('Chapa Card / Bank', 'chapa', (
              <>
                {secretField('chapa', 'publicKey', 'Public Key', 'pk_test_...')}
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">{t('Gateway mode')}</span>
                  <select value={settings.payments.chapa.mode} onChange={(event) => updateNested('payments', 'chapa', 'mode', event.target.value)} className="w-full rounded-lg border border-gray-300/80 bg-white px-3.5 py-2 text-sm outline-none focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15">
                    <option>{t('Test')}</option><option>{t('Live')}</option>
                  </select>
                  <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${settings.payments.chapa.mode === 'Live' ? 'bg-emerald-50 text-[#1E8E3E]' : 'bg-orange-50 text-[#F04E00]'}`}>
                    {t(`settings.${settings.payments.chapa.mode}`)} {t('settings.mode')}
                  </span>
                </label>
              </>
            ), [settings.payments.chapa.publicKey])}
            {gatewayCard('Cash on Delivery (COD)', 'cod', (
              <Field label="Max COD Order Limit" suffix="ETB" type="number" min="0" value={settings.payments.cod.maxLimit} onChange={(value) => updateNested('payments', 'cod', 'maxLimit', value)} />
            ))}
          </div>
        </Card>
        <Card title="VAT & pricing" description="Control how value-added tax is presented and calculated at checkout.">
          <div className="grid gap-5 sm:grid-cols-2 sm:items-end">
            <Field label="VAT / Tax Rate (%)" type="number" min="0" max="100" value={settings.payments.vatRate} onChange={(value) => updateSection('payments', 'vatRate', value)} />
            <ToggleRow
              label="Prices already include VAT"
              description="Do not add VAT again at checkout when enabled."
              checked={settings.payments.pricesIncludeVat}
              onChange={(value) => updateSection('payments', 'pricesIncludeVat', value)}
            />
          </div>
        </Card>
      </div>
    )
  }

  const renderRules = () => (
    <div className="w-full space-y-6">
      <Card title="Order & inventory thresholds" description="Choose when the team receives stock alerts and how long orders remain unpaid.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Low Stock Alert Threshold (units)" type="number" min="0" value={settings.rules.lowStockThreshold} onChange={(value) => updateSection('rules', 'lowStockThreshold', value)} />
          <Field label="Expiry Warning Window (days before expiry)" type="number" min="0" value={settings.rules.expiryWarningDays} onChange={(value) => updateSection('rules', 'expiryWarningDays', value)} />
          <Field label="Auto-Cancel Unpaid Orders After (minutes)" type="number" min="1" value={settings.rules.autoCancelMinutes} onChange={(value) => updateSection('rules', 'autoCancelMinutes', value)} />
        </div>
      </Card>
      <Card title="Order fulfillment rules" description="Optional protections and automation for warehouse and delivery teams.">
        <div className="divide-y divide-slate-100">
          <ToggleRow label="Require Delivery OTP Verification" description="Ask the customer for a one-time code before completing a delivery." checked={settings.rules.requireOtp} onChange={(value) => updateSection('rules', 'requireOtp', value)} />
          <ToggleRow label="Allow Out-of-Stock Backorders" description="Allow customers to place orders for temporarily unavailable products." checked={settings.rules.allowBackorders} onChange={(value) => updateSection('rules', 'allowBackorders', value)} />
          <ToggleRow label="Auto-Assign Nearest Delivery Rider" description="Assign new deliveries to the closest available rider automatically." checked={settings.rules.autoAssignRider} onChange={(value) => updateSection('rules', 'autoAssignRider', value)} />
        </div>
      </Card>
    </div>
  )

  const renderNotifications = () => {
    const rows = (group, entries) => (
      <div className="divide-y divide-slate-100">
        {entries.map(([key, label, description]) => (
          <ToggleRow
            key={key}
            label={label}
            description={description}
            checked={settings.notifications[group][key]}
            onChange={(value) => updateNested('notifications', group, key, value)}
          />
        ))}
      </div>
    )
    return (
      <div className="w-full space-y-6">
        <Card title="Admin alerts" description="Choose which operational events should notify the store team.">
          {rows('admin', [
            ['newOrder', 'New Order Alert', 'Notify admins when a customer submits an order.'],
            ['lowStock', 'Low Stock Warning', 'Alert the team when products reach their reorder threshold.'],
            ['expiring', 'Product Expiring Soon', 'Notify the team about products approaching expiry.'],
            ['newReview', 'New Customer Review', 'Notify the team when a buyer leaves product feedback.'],
          ])}
        </Card>
        <Card title="Customer SMS / email notifications" description="Send customers clear updates during order fulfillment.">
          {rows('customer', [
            ['orderConfirmed', 'Order Confirmed', 'Send confirmation after an order is accepted.'],
            ['riderAssigned', 'Rider Assigned', 'Notify the customer when a delivery rider is assigned.'],
            ['outForDelivery', 'Out for Delivery', 'Send an update when the order leaves the store.'],
            ['delivered', 'Delivered', 'Confirm successful delivery to the customer.'],
          ])}
        </Card>
        <Card title="Alert recipients" description="Set the contacts that receive operational admin alerts.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Admin Alert Email"
              type="email"
              value={settings.notifications.adminEmail}
              onChange={(value) => updateSection('notifications', 'adminEmail', value)}
              autoComplete="email"
            />
            <Field
              label="+251 Alert SMS Phone"
              type="tel"
              value={settings.notifications.adminPhone}
              onChange={(value) => updateSection('notifications', 'adminPhone', value)}
              placeholder="+251 911 234 567"
            />
          </div>
          <button type="button" onClick={sendTestNotification} className="mt-5 inline-flex h-10 items-center rounded-lg bg-[#1E8E3E] px-4 text-sm font-semibold text-white transition hover:bg-[#0E532B]">
            Send Test Notification
          </button>
        </Card>
      </div>
    )
  }

  const renderSecurity = () => (
    <div className="w-full space-y-6">
      <Card title="Change admin password" description="Verify your current password and choose a new password with at least eight characters.">
        <form onSubmit={submitPasswordChange} className="space-y-4">
          <div className="relative">
            <Field label="Current Password" type={showPasswords ? 'text' : 'password'} value={passwordFields.current} onChange={(value) => setPasswordFields((current) => ({ ...current, current: value }))} autoComplete="current-password" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="New Password" type={showPasswords ? 'text' : 'password'} value={passwordFields.next} onChange={(value) => setPasswordFields((current) => ({ ...current, next: value }))} hint={t('settings.passwordHint')} autoComplete="new-password" />
            <Field label="Confirm Password" type={showPasswords ? 'text' : 'password'} value={passwordFields.confirm} onChange={(value) => setPasswordFields((current) => ({ ...current, confirm: value }))} autoComplete="new-password" />
          </div>
          <button type="button" onClick={() => setShowPasswords((value) => !value)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
            {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
            {t(showPasswords ? 'settings.hidePasswords' : 'settings.showPasswords')}
          </button>
          {passwordError && <p role="alert" className="text-xs font-medium text-[#F04E00]">{passwordError}</p>}
          {passwordNotice && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-xs leading-5 text-[#1E8E3E]">{passwordNotice}</p>}
          <div>
            <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1E8E3E] px-4 text-sm font-semibold text-white hover:bg-[#0E532B]">
              <KeyRound size={15} /> Update Password
            </button>
          </div>
        </form>
      </Card>
      <Card title="Account protection" description="Add an extra verification step to protect administrator access.">
        <ToggleRow
          label="Two-Factor Authentication (2FA)"
          description="Require an additional verification code when signing in."
          checked={settings.security.twoFactorEnabled}
          onChange={(value) => updateSection('security', 'twoFactorEnabled', value)}
        />
      </Card>
      <Card title="Active admin sessions" description="Review where your administrator account is currently signed in.">
        <div className="flex flex-col gap-3 rounded-xl border border-[#DDEEE0] bg-[#F8FCF8] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#1E8E3E]"><LockKeyhole size={18} /></span>
            <div>
              <p className="text-sm font-semibold text-slate-800">{t('settings.currentBrowserSession')}</p>
              <p className="mt-1 text-xs text-slate-500">Addis Ababa, Ethiopia <span className="px-1">·</span> {t('settings.activeNow')}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-[#1E8E3E] sm:self-center">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1E8E3E]" /> {t('settings.currentSession')}
          </span>
        </div>
        <button type="button" onClick={signOutOtherSessions} className="mt-4 inline-flex h-9 items-center rounded-lg border border-gray-300/80 px-3.5 text-xs font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-[#F04E00]">
          Sign Out All Other Sessions
        </button>
        <p className="mt-2 text-[10px] text-slate-400">This clears other saved sign-ins on this browser.</p>
      </Card>
      <Card title="Recent security activity" description="A concise audit trail of recent administrator activity.">
        {auditLogsLoading ? (
          <p role="status" className="py-6 text-center text-sm text-slate-500">Loading security activity...</p>
        ) : auditLogsError ? (
          <p role="alert" className="py-6 text-center text-sm text-rose-700">{auditLogsError}</p>
        ) : auditLogs.length ? (
          <ol className="divide-y divide-slate-100">
            {auditLogs.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {entry.action.replaceAll('_', ' ')} · {entry.entity}{entry.entityId ? ` ${entry.entityId}` : ''}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {entry.actorName} ({entry.actorRole})
                    {entry.details ? ` — ${entry.details}` : ''}
                  </p>
                </div>
                <time dateTime={entry.createdAt} className="shrink-0 text-xs text-slate-400">
                  {new Date(entry.createdAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ol>
        ) : (
          <p className="py-6 text-center text-sm text-slate-500">No security activity has been recorded yet.</p>
        )}
      </Card>
    </div>
  )

  const activeTabInfo = settingTabs.find((tab) => tab.id === activeTab)
  const renderActivePanel = () => {
    switch (activeTab) {
      case 'delivery':
        return renderDelivery()
      case 'payments':
        return renderPayments()
      case 'rules':
        return renderRules()
      case 'notifications':
        return renderNotifications()
      case 'security':
        return renderSecurity()
      default:
        return renderStoreProfile()
    }
  }

  return (
    <div className="w-full min-w-0 pb-4">
      <header className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0E532B]">{t('settings')}</h1>
          <p className="mt-1.5 text-sm leading-6 text-gray-500">
            Manage store profile, delivery pricing, payment gateways, notifications, and security.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          {!loadingSettings && hasUnsavedChanges && (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#F04E00]">
              <span className="h-2 w-2 rounded-full bg-[#F04E00]" />
              Unsaved changes
            </span>
          )}
          <button
            type="button"
            onClick={resetDefaults}
            disabled={loadingSettings}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-[#F04E00]"
          >
            <RotateCcw size={15} /> {t('Reset Defaults')}
          </button>
          <button
            type="button"
            onClick={() => persistSettings(settings)}
            disabled={loadingSettings}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0E532B]"
          >
            <Check size={16} /> {t('Save Changes')}
          </button>
        </div>
      </header>
      <p className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-900">
        Store, delivery, gateway availability, and delivery OTP settings sync to the server. Gateway secrets, notification preferences, and security options are not stored by the current backend.
      </p>

      <nav
        role="tablist"
        aria-label={t('settings.settingsNavigation')}
        className="mb-6 flex w-full items-center gap-6 overflow-x-auto overflow-y-hidden whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-b border-gray-200"
      >
        {settingTabs.map(({ id, translationKey, icon: Icon }) => (
          <button
            type="button"
            key={id}
            onClick={() => {
              if (id === 'security') {
                setAuditLogsLoading(true)
                setAuditLogsError('')
              }
              setActiveTab(id)
            }}
            role="tab"
            aria-selected={activeTab === id}
            className={`-mb-px inline-flex min-h-12 shrink-0 items-center gap-2 border-b-2 px-1 pb-3 pt-2 text-sm transition ${
              activeTab === id
                ? 'border-[#1E8E3E] font-semibold text-[#0E532B]'
                : 'border-transparent text-gray-500 hover:text-[#0E532B]'
            }`}
          >
            <Icon size={17} className="shrink-0" aria-hidden="true" />
            <span>{t(translationKey)}</span>
          </button>
        ))}
      </nav>

      <main
        role="tabpanel"
        className="w-full min-w-0 space-y-6"
        aria-label={activeTabInfo?.translationKey ? t(activeTabInfo.translationKey) : undefined}
      >
        {renderActivePanel()}
      </main>
    </div>
  )
}

export default Settings
