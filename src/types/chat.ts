import type { ApiResponse } from './api'

// 消息类型
export type MessageType = 'text' | 'image' | 'product'

// 商品消息内容
export interface ProductMessage {
  id: number
  name: string
  price: number
  image: string
}

// 消息内容
export interface ChatMessage {
  id: number
  sessionId: number
  senderId: number
  senderName: string
  senderAvatar: string
  receiverId: number
  receiverName: string
  receiverAvatar: string
  content: string
  messageType: MessageType
  product?: ProductMessage
  isRead: number
  createdTime: string
}

// 会话信息
export interface ChatSession {
  id: number
  targetUserId: number
  targetUsername: string
  targetAvatar: string
  targetRole: 'buyer' | 'seller'
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  status: number
  updatedTime: string
}

// 分页响应
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
}

// 发送消息参数
export interface SendMessageParams {
  receiverId: number
  content: string
  messageType: MessageType
  referenceId?: number
}

// 查询参数
export interface QueryParams {
  pageNum?: number
  pageSize?: number
}

// API响应类型
export type ChatResult<T> = Promise<ApiResponse<T>>
export type ChatPageResult<T> = Promise<ApiResponse<PageResult<T>>>
