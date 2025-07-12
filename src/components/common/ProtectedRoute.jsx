import React from 'react'
import { Navigate } from 'react-router-dom'
import { UseAdmin } from '../../context/AdminContext.jsx'

const ProtectedRoute = ({ children }) => {
  const { admin, loading, isAuthenticated } = UseAdmin()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Authenticating...</span>
      </div>
    )
  }
 if(!isAuthenticated) return <Navigate to="/admin/login" replace />
  return admin ? children : <Navigate to="/admin/login" replace />
}

export default ProtectedRoute
