import React, { useState, useEffect } from 'react'
import { ordersAPI } from '../../../api/admin'

const OrderDetailsModal = ({ isOpen, order, onClose }) => {

  const [orderItems, setOrderItems] = useState([])
  const shipmentCreated = !!order?.shipment_id
  const courierAssigned = !!order?.shiprocket_awb || !!order?.courier_company_name || !!order?.courier_company_id


  useEffect(() => {
    if (order?.id) {
      fetchOrderItems(order.id)
    }
  }, [order])

  const fetchOrderItems = async (id) => {
    try {
      const response = await ordersAPI.getOrderItems(id)
      if (response.data?.success) {
        let data = response.data.data
        if (!Array.isArray(data)) {
          data = data ? [data] : []
        }
        setOrderItems(data)
      }
    } catch (error) {
      console.error('Error fetching order items:', error)
      setOrderItems([])
    }
  }
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold">Order Details - #{order?.id}</h3>
            <p className="text-sm text-gray-500">
              Created: {new Date(order?.created_at).toLocaleString()}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Order Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Order ID:</span>
                  <span className="font-medium">#{order?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>User ID:</span>
                  <span className="font-medium">{order?.user_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Mode:</span>
                  <span className="font-medium">{order?.payment_mode || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Coupon Applied:</span>
                  <span className="font-medium">
                    {order?.coupon_id ? `#${order.coupon_id}` : 'None'}
                  </span>
                </div>
              </div>
            </div>
            {/* Financial */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Financial Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">
                    ₹{parseFloat(order?.total || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="font-medium">
                    ₹{parseFloat(order?.tax || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="font-medium text-green-600">
                    -₹{parseFloat(order?.discount || 0).toFixed(2)}
                  </span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Final Total:</span>
                  <span className="text-lg">
                    ₹{parseFloat(order?.final_total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No items found for this order
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-medium text-gray-900">
                          Product Variant ID: {item.product_variant_id}
                        </h5>
                        <div className="text-sm text-gray-500">
                          <span>Quantity: {item.quantity}</span>
                          <span className="ml-4">
                            Unit Price: ₹{parseFloat(item.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ₹{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">Total</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Shipment details */}
          {shipmentCreated && !courierAssigned && (
            <div className="mt-8">
              <h4 className="font-semibold text-gray-900 mb-4">Shipment Created</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Shipment ID:</span>
                  <span className="font-medium">{order?.shipment_id}</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">Courier has not been assigned yet.</p>
              </div>
            </div>
          )}
          {/* courier assigned */}
          {courierAssigned && (
            <div className="mt-8">
              <h4 className="font-semibold text-gray-900 mb-4">Courier Assigned</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Shipment Info</h5>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Shipment ID:</span>
                      <span className="font-medium">{order?.shipment_id || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AWB Code:</span>
                      <span className="font-medium">{order?.shiprocket_awb || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Courier Info</h5>
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Courier Company:</span>
                      <span className="font-medium">{order?.courier_company_name || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Courier ID:</span>
                      <span className="font-medium">{order?.courier_company_id || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default OrderDetailsModal
