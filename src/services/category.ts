import { http } from '@/utils/http'
import type { ApiResponse } from './types'

// 分页数据接口
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// 商品接口
export interface Product {
  id: number
  name: string
  desc: string
  price: number
  mainImage: string // 主图
  salesVolume: number // 销量
  categoryId: number
  status: number
  createdTime: string
  updatedTime: string | null
}

// 分类接口
export interface Category {
  id: number
  name: string
  banner: string
  icon?: string
  sortOrder: number
  children?: Category[]
}

// 获取分类列表
export const getCategories = () => {
  return http.get<ApiResponse<Category[]>>('/api/m/categories/lists')
}

// 商品列表参数
export interface GetCategoryProductsParams {
  categoryId: number
  pageNum?: number
  pageSize?: number
  sort?: 'price_asc' | 'price_desc' | 'sales' | 'new'
  keyword?: string
}

// 获取分类商品列表
export const getCategoryProducts = (params: GetCategoryProductsParams) => {
  return http.get<ApiResponse<PageResult<Product>>>('/api/m/products/category', params)
}

// 搜索商品
export interface SearchProductsParams {
  keyword: string
  categoryId?: number
  pageNum?: number
  pageSize?: number
  sort?: 'price_asc' | 'price_desc' | 'sales' | 'new'
}

export const searchProducts = (params: SearchProductsParams) => {
  return http.get<ApiResponse<PageResult<Product>>>('/api/m/products/search', params)
}
