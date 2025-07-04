// src/components/variants/VariantBar.jsx
import React, { useState } from 'react'
import { productVariantsAPI } from '../../../../api/admin.js'

const VariantBar = ({ variant, onEdit, onDelete, onUpdate }) => {
    const [isEditingStock, setIsEditingStock] = useState(false)
    const [isEditingPrice, setIsEditingPrice] = useState(false)
    const [stockValue, setStockValue] = useState(variant.stock || 0)
    const [priceValue, setPriceValue] = useState(variant.price || 0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Stock Update Handler with API Call
    const handleStockSave = async () => {
        const parsedStock = Number(stockValue)
        if (parsedStock === variant.stock || isNaN(parsedStock) || parsedStock < 0) {
            setIsEditingStock(false)
            return
        }

        setLoading(true)
        try {
            await productVariantsAPI.updateVariantStock({
                id: variant.id,
                stock: parsedStock
            })
            onUpdate() // Refresh parent component data
            setIsEditingStock(false)
        } catch (error) {
            setError('Failed to update stock: ' + error.message)
            setStockValue(variant.stock)
        } finally {
            setLoading(false)
        }
    }

    // Price Update Handler with API Call
    const handlePriceSave = async () => {
        const parsedPrice = Number(priceValue)
        if (parsedPrice === variant.price || isNaN(parsedPrice) || parsedPrice < 0) {
            setIsEditingPrice(false)
            return
        }

        setLoading(true)
        try {
            await productVariantsAPI.updateVariantPrice({
                id: variant.id,
                price: parsedPrice
            })
            onUpdate() // Refresh parent component data
            setIsEditingPrice(false)
        } catch (error) {
            setError('Failed to update price: ' + error.message)
            setPriceValue(variant.price)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
                {/* Variant Information */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-xl">
                        ⚡
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{variant.variant_name}</h3>
                        <div className="text-sm text-gray-500">
                            <span>ID: {variant.id}</span>
                        </div>
                        {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
                    </div>
                </div>

                {/* Interactive Controls */}
                <div className="flex items-center gap-6">
                    {/* Price Editor */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Price:</span>
                        {isEditingPrice ? (
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    step="0.1"
                                    className="w-24 px-2 py-1 border rounded focus:ring-1 focus:ring-indigo-500"
                                    value={priceValue}
                                    onChange={(e) => setPriceValue(e.target.value)}
                                    disabled={loading}
                                    autoFocus
                                />
                                <button
                                    onClick={handlePriceSave}
                                    className="text-green-600 hover:text-green-800 p-1"
                                    disabled={loading}
                                >
                                    {loading ? '⏳' : '✓'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <span>{typeof variant.price === 'number'
                                    ? variant.price.toFixed(2)
                                    : Number(variant.price).toFixed(2)}</span>
                                <button
                                    onClick={() => setIsEditingPrice(true)}
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                >
                                    ✏️
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Stock Editor */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Stock:</span>
                        {isEditingStock ? (
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    className="w-20 px-2 py-1 border rounded focus:ring-1 focus:ring-indigo-500"
                                    value={stockValue}
                                    onChange={(e) => setStockValue(e.target.value)}
                                    disabled={loading}
                                    autoFocus
                                />
                                <button
                                    onClick={handleStockSave}
                                    className="text-green-600 hover:text-green-800 p-1"
                                    disabled={loading}
                                >
                                    {loading ? '⏳' : '✓'}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <span className={variant.stock <= 0 ? 'text-red-600' : ''}>
                                    {variant.stock}
                                </span>
                                <button
                                    onClick={() => setIsEditingStock(true)}
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                >
                                    ✏️
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4 border-l border-gray-200 pl-4">
                        <button
                            onClick={onEdit}
                            className="p-2 text-yellow-600 hover:text-yellow-800"
                            title="Full Edit"
                        >
                            ✏️
                        </button>
                        <button
                            onClick={onDelete}
                            className="p-2 text-red-600 hover:text-red-800"
                            title="Delete"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VariantBar
