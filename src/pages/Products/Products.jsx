import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { productsAPI, categoriesAPI } from '../../api/admin.js'
import ProductBar from './modals/ProductBar.jsx'
import CreateProductModal from './modals/CreateProductModal.jsx'
import EditProductModal from './modals/EditProductModal.jsx'
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal.jsx'

const Products = () => {
    const location = useLocation()
    const navigate = useNavigate()

    let category
    if (location.state?.category) category = location.state?.category

    let subcategory
    if (location.state?.subcategory) subcategory = location.state?.subcategory

    const [categories, setCategories] = useState([])
    const [subcategories, setSubcategories] = useState([])
    const [formData, setFormData] = useState({
        category_id: category?category.id:"",
        subcategory_id: subcategory?subcategory.id:"",
    })

    const [products, setProducts] = useState([])
    const [totalProducts, setTotalProducts] = useState(0)
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [hoveredProduct, setHoveredProduct] = useState(null)

    const [currentPage, setCurrentPage] = useState(1)
    const productsPerPage = 5
    const [searchQuery, setSearchQuery] = useState('')
    const [sortOption, setSortOption] = useState('created_at-desc')
    const [searchInput, setSearchInput] = useState('')


    useEffect(() => {
        const fetchCategories = async () => {
            const res = await categoriesAPI.getCategories()
            if (res.data?.success) setCategories(res.data.data?.categories)
        }
        fetchCategories()
    }, [])

    useEffect(() => {
        const fetchSubcategories = async () => {
            if (formData.category_id) {
                const res = await categoriesAPI.getSubcategoriesByCategoryId(formData.category_id)
                if (res.data?.success) setSubcategories(res.data.data?.subcategories)
            } else {
                setSubcategories([])
            }
        }
        fetchSubcategories()
    }, [category?.id, formData.category_id])

    useEffect(() => {
        fetchProducts()
    }, [formData.category_id, formData.subcategory_id, currentPage, sortOption, searchQuery])

    useEffect(() => {
        setCurrentPage(1)
    }, [sortOption])


    useEffect(() => {
        if ((category || subcategory) && !formData.category_id) {
            const categoryFromLocation = category?.id || subcategory?.category_id
            if (categoryFromLocation) {
                setFormData((prev) => ({ ...prev, category_id: categoryFromLocation }))
            }
        }
    }, [category, subcategory, formData.category_id])

    useEffect(() => {
        if (subcategory && !formData.subcategory_id) {
            const subcategoryFromLocation = subcategory?.category_id
            if (subcategoryFromLocation) {
                setFormData((prev) => ({ ...prev, subcategory_id: subcategoryFromLocation }))
            }
        }
    }, [category, subcategory, formData.category_id, formData.subcategory_id])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const filters = {
                page: currentPage,
                limit: productsPerPage,
                search: searchQuery,
                sortBy: sortOption.split('-')[0],
                sortOrder: sortOption.split('-')[1].toUpperCase(),
            }
            const catId = formData.category_id || null
            const subcatId = formData.subcategory_id || null
            if (catId) filters.category_id = Number(catId)
            if (subcatId) filters.subcategory_id = Number(subcatId)
            const response = await productsAPI.getPaginatedProducts(filters)

            if (response.data?.success) {
                const { data, total } = response.data.data
                setProducts(data)
                setTotalProducts(total)
            }
        } catch (err) {
            console.error('Error fetching products:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateProduct = async (productData) => {
        const res = await productsAPI.createProduct(productData)
        if (res.data?.success) {
            setShowCreateModal(false)
            fetchProducts()
        }
    }

    const handleUpdateProduct = async (productData) => {
        const res = await productsAPI.updateProduct({ id: selectedProduct.id, ...productData })
        if (res.data?.success) {
            setShowEditModal(false)
            setSelectedProduct(null)
            fetchProducts()
        }
    }

    const handleDeleteProduct = async () => {
        const res = await productsAPI.deleteProduct(selectedProduct.id)
        if (res.data?.success) {
            setShowDeleteModal(false)
            setSelectedProduct(null)
            fetchProducts()
        }
    }

    const handleViewVariants = (product) => {
        navigate(`/admin/products/${product.id}/variants`, {
            state: { product, category, subcategory },
        })
    }

    const totalPages = Math.ceil(totalProducts / productsPerPage)

    return (
        <>
            {!loading && (
                <div>
                    <div className="px-4 py-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                        <select
                            className="w-full px-3 py-2 border rounded-md"
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value, subcategory_id: '' })}
                        >
                            <option value="">Select a category...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="px-4 py-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory *</label>
                        <select
                            className="w-full px-3 py-2 border rounded-md disabled:text-gray-500"
                            disabled={!formData.category_id}
                            value={formData.subcategory_id}
                            onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })}
                        >
                            <option value="">Select a subcategory...</option>
                            {subcategories.map((sub) => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="px-6 py-4">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold">Products</h1>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                            >
                                ➕ Add Product
                            </button>
                        </div>




                        {loading ? (
                            <div className="text-center py-12">Loading...</div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12">No products found.</div>
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
                            <div className="space-y-3">
                                {products.map((product) => (
                                    <ProductBar
                                        key={product.id}
                                        product={product}
                                        isHovered={hoveredProduct === product.id}
                                        onMouseEnter={() => setHoveredProduct(product.id)}
                                        onMouseLeave={() => setHoveredProduct(null)}
                                        onClick={() => handleViewVariants(product)}
                                        onEdit={() => {
                                            setSelectedProduct(product)
                                            setShowEditModal(true)
                                        }}
                                        onDelete={() => {
                                            setSelectedProduct(product)
                                            setShowDeleteModal(true)
                                        }}
                                        onViewVariants={() => handleViewVariants(product)}
                                    />
                                ))}
                            </div>
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

                        <CreateProductModal
                            isOpen={showCreateModal}
                            onClose={() => setShowCreateModal(false)}
                            onSubmit={handleCreateProduct}
                            category_id={formData.category_id || category?.id}
                            subcategory_id={formData.subcategory_id || subcategory?.id}
                        />

                        <EditProductModal
                            isOpen={showEditModal}
                            product={selectedProduct}
                            onClose={() => {
                                setShowEditModal(false)
                                setSelectedProduct(null)
                            }}
                            onSubmit={handleUpdateProduct}
                        />

                        <DeleteConfirmModal
                            isOpen={showDeleteModal}
                            title="Delete Product"
                            message={`Are you sure you want to delete "${selectedProduct?.name}"?`}
                            onConfirm={handleDeleteProduct}
                            onCancel={() => {
                                setShowDeleteModal(false)
                                setSelectedProduct(null)
                            }}
                        />
                    </div>
                </div>)}
        </>
    )
}

export default Products
