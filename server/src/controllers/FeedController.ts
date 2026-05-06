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
import { IsString, IsOptional, IsArray, Length, IsNumber, Min, Max } from 'class-validator'
import { Service } from 'typedi'
import { v4 as uuidv4 } from 'uuid'
import { query, queryOne, execute } from '../utils/db'
import { success, error, paginate } from '../utils/response'
import type { ApiResponse, PaginationData, FeedItem, ImageItem } from '../types'
import type { PublishFeedForm } from '../types/content'

/**
 * 发布动态请求参数
 */
class PublishFeedBody implements PublishFeedForm {
  @IsString()
  @Length(1, 2000)
  content!: string

  @IsArray()
  @IsString({ each: true })
  images!: string[]

  @IsString()
  @IsOptional()
  location?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  topics?: string[]

  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number

  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number
}

/**
 * 动态控制器
 * 处理动态发布、查询、删除等
 */
@Service()
@JsonController('/feeds')
export class FeedController {
  /**
   * 获取动态列表
   * GET /api/v1/feeds
   */
  @Get()
  async getFeedList(
    @QueryParam('userId') userId: string,
    @QueryParam('page') page = 1,
    @QueryParam('pageSize') pageSize = 20,
    @QueryParam('type') type: 'following' | 'hot' | 'recent' = 'recent'
  ): Promise<ApiResponse<PaginationData<FeedItem>>> {
    const offset = (page - 1) * pageSize

    let whereClause = 'WHERE f.status = \'published\''
    let orderClause = 'ORDER BY f.created_at DESC'
    const params: unknown[] = []

    if (type === 'following' && userId) {
      whereClause += ` AND f.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1)`
    }

    if (type === 'hot') {
      orderClause = 'ORDER BY (f.likes + f.comments * 2 + f.shares * 3) DESC, f.created_at DESC'
    }

    const feeds = await query<{
      id: string
      user_id: string
      user_name: string
      user_avatar: string
      content: string
      images: ImageItem[]
      topics: string[]
      location: string
      views: number
      likes: number
      comments: number
      shares: number
      collections: number
      created_at: string
      is_liked: boolean
      is_collected: boolean
      is_following: boolean
    }>(
      `SELECT f.id, f.user_id, u.name as user_name, u.avatar as user_avatar,
              f.content, f.images, f.topics, f.location,
              f.views, f.likes, f.comments, f.shares, f.collections,
              f.created_at,
              ${userId ? `EXISTS(SELECT 1 FROM likes WHERE user_id = '${userId}' AND target_id = f.id AND target_type = 'feed')` : 'false'} as is_liked,
              ${userId ? `EXISTS(SELECT 1 FROM bookmarks WHERE user_id = '${userId}' AND feed_id = f.id)` : 'false'} as is_collected,
              ${userId ? `EXISTS(SELECT 1 FROM follows WHERE follower_id = '${userId}' AND following_id = f.user_id)` : 'false'} as is_following
       FROM feeds f
       JOIN users u ON f.user_id = u.id
       ${whereClause}
       ${orderClause}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    )

    const totalResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) FROM feeds f ${whereClause}`,
      params
    )

    const list = feeds.map(f => ({
      id: f.id,
      user: {
        id: f.user_id,
        name: f.user_name,
        avatar: f.user_avatar,
      },
      content: f.content,
      images: f.images || [],
      topics: f.topics || [],
      location: f.location,
      views: f.views,
      likes: f.likes,
      comments: f.comments,
      shares: f.shares,
      collections: f.collections,
      isLiked: f.is_liked,
      isCollected: f.is_collected,
      isFollowing: f.is_following,
      createdAt: f.created_at,
    }))

    return paginate(list, parseInt(totalResult?.count || '0'), page, pageSize)
  }

  /**
   * 获取动态详情
   * GET /api/v1/feeds/:id
   * 游客可访问
   */
  @Get('/:id')
  async getFeedById(
    @Param('id') id: string,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<FeedItem>> {
    // 增加浏览量
    await execute('UPDATE feeds SET views = views + 1 WHERE id = $1', [id])

    const feed = await queryOne<{
      id: string
      user_id: string
      user_name: string
      user_avatar: string
      content: string
      images: ImageItem[]
      topics: string[]
      location: string
      views: number
      likes: number
      comments: number
      shares: number
      collections: number
      created_at: string
      is_liked: boolean
      is_collected: boolean
      is_following: boolean
    }>(
      `SELECT f.id, f.user_id, u.name as user_name, u.avatar as user_avatar,
              f.content, f.images, f.topics, f.location,
              f.views, f.likes, f.comments, f.shares, f.collections,
              f.created_at,
              ${userId ? `EXISTS(SELECT 1 FROM likes WHERE user_id = '${userId}' AND target_id = f.id AND target_type = 'feed')` : 'false'} as is_liked,
              ${userId ? `EXISTS(SELECT 1 FROM bookmarks WHERE user_id = '${userId}' AND feed_id = f.id)` : 'false'} as is_collected,
              ${userId ? `EXISTS(SELECT 1 FROM follows WHERE follower_id = '${userId}' AND following_id = f.user_id)` : 'false'} as is_following
       FROM feeds f
       JOIN users u ON f.user_id = u.id
       WHERE f.id = $2 AND f.status = 'published'`,
      [userId, id]
    )

    if (!feed) {
      return error('动态不存在', 404)
    }

    return success({
      id: feed.id,
      user: {
        id: feed.user_id,
        name: feed.user_name,
        avatar: feed.user_avatar,
      },
      content: feed.content,
      images: feed.images || [],
      topics: feed.topics || [],
      location: feed.location,
      views: feed.views,
      likes: feed.likes,
      comments: feed.comments,
      shares: feed.shares,
      collections: feed.collections,
      isLiked: feed.is_liked,
      isCollected: feed.is_collected,
      isFollowing: feed.is_following,
      createdAt: feed.created_at,
    })
  }

  /**
   * 发布动态
   * POST /api/v1/feeds
   */
  @Post()
  @Authorized()
  async publishFeed(
    @Body() body: PublishFeedBody,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<{ id: string; createdAt: string }>> {
    const feedId = uuidv4()

    // 构建图片数组
    const images: ImageItem[] = body.images.map((url, index) => ({
      id: uuidv4(),
      url,
      width: 800,
      height: 600,
    }))

    await execute(
      `INSERT INTO feeds (id, user_id, content, images, topics, location, latitude, longitude, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'published', NOW(), NOW())`,
      [
        feedId,
        userId,
        body.content,
        JSON.stringify(images),
        body.topics || [],
        body.location || null,
        body.latitude || null,
        body.longitude || null,
      ]
    )

    // 更新用户作品数
    await execute(
      'UPDATE users SET works_count = works_count + 1 WHERE id = $1',
      [userId]
    )

    // 更新话题计数
    if (body.topics && body.topics.length > 0) {
      for (const topicName of body.topics) {
        await execute(
          'UPDATE topics SET count = count + 1 WHERE name = $1',
          [topicName]
        )
      }
    }

    return success({ id: feedId, createdAt: new Date().toISOString() }, '发布成功')
  }

  /**
   * 删除动态
   * DELETE /api/v1/feeds/:id
   */
  @Delete('/:id')
  @Authorized()
  async deleteFeed(
    @Param('id') id: string,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<null>> {
    const feed = await queryOne<{ user_id: string }>(
      'SELECT user_id FROM feeds WHERE id = $1',
      [id]
    )

    if (!feed) {
      return error('动态不存在', 404)
    }

    if (feed.user_id !== userId) {
      return error('无权删除此动态', 403)
    }

    await execute(
      "UPDATE feeds SET status = 'deleted' WHERE id = $1",
      [id]
    )

    // 更新用户作品数
    await execute(
      'UPDATE users SET works_count = works_count - 1 WHERE id = $1',
      [userId]
    )

    return success(null, '删除成功')
  }

  /**
   * 获取获赞列表（我收到的点赞）
   * GET /api/v1/feeds/likes/received
   */
  @Get('/likes/received')
  @Authorized()
  async getReceivedLikes(
    @QueryParam('userId') userId: string,
    @QueryParam('page') page = 1,
    @QueryParam('pageSize') pageSize = 20
  ): Promise<ApiResponse<PaginationData<{
    id: string
    user: { id: string; name: string; avatar: string }
    workId: string
    work: { thumb: string; title: string; likes: number }
    time: string
  }>>> {
    const offset = (page - 1) * pageSize

    const likes = await query<{
      id: string
      liker_id: string
      liker_name: string
      liker_avatar: string
      feed_id: string
      feed_title: string
      feed_images: ImageItem[]
      feed_likes: number
      created_at: string
    }>(
      `SELECT l.id, l.user_id as liker_id, u.name as liker_name, u.avatar as liker_avatar,
              f.id as feed_id, f.content as feed_title, f.images as feed_images, f.likes as feed_likes,
              l.created_at
       FROM likes l
       JOIN feeds f ON l.target_id = f.id
       JOIN users u ON l.user_id = u.id
       WHERE f.user_id = $1 AND l.target_type = 'feed'
       ORDER BY l.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, pageSize, offset]
    )

    const totalResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) FROM likes l
       JOIN feeds f ON l.target_id = f.id
       WHERE f.user_id = $1 AND l.target_type = 'feed'`,
      [userId]
    )

    const list = likes.map(l => ({
      id: l.id,
      user: {
        id: l.liker_id,
        name: l.liker_name,
        avatar: l.liker_avatar,
      },
      workId: l.feed_id,
      work: {
        thumb: l.feed_images?.[0]?.url || '',
        title: l.feed_title.slice(0, 50),
        likes: l.feed_likes,
      },
      time: l.created_at,
    }))

    return paginate(list, parseInt(totalResult?.count || '0'), page, pageSize)
  }

  /**
   * 获取我的作品列表
   * GET /api/v1/feeds/user/works
   */
  @Get('/user/works')
  @Authorized()
  async getUserWorks(
    @QueryParam('userId') userId: string,
    @QueryParam('page') page = 1,
    @QueryParam('pageSize') pageSize = 20
  ): Promise<ApiResponse<PaginationData<FeedItem>>> {
    const offset = (page - 1) * pageSize

    const feeds = await query<{
      id: string
      content: string
      images: ImageItem[]
      likes: number
      comments: number
      created_at: string
    }>(
      `SELECT id, content, images, likes, comments, created_at
       FROM feeds
       WHERE user_id = $1 AND status = 'published'
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, pageSize, offset]
    )

    const totalResult = await queryOne<{ count: string }>(
      "SELECT COUNT(*) FROM feeds WHERE user_id = $1 AND status = 'published'",
      [userId]
    )

    const user = await queryOne<{ name: string; avatar: string }>(
      'SELECT name, avatar FROM users WHERE id = $1',
      [userId]
    )

    const list = feeds.map(f => ({
      id: f.id,
      user: {
        id: userId,
        name: user?.name || '',
        avatar: user?.avatar || '',
      },
      content: f.content,
      images: f.images || [],
      topics: [],
      likes: f.likes,
      comments: f.comments,
      shares: 0,
      collections: 0,
      views: 0,
      isLiked: false,
      isCollected: false,
      isFollowing: false,
      createdAt: f.created_at,
    }))

    return paginate(list, parseInt(totalResult?.count || '0'), page, pageSize)
  }

  /**
   * 获取我的收藏列表
   * GET /api/v1/feeds/user/collections
   */
  @Get('/user/collections')
  @Authorized()
  async getUserCollections(
    @QueryParam('userId') userId: string,
    @QueryParam('page') page = 1,
    @QueryParam('pageSize') pageSize = 20
  ): Promise<ApiResponse<PaginationData<FeedItem>>> {
    const offset = (page - 1) * pageSize

    const feeds = await query<{
      id: string
      user_id: string
      user_name: string
      user_avatar: string
      content: string
      images: ImageItem[]
      likes: number
      comments: number
      created_at: string
    }>(
      `SELECT f.id, f.user_id, u.name as user_name, u.avatar as user_avatar,
              f.content, f.images, f.likes, f.comments, b.created_at
       FROM bookmarks b
       JOIN feeds f ON b.feed_id = f.id
       JOIN users u ON f.user_id = u.id
       WHERE b.user_id = $1 AND f.status = 'published'
       ORDER BY b.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, pageSize, offset]
    )

    const totalResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) FROM bookmarks b
       JOIN feeds f ON b.feed_id = f.id
       WHERE b.user_id = $1 AND f.status = 'published'`,
      [userId]
    )

    const list = feeds.map(f => ({
      id: f.id,
      user: {
        id: f.user_id,
        name: f.user_name,
        avatar: f.user_avatar,
      },
      content: f.content,
      images: f.images || [],
      topics: [],
      likes: f.likes,
      comments: f.comments,
      shares: 0,
      collections: 0,
      views: 0,
      isLiked: false,
      isCollected: true,
      isFollowing: false,
      createdAt: f.created_at,
    }))

    return paginate(list, parseInt(totalResult?.count || '0'), page, pageSize)
  }
}
