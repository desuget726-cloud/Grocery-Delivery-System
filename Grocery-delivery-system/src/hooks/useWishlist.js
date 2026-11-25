import { useEffect, useState } from 'react'

const WISHLIST_STORAGE_KEY = 'grocery_wishlist'
const WISHLIST_UPDATED_EVENT = 'grocery-wishlist-updated'

function readWishlist() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedWishlist = window.localStorage.getItem(WISHLIST_STORAGE_KEY)
    const parsedWishlist = storedWishlist ? JSON.parse(storedWishlist) : []
    if (!Array.isArray(parsedWishlist)) {
      throw new TypeError('Saved wishlist must be an array')
    }

    return [...new Set(parsedWishlist.filter((id) => typeof id === 'string'))]
  } catch (error) {
    console.error('Unable to load the wishlist from localStorage:', error)
    return []
  }
}

export function useWishlist(productId) {
  const [wishlist, setWishlist] = useState(readWishlist)

  useEffect(() => {
    const syncWishlist = () => setWishlist(readWishlist())
    window.addEventListener('storage', syncWishlist)
    window.addEventListener(WISHLIST_UPDATED_EVENT, syncWishlist)

    return () => {
      window.removeEventListener('storage', syncWishlist)
      window.removeEventListener(WISHLIST_UPDATED_EVENT, syncWishlist)
    }
  }, [])

  const toggleWishlist = () => {
    const currentWishlist = readWishlist()
    const nextWishlist = currentWishlist.includes(productId)
      ? currentWishlist.filter((id) => id !== productId)
      : [...currentWishlist, productId]

    window.localStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify(nextWishlist),
    )
    window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT))
  }

  return {
    isWishlisted: wishlist.includes(productId),
    toggleWishlist,
  }
}
