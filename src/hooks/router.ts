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

export const useRouter = () => {
  const loading = ref(false)

  const navigate = (options: RouterOptions | string) => {
    if (typeof options === 'string') {
      uni.navigateTo({ url: options })
      return
    }
    uni.navigateTo(options)
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

  const reLaunch = (options: RouterOptions | string) => {
    if (typeof options === 'string') {
      uni.reLaunch({ url: options })
      return
    }
    uni.reLaunch(options)
  }

  return {
    loading,
    navigate,
    redirect,
    switchTab,
    back,
    reLaunch,
  }
}
