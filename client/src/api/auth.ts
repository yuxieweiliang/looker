// 用户认证 API
import { get, post } from '../utils/request'
import type {
  UserInfo,
  LoginForm,
  RegisterForm,
  SocialAuth,
  ApiResponse,
} from '../types/user'

// 发送验证码
export const sendVerifyCode = (phone: string): Promise<ApiResponse<void>> => {
  return post('/auth/send-code', { phone })
}

// 手机号登录
export const loginByPhone = (data: LoginForm): Promise<ApiResponse<{ token: string; user: UserInfo }>> => {
  return post('/auth/login/phone', data)
}

// 手机号+密码登录
export const loginByPassword = (data: { phone: string; password: string }): Promise<
  ApiResponse<{ token: string; user: UserInfo }>
> => {
  return post('/auth/login/password', data)
}

// 微信登录
export const loginByWechat = (code: string): Promise<ApiResponse<{ token: string; user: UserInfo }>> => {
  return post('/auth/login/wechat', { code })
}

// 微博登录
export const loginByWeibo = (code: string): Promise<ApiResponse<{ token: string; user: UserInfo }>> => {
  return post('/auth/login/weibo', { code })
}

// 注册
export const register = (data: RegisterForm): Promise<ApiResponse<{ token: string; user: UserInfo }>> => {
  return post('/auth/register', data)
}

// 登出
export const logout = (): Promise<ApiResponse<void>> => {
  return post('/auth/logout')
}

// 刷新 Token
export const refreshToken = (): Promise<ApiResponse<{ token: string }>> => {
  return post('/auth/refresh')
}

// 绑定社交账号
export const bindSocial = (data: SocialAuth): Promise<ApiResponse<void>> => {
  return post('/auth/bind', data)
}

// 解绑社交账号
export const unbindSocial = (type: 'wechat' | 'weibo'): Promise<ApiResponse<void>> => {
  return post('/auth/unbind', { type })
}

// 获取用户信息
export const getUserInfo = (): Promise<ApiResponse<UserInfo>> => {
  return get('/user/info')
}

// 更新用户信息
export const updateUserInfo = (data: Partial<UserInfo>): Promise<ApiResponse<UserInfo>> => {
  return post('/user/update', data)
}

// 上传头像
export const uploadAvatar = (filePath: string): Promise<ApiResponse<{ url: string }>> => {
  const token = uni.getStorageSync('token')
  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
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
