import { http } from '@/utils/http'
import type { ApiResponse } from '@/types/api'

// 地址信息
export interface AddressInfo {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
  createdTime: string
  updatedTime: string
}

// 地址表单数据
export interface AddressFormData {
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

// 获取地址列表
export function getAddressList() {
  return http.get<ApiResponse<AddressInfo[]>>('/user/addresses')
}

// 新增地址
export function createAddress(data: AddressFormData) {
  return http.post<ApiResponse<AddressInfo>>('/user/address', data)
}

// 修改地址
export function updateAddress(id: number, data: AddressFormData) {
  return http.put<ApiResponse<AddressInfo>>(`/user/address/${id}`, data)
}

// 删除地址
export function deleteAddress(id: number) {
  return http.delete<ApiResponse<null>>(`/user/address/${id}`)
}

// 设置默认地址
export function setDefaultAddress(id: number) {
  return http.put<ApiResponse<null>>(`/user/address/${id}/default`)
}

// 获取地址详情
export function getAddressDetail(id: number) {
  return http.get<ApiResponse<AddressInfo>>(`/user/address/${id}`)
}
