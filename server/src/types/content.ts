/**
 * 内容相关类型定义
 */

/**
 * 图片项
 */
export interface ImageItem {
  id: string
  url: string
  width: number
  height: number
}

/**
 * 作者信息
 */
export interface Author {
  id: string
  name: string
  avatar: string
}

/**
 * 动态项
 */
export interface FeedItem {
  id: string
  user: Author
  content: string
  images: ImageItem[]
  topics: string[]
  location?: string
  latitude?: number
  longitude?: number
  views: number
  likes: number
  comments: number
  shares: number
  collections: number
  isLiked: boolean
  isCollected: boolean
  isFollowing: boolean
  createdAt: string
}

/**
 * 发布动态表单
 */
export interface PublishFeedForm {
  content: string
  images: string[]
  location?: string
  topics?: string[]
  latitude?: number
  longitude?: number
}

/**
 * 评论项
 */
export interface CommentItem {
  id: string
  user: Author
  content: string
  likes: number
  isLiked: boolean
  replies?: number
  replyTo?: string
  parentId?: string
  createdAt: string
}

/**
 * 发表评论表单
 */
export interface CreateCommentForm {
  targetId: string
  targetType: 'feed' | 'photo'
  content: string
  parentId?: string
}

/**
 * 话题项
 */
export interface TopicItem {
  id: string
  name: string
  description?: string
  count: number
  bgColor: string
  isFollowed: boolean
}

/**
 * 瀑布流图片项
 */
export interface WaterfallItem {
  id: string
  url: string
  title: string
  user: Author
  likes: number
  views: number
  width: number
  height: number
}

/**
 * 草稿项
 */
export interface DraftItem {
  id: string
  content: string
  images: string[]
  location?: string
  topics: string[]
  savedAt: string
}
