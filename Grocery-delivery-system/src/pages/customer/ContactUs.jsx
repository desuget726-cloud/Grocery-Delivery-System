import { Clock3, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useState } from 'react'

const STORAGE_KEY = 'grocery_support_tickets'

const initialForm = {
  fullName: '',
  email: '',
  phone: '+251 ',
  orderId: '',
  topic: '',
  message: '',
}

const contactDetails = [
  {
    icon: MapPin,
    title: 'Visit us',
    value: 'Bole Road, Addis Ababa, Ethiopia',
  },
  {
    icon: Phone,
    title: 'Call our team',
    value: '+251 962714305',
    href: 'tel:+251962714305',
  },
  {
    icon: Mail,
    title: 'Email support',
    value: 'desuget726@gmail.com',
    href: 'mailto:desuget726@gmail.com',
  },
  {
    icon: Clock3,
    title: 'Operating hours',
    value: '7:00 AM – 10:00 PM Daily',
  },
]

const faqs = [
  {
    question: 'Where do you deliver?',
    answer:
      'We currently deliver across 8+ zones in Addis Ababa. Enter your address at checkout to confirm service in your area.',
  },
  {
    question: 'How can I check my order status?',
    answer:
      'Sign in and open My Orders to follow your order from confirmation through delivery.',
  },
  {
    question: 'Can I change an order after placing it?',
    answer:
      'Contact our support team as soon as possible with your order ID. We will help if the order has not yet been prepared.',
  },
]

function ContactUs() {
  const [form, setForm] = useState(initialForm)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const normalizedPhone = form.phone.replace(/[\s-]/g, '')
    const normalizedOrderId = form.orderId.trim()
    if (form.fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setErrorMessage('Please enter a valid email address.')
      return
    }
    if (!/^\+251\d{9}$/.test(normalizedPhone)) {
      setErrorMessage('Enter a valid Ethiopian phone number, such as +251 962714305.')
      return
    }
    if (normalizedOrderId && !/^GDS-[A-Z0-9-]+$/i.test(normalizedOrderId)) {
      setErrorMessage('Order IDs should use the format GDS-12345.')
      return
    }
    if (!form.topic) {
      setErrorMessage('Please choose a support topic.')
      return
    }
    if (form.message.trim().length < 10) {
      setErrorMessage('Please include a little more detail in your message.')
      return
    }

    const ticket = {
      id: `GDS-${Date.now()}`,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: normalizedPhone,
      orderId: normalizedOrderId,
      topic: form.topic,
      message: form.message.trim(),
      submittedAt: new Date().toISOString(),
    }

    try {
      const savedTickets = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')
      if (!Array.isArray(savedTickets)) {
        throw new TypeError('Saved support tickets must be an array')
      }

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([ticket, ...savedTickets]),
      )
      setForm(initialForm)
      setSuccessMessage(
        `Thanks, ${ticket.fullName}. Your support request ${ticket.id} has been saved.`,
      )
    } catch (error) {
      console.error('Unable to save the support ticket:', error)
      setErrorMessage(
        'We could not save your request. Please try again or contact us by phone or email.',
      )
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-bold uppercase tracking-wider text-[#F04E00]">
          We are here to help
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-[#0E532B] sm:text-4xl">
          Contact &amp; Support
        </h1>
        <p className="mt-3 max-w-2xl text-gray-600">
          Talk to our Addis Ababa team about deliveries, orders, or anything
          else we can help with.
        </p>
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-7">
          <section>
            <h2 className="mb-4 text-xl font-bold text-[#0E532B]">
              Get in touch
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {contactDetails.map(({ icon: Icon, title, value, href }) => {
                const content = (
                  <>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1E8E3E]/10 text-[#1E8E3E]">
                      <Icon aria-hidden="true" size={20} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {title}
                      </span>
                      <span className="mt-1 block break-words text-sm font-semibold text-[#0E532B]">
                        {value}
                      </span>
                    </span>
                  </>
                )

                return href ? (
                  <a
                    key={title}
                    href={href}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-200 hover:shadow-sm"
                  >
                    {content}
                  </a>
                ) : (
                  <div
                    key={title}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    {content}
                  </div>
                )
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-bold text-[#0E532B]">
              Quick answers
            </h2>
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white px-4">
              {faqs.map(({ question, answer }) => (
                <details key={question} className="group py-4">
                  <summary className="cursor-pointer list-none pr-6 font-semibold text-[#0E532B] marker:hidden">
                    {question}
                    <span
                      aria-hidden="true"
                      className="float-right text-[#F04E00] transition group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-6 text-gray-600">{answer}</p>
                </details>
              ))}
            </div>
          </section>
        </aside>

        <section className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold text-[#0B4B8C]">Customer care</p>
            <h2 className="mt-1 text-2xl font-bold text-[#0E532B]">
              Send us a message
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Our team will follow up using the contact details you provide.
            </p>
          </div>

          {successMessage && (
            <p
              role="status"
              className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
            >
              {successMessage}
            </p>
          )}
          {errorMessage && (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800"
            >
              {errorMessage}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-gray-700">
                Full Name
                <input
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.fullName}
                  onChange={handleChange}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15"
                />
              </label>
              <label className="block text-sm font-semibold text-gray-700">
                Email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-gray-700">
                +251 Phone
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+251 962714305"
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15"
                />
              </label>
              <label className="block text-sm font-semibold text-gray-700">
                Order ID <span className="font-normal text-gray-400">(optional)</span>
                <input
                  name="orderId"
                  type="text"
                  value={form.orderId}
                  onChange={handleChange}
                  placeholder="GDS-12345"
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15"
                />
              </label>
            </div>

            <label className="block text-sm font-semibold text-gray-700">
              Topic
              <select
                name="topic"
                required
                value={form.topic}
                onChange={handleChange}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none transition focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15"
              >
                <option value="">Select a topic</option>
                <option value="Order status">Order status</option>
                <option value="Delivery">Delivery</option>
                <option value="Product quality">Product quality</option>
                <option value="Payment">Payment</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="block text-sm font-semibold text-gray-700">
              Message
              <textarea
                name="message"
                required
                rows="5"
                value={form.message}
                onChange={handleChange}
                placeholder="How can we help?"
                className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-[#1E8E3E] focus:ring-2 focus:ring-[#1E8E3E]/15"
              />
            </label>

            <button
              type="submit"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1E8E3E] px-5 py-3 font-bold text-white transition hover:bg-[#0E532B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E8E3E]"
            >
              <Send aria-hidden="true" size={17} />
              Send Support Request
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default ContactUs
