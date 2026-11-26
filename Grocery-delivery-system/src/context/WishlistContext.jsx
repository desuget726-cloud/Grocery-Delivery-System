import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { wishlist as wishlistApi, getApiErrorMessage } from '../services/api.js'
import { logAuditEvent } from '../services/auditLog.js'
import { useAuth } from './AuthContext.jsx'
import { useToast } from './ToastContext.jsx'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const toast = useToast()
  const { isAuthenticated, user } = useAuth()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(false)
  const wishlistRef = useRef(wishlistItems)

  const commitWishlist = useCallback((items) => {
    wishlistRef.current = items
    setWishlistItems(items)
  }, [])

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      commitWishlist([])
      return
    }
    setLoading(true)
    try {
      commitWishlist(await wishlistApi.getAll())
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not load your wishlist.'))
    } finally {
      setLoading(false)
    }
  }, [commitWishlist, isAuthenticated, toast])

  useEffect(() => {
    Promise.resolve().then(refreshWishlist)
  }, [refreshWishlist, user?.id])

  const toggleWishlist = useCallback(async (product) => {
    if (!product || !product.id || !product.name) {
      throw new TypeError('A valid product is required to update the wishlist')
    }
    if (!isAuthenticated) {
      toast.warning('Sign in to save products to your wishlist.')
      throw new Error('You must be signed in to update your wishlist.')
    }

    const removing = wishlistRef.current.some((item) => item.id === product.id)
    try {
      await wishlistApi.toggle(product.id)
      const next = removing
        ? wishlistRef.current.filter((item) => item.id !== product.id)
        : [...wishlistRef.current, product]
      commitWishlist(next)
      logAuditEvent({
        action: removing ? 'Removed from wishlist' : 'Added to wishlist',
        category: 'Customer',
        resource: product.name,
      })
      if (removing) toast.success(`${product.name} removed from your wishlist.`)
      else toast.info(`${product.name} added to your wishlist.`)
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to update your wishlist.')
      toast.error(message)
      throw new Error(message, { cause: error })
    }
  }, [commitWishlist, isAuthenticated, toast])

  const removeFromWishlist = useCallback(async (id) => {
    const product = wishlistRef.current.find((item) => item.id === id)
    if (!product) return
    await toggleWishlist(product)
  }, [toggleWishlist])

  const clearWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      commitWishlist([])
      return
    }
    const items = [...wishlistRef.current]
    try {
      await Promise.all(items.map((item) => wishlistApi.toggle(item.id)))
      commitWishlist([])
      logAuditEvent({ action: 'Cleared wishlist', category: 'Customer', resource: 'Wishlist' })
      toast.success('Your wishlist has been cleared.')
    } catch (error) {
      await refreshWishlist()
      const message = getApiErrorMessage(error, 'Unable to clear your wishlist.')
      toast.error(message)
      throw new Error(message, { cause: error })
    }
  }, [commitWishlist, isAuthenticated, refreshWishlist, toast])

  const isInWishlist = useCallback(
    (id) => wishlistItems.some((item) => item.id === id),
    [wishlistItems],
  )

  const value = {
    wishlistItems,
    wishlistCount: wishlistItems.length,
    loading,
    refreshWishlist,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

// The hook is intentionally exported alongside its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === null) throw new Error('useWishlist must be used within a WishlistProvider')
  return context
}
