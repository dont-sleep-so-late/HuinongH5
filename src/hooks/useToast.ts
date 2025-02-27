import { ref, unref } from 'vue'

interface ToastOptions {
  message: string
  duration?: number
}

/**
 * Toast提示钩子函数
 * @returns Toast相关方法
 */
export function useToast() {
  const toastRef = ref()

  /**
   * 显示Toast提示
   * @param options Toast选项或消息文本
   */
  const show = (options: ToastOptions | string) => {
    const toast = unref(toastRef)
    if (!toast) return

    if (typeof options === 'string') {
      toast.show(options)
    } else {
      toast.show(options.message, options.duration)
    }
  }

  /**
   * 显示成功提示
   * @param message 提示消息
   * @param duration 显示时长（毫秒）
   */
  const success = (message: string, duration = 2000) => {
    const toast = unref(toastRef)
    if (!toast) return

    toast.success(message, duration)
  }

  /**
   * 显示错误提示
   * @param message 提示消息
   * @param duration 显示时长（毫秒）
   */
  const error = (message: string, duration = 2000) => {
    const toast = unref(toastRef)
    if (!toast) return

    toast.error(message, duration)
  }

  /**
   * 显示警告提示
   * @param message 提示消息
   * @param duration 显示时长（毫秒）
   */
  const warning = (message: string, duration = 2000) => {
    const toast = unref(toastRef)
    if (!toast) return

    toast.warning(message, duration)
  }

  /**
   * 显示加载提示
   * @param message 提示消息
   */
  const loading = (message = '加载中...') => {
    const toast = unref(toastRef)
    if (!toast) return

    toast.loading(message)
  }

  /**
   * 隐藏Toast
   */
  const hide = () => {
    const toast = unref(toastRef)
    if (!toast) return

    toast.hide()
  }

  return {
    toastRef,
    show,
    success,
    error,
    warning,
    loading,
    hide,
  }
}
