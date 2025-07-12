import React, { createContext, useContext, useState, useEffect } from 'react'
import { adminAPI } from '../api/admin.js'

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
                    setIsAuthenticated(false)
                }
            }
            setLoading(false)
        }
        checkAuth()
    }, [admin])

    // Auto token refresh every 5 hours
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
        const interval = setInterval(checkTokenExpiry, 5 * 60 * 60 * 1000) // 5 hours
        return () => clearInterval(interval)
    }, [admin, isAuthenticated])

    const login = async (credentials) => {
        try {
            const response = await adminAPI.login(credentials)
            if (response.data?.success) {
                localStorage.setItem('adminToken', response.data.data.accessToken)
            }
            setIsAuthenticated(true)
            setAdmin(response.data.data)
            return { success: true }
        } catch (error) {
            console.log(error)
            const errorMessage = error.response?.data?.message || 'Login failed'
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
        isAuthenticated,
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
