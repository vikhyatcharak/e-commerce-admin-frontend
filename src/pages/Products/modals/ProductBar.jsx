import React from 'react'

const ProductBar = ({
    product,
    showHoverButton = false,
    isHovered = false,
    onMouseEnter,
    onMouseLeave,
    onEdit,
    onDelete,
    onViewVariants,
    onClick
}) => {
    const handleBarClick = (e) => {
        // Prevent navigation if clicking on action buttons
        if (e.target.closest('button')) return
        if (onClick) onClick()
    }

    return (
        <div
            className={`bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer' : ''
                }`}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onClick={handleBarClick}
        >
            <div className="flex items-center justify-between">
                {/* Product Info */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
                        📦
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                        <div className="text-sm text-gray-500">
                            <span>ID: {product.id}</span>
                            {product.sku && <span className="ml-4">SKU: {product.sku}</span>}
                            {product.price && <span className="ml-4">Price: ${product.price}</span>}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    {/* Hover Variants Button - Similar to category hover showing subcategories/products */}
                    {showHoverButton && isHovered && (
                        <div className="flex gap-2 mr-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onViewVariants()
                                }}
                                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                            >
                                ⚡ Variants
                            </button>
                        </div>
                    )}

                    {/* Always visible action buttons */}
                    {!showHoverButton && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onViewVariants()
                            }}
                            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                        >
                            ⚡ Variants
                        </button>
                    )}

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit()
                        }}
                        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-2 rounded-md transition-colors"
                        title="Edit Product"
                    >
                        ✏️
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete()
                        }}
                        className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-md transition-colors"
                        title="Delete Product"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductBar
