import React, { useState, useEffect } from 'react'
import { ordersAPI } from '../../../api/admin.js'
import { toast } from 'react-toastify'

const ShippingLocationModal = ({ isOpen, onClose, onLocationCreated, onEditLocation, editLocation = null }) => {
    const [formData, setFormData] = useState({
        location_name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        contact_person: '',
        phone: '',
        email: '',
        is_default: false
    })
    const [locations, setLocations] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [originalLocationName, setOriginalLocationName] = useState('')
    const [activeTab, setActiveTab] = useState('create') // 'create' or 'manage'

    useEffect(() => {
        if (isOpen) {
            fetchLocations()
            // if (editLocation) {
            //     setFormData({
            //         location_name: editLocation.location_name || '',
            //         address: editLocation.address || '',
            //         city: editLocation.city || '',
            //         state: editLocation.state || '',
            //         pincode: editLocation.pincode || '',
            //         country: editLocation.country || 'India',
            //         contact_person: editLocation.contact_person || '',
            //         phone: editLocation.phone || '',
            //         email: editLocation.email || '',
            //         is_default: editLocation.is_default || false
            //     })
            //     setActiveTab('create')
            // }//cannot edit or delete location in shiprocket
        }
    }, [isOpen, editLocation])

    const fetchLocations = async () => {
        try {
            const response = await ordersAPI.getPickupLocations()
            if (response.data.success) {
                setLocations(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching locations:', error)
        }
    }

    const validateForm = () => {
        const errors = []

        if (!formData.location_name.trim()) errors.push('Location name is required')
        if (!formData.address?.trim()) {
            throw new ApiError(400, "Address is required")
        } else if (formData.address.length < 10) {
            errors.push('Address must be at least 10 characters long')
        } else if (!/(house|flat|road|street|block|no\.?|#)/i.test(formData.address)) {
            errors.push('Address line 1 should have House no / Flat no / Road no.')
        }
        if (!formData.city.trim()) errors.push('City is required')
        if (!formData.state.trim()) errors.push('State is required')
        if (!formData.pincode.trim()) errors.push('Pincode is required')
        if (!formData.contact_person.trim()) errors.push('Contact Person is required')
        if (!formData.phone.trim()) errors.push('Phone number is required')
        if (!formData.email.trim()) errors.push('email is required')

        // Validate pincode format (6 digits for India)
        if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
            errors.push('Pincode must be 6 digits')
        }

        // Validate phone format (10 digits for India)
        if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
            errors.push('Phone number must be 10 digits')
        }

        return errors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const validationErrors = validateForm()
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '))
            return
        }

        setLoading(true)
        setError('')

        try {
            let response
            if (editLocation) {
                response = await ordersAPI.updatePickupLocation({ id: editLocation.id, ...formData })
                toast.success('Pickup location updated successfully!')
            } else {
                response = await ordersAPI.createPickupLocation(formData)
                toast.success('Pickup location created successfully!')
            }

            if (response.data.success) {
                fetchLocations()
                if (onLocationCreated) onLocationCreated()
                if (!editLocation) {
                    setFormData({
                        location_name: '',
                        address: '',
                        city: '',
                        state: '',
                        pincode: '',
                        country: 'India',
                        contact_person: '',
                        phone: '',
                        email: '',
                        is_default: false
                    })
                }
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to save location')
            toast.error('Failed to save location')
        } finally {
            setLoading(false)
        }
    }

    const handleSetDefault = async (locationId) => {
        if (!confirm("Make this the default pickup location?")) return
        try {
            const response = await ordersAPI.setDefaultPickupLocation(locationId)
            if (response.data.success) {
                toast.success('Default pickup location updated!')
                await fetchLocations()
            }
        } catch (error) {
            toast.error(error.response?.data?.message)
        }
    }

    const handleDeleteLocation = async (locationId) => {
        if (!confirm('Are you sure you want to delete this pickup location?')) return

        try {
            const response = await ordersAPI.deletePickupLocation(locationId)
            if (response.data.success) {
                toast.success('Pickup location deleted!')
                fetchLocations()
            }
        } catch (error) {
            toast.error(error.response?.data?.message)
        }
    }

    const handleClose = () => {
        setFormData({
            location_name: '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
            contact_person: '',
            phone: '',
            email: '',
            is_default: false
        })
        setError('')
        setActiveTab('create')
        onEditLocation(null)
        onClose()
    }

    let isFormIncomplete = !formData.location_name.trim() || !formData.address.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim() || !formData.country.trim() || !formData.contact_person.trim() || !formData.phone.trim() || !formData.email.trim()
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h3 className="text-lg font-semibold">
                            {editLocation ? 'Edit Pickup Location' : 'Pickup Location Management'}
                        </h3>
                        <p className="text-sm text-gray-500">Manage pickup locations for Shiprocket orders</p>
                    </div>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>

                {/* Tabs */}
                {!editLocation && (
                    <div className="border-b">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('create')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'create'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Create Location
                            </button>
                            <button
                                onClick={() => setActiveTab('manage')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'manage'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Manage Locations ({locations.length})
                            </button>
                        </nav>
                    </div>
                )}

                <div className="p-6">
                    {/* Create/Edit Location Form */}
                    {(activeTab === 'create' || editLocation) && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Location Name and Default Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        disabled={originalLocationName !== ''}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Main Warehouse, Delhi Hub"
                                        value={formData.location_name}
                                        onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_default"
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        checked={formData.is_default}
                                        disabled={editLocation?.is_default}
                                        onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                    />
                                    <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
                                        Set as default pickup location
                                    </label>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address *
                                </label>
                                <textarea
                                    required
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Complete address with building name, street, area"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            {/* City, State, Pincode */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="City name"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="State name"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Country *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Country name"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pincode *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        pattern="[0-9]{6}"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="6-digit pincode"
                                        value={formData.pincode}
                                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Person *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Contact person name"
                                        value={formData.contact_person}
                                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        pattern="[0-9]{10}"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="10-digit phone number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="valid email address"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Submit Buttons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || isFormIncomplete}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
                                            </svg>
                                            Saving...
                                        </div>
                                    ) : (
                                        editLocation ? 'Update Location' : 'Create Location'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Manage Locations Tab */}
                    {activeTab === 'manage' && !editLocation && (
                        <div>
                            <div className="mb-4">
                                <h4 className="text-lg font-medium text-gray-900 mb-2">Existing Pickup Locations</h4>
                                <p className="text-sm text-gray-600">Manage your configured pickup locations for Shiprocket orders</p>
                            </div>

                            <div className="space-y-3">
                                {locations.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 text-6xl mb-4">📍</div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No pickup locations found</h3>
                                        <p className="text-gray-500">Create your first pickup location to get started</p>
                                        <button
                                            onClick={() => setActiveTab('create')}
                                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Create Location
                                        </button>
                                    </div>
                                ) : (
                                    locations.map((location) => (
                                        <div key={location.id} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h5 className="font-medium text-gray-900">{location.location_name}</h5>
                                                        {location.is_default && (
                                                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{location.address}</p>
                                                    <div className="text-sm text-gray-500">
                                                        <span>{location.city}, {location.state} - {location.pincode}</span>
                                                        <span className="mx-2">•</span>
                                                        <span>Contact: {location.contact_person} ({location.phone},{location.email})</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4">
                                                    {!location.is_default && (
                                                        <button
                                                            disabled={loading}
                                                            onClick={() => handleSetDefault(location.id)}
                                                            className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 border border-blue-200 rounded"
                                                        >
                                                            Set Default
                                                        </button>
                                                    )}
                                                    {/* <button
                                                        onClick={() => {
                                                            onEditLocation(location)
                                                            setFormData({
                                                                location_name: location.location_name,
                                                                address: location.address,
                                                                city: location.city,
                                                                state: location.state,
                                                                pincode: location.pincode,
                                                                country: location.country || 'India',
                                                                contact_person: location.contact_person,
                                                                phone: location.phone,
                                                                email: location.email,
                                                                is_default: location.is_default
                                                            })
                                                            setOriginalLocationName(editLocation.location_name || '')
                                                            setActiveTab('create')
                                                        }}
                                                        className="text-yellow-600 hover:text-yellow-800 p-1"
                                                        title="Edit Location"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteLocation(location.id)}
                                                        className="text-red-600 hover:text-red-800 p-1"
                                                        title="Delete Location"
                                                        disabled={location.is_default}
                                                    >
                                                        🗑️
                                                    </button> */}
                                                    {/* cannot edit or delete location in shiprocket */}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ShippingLocationModal
