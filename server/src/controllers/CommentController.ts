import {
  JsonController,
  Get,
  Post,
  Delete,
  Body,
  Param,
  QueryParam,
  Authorized,
} from 'routing-controllers'
import { IsString, IsOptional, Length, IsIn } from 'class-validator'
import { Service } from 'typedi'
import { v4 as uuidv4 } from 'uuid'
import { query, queryOne, execute } from '../utils/db'
import { success, error, paginate } from '../utils/response'
import type { ApiResponse, PaginationData, CommentItem } from '../types'
import type { CreateCommentForm } from '../types/content'

/**
 * 创建评论请求参数
 */
class CreateCommentBody implements CreateCommentForm {
  @IsString()
  targetId!: string

  @IsString()
  @IsIn(['feed', 'photo'])
  targetType!: 'feed' | 'photo'

  @IsString()
  @Length(1, 1000)
  content!: string

  @IsString()
  @IsOptional()
  parentId?: string
}

/**
 * 评论控制器
 * 处理评论的查询、发布、删除、点赞等
 */
@Service()
@JsonController('/comments')
export class CommentController {
  /**
   * 获取评论列表
   * GET /api/v1/comments
   * 游客可访问
   */
  @Get()
  async getComments(
    @QueryParam('targetId') targetId: string,
    @QueryParam('targetType') targetType: 'feed' | 'photo',
    @QueryParam('userId') userId: string,
    @QueryParam('page') page = 1,
    @QueryParam('pageSize') pageSize = 20
  ): Promise<ApiResponse<PaginationData<CommentItem>>> {
    if (!targetId || !targetType) {
      return error('targetId 和 targetType 不能为空', 400)
    }

    const offset = (page - 1) * pageSize

    const comments = await query<{
      id: string
      user_id: string
      user_name: string
      user_avatar: string
      content: string
      likes: number
      replies: number
      reply_to: string
      parent_id: string
      created_at: string
      is_liked: boolean
    }>(
      `SELECT c.id, c.user_id, u.name as user_name, u.avatar as user_avatar,
              c.content, c.likes, c.replies, c.created_at, c.parent_id,
              pu.name as reply_to,
              ${userId ? `EXISTS(SELECT 1 FROM likes WHERE user_id = '${userId}' AND target_id = c.id AND target_type = 'comment')` : 'false'} as is_liked
       FROM comments c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN comments pc ON c.parent_id = pc.id
       LEFT JOIN users pu ON pc.user_id = pu.id
       WHERE c.target_id = $1 AND c.target_type = $2 AND c.status = 'active'
       ORDER BY c.created_at DESC
       LIMIT $3 OFFSET $4`,
      [targetId, targetType, pageSize, offset]
    )

    const totalResult = await queryOne<{ count: string }>(
      "SELECT COUNT(*) FROM comments WHERE target_id = $1 AND target_type = $2 AND status = 'active'",
      [targetId, targetType]
    )

    const list = comments.map(c => ({
      id: c.id,
      user: {
        id: c.user_id,
        name: c.user_name,
        avatar: c.user_avatar,
      },
      content: c.content,
      likes: c.likes,
      isLiked: c.is_liked,
      replies: c.replies,
      replyTo: c.reply_to,
      parentId: c.parent_id,
      createdAt: c.created_at,
    }))

    return paginate(list, parseInt(totalResult?.count || '0'), page, pageSize)
  }

  /**
   * 发表评论
   * POST /api/v1/comments
   */
  @Post()
  @Authorized()
  async createComment(
    @Body() body: CreateCommentBody,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<{ id: string; createdAt: string }>> {
    const { targetId, targetType, content, parentId } = body

    // 检查目标是否存在
    let targetExists = false
    if (targetType === 'feed') {
      const feed = await queryOne('SELECT id FROM feeds WHERE id = $1', [targetId])
      targetExists = !!feed
    } else {
      const photo = await queryOne('SELECT id FROM photos WHERE id = $1', [targetId])
      targetExists = !!photo
    }

    if (!targetExists) {
      return error(`${targetType === 'feed' ? '动态' : '图片'}不存在`, 404)
    }

    // 如果有父评论，检查是否存在
    if (parentId) {
      const parentComment = await queryOne('SELECT id FROM comments WHERE id = $1', [parentId])
      if (!parentComment) {
        return error('回复的评论不存在', 404)
      }

      // 更新父评论的回复数
      await execute(
        'UPDATE comments SET replies = replies + 1 WHERE id = $1',
        [parentId]
      )
    }

    const commentId = uuidv4()

    await execute(
      `INSERT INTO comments (id, user_id, target_id, target_type, content, parent_id, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', NOW())`,
      [commentId, userId, targetId, targetType, content, parentId || null]
    )

    // 更新目标的评论数
    if (targetType === 'feed') {
      await execute(
        'UPDATE feeds SET comments = comments + 1 WHERE id = $1',
        [targetId]
      )
    }

    return success({ id: commentId, createdAt: new Date().toISOString() }, '评论成功')
  }

  /**
   * 删除评论
   * DELETE /api/v1/comments/:id
   */
  @Delete('/:id')
  @Authorized()
  async deleteComment(
    @Param('id') id: string,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<null>> {
    const comment = await queryOne<{
      user_id: string
      target_id: string
      target_type: string
      parent_id: string
    }>('SELECT user_id, target_id, target_type, parent_id FROM comments WHERE id = $1', [id])

    if (!comment) {
      return error('评论不存在', 404)
    }

    if (comment.user_id !== userId) {
      return error('无权删除此评论', 403)
    }

    await execute(
      "UPDATE comments SET status = 'deleted' WHERE id = $1",
      [id]
    )

    // 更新目标的评论数
    if (comment.target_type === 'feed') {
      await execute(
        'UPDATE feeds SET comments = GREATEST(comments - 1, 0) WHERE id = $1',
        [comment.target_id]
      )
    }

    // 更新父评论的回复数
    if (comment.parent_id) {
      await execute(
        'UPDATE comments SET replies = GREATEST(replies - 1, 0) WHERE id = $1',
        [comment.parent_id]
      )
    }

    return success(null, '删除成功')
  }

  /**
   * 点赞/取消点赞评论
   * POST /api/v1/comments/:id/like
   */
  @Post('/:id/like')
  @Authorized()
  async likeComment(
    @Param('id') id: string,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<{ isLiked: boolean; likes: number }>> {
    const comment = await queryOne<{ id: string; likes: number }>(
      'SELECT id, likes FROM comments WHERE id = $1 AND status = \'active\'',
      [id]
    )

    if (!comment) {
      return error('评论不存在', 404)
    }

    const existingLike = await queryOne(
      'SELECT id FROM likes WHERE user_id = $1 AND target_id = $2 AND target_type = \'comment\'',
      [userId, id]
    )

    if (existingLike) {
      // 取消点赞
      await execute(
        'DELETE FROM likes WHERE user_id = $1 AND target_id = $2 AND target_type = \'comment\'',
        [userId, id]
      )

      return success({
        isLiked: false,
        likes: comment.likes - 1,
      })
    } else {
      // 点赞
      await execute(
        'INSERT INTO likes (user_id, target_id, target_type, created_at) VALUES ($1, $2, \'comment\', NOW())',
        [userId, id]
      )

      return success({
        isLiked: true,
        likes: comment.likes + 1,
      })
    }
  }
}
