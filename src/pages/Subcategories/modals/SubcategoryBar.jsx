import React from 'react'

const SubcategoryBar = ({
    subcategory,
    category,
    onEdit,
    onDelete,
    onViewProducts
}) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
                {/* Subcategory Info */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
                        📁
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{subcategory.name}</h3>
                        <div className="text-sm text-gray-500">
                            <span>ID: {subcategory.id}</span>
                            {category && <span className="ml-4">Category: {category.name}</span>}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onViewProducts}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                    >
                        📦 Products
                    </button>

                    <button
                        onClick={onEdit}
                        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-2 rounded-md transition-colors"
                        title="Edit Subcategory"
                    >
                        ✏️
                    </button>

                    <button
                        onClick={onDelete}
                        className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-md transition-colors"
                        title="Delete Subcategory"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SubcategoryBar
