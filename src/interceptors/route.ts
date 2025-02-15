/**
 * by 菲鸽 on 2024-03-06
 * 路由拦截，通常也是登录拦截
 * 可以设置路由白名单，或者黑名单，看业务需要选哪一个
 * 我这里应为大部分都可以随便进入，所以使用黑名单
 */
import type { App } from 'vue'
import { useUserStore } from '@/store/user'
import { needLoginPages as _needLoginPages, getNeedLoginPages } from '@/utils'

// TODO Check
const loginRoute = '/pages/login/index'

const isLogined = () => {
  const userStore = useUserStore()
  return userStore.isLoggedIn
}

const isDev = import.meta.env.DEV

// 需要登录的页面
const authPages = [
  '/pages-sub/user/verify',
  '/pages-sub/user/settings',
  '/pages-sub/user/follow-goods',
  '/pages-sub/user/follow-shops',
  '/pages-sub/user/footprints',
  '/pages-sub/user/purchase-records',
  '/pages/shelf/index',
  '/pages/publish/index',
]

// 需要实名认证的页面
const verifyPages = ['/pages/publish/index']

// 黑名单登录拦截器 - （适用于大部分页面不需要登录，少部分页面需要登录）
const navigateToInterceptor = {
  // 注意，这里的url是 '/' 开头的，如 '/pages/index/index'，跟 'pages.json' 里面的 path 不同
  invoke({ url }: { url: string }) {
    // console.log(url) // /pages/route-interceptor/index?name=feige&age=30
    const path = url.split('?')[0]
    let needLoginPages: string[] = []
    // 为了防止开发时出现BUG，这里每次都获取一下。生产环境可以移到函数外，性能更好
    if (isDev) {
      needLoginPages = getNeedLoginPages()
    } else {
      needLoginPages = _needLoginPages
    }
    const isNeedLogin = needLoginPages.includes(path)
    if (!isNeedLogin) {
      return true
    }
    const hasLogin = isLogined()
    if (hasLogin) {
      return true
    }
    const redirectRoute = `${loginRoute}?redirect=${encodeURIComponent(url)}`
    uni.navigateTo({ url: redirectRoute })
    return false
  },
}

export const routeInterceptor = {
  install(app: App) {
    uni.addInterceptor('navigateTo', {
      invoke(e) {
        return checkAuth(e.url)
      },
    })

    uni.addInterceptor('redirectTo', {
      invoke(e) {
        return checkAuth(e.url)
      },
    })

    uni.addInterceptor('reLaunch', {
      invoke(e) {
        return checkAuth(e.url)
      },
    })

    uni.addInterceptor('switchTab', {
      invoke(e) {
        return checkAuth(e.url)
      },
    })
  },
}

// 检查权限
function checkAuth(url: string) {
  // 提取页面路径
  const path = url.split('?')[0]

  // 检查是否需要登录
  if (authPages.includes(path)) {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) {
      uni.navigateTo({ url: '/pages/login/index' })
      return false
    }

    // 检查是否需要实名认证
    if (verifyPages.includes(path) && !userStore.userInfo?.isVerified) {
      uni.navigateTo({ url: '/pages-sub/user/verify' })
      return false
    }
  }

  return true
}

export default routeInterceptor
