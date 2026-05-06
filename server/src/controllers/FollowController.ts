import {
  JsonController,
  Post,
  Delete,
  Body,
  Param,
  QueryParam,
  Get,
  Authorized,
} from 'routing-controllers'
import { IsString } from 'class-validator'
import { Service } from 'typedi'
import { query, queryOne, execute } from '../utils/db'
import { success, error, paginate } from '../utils/response'
import type { ApiResponse, PaginationData } from '../types'

/**
 * 关注请求参数
 */
class FollowBody {
  @IsString()
  userId!: string
}

/**
 * 关注控制器
 * 处理关注/取消关注、获取关注列表、粉丝列表、黑名单等
 */
@Service()
@JsonController('/follows')
export class FollowController {
  /**
   * 关注/取消关注用户
   * POST /api/v1/follows
   */
  @Post()
  @Authorized()
  async toggleFollow(
    @Body() body: FollowBody,
    @QueryParam('userId') currentUserId: string
  ): Promise<ApiResponse<{ isFollowing: boolean }>> {
    const { userId: targetUserId } = body

    if (currentUserId === targetUserId) {
      return error('不能关注自己', 400)
    }

    // 检查目标用户是否存在
    const targetUser = await queryOne('SELECT id FROM users WHERE id = $1', [targetUserId])
    if (!targetUser) {
      return error('用户不存在', 404)
    }

    // 检查是否已关注
    const existingFollow = await queryOne(
      'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [currentUserId, targetUserId]
    )

    if (existingFollow) {
      // 取消关注
      await execute(
        'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
        [currentUserId, targetUserId]
      )

      return success({ isFollowing: false })
    } else {
      // 关注
      await execute(
        'INSERT INTO follows (follower_id, following_id, created_at) VALUES ($1, $2, NOW())',
        [currentUserId, targetUserId]
      )

      return success({ isFollowing: true })
    }
  }

  /**
   * 获取关注列表
   * GET /api/v1/follows/following
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
   * GET /api/v1/follows/followers
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
   * 加入黑名单
   * POST /api/v1/follows/blacklist
   */
  @Post('/blacklist')
  @Authorized()
  async addToBlacklist(
    @Body() body: FollowBody,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<null>> {
    const { userId: blockedUserId } = body

    if (userId === blockedUserId) {
      return error('不能拉黑自己', 400)
    }

    // 检查目标用户是否存在
    const targetUser = await queryOne('SELECT id FROM users WHERE id = $1', [blockedUserId])
    if (!targetUser) {
      return error('用户不存在', 404)
    }

    // 检查是否已在黑名单
    const existing = await queryOne(
      'SELECT id FROM blacklist WHERE user_id = $1 AND blocked_user_id = $2',
      [userId, blockedUserId]
    )

    if (existing) {
      return error('该用户已在黑名单中', 409)
    }

    await execute(
      'INSERT INTO blacklist (user_id, blocked_user_id, created_at) VALUES ($1, $2, NOW())',
      [userId, blockedUserId]
    )

    // 如果关注了该用户，取消关注
    await execute(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
      [userId, blockedUserId]
    )

    return success(null, '已加入黑名单')
  }

  /**
   * 移除黑名单
   * DELETE /api/v1/follows/blacklist/:userId
   */
  @Delete('/blacklist/:id')
  @Authorized()
  async removeFromBlacklist(
    @Param('id') blockedUserId: string,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<null>> {
    await execute(
      'DELETE FROM blacklist WHERE user_id = $1 AND blocked_user_id = $2',
      [userId, blockedUserId]
    )

    return success(null, '已移出黑名单')
  }

  /**
   * 获取黑名单列表
   * GET /api/v1/follows/blacklist
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
}
