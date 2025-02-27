import { getToken } from './auth'

interface RequestOptions extends UniApp.RequestOptions {
  showLoading?: boolean
  showError?: boolean
}

interface Response<T = any> {
  code: number
  message: string
  data: T
}

const BASE_URL = 'http://localhost:3000'

/**
 * 统一请求方法
 */
export function request<T = any>(options: RequestOptions): Promise<Response<T>> {
  const { url, showLoading = true, showError = true } = options

  if (showLoading) {
    uni.showLoading({
      title: '加载中...',
      mask: true,
    })
  }

  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      url: BASE_URL + url,
      header: {
        ...options.header,
        Authorization: `Bearer ${getToken()}`,
      },
      success: (res: any) => {
        const { code, message, data } = res.data as Response<T>
        if (code === 0) {
          resolve(res.data)
        } else {
          if (showError) {
            uni.showToast({
              title: message || '请求失败',
              icon: 'none',
            })
          }
          reject(res.data)
        }
      },
      fail: (err) => {
        if (showError) {
          uni.showToast({
            title: '网络错误',
            icon: 'none',
          })
        }
        reject(err)
      },
      complete: () => {
        if (showLoading) {
          uni.hideLoading()
        }
      },
    })
  })
}
