import {
  JsonController,
  Post,
  Delete,
  Body,
  QueryParam,
  QueryParams,
  Authorized,
} from 'routing-controllers'
import { IsString } from 'class-validator'
import { Service } from 'typedi'
import { queryOne, execute } from '../utils/db'
import { success, error } from '../utils/response'
import type { ApiResponse } from '../types'

/**
 * 收藏请求参数
 */
class BookmarkBody {
  @IsString()
  id!: string
}

/**
 * 收藏控制器
 * 处理动态收藏/取消收藏
 */
@Service()
@JsonController('/bookmarks')
export class BookmarkController {
  /**
   * 收藏/取消收藏
   * POST /api/v1/bookmarks
   */
  @Post()
  @Authorized()
  async toggleBookmark(
    @Body() body: BookmarkBody,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<{ isBookmarked: boolean }>> {
    const { id: feedId } = body

    // 检查动态是否存在
    const feed = await queryOne<{ id: string }>(
      "SELECT id FROM feeds WHERE id = $1 AND status = 'published'",
      [feedId]
    )

    if (!feed) {
      return error('动态不存在', 404)
    }

    // 检查是否已收藏
    const existingBookmark = await queryOne(
      'SELECT id FROM bookmarks WHERE user_id = $1 AND feed_id = $2',
      [userId, feedId]
    )

    if (existingBookmark) {
      // 取消收藏
      await execute(
        'DELETE FROM bookmarks WHERE user_id = $1 AND feed_id = $2',
        [userId, feedId]
      )

      // 更新动态收藏数
      await execute(
        'UPDATE feeds SET collections = GREATEST(collections - 1, 0) WHERE id = $1',
        [feedId]
      )

      // 更新用户收藏数
      await execute(
        'UPDATE users SET collections_count = GREATEST(collections_count - 1, 0) WHERE id = $1',
        [userId]
      )

      return success({ isBookmarked: false })
    } else {
      // 收藏
      await execute(
        'INSERT INTO bookmarks (user_id, feed_id, created_at) VALUES ($1, $2, NOW())',
        [userId, feedId]
      )

      // 更新动态收藏数
      await execute(
        'UPDATE feeds SET collections = collections + 1 WHERE id = $1',
        [feedId]
      )

      // 更新用户收藏数
      await execute(
        'UPDATE users SET collections_count = collections_count + 1 WHERE id = $1',
        [userId]
      )

      return success({ isBookmarked: true })
    }
  }
}
