import {
  JsonController,
  Get,
  QueryParam,
  Authorized,
} from 'routing-controllers'
import { Service } from 'typedi'
import { query, queryOne } from '../utils/db'
import { success, paginate } from '../utils/response'
import type { ApiResponse, PaginationData } from '../types'

interface SearchResult {
  id: string
  type: 'post' | 'user' | 'topic'
  title: string
  subtitle?: string
  image?: string
}

/**
 * 搜索控制器
 * 处理搜索、热门搜索、搜索建议等
 */
@Service()
@JsonController('/search')
export class SearchController {
  /**
   * 搜索
   * GET /api/v1/search
   * 游客可访问
   */
  @Get()
  async search(
    @QueryParam('keyword') keyword: string,
    @QueryParam('type') type: 'all' | 'user' | 'post' | 'topic' = 'all',
    @QueryParam('page') page = 1,
    @QueryParam('pageSize') pageSize = 20
  ): Promise<ApiResponse<PaginationData<SearchResult>>> {
    if (!keyword || keyword.trim() === '') {
      return success({ list: [], total: 0, hasMore: false })
    }

    const results: SearchResult[] = []

    // 搜索用户
    if (type === 'all' || type === 'user') {
      const users = await query<{
        id: string
        name: string
        avatar: string
        bio: string
      }>(
        `SELECT id, name, avatar, bio
         FROM users
         WHERE name ILIKE $1 OR bio ILIKE $1
         LIMIT $2`,
        [`%${keyword}%`, type === 'all' ? 5 : pageSize]
      )

      users.forEach(u => {
        results.push({
          id: u.id,
          type: 'user',
          title: u.name,
          subtitle: u.bio,
          image: u.avatar,
        })
      })
    }

    // 搜索动态
    if (type === 'all' || type === 'post') {
      const feeds = await query<{
        id: string
        content: string
        images: { url: string }[]
        user_name: string
      }>(
        `SELECT f.id, f.content, f.images, u.name as user_name
         FROM feeds f
         JOIN users u ON f.user_id = u.id
         WHERE f.content ILIKE $1 AND f.status = 'published'
         LIMIT $2`,
        [`%${keyword}%`, type === 'all' ? 10 : pageSize]
      )

      feeds.forEach(f => {
        results.push({
          id: f.id,
          type: 'post',
          title: f.content.slice(0, 50) + (f.content.length > 50 ? '...' : ''),
          subtitle: `来自 ${f.user_name}`,
          image: f.images?.[0]?.url,
        })
      })
    }

    // 搜索话题
    if (type === 'all' || type === 'topic') {
      const topics = await query<{
        id: string
        name: string
        description: string
        count: number
      }>(
        `SELECT id, name, description, count
         FROM topics
         WHERE name ILIKE $1 OR description ILIKE $1
         LIMIT $2`,
        [`%${keyword}%`, type === 'all' ? 5 : pageSize]
      )

      topics.forEach(t => {
        results.push({
          id: t.id,
          type: 'topic',
          title: `#${t.name}`,
          subtitle: `${t.count} 参与 · ${t.description}`,
        })
      })
    }

    // 记录搜索历史
    await queryOne(
      `INSERT INTO search_history (keyword, count, last_searched_at)
       VALUES ($1, 1, NOW())
       ON CONFLICT (keyword) DO UPDATE SET
       count = search_history.count + 1,
       last_searched_at = NOW()`,
      [keyword]
    )

    return paginate(results, results.length, page, pageSize)
  }

  /**
   * 获取热门搜索
   * GET /api/v1/search/hot
   */
  @Get('/hot')
  @Authorized()
  async getHotSearches(): Promise<ApiResponse<string[]>> {
    const result = await query<{ keyword: string }>(
      `SELECT keyword
       FROM search_history
       ORDER BY count DESC, last_searched_at DESC
       LIMIT 10`
    )

    return success(result.map(r => r.keyword))
  }

  /**
   * 获取搜索建议
   * GET /api/v1/search/suggestions
   */
  @Get('/suggestions')
  @Authorized()
  async getSuggestions(@QueryParam('keyword') keyword: string): Promise<ApiResponse<string[]>> {
    if (!keyword || keyword.length < 1) {
      return success([])
    }

    const result = await query<{ keyword: string }>(
      `SELECT keyword
       FROM search_history
       WHERE keyword ILIKE $1
       ORDER BY count DESC
       LIMIT 5`,
      [`${keyword}%`]
    )

    return success(result.map(r => r.keyword))
  }
}
