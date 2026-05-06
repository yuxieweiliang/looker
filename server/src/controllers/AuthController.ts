import {
  JsonController,
  Post,
  Get,
  Body,
  HeaderParam,
  Authorized,
} from 'routing-controllers'
import { IsString, Length, IsOptional, IsNotEmpty } from 'class-validator'
import { Service } from 'typedi'
import { v4 as uuidv4 } from 'uuid'
import { queryOne, execute } from '../utils/db'
import { hashPassword, verifyPassword, generateCode } from '../utils/crypto'
import { generateToken, verifyToken } from '../utils/jwt'
import { success, error } from '../utils/response'
import type { ApiResponse, UserInfo } from '../types'

/**
 * 发送验证码请求参数
 */
class SendCodeBody {
  @IsString()
  @Length(11, 11, { message: '手机号格式不正确' })
  phone!: string
}

/**
 * 手机号登录请求参数
 */
class PhoneLoginBody {
  @IsString()
  @Length(11, 11, { message: '手机号格式不正确' })
  phone!: string

  @IsString()
  @IsOptional()
  code?: string

  @IsString()
  @IsOptional()
  password?: string
}

/**
 * 注册请求参数
 */
class RegisterBody {
  @IsString()
  @Length(11, 11, { message: '手机号格式不正确' })
  phone!: string

  @IsString()
  @Length(6, 6, { message: '验证码为6位数字' })
  code!: string

  @IsString()
  @Length(6, 20, { message: '密码长度为6-20位' })
  password!: string

  @IsString()
  @IsNotEmpty({ message: '昵称不能为空' })
  nickname!: string
}

/**
 * 社交绑定请求参数
 */
class SocialBindBody {
  @IsString()
  type!: 'wechat' | 'weibo'

  @IsString()
  openid!: string

  @IsString()
  @IsOptional()
  unionid?: string

  @IsString()
  @IsOptional()
  nickname?: string

  @IsString()
  @IsOptional()
  avatar?: string
}

/**
 * 认证控制器
 * 处理用户注册、登录、Token 刷新等
 */
@Service()
@JsonController('/auth')
export class AuthController {
  private codeStore: Map<string, { code: string; expireAt: number }> = new Map()

  /**
   * 发送验证码
   * POST /api/v1/auth/send-code
   */
  @Post('/send-code')
  async sendCode(@Body() body: SendCodeBody): Promise<ApiResponse<null>> {
    const { phone } = body
    const code = generateCode()

    // 存储验证码（5分钟过期）
    this.codeStore.set(phone, {
      code,
      expireAt: Date.now() + 5 * 60 * 1000,
    })

    // TODO: 调用短信服务发送验证码
    console.log(`验证码: ${code}，手机号: ${phone}`)

    return success(null, '验证码已发送')
  }

  /**
   * 验证验证码
   */
  private verifyCode(phone: string, code: string): boolean {
    const record = this.codeStore.get(phone)
    if (!record) return false
    if (record.expireAt < Date.now()) {
      this.codeStore.delete(phone)
      return false
    }
    return record.code === code
  }

  /**
   * 手机号+验证码登录
   * POST /api/v1/auth/login/phone
   */
  @Post('/login/phone')
  async loginByPhone(@Body() body: PhoneLoginBody): Promise<ApiResponse<{ token: string; user: UserInfo }>> {
    const { phone, code } = body

    // 验证码登录
    if (code) {
      if (!this.verifyCode(phone, code)) {
        return error('验证码错误或已过期', 400)
      }

      const user = await queryOne<{
        id: string
        name: string
        avatar: string
        bio: string
        vip: boolean
        level: number
        following_count: number
        followers_count: number
        likes_count: number
        works_count: number
        collections_count: number
      }>('SELECT * FROM users WHERE phone = $1', [phone])

      if (!user) {
        return error('用户不存在，请先注册', 404)
      }

      const token = generateToken(user.id, phone)

      return success({
        token,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          bio: user.bio,
          vip: user.vip,
          level: user.level,
          following: user.following_count,
          followers: user.followers_count,
          likes: user.likes_count,
          works: user.works_count,
          collections: user.collections_count,
          createdAt: new Date().toISOString(),
        },
      }, '登录成功')
    }

    return error('请提供验证码', 400)
  }

  /**
   * 手机号+密码登录
   * POST /api/v1/auth/login/password
   */
  @Post('/login/password')
  async loginByPassword(@Body() body: PhoneLoginBody): Promise<ApiResponse<{ token: string; user: UserInfo }>> {
    const { phone, password } = body

    if (!password) {
      return error('请提供密码', 400)
    }

    try {
      const user = await queryOne<{
        id: string
        name: string
        avatar: string
        bio: string
        vip: boolean
        level: number
        following_count: number
        followers_count: number
        likes_count: number
        works_count: number
        collections_count: number
        password_hash: string
      }>('SELECT * FROM users WHERE phone = $1', [phone])

      if (!user) {
        return error('用户不存在', 404)
      }

      const isValid = await verifyPassword(password, user.password_hash)
      if (!isValid) {
        return error('密码错误', 400)
      }

      const token = generateToken(user.id, phone)

      return success({
        token,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          bio: user.bio,
          vip: user.vip,
          level: user.level,
          following: user.following_count,
          followers: user.followers_count,
          likes: user.likes_count,
          works: user.works_count,
          collections: user.collections_count,
          createdAt: new Date().toISOString(),
        },
      }, '登录成功')
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * 用户注册
   * POST /api/v1/auth/register
   */
  @Post('/register')
  async register(@Body() body: RegisterBody): Promise<ApiResponse<{ token: string; user: UserInfo }>> {
    const { phone, code, password, nickname } = body

    // 验证验证码
    if (!this.verifyCode(phone, code)) {
      return error('验证码错误或已过期', 400)
    }

    // 检查手机号是否已注册
    const existing = await queryOne('SELECT id FROM users WHERE phone = $1', [phone])
    if (existing) {
      return error('该手机号已注册', 409)
    }

    // 加密密码
    const passwordHash = await hashPassword(password)
    const userId = uuidv4()

    // 创建用户
    await execute(
      `INSERT INTO users (id, phone, password_hash, name, avatar, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [userId, phone, passwordHash, nickname, 'https://default-avatar.com/default.png']
    )

    // 初始化积分记录
    await execute(
      `INSERT INTO user_points (user_id, points, consecutive_days, created_at, updated_at)
       VALUES ($1, 0, 0, NOW(), NOW())`,
      [userId]
    )

    // 初始化钱包
    await execute(
      `INSERT INTO wallets (user_id, balance, created_at, updated_at)
       VALUES ($1, 0.00, NOW(), NOW())`,
      [userId]
    )

    // 清除验证码
    this.codeStore.delete(phone)

    const token = generateToken(userId, phone)

    return success({
      token,
      user: {
        id: userId,
        name: nickname,
        avatar: 'https://default-avatar.com/default.png',
        bio: '',
        vip: false,
        level: 1,
        following: 0,
        followers: 0,
        likes: 0,
        works: 0,
        collections: 0,
        createdAt: new Date().toISOString(),
      },
    }, '注册成功')
  }

  /**
   * 退出登录
   * POST /api/v1/auth/logout
   */
  @Post('/logout')
  @Authorized()
  async logout(): Promise<ApiResponse<null>> {
    // Token 无状态，客户端删除即可
    // 如需强制失效，可将 Token 加入黑名单（Redis）
    return success(null, '退出成功')
  }

  /**
   * 刷新 Token
   * POST /api/v1/auth/refresh
   */
  @Post('/refresh')
  @Authorized()
  async refreshToken(@HeaderParam('authorization') auth: string): Promise<ApiResponse<{ token: string }>> {
    const token = auth?.replace('Bearer ', '')
    if (!token) {
      return error('未提供 Token', 401)
    }

    // 验证旧 Token 并生成新 Token
    try {
      const payload = verifyToken(token)
      const newToken = generateToken(payload.userId, payload.phone)
      return success({ token: newToken }, '刷新成功')
    } catch {
      return error('Token 无效或已过期', 401)
    }
  }

  /**
   * 绑定社交账号
   * POST /api/v1/auth/bind
   */
  @Post('/bind')
  @Authorized()
  async bindSocial(
    @Body() body: SocialBindBody,
    @HeaderParam('x-user-id') userId: string
  ): Promise<ApiResponse<null>> {
    const { type, openid, unionid, nickname, avatar } = body

    // 检查是否已绑定
    const existing = await queryOne(
      'SELECT id FROM user_social_bindings WHERE type = $1 AND openid = $2',
      [type, openid]
    )

    if (existing) {
      return error('该社交账号已绑定', 409)
    }

    await execute(
      `INSERT INTO user_social_bindings (user_id, type, openid, unionid, nickname, avatar, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [userId, type, openid, unionid || null, nickname || null, avatar || null]
    )

    return success(null, '绑定成功')
  }

  /**
   * 解绑社交账号
   * POST /api/v1/auth/unbind
   */
  @Post('/unbind')
  @Authorized()
  async unbindSocial(
    @Body() body: { type: string },
    @HeaderParam('x-user-id') userId: string
  ): Promise<ApiResponse<null>> {
    const { type } = body

    await execute(
      'DELETE FROM user_social_bindings WHERE user_id = $1 AND type = $2',
      [userId, type]
    )

    return success(null, '解绑成功')
  }
}
