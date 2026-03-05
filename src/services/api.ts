import axios from 'axios'
import { tokenManager } from '../utils/auth'

// 创建 axios 实例
const api = axios.create({
  // 使用相对路径，通过 Vite 代理转发到后端
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config: any) => {
    const token = tokenManager.getToken()
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('发送请求:', config.method?.toUpperCase(), config.url, config.data, config.params)
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 直接返回 response.data
api.interceptors.response.use(
  (response: any) => {
    const data = response.data
    
    // 如果响应中包含 token，自动保存
    if (data && data.token) {
      tokenManager.setToken(data.token)
    }
    
    console.log('收到响应:', response.config?.url, data)
    console.log('响应状态:', response.status)
    
    // 检查响应是否包含错误信息
    if (data && data.error) {
      console.error('响应包含错误:', data.error)
      return Promise.reject({
        response: {
          data: data,
          status: response.status
        }
      })
    }
    
    return data
  },
  (error: any) => {
    console.error('请求错误:', error.response?.status, error.response?.data || error.message)
    
    // 处理 401 未授权错误
    if (error.response && error.response.status === 401) {
      tokenManager.removeToken()
    }
    
    return Promise.reject(error)
  }
)

export default api
