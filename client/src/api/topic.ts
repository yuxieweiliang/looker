// 话题相关 API
import { get, post } from '../utils/request'
import type { PaginationData, PaginationParams } from '../types/user'

export interface Topic {
  id: string
  name: string
  description: string
  count: number
  bgColor: string
  isFollowed: boolean
  cover?: string
  category?: string
}

// 获取话题列表
export const getTopicList = (params: PaginationParams & { sort?: 'hot' | 'new' }) => {
  return get<PaginationData<Topic>>('/topics', params)
}

// 获取话题详情
export const getTopicDetail = (name: string) => {
  return get<Topic>(`/topics/${name}`)
}

// 关注/取消关注话题
export const toggleTopicFollow = (name: string) => {
  return post<{ isFollowed: boolean }>(`/topics/${name}/follow`)
}
