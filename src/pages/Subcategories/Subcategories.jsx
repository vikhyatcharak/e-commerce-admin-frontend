import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { categoriesAPI, subcategoriesAPI } from '../../api/admin.js'
import SubcategoryBar from './modals/SubcategoryBar.jsx'
import CreateSubcategoryModal from './modals/CreateSubcategoryModal.jsx'
import EditSubcategoryModal from './modals/EditSubcategoryModal.jsx'
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal.jsx'

const Subcategories = () => {
    const location = useLocation()
    const navigate = useNavigate()

    const [subcategories, setSubcategories] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedSubcategory, setSelectedSubcategory] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState(null)

    const [totalSubcategories, setTotalSubcategories] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const subcategoriesPerPage = 5
    const [searchQuery, setSearchQuery] = useState('')
    const [sortOption, setSortOption] = useState('created_at-desc')
    const [searchInput, setSearchInput] = useState('')

    useEffect(() => {
        const initialize = async () => {
            setLoading(true)

            if (location.state?.category) {
                const category = location.state?.category
                setSelectedCategory(category)
                await fetchSubcategories(category.id)
            } else {
                await fetchCategories()
                await fetchSubcategories()
            }

            setLoading(false)
        }

        initialize()
    }, [])

    useEffect(() => {
        fetchSubcategories(selectedCategory?.id || null)
    }, [sortOption, currentPage, searchQuery, selectedCategory])

    useEffect(() => {
        setCurrentPage(1)
    }, [sortOption])


    const fetchSubcategories = async (categoryId = null) => {
        setLoading(true)
        try {
            const filters = {
                page: currentPage,
                limit: subcategoriesPerPage,
                search: searchQuery,
                sortBy: sortOption.split('-')[0],
                sortOrder: sortOption.split('-')[1].toUpperCase(),
            }
            if (categoryId) filters.category_id = Number(categoryId)
            const response = await subcategoriesAPI.getPaginatedSubcategories(filters)

            if (response.data?.success) {
                const { data, total } = response.data?.data
                setSubcategories(data)
                setTotalSubcategories(total)
            }
        } catch (err) {
            console.error('Error fetching subcategories:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getCategories()
            if (response.data?.success) {
                setCategories(response.data.data?.categories)
            }
        } catch (err) {
            console.error(`error fetching categories:`, err)
        } finally {
            setLoading(false)
        }
    }

    const handleCategoryChange = async (categoryId) => {
        try {
            setLoading(true)
            const response = await categoriesAPI.getCategoryById(categoryId)
            if (response.data?.success) {
                const category = response.data.data?.category
                setSelectedCategory(category)
                await fetchSubcategories(category.id)
            }
        } catch (err) {
            console.error(`error fetching selected category:`, err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateSubcategory = async (subcategoryData) => {
        try {
            const response = await subcategoriesAPI.createSubcategory({ ...subcategoryData })
            if (response.data?.success) {
                await fetchSubcategories(selectedCategory?.id || null)
                setShowCreateModal(false)
            }
        } catch (error) {
            console.error('Error creating subcategory:', error.response?.data?.message)
        }
    }

    const handleViewProducts = (subcategory) => {
        navigate(`/admin/products`, {
            state: { category: selectedCategory, subcategory }
        })
    }

    const handleUpdateSubcategory = async (subcategoryData) => {
        try {
            const response = await subcategoriesAPI.updateSubcategory({ id: selectedSubcategory.id, ...subcategoryData })
            if (response.data?.success) {
                await fetchSubcategories(selectedCategory?.id || null)
                setShowEditModal(false)
                setSelectedSubcategory(null)
            }
        } catch (error) {
            console.error('Error updating subcategory:', error)
        }
    }

    const handleDeleteSubcategory = async () => {
        try {
            const response = await subcategoriesAPI.deleteSubcategory(selectedSubcategory.id)
            if (response.data?.success) {
                await fetchSubcategories(selectedCategory?.id || null)
                setShowDeleteModal(false)
                setSelectedSubcategory(null)
            }
        } catch (error) {
            console.error('Error deleting subcategory:', error)
        }
    }

    const totalPages = Math.ceil(totalSubcategories / subcategoriesPerPage)


    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <>
            {!loading && (
                <>
                        <div className="px-4 py-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                            <select
                                className="w-full px-4 py-2 border rounded-md"
                                value={selectedCategory?.id || ''}
                                onChange={(e) => handleCategoryChange(e.target?.value)}
                            >
                                <option value="">Select a category...</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    <div className="px-6 py-4">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 mb-4 text-sm">
                            <button
                                onClick={() => navigate('/admin/categories')}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                Categories
                            </button>
                            <span className="text-gray-400">›</span>
                            <span className="text-gray-900">{selectedCategory?.name}</span>
                        </nav>

                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {selectedCategory?.name} - Subcategories
                                </h1>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <span className="text-xl">➕</span>
                                Add Subcategory
                            </button>
                        </div>

                        {/* Subcategories List */}

                        <div className="space-y-3">
                            {subcategories.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 text-6xl mb-4">📁</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No subcategories found</h3>
                                    <p className="text-gray-500">Create your first subcategory for this category</p>
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
                                {subcategories.map((subcategory) => (
                                    <SubcategoryBar
                                        key={subcategory.id}
                                        subcategory={subcategory}
                                        category={selectedCategory || null}
                                        onEdit={() => {
                                            setSelectedSubcategory(subcategory)
                                            setShowEditModal(true)
                                        }}
                                        onDelete={() => {
                                            setSelectedSubcategory(subcategory)
                                            setShowDeleteModal(true)
                                        }}
                                        onViewProducts={() => handleViewProducts(subcategory)}
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
                            </>)}

                            {/* Modals */}
                            <CreateSubcategoryModal
                                isOpen={showCreateModal}
                                onClose={() => setShowCreateModal(false)}
                                onSubmit={handleCreateSubcategory}
                                category={selectedCategory || null}
                            />

                            <EditSubcategoryModal
                                isOpen={showEditModal}
                                subcategory={selectedSubcategory}
                                onClose={() => setShowEditModal(false)}
                                onSubmit={handleUpdateSubcategory}
                            />

                            <DeleteConfirmModal
                                isOpen={showDeleteModal}
                                title="Delete Subcategory"
                                message={`Are you sure you want to delete "${selectedSubcategory?.name}"?`}
                                onConfirm={handleDeleteSubcategory}
                                onCancel={() => setShowDeleteModal(false)}
                            />
                        </div>
                    </div>
                </>)}
        </>)
}
export default Subcategories
