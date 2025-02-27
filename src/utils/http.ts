import { showToast } from './toast'
import { useUserStore } from '@/stores/user'
import { useRouter } from '@/hooks/router'

// 创建请求配置
const config = {
  baseURL: 'http://localhost:8888',
  timeout: 10000,
}

// 创建请求实例
const http = {
  config,
  request(options: UniNamespace.RequestOptions) {
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
            if (res.data.code === 200) {
              resolve(res.data)
            } else {
              showToast(res.data.message || '请求失败')
              reject(new Error(res.data.message))
            }
          } else {
            showToast('网络请求失败')
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

  get<T>(url: string, data?: any) {
    return this.request({
      url,
      method: 'GET',
      data,
    }) as Promise<T>
  },

  post<T>(url: string, data?: any) {
    return this.request({
      url,
      method: 'POST',
      data,
    }) as Promise<T>
  },

  put<T>(url: string, data?: any) {
    return this.request({
      url,
      method: 'PUT',
      data,
    }) as Promise<T>
  },

  delete<T>(url: string, data?: any) {
    return this.request({
      url,
      method: 'DELETE',
      data,
    }) as Promise<T>
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

  // 处理401未授权的情况
  if (response.statusCode === 401) {
    // 清除用户信息和token
    userStore.logout()

    // 显示提示
    showToast('登录已过期，请重新登录')

    // 跳转到登录页
    router.reLaunch('/pages/login/index')
    return Promise.reject(new Error('登录已过期，请重新登录'))
  }

  // 处理403禁止访问的情况
  if (response.statusCode === 403) {
    showToast('没有权限访问该资源')
    return Promise.reject(new Error('没有权限访问该资源'))
  }

  // 处理404未找到的情况
  if (response.statusCode === 404) {
    showToast('请求的资源不存在')
    return Promise.reject(new Error('请求的资源不存在'))
  }

  // 处理500服务器错误
  if (response.statusCode >= 500) {
    showToast('服务器错误，请稍后重试')
    return Promise.reject(new Error('服务器错误，请稍后重试'))
  }

  return response
}

// 添加拦截器
const oldRequest = http.request
http.request = (options: UniNamespace.RequestOptions) => {
  const newOptions = requestInterceptor(options)
  return oldRequest.call(http, newOptions).then(responseInterceptor)
}

export { http }
