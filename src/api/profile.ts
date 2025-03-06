import { http } from '@/utils/http'
import type { ApiResponse, PageResponse } from '@/types/api'

// 关注的商品
export interface FavoriteProduct {
  productId: number
  productName: string
  mainImage: string
  price: number
  salesVolume: number
  favoriteTime: string
}

// 关注的商家
export interface FavoriteSeller {
  sellerId: number
  sellerName: string
  avatar: string
  productCount: number
  followerCount: number
  favoriteTime: string
}

// 浏览足迹
export interface BrowsingHistory {
  productId: number
  productName: string
  mainImage: string
  price: number
  salesVolume: number
  browsingTime: string
  sellerId: number
  sellerName: string
  sellerAvatar: string
}

export interface UserCenterStats {
  favoriteProductCount: number
  favoriteSellerCount: number
  browsingHistoryCount: number
}

// 获取用户个人中心统计数据
export function getUserCenterStats() {
  return http.get<ApiResponse<UserCenterStats>>('/profile/stats')
}

// 获取关注的商品列表
export function getFavoriteProducts(params: { pageNum?: number; pageSize?: number }) {
  return http.get<ApiResponse<PageResponse<FavoriteProduct>>>('/profile/favorites/products', {
    params,
  })
}

// 获取关注的商家列表
export function getFavoriteSellers(params: { pageNum?: number; pageSize?: number }) {
  return http.get<ApiResponse<PageResponse<FavoriteSeller>>>('/profile/favorites/sellers', {
    params,
  })
}

// 获取浏览足迹
export function getBrowsingHistory(params: { pageNum?: number; pageSize?: number }) {
  return http.get<ApiResponse<PageResponse<BrowsingHistory>>>('/profile/browsing-history', {
    params,
  })
}

// 关注/取消关注商品
export function toggleFavoriteProduct(productId: number) {
  return http.post<ApiResponse<boolean>>(`/profile/favorites/products/${productId}`)
}

// 关注/取消关注商家
export function toggleFavoriteSeller(sellerId: number) {
  return http.post<ApiResponse<boolean>>(`/profile/favorites/sellers/${sellerId}`)
}

// 清空浏览足迹
export function clearBrowsingHistory() {
  return http.delete<ApiResponse<null>>('/profile/browsing-history')
}
