import { ref } from 'vue'

interface PageInstance {
  $page: {
    fullPath: string
    options: Record<string, string>
  }
  getOpenerEventChannel?: () => any
}

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

export function useRouter() {
  const loading = ref(false)

  // 获取当前页面实例
  const getCurrentInstance = () => {
    const pages = getCurrentPages()
    return pages[pages.length - 1] as unknown as PageInstance
  }

  // 获取页面参数
  const query = () => {
    const instance = getCurrentInstance()
    return instance?.$page?.options || {}
  }

  // 页面跳转
  const navigate = (url: string, params?: Record<string, any>) => {
    if (params) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')
      url = `${url}${url.includes('?') ? '&' : '?'}${queryString}`
    }
    uni.navigateTo({ url })
  }

  // 重定向
  const redirect = (url: string) => {
    uni.redirectTo({ url })
  }

  // 返回上一页
  const back = () => {
    uni.navigateBack()
  }

  // Tab 切换
  const switchTab = (url: string) => {
    uni.switchTab({ url })
  }

  // 重新加载
  const reLaunch = (url: string) => {
    uni.reLaunch({ url })
  }

  // 重定向到
  const redirectTo = (url: string) => {
    uni.redirectTo({ url })
  }

  // 获取事件通道
  const getOpenerEventChannel = () => {
    const currentPage = getCurrentInstance()
    return currentPage.getOpenerEventChannel?.()
  }

  return {
    loading,
    getCurrentInstance,
    query,
    navigate,
    redirect,
    back,
    switchTab,
    reLaunch,
    redirectTo,
    getOpenerEventChannel,
  }
}
