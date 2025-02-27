// 商品状态
export type GoodsStatus = 0 | 1

// 商品项
export interface GoodsItem {
  id: string | number
  name: string
  mainImage: string
  detailImages: string[]
  price: number
  stock: number
  status: GoodsStatus
  description: string
  categoryId: string | number
  region: string
  specs: SpecItem[]
  unit?: string
  sales?: number
  createTime?: string
  updateTime?: string
}

// 商品列表查询参数
export interface GoodsQueryParams {
  pageNum: number
  pageSize: number
  name?: string
  status?: GoodsStatus
  categoryId?: string | number
  sort?: string
}

// 商品列表响应
export interface GoodsListResponse {
  list: GoodsItem[]
  total: number
}

// 商品表单数据
export interface GoodsFormData {
  name: string
  categoryId: string | number
  region: string
  price: number
  stock: number
  mainImage: string
  detailImages: string[]
  description: string
  status: GoodsStatus
  specs: SpecItem[]
}

export interface SpecItem {
  specName: string
  specValue: string
  price: number
  stock: number
}

export interface Category {
  id: number | string
  name: string
  parentId?: number | string
  children?: Category[]
}

export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}
