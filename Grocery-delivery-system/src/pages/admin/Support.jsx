import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Headphones,
  LifeBuoy,
  Mail,
  MessageCircle,
  PackageCheck,
  Phone,
  Search,
  Send,
  ShieldCheck,
  Signal,
  TicketPercent,
  Truck,
  Wallet,
  X,
} from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext.jsx'

const initialTickets = [
  {
    id: 'TKT-104',
    customer: 'Abebe Kebede',
    phone: '+251 911 234 567',
    orderId: 'GDS-2531',
    subject: 'Missing 1kg Avocados in delivery',
    status: 'Open',
    updated: '8 mins ago',
    messages: [
      {
        author: 'Abebe Kebede',
        time: 'Today, 10:24 AM',
        text: 'Hello, my order arrived but the 1kg avocados are missing from the bag. Could you please check?',
      },
      {
        author: 'Admin',
        time: 'Today, 10:32 AM',
        text: 'Hi Abebe, I’m sorry about the missing item. I’m checking with the packing team now.',
      },
    ],
  },
  {
    id: 'TKT-103',
    customer: 'Selam Tesfaye',
    phone: '+251 912 345 678',
    orderId: 'GDS-2532',
    subject: 'Telebirr charged twice',
    status: 'In Progress',
    updated: '22 mins ago',
    messages: [
      {
        author: 'Selam Tesfaye',
        time: 'Today, 10:02 AM',
        text: 'I paid with Telebirr and received two debit notifications for the same order.',
      },
      {
        author: 'Admin',
        time: 'Today, 10:08 AM',
        text: 'Thanks for letting us know, Selam. We have asked our payments team to verify both transactions.',
      },
    ],
  },
  {
    id: 'TKT-102',
    customer: 'Yared Lemma',
    phone: '+251 913 456 789',
    orderId: 'GDS-2528',
    subject: 'Late delivery by 30 mins',
    status: 'Resolved',
    updated: 'Yesterday',
    messages: [
      {
        author: 'Yared Lemma',
        time: 'Yesterday, 4:18 PM',
        text: 'My groceries arrived about 30 minutes after the delivery window.',
      },
      {
        author: 'Admin',
        time: 'Yesterday, 4:35 PM',
        text: 'Apologies for the delay, Yared. We have shared your feedback with the rider team and added a delivery credit to your account.',
      },
    ],
  },
]

const ticketFilters = ['All', 'Open', 'In Progress', 'Resolved']
const tabs = ['Customer Tickets', 'Admin Guides & FAQs', 'System & Contact']
const tabTranslationKeys = {
  'Customer Tickets': 'storeTickets',
  'Admin Guides & FAQs': 'supportGuidesFaqs',
  'System & Contact': 'systemContact',
}

const guides = [
  {
    titleKey: 'common.guideOrderDispatch',
    descriptionKey: 'common.guideOrderDispatchDescription',
    icon: Truck,
    tone: 'bg-blue-50 text-[#0B4B8C]',
    durationMinutes: 5,
  },
  {
    titleKey: 'common.guideInventoryExpiry',
    descriptionKey: 'common.guideInventoryExpiryDescription',
    icon: PackageCheck,
    tone: 'bg-emerald-50 text-[#1E8E3E]',
    durationMinutes: 4,
  },
  {
    titleKey: 'common.guideTelebirrCod',
    descriptionKey: 'common.guideTelebirrCodDescription',
    icon: Wallet,
    tone: 'bg-orange-50 text-[#F04E00]',
    durationMinutes: 6,
  },
  {
    titleKey: 'common.guideCouponsSettings',
    descriptionKey: 'common.guideCouponsSettingsDescription',
    icon: TicketPercent,
    tone: 'bg-blue-50 text-[#0B4B8C]',
    durationMinutes: 3,
  },
]

const faqs = [
  {
    questionKey: 'common.faqAssignOrder',
    answerKey: 'common.faqAssignOrderAnswer',
  },
  {
    questionKey: 'common.faqSettleCod',
    answerKey: 'common.faqSettleCodAnswer',
  },
  {
    questionKey: 'common.faqFreeDelivery',
    answerKey: 'common.faqFreeDeliveryAnswer',
  },
]

const systemServices = [
  { nameKey: 'common.storefrontApi', detailKey: 'common.customerAppAndCatalog', status: 'Operational' },
  { nameKey: 'common.telebirrGateway', detailKey: 'common.mobileMoneyPayments', status: 'Connected' },
  { nameKey: 'common.cbeBirr', detailKey: 'common.bankPaymentProcessing', status: 'Connected' },
  { nameKey: 'common.riderFleetSync', detailKey: 'common.dispatchAndRiderUpdates', status: 'Active' },
]

function initials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function Support() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [search, setSearch] = useState('')
  const [ticketFilter, setTicketFilter] = useState('All')
  const [selectedTicketId, setSelectedTicketId] = useState(initialTickets[0].id)
  const [tickets, setTickets] = useState(initialTickets)
  const [reply, setReply] = useState('')
  const [openFaq, setOpenFaq] = useState(null)
  const [toast, setToast] = useState('')
  const [formSubmitted, setFormSubmitted] = useState(false)

  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(() => setToast(''), 3200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const normalizedSearch = search.trim().toLowerCase()
  const filteredTickets = useMemo(
    () =>
      tickets.filter((ticket) => {
        const matchesFilter = ticketFilter === 'All' || ticket.status === ticketFilter
        const matchesSearch =
          !normalizedSearch ||
          `${ticket.id} ${ticket.customer} ${ticket.orderId} ${ticket.subject}`
            .toLowerCase()
            .includes(normalizedSearch)
        return matchesFilter && matchesSearch
      }),
    [normalizedSearch, ticketFilter, tickets],
  )
  const selectedTicket =
    filteredTickets.find((ticket) => ticket.id === selectedTicketId) ?? filteredTickets[0]
  const visibleGuides = guides.filter((guide) =>
    `${t(guide.titleKey)} ${t(guide.descriptionKey)}`.toLowerCase().includes(normalizedSearch),
  )
  const visibleFaqs = faqs.filter((faq) =>
    `${t(faq.questionKey)} ${t(faq.answerKey)}`.toLowerCase().includes(normalizedSearch),
  )
  const openTicketCount = tickets.filter((ticket) => ticket.status !== 'Resolved').length

  const updateTicket = (ticketId, updates) => {
    setTickets((current) =>
      current.map((ticket) => (ticket.id === ticketId ? { ...ticket, ...updates } : ticket)),
    )
  }

  const addAdminMessage = (text) => {
    if (!selectedTicket || !text.trim()) return
    const message = {
      author: 'Admin',
      time: `Today, ${new Date().toLocaleTimeString('en-ET', {
        hour: 'numeric',
        minute: '2-digit',
      })}`,
      text: text.trim(),
    }
    updateTicket(selectedTicket.id, {
      messages: [...selectedTicket.messages, message],
      updated: 'Just now',
    })
  }

  const handleReply = (event) => {
    event.preventDefault()
    if (!reply.trim()) return
    addAdminMessage(reply)
    setReply('')
  }

  const handleResolve = () => {
    if (!selectedTicket) return
    updateTicket(selectedTicket.id, { status: 'Resolved', updated: 'Just now' })
    setToast(`${selectedTicket.id} ${t('common.markedAsResolved')}`)
  }

  const handleCoupon = () => {
    if (!selectedTicket) return
    addAdminMessage('I’ve added a 10% apology coupon to your account. We appreciate your patience.')
    setToast(t('common.apologyCouponSent'))
  }

  const handleSupportRequest = (event) => {
    event.preventDefault()
    setFormSubmitted(true)
    event.currentTarget.reset()
    setToast(t('common.supportRequestSubmitted'))
  }

  return (
    <div className="mx-auto max-w-[1440px] pb-8">
      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 text-gray-700 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold">
            <LifeBuoy aria-hidden="true" size={14} className="text-[#0E532B]" />
            <span className="text-[#0E532B]">GROCERY</span>{' '}
            <span className="text-[#F04E00]">DELIVERY</span>{' '}
            <span className="text-[#0B4B8C]">SYSTEM</span>{' '}
            <span className="text-[#0E532B]">SUPPORT</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0E532B] sm:text-3xl">
            {t('helpCenterSupport')}
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-600 sm:text-base">
            {t('common.supportDescription')}
          </p>
        </div>
        <label className="mt-6 flex h-12 max-w-2xl items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 text-slate-400 shadow-sm focus-within:ring-4 focus-within:ring-[#0E532B]/10">
          <Search aria-hidden="true" size={19} className="shrink-0" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('common.supportSearchPlaceholder')}
            aria-label={t('common.supportSearchPlaceholder')}
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label={t('common.clearSearch')}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X aria-hidden="true" size={16} />
            </button>
          )}
        </label>
      </section>

      <section aria-label={t('common.supportOverview')} className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-500">{t('common.openTickets')}</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-[#F04E00]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F04E00]" />
              {t('needsAttention')}
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-[#0E532B]">{openTicketCount}</p>
          <p className="mt-1 text-xs text-slate-500">{t('common.customerCasesAwaitingClosure')}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-medium text-slate-500">{t('common.avgResponseTime')}</p>
          <p className="mt-3 text-2xl font-bold text-[#0E532B]">14 {t('common.minutes')}</p>
          <p className="mt-1 text-xs text-slate-500">{t('common.acrossActiveSupportTickets')}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-500">{t('common.resolvedThisWeek')}</p>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-[#1E8E3E]">
              +12%
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-[#0E532B]">28</p>
          <p className="mt-1 text-xs text-slate-500">{t('common.greatWorkKeepingShoppersHappy')}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <p className="text-sm font-medium text-slate-500">{t('common.systemStatus')}</p>
          <p className="mt-3 flex items-center gap-2 text-xl font-bold text-[#0E532B]">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-[#1E8E3E]" />
            </span>
            99.9% {t('operational')}
          </p>
          <p className="mt-1 text-xs text-slate-500">{t('common.allServicesRunningNormally')}</p>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto border-b border-slate-200 px-4 sm:px-6">
          <div className="flex min-w-max gap-6" role="tablist" aria-label={t('common.helpCenterSections')}>
            {tabs.map((tab) => (
              <button
                key={tab}
                id={`support-tab-${tabs.indexOf(tab)}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`support-panel-${tabs.indexOf(tab)}`}
                onClick={() => setActiveTab(tab)}
                className={`relative py-4 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? 'text-[#0E532B] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-[#1E8E3E]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t(tabTranslationKeys[tab])}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'Customer Tickets' && (
          <div
            id="support-panel-0"
            role="tabpanel"
            aria-labelledby="support-tab-0"
            className="grid min-h-[570px] lg:grid-cols-[minmax(290px,0.82fr)_minmax(0,1.65fr)]"
          >
            <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r">
              <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-[#0E532B]">{t('storeTickets')}</h2>
                    <p className="mt-0.5 text-xs text-slate-500">{filteredTickets.length} {t('common.matchingCases')}</p>
                  </div>
                  <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-semibold text-[#F04E00]">
                    {openTicketCount} {t('common.open')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2" aria-label={t('common.filterTickets')}>
                  {ticketFilters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      aria-pressed={ticketFilter === filter}
                      onClick={() => setTicketFilter(filter)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        ticketFilter === filter
                          ? 'bg-[#1E8E3E] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t(filter)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="max-h-[520px] overflow-y-auto p-2">
                {filteredTickets.length ? (
                  filteredTickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => setSelectedTicketId(ticket.id)}
                      aria-pressed={selectedTicket?.id === ticket.id}
                      className={`mb-1 w-full rounded-xl border p-3.5 text-left transition ${
                        selectedTicket?.id === ticket.id
                          ? 'border-emerald-200 bg-emerald-50/70'
                          : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-bold tracking-wide text-slate-500">
                            <span className="text-[#0B4B8C]">{ticket.id}</span> <span className="px-1 text-slate-300">•</span> {ticket.customer}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-[#0B4B8C]">{ticket.orderId}</p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                            ticket.status === 'Open'
                              ? 'bg-orange-50 text-[#F04E00]'
                              : ticket.status === 'In Progress'
                                ? 'bg-blue-50 text-[#0B4B8C]'
                                : 'bg-emerald-50 text-[#1E8E3E]'
                          }`}
                        >
                          {t(ticket.status)}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm font-medium leading-5 text-slate-800">
                        “{ticket.subject}”
                      </p>
                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle aria-hidden="true" size={13} />
                          {ticket.messages.length} {t('common.messages')}
                        </span>
                        <span>{ticket.updated}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-12 text-center">
                    <Search aria-hidden="true" size={24} className="mx-auto text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-700">{t('common.noTicketsFound')}</p>
                    <p className="mt-1 text-xs text-slate-500">{t('common.tryAnotherSearchStatusFilter')}</p>
                  </div>
                )}
              </div>
            </aside>

            {selectedTicket ? (
              <div className="flex min-h-[570px] min-w-0 flex-col">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[#0B4B8C]">{selectedTicket.id}</span>
                      <span className="text-slate-300">•</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          selectedTicket.status === 'Open'
                            ? 'bg-orange-50 text-[#F04E00]'
                            : selectedTicket.status === 'In Progress'
                              ? 'bg-blue-50 text-[#0B4B8C]'
                              : 'bg-emerald-50 text-[#1E8E3E]'
                        }`}
                      >
                        {t(selectedTicket.status)}
                      </span>
                    </div>
                    <h2 className="mt-2 text-base font-bold text-[#0E532B]">{selectedTicket.subject}</h2>
                  </div>
                  <a
                    href="/admin/orders?status=all"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#0B4B8C]/30 px-3 py-2 text-xs font-semibold text-[#0B4B8C] transition hover:bg-[#0B4B8C] hover:text-white"
                  >
                    {selectedTicket.orderId}
                    <ArrowUpRight aria-hidden="true" size={14} />
                  </a>
                </div>

                <div className="grid gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-4 sm:grid-cols-2 sm:px-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-[#0E532B]">
                      {initials(selectedTicket.customer)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{selectedTicket.customer}</p>
                      <a href={`tel:${selectedTicket.phone.replace(/\s/g, '')}`} className="mt-0.5 block text-xs text-slate-500 hover:text-[#0B4B8C]">
                        {selectedTicket.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#0B4B8C] shadow-sm">
                      <PackageCheck aria-hidden="true" size={17} />
                    </span>
                    <div>
                      <p className="text-[11px] font-medium text-slate-400">{t('common.linkedOrder')}</p>
                      <p className="text-sm font-semibold text-[#0B4B8C]">{selectedTicket.orderId}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto bg-[#FAFBFC] px-4 py-5 sm:px-6">
                  {selectedTicket.messages.map((message, index) => {
                    const isAdmin = message.author === 'Admin'
                    return (
                      <div key={`${selectedTicket.id}-${index}`} className={`flex gap-2.5 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            isAdmin ? 'bg-[#0E532B] text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                          aria-hidden="true"
                        >
                          {isAdmin ? 'AD' : initials(selectedTicket.customer)}
                        </span>
                        <div className={`max-w-[85%] ${isAdmin ? 'text-right' : ''}`}>
                          <div className={`mb-1 flex items-center gap-2 text-[11px] text-slate-400 ${isAdmin ? 'justify-end' : ''}`}>
                            <span className="font-semibold text-slate-600">{message.author}</span>
                            <span>{message.time}</span>
                          </div>
                          <p
                            className={`rounded-2xl px-3.5 py-2.5 text-left text-sm leading-5 ${
                              isAdmin
                                ? 'rounded-tr-sm bg-[#0E532B] text-white'
                                : 'rounded-tl-sm border border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            {message.text}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-slate-100 p-4 sm:px-6">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleCoupon}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-[#F04E00] transition hover:bg-orange-100"
                    >
                      <TicketPercent aria-hidden="true" size={15} />
                      {t('common.sendApologyCoupon')}
                    </button>
                    <button
                      type="button"
                      onClick={handleResolve}
                      disabled={selectedTicket.status === 'Resolved'}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#0B4B8C]/30 px-3 py-2 text-xs font-semibold text-[#0B4B8C] transition hover:bg-[#0B4B8C] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Check aria-hidden="true" size={15} />
                      {selectedTicket.status === 'Resolved'
                        ? t('Resolved')
                        : t('markAsResolved')}
                    </button>
                  </div>
                  <form onSubmit={handleReply} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pl-3 focus-within:border-[#1E8E3E] focus-within:ring-2 focus-within:ring-[#1E8E3E]/10">
                    <input
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      placeholder={t('common.replyToCustomer')}
                      aria-label={t('common.replyToCustomer')}
                      className="min-w-0 flex-1 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={!reply.trim()}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1E8E3E] text-white transition hover:bg-[#0E532B] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={t('common.sendReply')}
                    >
                      <Send aria-hidden="true" size={16} />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="grid min-h-[400px] place-content-center px-6 text-center">
                <MessageCircle aria-hidden="true" size={30} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-700">{t('common.chooseTicketConversation')}</p>
                <p className="mt-1 text-xs text-slate-500">{t('common.adjustFiltersSearchCase')}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Admin Guides & FAQs' && (
          <div
            id="support-panel-1"
            role="tabpanel"
            aria-labelledby="support-tab-1"
            className="p-4 sm:p-6"
          >
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#1E8E3E]">
                <BookOpen aria-hidden="true" size={20} />
              </span>
              <div>
                <h2 className="font-bold text-[#0E532B]">{t('quickStartGuides')}</h2>
                <p className="mt-1 text-sm text-slate-500">{t('common.practicalStoreOperationsHelp')}</p>
              </div>
            </div>
            {visibleGuides.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {visibleGuides.map(({ titleKey, descriptionKey, icon: Icon, tone, durationMinutes }) => (
                  <article key={titleKey} className="group rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
                      <Icon aria-hidden="true" size={21} />
                    </span>
                    <h3 className="mt-4 font-bold text-[#0E532B]">{t(titleKey)}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-5 text-slate-500">{t(descriptionKey)}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="text-xs text-slate-400">{durationMinutes} {t('common.minutes')} {t('common.read')}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E8E3E]">
                        {t('common.quickGuide')} <ArrowUpRight aria-hidden="true" size={13} />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500">{t('common.noGuidesMatchSearch')} “{search}”.</p>
            )}

            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <CircleHelp aria-hidden="true" size={19} className="text-[#0B4B8C]" />
                  <h2 className="font-bold text-[#0E532B]">{t('frequentlyAskedQuestions')}</h2>
                </div>
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
                  {visibleFaqs.map(({ questionKey, answerKey }) => {
                    const isOpen = openFaq === questionKey
                    return (
                      <div key={questionKey} className="px-4 sm:px-5">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() => setOpenFaq(isOpen ? null : questionKey)}
                          className="flex w-full items-center justify-between gap-4 py-4 text-left"
                        >
                          <span className="text-sm font-semibold text-slate-800">{t(questionKey)}</span>
                          <ChevronDown
                            aria-hidden="true"
                            size={18}
                            className={`shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {isOpen && <p className="max-w-3xl pb-4 pr-8 text-sm leading-6 text-slate-600">{t(answerKey)}</p>}
                      </div>
                    )
                  })}
                  {!visibleFaqs.length && <p className="p-5 text-sm text-slate-500">{t('common.noFaqsMatchSearch')} “{search}”.</p>}
                </div>
              </div>
              <aside className="flex flex-col justify-between gap-4 rounded-2xl bg-[#F0F7F1] p-5">
                <div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0E532B] shadow-sm">
                    <Headphones aria-hidden="true" size={20} />
                  </span>
                  <h3 className="mt-4 font-bold text-[#0E532B]">{t('common.needAHand')}</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{t('common.supportCanHelp')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('System & Contact')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0E532B]"
                >
                  {t('common.contactSupport')} <ArrowUpRight aria-hidden="true" size={16} />
                </button>
              </aside>
            </div>
          </div>
        )}

        {activeTab === 'System & Contact' && (
          <div
            id="support-panel-2"
            role="tabpanel"
            aria-labelledby="support-tab-2"
            className="grid gap-8 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]"
          >
            <section>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#1E8E3E]">
                    <Signal aria-hidden="true" size={20} />
                  </span>
                  <div>
                    <h2 className="font-bold text-[#0E532B]">{t('systemHealth')}</h2>
                    <p className="mt-1 text-sm text-slate-500">{t('common.liveServiceStatus')}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-[#1E8E3E]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#1E8E3E]" />
                  {t('common.live')}
                </span>
              </div>
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
                {systemServices.map((service) => (
                  <div key={service.name} className="flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-[#1E8E3E]">
                        <CheckCircle2 aria-hidden="true" size={18} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{t(service.nameKey)}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{t(service.detailKey)}</p>
                      </div>
                    </div>
                    <span className="whitespace-nowrap text-xs font-semibold text-[#1E8E3E]">{t(service.status)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-sm text-[#0B4B8C]">
                <ShieldCheck aria-hidden="true" size={18} className="mt-0.5 shrink-0" />
                <p>{t('common.integrationsHealthy')}</p>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#F04E00]">
                  <LifeBuoy aria-hidden="true" size={20} />
                </span>
                <div>
                  <h2 className="font-bold text-[#0E532B]">{t('common.contactTechnicalSupport')}</h2>
                  <p className="mt-1 text-sm text-slate-500">{t('common.reportSystemIssue')}</p>
                </div>
              </div>
              <form onSubmit={handleSupportRequest} onChange={() => setFormSubmitted(false)} className="space-y-4 rounded-2xl border border-slate-200 p-4 sm:p-5">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">{t('common.subject')}</span>
                  <input
                    name="subject"
                    required
                    placeholder={t('common.paymentReconciliationIssue')}
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/10"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">{t('common.priority')}</span>
                  <select
                    name="priority"
                    defaultValue="Normal"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/10"
                  >
                    <option>{t('Low')}</option>
                    <option>{t('Normal')}</option>
                    <option>{t('High')}</option>
                    <option>{t('Urgent')}</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">{t('common.description')}</span>
                  <textarea
                    name="description"
                    required
                    rows="4"
                    placeholder={t('common.supportDescriptionPlaceholder')}
                    className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/10"
                  />
                </label>
                <button
                  type="submit"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-4 text-sm font-semibold text-white transition hover:bg-[#0E532B]"
                >
                  {formSubmitted ? <Check aria-hidden="true" size={17} /> : <Send aria-hidden="true" size={16} />}
                  {t(formSubmitted ? 'common.requestSubmitted' : 'common.submitSupportRequest')}
                </button>
              </form>
            </section>

            <section className="rounded-2xl bg-slate-50 p-4 sm:p-5 lg:col-span-2">
              <div className="mb-4">
                <h2 className="font-bold text-[#0E532B]">{t('common.directHelpline')}</h2>
                <p className="mt-1 text-sm text-slate-500">{t('common.urgentServiceDisruptions')}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href="tel:+251912345678"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-200 hover:shadow-sm"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#1E8E3E]">
                    <Phone aria-hidden="true" size={19} />
                  </span>
                  <span>
                    <span className="block text-xs text-slate-500">{t('common.callHelpline')}</span>
                    <span className="mt-0.5 block text-sm font-semibold text-slate-800">+251 912 345 678</span>
                  </span>
                  <Clock3 aria-hidden="true" size={16} className="ml-auto text-slate-400" />
                </a>
                <a
                  href="mailto:support@grocerydelivery.et"
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0B4B8C]">
                    <Mail aria-hidden="true" size={19} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-slate-500">{t('common.emailSupport')}</span>
                    <span className="mt-0.5 block truncate text-sm font-semibold text-slate-800">support@grocerydelivery.et</span>
                  </span>
                  <ArrowUpRight aria-hidden="true" size={16} className="ml-auto shrink-0 text-slate-400" />
                </a>
              </div>
            </section>
          </div>
        )}
      </section>

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl"
        >
          <CheckCircle2 aria-hidden="true" size={18} className="shrink-0 text-emerald-400" />
          {toast}
        </div>
      )}
    </div>
  )
}

export default Support
