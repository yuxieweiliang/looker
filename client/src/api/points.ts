// 积分相关 API
import { get, post } from '../utils/request'
import type { PaginationData, PaginationParams } from '../types/user'

export interface Task {
  id: string
  name: string
  description: string
  type: 'daily' | 'newbie' | 'achievement'
  points: number
  icon: string
  progress: number
  total: number
  completed: boolean
  claimed: boolean
}

export interface Goods {
  id: string
  name: string
  description: string
  image: string
  points: number
  stock: number
  type: 'virtual' | 'physical' | 'coupon'
}

// 获取积分信息
export const getPointsInfo = () => {
  return get<{ points: number; consecutiveDays: number; hasSignedToday: boolean }>('/points')
}

// 签到
export const signIn = () => {
  return post<{ points: number; consecutiveDays: number }>('/points/signin')
}

// 获取任务列表
export const getTaskList = () => {
  return get<{ daily: Task[]; newbie: Task[]; achievements: Task[] }>('/points/tasks')
}

// 领取任务奖励
export const claimTaskReward = (id: string) => {
  return post<{ points: number }>(`/points/tasks/${id}/claim`)
}

// 获取可兑换商品
export const getGoodsList = (params: { type?: 'all' | 'virtual' | 'physical' | 'coupon' } & PaginationParams) => {
  return get<PaginationData<Goods>>('/points/goods', params)
}

// 兑换商品
export const exchangeGoods = (goodsId: string) => {
  return post<void>('/points/exchange', { goodsId })
}
