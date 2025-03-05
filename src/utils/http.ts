import { showToast } from './toast'
import { useUserStore } from '@/stores/user'
import { useRouter } from '@/hooks/router'

// API响应类型
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 创建请求配置
const config = {
  baseURL: import.meta.env.VITE_SERVER_BASEURL + '/api/m',
  timeout: 10000,
}

// 创建请求实例
const http = {
  config,
  request<T>(options: UniNamespace.RequestOptions): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      uni.request({
        ...options,
        url: `${config.baseURL}${options.url}`,
        timeout: config.timeout,
        header: {
          'Content-Type': 'application/json',
          ...options.header,
        },
        success: (res: any) => {
          // 处理响应
          if (res.statusCode === 200) {
            // 先经过响应拦截器处理
            const interceptedRes = responseInterceptor(res)
            if (interceptedRes) {
              resolve(interceptedRes.data)
            } else {
              reject(new Error('响应拦截器处理失败'))
            }
          } else {
            // 非200状态码，交给响应拦截器处理
            responseInterceptor(res)
            reject(new Error('网络请求失败'))
          }
        },
        fail: (err) => {
          showToast('网络连接失败')
          reject(err)
        },
      })
    })
  },

  get<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'GET',
      data,
    })
  },

  post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
    })
  },

  put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
    })
  },

  delete<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({
      url,
      method: 'DELETE',
      data,
    })
  },
}

// 请求拦截器
const requestInterceptor = (config: UniNamespace.RequestOptions) => {
  // 获取token
  const token = uni.getStorageSync('token')
  if (token) {
    config.header = {
      ...config.header,
      Authorization: `Bearer ${token}`,
    }
  }
  return config
}

// 响应拦截器
const responseInterceptor = (response: any) => {
  const userStore = useUserStore()
  const router = useRouter()
  switch (response.data.code) {
    case 401:
      // 清除用户信息和token
      userStore.logout()
      // 显示提示
      showToast('登录已过期，请重新登录')
      // 跳转到登录页
      router.reLaunch('/pages/role/index')
      return null
    case 403:
      showToast('没有权限访问该资源')
      userStore.logout()
      router.reLaunch('/pages/role/index')
      return null
    case 404:
      showToast('请求的资源不存在')
      return null
    case 500:
      showToast(response.data.message || '服务器错误，请稍后重试')
      return null
    default:
      break
  }

  // 处理业务错误
  if (response.data.code !== 200) {
    showToast(response.data.message || '请求失败')
    return null
  }

  return response
}

// 添加拦截器
const oldRequest = http.request
http.request = function <T>(options: UniNamespace.RequestOptions): Promise<ApiResponse<T>> {
  const newOptions = requestInterceptor(options)
  return oldRequest.call(http, newOptions) as Promise<ApiResponse<T>>
}

export { http }
