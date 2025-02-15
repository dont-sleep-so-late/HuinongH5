import { buyerTabBar, sellerTabBar } from '@/config/menu'

/**
 * 根据用户角色获取对应的菜单配置
 * @param role 用户角色
 * @returns TabBar配置
 */
export const getTabBarByRole = (role: 'buyer' | 'seller') => {
  return role === 'seller' ? sellerTabBar : buyerTabBar
}

/**
 * 切换菜单配置
 * @param role 用户角色
 */
export const switchTabBar = (role: 'buyer' | 'seller') => {
  const tabBar = getTabBarByRole(role)
  if (typeof uni.setTabBarItem === 'function') {
    // 更新tabBar配置
    tabBar.list.forEach((item, index) => {
      uni.setTabBarItem({
        index,
        text: item.text,
        iconPath: item.iconPath,
        selectedIconPath: item.selectedIconPath,
      })
    })

    // 隐藏多余的tabBar项
    const maxIndex = tabBar.list.length
    const currentPages = getCurrentPages()
    const currentPage = currentPages[currentPages.length - 1]
    const currentPath = '/' + currentPage?.route

    // 如果当前页面不在新菜单中，跳转到首页
    if (!tabBar.list.some((item) => '/' + item.pagePath === currentPath)) {
      uni.reLaunch({ url: '/' + tabBar.list[0].pagePath })
    }

    // 隐藏多余的菜单项
    for (let i = maxIndex; i < 5; i++) {
      uni.hideTabBarItem({ index: i })
    }
  }
}

export default {
  getTabBarByRole,
  switchTabBar,
}
