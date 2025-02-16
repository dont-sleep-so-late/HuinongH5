import type { UserRole } from '../config/menu'

// 角色切换相关的常量
export const ROLE_STORAGE_KEY = 'userRole'
export const DEFAULT_ROLE: UserRole = 'buyer'

// 获取当前用户角色
export const getCurrentRole = (): UserRole => {
  try {
    const role = uni.getStorageSync(ROLE_STORAGE_KEY) as UserRole
    return role || DEFAULT_ROLE
  } catch (e) {
    console.error('获取用户角色失败:', e)
    return DEFAULT_ROLE
  }
}

// 设置用户角色
export const setCurrentRole = (role: UserRole): void => {
  try {
    uni.setStorageSync(ROLE_STORAGE_KEY, role)
    // 切换角色后刷新页面以更新tabBar
    setTimeout(() => {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      uni.reLaunch({
        url: `/${currentPage.route}`,
      })
    }, 100)
  } catch (e) {
    console.error('设置用户角色失败:', e)
  }
}

// 切换用户角色
export const toggleRole = (): void => {
  const currentRole = getCurrentRole()
  const newRole: UserRole = currentRole === 'buyer' ? 'seller' : 'buyer'
  setCurrentRole(newRole)
}
