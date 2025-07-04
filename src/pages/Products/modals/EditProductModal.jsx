// src/components/products/EditProductModal.jsx
import React, { useState, useEffect } from 'react'
import { categoriesAPI, subcategoriesAPI } from '../../../api/admin.js'

const EditProductModal = ({
    isOpen,
    product,
    onClose,
    onSubmit,
    showCategorySelection = false
}) => {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        hsn: '',
        return_period: '',
        product_type: '',
        tax: '',
        discount: '',
        description: '',
        category_id: '',
        subcategory_id: ''
    })

    const [categories, setCategories] = useState([])
    const [subcategories, setSubcategories] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Product type options
    const productTypes = [
        { value: 'physical', label: 'Physical Product' },
        { value: 'digital', label: 'Digital Product' },
        { value: 'service', label: 'Service' },
        { value: 'subscription', label: 'Subscription' }
    ]

    useEffect(() => {
        if (product && isOpen) {
            setFormData({
                name: product.name || '',
                sku: product.sku || '',
                hsn: product.hsn || '',
                return_period: product.return_period || '',
                product_type: product.product_type || '',
                tax: product.tax || '',
                discount: product.discount || '',
                description: product.description || '',
                category_id: product.category_id || '',
                subcategory_id: product.subcategory_id || ''
            })

            if (showCategorySelection) {
                fetchCategories()
                if (product.category_id) {
                    fetchSubcategories(product.category_id)
                }
            }
        }
    }, [product, isOpen, showCategorySelection])

    useEffect(() => {
        if (formData.category_id && showCategorySelection && isOpen) {
            fetchSubcategories(formData.category_id)
        }
    }, [formData.category_id, showCategorySelection, isOpen])

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getCategories()
            if (response.data?.success) {
                setCategories(response.data.data.categories)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const fetchSubcategories = async (categoryId) => {
        try {
            const response = await categoriesAPI.getSubcategoriesByCategoryId(categoryId)
            if (response.data?.success) {
                setSubcategories(response.data.data.subcategories || [])
            }
        } catch (error) {
            console.error('Error fetching subcategories:', error)
            setSubcategories([])
        }
    }

    const validateForm = () => {
        const newErrors = []

        if (!formData.name.trim()) {
            newErrors.push('Product name is required')
        }

        if (!formData.sku.trim()) {
            newErrors.push('SKU is required')
        }

        if (showCategorySelection && !formData.category_id) {
            newErrors.push('Please select a category')
        }

        if (showCategorySelection && !formData.subcategory_id) {
            newErrors.push('Please select a subcategory')
        }

        if (formData.tax && (isNaN(formData.tax) || parseFloat(formData.tax) < 0)) {
            newErrors.push('Tax must be a valid positive number')
        }

        if (formData.discount && (isNaN(formData.discount) || parseFloat(formData.discount) < 0)) {
            newErrors.push('Discount must be a valid positive number')
        }

        if (formData.return_period && (isNaN(formData.return_period) || parseInt(formData.return_period) < 0)) {
            newErrors.push('Return period must be a valid positive number')
        }

        return newErrors
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
            const productData = {
                name: formData.name.trim(),
                sku: formData.sku.trim(),
                hsn: formData.hsn.trim(),
                return_period: formData.return_period ? parseInt(formData.return_period) : null,
                product_type: formData.product_type.trim(),
                tax: formData.tax ? parseFloat(formData.tax) : 0,
                discount: formData.discount ? parseFloat(formData.discount) : 0,
                description: formData.description.trim(),
                category_id: formData.category_id,
                subcategory_id: formData.subcategory_id
            }

            await onSubmit(productData)
            handleClose()
        } catch (error) {
            setError(error.message || 'Failed to update product')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setFormData({
            name: '',
            sku: '',
            hsn: '',
            return_period: '',
            product_type: '',
            tax: '',
            discount: '',
            description: '',
            category_id: '',
            subcategory_id: ''
        })
        setError('')
        setSubcategories([])
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold">Edit Product</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Category Selection */}
                    {showCategorySelection && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category *
                                </label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.category_id}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            category_id: e.target.value,
                                            subcategory_id: ''
                                        })
                                    }}
                                >
                                    <option value="">Select a category...</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subcategory *
                                </label>
                                <select
                                    required
                                    disabled={!formData.category_id}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:text-gray-500"
                                    value={formData.subcategory_id}
                                    onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                                >
                                    <option value="">Select a subcategory...</option>
                                    {subcategories.map((subcategory) => (
                                        <option key={subcategory.id} value={subcategory.id}>
                                            {subcategory.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Basic Product Information */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Name *
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter product name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                SKU *
                            </label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter SKU"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* HSN and Product Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                HSN Code
                            </label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter HSN code"
                                value={formData.hsn}
                                onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Type
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.product_type}
                                onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                            >
                                <option value="">Select product type...</option>
                                {productTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tax, Discount, and Return Period */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tax (%)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                                value={formData.tax}
                                onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Discount (%)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                                value={formData.discount}
                                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Return Period (days)
                            </label>
                            <input
                                type="number"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="30"
                                value={formData.return_period}
                                onChange={(e) => setFormData({ ...formData, return_period: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Enter product description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditProductModal