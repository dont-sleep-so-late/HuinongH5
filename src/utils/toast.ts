interface ToastOptions {
  icon?: 'success' | 'error' | 'loading' | 'none'
  duration?: number
  mask?: boolean
}

interface ModalResult {
  confirm: boolean
  cancel: boolean
}

/**
 * 显示提示
 */
export function showToast(title: string, options: ToastOptions = {}) {
  const { icon = 'none', duration = 2000, mask = false } = options
  return new Promise<void>((resolve) => {
    uni.showToast({
      title,
      icon,
      duration,
      mask,
      success: () => {
        setTimeout(resolve, duration)
      },
    })
  })
}

/**
 * 显示确认框
 */
export function showModal(options: UniApp.ShowModalOptions): Promise<ModalResult> {
  return new Promise((resolve) => {
    uni.showModal({
      ...options,
      success: (res) => {
        resolve({
          confirm: res.confirm,
          cancel: res.cancel,
        })
      },
      fail: () => {
        resolve({
          confirm: false,
          cancel: true,
        })
      },
    })
  })
}

/**
 * 显示加载中
 */
export function showLoading(title = '加载中...', mask = true) {
  uni.showLoading({
    title,
    mask,
  })
}

/**
 * 隐藏加载中
 */
export function hideLoading() {
  uni.hideLoading()
}
