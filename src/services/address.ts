import { http } from '@/utils/http'
import type { ApiResponse } from './types'
import type { AddressInfo, AddressFormData } from '@/types/address'

/**
 * 地址相关接口
 */
export const addressService = {
  // 获取地址列表
  list: () => {
    return http.get<ApiResponse<AddressInfo[]>>('/api/m/address/list')
  },

  // 获取地址详情
  getDetail: (addressId: number) => {
    return http.get<ApiResponse<AddressInfo>>(`/api/m/address/${addressId}`)
  },

  // 获取默认地址
  getDefault: () => {
    return http.get<ApiResponse<AddressInfo>>('/api/m/address/default')
  },

  // 添加地址
  create: (address: AddressFormData) => {
    return http.post<ApiResponse<AddressInfo>>('/api/m/address', address)
  },

  // 更新地址
  update: (addressId: number, address: AddressFormData) => {
    return http.put<ApiResponse<AddressInfo>>(`/api/m/address/${addressId}`, address)
  },

  // 删除地址
  delete: (addressId: number) => {
    return http.delete<ApiResponse<void>>(`/api/m/address/${addressId}`)
  },

  // 设置默认地址
  setDefault: (addressId: number) => {
    return http.put<ApiResponse<AddressInfo>>(`/api/m/address/${addressId}/default`)
  },
}
