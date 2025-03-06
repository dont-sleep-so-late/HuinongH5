import { http } from '@/utils/http'
import type { ApiResponse, PageResult } from '@/types/api'

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

// 商品详情
export interface ProductDetail extends ProductBase {
  originalPrice?: number
  sellerAvatar: string
}

// 商品规格
export interface ProductSpec {
  id: number
  specName: string
  specValue: string
  price: number
  stock: number
  skuCode: string
}

// 排序方式
export type SortType = 'new' | 'price_asc' | 'price_desc' | 'sales'

// 排序字段
export type SortField = 'price' | 'sales' | 'time'

// 排序方向
export type SortOrder = 'asc' | 'desc'

// 基础查询参数
export interface BaseQueryParams {
  pageNum?: number
  pageSize?: number
  categoryId?: number
  sort?: SortType
}

// 搜索参数
export interface SearchParams extends BaseQueryParams {
  keyword?: string
}

// 高级查询参数
export interface AdvancedQueryParams extends SearchParams {
  sortField?: SortField
  sortOrder?: SortOrder
  minPrice?: number
  maxPrice?: number
  region?: string
  latitude?: number
  longitude?: number
}

// 获取商品详情
export function getProductDetail(id: number) {
  return http.get<ApiResponse<ProductDetail>>(`/products/${id}`)
}

// 获取首页商品列表
export function getHomeProducts(params: BaseQueryParams) {
  return http.get<ApiResponse<PageResult<ProductBase>>>('/products/home', { params })
}

// 搜索商品
export function searchProducts(params: SearchParams) {
  return http.get<ApiResponse<PageResult<ProductBase>>>('/products/search', { params })
}

// 高级商品列表查询
export function getProductList(params: AdvancedQueryParams) {
  return http.get<ApiResponse<PageResult<ProductBase>>>('/products/list', { params })
}

// 获取商品规格列表
export function getProductSpecs(productId: number) {
  return http.get<ApiResponse<ProductSpec[]>>(`/products/${productId}/specs`)
}
