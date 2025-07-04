import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { categoriesAPI } from '../../api/admin.js'
import CategoryBar from './modals/CategoryBar.jsx'
import CreateCategoryModal from './modals/CreateCategoryModal.jsx'
import EditCategoryModal from './modals/EditCategoryModal.jsx'
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal.jsx'

const Categories = () => {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [hoveredCategory, setHoveredCategory] = useState(null)

    const [totalCategories, setTotalCategories] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const CategoriesPerPage = 5
    const [searchQuery, setSearchQuery] = useState('')
    const [sortOption, setSortOption] = useState('created_at-desc')
    const [searchInput, setSearchInput] = useState('')

    useEffect(() => {
        fetchCategories()
    }, [sortOption, currentPage, searchQuery])

    const fetchCategories = async () => {
        setLoading(true)
        try {
            const filters = {
                page: currentPage,
                limit: CategoriesPerPage,
                search: searchQuery,
                sortBy: sortOption.split('-')[0],
                sortOrder: sortOption.split('-')[1].toUpperCase(),
            }
            const response = await categoriesAPI.getPaginatedCategories(filters)

            if (response.data?.success) {
                const { data, total } = response.data?.data
                setCategories(data)
                setTotalCategories(total)
            }
        } catch (err) {
            console.error('Error fetching Categories:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateCategory = async (categoryData) => {
        try {
            const response = await categoriesAPI.createCategory(categoryData)
            if (response.data?.success) {
                fetchCategories()
                setShowCreateModal(false)
            }
        } catch (error) {
            console.error('Error creating category:', error)
        }
    }

    const handleUpdateCategory = async (categoryData) => {
        try {
            const response = await categoriesAPI.updateCategory({ id: selectedCategory.id, ...categoryData })
            if (response.data?.success) {
                fetchCategories()
                setShowEditModal(false)
                setSelectedCategory(null)
            }
        } catch (error) {
            console.error('Error updating category:', error.response?.data?.message)
        }
    }

    const handleDeleteCategory = async () => {
        try {
            const response = await categoriesAPI.deleteCategory(selectedCategory.id)
            if (response.data?.success) {
                fetchCategories()
                setShowDeleteModal(false)
                setSelectedCategory(null)
            }
        } catch (error) {
            console.error('Error deleting category:', error)
        }
    }

    const handleViewSubcategories = (category) => {
        navigate(`/admin/subcategories`, {
            state: { category }
        })
    }

    const handleViewProducts = (category) => {
        navigate(`/admin/products`, {
            state: { category }
        })
    }

    const totalPages = Math.ceil(totalCategories / CategoriesPerPage)

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-600 mt-1">Manage your product categories</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <span className="text-xl">➕</span>
                    Add New Category
                </button>
            </div>

            {/* Categories List */}
            <div className="space-y-3">
                {categories.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📂</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
                        <p className="text-gray-500">Create your first category to get started</p>
                    </div>
                ) : (<>
                    <div className="flex justify-between items-center gap-4 mb-4">
                        <div className='flex gap-1 w-full'>
                            <input
                                type="text"
                                placeholder="Search..."
                                className="border px-3 py-2 rounded-md w-full sm:w-auto flex-1"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setCurrentPage(1)
                                        setSearchQuery(searchInput)
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    setCurrentPage(1)
                                    setSearchQuery(searchInput)
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 cursor-pointer"
                            >
                                🔍
                            </button>
                        </div>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="border px-3 py-2 rounded-md"
                        >
                            <option value="name-asc">Name A-Z</option>
                            <option value="name-desc">Name Z-A</option>
                            <option value="created_at-desc">Newest</option>
                            <option value="created_at-asc">Oldest</option>
                        </select>
                    </div>
                    {categories.map((category) => (
                        <CategoryBar
                            key={category.id}
                            category={category}
                            isHovered={hoveredCategory === category.id}
                            onMouseEnter={() => setHoveredCategory(category.id)}
                            onMouseLeave={() => setHoveredCategory(null)}
                            onEdit={() => {
                                setSelectedCategory(category)
                                setShowEditModal(true)
                            }}
                            onDelete={() => {
                                setSelectedCategory(category)
                                setShowDeleteModal(true)
                            }}
                            onViewSubcategories={() => handleViewSubcategories(category)}
                            onViewProducts={() => handleViewProducts(category)}
                        />
                    ))}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                            {[...Array(totalPages)].map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentPage(idx + 1)}
                                    className={`px-4 py-2 border rounded ${currentPage === idx + 1 ? 'bg-blue-600 text-white' : ''}`}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </>
                )}
            </div>

            {/* Modals */}
            <CreateCategoryModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateCategory}
            />

            <EditCategoryModal
                isOpen={showEditModal}
                category={selectedCategory}
                onClose={() => setShowEditModal(false)}
                onSubmit={handleUpdateCategory}
            />

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                title="Delete Category"
                message={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
                onConfirm={handleDeleteCategory}
                onCancel={() => setShowDeleteModal(false)}
            />
        </div>
    )
}

export default Categories
