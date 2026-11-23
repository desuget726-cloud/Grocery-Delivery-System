import { useMemo, useState } from 'react'
import {
  Check,
  CheckCheck,
  Eye,
  EyeOff,
  MessageSquareText,
  Search,
  Send,
  Star,
  ThumbsUp,
  Trash2,
} from 'lucide-react'
import usePersistentState from '../../hooks/usePersistentState.js'

const daysAgo = (days) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(11, 25, 0, 0)
  return date.toISOString()
}

const initialReviews = [
  {
    id: 'REV-7001',
    customer: 'Abebe Kebede',
    orderId: 'GDS-2531',
    date: daysAgo(0),
    product: 'Fresh Hass Avocados',
    category: 'Fruits & Vegetables',
    rating: 5,
    status: 'Published',
    comment: 'Perfectly ripe and creamy. They arrived in great condition and made a wonderful breakfast.',
    image: 'photo-1523049673857-eb18f1d7b578',
    reply: 'Thank you, Abebe! We are glad the avocados arrived just right. Enjoy!',
  },
  {
    id: 'REV-7002',
    customer: 'Selam Tesfaye',
    orderId: 'GDS-2529',
    date: daysAgo(1),
    product: 'White Teff Flour',
    category: 'Pantry',
    rating: 5,
    status: 'Published',
    comment: 'Excellent quality teff flour with a lovely fine texture. I will definitely order again.',
    image: 'photo-1586201375761-83865001e31c',
    reply: 'Thanks for supporting local grains, Selam. We appreciate your kind words!',
  },
  {
    id: 'REV-7003',
    customer: 'Yared Lemma',
    orderId: 'GDS-2527',
    date: daysAgo(1),
    product: 'Red Roma Tomatoes',
    category: 'Fruits & Vegetables',
    rating: 2,
    status: 'Pending',
    comment: 'Several tomatoes were bruised, and the delivery arrived much later than the selected time.',
    image: 'photo-1546094096-0df4bcaaa337',
    reply: '',
  },
  {
    id: 'REV-7004',
    customer: 'Hiwot Abera',
    orderId: 'GDS-2525',
    date: daysAgo(2),
    product: 'Farm Fresh Milk',
    category: 'Dairy & Eggs',
    rating: 4,
    status: 'Published',
    comment: 'Fresh taste and nicely chilled on arrival. The bottle was securely packed.',
    image: 'photo-1563636619-e9143da7973b',
    reply: '',
  },
  {
    id: 'REV-7005',
    customer: 'Mekdes Fikru',
    orderId: 'GDS-2522',
    date: daysAgo(3),
    product: 'Yirgacheffe Coffee Beans',
    category: 'Pantry',
    rating: 5,
    status: 'Published',
    comment: 'Beautiful aroma and a smooth, bright cup. Freshly roasted and worth every birr.',
    image: 'photo-1559056199-641a0ac8b55e',
    reply: 'So happy you enjoyed this Yirgacheffe lot, Mekdes. Thank you for the review!',
  },
  {
    id: 'REV-7006',
    customer: 'Kebede Girma',
    orderId: 'GDS-2518',
    date: daysAgo(4),
    product: 'Artisan Sourdough Bread',
    category: 'Bakery',
    rating: 3,
    status: 'Pending',
    comment: 'Good flavor, though the loaf was a little softer than I expected. Please keep the crust crisp.',
    image: 'photo-1585478259715-876acc5be8eb',
    reply: '',
  },
  {
    id: 'REV-7007',
    customer: 'Tigist Wolde',
    orderId: 'GDS-2515',
    date: daysAgo(6),
    product: 'Delivery experience',
    category: 'Delivery feedback',
    rating: 1,
    status: 'Pending',
    comment: 'The rider could not find the gate and the order arrived warm. Please improve delivery updates.',
    image: 'photo-1526367790999-0150786686a2',
    reply: '',
  },
  {
    id: 'REV-7008',
    customer: 'Dawit Bekele',
    orderId: 'GDS-2512',
    date: daysAgo(8),
    product: 'Free-Range Eggs',
    category: 'Dairy & Eggs',
    rating: 4,
    status: 'Hidden',
    comment: 'Good eggs and good value. One carton was slightly loose but nothing was broken.',
    image: 'photo-1506976785307-8732e854ad03',
    reply: '',
  },
]

const ratingOptions = ['All Ratings', '5 Stars', '4 Stars', '3 Stars', '1–2 Stars']
const reviewStatusFilters = ['All', 'Pending', 'Published', 'Hidden', 'Needs Reply']
const initialPendingCount = initialReviews.filter((review) => review.status === 'Pending').length
const initialLowRatingCount = initialReviews.filter((review) => review.rating <= 2).length
const initialTotalReviews = 248

function getInitials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function formatReviewDate(value) {
  return new Date(value).toLocaleDateString('en-ET', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function StarRating({ rating, size = 16 }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          size={size}
          className={star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}
        />
      ))}
    </span>
  )
}

function Reviews() {
  const [reviews, setReviews] = usePersistentState('admin-customer-reviews', initialReviews)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [ratingFilter, setRatingFilter] = useState('All Ratings')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyDrafts, setReplyDrafts] = useState({})
  const [replyErrors, setReplyErrors] = useState({})

  const visibleReviews = useMemo(() => {
    const query = search.trim().toLowerCase()
    return reviews.filter((review) => {
      const matchesSearch = `${review.customer} ${review.product} ${review.orderId} ${review.comment}`
        .toLowerCase()
        .includes(query)
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Needs Reply'
          ? !review.reply && review.status !== 'Hidden'
          : review.status === statusFilter)
      const matchesRating =
        ratingFilter === 'All Ratings' ||
        (ratingFilter === '5 Stars'
          ? review.rating === 5
          : ratingFilter === '4 Stars'
            ? review.rating === 4
            : ratingFilter === '3 Stars'
              ? review.rating === 3
              : review.rating <= 2)
      return matchesSearch && matchesStatus && matchesRating
    })
  }, [reviews, search, statusFilter, ratingFilter])

  const pendingCount = Math.max(
    0,
    10 + reviews.filter((review) => review.status === 'Pending').length - initialPendingCount,
  )
  const lowRatingCount = Math.max(
    0,
    5 + reviews.filter((review) => review.rating <= 2).length - initialLowRatingCount,
  )
  const totalReviews = Math.max(
    0,
    initialTotalReviews + reviews.length - initialReviews.length,
  )
  const needsReplyCount = reviews.filter(
    (review) => !review.reply && review.status !== 'Hidden',
  ).length

  const updateReview = (reviewId, changes) => {
    setReviews((current) =>
      current.map((review) => (review.id === reviewId ? { ...review, ...changes } : review)),
    )
  }

  const submitReply = (review) => {
    const reply = (replyDrafts[review.id] ?? '').trim()
    if (!reply) {
      setReplyErrors((current) => ({ ...current, [review.id]: 'Write a reply before sending.' }))
      return
    }
    updateReview(review.id, { reply })
    setReplyDrafts((current) => ({ ...current, [review.id]: '' }))
    setReplyErrors((current) => ({ ...current, [review.id]: '' }))
    setReplyingTo(null)
  }

  const deleteReview = (review) => {
    if (!window.confirm(`Delete the review from ${review.customer}? This cannot be undone.`)) return
    setReviews((current) => current.filter((entry) => entry.id !== review.id))
  }

  return (
    <div className="mx-auto max-w-[1440px]">
      <header className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#1E8E3E]">
          <span className="h-2 w-2 rounded-full bg-[#1E8E3E]" />
          GROCERY DELIVERY <span className="text-slate-300">/</span> CUSTOMER VOICE
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0E532B] sm:text-[30px]">
          Customer Reviews &amp; Ratings
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500">
          Monitor product freshness feedback, delivery speed ratings, moderate pending reviews, and reply to buyers
        </p>
      </header>

      <section aria-label="Ratings overview" className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-600">Overall rating</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-5xl font-bold tracking-tight text-[#0E532B]">4.8</span>
                <span className="mb-1 text-sm font-medium text-slate-400">/ 5.0</span>
              </div>
              <div className="mt-2"><StarRating rating={5} size={19} /></div>
              <p className="mt-2 text-xs text-slate-500">Based on 248 verified reviews</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
              <Star size={21} className="fill-amber-400 text-amber-400" />
            </span>
          </div>
          <div className="mt-5 space-y-2.5">
            {[
              { stars: 5, percentage: 76 },
              { stars: 4, percentage: 15 },
              { stars: 3, percentage: 5 },
              { stars: 2, percentage: 2 },
              { stars: 1, percentage: 2 },
            ].map(({ stars, percentage }) => (
              <div key={stars} className="flex items-center gap-2.5 text-xs">
                <span className="w-6 shrink-0 font-semibold text-slate-600">{stars}★</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${percentage}%` }} />
                </div>
                <span className="w-8 shrink-0 text-right text-slate-500">{percentage}%</span>
              </div>
            ))}
          </div>
        </article>

        <div className="grid grid-cols-2 gap-4 lg:col-span-7">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 sm:text-sm">Total Reviews</span>
              <span className="rounded-xl bg-[#EAF1F9] p-2 text-[#0B4B8C]"><MessageSquareText size={17} /></span>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{totalReviews}</p>
            <p className="mt-1 text-xs text-slate-500">Verified customer feedback</p>
            <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-[#0B4B8C]"><ThumbsUp size={13} /> All time</div>
          </article>
          <button
            type="button"
            onClick={() => setStatusFilter(statusFilter === 'Pending' ? 'All' : 'Pending')}
            className={`rounded-2xl border p-4 text-left shadow-sm transition sm:p-5 ${statusFilter === 'Pending' ? 'border-amber-300 bg-amber-100' : 'border-amber-200 bg-amber-50 hover:bg-amber-100'}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-amber-800 sm:text-sm">Pending Approval</span>
              <span className="rounded-xl bg-white/80 p-2 text-amber-700"><MessageSquareText size={17} /></span>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-amber-900">{pendingCount}</p>
            <p className="mt-1 text-xs text-amber-800/75">Awaiting moderation</p>
            <div className="mt-4 text-[11px] font-semibold text-amber-800">Review pending feedback →</div>
          </button>
          <button
            type="button"
            onClick={() => {
              setRatingFilter('1–2 Stars')
              setStatusFilter('All')
            }}
            className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-left shadow-sm transition hover:bg-orange-100 sm:p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#B53B05] sm:text-sm">Low Rating Alerts (1–2★)</span>
              <span className="rounded-xl bg-white/80 p-2 text-[#F04E00]"><Star size={17} className="fill-orange-200" /></span>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-[#B53B05]">{lowRatingCount}</p>
            <p className="mt-1 text-xs text-[#B53B05]/75">Needs a thoughtful response</p>
            <div className="mt-4 text-[11px] font-semibold text-[#B53B05]">View low ratings →</div>
          </button>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 sm:text-sm">Delivery Experience Avg</span>
              <span className="rounded-xl bg-[#EAF5EC] p-2 text-[#1E8E3E]"><CheckCheck size={17} /></span>
            </div>
            <p className="mt-4 flex items-baseline gap-1 text-3xl font-bold tracking-tight text-[#0E532B]">4.9 <span className="text-base text-amber-400">★</span></p>
            <p className="mt-1 text-xs text-slate-500">Rider speed &amp; care</p>
            <div className="mt-4 text-[11px] font-semibold text-[#1E8E3E]">Excellent customer experience</div>
          </article>
        </div>
      </section>

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="flex h-10 min-w-0 items-center gap-2 rounded-xl border border-slate-200 px-3 text-slate-400 focus-within:border-[#1E8E3E] xl:w-[420px]">
            <Search size={16} className="shrink-0" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by customer, product, order ID, or comment..."
              aria-label="Search reviews"
              className="min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400 sm:text-sm"
            />
          </label>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="flex items-center gap-2 overflow-x-auto">
              {reviewStatusFilters.map((filter) => {
                const label =
                  filter === 'Pending'
                    ? `Pending (${pendingCount})`
                    : filter === 'Needs Reply'
                      ? `Needs Reply (${needsReplyCount})`
                      : filter
                return (
                  <button
                    type="button"
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    aria-pressed={statusFilter === filter}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${statusFilter === filter ? 'bg-[#0E532B] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <label className="relative flex h-10 items-center rounded-xl border border-slate-200 px-3">
              <select
                value={ratingFilter}
                onChange={(event) => setRatingFilter(event.target.value)}
                aria-label="Filter by star rating"
                className="h-full w-full appearance-none bg-transparent pr-6 text-xs font-medium text-slate-600 outline-none sm:text-sm"
              >
                {ratingOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
              <span className="pointer-events-none absolute right-3 text-slate-400">⌄</span>
            </label>
          </div>
        </div>
      </section>

      <section aria-label="Customer review feed" className="space-y-4">
        {visibleReviews.map((review) => (
          <article key={review.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF5EC] text-xs font-bold text-[#0E532B]">
                  {getInitials(review.customer)}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-800">{review.customer}</h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF5EC] px-2 py-0.5 text-[10px] font-semibold text-[#0E722F]">
                      <Check size={11} /> Verified Purchase
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                    <span>Order <span className="font-semibold text-slate-600">{review.orderId}</span></span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={review.date}>{formatReviewDate(review.date)}</time>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400">{review.id}</span>
                  </div>
                </div>
              </div>
              <span className={`self-start rounded-full px-2.5 py-1 text-[11px] font-semibold ${review.status === 'Pending' ? 'bg-amber-50 text-amber-800' : review.status === 'Published' ? 'bg-[#EAF5EC] text-[#0E722F]' : 'bg-slate-100 text-slate-600'}`}>
                {review.status}
              </span>
            </div>

            <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-start">
              <div className="flex shrink-0 items-center gap-3 sm:w-[260px]">
                <img
                  src={`https://images.unsplash.com/${review.image}?auto=format&fit=crop&w=120&h=120&q=80`}
                  alt=""
                  className="h-12 w-12 rounded-xl bg-slate-100 object-cover"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{review.product}</p>
                  <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${review.category === 'Delivery feedback' ? 'bg-blue-50 text-[#0B4B8C]' : 'bg-slate-100 text-slate-500'}`}>
                    {review.category === 'Delivery feedback' ? 'Rider experience' : review.category}
                  </span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2"><StarRating rating={review.rating} /></div>
                <p className="text-sm leading-6 text-slate-700">{review.comment}</p>
              </div>
            </div>

            {review.reply && (
              <div className="mb-4 rounded-xl border border-[#DDEEE0] bg-[#F0F7F1] px-4 py-3">
                <p className="text-[11px] font-bold text-[#0E532B]">Response from Grocery Delivery Admin:</p>
                <p className="mt-1.5 text-xs leading-5 text-[#355B3D]">{review.reply}</p>
              </div>
            )}

            {replyingTo === review.id && (
              <form
                className="mb-4 rounded-xl border border-[#B9DDBF] bg-[#F8FCF8] p-3"
                onSubmit={(event) => {
                  event.preventDefault()
                  submitReply(review)
                }}
              >
                <label htmlFor={`reply-${review.id}`} className="mb-1.5 block text-xs font-semibold text-[#0E532B]">
                  Reply to {review.customer}
                </label>
                <textarea
                  id={`reply-${review.id}`}
                  rows="3"
                  value={replyDrafts[review.id] ?? ''}
                  onChange={(event) => {
                    setReplyDrafts((current) => ({ ...current, [review.id]: event.target.value }))
                    setReplyErrors((current) => ({ ...current, [review.id]: '' }))
                  }}
                  placeholder="Write a helpful response to this customer..."
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#1E8E3E]"
                />
                {replyErrors[review.id] && <p role="alert" className="mt-1.5 text-xs text-[#B53B05]">{replyErrors[review.id]}</p>}
                <div className="mt-2 flex justify-end gap-2">
                  <button type="button" onClick={() => setReplyingTo(null)} className="h-9 rounded-lg px-3 text-xs font-semibold text-slate-500 hover:bg-slate-100">Cancel</button>
                  <button type="submit" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1E8E3E] px-3.5 text-xs font-semibold text-white hover:bg-[#0E532B]">
                    <Send size={13} /> Send Reply
                  </button>
                </div>
              </form>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-[#1E8E3E] hover:text-[#0E532B]"
                >
                  <MessageSquareText size={14} /> {replyingTo === review.id ? 'Close Reply' : review.reply ? 'Reply Again' : 'Reply'}
                </button>
                {review.status === 'Pending' && (
                  <button
                    type="button"
                    onClick={() => updateReview(review.id, { status: 'Published' })}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1E8E3E] px-3 text-xs font-semibold text-white transition hover:bg-[#0E532B]"
                  >
                    <Check size={14} /> Approve &amp; Publish
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateReview(review.id, { status: review.status === 'Hidden' ? 'Published' : 'Hidden' })}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  {review.status === 'Hidden' ? <Eye size={14} /> : <EyeOff size={14} />}
                  {review.status === 'Hidden' ? 'Unhide' : 'Hide'}
                </button>
                <button
                  type="button"
                  onClick={() => deleteReview(review)}
                  aria-label={`Delete review from ${review.customer}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </article>
        ))}
        {visibleReviews.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
              <Search size={21} />
            </span>
            <p className="mt-3 text-sm font-semibold text-slate-700">No reviews found</p>
            <p className="mt-1 text-xs text-slate-500">Try changing your search or filters.</p>
          </div>
        )}
      </section>
      <p className="mt-4 text-center text-[11px] text-slate-400">
        Showing {visibleReviews.length} of {totalReviews} verified reviews
      </p>
    </div>
  )
}

export default Reviews
