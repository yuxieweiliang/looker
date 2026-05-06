// 用户相关类型
export interface UserInfo {
  id: string
  name: string
  avatar: string
  bio?: string
  vip?: boolean
  level?: number
  following?: number
  followers?: number
  likes?: number
  works?: number
  collections?: number
}

// 认证相关
export interface LoginForm {
  phone: string
  code?: string
  password?: string
}

export interface RegisterForm {
  phone: string
  code: string
  password: string
  nickname: string
}

// 社交账号绑定
export interface SocialAuth {
  type: 'wechat' | 'weibo'
  openid: string
  unionid?: string
  nickname?: string
  avatar?: string
}

// API 响应格式
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// 分页参数
export interface PaginationParams {
  page: number
  pageSize: number
}

// 分页响应
export interface PaginationData<T> {
  list: T[]
  total: number
  hasMore: boolean
}
