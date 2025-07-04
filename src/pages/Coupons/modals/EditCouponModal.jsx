import React, { useState, useEffect } from 'react'
import { couponsAPI } from '../../../api/admin.js'

const EditCouponModal = ({ isOpen, coupon, onClose, onSubmit }) => {
    const [form, setForm] = useState({
        code: '',
        description: '',
        discountType: 'flat',
        discountValue: '',
        quantity: '',
        valid_from_date: '',
        valid_to_date: '',
        start_time: '',
        end_time: ''
    })

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Initialize form with existing coupon data
    useEffect(() => {
        if (coupon) {
            const isFlat = coupon.flat_discount !== null
            setForm({
                code: coupon.code || '',
                description: coupon.description || '',
                discountType: isFlat ? 'flat' : 'percentage',
                discountValue: isFlat ? coupon.flat_discount : coupon.percentage_discount || '',
                quantity: coupon.quantity ?? '',
                valid_from_date: coupon.valid_from_date || '',
                valid_to_date: coupon.valid_to_date || '',
                start_time: coupon.start_time || '',
                end_time: coupon.end_time || ''
            })
        }
    }, [coupon])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const value = Number(form.discountValue)
        if (isNaN(value) || value <= 0) {
            setError('Discount must be a positive number')
            setLoading(false)
            return
        }

        if (form.discountType === 'percentage' && value > 100) {
            setError('Percentage discount cannot exceed 100')
            setLoading(false)
            return
        }

        if (new Date(form.valid_from_date) > new Date(form.valid_to_date)) {
            setError('Valid from date cannot be after valid to date')
            setLoading(false)
            return
        }

        try {
            const payload = {
                id: coupon.id,
                code: form.code.trim(),
                description: form.description.trim(),
                flat_discount: form.discountType === 'flat' ? value : null,
                percentage_discount: form.discountType === 'percentage' ? value : null,
                quantity: Number(form.quantity),
                valid_from_date: form.valid_from_date,
                valid_to_date: form.valid_to_date,
                start_time: form.start_time || null,
                end_time: form.end_time || null
            }

            await couponsAPI.updateCoupon(payload)
            onSubmit()
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update coupon')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg rounded-lg overflow-hidden">
                <div className="max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between p-6 border-b">
                        <h3 className="text-lg font-semibold">Edit Coupon</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Coupon Code */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Code *</label>
                            <input
                                type="text"
                                required
                                value={form.code}
                                onChange={e => setForm({ ...form, code: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Description</label>
                            <input
                                type="text"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>

                        {/* Discount Type and Value */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Discount Type *</label>
                            <select
                                value={form.discountType}
                                onChange={e => setForm({ ...form, discountType: e.target.value, discountValue: '' })}
                                className="w-full px-3 py-2 border rounded-md"
                            >
                                <option value="flat">Flat</option>
                                <option value="percentage">Percentage</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Discount Value *</label>
                            <input
                                type="number"
                                min="1"
                                value={form.discountValue}
                                onChange={e => setForm({ ...form, discountValue: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Quantity *</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={form.quantity}
                                onChange={e => setForm({ ...form, quantity: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                            />
                        </div>

                        {/* Dates */}
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700">Valid From *</label>
                                <input
                                    type="date"
                                    required
                                    value={form.valid_from_date}
                                    onChange={e => setForm({ ...form, valid_from_date: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700">Valid To *</label>
                                <input
                                    type="date"
                                    required
                                    value={form.valid_to_date}
                                    onChange={e => setForm({ ...form, valid_to_date: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                        </div>

                        {/* Times */}
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700">Start Time</label>
                                <input
                                    type="time"
                                    value={form.start_time}
                                    onChange={e => setForm({ ...form, start_time: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700">End Time</label>
                                <input
                                    type="time"
                                    value={form.end_time}
                                    onChange={e => setForm({ ...form, end_time: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                        </div>

                        {error && <div className="text-red-600 text-sm">{error}</div>}

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 text-white rounded"
                            >
                                {loading ? 'Updating…' : 'Update'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default EditCouponModal
