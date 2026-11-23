import { createContext, useContext, useEffect, useState } from 'react'

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
  const [cart, setCart] = useState(loadCart)

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (error) {
      console.error('Unable to save the cart to localStorage:', error)
    }
  }, [cart])

  const addToCart = (product) => {
    if (!product || (typeof product.id !== 'string' && typeof product.id !== 'number')) {
      throw new TypeError('A product with an id is required')
    }

    setCart((currentCart) => {
      const existingProduct = currentCart.find((item) => item.id === product.id)

      if (existingProduct) {
        return currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }

      return [...currentCart, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (!Number.isFinite(quantity)) {
      throw new TypeError('Quantity must be a finite number')
    }

    setCart((currentCart) =>
      quantity <= 0
        ? currentCart.filter((item) => item.id !== productId)
        : currentCart.map((item) =>
            item.id === productId ? { ...item, quantity } : item,
          ),
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  )

  const value = {
    cart,
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
