import axios from 'axios'
import qs from 'qs'

const AdminApi = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/admin',
    withCredentials: true
})

// Request interceptor to transform request data
AdminApi.interceptors.request.use(config => {
    if ((config.method === 'post' || config.method === 'put' || config.method === 'patch')) {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        if (config.data) {
            config.data = qs.stringify(config.data)
        }
    }
    const token = localStorage.getItem('adminToken')
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
},
    (error) => Promise.reject(error)
)

AdminApi.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config
    const isAuthRoute = originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh-token')

    if (error.response.status === 401 && !originalRequest._retry && !isAuthRoute) {
        originalRequest._retry = true
        try {
            const { data } = await AdminApi.post('/auth/refresh-token')
            localStorage.setItem('adminToken', data.data.accessToken)
            AdminApi.defaults.headers.common['Authorization'] = `Bearer ${data.data.accessToken}`
            return AdminApi(originalRequest)
        } catch (refreshError) {
            console.error("Token refresh failed:", refreshError)
            localStorage.removeItem('adminToken')
            // Optionally redirect to login
            // window.location.href = '/login'
            return Promise.reject(refreshError)
        }
    }
    return Promise.reject(error)
})

export default AdminApi
