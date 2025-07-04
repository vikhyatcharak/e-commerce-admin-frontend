// src/components/users/modals/UserBar.jsx
import React from 'react'

const UserBar = ({ user, onViewOrders }) => {
    return (
        <div
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={onViewOrders}
        >
            <div className="flex items-center justify-between">
                {/* User Info */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                        👤
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <div className="text-sm text-gray-500">
                            <span>ID: {user.id}</span>
                            <span className="ml-4">Email: {user.email}</span>
                            {user.phone && <span className="ml-4">Phone: {user.phone}</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                            {user.last_login && (
                                <span className="ml-4">Last Login: {new Date(user.last_login).toLocaleDateString()}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Orders Button */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onViewOrders()
                        }}
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                    >
                        📦 View Orders
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UserBar
