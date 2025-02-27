// 地址信息
export interface AddressInfo {
  id: number
  userId: number
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  detailAddress: string
  isDefault: boolean
  createdTime: string
  updatedTime: string
}

// 地址表单数据
export interface AddressFormData {
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  detailAddress: string
  isDefault: boolean
}

// 地址验证规则
export const addressRules = {
  receiverName: [{ required: true, message: '请输入收货人姓名' }],
  receiverPhone: [
    { required: true, message: '请输入收货人电话' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
  ],
  province: [{ required: true, message: '请选择省份' }],
  city: [{ required: true, message: '请选择城市' }],
  district: [{ required: true, message: '请选择区县' }],
  detailAddress: [{ required: true, message: '请输入详细地址' }],
}
