import React from 'react'

const DashboardCard = ({ title, icon, color, description, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105 border border-gray-200"
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white text-xl`}>
                        {icon}
                    </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </div>
    )
}

export default DashboardCard
