export interface UserInfo {
  id: string
  username: string
  nickname: string
  avatar: string
  role: 'buyer' | 'seller'
  verified: boolean
}

export interface LoginResponse {
  token: string
  userInfo: UserInfo
}
