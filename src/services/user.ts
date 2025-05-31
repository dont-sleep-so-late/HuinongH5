import { http } from '@/utils/http'
import type { ApiResponse } from './types'

// 用户统计数据
export interface UserStats {
  followGoods: number
  followShops: number
  footprints: number
  purchaseRecords: number
}

// 订单数量统计
export interface OrderCounts {
  reserved: number
  shipped: number
  received: number
  afterSale: number
}

// 用户信息
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

// 获取用户信息
export const getUserInfo = () => {
  return http.get<ApiResponse<UserInfo>>('/user/info')
}

// 更新用户信息
export interface UpdateUserInfoParams {
  nickname?: string
  email?: string
  phone?: string
}

export const updateUserInfo = (data: UpdateUserInfoParams) => {
  return http.put<ApiResponse>('/user/info', data)
}

// 修改密码
export interface UpdatePasswordParams {
  oldPassword: string
  newPassword: string
}

export const updatePassword = (data: UpdatePasswordParams) => {
  return http.put<ApiResponse>('/user/password', data)
}

// 头像上传响应数据
interface AvatarResponse {
  data: string
}

// 更新头像
export const updateAvatar = async (filePath: string) => {
  return new Promise<ApiResponse<AvatarResponse>>((resolve, reject) => {
    uni.uploadFile({
      url: `${http.config.baseURL}/user/avatar`,
      filePath,
      name: 'file',
      header: {
        Authorization: `Bearer ${uni.getStorageSync('token')}`,
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 200) {
            resolve(data)
          } else {
            reject(new Error(data.message || '上传失败'))
          }
        } catch (error) {
          reject(new Error('解析响应数据失败'))
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '上传失败'))
      },
    })
  })
}

// 上传文件
export const uploadFile = async (filePath: string) => {
  return new Promise<{ url: string }>((resolve, reject) => {
    uni.uploadFile({
      url: `${http.config.baseURL}/upload`,
      filePath,
      name: 'file',
      header: {
        Authorization: `Bearer ${uni.getStorageSync('token')}`,
      },
      success: (res) => {
        const data = JSON.parse(res.data)
        if (data.code === 200) {
          resolve(data.data)
        } else {
          reject(new Error(data.message))
        }
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}
