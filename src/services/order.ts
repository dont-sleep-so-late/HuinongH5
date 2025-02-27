import { http } from '@/utils/http'
import type { ApiResponse } from './types'

// 订单状态
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'shipped'
  | 'received'
  | 'cancelled'
  | 'refunding'
  | 'refunded'

// 物流状态
export type LogisticsStatus = 'pending' | 'shipping' | 'delivered' | 'received'

// 订单商品信息
export interface OrderProduct {
  id: number
  productId: number
  name: string
  mainImage: string
  price: number
  quantity: number
  totalAmount: number
}

// 订单地址信息
export interface OrderAddress {
  name: string
  phone: string
  province: string
  city: string
  district: string
  address: string
  postalCode: string
}

// 物流节点信息
export interface LogisticsNode {
  time: string
  status: string
  location: string
  operator: string
  coordinates?: {
    longitude: number
    latitude: number
  }
}

// 物流信息
export interface LogisticsInfo {
  logisticsId: string
  logisticsCompany: string
  logisticsNumber: string
  status: LogisticsStatus
  nodes: LogisticsNode[]
  currentLocation?: {
    longitude: number
    latitude: number
    address: string
    updateTime: string
  }
}

// 订单详情
export interface OrderDetail {
  id: number
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  products: OrderProduct[]
  address: OrderAddress
  logistics: LogisticsInfo
  createdTime: string
  payTime?: string
  shipTime?: string
  receiveTime?: string
  couponAmount?: number // 优惠券抵扣金额
  couponInfo?: {
    id: number
    name: string
    type: string
    value: number
  } // 优惠券信息
  remark?: string
}

// 订单预览商品项
export interface OrderPreviewItem {
  productId: number
  productName: string
  productImage: string
  specId: number
  specName: string
  quantity: number
  price: number
  totalPrice: number
}

// 订单预览信息
export interface OrderPreview {
  items: OrderPreviewItem[]
  totalQuantity: number
  totalAmount: number
  freightAmount: number
  payAmount: number
}

// 立即购买预览参数
export interface BuyNowPreviewParams {
  productId: number
  specId: number
  quantity: number
}

// 立即购买下单参数
export interface BuyNowOrderParams {
  productId: number
  specId: number
  quantity: number
  addressId: number
  couponId?: number
  remark?: string
}

// 购物车下单参数
export interface CartOrderParams {
  cartItemIds: number[]
  addressId: number
  couponId?: number
  remark?: string
}

/**
 * 获取订单详情
 * @param orderId 订单ID
 */
export const getOrderDetail = (orderId: number) => {
  return http.get<ApiResponse<OrderDetail>>('/api/orders/' + orderId)
}

/**
 * 获取物流信息
 * @param orderId 订单ID
 */
export const getLogisticsInfo = (orderId: number) => {
  return http.get<ApiResponse<LogisticsInfo>>('/api/orders/' + orderId + '/logistics')
}

/**
 * 立即购买预览
 */
export const previewBuyNowOrder = (params: BuyNowPreviewParams) => {
  return http.post<ApiResponse<OrderPreview>>(
    `/api/m/orders/preview/buy-now?productId=${params.productId}&specId=${params.specId}&quantity=${params.quantity}`,
  )
}

/**
 * 购物车预览
 */
export const previewCartOrder = (cartItemIds: number[]) => {
  return http.post<ApiResponse<OrderPreview>>('/api/m/orders/preview/cart', cartItemIds)
}

/**
 * 立即购买下单
 */
export const createBuyNowOrder = (params: BuyNowOrderParams) => {
  return http.post<ApiResponse<number>>('/api/m/orders/buy-now', params)
}

/**
 * 购物车下单
 */
export const createCartOrder = (params: CartOrderParams) => {
  return http.post<ApiResponse<number>>('/api/m/orders/cart', params)
}
