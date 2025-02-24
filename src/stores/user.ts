import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/services/user'

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
        uni.setStorageSync('isVerified', info.isVerified)
      } else {
        uni.removeStorageSync('userRole')
        uni.removeStorageSync('isVerified')
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
    const login = (info: UserInfo) => {
      setUserInfo(info)
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
        // TODO: 调用接口获取用户信息
      }
    }

    return {
      userInfo,
      isLoggedIn,
      token,
      setUserInfo,
      setLoginState,
      setToken,
      login,
      logout,
      updateUserInfo,
      initState,
    }
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          key: 'user',
          storage: {
            setItem(key: string, value: string) {
              uni.setStorageSync(key, value)
            },
            getItem(key: string) {
              return uni.getStorageSync(key)
            },
          },
        },
      ],
    },
  },
)
