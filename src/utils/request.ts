import axios, { type AxiosRequestConfig } from 'axios'
import { message } from 'antd'
import { useAuthStore } from '@/store/authStore'

// 创建 Axios 实例
const myAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8123/api',
  timeout: 60000,
  withCredentials: true,
})

// 全局请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    // 添加 Token 到请求头
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

// 全局响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    const { data } = response

    // 未登录
    if (data.code === 40100) {
      const { logout } = useAuthStore.getState()
      logout()

      // 不是获取用户信息的请求，并且用户目前不是已经在登录页面，则跳转到登录页面
      if (
        !response.request.responseURL.includes('user/get/login') &&
        !window.location.pathname.includes('/login')
      ) {
        message.warning('请先登录')
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      }
    } else if (data.code !== 0 && data.code !== 200) {
      // 其他错误码
      message.error(data.message || '请求失败')
    }

    return response
  },
  function (error) {
    // 网络错误或服务器错误
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        message.error('未授权，请重新登录')
        useAuthStore.getState().logout()
        window.location.href = '/login'
      } else if (status === 403) {
        message.error('没有权限访问')
      } else if (status === 404) {
        message.error('请求的资源不存在')
      } else if (status >= 500) {
        message.error('服务器错误，请稍后重试')
      }
    } else if (error.request) {
      message.error('网络错误，请检查网络连接')
    } else {
      message.error('请求失败')
    }

    return Promise.reject(error)
  }
)

export const MyAxios = <T>(config: AxiosRequestConfig): Promise<T> => {
  return myAxios(config).then(({ data }) => data)
}

export default myAxios
