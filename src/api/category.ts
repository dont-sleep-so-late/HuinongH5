import { http } from '@/utils/http'
import type { ApiResponse, PageResult, PageResponse } from '@/types/api'

// 分类类型定义
export interface Category {
  id: number
  name: string
  icon?: string
  banner?: string
  sort: number
  children?: Category[]
}

// 商品类型定义
export interface Product {
  id: number
  name: string
  price: number
  mainImage: string
  sales: number
  region: string
  categoryName: string
  description?: string
}

// 商品列表查询参数
export interface ProductQueryParams {
  pageNum?: number
  pageSize?: number
  categoryId?: number
  keyword?: string
  sort?: 'new' | 'price_asc' | 'price_desc' | 'sales'
  sortField?: 'price' | 'sales' | 'time'
  sortOrder?: 'asc' | 'desc'
  minPrice?: number
  maxPrice?: number
  region?: string
}

// 商品基础信息
export interface ProductBase {
  id: number
  name: string
  description: string
  mainImage: string
  detailImages: string[]
  categoryId: number
  categoryName: string
  price: number
  stock: number
  status: number
  salesVolume: number
  region: string
  unit: string
  weight: number
  createdTime: string
  updatedTime: string
  sellerId: number
  sellerName: string
  auditStatus: number
  auditRemark: string | null
}

// 获取分类树
export function getCategoryTree() {
  return http.get<ApiResponse<Category[]>>('/categories/tree')
}

// 获取分类商品列表
export function getCategoryProducts(params: ProductQueryParams) {
  return http.get<ApiResponse<PageResponse<ProductBase>>>('/products/category', { params })
}

// 搜索商品
export function searchProducts(params: ProductQueryParams) {
  return http.get<ApiResponse<PageResult<Product>>>('/products/search', { params })
}

// 获取商品列表（高级筛选）
export function getProductList(params: ProductQueryParams) {
  return http.get<ApiResponse<PageResult<Product>>>('/products/list', { params })
}
