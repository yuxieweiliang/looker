// 文章/图片项
export interface ImageItem {
  id: string
  url: string
  width: number
  height: number
  title?: string
  description?: string
}

// 瀑布流项
export interface WaterfallItem {
  id: string
  url: string
  title: string
  user: {
    id: string
    name: string
    avatar: string
  }
  likes: number
  views?: number
  width?: number
  height?: number
}

// 用户信息
export interface User {
  id: string
  name: string
  avatar: string
}

// 动态/Feed项
export interface FeedItem {
  id: string
  user: User
  content: string
  images: ImageItem[]
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  createdAt: string
  location?: string
}

// 话题
export interface Topic {
  name: string
  count: number
  bgColor: string
}

// 分类
export interface Category {
  id: string
  name: string
  icon: string
  count: number
}

// 轮播图
export interface Banner {
  id: string
  image: string
  link: string
  title?: string
}

// 搜索结果
export interface SearchResult {
  id: string
  type: 'user' | 'post' | 'topic'
  title: string
  subtitle?: string
  image?: string
}

// 评论
export interface Comment {
  id: string
  user: User
  content: string
  likes: number
  isLiked: boolean
  replies?: number
  replyTo?: string
  createdAt: string
}
