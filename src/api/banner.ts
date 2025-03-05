import { http } from '@/utils/http'

// 轮播图数据类型
export interface Banner {
  id: number
  title: string
  imageUrl: string
  linkUrl?: string
  sortOrder?: number
  status: number
  remark?: string
  createdTime: string
  updatedTime: string
}

// 获取首页轮播图列表
export function getHomeBanners() {
  return http.get<Banner[]>('/banner/home')
}
