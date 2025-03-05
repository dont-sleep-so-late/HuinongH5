import { http } from '@/utils/http'
import type { Verification, SubmitVerificationParams } from '@/types/verify'

// 提交实名认证
export function submitVerification(params: SubmitVerificationParams) {
  return http.post<Verification>('/seller/verification/submit', params)
}

// 查询认证状态
export function getVerificationStatus() {
  return http.get<Verification>('/seller/verification/status')
}
