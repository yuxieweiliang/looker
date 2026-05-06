// 社交相关 API
import { post, get, del } from '../utils/request'
import type { PaginationData, PaginationParams } from '../types/user'

// 关注/取消关注
export const toggleFollow = (userId: string) => {
  return post<{ isFollowing: boolean }>('/follows', { userId })
}

// 获取关注列表
export const getFollowingList = (params: PaginationParams) => {
  return get<PaginationData<{ id: string; name: string; avatar: string; isFollowing: boolean }>>('/follows/following', params)
}

// 获取粉丝列表
export const getFollowerList = (params: PaginationParams) => {
  return get<PaginationData<{ id: string; name: string; avatar: string; isFollowing: boolean }>>('/follows/followers', params)
}

// 加入黑名单
export const addToBlacklist = (userId: string) => {
  return post<void>('/follows/blacklist', { userId })
}

// 移除黑名单
export const removeFromBlacklist = (userId: string) => {
  return del<void>(`/follows/blacklist/${userId}`)
}

// 获取黑名单列表
export const getBlacklist = (params: PaginationParams) => {
  return get<PaginationData<{ id: string; name: string; avatar: string; blockTime: string }>>('/follows/blacklist', params)
}
