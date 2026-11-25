import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { products as catalogProducts } from '../data/mockData.js'

const WishlistContext = createContext(null)
const WISHLIST_STORAGE_KEY = 'grocery_wishlist'
const WISHLIST_UPDATED_EVENT = 'grocery-wishlist-updated'
const catalogProductsById = new Map(catalogProducts.map((product) => [product.id, product]))

function isProduct(value) {
  return (
    value &&
    (typeof value.id === 'string' || typeof value.id === 'number') &&
    typeof value.name === 'string' &&
    Number.isFinite(Number(value.price))
  )
}

function normalizeWishlist(value) {
  if (!Array.isArray(value)) {
    throw new TypeError('Saved wishlist must be an array')
  }

  const uniqueProducts = new Map()
  value.forEach((item) => {
    const product =
      typeof item === 'string' ? catalogProductsById.get(item) : item
    if (isProduct(product) && !uniqueProducts.has(product.id)) {
      uniqueProducts.set(product.id, product)
    }
  })
  return [...uniqueProducts.values()]
}

function loadWishlist() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const savedWishlist = window.localStorage.getItem(WISHLIST_STORAGE_KEY)
    return normalizeWishlist(savedWishlist ? JSON.parse(savedWishlist) : [])
  } catch (error) {
    console.error('Unable to load the wishlist from localStorage:', error)
    return []
  }
}

function saveWishlist(items) {
  try {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
  } catch (error) {
    console.error('Unable to save the wishlist to localStorage:', error)
    throw error
  }
}

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState(loadWishlist)
  const wishlistRef = useRef(wishlistItems)

  const commitWishlist = useCallback((nextItems) => {
    saveWishlist(nextItems)
    wishlistRef.current = nextItems
    setWishlistItems(nextItems)
    window.dispatchEvent(new Event(WISHLIST_UPDATED_EVENT))
  }, [])

  const toggleWishlist = useCallback((product) => {
    if (!isProduct(product)) {
      throw new TypeError('A valid product is required to update the wishlist')
    }

    const currentItems = wishlistRef.current
    const nextItems = currentItems.some((item) => item.id === product.id)
      ? currentItems.filter((item) => item.id !== product.id)
      : [...currentItems, { ...product }]
    commitWishlist(nextItems)
  }, [commitWishlist])

  const removeFromWishlist = useCallback((id) => {
    const nextItems = wishlistRef.current.filter((item) => item.id !== id)
    commitWishlist(nextItems)
  }, [commitWishlist])

  const isInWishlist = useCallback(
    (id) => wishlistItems.some((item) => item.id === id),
    [wishlistItems],
  )

  const clearWishlist = useCallback(() => {
    commitWishlist([])
  }, [commitWishlist])

  useEffect(() => {
    const syncWishlist = () => {
      const nextItems = loadWishlist()
      wishlistRef.current = nextItems
      setWishlistItems(nextItems)
    }
    window.addEventListener('storage', syncWishlist)
    window.addEventListener(WISHLIST_UPDATED_EVENT, syncWishlist)

    return () => {
      window.removeEventListener('storage', syncWishlist)
      window.removeEventListener(WISHLIST_UPDATED_EVENT, syncWishlist)
    }
  }, [])

  const value = {
    wishlistItems,
    toggleWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    wishlistCount: wishlistItems.length,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

// The hook is intentionally exported alongside its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === null) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
