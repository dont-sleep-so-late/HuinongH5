import type {
  GoodsFormData,
  GoodsItem,
  Category,
  ApiResponse,
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
