import { getToken } from '@/utils/auth'

// 接口基础地址
const BASE_URL = 'https://api.example.com'

// 请求配置
interface RequestConfig extends UniApp.RequestOptions {
  baseURL?: string
  custom?: {
    auth?: boolean
    loading?: boolean
  }
}

// 响应数据
interface Response<T = any> {
  code: number
  data: T
  message: string
}

// 请求队列
let requestQueue: number = 0

// 显示加载提示
const showLoading = () => {
  if (requestQueue === 0) {
    uni.showLoading({
      title: '加载中',
      mask: true,
    })
  }
  requestQueue++
}

// 隐藏加载提示
const hideLoading = () => {
  requestQueue--
  if (requestQueue === 0) {
    uni.hideLoading()
  }
}

// 错误处理
const handleError = (error: any) => {
  // 隐藏加载提示
  hideLoading()

  // 处理错误信息
  const message = error.errMsg || error.message || '请求失败'
  uni.showToast({
    title: message,
    icon: 'none',
  })

  return Promise.reject(error)
}

// 创建请求实例
const request = <T = any>(config: RequestConfig): Promise<T> => {
  // 合并配置
  const options: RequestConfig = {
    timeout: 10000,
    header: {},
    ...config,
    url: (config.baseURL || BASE_URL) + config.url,
  }

  // 请求拦截
  if (options.custom?.auth !== false) {
    const token = getToken()
    if (token) {
      options.header = {
        ...options.header,
        Authorization: `Bearer ${token}`,
      }
    } else {
      // 未登录，跳转到登录页
      uni.navigateTo({
        url: '/pages-sub/user/login',
      })
      return Promise.reject(new Error('请先登录'))
    }
  }

  // 显示加载提示
  if (options.custom?.loading !== false) {
    showLoading()
  }

  // 发起请求
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      success: (res: any) => {
        // 隐藏加载提示
        if (options.custom?.loading !== false) {
          hideLoading()
        }

        // 处理响应
        const { statusCode, data } = res
        if (statusCode === 200) {
          if (data.code === 0) {
            resolve(data.data)
          } else {
            // 业务错误
            uni.showToast({
              title: data.message || '请求失败',
              icon: 'none',
            })
            reject(new Error(data.message))
          }
        } else if (statusCode === 401) {
          // 未授权，清除token并跳转到登录页
          // removeToken()
          uni.navigateTo({
            url: '/pages-sub/user/login',
          })
          reject(new Error('请重新登录'))
        } else {
          // HTTP错误
          uni.showToast({
            title: `${statusCode} ${data.message || '请求失败'}`,
            icon: 'none',
          })
          reject(new Error(data.message))
        }
      },
      fail: (error) => {
        handleError(error)
        reject(error)
      },
    })
  })
}

// 创建请求方法
const http = {
  get: <T = any>(url: string, data?: any, config?: RequestConfig) =>
    request<T>({
      method: 'GET',
      url,
      data,
      ...config,
    }),

  post: <T = any>(url: string, data?: any, config?: RequestConfig) =>
    request<T>({
      method: 'POST',
      url,
      data,
      ...config,
    }),

  put: <T = any>(url: string, data?: any, config?: RequestConfig) =>
    request<T>({
      method: 'PUT',
      url,
      data,
      ...config,
    }),

  delete: <T = any>(url: string, data?: any, config?: RequestConfig) =>
    request<T>({
      method: 'DELETE',
      url,
      data,
      ...config,
    }),
}

export default http
