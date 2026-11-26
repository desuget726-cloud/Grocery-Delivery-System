import { ArrowRight, HandCoins, Leaf, Mail, MapPin, Truck, UsersRound, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

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
  {
    value: '5,000+',
    label: 'Happy Families',
    icon: UsersRound,
    iconClassName: 'bg-[#0E532B]/10 text-[#0E532B]',
    valueClassName: 'text-[#0E532B]',
  },
  {
    value: '8+',
    label: 'Addis Ababa Zones',
    icon: MapPin,
    iconClassName: 'bg-[#F04E00]/10 text-[#F04E00]',
    valueClassName: 'text-[#F04E00]',
  },
  {
    value: '99.2%',
    label: 'On-Time Delivery',
    icon: Truck,
    iconClassName: 'bg-[#0B4B8C]/10 text-[#0B4B8C]',
    valueClassName: 'text-[#0B4B8C]',
  },
]

function AboutUs() {
  const [heroImageFailed, setHeroImageFailed] = useState(false)

  return (
    <div className="space-y-12">
      <section className="relative grid grid-cols-1 items-center gap-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#F3FAF6] via-white to-[#FFF4EC] p-7 sm:p-12 lg:grid-cols-12">
        <div
          aria-hidden="true"
          className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#1E8E3E]/10 blur-3xl"
        />
        <div className="relative z-10 max-w-3xl lg:col-span-7">
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
        <div className="relative z-10 lg:col-span-5">
          <div className="relative h-64 overflow-hidden rounded-2xl ring-4 ring-white shadow-xl sm:h-72">
            {heroImageFailed ? (
              <div className="h-full w-full bg-gradient-to-br from-emerald-300 via-[#1E8E3E] to-[#072916]" />
            ) : (
              <img
                src="https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=85"
                alt="A colorful basket of fresh market produce"
                onError={() => setHeroImageFailed(true)}
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute bottom-3 left-3 flex w-max max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm font-bold text-[#0E532B] shadow-xl sm:bottom-4 sm:left-4">
              <Zap aria-hidden="true" size={18} className="shrink-0 fill-[#F04E00] text-[#F04E00]" />
              <span>Fast &amp; Fresh Across Addis Ababa</span>
            </div>
          </div>
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

      <section className="grid grid-cols-1 divide-y divide-gray-200/80 rounded-3xl border border-emerald-100 bg-gradient-to-r from-[#F3FAF6] via-white to-[#EEF6FA] px-6 py-8 shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map(({ value, label, icon: Icon, iconClassName, valueClassName }) => (
          <div
            key={label}
            className="flex flex-col items-center py-6 text-center first:pt-0 last:pb-0 sm:px-4 sm:py-0 sm:first:pl-0 sm:last:pr-0"
          >
            <span className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${iconClassName}`}>
              <Icon aria-hidden="true" size={20} />
            </span>
            <p className={`text-3xl font-extrabold ${valueClassName}`}>{value}</p>
            <p className="mt-2 text-sm font-medium text-gray-600">{label}</p>
          </div>
        ))}
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
