import { http } from '@/utils/http'

// 用户信息类型
export interface UserInfo {
  id: number
  username: string
  nickname: string | null
  phone: string | null
  email: string | null
  avatar: string | null
  role: 'buyer' | 'seller'
  createTime: string
  updatedTime: string
  lastLoginTime: string
  verified: boolean
}

// 地址类型
export interface Address {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  address: string
  isDefault: boolean
}

// 获取用户信息
export const getUserInfo = () => {
  return http.get<UserInfo>('/user/info')
}

// 更新用户信息
export const updateUserInfo = (data: { nickname?: string; phone?: string; email?: string }) => {
  return http.put('/user/info', data)
}

// 修改密码
export const updatePassword = (data: { oldPassword: string; newPassword: string }) => {
  return http.put('/user/password', data)
}

// 更新头像
export const updateAvatar = (avatarUrl: string) => {
  return http.put(`/user/avatar?avatarUrl=${encodeURIComponent(avatarUrl)}`)
}

// 获取实名认证状态
export const getVerifyStatus = () => {
  return http.get<boolean>('/user/verify/status')
}

// 获取地址列表
export const getAddressList = () => {
  return http.get<Address[]>('/user/addresses')
}

// 新增地址
export const addAddress = (data: Omit<Address, 'id'>) => {
  return http.post<Address>('/user/address', data)
}

// 修改地址
export const updateAddress = (id: number, data: Omit<Address, 'id'>) => {
  return http.put<Address>(`/user/address/${id}`, data)
}

// 删除地址
export const deleteAddress = (id: number) => {
  return http.delete(`/user/address/${id}`)
}

// 设置默认地址
export const setDefaultAddress = (id: number) => {
  return http.put(`/user/address/${id}/default`)
}
