export const categories = [
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Bakery & Bread',
  'Meat & Seafood',
  'Pantry & Grains',
  'Snacks & Nuts',
  'Beverages & Juice',
  'Spices & Herbs',
]

export const products = [
  {
    id: 'organic-avocados',
    name: 'Organic Avocados',
    category: 'Fruits & Vegetables',
    unit: '1 kg',
    price: 480,
    originalPrice: 550,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=900&q=85',
    stock: 24,
    rating: 4.8,
    description: 'Creamy, ripe organic avocados selected for freshness.',
    nutrition: { Calories: '160 kcal', Fiber: '7 g', Protein: '2 g' },
  },
  {
    id: 'strawberries',
    name: 'Fresh Strawberries',
    category: 'Fruits & Vegetables',
    unit: '500 g',
    price: 360,
    originalPrice: 420,
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=900&q=85',
    stock: 18,
    rating: 4.7,
    description: 'Sweet, locally sourced strawberries, washed and ready to enjoy.',
    nutrition: { Calories: '49 kcal', Fiber: '3 g', Protein: '1 g' },
  },
  {
    id: 'baby-spinach',
    name: 'Baby Spinach',
    category: 'Fruits & Vegetables',
    unit: '250 g',
    price: 150,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=85',
    stock: 30,
    rating: 4.6,
    description: 'Tender baby spinach leaves, perfect for salads and smoothies.',
    nutrition: { Calories: '23 kcal', Fiber: '2 g', Protein: '3 g' },
  },
  {
    id: 'whole-milk',
    name: 'Whole Milk',
    category: 'Dairy & Eggs',
    unit: '1 Liter',
    price: 140,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=900&q=85',
    stock: 16,
    rating: 4.8,
    description: 'Rich, farm-fresh whole milk from happy, pasture-raised cows.',
    nutrition: { Calories: '150 kcal', Calcium: '25% DV', Protein: '8 g' },
  },
  {
    id: 'sourdough',
    name: 'Artisan Sourdough',
    category: 'Bakery & Bread',
    unit: '500 g loaf',
    price: 250,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85',
    stock: 9,
    rating: 4.9,
    description: 'Slow-fermented sourdough with a crisp crust and soft center.',
    nutrition: { Calories: '120 kcal', Fiber: '1 g', Protein: '4 g' },
  },
  {
    id: 'free-range-eggs',
    name: 'Free-Range Eggs',
    category: 'Dairy & Eggs',
    unit: '12 eggs',
    price: 390,
    image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=900&q=85',
    stock: 20,
    rating: 4.9,
    description: 'A dozen fresh eggs from free-range hens.',
    nutrition: { Calories: '70 kcal', Protein: '6 g', VitaminD: '6% DV' },
  },
  {
    id: 'rolled-oats',
    name: 'Whole Rolled Oats',
    category: 'Pantry & Grains',
    unit: '1 kg',
    price: 320,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=900&q=85',
    stock: 22,
    rating: 4.7,
    description: 'Whole grain rolled oats for a wholesome breakfast.',
    nutrition: { Calories: '150 kcal', Fiber: '4 g', Protein: '5 g' },
  },
  {
    id: 'almond-trail-mix',
    name: 'Almond Trail Mix',
    category: 'Snacks & Nuts',
    unit: '500 g',
    price: 460,
    originalPrice: 520,
    image: 'https://images.unsplash.com/photo-1599599810694-b5ac4ddf6f29?auto=format&fit=crop&w=900&q=85',
    stock: 14,
    rating: 4.6,
    description: 'A satisfying mix of almonds, dried fruit, and seeds.',
    nutrition: { Calories: '170 kcal', Fiber: '3 g', Protein: '6 g' },
  },
  {
    id: 'fresh-chicken-breast',
    name: 'Fresh Chicken Breast',
    category: 'Meat & Seafood',
    unit: '1 kg',
    price: 780,
    originalPrice: 900,
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=900&q=85',
    stock: 12,
    rating: 4.7,
    description: 'Tender, fresh chicken breast prepared for everyday meals.',
    nutrition: { Calories: '165 kcal', Protein: '31 g', Fat: '3.6 g' },
  },
  {
    id: 'fresh-orange-juice',
    name: 'Fresh Orange Juice',
    category: 'Beverages & Juice',
    unit: '1 Liter',
    price: 180,
    originalPrice: 220,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=85',
    stock: 14,
    rating: 4.8,
    description: 'Bright, refreshing orange juice made for a fresh start.',
    nutrition: { Calories: '45 kcal', VitaminC: '50% DV', Sugar: '9 g' },
  },
  {
    id: 'berbere-spice-blend',
    name: 'Berbere Spice Blend',
    category: 'Spices & Herbs',
    unit: '250 g',
    price: 160,
    originalPrice: 180,
    image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=900&q=85',
    stock: 20,
    rating: 4.9,
    description: 'A fragrant Ethiopian-style spice blend for rich, warming dishes.',
    nutrition: { Ingredients: 'Chili, garlic, ginger', Origin: 'Ethiopia' },
  },
  {
    id: 'white-teff-flour',
    name: 'White Teff Flour',
    category: 'Pantry & Grains',
    unit: '1 kg',
    price: 280,
    originalPrice: 320,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=85',
    stock: 26,
    rating: 4.9,
    description: 'Finely milled Ethiopian teff flour, ideal for injera and baking.',
    nutrition: { Calories: '367 kcal', Fiber: '8 g', Protein: '13 g' },
  },
  {
    id: 'ethiopian-arabica-coffee',
    name: 'Ethiopian Arabica Coffee',
    category: 'Beverages & Juice',
    unit: '500 g',
    price: 720,
    originalPrice: 800,
    image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=900&q=85',
    stock: 11,
    rating: 5,
    description: 'Aromatic Ethiopian Arabica beans, freshly roasted for your coffee ceremony.',
    nutrition: { Origin: 'Ethiopia', Roast: 'Medium' },
  },
  {
    id: 'red-lentils',
    name: 'Red Lentils',
    category: 'Pantry & Grains',
    unit: '1 kg',
    price: 240,
    image: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=900&q=85',
    stock: 30,
    rating: 4.7,
    description: 'Wholesome red lentils for quick stews, soups, and weekday meals.',
    nutrition: { Calories: '352 kcal', Fiber: '11 g', Protein: '24 g' },
  },
  {
    id: 'ripe-bananas',
    name: 'Ripe Bananas',
    category: 'Fruits & Vegetables',
    unit: '1 kg',
    price: 120,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=900&q=85',
    stock: 34,
    rating: 4.8,
    description: 'Naturally sweet bananas, selected ripe and ready to enjoy.',
    nutrition: { Calories: '89 kcal', Fiber: '2.6 g', Potassium: '358 mg' },
  },
  {
    id: 'fresh-tomatoes',
    name: 'Fresh Tomatoes',
    category: 'Fruits & Vegetables',
    unit: '1 kg',
    price: 180,
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=900&q=85',
    stock: 28,
    rating: 4.7,
    description: 'Juicy tomatoes for salads, sauces, and traditional dishes.',
    nutrition: { Calories: '18 kcal', Fiber: '1.2 g', VitaminC: '22% DV' },
  },
]

export const mockOrders = [
  {
    id: 'GDS-2538',
    date: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    status: 'Placed',
    total: 880,
    deliverySlot: 'Today, 6:00 PM - 8:00 PM',
    paymentMethod: 'Telebirr',
    customerName: 'Abebe Kebede',
    customerId: 'mock-customer',
    customerPhone: '+251 911 234 567',
    deliveryAddress: 'Bole Medhanialem, Addis Ababa',
    deliveryOtp: '1234',
    isDemo: true,
    items: [
      { id: 'white-teff-flour', name: 'White Teff Flour', unit: '1 kg', price: 280, quantity: 2 },
      { id: 'whole-milk', name: 'Whole Milk', unit: '1 Liter', price: 140, quantity: 1 },
      { id: 'ripe-bananas', name: 'Ripe Bananas', unit: '1 kg', price: 120, quantity: 1 },
    ],
  },
  {
    id: 'GDS-2531',
    date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'Out for Delivery',
    total: 1000,
    deliverySlot: 'Today, 4:00 PM - 6:00 PM',
    paymentMethod: 'Cash on Delivery',
    customerName: 'Selam Tesfaye',
    customerId: 'mock-customer',
    customerPhone: '+251 911 345 678',
    deliveryAddress: 'Kazanchis, Addis Ababa',
    deliveryOtp: '1234',
    isDemo: true,
    items: [
      { id: 'fresh-chicken-breast', name: 'Fresh Chicken Breast', unit: '1 kg', price: 780, quantity: 1 },
      { id: 'berbere-spice-blend', name: 'Berbere Spice Blend', unit: '250 g', price: 160, quantity: 1 },
    ],
  },
  {
    id: 'GDS-2524',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'Delivered',
    total: 730,
    deliverySlot: 'Yesterday, 9:00 AM - 11:00 AM',
    paymentMethod: 'Telebirr',
    customerName: 'Meron Assefa',
    customerId: 'mock-customer',
    customerPhone: '+251 922 456 789',
    deliveryAddress: 'Megenagna, Addis Ababa',
    deliveryOtp: '1234',
    isDemo: true,
    items: [
      { id: 'organic-avocados', name: 'Organic Avocados', unit: '1 kg', price: 480, quantity: 1 },
      { id: 'sourdough', name: 'Artisan Sourdough', unit: '500 g loaf', price: 250, quantity: 1 },
    ],
  },
]

const CUSTOMER_ORDERS_STORAGE_KEY = 'grocery_customer_orders'
export const CUSTOMER_ORDERS_CHANGE_EVENT = 'grocery-customer-orders-change'
const LEGACY_ORDERS_STORAGE_KEY = 'grocery-orders'

function readOrderArray(storageKey) {
  const savedOrders = JSON.parse(
    window.localStorage.getItem(storageKey) || '[]',
  )
  if (!Array.isArray(savedOrders)) {
    throw new TypeError(`Saved orders in ${storageKey} must be an array`)
  }
  return savedOrders
}

function readStoredOrders() {
  const orders = [
    ...readOrderArray(CUSTOMER_ORDERS_STORAGE_KEY),
    ...readOrderArray(LEGACY_ORDERS_STORAGE_KEY),
  ]
  const uniqueOrders = new Map()
  orders.forEach((order) => {
    if (
      order &&
      typeof order.id === 'string' &&
      Array.isArray(order.items) &&
      !uniqueOrders.has(order.id)
    ) {
      uniqueOrders.set(order.id, order)
    }
  })
  return [...uniqueOrders.values()]
}

export function loadOrders() {
  if (typeof window === 'undefined') {
    return mockOrders
  }

  try {
    const savedOrders = readStoredOrders()
    const savedIds = new Set(savedOrders.map((order) => order.id))
    return [...savedOrders, ...mockOrders.filter((order) => !savedIds.has(order.id))]
  } catch (error) {
    console.error('Unable to load saved orders:', error)
    return mockOrders
  }
}

export function saveOrder(order) {
  if (typeof window === 'undefined') {
    throw new Error('Orders can only be saved in a browser')
  }

  const savedOrders = readStoredOrders().filter(
    (savedOrder) => savedOrder.id !== order.id,
  )
  window.localStorage.setItem(
    CUSTOMER_ORDERS_STORAGE_KEY,
    JSON.stringify([order, ...savedOrders]),
  )
  window.dispatchEvent(new CustomEvent(CUSTOMER_ORDERS_CHANGE_EVENT))
}
