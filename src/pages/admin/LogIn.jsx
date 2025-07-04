// src/components/auth/LoginAdmin.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {UseAdmin} from'../../context/AdminContext.jsx'

const LoginAdmin = () => {
    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: ''
    })

    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [serverError, setServerError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const navigate = useNavigate()
    const location = useLocation()
    const { login } = UseAdmin()

    useEffect(() => {
        // Show success message if redirected from registration
        if (location.state?.message) {
            setSuccessMessage(location.state.message)
        }
    }, [])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({...prev,[name]: value}))

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({...prev,[name]: ''}))
        }
        setServerError('')
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.emailOrUsername.trim()) {
            newErrors.emailOrUsername = 'Email or username is required'
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Password is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)
        setServerError('')
        setSuccessMessage('')

        try {
            // Determine if input is email or username
            const isEmail = formData.emailOrUsername.includes('@')
            const loginData = {
                password: formData?.password,
                ...(isEmail ? { email: formData.emailOrUsername, username: '' }:{ username: formData.emailOrUsername, email: '' })
            }

            const response = await login(loginData)
            
            if (response?.success) {
                navigate('/admin/dashboard', { replace: true })
                // console.log("Navigated to dashboard")
            }
        } catch (error) {
            console.log("server error:",error)
            setServerError(error.response?.data?.message || "server error(view console)")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Admin Login
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Access your store management dashboard
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-200">
                    {/* Success Message */}
                    {successMessage && (
                        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                            {successMessage}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Email or Username Field */}
                        <div>
                            <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700">
                                Email or Username
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="emailOrUsername"
                                    name="emailOrUsername"
                                    type="text"
                                    required
                                    className={`appearance-none block w-full px-3 py-2 pl-10 border ${errors.emailOrUsername ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors`}
                                    placeholder="Enter email or username"
                                    value={formData.emailOrUsername}
                                    onChange={handleChange}
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                {errors.emailOrUsername && (
                                    <p className="mt-1 text-sm text-red-600">{errors.emailOrUsername}</p>
                                )}
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className={`appearance-none block w-full px-3 py-2 pl-10 border ${errors.password ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors`}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        {/* Server Error */}
                        {serverError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                {serverError}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign in to Dashboard'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* <div className="mt-6">
                        <div className="text-center text-sm">
                            <span className="text-gray-600">Don't have an account? </span>
                            <Link
                                to="/admin/register"
                                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                            >
                                Create one here
                            </Link>
                        </div>
                    </div> */}
                </div>
            </div>
        </div>
    )
}

export default LoginAdmin
