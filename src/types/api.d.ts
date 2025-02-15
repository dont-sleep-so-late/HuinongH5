import type { UserInfo, LoginResponse } from './user'

export interface ProductParams {
  pageNo?: number
  pageSize?: number
  categoryId?: string
  keyword?: string
  sort?: 'price' | 'createTime'
  order?: 'asc' | 'desc'
}

export interface ProductData {
  name: string
  description: string
  price: number
  stock: number
  unit: string
  categoryId: string
  images: string[]
}

export interface Product extends ProductData {
  id: string
  shopId: string
  shopName: string
  status: 'on' | 'off'
  createTime: string
  updateTime: string
}

export interface Category {
  id: string
  name: string
  icon: string
  sort: number
}

export interface RegisterData {
  username: string
  password: string
  nickname: string
  role: 'buyer' | 'seller'
}

export interface LoginData {
  username: string
  password: string
}

export interface UpdateUserData {
  nickname?: string
  avatar?: string
}

export interface VerifyData {
  realName: string
  idCard: string
  phone: string
  address: string
  idCardFront: string
  idCardBack: string
  idCardHold: string
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface ProductsResponse {
  list: Product[]
  total: number
}

export interface FootprintsResponse {
  list: (Product & { browseTime: string })[]
  total: number
}

export interface PurchaseRecord {
  id: string
  shopId: string
  shopName: string
  productId: string
  productName: string
  cover: string
  quantity: number
  unit: string
  price: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'cancelled'
  statusText: string
  createTime: string
}

export interface PurchaseRecordsResponse {
  list: PurchaseRecord[]
  total: number
}

export interface Api {
  // 商品相关
  getProducts: (params: ProductParams) => Promise<ApiResponse<ProductsResponse>>
  getProductById: (id: string) => Promise<ApiResponse<Product>>
  createProduct: (data: ProductData) => Promise<ApiResponse>
  updateProduct: (id: string, data: Partial<ProductData>) => Promise<ApiResponse>
  deleteProduct: (id: string) => Promise<ApiResponse>

  // 分类相关
  getCategories: () => Promise<ApiResponse<Category[]>>
  getCategoryById: (id: string) => Promise<ApiResponse<Category>>

  // 文件上传
  upload: {
    url: string
    uploadFile: (file: File) => Promise<ApiResponse<string>>
  }

  // 用户相关
  user: {
    register: (data: RegisterData) => Promise<ApiResponse>
    login: (data: LoginData) => Promise<ApiResponse<LoginResponse>>
    getInfo: () => Promise<ApiResponse<UserInfo>>
    updateInfo: (data: UpdateUserData) => Promise<ApiResponse>
    verify: (data: VerifyData) => Promise<ApiResponse>
    getFootprints: (params: {
      pageNo: number
      pageSize: number
    }) => Promise<ApiResponse<FootprintsResponse>>
    deleteFootprint: (id: string) => Promise<ApiResponse>
    clearFootprints: () => Promise<ApiResponse>
    getPurchaseRecords: (params: {
      pageNo: number
      pageSize: number
    }) => Promise<ApiResponse<PurchaseRecordsResponse>>
    confirmPurchase: (id: string) => Promise<ApiResponse>
  }
}
