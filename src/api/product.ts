import { http } from '@/utils/http'

// 商品类型定义
export interface Product {
  id: number
  name: string
  categoryId: number
  price: number
  stock: number
  mainImage: string
  salesVolume: number
  region: string
  unit: string
  weight: number
  status: number
}

// 分页结果类型
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// 排序类型
export type SortField = 'price' | 'sales' | 'time'
export type SortOrder = 'asc' | 'desc'

// 商品列表请求参数
export interface ProductListParams {
  page?: number
  pageSize?: number
  categoryId?: number
  keyword?: string
  sortField?: SortField
  sortOrder?: SortOrder
  minPrice?: number
  maxPrice?: number
  region?: string
}

// 获取商品列表
export function getProductList(params: ProductListParams) {
  return http.get<PageResult<Product>>('/products/list', params)
}
