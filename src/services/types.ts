// API响应数据基础接口
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}
