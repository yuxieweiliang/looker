// 内容相关 API
import { get, post, del } from '../utils/request'
import type { PaginationData, PaginationParams } from '../types/user'
import type { WaterfallItem, FeedItem, Comment } from '../types'

// 获取瀑布流图片列表
export const getPhotoList = (params: PaginationParams & { category?: string; sort?: string }) => {
  return get<PaginationData<WaterfallItem>>('/photos', params)
}

// 获取动态列表
export const getFeedList = (params: PaginationParams) => {
  return get<PaginationData<FeedItem>>('/feeds', params)
}

// 发布动态
export const publishFeed = (data: {
  content: string
  images: string[]
  location?: string
  topics?: string[]
}) => {
  return post<FeedItem>('/feeds', data)
}

// 获取动态详情
export const getFeedDetail = (id: string) => {
  return get<FeedItem>(`/feeds/${id}`)
}

// 删除动态
export const deleteFeed = (id: string) => {
  return del<void>(`/feeds/${id}`)
}

// 点赞/取消点赞
export const toggleLike = (type: 'feed' | 'comment', id: string) => {
  return post<{ isLiked: boolean; likes: number }>(`/likes`, { type, id })
}

// 收藏/取消收藏
export const toggleBookmark = (id: string) => {
  return post<{ isBookmarked: boolean }>(`/bookmarks`, { id })
}

// 获取评论列表
export const getComments = (params: { targetId: string; targetType: string } & PaginationParams) => {
  return get<PaginationData<Comment>>('/comments', params)
}

// 发表评论
export const postComment = (data: {
  targetId: string
  targetType: string
  content: string
  parentId?: string
}) => {
  return post<Comment>('/comments', data)
}

// 删除评论
export const deleteComment = (id: string) => {
  return del<void>(`/comments/${id}`)
}

// 搜索
export const search = (params: { keyword: string; type?: string } & PaginationParams) => {
  return get<PaginationData<WaterfallItem>>('/search', params)
}

// 获取热门搜索
export const getHotSearch = () => {
  return get<string[]>('/search/hot')
}

// 获取搜索建议
export const getSearchSuggestions = (keyword: string) => {
  return get<string[]>('/search/suggestions', { keyword })
}

// 获取关注列表
export const getFollowingList = (params: PaginationParams) => {
  return get<PaginationData<{ id: string; name: string; avatar: string; isFollowing: boolean }>>('/follows/following', params)
}

// 获取粉丝列表
export const getFollowerList = (params: PaginationParams) => {
  return get<PaginationData<{ id: string; name: string; avatar: string; isFollowing: boolean }>>('/follows/followers', params)
}

// 获取获赞列表（收到的点赞）
export const getReceivedLikes = (params: PaginationParams) => {
  return get<PaginationData<{
    id: string
    user: { id: string; name: string; avatar: string }
    workId: string
    work: { thumb: string; title: string; likes: number }
    time: string
  }>>('/feeds/likes/received', params)
}

export default {
  getPhotoList,
  getFeedList,
  publishFeed,
  getFeedDetail,
  deleteFeed,
  toggleLike,
  toggleBookmark,
  getComments,
  postComment,
  deleteComment,
  search,
  getHotSearch,
  getSearchSuggestions,
  getFollowingList,
  getFollowerList,
  getReceivedLikes,
}
