import {
  JsonController,
  Get,
  Post,
  Param,
  QueryParam,
  Authorized,
} from 'routing-controllers'
import { Service } from 'typedi'
import { query, queryOne, execute, transaction } from '../utils/db'
import { success, error, paginate } from '../utils/response'
import { logger } from '../utils/logger'
import type { ApiResponse, PaginationData } from '../types'

interface TaskItem {
  id: string
  name: string
  description: string
  type: 'daily' | 'newbie' | 'achievement'
  points: number
  icon: string
  progress: number
  total: number
  completed: boolean
  claimed: boolean
}

interface GoodsItem {
  id: string
  name: string
  description: string
  image: string
  points: number
  stock: number
  type: 'virtual' | 'physical' | 'coupon'
}

/**
 * 积分控制器
 * 处理积分查询、签到、任务、兑换等
 */
@Service()
@JsonController('/points')
export class PointsController {
  /**
   * 获取积分信息
   * GET /api/v1/points
   */
  @Get()
  @Authorized()
  async getPoints(@QueryParam('userId') userId: string): Promise<ApiResponse<{
    points: number
    consecutiveDays: number
    hasSignedToday: boolean
  }>> {
    const pointsInfo = await queryOne<{
      points: number
      consecutive_days: number
      last_signin_date: string
    }>('SELECT * FROM user_points WHERE user_id = $1', [userId])

    if (!pointsInfo) {
      return error('积分信息不存在', 404)
    }

    const today = new Date().toISOString().split('T')[0]
    const hasSignedToday = pointsInfo.last_signin_date === today

    return success({
      points: pointsInfo.points,
      consecutiveDays: pointsInfo.consecutive_days,
      hasSignedToday,
    })
  }

  /**
   * 签到
   * POST /api/v1/points/signin
   */
  @Post('/signin')
  @Authorized()
  async signin(@QueryParam('userId') userId: string): Promise<ApiResponse<{
    points: number
    consecutiveDays: number
  }>> {
    const today = new Date().toISOString().split('T')[0]

    try {
      const result = await transaction(async (client) => {
        // 查询并锁定用户积分记录
        const pointsResult = await client.query(
          'SELECT points, consecutive_days, last_signin_date FROM user_points WHERE user_id = $1 FOR UPDATE',
          [userId]
        )

        if (pointsResult.rows.length === 0) {
          throw new Error('POINTS_NOT_FOUND')
        }

        const pointsInfo = pointsResult.rows[0]

        // 检查今天是否已签到
        if (pointsInfo.last_signin_date === today) {
          throw new Error('ALREADY_SIGNED')
        }

        // 检查是否是连续签到
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        let consecutiveDays = pointsInfo.consecutive_days
        if (pointsInfo.last_signin_date === yesterdayStr) {
          consecutiveDays += 1
        } else {
          consecutiveDays = 1
        }

        // 基础签到积分 + 连续签到奖励
        const basePoints = 10
        const bonusPoints = Math.min(consecutiveDays * 2, 20) // 最高20 bonus
        const totalPoints = basePoints + bonusPoints

        // 更新积分记录
        await client.query(
          `UPDATE user_points
           SET points = points + $1,
               consecutive_days = $2,
               last_signin_date = $3,
               updated_at = NOW()
           WHERE user_id = $4`,
          [totalPoints, consecutiveDays, today, userId]
        )

        // 记录积分变动
        await client.query(
          `INSERT INTO point_records (user_id, type, points, description, created_at)
           VALUES ($1, 'signin', $2, '每日签到', NOW())`,
          [userId, totalPoints]
        )

        return { points: totalPoints, consecutiveDays }
      })

      return success(result, '签到成功')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      if (errorMessage === 'ALREADY_SIGNED') {
        return error('今天已经签到过了', 400)
      }
      if (errorMessage === 'POINTS_NOT_FOUND') {
        return error('积分信息不存在', 404)
      }
      logger.error('签到失败', { userId, error: errorMessage })
      throw err
    }
  }

  /**
   * 获取任务列表
   * GET /api/v1/points/tasks
   */
  @Get('/tasks')
  @Authorized()
  async getTasks(@QueryParam('userId') userId: string): Promise<ApiResponse<{
    daily: TaskItem[]
    newbie: TaskItem[]
    achievements: TaskItem[]
  }>> {
    const tasks = await query<{
      id: string
      name: string
      description: string
      type: string
      points: number
      icon: string
      action_count: number
    }>('SELECT * FROM tasks WHERE status = \'active\' ORDER BY sort_order')

    const userTasks = await query<{
      task_id: string
      progress: number
      completed: boolean
      claimed: boolean
    }>('SELECT * FROM user_tasks WHERE user_id = $1', [userId])

    const userTaskMap = new Map(userTasks.map(ut => [ut.task_id, ut]))

    const daily: TaskItem[] = []
    const newbie: TaskItem[] = []
    const achievements: TaskItem[] = []

    for (const task of tasks) {
      const userTask = userTaskMap.get(task.id)
      const item: TaskItem = {
        id: task.id,
        name: task.name,
        description: task.description,
        type: task.type as TaskItem['type'],
        points: task.points,
        icon: task.icon,
        progress: userTask?.progress || 0,
        total: task.action_count,
        completed: userTask?.completed || false,
        claimed: userTask?.claimed || false,
      }

      if (task.type === 'daily') daily.push(item)
      else if (task.type === 'newbie') newbie.push(item)
      else if (task.type === 'achievement') achievements.push(item)
    }

    return success({ daily, newbie, achievements })
  }

  /**
   * 领取任务奖励
   * POST /api/v1/points/tasks/:id/claim
   */
  @Post('/tasks/:id/claim')
  @Authorized()
  async claimTaskReward(
    @Param('id') taskId: string,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<{ points: number }>> {
    const userTask = await queryOne<{
      id: string
      completed: boolean
      claimed: boolean
    }>(
      'SELECT * FROM user_tasks WHERE user_id = $1 AND task_id = $2',
      [userId, taskId]
    )

    if (!userTask) {
      return error('任务未开始', 400)
    }

    if (!userTask.completed) {
      return error('任务未完成', 400)
    }

    if (userTask.claimed) {
      return error('奖励已领取', 400)
    }

    const task = await queryOne<{ points: number }>(
      'SELECT points FROM tasks WHERE id = $1',
      [taskId]
    )

    if (!task) {
      return error('任务不存在', 404)
    }

    // 标记为已领取
    await execute(
      'UPDATE user_tasks SET claimed = true WHERE id = $1',
      [userTask.id]
    )

    // 增加积分
    await execute(
      'UPDATE user_points SET points = points + $1 WHERE user_id = $2',
      [task.points, userId]
    )

    // 记录积分变动
    await execute(
      `INSERT INTO point_records (user_id, type, points, description, created_at)
       VALUES ($1, 'task', $2, '完成任务奖励', NOW())`,
      [userId, task.points]
    )

    return success({ points: task.points }, '领取成功')
  }

  /**
   * 获取可兑换商品
   * GET /api/v1/points/goods
   */
  @Get('/goods')
  @Authorized()
  async getGoods(
    @QueryParam('type') type: 'all' | 'virtual' | 'physical' | 'coupon' = 'all',
    @QueryParam('page') page = 1,
    @QueryParam('pageSize') pageSize = 20
  ): Promise<ApiResponse<PaginationData<GoodsItem>>> {
    const offset = (page - 1) * pageSize

    let whereClause = "WHERE status = 'active'"
    const params: unknown[] = []

    if (type !== 'all') {
      whereClause += ' AND type = $1'
      params.push(type)
    }

    const goods = await query<GoodsItem>(
      `SELECT id, name, description, image, points, stock, type
       FROM point_goods
       ${whereClause}
       ORDER BY points ASC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    )

    const totalResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) FROM point_goods ${whereClause}`,
      type !== 'all' ? [type] : []
    )

    return paginate(goods, parseInt(totalResult?.count || '0'), page, pageSize)
  }

  /**
   * 兑换商品
   * POST /api/v1/points/exchange
   */
  @Post('/exchange')
  @Authorized()
  async exchangeGoods(
    @QueryParam('userId') userId: string,
    @QueryParam('goodsId') goodsId: string
  ): Promise<ApiResponse<null>> {
    const goods = await queryOne<{
      id: string
      points: number
      stock: number
    }>(
      "SELECT * FROM point_goods WHERE id = $1 AND status = 'active'",
      [goodsId]
    )

    if (!goods) {
      return error('商品不存在', 404)
    }

    if (goods.stock <= 0) {
      return error('商品库存不足', 400)
    }

    const pointsInfo = await queryOne<{ points: number }>(
      'SELECT points FROM user_points WHERE user_id = $1',
      [userId]
    )

    if (!pointsInfo || pointsInfo.points < goods.points) {
      return error('积分不足', 400)
    }

    // 扣除积分
    await execute(
      'UPDATE user_points SET points = points - $1 WHERE user_id = $2',
      [goods.points, userId]
    )

    // 减少库存
    await execute(
      'UPDATE point_goods SET stock = stock - 1 WHERE id = $1',
      [goodsId]
    )

    // 创建兑换记录
    await execute(
      `INSERT INTO point_exchanges (user_id, goods_id, points, status, created_at)
       VALUES ($1, $2, $3, 'completed', NOW())`,
      [userId, goodsId, goods.points]
    )

    // 记录积分变动
    await execute(
      `INSERT INTO point_records (user_id, type, points, description, created_at)
       VALUES ($1, 'exchange', $2, '积分兑换商品', NOW())`,
      [userId, -goods.points]
    )

    return success(null, '兑换成功')
  }
}
