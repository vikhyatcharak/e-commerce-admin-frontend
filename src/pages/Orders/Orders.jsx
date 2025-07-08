import React, { useState, useEffect } from 'react'
import { ordersAPI } from '../../api/admin.js'
import OrderBar from './modals/OrderBar.jsx'
import OrderDetailsModal from './modals/OrderDetailsModal.jsx'
import CourierSelectionModal from '../shipping/modals/CourierSelectionModal.jsx'

const Orders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [showCourierModal, setShowCourierModal] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [hoveredOrderId, setHoveredOrderId] = useState(null)

    useEffect(() => {
        fetchOrders()

        // Set up auto-sync interval (every 5 minutes)
        const autoSyncInterval = setInterval(() => {
            fetchOrders()
        }, 30 * 60 * 1000)

        return () => clearInterval(autoSyncInterval)
    }, [])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await ordersAPI.getAllOrders()
            if (response.data?.success) {
                let data = response.data.data
                // Force single object to array if needed
                const normalizedData = Array.isArray(data) ? data : [data]

                // Only filter out null/undefined
                const cleaned = normalizedData.filter(order => !!order && typeof order === 'object')

                setOrders(cleaned)
            } else {
                setOrders([])
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
            setOrders([])
        } finally {
            setLoading(false)
        }
    }


    const fetchOrder = async (id) => {
        try {
            setLoading(true)
            const response = await ordersAPI.getOrderById(id)
            if (response.data?.success) {
                const data = response.data.data
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.id === id ? data : order
                    )
                )
            }
        } catch (err) {
            console.error('Error fetching order:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleViewDetails = async (order) => {
        setSelectedOrder(order)
        setShowDetailsModal(true)
    }

    if (loading) return (<div className='p-6 mx-auto my-auto text-3xl'>Loading.....</div>)
    return (
        <div className="p-6">
            {/* Header*/}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
                    <p className="text-gray-600 mt-1">Manage orders with Shiprocket integration</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                    disabled={loading}
                >
                    🔃 Sync All
                </button>
            </div>

            {/* Orders List */}
            <div className="space-y-3">
                {orders.length === 0 ? (
                    <div className="border border-dashed border-gray-300 bg-gray-50 text-center text-gray-500 py-12 rounded-lg">
                        <div className="text-6xl mb-2">🗒️</div>
                        <h3 className="text-xl font-semibold mb-1">No Orders Found</h3>
                        <p className="text-sm">Your order list is empty. Orders will appear here once placed.</p>
                    </div>
                ) : (orders.map((order, index) => (
                    <OrderBar
                        key={order?.id || `order-${index}`}
                        order={order}
                        showHoverButton={true}
                        isHovered={hoveredOrderId === order.id}
                        onMouseEnter={() => setHoveredOrderId(order.id)}
                        onMouseLeave={() => setHoveredOrderId(null)}
                        onViewDetails={() => handleViewDetails(order)}
                        onShip={() => { setSelectedOrder(order); setShowCourierModal(true) }}
                        onRefresh={() => fetchOrder(order.id)}
                    />
                )))}
            </div>

            {/* Modals */}
            <OrderDetailsModal
                isOpen={showDetailsModal}
                order={selectedOrder}
                onClose={() => setShowDetailsModal(false)}
            />

            <CourierSelectionModal
                isOpen={showCourierModal}
                order={selectedOrder}
                onClose={() => setShowCourierModal(false)}
                onShipmentCreated={() => { fetchOrders() }}
                onAssignCourier={() => { fetchOrders() }}
                onGeneratePickup={() => { setShowCourierModal(false); fetchOrders(); }}
            />
        </div>
    )
}

export default Orders
