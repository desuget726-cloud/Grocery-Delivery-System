import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import CustomerLayout from './layouts/CustomerLayout.jsx'
import DeliveryLayout from './layouts/DeliveryLayout.jsx'
import AdminCategories from './pages/admin/Categories.jsx'
import AdminCustomers from './pages/admin/Customers.jsx'
import AdminCoupons from './pages/admin/Coupons.jsx'
import AdminDashboard from './pages/admin/Dashboard.jsx'
import DeliveryStaff from './pages/admin/DeliveryStaff.jsx'
import AdminInventory from './pages/admin/Inventory.jsx'
import AdminOrders from './pages/admin/Orders.jsx'
import AdminPayments from './pages/admin/Payments.jsx'
import AdminProducts from './pages/admin/Products.jsx'
import AdminReports from './pages/admin/Reports.jsx'
import AdminReviews from './pages/admin/Reviews.jsx'
import AdminSettings from './pages/admin/Settings.jsx'
import AdminSupport from './pages/admin/Support.jsx'
import AdminNotifications from './pages/admin/Notifications.jsx'
import AssignedOrders from './pages/delivery/AssignedOrders.jsx'
import DeliveryDetails from './pages/delivery/DeliveryDetails.jsx'
import DeliveryDashboard from './pages/delivery/Dashboard.jsx'
import DeliveryHistory from './pages/delivery/History.jsx'
import LoginPage from './pages/auth/Login.jsx'
import RegisterPage from './pages/auth/Register.jsx'
import Cart from './pages/customer/Cart.jsx'
import Checkout from './pages/customer/Checkout.jsx'
import Home from './pages/customer/Home.jsx'
import MyOrders from './pages/customer/MyOrders.jsx'
import ProductDetails from './pages/customer/ProductDetails.jsx'
import Profile from './pages/customer/Profile.jsx'
import Shop from './pages/customer/Shop.jsx'

function NotFound() {
  return (
    <main className="grid min-h-screen place-content-center bg-slate-50 px-4 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you requested does not exist.</p>
      <Link to="/" className="mt-5 font-semibold text-emerald-700">
        Return to the store
      </Link>
    </main>
  )
}

function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />

              <Route path="/" element={<CustomerLayout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="products/:productId" element={<ProductDetails />} />
                <Route path="cart" element={<Cart />} />
                <Route
                  path="checkout"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="my-orders"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <MyOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="my-orders/:orderId"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <MyOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route
                path="admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="promotions" element={<AdminCoupons />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="delivery-staff" element={<DeliveryStaff />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="support" element={<AdminSupport />} />
                <Route path="notifications" element={<AdminNotifications />} />
              </Route>

              <Route
                path="delivery"
                element={
                  <ProtectedRoute allowedRoles={['delivery']}>
                    <DeliveryLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DeliveryDashboard />} />
                <Route path="dashboard" element={<DeliveryDashboard />} />
                <Route path="assigned-orders" element={<AssignedOrders />} />
                <Route path="details/:orderId" element={<DeliveryDetails />} />
                <Route path="orders/:orderId" element={<DeliveryDetails />} />
                <Route path="history" element={<DeliveryHistory />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </CartProvider>
    </LanguageProvider>
  )
}

export default App
