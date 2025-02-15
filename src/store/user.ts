import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getToken, setToken, getUserInfo, setUserInfo, clearLoginInfo } from '@/utils/auth'

export interface UserInfo {
  id: number
  phone: string
  nickname: string
  avatar: string
  [key: string]: any
}

export const useUserStore = defineStore('user', () => {
  // 用户信息
  const userInfo = ref<UserInfo | null>(getUserInfo())

  // 登录状态
  const isLogin = ref(!!getToken())

  // 设置用户信息
  const setUser = (user: UserInfo) => {
    userInfo.value = user
    setUserInfo(user)
  }

  // 设置token
  const updateToken = (token: string) => {
    setToken(token)
    isLogin.value = true
  }

  // 登录
  const login = (data: { token: string; userInfo: UserInfo }) => {
    const { token, userInfo: user } = data
    updateToken(token)
    setUser(user)
  }

  // 退出登录
  const logout = () => {
    clearLoginInfo()
    userInfo.value = null
    isLogin.value = false
  }

  // 更新用户信息
  const updateUserInfo = (data: Partial<UserInfo>) => {
    if (userInfo.value) {
      const newUserInfo = {
        ...userInfo.value,
        ...data,
      }
      setUser(newUserInfo)
    }
  }

  return {
    userInfo,
    isLogin,
    login,
    logout,
    updateUserInfo,
  }
})
