export const categories = [
  'Fruits & Vegetables',
  'Dairy & Eggs',
  'Bakery',
  'Meat & Seafood',
  'Pantry',
  'Snacks',
]

export const products = [
  {
    id: 'organic-avocados',
    name: 'Organic Avocados',
    category: 'Fruits & Vegetables',
    unit: 'Pack of 2',
    price: 4.49,
    originalPrice: 5.49,
    stock: 24,
    description: 'Creamy, ripe organic avocados selected for freshness.',
    nutrition: { Calories: '160 kcal', Fiber: '7 g', Protein: '2 g' },
  },
  {
    id: 'strawberries',
    name: 'Fresh Strawberries',
    category: 'Fruits & Vegetables',
    unit: '1 lb basket',
    price: 3.99,
    stock: 18,
    description: 'Sweet, locally sourced strawberries, washed and ready to enjoy.',
    nutrition: { Calories: '49 kcal', Fiber: '3 g', Protein: '1 g' },
  },
  {
    id: 'baby-spinach',
    name: 'Baby Spinach',
    category: 'Fruits & Vegetables',
    unit: '5 oz bag',
    price: 2.79,
    stock: 30,
    description: 'Tender baby spinach leaves, perfect for salads and smoothies.',
    nutrition: { Calories: '23 kcal', Fiber: '2 g', Protein: '3 g' },
  },
  {
    id: 'whole-milk',
    name: 'Whole Milk',
    category: 'Dairy & Eggs',
    unit: 'Half gallon',
    price: 3.59,
    stock: 16,
    description: 'Rich, farm-fresh whole milk from happy, pasture-raised cows.',
    nutrition: { Calories: '150 kcal', Calcium: '25% DV', Protein: '8 g' },
  },
  {
    id: 'sourdough',
    name: 'Artisan Sourdough',
    category: 'Bakery',
    unit: 'One loaf',
    price: 5.25,
    stock: 9,
    description: 'Slow-fermented sourdough with a crisp crust and soft center.',
    nutrition: { Calories: '120 kcal', Fiber: '1 g', Protein: '4 g' },
  },
  {
    id: 'free-range-eggs',
    name: 'Free-Range Eggs',
    category: 'Dairy & Eggs',
    unit: 'Dozen',
    price: 6.49,
    stock: 20,
    description: 'A dozen fresh eggs from free-range hens.',
    nutrition: { Calories: '70 kcal', Protein: '6 g', VitaminD: '6% DV' },
  },
  {
    id: 'rolled-oats',
    name: 'Whole Rolled Oats',
    category: 'Pantry',
    unit: '18 oz bag',
    price: 4.1,
    stock: 22,
    description: 'Whole grain rolled oats for a wholesome breakfast.',
    nutrition: { Calories: '150 kcal', Fiber: '4 g', Protein: '5 g' },
  },
  {
    id: 'almond-trail-mix',
    name: 'Almond Trail Mix',
    category: 'Snacks',
    unit: '8 oz pouch',
    price: 7.25,
    stock: 0,
    description: 'A satisfying mix of almonds, dried fruit, and seeds.',
    nutrition: { Calories: '170 kcal', Fiber: '3 g', Protein: '6 g' },
  },
]

export const mockOrders = [
  {
    id: 'GDS-1048',
    date: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    status: 'Out for Delivery',
    total: 32.47,
    deliverySlot: 'Today, 2:00 PM - 4:00 PM',
    paymentMethod: 'Card',
    customerName: 'Alex Morgan',
    customerPhone: '(555) 010-2048',
    deliveryAddress: '128 Maple Street, Springfield, 62704',
    distance: '2.4 mi',
    estimatedTime: '18 min',
    deliveryStaff: 'Jamie Brooks',
    items: [
      { id: 'strawberries', name: 'Fresh Strawberries', unit: '1 lb basket', price: 3.99, quantity: 2 },
      { id: 'whole-milk', name: 'Whole Milk', unit: 'Half gallon', price: 3.59, quantity: 1 },
    ],
  },
  {
    id: 'GDS-1032',
    date: '2026-11-16T10:15:00.000Z',
    status: 'Delivered',
    total: 27.1,
    deliverySlot: 'Nov 16, 10:00 AM - 12:00 PM',
    paymentMethod: 'Cash on Delivery',
    customerName: 'Casey Rivera',
    customerPhone: '(555) 010-6619',
    deliveryAddress: '42 Oak Avenue, Springfield, 62703',
    deliveryStaff: 'Jamie Brooks',
    deliveryEarnings: 7.5,
    items: [
      { id: 'sourdough', name: 'Artisan Sourdough', unit: 'One loaf', price: 5.25, quantity: 1 },
      { id: 'free-range-eggs', name: 'Free-Range Eggs', unit: 'Dozen', price: 6.49, quantity: 1 },
    ],
  },
  {
    id: 'GDS-1056',
    date: new Date().toISOString(),
    status: 'Confirmed',
    total: 24.36,
    deliverySlot: 'Today, 4:00 PM - 6:00 PM',
    paymentMethod: 'Cash on Delivery',
    customerName: 'Jordan Lee',
    customerPhone: '(555) 010-3187',
    deliveryAddress: '73 Pine Road, Springfield, 62702',
    distance: '3.1 mi',
    estimatedTime: '24 min',
    deliveryStaff: 'Jamie Brooks',
    items: [
      { id: 'organic-avocados', name: 'Organic Avocados', unit: 'Pack of 2', price: 4.49, quantity: 2 },
      { id: 'rolled-oats', name: 'Whole Rolled Oats', unit: '18 oz bag', price: 4.1, quantity: 1 },
    ],
  },
  {
    id: 'GDS-1057',
    date: new Date().toISOString(),
    status: 'Delivered',
    total: 18.85,
    deliverySlot: 'Today, 9:00 AM - 11:00 AM',
    paymentMethod: 'Card',
    customerName: 'Taylor Kim',
    customerPhone: '(555) 010-7754',
    deliveryAddress: '9 Cedar Lane, Springfield, 62701',
    deliveryStaff: 'Jamie Brooks',
    deliveryEarnings: 8.5,
    deliveryNote: 'Left with customer at the front door.',
    items: [
      { id: 'baby-spinach', name: 'Baby Spinach', unit: '5 oz bag', price: 2.79, quantity: 2 },
      { id: 'strawberries', name: 'Fresh Strawberries', unit: '1 lb basket', price: 3.99, quantity: 1 },
    ],
  },
  {
    id: 'GDS-1021',
    date: '2026-11-10T12:00:00.000Z',
    status: 'Cancelled',
    total: 14.99,
    deliverySlot: 'Nov 10, 12:00 PM - 2:00 PM',
    paymentMethod: 'Card',
    customerName: 'Morgan Patel',
    customerPhone: '(555) 010-4430',
    deliveryAddress: '61 Birch Court, Springfield, 62705',
    deliveryStaff: 'Jamie Brooks',
    items: [
      { id: 'whole-milk', name: 'Whole Milk', unit: 'Half gallon', price: 3.59, quantity: 1 },
      { id: 'baby-spinach', name: 'Baby Spinach', unit: '5 oz bag', price: 2.79, quantity: 2 },
    ],
  },
]

const ORDERS_STORAGE_KEY = 'grocery-orders'

export function loadOrders() {
  if (typeof window === 'undefined') {
    return mockOrders
  }

  try {
    const savedOrders = JSON.parse(
      window.localStorage.getItem(ORDERS_STORAGE_KEY) || '[]',
    )
    if (!Array.isArray(savedOrders)) {
      throw new TypeError('Saved orders must be an array')
    }

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

  const savedOrders = JSON.parse(
    window.localStorage.getItem(ORDERS_STORAGE_KEY) || '[]',
  )
  if (!Array.isArray(savedOrders)) {
    throw new TypeError('Saved orders must be an array')
  }

  window.localStorage.setItem(
    ORDERS_STORAGE_KEY,
    JSON.stringify([order, ...savedOrders]),
  )
}
