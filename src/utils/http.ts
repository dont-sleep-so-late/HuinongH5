import type { ApiResponse } from '@/types/api'

interface RequestOptions extends UniApp.RequestOptions {
  loading?: boolean
}

export class Http {
  baseURL: string
  timeout: number

  constructor(baseURL: string = import.meta.env.VITE_API_URL, timeout: number = 10000) {
    this.baseURL = baseURL
    this.timeout = timeout
  }

  request<T>(options: RequestOptions): Promise<T> {
    return new Promise((resolve, reject) => {
      // 显示加载中
      if (options.loading !== false) {
        uni.showLoading({ title: '加载中...' })
      }

      uni.request({
        ...options,
        url: this.baseURL + options.url,
        timeout: this.timeout,
        success: (res) => {
          // 隐藏加载中
          if (options.loading !== false) {
            uni.hideLoading()
          }

          // 处理响应
          if (res.statusCode === 401) {
            // token 过期，清除用户信息并跳转到登录页
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            uni.navigateTo({ url: '/pages/login/index' })
            reject(new Error('登录已过期'))
            return
          }

          if (res.statusCode !== 200) {
            // 显示错误信息
            uni.showToast({
              title: (res.data as any)?.message || '请求失败',
              icon: 'none',
            })
            reject(new Error('请求失败'))
            return
          }

          resolve(res.data as T)
        },
        fail: (err) => {
          // 隐藏加载中
          if (options.loading !== false) {
            uni.hideLoading()
          }

          // 显示错误信息
          uni.showToast({
            title: '网络错误',
            icon: 'none',
          })
          reject(err)
        },
      })
    })
  }

  get<T>(url: string, data?: any, loading: boolean = true): Promise<T> {
    return this.request<T>({
      url,
      method: 'GET',
      data,
      loading,
    })
  }

  post<T>(url: string, data?: any, loading: boolean = true): Promise<T> {
    return this.request<T>({
      url,
      method: 'POST',
      data,
      loading,
    })
  }

  put<T>(url: string, data?: any, loading: boolean = true): Promise<T> {
    return this.request<T>({
      url,
      method: 'PUT',
      data,
      loading,
    })
  }

  delete<T>(url: string, data?: any, loading: boolean = true): Promise<T> {
    return this.request<T>({
      url,
      method: 'DELETE',
      data,
      loading,
    })
  }
}

export const http = new Http()
export default http
