import { http } from '@/utils/http'
import type { ApiResponse } from '@/types/api'

// 支付方式
export type PaymentMethod = 'ALIPAY' | 'WECHAT'

// 支付结果类型
export interface PayResult {
  orderId: string
  status: 'UNPAID' | 'PAID' | 'CLOSED'
  amount: number
  paymentMethod: PaymentMethod
  payTime?: string
  tradeNo?: string
}

// 支付订单响应类型
export interface PayOrderResult {
  orderId: string
  paymentForm: string
  paymentMethod: PaymentMethod
  amount: number
}

// 创建支付订单
export const createPayOrder = (
  orderId: string,
  paymentMethod: PaymentMethod,
): Promise<ApiResponse<PayOrderResult>> => {
  return http.post(`/pay/${paymentMethod.toLowerCase()}/create`, { orderId })
}

// 查询支付订单状态
export const queryPayOrder = (
  orderId: string,
  paymentMethod: PaymentMethod,
): Promise<ApiResponse<string>> => {
  return http.get(`/pay/${paymentMethod.toLowerCase()}/query`, { params: { orderId } })
}

// 查询支付结果
export const getPayResult = (orderId: string): Promise<ApiResponse<string>> => {
  return http.get('/pay/alipay/query', { params: { orderId } })
}

// 支付成功
export const paySuccess = (orderId: string): Promise<ApiResponse<PayResult>> => {
  return http.post('/pay/alipay/return', { orderId })
}
