import axios from 'axios'
import qs from 'qs'

const AdminApi = axios.create({
    baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL || '/api/admin',
    // headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded'
    // },
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
    return config
})

export default AdminApi
