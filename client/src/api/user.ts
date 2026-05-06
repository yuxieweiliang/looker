// 用户相关 API
import { get, post, del } from '../utils/request'
import type { PaginationData, PaginationParams, UserInfo } from '../types/user'

// 获取当前用户信息
export const getUserInfo = () => {
  return get<UserInfo>('/user/info')
}

// 获取用户主页信息
export const getUserProfile = (id: string) => {
  return get<UserInfo & { isFollowing: boolean }>(`/users/${id}`)
}

// 更新用户信息
export const updateUserInfo = (data: Partial<UserInfo>) => {
  return post<UserInfo>('/user/update', data)
}

// 上传头像
export const uploadAvatar = (filePath: string) => {
  const token = uni.getStorageSync('token')
  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return new Promise<{ url: string }>((resolve, reject) => {
    uni.uploadFile({
      url: `${import.meta.env.VITE_API_BASE_URL}/user/avatar`,
      filePath,
      name: 'file',
      header: headers,
      success: (res) => {
        const data = JSON.parse(res.data)
        resolve(data)
      },
      fail: reject,
    })
  })
}

// 修改密码
export const changePassword = (data: { oldPassword: string; newPassword: string }) => {
  return post<void>('/user/password', data)
}

// 修改手机号
export const changePhone = (data: { oldPhone: string; newPhone: string; code: string }) => {
  return post<void>('/user/phone', data)
}

// 获取关注列表
export const getFollowingList = (params: PaginationParams) => {
  return get<PaginationData<{ id: string; name: string; avatar: string; isFollowing: boolean }>>('/user/following', params)
}

// 获取粉丝列表
export const getFollowerList = (params: PaginationParams) => {
  return get<PaginationData<{ id: string; name: string; avatar: string; isFollowing: boolean }>>('/user/followers', params)
}

// 获取黑名单列表
export const getBlacklist = (params: PaginationParams) => {
  return get<PaginationData<{ id: string; name: string; avatar: string; blockTime: string }>>('/user/blacklist', params)
}

// 获取浏览历史
export const getHistory = (params: PaginationParams) => {
  return get<PaginationData<{ id: string; title: string; image: string; viewedAt: string }>>('/user/history', params)
}

// 清除浏览历史
export const clearHistory = () => {
  return del<void>('/user/history')
}

// 获取我的作品
export const getUserWorks = (params: PaginationParams) => {
  return get<PaginationData<{
    id: string
    content: string
    images: { id: string; url: string; width: number; height: number }[]
    likes: number
    comments: number
    createdAt: string
  }>>('/feeds/user/works', params)
}

// 获取我的收藏
export const getUserCollections = (params: PaginationParams) => {
  return get<PaginationData<{
    id: string
    user: { id: string; name: string; avatar: string }
    content: string
    images: { id: string; url: string; width: number; height: number }[]
    likes: number
    comments: number
    createdAt: string
  }>>('/feeds/user/collections', params)
}
