import axios, { type AxiosRequestConfig } from 'axios'
import { message } from 'antd'

// 创建 Axios 实例
const myAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8123/api',
  timeout: 60000,
  withCredentials: true,
})

// 全局请求拦截器
myAxios.interceptors.request.use(
  function (config) {
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
      if (
        !response.request.responseURL.includes('user/get/login') &&
        !window.location.pathname.includes('/user/login')
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
    return Promise.reject(error)
  }
)

export const MyAxios = <T>(config: AxiosRequestConfig): Promise<T> => {
  return myAxios({ ...config }).then(({ data }) => data)
}

export default myAxios
