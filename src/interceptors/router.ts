// 路由拦截器
const whiteList = [
  '/pages/role/index',
  '/pages/login/index',
  '/pages/register/index',
  '/pages/forgot-password/index',
] // 白名单页面

// 页面跳转前进行拦截
uni.addInterceptor('navigateTo', {
  invoke(params) {
    // 检查是否已选择角色
    const userRole = uni.getStorageSync('userRole')
    const token = uni.getStorageSync('token')

    // 如果未选择角色且不在白名单中，跳转到角色选择页
    if (!userRole && !whiteList.includes(params.url)) {
      uni.reLaunch({
        url: '/pages/role/index',
      })
      return false
    }

    // 如果未登录且不在白名单中，跳转到登录页
    if (!token && !whiteList.includes(params.url)) {
      uni.navigateTo({
        url: '/pages/role/index',
      })
      return false
    }

    return true
  },
  fail(err) {
    console.error('路由拦截器错误:', err)
    uni.clearStorageSync()
    return false
  },
})

// Tab 页面跳转前进行拦截
uni.addInterceptor('switchTab', {
  invoke(params) {
    // 检查是否已选择角色
    const userRole = uni.getStorageSync('userRole')
    const token = uni.getStorageSync('token')

    // 如果未选择角色，跳转到角色选择页
    if (!userRole) {
      uni.reLaunch({
        url: '/pages/role/index',
      })
      return false
    }

    // 如果未登录，跳转到登录页
    if (!token) {
      uni.navigateTo({
        url: '/pages/login/index',
      })
      return false
    }

    return true
  },
  fail(err) {
    uni.clearStorageSync()
    return false
  },
})

// 重定向页面跳转前进行拦截
uni.addInterceptor('redirectTo', {
  invoke(params) {
    // 检查是否已选择角色
    const userRole = uni.getStorageSync('userRole')
    const token = uni.getStorageSync('token')

    // 如果未选择角色且不在白名单中，跳转到角色选择页
    if (!userRole && !whiteList.includes(params.url)) {
      uni.reLaunch({
        url: '/pages/role/index',
      })
      return false
    }

    // 如果未登录且不在白名单中，跳转到登录页
    if (!token && !whiteList.includes(params.url)) {
      uni.navigateTo({
        url: '/pages/login/index',
      })
      return false
    }

    return true
  },
  fail(err) {
    console.error('重定向拦截器错误:', err)
    uni.clearStorageSync()
    uni.showToast({
      title: '页面跳转失败',
      icon: 'none',
    })
    return false
  },
})
