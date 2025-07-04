import React, { useState, useEffect } from 'react'
import { couponsAPI } from '../../api/admin.js'
import CouponBar from './modals/CouponBar.jsx'
import CreateCouponModal from './modals/CreateCouponModal.jsx'
import EditCouponModal from './modals/EditCouponModal.jsx'
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal.jsx'

const Coupons = () => {
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedCoupon, setSelectedCoupon] = useState(null)

    const [totalCoupons, setTotalCoupons] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const CouponsPerPage = 5
    const [searchQuery, setSearchQuery] = useState('')
    const [sortOption, setSortOption] = useState('created_at-desc')
    const [searchInput, setSearchInput] = useState('')


    useEffect(() => {
        fetchCoupons()
    }, [sortOption, currentPage, searchQuery])

    const fetchCoupons = async () => {
        setLoading(true)
        try {
            const filters = {
                page: currentPage,
                limit: CouponsPerPage,
                search: searchQuery,
                sortBy: sortOption.split('-')[0],
                sortOrder: sortOption.split('-')[1].toUpperCase(),
            }
            const response = await couponsAPI.getPaginatedCoupons(filters)

            if (response.data?.success) {
                const { data, total } = response.data?.data
                setCoupons(data)
                setTotalCoupons(total)
            }
        } catch (err) {
            console.error('Error fetching Coupons:', err)
        } finally {
            setLoading(false)
        }
    }

    const totalPages = Math.ceil(totalCoupons / CouponsPerPage)

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        )
    }


    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Coupons Management</h1>
                    <p className="text-gray-600 mt-1">View, create, edit, or delete coupons</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                >
                    ➕ Add Coupon
                </button>
            </div>

            {/* Coupons List */}
            <div className="space-y-3">
                {coupons.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🎟️</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons found</h3>
                        <p className="text-gray-500">Create your first coupon</p>
                    </div>
                ) : (
                    <>
                        {/* Filter/Search/Sort */}
                        <div className="flex justify-between items-center gap-4 mb-4">
                            <div className="flex gap-1 w-full">
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
                                <option value="code-asc">Code A-Z</option>
                                <option value="code-desc">Code Z-A</option>
                                <option value="flat_discount-asc">Flat Discount Low-High</option>
                                <option value="flat_discount-desc">Flat Discount High-Low </option>
                                <option value="percentage_discount-asc">Percentage Discount Low-High</option>
                                <option value="percentage_discount-desc">Percentage Discount High-Low</option>
                                <option value="quantity-asc">Quantity Low-High</option>
                                <option value="quantity-desc">Quantity High-Low</option>
                                <option value="created_at-desc">Newest</option>
                                <option value="created_at-asc">Oldest</option>
                            </select>
                        </div>

                        {/* Coupon Bars */}
                        {coupons.map(coupon => (
                            <CouponBar
                                key={coupon.id}
                                coupon={coupon}
                                onEdit={() => {
                                    setSelectedCoupon(coupon)
                                    setShowEditModal(true)
                                }}
                                onDelete={() => {
                                    setSelectedCoupon(coupon)
                                    setShowDeleteModal(true)
                                }}
                            />
                        ))}

                        {/* Pagination */}
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
            <CreateCouponModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={fetchCoupons}
            />

            <EditCouponModal
                isOpen={showEditModal}
                coupon={selectedCoupon}
                onClose={() => {
                    setShowEditModal(false)
                    setSelectedCoupon(null)
                }}
                onSubmit={fetchCoupons}
            />

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                title="Delete Coupon"
                message={`Are you sure you want to delete coupon "${selectedCoupon?.code}"?`}
                onConfirm={async () => {
                    await couponsAPI.deleteCoup(selectedCoupon.id)
                    fetchCoupons()
                    setShowDeleteModal(false)
                    setSelectedCoupon(null)
                }}
                onCancel={() => {
                    setShowDeleteModal(false)
                    setSelectedCoupon(null)
                }}
            />
        </div>
    )
}

export default Coupons
