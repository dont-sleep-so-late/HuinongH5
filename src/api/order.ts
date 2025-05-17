import { http } from '@/utils/http'
import type { ApiResponse } from '@/types/api'
import type { PaymentMethod } from '@/api/pay'

// 售后列表参数
interface AfterSaleListParams {
  pageNo: number
  pageSize: number
  status?: string
}

// 申请售后参数
interface ApplyAfterSaleParams {
  orderId: number
  type: 'refund' | 'return'
  reason: string
  refundAmount: number
  description?: string
  images?: string[]
}

// 订单状态
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'refunded'

// 订单商品项
export interface OrderItem {
  productId: number
  productName: string
  productImage: string
  specId: number
  specName: string
  specValue: string
  price: number
  quantity: number
  subtotal: number
}

// 优惠券信息
export interface Coupon {
  id: number
  name: string
  type: 'amount' | 'discount'
  value: number
  minAmount: number
  endTime: string
}

// 收货地址信息
export interface AddressInfo {
  id: number
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  detailAddress: string
}

// 订单预览响应
export interface OrderPreviewResponse {
  productList: OrderItem[]
  totalAmount: number
  freightAmount: number
  discountAmount: number
  payableAmount: number
  availableCoupons: Coupon[]
  address?: AddressInfo
}

// 创建订单请求参数
export interface CreateOrderParams {
  addressId: number
  remark?: string
  paymentMethod: PaymentMethod
  [key: string]: any
}

// 支付参数
export interface PaymentParams {
  payUrl: string
}

// 创建订单响应
export interface CreateOrderResponse {
  orderId: string
  orderNo: string
  totalAmount: number
  payableAmount: number
}

// 物流信息
export interface LogisticsTrace {
  time: string
  status: string
  location: string
}

export interface LogisticsInfo {
  company: string
  trackingNumber: string
  status: 'pending' | 'shipping' | 'delivered'
  traces: LogisticsTrace[]
}

// 订单列表项
export interface OrderListItem {
  id: number
  orderNo: string
  status: OrderStatus
  totalAmount: number
  freightAmount: number
  payableAmount: number
  createdTime: string
  items: OrderItem[]
}

// 订单列表响应
export interface OrderListResponse {
  total: number
  pages: number
  pageNum: number
  pageSize: number
  list: OrderListItem[]
}

// 订单状态数量
export interface OrderCount {
  pendingCount: number
  paidCount: number
  shippedCount: number
  completedCount: number
}

// 订单详情
export interface OrderDetail {
  orderId: number
  orderNo: string
  status: OrderStatus
  createTime: string
  payTime?: string
  deliveryTime?: string
  receiveTime?: string
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  remark: string
  totalAmount: number
  freightAmount: number
  payableAmount: number
  couponAmount: number
  shopName: string
  shopAvatar: string
  deliveryType: string
  orderItems: OrderItem[]
  paymentMethod?: PaymentMethod
}

// 获取售后列表
export const getAfterSaleList = (params: AfterSaleListParams) => {
  return http.get('/orders/after-sale/list', { params })
}

// 获取售后详情
export const getAfterSaleDetail = (id: number) => {
  return http.get(`/orders/after-sale/${id}`)
}

// 申请售后
export const applyAfterSale = (data: ApplyAfterSaleParams) => {
  return http.post('/orders/after-sale/apply', data)
}

// 取消售后
export const cancelAfterSale = (id: number) => {
  return http.post(`/orders/after-sale/${id}/cancel`)
}

// 立即购买预览
export function previewBuyNowOrder(params: {
  productId: number
  specId: number
  quantity: number
}) {
  return http.post<ApiResponse<OrderPreviewResponse>>('/orders/preview/buy-now', params)
}

// 立即购买下单
export const createBuyNowOrder = (
  params: CreateOrderParams,
): Promise<ApiResponse<CreateOrderResponse>> => {
  return http.post('/orders/buy-now', params)
}

// 购物车下单
export const createCartOrder = (
  params: CreateOrderParams,
): Promise<ApiResponse<CreateOrderResponse>> => {
  return http.post('/orders/cart', params)
}

// 获取订单列表
export function getOrderList(params: {
  status?: OrderStatus
  pageNum?: number
  pageSize?: number
}) {
  return http.get<ApiResponse<OrderListResponse>>('/orders', { params })
}

// 获取订单状态数量
export function getOrderCount() {
  return http.get<ApiResponse<OrderCount>>('/orders/count')
}

// 获取订单详情
export function getOrderDetail(orderId: number) {
  return http.get<ApiResponse<OrderDetail>>(`/orders/${orderId}`)
}

// 取消订单
export function cancelOrder(orderId: number) {
  return http.post<ApiResponse<null>>(`/orders/${orderId}/cancel`)
}

// 确认收货
export function confirmOrder(orderId: number) {
  return http.post<ApiResponse<null>>(`/orders/${orderId}/confirm`)
}
