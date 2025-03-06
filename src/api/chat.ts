import { http } from '@/utils/http'
import type {
  ChatMessage,
  ChatSession,
  SendMessageParams,
  QueryParams,
  ChatResult,
  ChatPageResult,
} from '@/types/chat'

// 获取会话列表
export const getChatSessions = (params?: QueryParams): ChatPageResult<ChatSession> => {
  return http.get('/chat/sessions', params)
}

// 获取聊天记录
export const getChatMessages = (
  targetUserId: number,
  params?: QueryParams,
): ChatPageResult<ChatMessage> => {
  return http.get(`/chat/messages/${targetUserId}`, params)
}

// 发送消息
export const sendMessage = (data: SendMessageParams): ChatResult<ChatMessage> => {
  return http.post('/chat/messages', data)
}

// 标记消息已读
export const markMessagesRead = (targetUserId: number): ChatResult<null> => {
  return http.put(`/chat/messages/read/${targetUserId}`)
}

// 删除聊天记录
export const deleteChatMessages = (targetUserId: number): ChatResult<null> => {
  return http.delete(`/chat/messages/${targetUserId}`)
}

// 获取未读消息数
export const getUnreadCount = (): ChatResult<number> => {
  return http.get('/chat/messages/unread/count')
}
