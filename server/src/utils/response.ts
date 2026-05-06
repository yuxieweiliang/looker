/**
 * 响应工具函数
 */

import { ApiResponse, PaginationData } from '../types'

/**
 * 成功响应
 * @param data 数据
 * @param message 消息
 */
export function success<T>(data: T, message = 'success'): ApiResponse<T> {
  return { code: 0, message, data }
}

/**
 * 分页成功响应
 * @param list 列表数据
 * @param total 总数
 * @param page 当前页
 * @param pageSize 每页数量
 * @param message 消息
 */
export function paginate<T>(list: T[], total: number, page: number, pageSize: number, message = 'success'): ApiResponse<PaginationData<T>> {
  return {
    code: 0,
    message,
    data: {
      list,
      total,
      hasMore: page * pageSize < total,
    },
  }
}

/**
 * 错误响应
 * @param message 错误消息
 * @param code 错误码
 */
export function error<T = null>(message: string, code = 400): ApiResponse<T> {
  return { code, message, data: null as T }
}
