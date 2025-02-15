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

  return {
    loading,
    navigate,
    redirect,
    switchTab,
    back,
    reLaunch,
    redirectTo,
  }
}
