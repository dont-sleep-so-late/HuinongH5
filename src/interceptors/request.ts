/* eslint-disable no-param-reassign */
import qs from 'qs'
import { useUserStore } from '@/store'
import { platform } from '@/utils/platform'
import { getEnvBaseUrl } from '@/utils'
import type { App } from 'vue'

export type CustomRequestOptions = UniApp.RequestOptions & {
  query?: Record<string, any>
  /** 出错时是否隐藏错误提示 */
  hideErrorToast?: boolean
} & IUniUploadFileOptions // 添加uni.uploadFile参数类型

// 请求基准地址
const baseUrl = getEnvBaseUrl()

// 拦截器配置
const httpInterceptor = {
  // 拦截前触发
  invoke(options: CustomRequestOptions) {
    // 接口请求支持通过 query 参数配置 queryString
    if (options.query) {
      const queryStr = qs.stringify(options.query)
      if (options.url.includes('?')) {
        options.url += `&${queryStr}`
      } else {
        options.url += `?${queryStr}`
      }
    }
    // 非 http 开头需拼接地址
    if (!options.url.startsWith('http')) {
      // #ifdef H5
      // console.log(__VITE_APP_PROXY__)
      if (JSON.parse(__VITE_APP_PROXY__)) {
        // 啥都不需要做
      } else {
        options.url = baseUrl + options.url
      }
      // #endif
      // 非H5正常拼接
      // #ifndef H5
      options.url = baseUrl + options.url
      // #endif
      // TIPS: 如果需要对接多个后端服务，也可以在这里处理，拼接成所需要的地址
    }
    // 1. 请求超时
    options.timeout = 10000 // 10s
    // 2. （可选）添加小程序端请求头标识
    options.header = {
      platform, // 可选，与 uniapp 定义的平台一致，告诉后台来源
      ...options.header,
    }
    // 3. 添加 token 请求头标识
    const userStore = useUserStore()
    const { token } = userStore.userInfo as unknown as IUserInfo
    if (token) {
      options.header.Authorization = `Bearer ${token}`
    }
  },
}

export const requestInterceptor = {
  install(app: App) {
    uni.addInterceptor('request', {
      invoke(options) {
        // 添加 token
        const userStore = useUserStore()
        if (userStore.token) {
          options.header = {
            ...options.header,
            Authorization: 'Bearer ' + userStore.token,
          }
        }

        // 显示加载中
        uni.showLoading({ title: '加载中...' })
      },
      success(res) {
        // 隐藏加载中
        uni.hideLoading()

        // 处理响应
        if (res.statusCode === 401) {
          // token 过期，清除用户信息并跳转到登录页
          const userStore = useUserStore()
          userStore.logout()
          uni.navigateTo({ url: '/pages/login/index' })
          return false
        }

        if (res.statusCode !== 200) {
          // 显示错误信息
          uni.showToast({
            title: res.data?.message || '请求失败',
            icon: 'none',
          })
          return false
        }

        return res.data
      },
      fail(err) {
        // 隐藏加载中
        uni.hideLoading()

        // 显示错误信息
        uni.showToast({
          title: err.errMsg || '网络错误',
          icon: 'none',
        })

        return false
      },
    })
  },
}

export default requestInterceptor
