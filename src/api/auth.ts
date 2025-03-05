import { http } from '@/utils/http'
import type { LoginParams, RegisterParams, VerifyCodeParams, LoginResponse } from '@/types/auth'

// 登录接口
export function login(data: LoginParams) {
  return http.post<LoginResponse>('/auth/login', data)
}

// 注册接口
export function register(data: RegisterParams) {
  return http.post<LoginResponse>('/auth/register', data)
}

// 发送验证码
export function sendVerifyCode(data: VerifyCodeParams) {
  return http.post<string>('/auth/verify-code', data)
}

// 手机号密码登录
export function loginByPhone(data: { phone: string; password: string; role: string }) {
  return login({
    type: 'phone',
    account: data.phone,
    password: data.password,
    role: data.role,
  })
}

// 手机号验证码登录
export function loginByPhoneCode(data: { phone: string; code: string; role: string }) {
  return login({
    type: 'phone',
    account: data.phone,
    verifyCode: data.code,
    role: data.role,
  })
}

// 邮箱密码登录
export function loginByEmail(data: { email: string; password: string; role: string }) {
  return login({
    type: 'email',
    account: data.email,
    password: data.password,
    role: data.role,
  })
}

// 邮箱验证码登录
export function loginByEmailCode(data: { email: string; code: string; role: string }) {
  return login({
    type: 'email',
    account: data.email,
    verifyCode: data.code,
    role: data.role,
  })
}

// 发送手机验证码
export function sendPhoneCode(data: { phone: string; type: 'login' | 'register' | 'reset' }) {
  return sendVerifyCode({
    phone: data.phone,
    type: data.type,
  })
}

// 发送邮箱验证码
export function sendEmailCode(data: { email: string; type: 'login' | 'register' | 'reset' }) {
  return sendVerifyCode({
    email: data.email,
    type: data.type,
  })
}

// 退出登录
export function logout() {
  return http.post('/auth/logout')
}
