import { http } from '@/utils/http'
import type { ApiResponse } from './types'

// 购物车项接口
export interface CartItem {
  id: number
  productId: number
  productName: string
  productImage: string
  specId: number
  specName: string
  quantity: number
  price: number
  totalPrice: number
  selected: number
  stock: number
}

// 添加到购物车的参数
export interface AddToCartParams {
  productId: number
  specId: number
  quantity: number
}

/**
 * 添加商品到购物车
 */
export const addToCart = (data: AddToCartParams) => {
  return http.post<ApiResponse>('/api/m/cart', data)
}

/**
 * 获取购物车列表
 */
export const getCartList = () => {
  return http.get<ApiResponse<CartItem[]>>('/api/m/cart/list')
}

/**
 * 更新购物车商品数量
 */
export const updateCartQuantity = (cartId: number, quantity: number) => {
  return http.put<ApiResponse>(`/api/m/cart/${cartId}/quantity?quantity=${quantity}`)
}

/**
 * 删除购物车商品
 */
export const deleteCartItems = (cartIds: number[]) => {
  return http.delete<ApiResponse>('/api/m/cart', cartIds)
}
