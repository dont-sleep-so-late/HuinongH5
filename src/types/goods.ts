// 商品状态
export type GoodsStatus = 'on' | 'off'

// 商品项
export interface GoodsItem {
  id: string
  name: string
  cover: string
  price: number
  stock: number
  status: GoodsStatus
  description: string
  images: string[]
  categoryId: string
  createTime: string
  updateTime: string
}

// 商品列表查询参数
export interface GoodsQueryParams {
  pageNo: number
  pageSize: number
  status?: GoodsStatus
  categoryId?: string
  keyword?: string
}

// 商品列表响应
export interface GoodsListResponse {
  list: GoodsItem[]
  total: number
}

// 商品表单数据
export interface GoodsFormData {
  name: string
  cover: string
  price: number
  stock: number
  status: GoodsStatus
  description: string
  images: string[]
  categoryId: string
}
