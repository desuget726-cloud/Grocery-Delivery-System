import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useToast } from './ToastContext.jsx'
import { logAuditEvent } from '../services/auditLog.js'

const CartContext = createContext(null)
const CART_STORAGE_KEY = 'grocery-cart'

function loadCart() {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY)
    const parsedCart = storedCart ? JSON.parse(storedCart) : []

    if (!Array.isArray(parsedCart)) {
      throw new TypeError('Stored cart must be an array')
    }

    return parsedCart.filter(
      (item) =>
        item &&
        (typeof item.id === 'string' || typeof item.id === 'number') &&
        Number.isFinite(item.price) &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0,
    )
  } catch (error) {
    console.error('Unable to load the cart from localStorage:', error)
    return []
  }
}

export function CartProvider({ children }) {
  const toast = useToast()
  const [cart, setCart] = useState(loadCart)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [coupon, setCoupon] = useState(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (error) {
      console.error('Unable to save the cart to localStorage:', error)
      toast.error('Unable to save your cart. Please try again.')
    }
  }, [cart, toast])

  const addToCart = (product, quantity = 1, shouldNotify = true) => {
    if (!product || (typeof product.id !== 'string' && typeof product.id !== 'number')) {
      toast.error('Unable to add this item to your cart.')
      throw new TypeError('A product with an id is required')
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      toast.error('Choose a valid quantity before adding this item.')
      throw new TypeError('Quantity must be a positive integer')
    }

    setCart((currentCart) => {
      const existingProduct = currentCart.find((item) => item.id === product.id)

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }

      return [...currentCart, { ...product, quantity }]
    })
    logAuditEvent({
      action: 'Added item to cart',
      category: 'Customer',
      resource: product.name || String(product.id),
      details: `Quantity: ${quantity}`,
    })
    if (shouldNotify) {
      toast.success(`${quantity > 1 ? `${quantity} ` : ''}${product.name || 'Item'} added to cart.`)
    }
  }

  const removeFromCart = (productId) => {
    const removedItem = cart.find((item) => item.id === productId)
    if (!removedItem) {
      toast.error('That item could not be found in your cart.')
      return
    }
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId))
    logAuditEvent({
      action: 'Removed item from cart',
      category: 'Customer',
      resource: removedItem.name || String(productId),
    })
    if (cart.length === 1 && cart[0].id === productId) {
      setPromoCode('')
      setCoupon(null)
    }
    toast.success(`${removedItem.name || 'Item'} removed from cart.`)
  }

  const updateQuantity = (productId, quantity) => {
    if (!Number.isFinite(quantity)) {
      toast.error('Choose a valid quantity for this item.')
      throw new TypeError('Quantity must be a finite number')
    }

    const updatedItem = cart.find((item) => item.id === productId)
    setCart((currentCart) =>
      quantity <= 0
        ? currentCart.filter((item) => item.id !== productId)
        : currentCart.map((item) =>
            item.id === productId ? { ...item, quantity } : item,
          ),
    )
    if (
      quantity <= 0 &&
      cart.length === 1 &&
      cart[0].id === productId
    ) {
      setPromoCode('')
      setCoupon(null)
    }
    if (updatedItem) {
      if (quantity <= 0) {
        logAuditEvent({
          action: 'Removed item from cart',
          category: 'Customer',
          resource: updatedItem.name || String(productId),
        })
        toast.success(`${updatedItem.name || 'Item'} removed from cart.`)
      } else {
        logAuditEvent({
          action: 'Updated cart quantity',
          category: 'Customer',
          resource: updatedItem.name || String(productId),
          details: `Quantity: ${quantity}`,
        })
      }
    }
  }

  const clearCart = () => {
    setCart([])
    setPromoCode('')
    setCoupon(null)
  }

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  )

  const value = {
    cart,
    isCartOpen,
    openCart,
    closeCart,
    promoCode,
    setPromoCode,
    coupon,
    setCoupon,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// The hook is intentionally exported alongside its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext)

  if (context === null) {
    throw new Error('useCart must be used within a CartProvider')
  }

  return context
}
