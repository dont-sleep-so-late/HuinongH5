import { useUserStore } from '@/stores/user'
import { showToast } from '@/utils/toast'

// 需要登录的页面
const loginPages = [
  '/pages/user/index',
  '/pages/cart/index',
  '/pages/order/index',
  '/pages-sub/goods/publish',
  '/pages-sub/farm/index',
]

// 需要实名认证的页面
const verifyPages = ['/pages-sub/goods/publish', '/pages-sub/farm/index']

// 买家专属页面
const buyerPages = ['/pages/category/index', '/pages/cart/index', '/pages/user/index']

// 卖家专属页面
const sellerPages = ['/pages/shelf/index', '/pages/publish/index']

// 路由拦截器
export const routerGuard = async (options: any) => {
  const userStore = useUserStore()
  const { path, query = {} } = options
  const queryString = Object.keys(query)
    .map((key) => `${key}=${query[key]}`)
    .join('&')
  const fullPath = queryString ? `${path}?${queryString}` : path

  // 检查是否需要登录
  if (loginPages.some((page) => fullPath.startsWith(page)) && !userStore.isLoggedIn) {
    uni.navigateTo({
      url: '/pages/login/index?redirect=' + encodeURIComponent(fullPath),
    })
    return false
  }

  // 检查角色权限
  const userRole = uni.getStorageSync('userRole')
  if (userRole === 'buyer' && sellerPages.some((page) => fullPath.startsWith(page))) {
    showToast('该功能仅卖家可用')
    return false
  }
  if (userRole === 'seller' && buyerPages.some((page) => fullPath.startsWith(page))) {
    showToast('该功能仅买家可用')
    return false
  }

  // 检查是否需要实名认证
  if (verifyPages.some((page) => fullPath.startsWith(page))) {
    const isVerified = uni.getStorageSync('isVerified')
    const isSeller = userRole === 'seller'

    if (isSeller && !isVerified) {
      uni.navigateTo({
        url: '/pages-sub/user/verify',
      })
      return false
    }
  }

  return true
}

// 注册全局路由拦截器
uni.addInterceptor('navigateTo', {
  invoke(e) {
    return routerGuard(e)
  },
})

uni.addInterceptor('redirectTo', {
  invoke(e) {
    return routerGuard(e)
  },
})

uni.addInterceptor('reLaunch', {
  invoke(e) {
    return routerGuard(e)
  },
})

uni.addInterceptor('switchTab', {
  invoke(e) {
    return routerGuard(e)
  },
})
