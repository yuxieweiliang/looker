/**
 * 通用类型定义
 */

// 从子模块重新导出所有类型
export * from './user'
export * from './content'

/**
 * API 统一响应格式
 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/**
 * 分页响应数据
 */
export interface PaginationData<T> {
  list: T[]
  total: number
  hasMore: boolean
}

/**
 * JWT Payload
 */
export interface JWTPayload {
  userId: string
  phone: string
  iat: number
  exp: number
}

/**
 * 请求上下文用户信息
 */
export interface RequestUser {
  userId: string
  phone: string
}
