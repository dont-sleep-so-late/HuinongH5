// 认证状态枚举
export type VerificationStatus = 'pending' | 'approved' | 'rejected'

// 认证信息接口
export interface Verification {
  id: number
  userId: number
  realName: string
  idCardNumber: string
  idCardFrontImage: string
  idCardBackImage: string
  status: VerificationStatus
  rejectReason: string | null
  createdTime: string
  updatedTime: string
}

// 提交认证请求参数
export interface SubmitVerificationParams {
  realName: string
  idCard: string
  idCardFront: string
  idCardBack: string
}

// 认证列表查询参数
export interface VerificationQueryParams {
  pageNum?: number
  pageSize?: number
  status?: VerificationStatus
}

// 认证列表响应
export interface VerificationListResponse {
  records: Verification[]
  total: number
  size: number
  current: number
  pages: number
}
