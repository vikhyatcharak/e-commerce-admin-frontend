import React, { useState } from 'react'
import { couponsAPI } from '../../../api/admin.js'

const CreateCouponModal = ({ isOpen, onClose, onSubmit }) => {
    const [form, setForm] = useState({
        code: '', description: '',
        discountType: 'flat',
        discountValue: '',
        quantity: '', valid_from_date: '', valid_to_date: '',
        start_time: '', end_time: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

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

        const payload = {
            code: form.code,
            description: form.description,
            quantity: form.quantity,
            valid_from_date: form.valid_from_date,
            valid_to_date: form.valid_to_date,
            start_time: form.start_time,
            end_time: form.end_time,
            flat_discount: form.discountType === 'flat' ? value : null,
            percentage_discount: form.discountType === 'percentage' ? value : null
        }

        try {
            await couponsAPI.createCoupon(payload)
            onSubmit()
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create coupon')
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
                        <h3 className="text-lg font-semibold">Create Coupon</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Code *</label>
                            <input type="text" required className="w-full border px-3 py-2 rounded"
                                value={form.code}
                                onChange={e => setForm({ ...form, code: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <input type="text" className="w-full border px-3 py-2 rounded"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Discount Type *</label>
                            <select className="w-full border px-3 py-2 rounded"
                                value={form.discountType}
                                onChange={e => setForm({ ...form, discountType: e.target.value, discountValue: '' })}>
                                <option value="flat">Flat</option>
                                <option value="percentage">Percentage</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Discount Value *</label>
                            <input type="number" className="w-full border px-3 py-2 rounded" min="1"
                                value={form.discountValue}
                                onChange={e => setForm({ ...form, discountValue: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                            <input type="number" required min="1" className="w-full border px-3 py-2 rounded"
                                value={form.quantity}
                                onChange={e => setForm({ ...form, quantity: e.target.value })} />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">Valid From *</label>
                                <input type="date" required className="w-full border px-3 py-2 rounded"
                                    value={form.valid_from_date}
                                    onChange={e => setForm({ ...form, valid_from_date: e.target.value })} />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">Valid To *</label>
                                <input type="date" required className="w-full border px-3 py-2 rounded"
                                    value={form.valid_to_date}
                                    onChange={e => setForm({ ...form, valid_to_date: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                                <input type="time" className="w-full border px-3 py-2 rounded"
                                    value={form.start_time}
                                    onChange={e => setForm({ ...form, start_time: e.target.value })} />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700">End Time</label>
                                <input type="time" className="w-full border px-3 py-2 rounded"
                                    value={form.end_time}
                                    onChange={e => setForm({ ...form, end_time: e.target.value })} />
                            </div>
                        </div>

                        {error && <div className="text-red-600 text-sm">{error}</div>}

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">Cancel</button>
                            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">
                                {loading ? 'Creating…' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateCouponModal
