import { http } from '@/utils/http'
import type { ApiResponse } from '@/types/api'

// 退款状态枚举
export enum RefundStatus {
  PENDING = 'PENDING', // 处理中
  APPROVED = 'APPROVED', // 已通过
  REJECTED = 'REJECTED', // 已拒绝
  COMPLETED = 'COMPLETED', // 已完成
}

// 退款申请请求参数
export interface RefundApplyRequest {
  orderId: number
  refundAmount: number
  reason: string
  description?: string
  images?: string[]
}

// 退款申请响应
export interface RefundApplyResponse {
  id: number
  orderId: number
  refundAmount: number
  reason: string
  status: RefundStatus
  createTime: string
}

// 退款详情
export interface RefundDetail extends RefundApplyResponse {
  rejectReason?: string
  updateTime?: string
  orderItem: {
    productId: number
    productName: string
    productImage: string
    specName?: string
    specValue?: string
    price: number
    quantity: number
  }
}

// 退款列表项
export interface RefundListItem {
  id: number
  orderId: number
  orderNo: string
  refundAmount: number
  reason: string
  status: RefundStatus
  createTime: string
  orderItem: {
    productId: number
    productName: string
    productImage: string
    specName?: string
    specValue?: string
    price: number
    quantity: number
  }
}

// 退款列表请求参数
export interface RefundListRequest {
  pageNum?: number
  pageSize?: number
  status?: RefundStatus
}

// 退款列表响应
export interface RefundListResponse {
  total: number
  pages: number
  pageNum: number
  pageSize: number
  list: RefundListItem[]
}

// 申请退款
export function applyRefund(data: RefundApplyRequest): Promise<ApiResponse<RefundApplyResponse>> {
  return http.post(`/orders/${data.orderId}/refund`, data)
}

// 获取退款详情
export function getRefundDetail(orderId: number): Promise<ApiResponse<RefundDetail>> {
  return http.get(`/orders/${orderId}/refund`)
}

// 取消退款申请
export function cancelRefund(orderId: number): Promise<ApiResponse<void>> {
  return http.post(`/orders/${orderId}/refund/cancel`)
}

// 获取退款列表
export function getRefundList(params: RefundListRequest): Promise<ApiResponse<RefundListResponse>> {
  return http.get('/orders/refunds', { params })
}
