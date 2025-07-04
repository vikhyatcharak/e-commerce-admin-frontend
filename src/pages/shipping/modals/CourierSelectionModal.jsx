import React, { useState, useEffect } from 'react'
import { ordersAPI, usersAPI } from '../../../api/admin.js'
import { toast } from 'react-toastify'

const CourierSelectionModal = ({ isOpen, order, onClose, onShipmentCreated }) => {
    const [shippingLocations, setShippingLocations] = useState([])
    const [selectedLocation, setSelectedLocation] = useState('')
    const [availableCouriers, setAvailableCouriers] = useState([])
    const [selectedCourier, setSelectedCourier] = useState('')
    const [userAddress, setUserAddress] = useState(null)
    const [user, setUser] = useState(null)
    const [orderItems, setOrderItems] = useState([])
    const [loading, setLoading] = useState(false)
    const [shipmentId, setShipmentId] = useState(null)

    const [step, setStep] = useState(1) // 1: Select Location, 2: Select Courier

    useEffect(() => {
        if (isOpen) {
            fetchShippingLocations()
        }
    }, [isOpen])

    useEffect(() => {
        if (order?.id) fetchOrderItems(order.id)
        if (order?.user_id) fetchUser(order.user_id)
        if (order?.customer_address_id) fetchUserAddress(order.customer_address_id)
        if (order?.shipment_id) setShipmentId(order.shipment_id)
    }, [order])

    const fetchShippingLocations = async () => {
        try {
            const response = await ordersAPI.getPickupLocations()
            if (response.data.success) {
                setShippingLocations(response.data.data)
                // Auto-select default location
                const defaultLocation = response.data.data.find(loc => loc.is_default)
                if (defaultLocation) {
                    setSelectedLocation(defaultLocation.id)
                }
            }
        } catch (error) {
            console.error('Error fetching shipping locations:', error)
        }
    }

    const fetchUser = async (id) => {
        setLoading(true)
        try {
            const response = await usersAPI.getUserById(id)
            if (response.data?.success && response.data.data) {
                setUser(response.data.data)
            }
        } catch (err) {
            console.error("Error fetching user", err)
        } finally { setLoading(false) }
    }

    const fetchUserAddress = async (id) => {
        const response = await ordersAPI.getCustomerAddressById(id)
        if (response.data.success && response.data.data) {
            setUserAddress(response.data.data)
        }
    }
    const fetchAvailableCouriers = async () => {
        if (!selectedLocation) return

        setLoading(true)
        try {
            const selectedLocationData = shippingLocations.find(loc => loc.id === parseInt(selectedLocation))
            const courierRequest = {
                pickup_location: selectedLocationData.location_name,
                pickup_postcode: selectedLocationData.pincode,
                delivery_postcode: userAddress.pincode || order.pincode,
                weight: 1,
                cod: order.payment_mode === 'cod' ? 1 : 0,
                declared_value: order.final_total
            }

            const response = await ordersAPI.getAvailableCouriers(courierRequest)

            if (response.data.success && response.data.availableCouriers) {
                setAvailableCouriers(response.data.availableCouriers)
                setStep(2)
            } else {
                toast.error('No couriers available for this route')
            }
        } catch (error) {
            console.error('Error fetching couriers:', error)
            toast.error('Failed to fetch available couriers')
        } finally {
            setLoading(false)
        }
    }

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

    const handleCreateShipment = async () => {
        if (!selectedCourier) return

        setLoading(true)
        try {
            const shipmentData = {
                orderId: order.id,
                orderDate: Date.now(),
                customerName: user.name,
                billingAddress: userAddress.address,
                billingCity: userAddress.city,
                billingPincode: userAddress.pincode,
                billingState: userAddress.state,
                billingCountry: userAddress.country,
                email: user.email,
                phone: user.phone,
                items: orderItems,
                paymentMethod: order.payment_mode,
                subTotal: order.final_total,

                dimensions: order.dimensions || {},
                weight: order.weight || '1',
            }

            const response = await ordersAPI.createShipment(shipmentData)

            if (response.data.success) {
                toast.success('Shipment created successfully')
                setShipmentId(response.data.shipmentId)
                setStep(3)
            }
        } catch (error) {
            console.error('Error creating shipment:', error)
            toast.error('Failed to create shipment')
        } finally {
            setLoading(false)
        }
    }
    const handleAssignCourier = async () => {
        if (!shipmentId || !selectedCourier) {
            return toast.error('Create shipment first')
        }

        setLoading(true)

        try {
            const selectedCourierData = availableCouriers.find(c => c.courier_company_id === selectedCourier)

            const response = await ordersAPI.assignCourier({
                shipmentId,
                courierId: selectedCourier,
                orderId: order.id,
                awb_code: selectedCourierData.awb_code || '',
                courier_company_id: selectedCourierData.courier_company_id,
                courier_name: selectedCourierData.courier_name,
                shipping_cost: parseFloat(selectedCourierData.rate),
                estimated_delivery_days: selectedCourierData.estimated_delivery_days
            })

            if (response.data.success) {
                toast.success('Courier assigned successfully!')
                onShipmentCreated?.(response.data.data)
                onClose()
            }
        } catch (error) {
            console.error('Error assigning courier:', error)
            toast.error('Failed to assign courier')
        } finally {
            setLoading(false)
        }
    }


    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h3 className="text-lg font-semibold">Ship Order #{order?.id}</h3>
                        <p className="text-sm text-gray-500">Select pickup location and courier</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                <div className="p-6">
                    {/* Step 1: Pickup Location Selection */}
                    {step === 1 && (
                        <div>
                            <h4 className="text-lg font-medium mb-4">Select Pickup Location</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {shippingLocations.map((location) => (
                                    <div key={location.id}
                                        className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedLocation === location.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                                            }`}
                                        onClick={() => setSelectedLocation(location.id)}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h5 className="font-medium">{location.location_name}</h5>
                                                <p className="text-sm text-gray-600">{location.address}</p>
                                                <p className="text-sm text-gray-500">{location.city}, {location.state} - {location.pincode}</p>
                                            </div>
                                            <input type="radio" name="pickup_location" checked={selectedLocation === location.id} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button onClick={fetchAvailableCouriers} disabled={!selectedLocation || loading || shipmentId}
                                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                                    {loading ? 'Loading Couriers...' : 'Next: Select Courier'}
                                </button>
                                {shipmentId && <>
                                    <button onClick={() => setStep(2)} disabled={!selectedLocation || loading}
                                        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                                        {loading ? '' : 'Next'}
                                    </button>
                                </>}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Courier Selection */}
                    {step === 2 && (
                        <div>
                            <h4 className="text-lg font-medium mb-4">Available Couriers for {shippingLocations.find(loc => loc.id === selectedLocation)?.location_name}</h4>
                            <div className="space-y-3">
                                {availableCouriers.map((courier) => {
                                    const finalAmount = parseFloat(courier.rate || 0) + parseFloat(courier.cod_charges || 0) + parseFloat(courier.coverage_charges || 0) + parseFloat(courier.other_charges || 0) + parseFloat(courier.entry_tax || 0)
                                    return (
                                        <div
                                            key={courier.courier_company_id}
                                            className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedCourier === courier.courier_company_id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                                            onClick={() => setSelectedCourier(courier.courier_company_id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    {/* Courier Name & Charges */}
                                                    <div className="flex items-center gap-3">
                                                        <h5 className="font-medium text-lg">{courier.courier_name}</h5>
                                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                            Base: ₹{courier.rate}
                                                        </span>
                                                        {courier.cod_charges > 0 && (
                                                            <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                                                COD: ₹{courier.cod_charges}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Detail Grid */}
                                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm text-gray-700">
                                                        <div>
                                                            <span className="font-medium">Delivery:</span>{' '}
                                                            {courier.estimated_delivery_days} days
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">ETD:</span>{' '}
                                                            {courier.etd || 'N/A'}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Tracking:</span>{' '}
                                                            ⭐ {courier.tracking_performance || '-'} / 5
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Pickup:</span>{' '}
                                                            🚚 {courier.pickup_performance || '-'} / 5
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Delivery Rating:</span>{' '}
                                                            ✅ {courier.delivery_performance || '-'} / 5
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">RTO Charges:</span>{' '}
                                                            ₹{courier.rto_charges || 0}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-green-700">Total Payable:</span>{' '}
                                                            ₹{finalAmount.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Radio Selector */}
                                                <input
                                                    type="radio"
                                                    name="courier"
                                                    checked={selectedCourier === courier.courier_company_id}
                                                    readOnly
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={() => setStep(1)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md">
                                    Back
                                </button>
                                <button onClick={handleCreateShipment} disabled={!selectedCourier || loading || shipmentId}
                                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                                    {loading ? 'Creating Shipment...' : 'Create Shipment'}
                                </button>
                                {selectedCourier && <>
                                    <button onClick={() => setStep(3)} disabled={!selectedCourier || loading}
                                        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                                        {loading ? '' : 'Next'}
                                    </button>
                                </>}
                            </div>
                        </div>
                    )}
                    {/* Step 3: Assign Courier */}
                    {step === 3 && (
                        <div>
                            <h4 className="text-lg font-medium mb-4">Assign Courier {availableCouriers.find(c => c.courier_company_id === selectedCourier)?.courier_name}</h4>
                            <div className="mt-6 flex justify-end gap-3">
                                <button onClick={() => setStep(2)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md">
                                    Back
                                </button>
                                <button onClick={handleAssignCourier} disabled={!shipmentId || !selectedCourier || loading}
                                    className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50">
                                    {loading ? 'Assigning Courier...' : 'Assign Courier'}
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Step 4: Generate Pickup */}
                    
                </div>
            </div>
        </div>
    )
}

export default CourierSelectionModal
