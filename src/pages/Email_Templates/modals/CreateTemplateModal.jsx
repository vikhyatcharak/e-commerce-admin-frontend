import React, { useState } from 'react'
import { emailTemplatesAPI } from '../../../api/admin.js'

const CreateTemplateModal = ({ isOpen, onClose, onSubmit }) => {
    const [form, setForm] = useState({
        type: "",
        subject: "",
        message: ""
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (form.type.trim() === "") {
            setError('type is required')
            setLoading(false)
            return
        }

        if (form.subject.trim() === "") {
            setError('subject is required')
            setLoading(false)
            return
        }

        if (form.message.trim() === "") {
            setError('message is required')
            setLoading(false)
            return
        }


        const payload = {
            type: form.type,
            subject: form.subject,
            message: form.message
        }

        try {
            await emailTemplatesAPI.createTemplate(payload)
            onSubmit()
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create template')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null
    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Email Template</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <span className="text-red-600 mr-1">*</span>Type
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-red-200"
                            value={form.type}
                            onChange={e => setForm({ ...form, type: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <span className="text-red-600 mr-1">*</span>Subject
                        </label>
                        <input
                            type="text"
                            required
                            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-red-200"
                            value={form.subject}
                            onChange={e => setForm({ ...form, subject: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message
                        </label>
                        <textarea
                            rows={8}
                            className="w-full border px-3 py-2 rounded resize-y focus:ring-2 focus:ring-red-200"
                            value={form.message}
                            onChange={e => setForm({ ...form, message: e.target.value })}
                        />
                    </div>
                    {error && <div className="text-red-600 text-sm">{error}</div>}
                    <div className="flex">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition"
                        >
                            {loading ? 'Creating…' : 'Create'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="ml-3 px-4 py-2 bg-gray-100 rounded text-gray-700 hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                    aria-label="Close"
                >
                    ✕
                </button>
            </div>
        </div>
    )
}

export default CreateTemplateModal
