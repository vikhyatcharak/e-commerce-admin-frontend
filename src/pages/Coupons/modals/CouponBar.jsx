import React from 'react'
import { format, parseISO } from 'date-fns'

const CouponBar = ({ coupon, onEdit, onDelete }) => {
    const formattedFrom = format(parseISO(coupon.valid_from_date), 'MMMM d, yyyy')
    const formattedTo = format(parseISO(coupon.valid_to_date), 'MMMM d, yyyy')
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">{coupon.code}</h3>
                <p className="text-sm text-gray-500">
                    {coupon.description || 'No description'}
                </p>
                <div className="text-xs text-gray-400 mt-1">
                    <span>Flat: ₹{coupon.flat_discount ?? 0}</span>
                    <span className="ml-4">Pct: {coupon.percentage_discount ?? 0}%</span>
                    <span className="ml-4">Qty: {coupon.quantity}</span>
                    <span className="ml-4">Valid: {formattedFrom} – {formattedTo}</span>
                </div>

            </div>
            <div className="flex gap-2">
                <button
                    onClick={onEdit}
                    className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-2 rounded-md transition-colors"
                    title="Edit Category"
                >
                    ✏️
                </button>
                <button
                    onClick={onDelete}
                    className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-md transition-colors"
                    title="Delete Category"
                >
                    🗑️
                </button>
            </div>
        </div>
    )
}

export default CouponBar
