import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AdminProvider, UseAdmin } from './context/AdminContext.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import Layout from './components/layout/Layout.jsx'
import LoginAdmin from './pages/admin/LogIn.jsx'
import RegisterAdmin from './pages/admin/Register.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Categories from './pages/Categories/Categories.jsx'
// import AllSubcategories from './pages/Subcategories/AllSubcategories.jsx'
import Subcategories from './pages/Subcategories/Subcategories.jsx'
import Products from './pages/Products/Products.jsx'
// import AllProducts from './pages/Products/AllProducts.jsx'
import ProductVariants from './pages/Products/Variants/ProductVariants.jsx'
import Users from './pages/Users/Users.jsx'
import Orders from './pages/Orders/Orders.jsx'
import Coupons from './pages/Coupons/Coupons.jsx'
import EmailTemplates from './pages/Email_Templates/EmailTemplates.jsx'
import ShippingManagement from './pages/shipping/ShippingManagement.jsx'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const adminRoutes = [
  { path: "/admin/dashboard", element: <Dashboard /> },
  { path: "/admin/users", element: <Users /> },
  { path: "/admin/categories", element: <Categories /> },
  { path: "/admin/subcategories", element: <Subcategories /> },
  { path: "/admin/products", element: <Products /> },
  { path: "/admin/orders", element: <Orders /> },
  { path: "/admin/coupons", element: <Coupons /> },

  { path: "/admin/categories/:categoryId/subcategories", element: <Subcategories /> },
  { path: `/admin/categories/:categoryId/products`, element: <Products /> },
  { path: "/admin/subcategories/:subcategoryId/products", element: <Products /> },
  { path: "/admin/products/:productId/variants", element: <ProductVariants /> },
  { path: "/admin/emailTemplates", element: <EmailTemplates /> },
  { path: "/admin/shipping", element: <ShippingManagement /> }
]

function App() {
  return (
    <>
      <Router>
        <AdminProvider>
          <AppRoutes />
        </AdminProvider>
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
    </>
  )
}

function AppRoutes() {
  const { isAuthenticated } = UseAdmin()

  return (
    <Routes>
      {/* Public Routes */}
      {isAuthenticated
        ? <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        : <Route path="/" element={<Navigate to="/admin/login" replace />} />
      }

      <Route path="/admin/login" element={<LoginAdmin />} />
      <Route path="/admin/register" element={<RegisterAdmin />} />

      {/* Protected Routes */}
      {adminRoutes.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute>
              <Layout>{element}</Layout>
            </ProtectedRoute>
          }
        />
      ))}
    </Routes>
  )
}


export default App
