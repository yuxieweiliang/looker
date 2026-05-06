import {
  JsonController,
  Get,
  QueryParam,
  Authorized,
} from 'routing-controllers'
import { Service } from 'typedi'
import { query, queryOne } from '../utils/db'
import { paginate } from '../utils/response'
import type { ApiResponse, PaginationData, ImageItem } from '../types'

interface PhotoItem {
  id: string
  url: string
  title: string
  width: number
  height: number
  user: {
    id: string
    name: string
    avatar: string
  }
  likes: number
  views: number
}

/**
 * 图片瀑布流控制器
 * 处理瀑布流图片列表查询
 */
@Service()
@JsonController('/photos')
export class PhotoController {
  /**
   * 获取瀑布流图片列表
   * GET /api/v1/photos
   * 游客可访问
   */
  @Get()
  async getPhotoList(
    @QueryParam('userId') userId: string,
    @QueryParam('page') page = 1,
    @QueryParam('pageSize') pageSize = 20,
    @QueryParam('category') category?: string,
    @QueryParam('sort') sort: 'hot' | 'new' = 'new'
  ): Promise<ApiResponse<PaginationData<PhotoItem>>> {
    const offset = (page - 1) * pageSize

    // 构建排序条件
    const orderClause = sort === 'hot'
      ? 'ORDER BY f.likes DESC, f.views DESC, f.created_at DESC'
      : 'ORDER BY f.created_at DESC'

    // 构建分类过滤条件
    let whereClause = "WHERE f.status = 'published'"
    const params: unknown[] = []

    if (category && category !== 'all') {
      whereClause += ` AND $${params.length + 1} = ANY(f.topics)`
      params.push(category)
    }

    // 查询动态列表（展开图片）
    const feeds = await query<{
      id: string
      user_id: string
      user_name: string
      user_avatar: string
      content: string
      images: ImageItem[]
      views: number
      likes: number
    }>(
      `SELECT f.id, f.user_id, u.name as user_name, u.avatar as user_avatar,
              f.content, f.images, f.views, f.likes
       FROM feeds f
       JOIN users u ON f.user_id = u.id
       ${whereClause}
       ${orderClause}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize * 3, offset] // 获取更多数据，因为每个动态可能有多张图片
    )

    // 将动态展开为图片列表
    const photos: PhotoItem[] = []
    for (const feed of feeds) {
      const images = feed.images || []
      for (const image of images) {
        photos.push({
          id: `${feed.id}_${image.id}`,
          url: image.url,
          title: feed.content.slice(0, 50) + (feed.content.length > 50 ? '...' : ''),
          width: image.width || 800,
          height: image.height || 600,
          user: {
            id: feed.user_id,
            name: feed.user_name,
            avatar: feed.user_avatar,
          },
          likes: feed.likes,
          views: feed.views,
        })
      }
    }

    // 限制返回数量
    const limitedPhotos = photos.slice(0, pageSize)

    // 获取总数估算
    const totalResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) FROM feeds f ${whereClause}`,
      params
    )

    // 估算总图片数（假设平均每个动态3张图片）
    const estimatedTotal = parseInt(totalResult?.count || '0') * 3

    return paginate(limitedPhotos, estimatedTotal, page, pageSize)
  }
}
