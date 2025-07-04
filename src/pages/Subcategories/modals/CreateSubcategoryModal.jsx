import React, { useEffect, useState } from 'react'
import { categoriesAPI } from '../../../api/admin.js'

const CreateSubcategoryModal = ({ isOpen, onClose, onSubmit, category = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        category_id:category?Number(category.id):''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)

    useEffect(() => {
        const fetchCategories = async () => {
            if (!category) {
                try {
                    const response = await categoriesAPI.getCategories()
                    if (response?.data?.success) {
                        setCategories(response.data.data?.categories || [])
                    }
                } catch (err) {
                    console.error("Failed to fetch categories", err)
                }
            }
        }
        fetchCategories()
    }, [])

    const handleCategoryChange = (categoryId) => {
        const cat = categories.find(cat => cat.id === Number(categoryId))
        setSelectedCategory(cat)
        setFormData({...formData,category_id:cat.id})
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            setError('Subcategory name is required')
            return
        }

        setLoading(true)
        setError('')

        try {
            await onSubmit(formData)
            setFormData({ name: '' })
        } catch (err) {
            setError('Failed to create subcategory')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setFormData({ name: '' })
        setError('')
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-6 border-b">
                    <h3 className="text-lg font-semibold">Create New Subcategory</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Parent Category
                        </label>
                        {category ? (<input
                            type="text"
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                            value={category.name || ''}
                        />) : <> <select
                            className="w-full px-4 py-2 border rounded-md"
                            value={selectedCategory?.id || ''}
                            onChange={(e) => handleCategoryChange(e.target?.value)}
                        >
                            <option value="">Select a category...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select></>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subcategory Name *
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter subcategory name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
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
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Subcategory'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateSubcategoryModal
