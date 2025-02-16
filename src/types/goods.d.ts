// 商品状态类型
export type GoodsStatus = 'on' | 'off'

// 排序字段
export type SortField = 'price' | 'createTime'

// 排序方式
export type SortOrder = 'asc' | 'desc'

// 商品查询参数
export interface GoodsQueryParams {
  pageNo: number
  pageSize: number
  status?: GoodsStatus
  keyword?: string
  categoryId?: string
  sort?: SortField
  order?: SortOrder
}

// 商品基础数据
export interface GoodsBaseInfo {
  name: string
  description: string
  price: number
  stock: number
  unit: string
  categoryId: string
  images: string[]
  cover: string
}

// 商品完整信息
export interface GoodsItem extends GoodsBaseInfo {
  id: string | number
  status: GoodsStatus
  sales: number
  createTime: string
  updateTime: string
}

// 商品列表响应
export interface GoodsListResponse {
  list: GoodsItem[]
  total: number
}
