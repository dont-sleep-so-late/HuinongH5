import { http } from '@/utils/http'
import type { ApiResponse } from '@/types/api'

// 购物车项类型
export interface CartItem {
  id: number
  productId: number
  productName: string
  productImage: string
  specId: number
  specName: string
  specValue: string
  quantity: number
  price: number
  totalPrice: number
  selected: number
  stock: number
}

// 购物车汇总信息
export interface CartSummary {
  totalCount: number
  selectedCount: number
  totalAmount: number
  selectedAmount: number
}

// 购物车列表响应
export type CartListResponse = CartItem[]

// 添加购物车参数
export interface AddCartParams {
  productId: number
  specId: number
  quantity: number
}

// 添加商品到购物车
export function addToCart(params: AddCartParams) {
  return http.post<ApiResponse<null>>('/cart', params)
}

// 获取购物车列表
export function getCartList() {
  return http.get<ApiResponse<CartListResponse>>('/cart/list')
}

// 修改购物车商品数量
export function updateCartQuantity(cartItemId: number, quantity: number) {
  return http.put<ApiResponse<null>>(`/cart/${cartItemId}/quantity`, { quantity })
}

// 选中/取消选中购物车商品
export function updateCartItemSelected(cartItemId: number, selected: number) {
  return http.put<ApiResponse<null>>(`/cart/${cartItemId}/selected`, { selected })
}

// 全选/取消全选
export function updateAllSelected(selected: number) {
  return http.put<ApiResponse<null>>('/cart/selected', { selected })
}

// 删除购物车商品
export function deleteCartItem(cartItemId: number) {
  return http.delete<ApiResponse<null>>(`/cart/${cartItemId}`)
}

// 批量删除购物车商品
export function deleteCartItems(cartItemIds: number[]) {
  return http.delete<ApiResponse<null>>('/cart', { data: { cartItemIds } })
}

// 获取购物车商品数量
export function getCartCount() {
  return http.get<ApiResponse<number>>('/cart/count')
}
