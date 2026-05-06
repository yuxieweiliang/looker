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
import { IsString, IsOptional, IsArray, Length } from 'class-validator'
import { Service } from 'typedi'
import { v4 as uuidv4 } from 'uuid'
import { query, queryOne, execute } from '../utils/db'
import { success, error, paginate } from '../utils/response'
import type { ApiResponse, PaginationData } from '../types'

interface DraftItem {
  id: string
  content: string
  images: string[]
  location?: string
  topics: string[]
  savedAt: string
}

/**
 * 保存草稿请求参数
 */
class SaveDraftBody {
  @IsString()
  @Length(0, 2000)
  @IsOptional()
  content?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[]

  @IsString()
  @IsOptional()
  location?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  topics?: string[]
}

/**
 * 草稿控制器
 * 处理草稿的保存、查询、删除等
 */
@Service()
@JsonController('/drafts')
export class DraftController {
  /**
   * 获取草稿列表
   * GET /api/v1/drafts
   */
  @Get()
  @Authorized()
  async getDrafts(
    @QueryParam('userId') userId: string,
    @QueryParam('page') page = 1,
    @QueryParam('pageSize') pageSize = 20
  ): Promise<ApiResponse<PaginationData<DraftItem>>> {
    const offset = (page - 1) * pageSize

    const drafts = await query<{
      id: string
      content: string
      images: string[]
      location: string
      topics: string[]
      saved_at: string
    }>(
      `SELECT id, content, images, location, topics, saved_at
       FROM drafts
       WHERE user_id = $1
       ORDER BY saved_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, pageSize, offset]
    )

    const totalResult = await queryOne<{ count: string }>(
      'SELECT COUNT(*) FROM drafts WHERE user_id = $1',
      [userId]
    )

    const list = drafts.map(d => ({
      id: d.id,
      content: d.content || '',
      images: d.images || [],
      location: d.location,
      topics: d.topics || [],
      savedAt: d.saved_at,
    }))

    return paginate(list, parseInt(totalResult?.count || '0'), page, pageSize)
  }

  /**
   * 获取草稿详情
   * GET /api/v1/drafts/:id
   */
  @Get('/:id')
  @Authorized()
  async getDraftById(
    @Param('id') id: string,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<DraftItem>> {
    const draft = await queryOne<{
      id: string
      content: string
      images: string[]
      location: string
      topics: string[]
      saved_at: string
    }>(
      'SELECT id, content, images, location, topics, saved_at FROM drafts WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    if (!draft) {
      return error('草稿不存在', 404)
    }

    return success({
      id: draft.id,
      content: draft.content || '',
      images: draft.images || [],
      location: draft.location,
      topics: draft.topics || [],
      savedAt: draft.saved_at,
    })
  }

  /**
   * 保存草稿
   * POST /api/v1/drafts
   */
  @Post()
  @Authorized()
  async saveDraft(
    @Body() body: SaveDraftBody,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<{ id: string; savedAt: string }>> {
    const draftId = uuidv4()

    await execute(
      `INSERT INTO drafts (id, user_id, content, images, location, topics, saved_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [
        draftId,
        userId,
        body.content || null,
        body.images || [],
        body.location || null,
        body.topics || [],
      ]
    )

    return success({ id: draftId, savedAt: new Date().toISOString() }, '保存成功')
  }

  /**
   * 更新草稿
   * POST /api/v1/drafts/:id
   */
  @Post('/:id')
  @Authorized()
  async updateDraft(
    @Param('id') id: string,
    @Body() body: SaveDraftBody,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<{ savedAt: string }>> {
    const draft = await queryOne<{ id: string }>(
      'SELECT id FROM drafts WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    if (!draft) {
      return error('草稿不存在', 404)
    }

    await execute(
      `UPDATE drafts
       SET content = $1, images = $2, location = $3, topics = $4, saved_at = NOW()
       WHERE id = $5 AND user_id = $6`,
      [
        body.content || null,
        body.images || [],
        body.location || null,
        body.topics || [],
        id,
        userId,
      ]
    )

    return success({ savedAt: new Date().toISOString() }, '更新成功')
  }

  /**
   * 删除草稿
   * DELETE /api/v1/drafts/:id
   */
  @Delete('/:id')
  @Authorized()
  async deleteDraft(
    @Param('id') id: string,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<null>> {
    const result = await execute(
      'DELETE FROM drafts WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    if (result.rowCount === 0) {
      return error('草稿不存在', 404)
    }

    return success(null, '删除成功')
  }
}
