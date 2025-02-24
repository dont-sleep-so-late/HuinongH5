import { http } from '@/utils/http'
import type { UserInfo } from '@/stores/user'

// API响应数据基础接口
interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 登录请求参数类型
interface LoginParams {
  phone: string
  password: string
  role: 'buyer' | 'seller'
}

// 登录响应数据类型
interface LoginResponse {
  token: string
  userInfo: UserInfo
}

// 验证码类型
type CodeType = 'register' | 'login' | 'reset' | 'bind'

/**
 * 手机号密码登录
 */
export const loginByPhone = (data: {
  phone: string
  password: string
  role: 'buyer' | 'seller'
}) => {
  return http.post<ApiResponse<LoginResponse>>('/api/auth/login', data)
}

/**
 * 手机号验证码登录
 */
export const loginByPhoneCode = (data: {
  phone: string
  code: string
  role: 'buyer' | 'seller'
}) => {
  return http.post<ApiResponse<LoginResponse>>('/api/auth/login/code', data)
}

/**
 * 发送手机验证码
 */
export const sendPhoneCode = (data: { phone: string; type: CodeType }) => {
  return http.post<ApiResponse<{ expireTime: number }>>('/api/auth/send-code', data)
}

/**
 * 邮箱密码登录
 */
export const loginByEmail = (data: {
  email: string
  password: string
  role: 'buyer' | 'seller'
}) => {
  return http.post<ApiResponse<LoginResponse>>('/api/auth/email/login', data)
}

/**
 * 邮箱验证码登录
 */
export const loginByEmailCode = (data: {
  email: string
  code: string
  role: 'buyer' | 'seller'
}) => {
  return http.post<ApiResponse<LoginResponse>>('/api/auth/email/login/code', data)
}

/**
 * 发送邮箱验证码
 */
export const sendEmailCode = (data: { email: string; type: CodeType }) => {
  return http.post<ApiResponse<{ expireTime: number }>>('/api/auth/email/code/send', data)
}

/**
 * 邮箱注册
 */
export const registerByEmail = (data: {
  email: string
  password: string
  code: string
  role: 'buyer' | 'seller'
  nickname?: string
}) => {
  return http.post<ApiResponse<LoginResponse>>('/api/auth/email/register', data)
}

/**
 * 重置邮箱密码
 */
export const resetEmailPassword = (data: { email: string; code: string; password: string }) => {
  return http.post<ApiResponse>('/api/auth/email/password/reset', data)
}

/**
 * 退出登录
 */
export const logout = () => {
  return http.post<ApiResponse>('/api/auth/logout')
}
