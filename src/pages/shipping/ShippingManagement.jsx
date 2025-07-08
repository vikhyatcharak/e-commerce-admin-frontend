import React, { useState, useEffect } from 'react'
import { ordersAPI } from '../../api/admin.js'
import { toast } from 'react-toastify'
import ShippingLocationModal from './modals/ShippingLocationModal.jsx'
import CourierSelectionModal from './modals/CourierSelectionModal.jsx'
import OrderDetailsModal from '../Orders/modals/OrderDetailsModal.jsx'

const ShippingManagement = () => {
    const [activeTab, setActiveTab] = useState('overview')
    const [loading, setLoading] = useState(true)

    // State for different data sets
    const [pickupLocations, setPickupLocations] = useState([])
    const [orders, setOrders] = useState([])
    const [shiprocketOrders, setShiprocketOrders] = useState([])
    const [shippingStats, setShippingStats] = useState({})
    const [trackingInput, setTrackingInput] = useState('')
    const [trackingResult, setTrackingResult] = useState(null)

    // Modal states
    const [showLocationModal, setShowLocationModal] = useState(false)
    const [showCourierModal, setShowCourierModal] = useState(false)
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [editLocation, setEditLocation] = useState(null)


    useEffect(() => {
        fetchInitialData()

        const autoSyncInterval = setInterval(() => {
            fetchInitialData()
        }, 30 * 60 * 1000)

        return () => clearInterval(autoSyncInterval)
    }, [])

    const fetchInitialData = async () => {
        setLoading(true)
        try {
            await Promise.all([
                await fetchPickupLocations(),
                await fetchOrders(),
                await fetchShiprocketOrders(),
                await fetchShippingStats()
            ])
        } catch (error) {
            console.error('Error fetching initial data:', error)
            toast.error('Failed to load shipping data')
        } finally {
            setLoading(false)
        }
    }

    const fetchPickupLocations = async () => {
        try {
            const response = await ordersAPI.getPickupLocations()
            if (response.data.success) {
                let data = response.data.data
                if (!Array.isArray(data)) {
                    data = data ? [data] : []
                }
                setPickupLocations(data)
            }
        } catch (error) {
            console.error('Error fetching pickup locations:', error)
        }
    }

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const response = await ordersAPI.getAllOrders()
            if (response.data?.success) {
                let data = response.data.data
                if (!Array.isArray(data)) {
                    data = data ? [data] : []
                }
                setOrders(data)
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    const fetchShiprocketOrders = async () => {
        try {
            setLoading(true)
            if (orders.length > 0) {
                // Filter orders that have Shiprocket integration
                const ordersWithShiprocket = Array.isArray(orders)
                    ? orders.filter(order => order.shiprocket_order_id || order.shiprocket_awb)
                    : orders.shiprocket_order_id || orders.shiprocket_awb
                        ? [orders]
                        : []

                setShiprocketOrders(ordersWithShiprocket)
            }
        } catch (error) {
            console.error('Error fetching Shiprocket orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchShippingStats = async () => {
        try {
            if (orders.length > 0) {
                const stats = {
                    totalOrders: orders.length,
                    shippedOrders: orders.filter(o => o.awb_code).length,
                    pendingShipments: orders.filter(o => o.delivery_status === 'pending' && !o.shiprocket_awb).length,
                    deliveredOrders: orders.filter(o => o.delivery_status === 'delivered').length,
                    totalRevenue: orders.reduce((sum, o) => sum + (parseFloat(o.final_total) || 0), 0),
                    averageDeliveryTime: '3-5 days', // This would be calculated from actual delivery data
                }

                setShippingStats(stats)
            }
        } catch (error) {
            console.error('Error fetching shipping stats:', error)
        }
    }

    const handleTrackShipment = async () => {
        if (!trackingInput.trim()) {
            toast.error('Please input a valid AWB number')
            return
        }

        try {
            const response = await ordersAPI.trackShipment({ orderId: trackingInput.trim() })
            if (response.data.success) {
                setTrackingResult(response.data.data.trackingData || response.data.data)
                toast.success('Tracking info retrieved')
            }
        } catch (error) {
            toast.error('Failed to track shipment')
            setTrackingResult(null)
        }
    }

    const handleCreateShipment = async (orderId) => {
        setSelectedOrder(orders.find(o => o.id === orderId))
        setShowCourierModal(true)
    }

    const handleDeleteLocation = async (locationId) => {
        if (!confirm('Are you sure you want to delete this pickup location?')) return

        try {
            setLoading(true)
            const response = await ordersAPI.deletePickupLocation(locationId)
            if (response.data.success) {
                toast.success('Pickup location deleted')
                fetchPickupLocations()
            }
        } catch (error) {
            toast.error('Failed to delete location')
        } finally {
            setLoading(false)
        }
    }

    const handleSetDefaultLocation = async (locationId) => {
        if (!confirm("Make this the default pickup location?")) return
        try {
            setLoading(true)
            const response = await ordersAPI.setDefaultPickupLocation(locationId)
            if (response.data.success) {
                toast.success('Default pickup location updated')
                fetchPickupLocations()
            }
        } catch (error) {
            toast.error('Failed to set default location')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadLabel = async (orderId) => {
        try {
            const data = {}
            data.orderId = selectedOrder.id
            data.orderIds = [orderId]
            const response = await ordersAPI.getShipmentLabel(data)
            const url = response.data.data.labelUrl
            window.open(url, '_blank')
            toast.success('Shipping label downloaded')
        } catch (error) {
            toast.error('Failed to download shipping label')
        }
    }
    const handleDownloadInvoice = async (orderId) => {
        try {
            const data = {}
            data.orderId = selectedOrder.id
            data.orderIds = [orderId]
            const response = await ordersAPI.getShipmentInvoice(data)
            const url = response.data.data.invoiceUrl
            window.open(url, '_blank')
            toast.success('Shipping label downloaded')
        } catch (error) {
            toast.error('Failed to download shipping label')
        }
    }
    const handleDownloadManifest = async (shipmentId) => {
        try {
            const data = {}
            data.orderId = selectedOrder.id
            data.shipmentIds = [shipmentId]
            const response = await ordersAPI.getShipmentManifest(data)
            const url = response.data.data.manifestUrl
            window.open(url, '_blank')
            toast.success('Shipping label downloaded')
        } catch (error) {
            toast.error('Failed to download shipping label')
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading shipping dashboard...</span>
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Shipping Management</h1>
                    <p className="text-gray-600 mt-1">Manage pickup locations, track shipments, and monitor Shiprocket integration</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowLocationModal(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
                        📍 Manage Locations
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{shippingStats.totalOrders || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📦</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Total orders in system</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Shipped Orders</p>
                            <p className="text-2xl font-bold text-green-600">{shippingStats.shippedOrders || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🚚</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Orders with AWB numbers</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pending Shipments</p>
                            <p className="text-2xl font-bold text-yellow-600">{shippingStats.pendingShipments || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">⏳</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Awaiting shipment creation</p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Pickup Locations</p>
                            <p className="text-2xl font-bold text-purple-600">{pickupLocations.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📍</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Configured locations</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                    {[
                        { id: 'overview', label: 'Overview', icon: '📊' },
                        { id: 'locations', label: 'Pickup Locations', icon: '📍' },
                        { id: 'orders', label: 'Shiprocket Orders', icon: '📦' },
                        { id: 'tracking', label: 'Quick Tracking', icon: '🔍' },
                        { id: 'analytics', label: 'Analytics', icon: '📈' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4">Recent Shipping Activity</h3>
                        <div className="space-y-3">
                            {shiprocketOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm">📦</span>
                                        </div>
                                        <div>
                                            <p className="font-medium">Order #{order.id}</p>
                                            <p className="text-sm text-gray-500">
                                                {order.shiprocket_awb ? `AWB: ${order.shiprocket_awb}` : 'Pending shipment'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">₹{parseFloat(order.final_total).toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h4 className="font-semibold mb-3">Quick Ship Orders</h4>
                            <p className="text-sm text-gray-600 mb-4">Create shipments for pending orders</p>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                            >
                                View Pending Orders
                            </button>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h4 className="font-semibold mb-3">Manage Locations</h4>
                            <p className="text-sm text-gray-600 mb-4">Add or edit pickup locations</p>
                            <button
                                onClick={() => setShowLocationModal(true)}
                                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                            >
                                Manage Locations
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'locations' && (
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Pickup Locations</h3>
                            <button
                                onClick={() => {
                                    setEditLocation(null)
                                    setShowLocationModal(true)
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                            >
                                + Add New Location
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {pickupLocations.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-6xl mb-4">📍</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No pickup locations found</h3>
                                <p className="text-gray-500 mb-4">Create your first pickup location to get started</p>
                                <button
                                    onClick={() => setShowLocationModal(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    Create Location
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pickupLocations.map((location) => (
                                    <div key={location.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-medium text-gray-900">{location.location_name}</h4>
                                                    {location.is_default && (
                                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                                                <p className="text-sm text-gray-500">
                                                    {location.city}, {location.state} - {location.pincode}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Contact: {location.contact_person} ({location.phone},{location.email})
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {!location.is_default && (
                                                <button
                                                    disabled={loading}
                                                    onClick={() => handleSetDefaultLocation(location.id)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 border border-blue-200 rounded"
                                                >
                                                    Set Default
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setEditLocation(location)
                                                    setShowLocationModal(true)
                                                }}
                                                className="text-yellow-600 hover:text-yellow-800 p-1"
                                                title="Edit Location"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLocation(location.id)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                                title="Delete Location"
                                                disabled={location.is_default || loading}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-6">
                        {shiprocketOrders.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-6xl mb-4">📦</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                                <p className="text-gray-500">No orders match the current filter</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {shiprocketOrders.map((order) => (
                                        <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <span className="text-lg">📦</span>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">Order #{order.id}</h4>
                                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                                            <span>₹{parseFloat(order.final_total).toFixed(2)}</span>
                                                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                                            {order.shiprocket_awb && (
                                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                                                    AWB: {order.shiprocket_awb}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order)
                                                            setShowOrderModal(true)
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-200 rounded text-sm"
                                                    >
                                                        View Details
                                                    </button>

                                                    {!order.shiprocket_awb ? (
                                                        <button
                                                            onClick={() => handleCreateShipment(order.id)}
                                                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                                        >
                                                            Create Shipment
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        const response = await ordersAPI.trackShipment(order.shiprocket_awb)
                                                                        if (response.data.success) {
                                                                            toast.success(`Status: ${response.data.data.current_status}`)
                                                                        }
                                                                    } catch (error) {
                                                                        toast.error('Failed to track shipment')
                                                                    }
                                                                }}
                                                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                                            >
                                                                Track
                                                            </button>
                                                            <button
                                                                onClick={() => handleDownloadLabel(order.id)}
                                                                className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                                                            >
                                                                Label
                                                            </button>
                                                            <button
                                                                onClick={() => handleDownloadInvoice(order.id)}
                                                                className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                                                            >
                                                                Invoice
                                                            </button>
                                                            <button
                                                                onClick={() => handleDownloadManifest(order.id)}
                                                                className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                                                            >
                                                                Manifest
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'tracking' && (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4">Quick AWB Tracking</h3>

                        <div className="flex gap-3 mb-6">
                            <input
                                type="text"
                                placeholder="Enter AWB number..."
                                value={trackingInput}
                                onChange={(e) => setTrackingInput(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => e.key === 'Enter' && handleTrackShipment()}
                            />
                            <button
                                onClick={handleTrackShipment}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                            >
                                Track
                            </button>
                        </div>

                        {trackingResult && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium mb-3">Tracking Information</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">AWB Number:</span>
                                        <span className="font-medium">{trackingResult.awb_code}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Current Status:</span>
                                        <span className="font-medium text-blue-600">{trackingResult.current_status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Last Updated:</span>
                                        <span className="font-medium">{trackingResult.last_update_time}</span>
                                    </div>
                                    {trackingResult.delivered_date && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Delivered Date:</span>
                                            <span className="font-medium text-green-600">{trackingResult.delivered_date}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4">Shipping Analytics</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{shippingStats.totalOrders}</div>
                                <div className="text-sm text-gray-500">Total Orders</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{shippingStats.shippedOrders}</div>
                                <div className="text-sm text-gray-500">Shipped Orders</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">{shippingStats.pendingShipments}</div>
                                <div className="text-sm text-gray-500">Pending Shipments</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">₹{shippingStats.totalRevenue?.toFixed(2)}</div>
                                <div className="text-sm text-gray-500">Total Revenue</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h4 className="font-semibold mb-3">Performance Metrics</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span>Average Delivery Time</span>
                                <span className="font-medium">{shippingStats.averageDeliveryTime}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Delivery Success Rate</span>
                                <span className="font-medium text-green-600">
                                    {shippingStats.totalOrders > 0
                                        ? Math.round((shippingStats.deliveredOrders / shippingStats.totalOrders) * 100)
                                        : 0}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Orders Shipped Today</span>
                                <span className="font-medium">{shippingStats.shippedOrders}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            <ShippingLocationModal
                isOpen={showLocationModal}
                onClose={() => {
                    setShowLocationModal(false)
                    setEditLocation(null)
                }}
                editLocation={editLocation}
                onLocationCreated={() => {
                    fetchPickupLocations()
                    setShowLocationModal(false)
                    setEditLocation(null)
                }}
                onEditLocation={(location) => {
                    setEditLocation(location) // ✅ this sets the prop for edit mode
                }}
            />

            <CourierSelectionModal
                isOpen={showCourierModal}
                order={selectedOrder}
                onClose={() => {
                    setShowCourierModal(false)
                    setSelectedOrder(null)
                }}
                onShipmentCreated={() => {
                    fetchOrders()
                    fetchShiprocketOrders()
                    fetchShippingStats()
                    toast.success('Shipment created successfully!')
                }}
                onAssignCourier={() => {
                    fetchOrders()
                    fetchShiprocketOrders()
                    fetchShippingStats()
                    toast.success('Courier assigned successfully!')
                }}
                onGeneratePickup={() => {
                    setShowCourierModal(false)
                    setSelectedOrder(null)
                    fetchOrders()
                    fetchShiprocketOrders()
                    fetchShippingStats()
                    toast.success('Pickup generated successfully!')
                }}
            />


            <OrderDetailsModal
                isOpen={showOrderModal}
                order={selectedOrder}
                onClose={() => {
                    setShowOrderModal(false)
                    setSelectedOrder(null)
                }}
            />
        </div>
    )
}

export default ShippingManagement
