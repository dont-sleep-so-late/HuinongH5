interface ToastOptions {
  duration?: number
  icon?: 'success' | 'loading' | 'error' | 'none'
  mask?: boolean
  position?: 'top' | 'center' | 'bottom'
}

export const showToast = (
  title: string,
  options: ToastOptions = {
    duration: 2000,
    icon: 'none',
    mask: false,
    position: 'center',
  },
) => {
  uni.showToast({
    title,
    duration: options.duration,
    icon: options.icon,
    mask: options.mask,
    position: options.position,
  })
}

export const hideToast = () => {
  uni.hideToast()
}

export const showLoading = (title = '加载中...', mask = true) => {
  uni.showLoading({
    title,
    mask,
  })
}

export const hideLoading = () => {
  uni.hideLoading()
}
