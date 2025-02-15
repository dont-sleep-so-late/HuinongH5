import type { App } from 'vue'
import { http } from '@/utils/http'
import { api } from '@/utils/api'

export const prototypeInterceptor = {
  install(app: App) {
    // 解决低版本手机不识别 array.at() 导致运行报错的问题
    if (typeof Array.prototype.at !== 'function') {
      // eslint-disable-next-line no-extend-native
      Array.prototype.at = function (index: number) {
        if (index < 0) return this[this.length + index]
        if (index >= this.length) return undefined
        return this[index]
      }
    }

    // 挂载 http 工具
    uni.$http = http
    app.config.globalProperties.$http = http

    // 挂载 api 实例
    uni.$api = api
    app.config.globalProperties.$api = api
  },
}

export default prototypeInterceptor
