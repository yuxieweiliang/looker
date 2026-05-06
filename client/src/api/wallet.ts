// 钱包相关 API
import { get, post } from '../utils/request'
import type { PaginationData, PaginationParams } from '../types/user'

export interface Transaction {
  id: string
  title: string
  amount: number
  type: 'income' | 'expense' | 'recharge' | 'withdraw'
  time: string
}

export interface BankCard {
  id: string
  bankName: string
  cardNumber: string
  cardType: string
  isDefault: boolean
}

export interface Coupon {
  id: string
  name: string
  description: string
  amount: number
  minSpend: number
  validStart: string
  validEnd: string
  status: 'unused' | 'used' | 'expired'
}

// 获取钱包信息
export const getWalletInfo = () => {
  return get<{ balance: string; cardCount: number; couponCount: number }>('/wallet')
}

// 获取交易记录
export const getTransactionList = (params: { type?: 'all' | 'income' | 'expense' | 'recharge' | 'withdraw' } & PaginationParams) => {
  return get<PaginationData<Transaction>>('/wallet/transactions', params)
}

// 充值
export const recharge = (data: { amount: number; paymentMethod: string }) => {
  return post<void>('/wallet/recharge', data)
}

// 提现
export const withdraw = (data: { amount: number; cardId: string }) => {
  return post<void>('/wallet/withdraw', data)
}

// 获取银行卡列表
export const getBankCardList = () => {
  return get<BankCard[]>('/wallet/cards')
}

// 添加银行卡
export const addBankCard = (data: {
  bankName: string
  cardNumber: string
  holderName: string
  idCard: string
  phone: string
  code: string
}) => {
  return post<void>('/wallet/cards', data)
}

// 删除银行卡
export const deleteBankCard = (id: string) => {
  return post<void>(`/wallet/cards/${id}`)
}

// 设置默认银行卡
export const setDefaultCard = (id: string) => {
  return post<void>(`/wallet/cards/${id}/default`)
}

// 获取优惠券列表
export const getCouponList = () => {
  return get<Coupon[]>('/wallet/coupons')
}
