import { useEffect, useState } from 'react'
import {
  AlertCircle,
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
import { useLanguage } from '../../context/LanguageContext.jsx'

const STORAGE_KEY = 'grocery_admin_settings'

const DEFAULT_SETTINGS = {
  storeProfile: {
    name: 'GROCERY DELIVERY SYSTEM',
    tagline: 'Speed • Fresh • Direct',
    supportEmail: 'support@grocerydelivery.et',
    supportPhone: '+251 912 345 678',
    address: 'Bole, Addis Ababa, Ethiopia',
    currency: 'ETB',
    isOpen: true,
    maintenanceMessage: 'We are making a few improvements. Please check back soon.',
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

function loadSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_SETTINGS
    const parsed = JSON.parse(saved)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new TypeError('Stored admin settings must be an object')
    }
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      storeProfile: { ...DEFAULT_SETTINGS.storeProfile, ...parsed.storeProfile },
      delivery: {
        ...DEFAULT_SETTINGS.delivery,
        ...parsed.delivery,
        zones: Array.isArray(parsed.delivery?.zones)
          ? parsed.delivery.zones
          : DEFAULT_SETTINGS.delivery.zones,
        timeSlots: Array.isArray(parsed.delivery?.timeSlots)
          ? parsed.delivery.timeSlots
          : DEFAULT_SETTINGS.delivery.timeSlots,
      },
      payments: {
        ...DEFAULT_SETTINGS.payments,
        ...parsed.payments,
        telebirr: { ...DEFAULT_SETTINGS.payments.telebirr, ...parsed.payments?.telebirr },
        cbeBirr: { ...DEFAULT_SETTINGS.payments.cbeBirr, ...parsed.payments?.cbeBirr },
        chapa: { ...DEFAULT_SETTINGS.payments.chapa, ...parsed.payments?.chapa },
        cod: { ...DEFAULT_SETTINGS.payments.cod, ...parsed.payments?.cod },
      },
      rules: { ...DEFAULT_SETTINGS.rules, ...parsed.rules },
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...parsed.notifications,
        admin: { ...DEFAULT_SETTINGS.notifications.admin, ...parsed.notifications?.admin },
        customer: { ...DEFAULT_SETTINGS.notifications.customer, ...parsed.notifications?.customer },
      },
      security: { ...DEFAULT_SETTINGS.security, ...parsed.security },
    }
  } catch (error) {
    console.error('Unable to load admin settings from localStorage:', error)
    return DEFAULT_SETTINGS
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
}) {
  const { t } = useLanguage()

  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">{t(label)}</span>
      <div className="relative">
        <input
          type={type}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder ? t(placeholder) : undefined}
          min={min}
          max={max}
          step={step}
          autoComplete={autoComplete}
          className={`h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/10 ${suffix ? 'pr-14' : ''}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
            {suffix}
          </span>
        )}
      </div>
      {hint && <span className="mt-1 block text-[11px] leading-4 text-slate-400">{t(hint)}</span>}
    </label>
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

function Card({ title, description, children, className = '' }) {
  const { t } = useLanguage()

  return (
    <section className={`overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm divide-y divide-gray-100 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {(title || description) && (
          <div className="p-6 lg:col-span-4">
            {title && <h2 className="text-base font-bold text-[#0E532B]">{t(title)}</h2>}
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
  const [settings, setSettings] = useState(loadSettings)
  const [savedSettingsSnapshot, setSavedSettingsSnapshot] = useState(() => JSON.stringify(settings))
  const [activeTab, setActiveTab] = useState('store')
  const [toast, setToast] = useState(null)
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
  const hasUnsavedChanges = JSON.stringify(settings) !== savedSettingsSnapshot

  useEffect(() => {
    if (!toast) return undefined
    const timeoutId = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timeoutId)
  }, [toast])

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

  const persistSettings = (nextSettings, successMessage = t('settings.settingsSavedSuccessfully')) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSettings))
      setSettings(nextSettings)
      setSavedSettingsSnapshot(JSON.stringify(nextSettings))
      setToast({ type: 'success', message: successMessage })
    } catch (error) {
      console.error('Unable to save admin settings:', error)
      setToast({ type: 'error', message: t('settings.saveSettingsError') })
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
      return
    }
    if (!zoneFee.trim() || !Number.isFinite(fee) || fee < 0) {
      setZoneError(t('settings.enterValidDeliveryFee'))
      return
    }
    if (settings.delivery.zones.some((zone) => zone.name.toLowerCase() === name.toLowerCase())) {
      setZoneError(t('settings.zoneAlreadyExists'))
      return
    }
    updateSection('delivery', 'zones', [
      ...settings.delivery.zones,
      { id: `zone-${Date.now()}`, name, fee, active: true },
    ])
    setZoneName('')
    setZoneFee('')
    setZoneError('')
  }

  const submitPasswordChange = (event) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordNotice('')
    if (!passwordFields.current) {
      setPasswordError(t('settings.enterCurrentPassword'))
      return
    }
    if (passwordFields.next.length < 8) {
      setPasswordError(t('settings.passwordMinimumLength'))
      return
    }
    if (passwordFields.next !== passwordFields.confirm) {
      setPasswordError(t('settings.passwordsDoNotMatch'))
      return
    }
    setPasswordFields({ current: '', next: '', confirm: '' })
    setPasswordNotice(t('settings.passwordUpdateUnavailable'))
  }

  const renderStoreProfile = () => (
    <div className="w-full space-y-6">
      <Card title="Store profile" description="Customer-facing business details, support contacts, and warehouse location.">
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
              <select value={settings.storeProfile.currency} onChange={(event) => updateSection('storeProfile', 'currency', event.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1E8E3E]">
                <option value="ETB">{t('settings.ethiopianBirr')}</option>
              </select>
            </label>
          </div>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
            <img src={logo} alt={t('settings.storeLogoAlt')} className="h-24 w-36 object-contain" />
            <p className="mt-2 text-[11px] font-semibold text-slate-500">{t('settings.storeLogoPreview')}</p>
            <p className="mt-1 text-[10px] text-slate-400">{t('settings.managedByBrandAssets')}</p>
          </div>
        </div>
      </Card>

      <Card title="Store availability" description="Pause online ordering during planned maintenance or outside operating hours.">
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
            onChange={(value) => updateSection('storeProfile', 'isOpen', value)}
          />
        </div>
        {!settings.storeProfile.isOpen && (
          <div className="mb-4">
            <Field
              label="Maintenance Banner Message"
              value={settings.storeProfile.maintenanceMessage}
              onChange={(value) => updateSection('storeProfile', 'maintenanceMessage', value)}
            />
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
      <Card title="Delivery pricing & coverage" description="Set checkout delivery pricing and the farthest distance served from your warehouse.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Field label="Free Delivery Threshold" suffix="ETB" type="number" min="0" value={settings.delivery.freeThreshold} onChange={(value) => updateSection('delivery', 'freeThreshold', value)} />
          <Field label="Standard Delivery Fee" suffix="ETB" type="number" min="0" value={settings.delivery.standardFee} onChange={(value) => updateSection('delivery', 'standardFee', value)} />
          <Field label="Express Delivery Fee" suffix="ETB" type="number" min="0" value={settings.delivery.expressFee} onChange={(value) => updateSection('delivery', 'expressFee', value)} />
          <Field label="Minimum Order Amount" suffix="ETB" type="number" min="0" value={settings.delivery.minimumOrder} onChange={(value) => updateSection('delivery', 'minimumOrder', value)} />
          <Field label="Max Delivery Radius (km)" type="number" min="1" value={settings.delivery.maxRadius} onChange={(value) => updateSection('delivery', 'maxRadius', value)} />
        </div>
      </Card>

      <Card title="Addis Ababa delivery zones" description="Manage local delivery fees and temporarily pause service in a zone.">
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
                  className="h-9 w-full rounded-lg border border-slate-200 px-2.5 pr-9 text-sm outline-none focus:border-[#1E8E3E]"
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
            <input value={zoneName} onChange={(event) => setZoneName(event.target.value)} placeholder={t('settings.newZoneName')} aria-label={t('settings.newZoneName')} className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#1E8E3E]" />
            <input type="number" min="0" value={zoneFee} onChange={(event) => setZoneFee(event.target.value)} placeholder={t('settings.feeEtb')} aria-label={t('settings.newZoneDeliveryFee')} className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#1E8E3E]" />
            <button type="submit" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#1E8E3E] px-4 text-xs font-semibold text-white hover:bg-[#0E532B]"><Plus size={14} /> {t('Add Zone')}</button>
          </div>
          {zoneError && <p role="alert" className="mt-2 text-xs text-[#F04E00]">{zoneError}</p>}
        </form>
      </Card>

      <Card title="Available delivery time slots" description="Customers can choose from active delivery windows at checkout.">
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
    const gatewayCard = (title, gateway, fields) => (
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
      </section>
    )
    return (
      <div className="w-full space-y-6">
        <Card title="Payment gateways" description="Enable the payment options customers can use to complete grocery orders.">
          <div className="grid gap-4 md:grid-cols-2">
            {gatewayCard('Telebirr', 'telebirr', (
              <Field label="Shortcode / App ID" value={settings.payments.telebirr.credential} onChange={(value) => updateNested('payments', 'telebirr', 'credential', value)} placeholder="Enter Telebirr shortcode" />
            ))}
            {gatewayCard('CBE Birr', 'cbeBirr', (
              <Field label="Merchant Account" value={settings.payments.cbeBirr.credential} onChange={(value) => updateNested('payments', 'cbeBirr', 'credential', value)} placeholder="Enter merchant account" />
            ))}
            {gatewayCard('Chapa Card / Bank', 'chapa', (
              <>
                <Field label="Public Key" value={settings.payments.chapa.publicKey} onChange={(value) => updateNested('payments', 'chapa', 'publicKey', value)} placeholder="pk_test_..." />
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">{t('Gateway mode')}</span>
                  <select value={settings.payments.chapa.mode} onChange={(event) => updateNested('payments', 'chapa', 'mode', event.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#1E8E3E]">
                    <option>{t('Test')}</option><option>{t('Live')}</option>
                  </select>
                  <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${settings.payments.chapa.mode === 'Live' ? 'bg-emerald-50 text-[#1E8E3E]' : 'bg-orange-50 text-[#F04E00]'}`}>
                    {t(`settings.${settings.payments.chapa.mode}`)} {t('settings.mode')}
                  </span>
                </label>
              </>
            ))}
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
      </div>
    )
  }

  const renderSecurity = () => (
    <div className="w-full space-y-6">
      <Card title="Change admin password" description="Use a strong, unique password. Password updates require a secure server-side account service.">
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
              <KeyRound size={15} /> {t('settings.validatePasswordChange')}
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
      {toast && (
        <div
          role="status"
          className={`fixed right-5 top-20 z-50 flex max-w-sm items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${toast.type === 'success' ? 'bg-[#1E8E3E]' : 'bg-[#F04E00]'}`}
        >
          {toast.type === 'success' ? <Check size={17} /> : <AlertCircle size={17} />}
          {toast.message}
        </div>
      )}
      <header className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0E532B]">{t('settings')}</h1>
          <p className="mt-1.5 text-sm leading-6 text-gray-500">
            Manage store profile, delivery pricing, payment gateways, notifications, and security.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
          {hasUnsavedChanges && (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#F04E00]">
              <span className="h-2 w-2 rounded-full bg-[#F04E00]" />
              Unsaved changes
            </span>
          )}
          <button
            type="button"
            onClick={resetDefaults}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-[#F04E00]"
          >
            <RotateCcw size={15} /> {t('Reset Defaults')}
          </button>
          <button
            type="button"
            onClick={() => persistSettings(settings)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0E532B]"
          >
            <Check size={16} /> {t('Save Changes')}
          </button>
        </div>
      </header>

      <nav
        role="tablist"
        aria-label={t('settings.settingsNavigation')}
        className="mb-6 flex w-full items-center gap-6 overflow-x-auto border-b border-gray-200"
      >
        {settingTabs.map(({ id, translationKey, icon: Icon }) => (
          <button
            type="button"
            key={id}
            onClick={() => setActiveTab(id)}
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
