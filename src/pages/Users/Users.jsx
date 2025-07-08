import React, { useState, useEffect } from 'react'
import { usersAPI } from '../../api/admin.js'
import UserBar from './modals/UserBar.jsx'
import ViewOrdersModal from './modals/ViewOrdersModal.jsx'

const Users = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showOrdersModal, setShowOrdersModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [orders, setOrders] = useState([])
    const [loadingOrders, setLoadingOrders] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await usersAPI.getUsers()
            if (response.data?.success) {
                setUsers(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }
    
    const handleViewOrders = async (user) => {
        setSelectedUser(user)
        setShowOrdersModal(true)
        setLoadingOrders(true)

        try {
            const response = await usersAPI.getUserOrders(user?.id)
            if (response.data?.success) {
                setOrders(response.data.data || [])
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
            setOrders([])
        } finally {
            setLoadingOrders(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Registered Users</h1>
                <p className="text-gray-600 mt-1">View users and their order history</p>
            </div>

            {/* Users List */}
            <div className="space-y-3">
                {users.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">👥</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-500">No registered users available</p>
                    </div>
                ) : (
                    users.map((user) => (
                        <UserBar
                            key={user.id}
                            user={user}
                            onViewOrders={() => handleViewOrders(user)}
                        />
                    ))
                )}
            </div>

            {/* Orders Modal */}
            <ViewOrdersModal
                isOpen={showOrdersModal}
                user={selectedUser}
                orders={orders}
                loading={loadingOrders}
                onClose={() => {
                    setShowOrdersModal(false)
                    setSelectedUser(null)
                    setOrders([])
                }}
            />
        </div>
    )
}

export default Users
