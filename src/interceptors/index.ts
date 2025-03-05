import type { App } from 'vue'
import { routeInterceptor } from './route'
import { prototypeInterceptor } from './prototype'

export { routeInterceptor, prototypeInterceptor }

export default {
  install(app: App) {
    routeInterceptor.install(app)
    prototypeInterceptor.install(app)
  },
}
