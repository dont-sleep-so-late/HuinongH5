import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 用户信息接口
export interface UserInfo {
  id: number
  username: string
  password?: string
  nickname: string | null
  email: string | null
  phone: string | null
  avatar: string | null
  role: 'buyer' | 'seller'
  status: number
  createdTime: string
  updatedTime: string | null
  lastLoginTime: string | null
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 用户信息
    const userInfo = ref<UserInfo | null>(null)
    // 登录状态
    const isLoggedIn = ref(false)
    // token
    const token = ref('')

    // 设置用户信息
    const setUserInfo = (info: UserInfo | null) => {
      userInfo.value = info
      if (info) {
        uni.setStorageSync('userRole', info.role)
      } else {
        uni.removeStorageSync('userRole')
      }
    }

    // 设置登录状态
    const setLoginState = (state: boolean) => {
      isLoggedIn.value = state
    }

    // 设置token
    const setToken = (newToken: string) => {
      token.value = newToken
      if (newToken) {
        uni.setStorageSync('token', newToken)
      } else {
        uni.removeStorageSync('token')
      }
    }

    // 登录
    const login = (info: UserInfo, token: string) => {
      setUserInfo(info)
      setToken(token)
      setLoginState(true)
    }

    // 登出
    const logout = () => {
      setUserInfo(null)
      setToken('')
      setLoginState(false)
    }

    // 更新用户信息
    const updateUserInfo = (info: UserInfo) => {
      setUserInfo(info)
    }

    // 初始化状态
    const initState = () => {
      const storedToken = uni.getStorageSync('token')
      if (storedToken) {
        setToken(storedToken)
        setLoginState(true)
      }
    }

    return {
      userInfo,
      isLoggedIn,
      token,
      login,
      logout,
      updateUserInfo,
      initState,
    }
  },
  {
    persist: true,
  },
)
