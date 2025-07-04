import React, { createContext, useContext, useState, useEffect } from 'react'
import { adminAPI } from '../api/admin.js'

const AdminContext = createContext()

export const AdminProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null)
    const [loading, setLoading] = useState(true)
    const [initialized, setInitialized] = useState(false)

    // Initialize authentication state
    useEffect(() => {
        initializeAdmin()
    }, [])

    const initializeAdmin = async () => {
        try {
            // Try to get current admin (this will use existing cookies)
            const response = await adminAPI.getCurrentAdmin()
            if (response.data.success) {
                const adminData = response.data.data
                setAdmin(adminData)
                localStorage.setItem('adminData', JSON.stringify(adminData))
            }
        } catch (error) {
            // If getCurrentAdmin fails, try to refresh token
            if (error.response?.status === 401) {
                try {
                    await adminAPI.refreshToken()
                    // Retry getting current admin after refresh
                    const retryResponse = await adminAPI.getCurrentAdmin()
                    if (retryResponse.data.success) {
                        const adminData = retryResponse.data.data
                        setAdmin(adminData)
                        localStorage.setItem('adminData', JSON.stringify(adminData))
                    }
                } catch (refreshError) {
                    // Both failed, clear any stored data
                    localStorage.removeItem('adminData')
                    setAdmin(null)
                }
            } else {
                // Other errors, check localStorage for cached data
                const storedAdmin = localStorage.getItem('adminData')
                if (storedAdmin) {
                    setAdmin(JSON.parse(storedAdmin))
                }
            }
        } finally {
            setLoading(false)
            setInitialized(true)
        }
    }

    // Auto token refresh every 10 minutes
    useEffect(() => {
        if (!admin || !initialized) return

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
        const interval = setInterval(checkTokenExpiry, 10 * 60 * 1000) // 10 minutes
        return () => clearInterval(interval)
    }, [admin, initialized])

    const login = async (credentials) => {
        try {
            const response = await adminAPI.login(credentials)
            if (response.data?.success) {
                const adminData = response.data.data?.admin
                setAdmin(adminData)
                localStorage.setItem('adminData', JSON.stringify(adminData))
                return { success: true }
            }
        } catch (error) {
            console.log(error)
            const errorMessage = error.message || error.response?.data?.message || 'Login failed'
            throw new Error(errorMessage)
        }
    }

    const logout = async () => {
        try {
            await adminAPI.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            setAdmin(null)
            localStorage.removeItem('adminData')
        }
    }

    const refreshToken = async () => {
        try {
            const response = await adminAPI.refreshToken()
            if (response.data?.success) {
                // Get updated admin data after refresh
                const adminResponse = await adminAPI.getCurrentAdmin()
                if (adminResponse.data?.success) {
                    const adminData = adminResponse.data?.data
                    setAdmin(adminData)
                    localStorage.setItem('adminData', JSON.stringify(adminData))
                }
                return true
            }
        } catch (error) {
            // Refresh failed, logout user
            setAdmin(null)
            localStorage.removeItem('adminData')
            return false
        }
    }

    const updateProfile = async (profileData) => {
        try {
            const response = await adminAPI.updateAdmin(profileData)
            if (response.data?.success) {
                const updatedAdmin = response.data.data
                setAdmin(updatedAdmin)
                localStorage.setItem('adminData', JSON.stringify(updatedAdmin))
                return { success: true }
            }
        } catch (error) {
            const errorMessage = error.message || error.response?.data?.message || 'Login failed'
            throw new Error(errorMessage)
        }
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
        initialized,
        login,
        logout,
        refreshToken,
        updateProfile,
        changePassword
    }

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export const UseAdmin = () => {
    const context = useContext(AdminContext)
    if (!context) {
        throw new Error('UseAdmin must be used within an AdminProvider')
    }
    return context
}
