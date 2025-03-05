import { createSSRApp } from 'vue'
import App from './App.vue'
import store from './store'
import { routeInterceptor, prototypeInterceptor } from './interceptors'
import 'virtual:uno.css'
import '@/style/index.scss'
import '@/style/iconfont.css'
import './interceptors/router'

export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  app.use(routeInterceptor)
  app.use(prototypeInterceptor)
  return {
    app,
  }
}
