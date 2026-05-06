import {
  JsonController,
  Get,
  Post,
  Param,
  QueryParam,
  Authorized,
} from 'routing-controllers'
import { Service } from 'typedi'
import { query, queryOne, execute } from '../utils/db'
import { success, error, paginate } from '../utils/response'
import type { ApiResponse, PaginationData } from '../types'

interface TopicItem {
  id: string
  name: string
  description: string
  count: number
  bgColor: string
  isFollowed: boolean
}

/**
 * 话题控制器
 * 处理话题列表、详情、关注等
 */
@Service()
@JsonController('/topics')
export class TopicController {
  /**
   * 获取话题列表
   * GET /api/v1/topics
   * 游客可访问
   */
  @Get()
  async getTopics(
    @QueryParam('userId') userId: string,
    @QueryParam('page') page = 1,
    @QueryParam('pageSize') pageSize = 20,
    @QueryParam('sort') sort: 'hot' | 'new' = 'hot'
  ): Promise<ApiResponse<PaginationData<TopicItem>>> {
    const offset = (page - 1) * pageSize

    const orderClause = sort === 'hot' ? 'ORDER BY t.count DESC' : 'ORDER BY t.created_at DESC'

    const topics = await query<{
      id: string
      name: string
      description: string
      count: number
      bg_color: string
      is_followed: boolean
    }>(
      `SELECT t.id, t.name, t.description, t.count, t.bg_color,
              EXISTS(SELECT 1 FROM topic_follows WHERE user_id = $1 AND topic_id = t.id) as is_followed
       FROM topics t
       ${orderClause}
       LIMIT $2 OFFSET $3`,
      [userId || '', pageSize, offset]
    )

    const totalResult = await queryOne<{ count: string }>('SELECT COUNT(*) FROM topics')

    const list = topics.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      count: t.count,
      bgColor: t.bg_color,
      isFollowed: t.is_followed,
    }))

    return paginate(list, parseInt(totalResult?.count || '0'), page, pageSize)
  }

  /**
   * 获取话题详情
   * GET /api/v1/topics/:name
   */
  @Get('/:name')
  @Authorized()
  async getTopicByName(
    @Param('name') name: string,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<TopicItem>> {
    const topic = await queryOne<{
      id: string
      name: string
      description: string
      count: number
      bg_color: string
      is_followed: boolean
    }>(
      `SELECT t.id, t.name, t.description, t.count, t.bg_color,
              EXISTS(SELECT 1 FROM topic_follows WHERE user_id = $1 AND topic_id = t.id) as is_followed
       FROM topics t
       WHERE t.name = $2`,
      [userId, name]
    )

    if (!topic) {
      return error('话题不存在', 404)
    }

    return success({
      id: topic.id,
      name: topic.name,
      description: topic.description,
      count: topic.count,
      bgColor: topic.bg_color,
      isFollowed: topic.is_followed,
    })
  }

  /**
   * 关注/取消关注话题
   * POST /api/v1/topics/:name/follow
   */
  @Post('/:name/follow')
  @Authorized()
  async toggleTopicFollow(
    @Param('name') name: string,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<{ isFollowed: boolean }>> {
    const topic = await queryOne<{ id: string }>('SELECT id FROM topics WHERE name = $1', [name])

    if (!topic) {
      return error('话题不存在', 404)
    }

    const existingFollow = await queryOne(
      'SELECT id FROM topic_follows WHERE user_id = $1 AND topic_id = $2',
      [userId, topic.id]
    )

    if (existingFollow) {
      // 取消关注
      await execute(
        'DELETE FROM topic_follows WHERE user_id = $1 AND topic_id = $2',
        [userId, topic.id]
      )

      return success({ isFollowed: false })
    } else {
      // 关注
      await execute(
        'INSERT INTO topic_follows (user_id, topic_id, created_at) VALUES ($1, $2, NOW())',
        [userId, topic.id]
      )

      return success({ isFollowed: true })
    }
  }
}
