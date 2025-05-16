import type {
  GoodsFormData,
  GoodsItem,
  Category,
  GoodsQueryParams,
  GoodsListResponse,
} from './goods'
import type { AddressInfo, AddressFormData } from './address'

export interface Api {
  seller: {
    products: {
      getList: (params: GoodsQueryParams) => Promise<ApiResponse<GoodsListResponse>>
      getDetail: (id: string | number) => Promise<ApiResponse<GoodsItem>>
      publish: (data: GoodsFormData) => Promise<ApiResponse<any>>
      update: (id: string | number, data: GoodsFormData) => Promise<ApiResponse<any>>
      updateStatus: (id: string | number, status: number) => Promise<ApiResponse<any>>
      delete: (id: string | number) => Promise<ApiResponse<any>>
    }
  }
  category: {
    getList: () => Promise<ApiResponse<Category[]>>
  }
  upload: {
    url: string
  }
  address: {
    list: () => Promise<ApiResponse<AddressInfo[]>>
    getDetail: (id: number) => Promise<ApiResponse<AddressInfo>>
    create: (data: AddressFormData) => Promise<ApiResponse<AddressInfo>>
    update: (id: number, data: AddressFormData) => Promise<ApiResponse<AddressInfo>>
    delete: (id: number) => Promise<ApiResponse<void>>
    setDefault: (id: number) => Promise<ApiResponse<AddressInfo>>
  }
}

// 通用响应格式
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 分页响应格式
export interface PageResponse<T = any> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
  orders: any[]
  optimizeCountSql: boolean
  searchCount: boolean
  maxLimit: number | null
  countId: string | null
}

// 订单卡片类型
export interface OrderCard {
  orderId: string
  status: string
  image: string
}

// 聊天消息类型
export interface ChatMessage {
  id: number
  type: 'text' | 'image' | 'order'
  content: string | OrderCard
  time: string
  showTime?: boolean
  isSelf: boolean
}

// 聊天列表项
export interface ChatItem {
  id: number
  targetId: number
  targetName: string
  targetAvatar: string
  lastMessage: string
  lastTime: string
  unreadCount: number
}

// 聊天记录响应
export interface ChatHistoryResponse {
  records: ChatMessage[]
  total: number
  size: number
  current: number
}

// 统一响应类型
export type ApiResult<T> = Promise<ApiResponse<T>>
export type PageResult<T> = Promise<ApiResponse<PageResponse<T>>>

// 统一请求配置类型
export interface RequestConfig extends UniApp.RequestOptions {
  showLoading?: boolean
  showError?: boolean
}

// 统一响应拦截器类型
export interface ResponseInterceptor {
  (response: UniApp.RequestSuccessCallbackResult): Promise<any>
}
