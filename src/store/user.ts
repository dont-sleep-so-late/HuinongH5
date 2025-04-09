import { defineStore } from 'pinia'
import type { UserInfo } from '@/types/user'
import { switchTabBar } from '@/utils/menu'

export interface UserState {
  token: string
  userInfo: UserInfo | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: uni.getStorageSync('token') || '',
    userInfo: uni.getStorageSync('userInfo') || null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isSeller: (state) => state.userInfo?.role === 'seller',
  },

  actions: {
    // 设置用户信息
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo
      uni.setStorageSync('userInfo', userInfo)
      // 切换菜单
      switchTabBar(userInfo.role)
    },

    // 设置token
    setToken(token: string) {
      this.token = token
      uni.setStorageSync('token', token)
    },

    // 退出登录
    logout() {
      this.token = ''
      this.userInfo = null
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')

      // 切换回买家菜单
      switchTabBar('buyer')

      // 跳转到登录页
      uni.reLaunch({
        url: '/pages/role/index',
      })
    },
  },
})
