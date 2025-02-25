import { http } from '@/utils/http'
import type { ApiResponse } from './types'

// 商品数据接口
export interface Product {
  id: number
  name: string
  mainImage: string
  price: number
  salesVolume: number
  region: string
  sellerName: string
}

// 分页数据接口
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// 排序方式
export type SortType = 'new' | 'price_asc' | 'price_desc' | 'sales'

// 获取首页商品列表参数
export interface GetHomeProductsParams {
  pageNum: number
  pageSize: number
  categoryId?: number
  sort?: SortType
}

// 获取首页商品列表
export const getHomeProducts = (params: GetHomeProductsParams) => {
  return http.get<ApiResponse<PageResult<Product>>>('/api/m/products/home', params)
}
