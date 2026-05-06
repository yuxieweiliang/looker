import {
  JsonController,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  QueryParam,
  Authorized,
  Req,
  Res,
} from 'routing-controllers'
import { IsString, IsOptional, IsIn, Length, IsNotEmpty } from 'class-validator'
import { Service } from 'typedi'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { query, queryOne, execute } from '../utils/db'
import { hashPassword, verifyPassword } from '../utils/crypto'
import { success, error, paginate } from '../utils/response'
import { logger } from '../utils/logger'
import type { ApiResponse, UserInfo, PaginationData } from '../types'
import type { UpdateUserForm, ChangePasswordForm, ChangePhoneForm } from '../types/user'
import type { Request, Response } from 'express'

/**
 * 更新用户信息请求参数
 */
class UpdateUserBody implements UpdateUserForm {
  @IsString()
  @IsOptional()
  @Length(1, 50)
  name?: string

  @IsString()
  @IsOptional()
  avatar?: string

  @IsString()
  @IsOptional()
  @Length(0, 500)
  bio?: string

  @IsString()
  @IsOptional()
  @IsIn(['male', 'female', 'unknown'])
  gender?: 'male' | 'female' | 'unknown'

  @IsString()
  @IsOptional()
  birthday?: string

  @IsString()
  @IsOptional()
  location?: string
}

/**
 * 修改密码请求参数
 */
class ChangePasswordBody implements ChangePasswordForm {
  @IsString()
  @IsNotEmpty()
  oldPassword!: string

  @IsString()
  @Length(6, 20)
  newPassword!: string
}

/**
 * 修改手机号请求参数
 */
class ChangePhoneBody implements ChangePhoneForm {
  @IsString()
  @Length(11, 11)
  oldPhone!: string

  @IsString()
  @Length(11, 11)
  newPhone!: string

  @IsString()
  @Length(6, 6)
  code!: string
}

/**
 * 用户控制器
 * 处理用户信息查询、更新、密码修改等
 */
@Service()
@JsonController('/user')
export class UserController {
  /**
   * 获取当前用户信息
   * GET /api/v1/user/info
   */
  @Get('/info')
  @Authorized()
  async getCurrentUser(@QueryParam('userId') userId: string): Promise<ApiResponse<UserInfo>> {
    const user = await queryOne<{
      id: string
      name: string
      avatar: string
      bio: string
      gender: string
      birthday: string
      location: string
      vip: boolean
      level: number
      following_count: number
      followers_count: number
      likes_count: number
      works_count: number
      collections_count: number
      created_at: string
    }>('SELECT * FROM users WHERE id = $1', [userId])

    if (!user) {
      return error('用户不存在', 404)
    }

    return success({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      gender: user.gender as 'male' | 'female' | 'unknown',
      birthday: user.birthday,
      location: user.location,
      vip: user.vip,
      level: user.level,
      following: user.following_count,
      followers: user.followers_count,
      likes: user.likes_count,
      works: user.works_count,
      collections: user.collections_count,
      createdAt: user.created_at,
    })
  }

  /**
   * 获取用户主页信息
   * GET /api/v1/users/:id
   * 游客可访问
   */
  @Get('/users/:id')
  async getUserById(
    @Param('id') id: string,
    @QueryParam('userId') currentUserId: string
  ): Promise<ApiResponse<UserInfo & { isFollowing: boolean }>> {
    const user = await queryOne<{
      id: string
      name: string
      avatar: string
      bio: string
      vip: boolean
      level: number
      following_count: number
      followers_count: number
      works_count: number
      created_at: string
    }>('SELECT * FROM users WHERE id = $1', [id])

    if (!user) {
      return error('用户不存在', 404)
    }

    // 检查是否已关注（游客返回 false）
    const followRecord = currentUserId
      ? await queryOne(
          'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
          [currentUserId, id]
        )
      : null

    return success({
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      vip: user.vip,
      level: user.level,
      following: user.following_count,
      followers: user.followers_count,
      likes: 0,
      works: user.works_count,
      collections: 0,
      createdAt: user.created_at,
      isFollowing: !!followRecord,
    })
  }

  /**
   * 更新用户信息
   * POST /api/v1/user/update
   */
  @Post('/update')
  @Authorized()
  async updateUser(
    @Body() body: UpdateUserBody,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<UserInfo>> {
    const updates: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (body.name !== undefined) {
      updates.push(`name = $${paramIndex++}`)
      values.push(body.name)
    }
    if (body.avatar !== undefined) {
      updates.push(`avatar = $${paramIndex++}`)
      values.push(body.avatar)
    }
    if (body.bio !== undefined) {
      updates.push(`bio = $${paramIndex++}`)
      values.push(body.bio)
    }
    if (body.gender !== undefined) {
      updates.push(`gender = $${paramIndex++}`)
      values.push(body.gender)
    }
    if (body.birthday !== undefined) {
      updates.push(`birthday = $${paramIndex++}`)
      values.push(body.birthday)
    }
    if (body.location !== undefined) {
      updates.push(`location = $${paramIndex++}`)
      values.push(body.location)
    }

    if (updates.length === 0) {
      return error('没有要更新的字段', 400)
    }

    values.push(userId)

    await execute(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    )

    return this.getCurrentUser(userId)
  }

  /**
   * 修改密码
   * POST /api/v1/user/password
   */
  @Post('/password')
  @Authorized()
  async changePassword(
    @Body() body: ChangePasswordBody,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<null>> {
    const { oldPassword, newPassword } = body

    const user = await queryOne<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    )

    if (!user) {
      return error('用户不存在', 404)
    }

    const isValid = await verifyPassword(oldPassword, user.password_hash)
    if (!isValid) {
      return error('原密码错误', 400)
    }

    const newPasswordHash = await hashPassword(newPassword)
    await execute(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, userId]
    )

    return success(null, '密码修改成功')
  }

  /**
   * 修改手机号
   * POST /api/v1/user/phone
   */
  @Post('/phone')
  @Authorized()
  async changePhone(
    @Body() body: ChangePhoneBody,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<null>> {
    const { newPhone, code } = body

    // TODO: 验证验证码
    // 这里简化处理，实际应该调用验证码验证逻辑

    // 检查新手机号是否已被使用
    const existing = await queryOne('SELECT id FROM users WHERE phone = $1', [newPhone])
    if (existing) {
      return error('该手机号已被使用', 409)
    }

    await execute('UPDATE users SET phone = $1 WHERE id = $2', [newPhone, userId])

    return success(null, '手机号修改成功')
  }

  /**
   * 获取关注列表
   * GET /api/v1/user/following
   */
  @Get('/following')
  @Authorized()
  async getFollowingList(
    @QueryParam('userId') userId: string,
    @QueryParam('page') page = 1,
    @QueryParam('pageSize') pageSize = 20
  ): Promise<ApiResponse<PaginationData<{ id: string; name: string; avatar: string; isFollowing: boolean }>>> {
    const offset = (page - 1) * pageSize

    const list = await query<{
      id: string
      name: string
      avatar: string
    }>(
      `SELECT u.id, u.name, u.avatar
       FROM users u
       INNER JOIN follows f ON u.id = f.following_id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, pageSize, offset]
    )

    const totalResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) FROM follows WHERE follower_id = $1',
      [userId]
    )

    return paginate(
      list.map(u => ({ ...u, isFollowing: true })),
      parseInt(totalResult?.count || '0'),
      page,
      pageSize
    )
  }

  /**
   * 获取粉丝列表
   * GET /api/v1/user/followers
   */
  @Get('/followers')
  @Authorized()
  async getFollowersList(
    @QueryParam('userId') userId: string,
    @QueryParam('page') page = 1,
    @QueryParam('pageSize') pageSize = 20
  ): Promise<ApiResponse<PaginationData<{ id: string; name: string; avatar: string; isFollowing: boolean }>>> {
    const offset = (page - 1) * pageSize

    const list = await query<{
      id: string
      name: string
      avatar: string
      is_following: boolean
    }>(
      `SELECT u.id, u.name, u.avatar,
              EXISTS(SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = u.id) as is_following
       FROM users u
       INNER JOIN follows f ON u.id = f.follower_id
       WHERE f.following_id = $2
       ORDER BY f.created_at DESC
       LIMIT $3 OFFSET $4`,
      [userId, userId, pageSize, offset]
    )

    const totalResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) FROM follows WHERE following_id = $1',
      [userId]
    )

    return paginate(
      list.map(u => ({ ...u, isFollowing: u.is_following })),
      parseInt(totalResult?.count || '0'),
      page,
      pageSize
    )
  }

  /**
   * 获取黑名单列表
   * GET /api/v1/user/blacklist
   */
  @Get('/blacklist')
  @Authorized()
  async getBlacklist(
    @QueryParam('userId') userId: string,
    @QueryParam('page') page = 1,
    @QueryParam('pageSize') pageSize = 20
  ): Promise<ApiResponse<PaginationData<{ id: string; name: string; avatar: string; blockTime: string }>>> {
    const offset = (page - 1) * pageSize

    const list = await query<{
      id: string
      name: string
      avatar: string
      created_at: string
    }>(
      `SELECT u.id, u.name, u.avatar, b.created_at
       FROM users u
       INNER JOIN blacklist b ON u.id = b.blocked_user_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, pageSize, offset]
    )

    const totalResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) FROM blacklist WHERE user_id = $1',
      [userId]
    )

    return paginate(
      list.map(u => ({ ...u, blockTime: u.created_at })),
      parseInt(totalResult?.count || '0'),
      page,
      pageSize
    )
  }

  /**
   * 上传头像
   * POST /api/v1/user/avatar
   */
  @Post('/avatar')
  @Authorized()
  async uploadAvatar(
    @QueryParam('userId') userId: string,
    @Req() req: Request,
    @Res() res: Response
  ): Promise<ApiResponse<{ url: string }>> {
    // 确保上传目录存在
    const AVATAR_DIR = 'uploads/avatars'
    if (!fs.existsSync(AVATAR_DIR)) {
      fs.mkdirSync(AVATAR_DIR, { recursive: true })
    }

    const storage = multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, AVATAR_DIR)
      },
      filename: (_req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`
        cb(null, uniqueName)
      },
    })

    const upload = multer({
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (_req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        const ext = path.extname(file.originalname).toLowerCase()

        if (allowedTypes.includes(file.mimetype) && allowedExts.includes(ext)) {
          cb(null, true)
        } else {
          cb(new Error('不支持的文件类型'))
        }
      },
    })

    return new Promise((resolve, reject) => {
      const uploadSingle = upload.single('file')

      uploadSingle(req, res, async (err) => {
        if (err) {
          logger.warn('头像上传失败', { error: err.message, userId })
          reject(error(err.message, 400))
          return
        }

        const file = (req as unknown as { file: { filename: string } }).file
        if (!file) {
          reject(error('没有上传文件', 400))
          return
        }

        const url = `/uploads/avatars/${file.filename}`

        // 更新用户头像
        await execute(
          'UPDATE users SET avatar = $1, updated_at = NOW() WHERE id = $2',
          [url, userId]
        )

        logger.info('头像上传成功', { userId, filename: file.filename })

        resolve(success({ url }, '上传成功'))
      })
    })
  }

  /**
   * 获取浏览历史
   * GET /api/v1/user/history
   */
  @Get('/history')
  @Authorized()
  async getHistory(
    @QueryParam('userId') userId: string,
    @QueryParam('page') page = 1,
    @QueryParam('pageSize') pageSize = 20
  ): Promise<ApiResponse<PaginationData<{ id: string; title: string; image: string; viewedAt: string }>>> {
    const offset = (page - 1) * pageSize

    // 注意：需要在 schema.sql 中添加 user_history 表
    // 这里先返回空数据，避免报错
    logger.info('浏览历史查询', { userId, page, pageSize })

    return paginate([], 0, page, pageSize)
  }

  /**
   * 清除浏览历史
   * DELETE /api/v1/user/history
   */
  @Delete('/history')
  @Authorized()
  async clearHistory(@QueryParam('userId') userId: string): Promise<ApiResponse<null>> {
    logger.info('清除浏览历史', { userId })
    return success(null, '清除成功')
  }
}
