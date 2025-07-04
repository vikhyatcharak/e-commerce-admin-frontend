import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { UseAdmin } from '../../context/AdminContext.jsx'
import ProfileModal from '../../pages/admin/modals/ProfileModal.jsx'
import ChangePasswordModal from '../../pages/admin/modals/ChangePasswordModal.jsx'

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { admin, logout } = UseAdmin()
  const location = useLocation()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const menuItems = [
    { path: '/admin/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/categories', icon: '📂', label: 'Categories' },
    { path: '/admin/subcategories', icon: '📁', label: 'Subcategories' },
    { path: '/admin/products', icon: '📦', label: 'Products' },
    { path: '/admin/orders', icon: '🛒', label: 'Orders' },
    { path: '/admin/coupons', icon: '🎫', label: 'Coupons' },
    { path: '/admin/emailTemplates', icon: '📨', label: 'Email Templates' },
    { path: '/admin/shipping', icon: '🚚', label: 'Shipping' }
  ]

  const handleLogout = async () => {
    await logout()
  }

  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>

        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Store Admin</h2>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {/* Admin Profile Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center w-full p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {admin?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="ml-3 flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">{admin?.name}</p>
                <p className="text-xs text-gray-500">{admin?.email}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10"
              onMouseLeave={() => setShowProfileMenu(false)}>
                <button
                  onClick={() => {
                    setShowProfileModal(true)
                    setShowProfileMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Update Profile
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(true)
                    setShowProfileMenu(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                >
                  Change Password
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-4 px-4">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${location.pathname === item.path
                  ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
              onClick={() => toggleSidebar()}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Modals */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  )
}

export default Sidebar
