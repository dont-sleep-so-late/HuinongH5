import type { UserInfo } from '@/stores/user'

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 登录参数类型
export interface LoginParams {
  type: 'account' | 'phone' | 'email'
  account: string
  password?: string
  verifyCode?: string
  role: string
}

// 注册参数类型
export interface RegisterParams {
  type: 'phone' | 'email'
  username: string
  password: string
  phone?: string
  email?: string
  verifyCode: string
  role: 'buyer' | 'seller'
}

// 验证码参数类型
export interface VerifyCodeParams {
  phone?: string
  email?: string
  type: 'login' | 'register' | 'reset'
}

// 登录响应类型
export interface LoginResponse {
  userId: number
  token: string
  userInfo: UserInfo
}
