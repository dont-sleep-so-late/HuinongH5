const TOKEN_KEY = 'token'
const USER_INFO_KEY = 'userInfo'

// 获取token
export const getToken = (): string => {
  return uni.getStorageSync(TOKEN_KEY)
}

// 设置token
export const setToken = (token: string) => {
  uni.setStorageSync(TOKEN_KEY, token)
}

// 移除token
export const removeToken = () => {
  uni.removeStorageSync(TOKEN_KEY)
}

// 获取用户信息
export const getUserInfo = () => {
  return uni.getStorageSync(USER_INFO_KEY)
}

// 设置用户信息
export const setUserInfo = (userInfo: any) => {
  uni.setStorageSync(USER_INFO_KEY, userInfo)
}

// 移除用户信息
export const removeUserInfo = () => {
  uni.removeStorageSync(USER_INFO_KEY)
}

// 清除所有登录信息
export const clearLoginInfo = () => {
  removeToken()
  removeUserInfo()
}

// 检查是否登录
export const checkLogin = (): boolean => {
  return !!getToken()
}

// 跳转登录页
export const toLogin = () => {
  uni.navigateTo({
    url: '/pages-sub/user/login',
  })
}
