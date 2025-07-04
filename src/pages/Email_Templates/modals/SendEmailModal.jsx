import React, { useState, useEffect } from 'react'
import { emailTemplatesAPI } from '../../../api/admin.js'

const SendEmailModal = ({ isOpen, onClose, template, onSubmit }) => {
    const [form, setForm] = useState({
        to: '',
        subject: '',
        message: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        if (template) {
            setForm({
                type: template.type || '',
                subject: template.subject || '',
                message: template.message || ''
            })
        }
    }, [template])

    const handleSend = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (!form.to || !form.subject || !form.message) {
            setError('All fields are required')
            return
        }

        try {
            const payload = {
                to: form.to,
                subject: form.subject,
                message: form.message
            }

            await emailTemplatesAPI.sendMailTemplate(payload)
            onSubmit()
            onClose()
            setSuccess('Email sent successfully')
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send email')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <h2 className="text-lg font-semibold mb-4">Send Email</h2>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                {success && <div className="text-green-600 text-sm">{success}</div>}

                <div className="space-y-4">
                    <input
                        type="email"
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Recipient Email"
                        value={form.to}
                        onChange={e => setForm({ ...form, to: e.target.value })}
                    />
                    <input
                        type="text"
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Subject"
                        value={form.subject}
                        onChange={e => setForm({ ...form, subject: e.target.value })}
                    />
                    <textarea
                        className="w-full border px-3 py-2 rounded"
                        rows="6"
                        placeholder="Message"
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                    />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send Email'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SendEmailModal
