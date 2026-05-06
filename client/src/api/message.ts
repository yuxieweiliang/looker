// 消息相关 API
import { get, post, del } from '../utils/request'
import type { PaginationData, PaginationParams } from '../types/user'

export interface Message {
  id: string
  type: 'like' | 'comment' | 'follow' | 'system'
  name: string
  avatar: string
  content: string
  time: string
  read: boolean
  image?: string
  targetId?: string
}

// 获取消息列表
export const getMessageList = (params: { type?: 'all' | 'like' | 'comment' | 'follow' | 'system' } & PaginationParams) => {
  return get<PaginationData<Message>>('/messages', params)
}

// 获取未读消息数
export const getUnreadCount = () => {
  return get<{ total: number; like: number; comment: number; follow: number; system: number }>('/messages/unread')
}

// 标记消息已读
export const markMessageRead = (id: string) => {
  return post<void>(`/messages/${id}/read`)
}

// 一键已读
export const markAllRead = () => {
  return post<void>('/messages/read-all')
}

// 删除消息
export const deleteMessage = (id: string) => {
  return del<void>(`/messages/${id}`)
}
