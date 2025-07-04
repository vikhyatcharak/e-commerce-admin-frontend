import React from 'react'

const CategoryBar = ({
    category,
    isHovered,
    onMouseEnter,
    onMouseLeave,
    onEdit,
    onDelete,
    onViewSubcategories,
    onViewProducts
}) => {
    return (
        <div
            className="relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="flex items-center justify-between">
                {/* Category Info */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                        📂
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-500">ID: {category.id}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    {/* Hover Navigation Buttons */}
                    {isHovered && (
                        <div className="flex gap-2 mr-4">
                            <button
                                onClick={onViewSubcategories}
                                className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                            >
                                📁 Subcategories
                            </button>
                            <button
                                onClick={onViewProducts}
                                className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                            >
                                📦 Products
                            </button>
                        </div>
                    )}

                    {/* Edit/Delete Buttons */}
                    <button
                        onClick={onEdit}
                        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-2 rounded-md transition-colors"
                        title="Edit Category"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={onDelete}
                        className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-md transition-colors"
                        title="Delete Category"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CategoryBar
