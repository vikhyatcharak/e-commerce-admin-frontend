import React, { createContext, useContext, useState, useEffect } from 'react'
import { adminAPI } from '../api/admin.js'
import { toast } from 'react-toastify'

const AdminContext = createContext()

export const AdminProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)


    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('adminToken')
            if (token) {
                try {
                    const response = await adminAPI.getCurrentAdmin()
                    setAdmin(response.data.data)
                    setIsAuthenticated(true)
                } catch (error) {
                    console.error("Auth check failed", error)
                    localStorage.removeItem('adminToken')
                    setAdmin(null)
                    setIsAuthenticated(false)
                }
            }
            setLoading(false)
        }
        checkAuth()
    }, [admin])

    // Auto token refresh every 10 hours
    useEffect(() => {
        if (!admin || !isAuthenticated) return

        const checkTokenExpiry = async () => {
            try {
                const response = await adminAPI.getCurrentAdmin()
                if (!response.data.success) {
                    await refreshToken()
                }
            } catch (error) {
                if (error.response?.status === 401) {
                    await refreshToken()
                }
            }
        }
        const interval = setInterval(checkTokenExpiry, 10 * 60 * 60 * 1000) // 5 hours
        return () => clearInterval(interval)
    }, [admin, isAuthenticated])

    const login = async (credentials) => {
        try {
            const response = await adminAPI.login(credentials)
            if (response.data?.success) {
                localStorage.setItem('adminToken', response.data.data.accessToken)
                setIsAuthenticated(true)
                setAdmin(response.data.data)
                toast.success('Login successful!')
            }
            return { success: true, data: response.data.data }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || 'Login failed')
            return { success: false, error: error.response?.data?.message }
        }
    }

    const logout = async () => {
        try {
            await adminAPI.logout()
            toast.success('Logged out successfully!')
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            // Even if API call fails, clear local state
            setAdmin(null)
            localStorage.removeItem('adminToken')
            setIsAuthenticated(false)
        }
    }

    const refreshToken = async () => {
        try {
            const response = await adminAPI.refreshToken()
            if (response.data?.success) {
                // Get updated admin data after refresh
                const adminResponse = await adminAPI.getCurrentAdmin()
                if (adminResponse.data?.success) {
                    localStorage.setItem('adminToken', response.data.data.accessToken)
                }
                const adminData = await adminAPI.getCurrentAdmin()
                setAdmin(adminData)
                return true
            }
        } catch (error) {
            // Refresh failed, logout user
            setAdmin(null)
            localStorage.removeItem('adminToken')
            return false
        }
    }

    const updateProfile = async (profileData) => {
        try {
            const response = await adminAPI.updateAdmin(profileData)
            if (response.data?.success) {
                const updatedAdmin = response.data.data
                setAdmin(updatedAdmin)
                toast.success('Profile updated successfully!')
                return { success: true }
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Profile update failed'
            toast.error(errorMessage)
            return { success: false, error: errorMessage }
        }

        const changePassword = async (passwordData) => {
            try {
                const response = await adminAPI.changePassword(passwordData)
                if (response.data?.success) {
                    // Password change forces logout for security
                    await logout()
                    return { success: true }
                }
            } catch (error) {
                console.log(error)
                const errorMessage = error.message || error.response?.data?.message || 'Login failed'
                throw new Error(errorMessage)
            }
        }

        const value = {
            admin,
            loading,
            isAuthenticated,
            login,
            logout,
            refreshToken,
            updateProfile,
            changePassword
        }

        return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
    }
}

export const UseAdmin = () => {
    const context = useContext(AdminContext)
    if (!context) {
        throw new Error('UseAdmin must be used within an AdminProvider')
    }
    return context
}
