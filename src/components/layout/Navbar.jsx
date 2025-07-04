// src/components/layout/Navbar.jsx
import React from 'react'
import { UseAdmin } from '../../context/AdminContext.jsx'

const Navbar = ({ toggleSidebar }) => {
  const { admin } = UseAdmin()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-800 lg:ml-0">
            Store Management
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Welcome, {admin?.name}
          </span>
        </div>
      </div>
    </header>
  )
}

export default Navbar
