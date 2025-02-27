import { http } from '@/utils/http'
import type { ApiResponse } from './types'

// 优惠券类型
export type CouponType = 'discount' | 'cash' | 'unlimited'

// 优惠券使用范围
export type CouponScope = 'all' | 'category' | 'product'

// 优惠券状态
export type CouponStatus = 'available' | 'used' | 'expired'

// 优惠券信息接口
export interface Coupon {
  id: number
  name: string
  type: CouponType
  value: number // 优惠金额（元）或折扣率（0-1之间小数）
  minAmount: number // 使用门槛，0表示无门槛
  startTime: string
  endTime: string
  status: CouponStatus
  scope: CouponScope
  scopeIds?: number[] // 适用范围的ID（分类ID或商品ID）
  description: string
  useRules: string
  receiveTime?: string // 领取时间
  usedTime?: string // 使用时间
}

// 优惠券列表查询参数
export interface GetCouponsParams {
  status?: CouponStatus
  pageNum: number
  pageSize: number
}

// 分页数据接口
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/**
 * 获取可领取的优惠券列表
 */
export const getAvailableCoupons = (params: GetCouponsParams) => {
  return http.get<ApiResponse<PageResult<Coupon>>>('/api/m/coupons/available', params)
}

/**
 * 获取我的优惠券列表
 */
export const getMyCoupons = (params: GetCouponsParams) => {
  return http.get<ApiResponse<PageResult<Coupon>>>('/api/m/coupons/my', params)
}

/**
 * 领取优惠券
 */
export const receiveCoupon = (couponId: number) => {
  return http.post<ApiResponse>(`/api/m/coupons/${couponId}/receive`)
}

/**
 * 获取商品可用的优惠券
 */
export const getProductCoupons = (productId: number) => {
  return http.get<ApiResponse<Coupon[]>>(`/api/m/coupons/product/${productId}`)
}

/**
 * 根据订单金额获取可用的优惠券
 */
export const getOrderCoupons = (orderAmount: number) => {
  return http.get<ApiResponse<Coupon[]>>('/api/m/coupons/order', { orderAmount })
}
