import type { App } from 'vue'
import { routeInterceptor } from './route'
import { requestInterceptor } from './request'
import { prototypeInterceptor } from './prototype'

export { routeInterceptor, requestInterceptor, prototypeInterceptor }

export default {
  install(app: App) {
    routeInterceptor.install(app)
    requestInterceptor.install(app)
    prototypeInterceptor.install(app)
  },
}
