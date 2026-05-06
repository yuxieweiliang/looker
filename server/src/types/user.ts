/**
 * 用户相关类型定义
 */

/**
 * 用户信息
 */
export interface UserInfo {
  id: string
  name: string
  avatar: string
  bio?: string
  gender?: 'male' | 'female' | 'unknown'
  birthday?: string
  location?: string
  vip: boolean
  level: number
  following: number
  followers: number
  likes: number
  works: number
  collections: number
  createdAt: string
}

/**
 * 用户实体（数据库完整字段）
 */
export interface UserEntity extends UserInfo {
  phone: string
  passwordHash: string
  updatedAt: string
}

/**
 * 登录表单
 */
export interface LoginForm {
  phone: string
  code?: string
  password?: string
}

/**
 * 注册表单
 */
export interface RegisterForm {
  phone: string
  code: string
  password: string
  nickname: string
}

/**
 * 更新用户信息
 */
export interface UpdateUserForm {
  name?: string
  avatar?: string
  bio?: string
  gender?: 'male' | 'female' | 'unknown'
  birthday?: string
  location?: string
}

/**
 * 修改密码
 */
export interface ChangePasswordForm {
  oldPassword: string
  newPassword: string
}

/**
 * 修改手机号
 */
export interface ChangePhoneForm {
  oldPhone: string
  newPhone: string
  code: string
}

/**
 * 社交绑定
 */
export interface SocialBindForm {
  type: 'wechat' | 'weibo'
  openid: string
  unionid?: string
  nickname?: string
  avatar?: string
}
