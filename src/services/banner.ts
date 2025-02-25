import { http } from '@/utils/http'
import type { ApiResponse } from './types'

// 轮播图数据接口
export interface Banner {
  id: number
  image: string
  url: string
  title: string
  status: number
  sort: number
  createdTime: string
  updatedTime: string | null
}

// 获取活动轮播图列表
export const getActiveBanners = () => {
  return http.get<ApiResponse<Banner[]>>('/api/banner/active')
}
