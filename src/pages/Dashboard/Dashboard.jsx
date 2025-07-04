import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UseAdmin } from '../../context/AdminContext.jsx'
import DashboardCard from './DashboardCard.jsx'

const Dashboard = () => {
  const navigate = useNavigate()
  const { admin, initialized } = UseAdmin()
  
  const dashboardCards = [
    {
      title: 'Users',
      icon: '👥',
      color: 'bg-blue-500',
      description: 'Registered users',
      route: '/admin/users'
    },
    {
      title: 'Categories',
      icon: '📂',
      color: 'bg-green-500',
      description: 'Product categories',
      route: '/admin/categories'
    },
    {
      title: 'Subcategories',
      icon: '📁',
      color: 'bg-yellow-500',
      description: 'Product subcategories',
      route: '/admin/subcategories'
    },
    {
      title: 'Products',
      icon: '📦',
      color: 'bg-purple-500',
      description: 'Total products',
      route: '/admin/products'
    },
    {
      title: 'Orders',
      icon: '🛒',
      color: 'bg-red-500',
      description: 'Total orders',
      route: '/admin/orders'
    },
    {
      title: 'Coupons',
      icon: '🎫',
      color: 'bg-pink-500',
      description: 'Active coupons',
      route: '/admin/coupons'
    },
    {
      title: 'Email Templates',
      icon: '📨',
      color: 'bg-indigo-500',
      description: 'Saved templates',
      route: '/admin/emailTemplates'
    }
  ]

  const handleCardClick = (route) => {
    navigate(route)
  }

  if (!initialized) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    )
  }


  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome , {admin?.name}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <DashboardCard
            key={index}
            title={card.title}
            icon={card.icon}
            color={card.color}
            description={card.description}
            onClick={() => handleCardClick(card.route)}
          />
        ))}
      </div>
    </div>
  )
}

export default Dashboard
