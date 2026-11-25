import { ArrowRight, HandCoins, Leaf, Mail, MapPin, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'

const values = [
  {
    icon: Leaf,
    title: 'Farm-to-Door Freshness',
    description:
      'We hand-pick fresh produce and everyday groceries so quality reaches your kitchen.',
  },
  {
    icon: Truck,
    title: '30-Min Express Delivery',
    description:
      'Our local delivery teams bring your essentials to homes across Addis Ababa.',
  },
  {
    icon: HandCoins,
    title: 'Fair Local Market Prices',
    description:
      'Clear prices and thoughtful weekly offers help make good food accessible.',
  },
]

const stats = [
  { value: '5,000+', label: 'Happy Families' },
  { value: '8+', label: 'Addis Ababa Zones' },
  { value: '99.2%', label: 'On-Time' },
]

function AboutUs() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F3FAF6] via-white to-[#FFF4EC] p-7 sm:p-12">
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#1E8E3E]/10 blur-3xl"
        />
        <div className="relative max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#0B4B8C]/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0B4B8C]">
            <MapPin aria-hidden="true" size={14} />
            Addis Ababa, Ethiopia
          </p>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-[#0E532B] sm:text-5xl">
            GROCERY DELIVERY SYSTEM
          </h1>
          <p className="mt-3 text-lg font-bold text-[#F04E00] sm:text-xl">
            Speed <span className="text-[#0B4B8C]">•</span> Fresh{' '}
            <span className="text-[#0B4B8C]">•</span> Direct
          </p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
            We make it easier for Addis Ababa families to enjoy fresh food and
            everyday essentials. By bringing local market care together with
            convenient delivery, we help good groceries get from our shelves to
            your door.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-6 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-[#F04E00]">
            What guides us
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-[#0E532B] sm:text-3xl">
            Fresh service, rooted in our community
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {values.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E8E3E]/10 text-[#1E8E3E]">
                <Icon aria-hidden="true" size={23} />
              </span>
              <h3 className="mt-5 text-lg font-bold text-[#0E532B]">{title}</h3>
              <p className="mt-2 leading-6 text-gray-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-[#0E532B] p-6 text-white sm:p-9">
        <div className="grid gap-6 sm:grid-cols-3">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-extrabold text-white sm:text-4xl">{value}</p>
              <p className="mt-2 text-sm font-medium text-emerald-100">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-orange-100 bg-[#FFF4EC] p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-[#F04E00]">
            Your next fresh basket
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-[#0E532B]">
            Good food is just around the corner.
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1E8E3E] px-5 py-3 font-bold text-white transition hover:bg-[#0E532B]"
          >
            Start Shopping <ArrowRight aria-hidden="true" size={17} />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-[#F04E00] px-5 py-3 font-bold text-[#F04E00] transition hover:bg-[#F04E00] hover:text-white"
          >
            <Mail aria-hidden="true" size={17} />
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  )
}

export default AboutUs
