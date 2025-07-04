import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { productVariantsAPI } from '../../../api/admin.js'
import VariantBar from './modals/VariantBar.jsx'
import CreateVariantModal from './modals/CreateVariantModal.jsx'
import EditVariantModal from './modals/EditVariantModal.jsx'
import DeleteConfirmModal from '../../../components/common/DeleteConfirmModal.jsx'

const ProductVariants = () => {
    const { productId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const { product } = location.state || {}

    const [variants, setVariants] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedVariant, setSelectedVariant] = useState(null)

    const [searchQuery, setSearchQuery] = useState('')
    const [sortOption, setSortOption] = useState('created_at-desc')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalVariants, setTotalVariants] = useState(0)
    const [searchInput, setSearchInput] = useState('')

    const variantsPerPage = 5

    useEffect(() => {
        if (productId) {
            fetchVariants()
        }
    }, [productId, sortOption, currentPage, searchQuery])

    useEffect(() => {
        setCurrentPage(1)
    }, [sortOption])

    const fetchVariants = async () => {
        setLoading(true)
        try {
            const response = await productVariantsAPI.getPaginatedVariants({
                params: {
                    product_id: productId,
                    page: currentPage,
                    limit: variantsPerPage,
                    search: searchQuery,
                    sortBy: sortOption.split('-')[0],
                    sortOrder: sortOption.split('-')[1].toUpperCase(),
                },
            })

            if (response.data?.success) {
                const { data, total } = response.data.data
                setVariants(data)
                setTotalVariants(total)
            }
        } catch (error) {
            console.error('Error fetching variants:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateVariant = async (variantData) => {
        try {
            const response = await productVariantsAPI.createVariant({
                product_id: productId,
                ...variantData,
            })
            if (response.data?.success) {
                fetchVariants()
                setShowCreateModal(false)
            }
        } catch (error) {
            console.error('Error creating variant:', error)
        }
    }

    const handleUpdateVariant = async (variantData) => {
        try {
            const response = await productVariantsAPI.updateVariant({
                id: selectedVariant.id,
                ...variantData,
            })
            if (response.data.success) {
                fetchVariants()
                setShowEditModal(false)
                setSelectedVariant(null)
            }
        } catch (error) {
            console.error('Error updating variant:', error)
        }
    }

    const handleDeleteVariant = async () => {
        try {
            const response = await productVariantsAPI.deleteVariant(selectedVariant.id)
            if (response.data?.success) {
                fetchVariants()
                setShowDeleteModal(false)
                setSelectedVariant(null)
            }
        } catch (error) {
            console.error('Error deleting variant:', error)
        }
    }

    const totalPages = Math.ceil(totalVariants / variantsPerPage)

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 mb-4 text-sm">
                <button onClick={() => navigate('/admin/products')} className="text-blue-600 hover:text-blue-800">
                    Products
                </button>
                <span className="text-gray-400">›</span>
                <span className="text-gray-900">{product?.name || 'Product'}</span>
                <span className="text-gray-400">›</span>
                <span className="text-gray-900">Variants</span>
            </nav>

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Product Variants - {product?.name}</h1>
                    <div className="text-gray-600 mt-1">
                        <span>Product ID: {productId}</span>
                        {product?.sku && <span className="ml-4">SKU: {product.sku}</span>}
                    </div>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <span className="text-xl">➕</span>
                    Add Variant
                </button>
            </div>

            {/* Filter & Sort Controls */}
            <div className="flex gap-4 mb-6">
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
                    <option value="variant_name-asc">Name A-Z</option>
                    <option value="variant_name-desc">Name Z-A</option>
                    <option value="price-asc">Price Low-High</option>
                    <option value="price-desc">Price High-Low</option>
                    <option value="stock-asc">Stock Low-High</option>
                    <option value="stock-desc">Stock High-Low</option>
                    <option value="created_at-desc">Newest</option>
                    <option value="created_at-asc">Oldest</option>
                </select>
            </div>

            {/* Variants List */}
            <div className="space-y-3">
                {variants.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">⚡</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No variants found</h3>
                        <p className="text-gray-500">Create your first product variant</p>
                    </div>
                ) : (
                    variants.map((variant) => (
                        <VariantBar
                            key={variant.id}
                            variant={variant}
                            onEdit={() => {
                                setSelectedVariant(variant)
                                setShowEditModal(true)
                            }}
                            onDelete={() => {
                                setSelectedVariant(variant)
                                setShowDeleteModal(true)
                            }}
                            onUpdate={fetchVariants}
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {[...Array(totalPages)].map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentPage(idx + 1)}
                            className={`px-4 py-2 border rounded ${currentPage === idx + 1 ? 'bg-indigo-600 text-white' : ''}`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Modals */}
            <CreateVariantModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateVariant}
                productName={product?.name}
            />

            <EditVariantModal
                isOpen={showEditModal}
                variant={selectedVariant}
                onClose={() => {
                    setShowEditModal(false)
                    setSelectedVariant(null)
                }}
                onSubmit={handleUpdateVariant}
            />

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                title="Delete Variant"
                message={`Are you sure you want to delete "${selectedVariant?.variant_name}"?`}
                onConfirm={handleDeleteVariant}
                onCancel={() => setShowDeleteModal(false)}
            />
        </div>
    )
}

export default ProductVariants
