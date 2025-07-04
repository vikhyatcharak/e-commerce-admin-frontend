import React from 'react'

const ViewOrdersModal = ({ isOpen, user, orders, loading, onClose }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h3 className="text-lg font-semibold">Orders by {user?.name}</h3>
                        <p className="text-sm text-gray-500">User ID: {user?.id} | Email: {user?.email}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                            <span className="ml-3 text-gray-600">Loading orders...</span>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">📦</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                            <p className="text-gray-500">This user hasn't placed any orders yet</p>
                        </div>
                    ) : (
                        <>
                            {/* Order Statistics */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                                        <div className="text-sm text-gray-500">Total Orders</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">
                                            {orders.filter(o => o.payment_status === 'complete').length}
                                        </div>
                                        <div className="text-sm text-gray-500">Completed</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-yellow-600">
                                            {orders.filter(o => o.payment_status === 'pending').length}
                                        </div>
                                        <div className="text-sm text-gray-500">Pending</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            ₹{orders.reduce((total, order) => total + (parseFloat(order.final_total) || 0), 0).toFixed(2)}
                                        </div>
                                        <div className="text-sm text-gray-500">Total Spent</div>
                                    </div>
                                </div>
                            </div>

                            {/* Orders List */}
                            <div className="space-y-3">
                                {orders.map((order) => (
                                    <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-lg font-medium text-gray-900">
                                                        Order #{order.id}
                                                    </h4>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.payment_status === 'complete' ? 'bg-green-100 text-green-800' :
                                                            order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                order.payment_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                    order.payment_status==='failed'?'bg-gray-100 text-gray-800':
                                                                        order.payment_status==='refunded'?'bg-amber-100 text-amber-800':
                                                                            order.payment_status==='in_progress'?'bg-blue-100 text-blue-800':
                                                                                'bg-emerald-100 text-emerald-800'

                                                        }`}>
                                                        {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                    <div>
                                                        <span className="font-medium">Order Date:</span><br />
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Total Amount:</span><br />
                                                        ₹{parseFloat(order.final_total || 0).toFixed(2)}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Items:</span><br />
                                                        {order.items_count || 'N/A'} items
                                                    </div>
                                                </div>
                                                {order.shipping_address && (
                                                    <div className="mt-2 text-sm text-gray-600">
                                                        <span className="font-medium">Shipping:</span> {user.address}
                                                    </div>
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
        </div>
    )
}

export default ViewOrdersModal
