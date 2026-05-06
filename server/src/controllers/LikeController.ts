import {
  JsonController,
  Post,
  Body,
  QueryParam,
  Authorized,
} from 'routing-controllers'
import { IsString, IsIn } from 'class-validator'
import { Service } from 'typedi'
import { queryOne, execute } from '../utils/db'
import { success, error } from '../utils/response'
import type { ApiResponse } from '../types'

/**
 * 点赞请求参数
 */
class LikeBody {
  @IsString()
  id!: string

  @IsString()
  @IsIn(['feed', 'comment'])
  type!: 'feed' | 'comment'
}

/**
 * 点赞控制器
 * 处理动态和评论的点赞/取消点赞
 */
@Service()
@JsonController('/likes')
export class LikeController {
  /**
   * 点赞/取消点赞
   * POST /api/v1/likes
   */
  @Post()
  @Authorized()
  async toggleLike(
    @Body() body: LikeBody,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<{ isLiked: boolean; likes: number }>> {
    const { id, type } = body

    // 检查目标是否存在
    let target: { id: string; likes: number } | null = null

    if (type === 'feed') {
      target = await queryOne<{ id: string; likes: number }>(
        "SELECT id, likes FROM feeds WHERE id = $1 AND status = 'published'",
        [id]
      )
    } else {
      target = await queryOne<{ id: string; likes: number }>(
        "SELECT id, likes FROM comments WHERE id = $1 AND status = 'active'",
        [id]
      )
    }

    if (!target) {
      return error(`${type === 'feed' ? '动态' : '评论'}不存在`, 404)
    }

    // 检查是否已点赞
    const existingLike = await queryOne(
      'SELECT id FROM likes WHERE user_id = $1 AND target_id = $2 AND target_type = $3',
      [userId, id, type]
    )

    if (existingLike) {
      // 取消点赞
      await execute(
        'DELETE FROM likes WHERE user_id = $1 AND target_id = $2 AND target_type = $3',
        [userId, id, type]
      )

      return success({
        isLiked: false,
        likes: target.likes - 1,
      })
    } else {
      // 点赞
      await execute(
        'INSERT INTO likes (user_id, target_id, target_type, created_at) VALUES ($1, $2, $3, NOW())',
        [userId, id, type]
      )

      return success({
        isLiked: true,
        likes: target.likes + 1,
      })
    }
  }
}
