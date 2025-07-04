import React, { useState } from 'react'
const OrderBar = ({ order, showHoverButton = false, isHovered = false, onMouseEnter, onMouseLeave, onViewDetails, onShip,onRefresh }) => {

    const hasShiprocketIntegration = order.shiprocket_order_id || order.shiprocket_awb

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer" 
             onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            <div className="flex items-center justify-between">
                {/* Order Info with Shiprocket Indicators */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
                        🛒
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                            {hasShiprocketIntegration && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                    📦 Shiprocket
                                </span>
                            )}
                            {order.shiprocket_awb && (
                                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                    AWB: {order.shiprocket_awb}
                                </span>
                            )}
                        </div>
                        <div className="text-sm text-gray-500">
                            <span>User ID: {order.user_id}</span>
                            <span className="ml-4">Total: ₹{parseFloat(order.final_total).toFixed(2)}</span>
                            <span className="ml-4">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                {showHoverButton && isHovered && (
                    <div className="flex gap-2 mr-4">
                        <button onClick={(e) => { e.stopPropagation(); onViewDetails() }}
                                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium">
                            📋 Details
                        </button>
                        
                        {/* Ship with Couriers button for unshipped orders */}
                        {!hasShiprocketIntegration && order.delivery_status === 'pending' && (
                            <button onClick={(e) => { e.stopPropagation();onShip() }}
                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-md text-sm font-medium">
                                🚚 Ship
                            </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); onRefresh() }}
                                className="bg-indigo-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-md text-sm font-medium">
                            🔃 Sync
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrderBar
