import {
  JsonController,
  Get,
  Post,
  Delete,
  Param,
  QueryParam,
  Authorized,
} from 'routing-controllers'
import { IsString, IsIn, IsOptional } from 'class-validator'
import { Service } from 'typedi'
import { query, queryOne, execute } from '../utils/db'
import { success, error, paginate } from '../utils/response'
import type { ApiResponse, PaginationData } from '../types'

interface MessageItem {
  id: string
  type: 'like' | 'comment' | 'follow' | 'system'
  name: string
  avatar: string
  content: string
  time: string
  read: boolean
  image?: string
  targetId?: string
}

/**
 * 消息控制器
 * 处理消息列表、未读数、标记已读等
 */
@Service()
@JsonController('/messages')
export class MessageController {
  /**
   * 获取消息列表
   * GET /api/v1/messages
   */
  @Get()
  @Authorized()
  async getMessages(
    @QueryParam('userId') userId: string,
    @QueryParam('type') type: 'all' | 'like' | 'comment' | 'follow' | 'system' = 'all',
    @QueryParam('page') page = 1,
    @QueryParam('pageSize') pageSize = 20
  ): Promise<ApiResponse<PaginationData<MessageItem>>> {
    const offset = (page - 1) * pageSize

    let whereClause = 'WHERE m.user_id = $1'
    const params: unknown[] = [userId]

    if (type !== 'all') {
      whereClause += ' AND m.type = $2'
      params.push(type)
    }

    const messages = await query<{
      id: string
      type: string
      sender_name: string
      sender_avatar: string
      content: string
      created_at: string
      read: boolean
      image: string
      target_id: string
    }>(
      `SELECT m.id, m.type, COALESCE(u.name, '系统') as sender_name,
              COALESCE(u.avatar, '') as sender_avatar,
              m.content, m.created_at, m.read, m.image, m.target_id
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       ${whereClause}
       ORDER BY m.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    )

    const totalResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) FROM messages m ${whereClause}`,
      type !== 'all' ? [userId, type] : [userId]
    )

    const list = messages.map(m => ({
      id: m.id,
      type: m.type as MessageItem['type'],
      name: m.sender_name,
      avatar: m.sender_avatar,
      content: m.content,
      time: m.created_at,
      read: m.read,
      image: m.image,
      targetId: m.target_id,
    }))

    return paginate(list, parseInt(totalResult?.count || '0'), page, pageSize)
  }

  /**
   * 获取未读消息数
   * GET /api/v1/messages/unread
   */
  @Get('/unread')
  @Authorized()
  async getUnreadCount(@QueryParam('userId') userId: string): Promise<ApiResponse<{
    total: number
    like: number
    comment: number
    follow: number
    system: number
  }>> {
    const result = await query<{ type: string; count: string }>(
      `SELECT type, COUNT(*) as count
       FROM messages
       WHERE user_id = $1 AND read = false
       GROUP BY type`,
      [userId]
    )

    const counts = { total: 0, like: 0, comment: 0, follow: 0, system: 0 }

    for (const row of result) {
      const count = parseInt(row.count)
      counts.total += count
      if (row.type === 'like') counts.like = count
      if (row.type === 'comment') counts.comment = count
      if (row.type === 'follow') counts.follow = count
      if (row.type === 'system') counts.system = count
    }

    return success(counts)
  }

  /**
   * 标记消息已读
   * POST /api/v1/messages/:id/read
   */
  @Post('/:id/read')
  @Authorized()
  async markAsRead(
    @Param('id') id: string,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<null>> {
    await execute(
      'UPDATE messages SET read = true WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    return success(null)
  }

  /**
   * 一键已读
   * POST /api/v1/messages/read-all
   */
  @Post('/read-all')
  @Authorized()
  async markAllAsRead(@QueryParam('userId') userId: string): Promise<ApiResponse<null>> {
    await execute(
      'UPDATE messages SET read = true WHERE user_id = $1 AND read = false',
      [userId]
    )

    return success(null, '已全部标记为已读')
  }

  /**
   * 删除消息
   * DELETE /api/v1/messages/:id
   */
  @Delete('/:id')
  @Authorized()
  async deleteMessage(
    @Param('id') id: string,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<null>> {
    await execute(
      'DELETE FROM messages WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    return success(null, '删除成功')
  }
}
