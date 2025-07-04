import React, { useState, useEffect } from 'react'

const EditVariantModal = ({ isOpen, variant, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        variant_name: '',
        price: '',
        stock: '',
        description: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (variant && isOpen) {
            setFormData({
                variant_name: variant.variant_name || '',
                price: variant.price || '',
                stock: variant.stock || '',
                description: variant.description || ''
            })
        }
    }, [variant, isOpen])

    const validateForm = () => {
        const errors = []

        if (!formData.variant_name.trim()) {
            errors.push('Variant name is required')
        }

        if (formData.price && (isNaN(formData.price) || parseFloat(formData.price) < 0)) {
            errors.push('Price must be a valid positive number')
        }

        if (formData.stock && (isNaN(formData.stock) || parseInt(formData.stock) < 0)) {
            errors.push('Stock must be a valid positive number')
        }

        return errors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const validationErrors = validateForm()
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '))
            return
        }

        setLoading(true)
        setError('')

        try {
            await onSubmit({
                variant_name: formData.variant_name.trim(),
                price: parseFloat(formData.price) || 0,
                stock: parseInt(formData.stock) || 0,
                description: formData.description.trim()
            })
            handleClose()
        } catch (error) {
            setError(error.message || 'Failed to update variant')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setFormData({ variant_name: '', price: '', stock: '', description: '' })
        setError('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold">Edit Variant</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Variant ID Display */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Variant ID
                        </label>
                        <input
                            type="text"
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                            value={variant?.id || ''}
                        />
                    </div>

                    {/* Product Name Display */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product
                        </label>
                        <input
                            type="text"
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                            value={variant?.product_name || 'N/A'}
                        />
                    </div>

                    {/* Variant Name */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Variant Name *
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., 500gm, Large"
                            value={formData.variant_name}
                            onChange={(e) => setFormData({ ...formData, variant_name: e.target.value })}
                        />
                    </div>

                    {/* Price and Stock Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stock Quantity
                            </label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="0"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* description/Size */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            description/Size
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., 500gm, 1kg, Large"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Updating...' : 'Update Variant'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditVariantModal
