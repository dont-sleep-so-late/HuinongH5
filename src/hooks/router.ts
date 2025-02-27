import { ref } from 'vue'

interface RouterOptions {
  url: string
  animationType?:
    | 'pop-in'
    | 'pop-out'
    | 'fade-in'
    | 'fade-out'
    | 'slide-in-right'
    | 'slide-out-right'
  animationDuration?: number
  events?: AnyObject
}

interface NavigateOptions {
  [key: string]: string | number | boolean
}

export const useRouter = () => {
  const loading = ref(false)

  const navigate = (url: string, params?: NavigateOptions) => {
    if (params) {
      const query = Object.entries(params)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')
      url = `${url}?${query}`
    }
    uni.navigateTo({ url })
  }

  const redirect = (options: RouterOptions | string) => {
    if (typeof options === 'string') {
      uni.redirectTo({ url: options })
      return
    }
    uni.redirectTo(options)
  }

  const switchTab = (url: string) => {
    uni.switchTab({ url })
  }

  const back = (delta = 1) => {
    uni.navigateBack({ delta })
  }

  const reLaunch = (url: string) => {
    uni.reLaunch({ url })
  }

  const redirectTo = (url: string) => {
    uni.redirectTo({ url })
  }

  // 获取页面参数
  const getQuery = <T extends Record<string, string>>(): T => {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    return (currentPage as any)?.options || {}
  }

  // 获取事件通道
  const getOpenerEventChannel = () => {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    return (currentPage as any)?.getOpenerEventChannel?.()
  }

  return {
    loading,
    navigate,
    redirect,
    switchTab,
    back,
    reLaunch,
    redirectTo,
    getQuery,
    getOpenerEventChannel,
  }
}
