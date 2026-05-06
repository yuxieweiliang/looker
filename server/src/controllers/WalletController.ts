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
import { IsString, IsNumber, IsOptional, Min } from 'class-validator'
import { Service } from 'typedi'
import { query, queryOne, execute, transaction } from '../utils/db'
import { success, error, paginate } from '../utils/response'
import type { ApiResponse, PaginationData } from '../types'

interface WalletInfo {
  balance: string
  cardCount: number
  couponCount: number
}

interface TransactionItem {
  id: string
  title: string
  amount: string
  type: 'income' | 'expense' | 'recharge' | 'withdraw'
  time: string
}

interface BankCardItem {
  id: string
  bankName: string
  cardNumber: string
  cardType: string
  isDefault: boolean
}

interface CouponItem {
  id: string
  name: string
  description: string
  amount: number
  minSpend: number
  validStart: string
  validEnd: string
  status: 'unused' | 'used' | 'expired'
}

/**
 * 充值请求参数
 */
class RechargeBody {
  @IsNumber()
  @Min(1)
  amount!: number

  @IsString()
  paymentMethod!: 'wechat' | 'alipay'
}

/**
 * 提现请求参数
 */
class WithdrawBody {
  @IsNumber()
  @Min(1)
  amount!: number

  @IsString()
  cardId!: string
}

/**
 * 添加银行卡请求参数
 */
class AddCardBody {
  @IsString()
  bankName!: string

  @IsString()
  cardNumber!: string

  @IsString()
  holderName!: string

  @IsString()
  @IsOptional()
  cardType?: string
}

/**
 * 钱包控制器
 * 处理钱包信息、交易记录、充值提现、银行卡管理等
 */
@Service()
@JsonController('/wallet')
export class WalletController {
  /**
   * 获取钱包信息
   * GET /api/v1/wallet
   */
  @Get()
  @Authorized()
  async getWallet(@QueryParam('userId') userId: string): Promise<ApiResponse<WalletInfo>> {
    const wallet = await queryOne<{
      balance: string
    }>('SELECT balance FROM wallets WHERE user_id = $1', [userId])

    if (!wallet) {
      return error('钱包不存在', 404)
    }

    const cardCount = await queryOne<{ count: string }>(
      'SELECT COUNT(*) FROM bank_cards WHERE user_id = $1',
      [userId]
    )

    const couponCount = await queryOne<{ count: string }>(
      "SELECT COUNT(*) FROM coupons WHERE user_id = $1 AND status = 'unused'",
      [userId]
    )

    return success({
      balance: wallet.balance,
      cardCount: parseInt(cardCount?.count || '0'),
      couponCount: parseInt(couponCount?.count || '0'),
    })
  }

  /**
   * 获取交易记录
   * GET /api/v1/wallet/transactions
   */
  @Get('/transactions')
  @Authorized()
  async getTransactions(
    @QueryParam('userId') userId: string,
    @QueryParam('type') type: 'all' | 'income' | 'expense' | 'recharge' | 'withdraw' = 'all',
    @QueryParam('page') page = 1,
    @QueryParam('pageSize') pageSize = 20
  ): Promise<ApiResponse<PaginationData<TransactionItem>>> {
    const offset = (page - 1) * pageSize

    let whereClause = 'WHERE user_id = $1'
    const params: unknown[] = [userId]

    if (type !== 'all') {
      whereClause += ' AND type = $2'
      params.push(type)
    }

    const transactions = await query<TransactionItem>(
      `SELECT id, title, amount, type, created_at as time
       FROM transactions
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    )

    const totalResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) FROM transactions ${whereClause}`,
      type !== 'all' ? [userId, type] : [userId]
    )

    return paginate(transactions, parseInt(totalResult?.count || '0'), page, pageSize)
  }

  /**
   * 充值
   * POST /api/v1/wallet/recharge
   */
  @Post('/recharge')
  @Authorized()
  async recharge(
    @Body() body: RechargeBody,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<{ balance: string }>> {
    const { amount, paymentMethod } = body

    // TODO: 调用支付接口完成实际支付
    // 这里简化处理，直接到账

    await transaction(async (client) => {
      // 更新钱包余额
      await client.query(
        'UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE user_id = $2',
        [amount, userId]
      )

      // 获取更新后的余额
      const walletResult = await client.query(
        'SELECT balance FROM wallets WHERE user_id = $1',
        [userId]
      )
      const balance = walletResult.rows[0].balance

      // 创建交易记录
      await client.query(
        `INSERT INTO transactions (user_id, type, title, amount, balance, remark, created_at)
         VALUES ($1, 'recharge', '账户充值', $2, $3, $4, NOW())`,
        [userId, amount, balance, `通过${paymentMethod}充值`]
      )
    })

    const wallet = await queryOne<{ balance: string }>(
      'SELECT balance FROM wallets WHERE user_id = $1',
      [userId]
    )

    return success({ balance: wallet!.balance }, '充值成功')
  }

  /**
   * 提现
   * POST /api/v1/wallet/withdraw
   */
  @Post('/withdraw')
  @Authorized()
  async withdraw(
    @Body() body: WithdrawBody,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<{ balance: string }>> {
    const { amount, cardId } = body

    // 验证银行卡归属
    const card = await queryOne(
      'SELECT id FROM bank_cards WHERE id = $1 AND user_id = $2',
      [cardId, userId]
    )

    if (!card) {
      return error('银行卡不存在', 404)
    }

    // 在事务内检查余额并执行提现，防止并发超提
    const result = await transaction(async (client) => {
      // 先查询当前余额（带锁）
      const walletResult = await client.query(
        'SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE',
        [userId]
      )

      if (walletResult.rows.length === 0) {
        throw new Error('WALLET_NOT_FOUND')
      }

      const balance = parseFloat(walletResult.rows[0].balance)
      if (balance < amount) {
        throw new Error('INSUFFICIENT_BALANCE')
      }

      // 扣除余额
      await client.query(
        'UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE user_id = $2',
        [amount, userId]
      )

      // 获取更新后的余额
      const updatedResult = await client.query(
        'SELECT balance FROM wallets WHERE user_id = $1',
        [userId]
      )
      const newBalance = updatedResult.rows[0].balance

      // 创建交易记录
      await client.query(
        `INSERT INTO transactions (user_id, type, title, amount, balance, remark, created_at)
         VALUES ($1, 'withdraw', '账户提现', $2, $3, $4, NOW())`,
        [userId, -amount, newBalance, '提现到银行卡']
      )

      return newBalance
    })

    return success({ balance: result }, '提现申请已提交')
  }

  /**
   * 获取银行卡列表
   * GET /api/v1/wallet/cards
   */
  @Get('/cards')
  @Authorized()
  async getCards(@QueryParam('userId') userId: string): Promise<ApiResponse<BankCardItem[]>> {
    const cards = await query<{
      id: string
      bank_name: string
      card_number_mask: string
      card_type: string
      is_default: boolean
    }>(
      `SELECT id, bank_name, card_number_mask, card_type, is_default
       FROM bank_cards
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    )

    return success(cards.map(c => ({
      id: c.id,
      bankName: c.bank_name,
      cardNumber: c.card_number_mask,
      cardType: c.card_type,
      isDefault: c.is_default,
    })))
  }

  /**
   * 添加银行卡
   * POST /api/v1/wallet/cards
   */
  @Post('/cards')
  @Authorized()
  async addCard(
    @Body() body: AddCardBody,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<{ id: string }>> {
    const { bankName, cardNumber, holderName, cardType = '储蓄卡' } = body

    // 生成脱敏卡号
    const mask = cardNumber.slice(-4)
    const cardNumberMask = `****${mask}`

    const result = await queryOne<{ id: string }>(
      `INSERT INTO bank_cards (user_id, bank_name, card_number, card_number_mask, card_type, holder_name, is_default, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, false, NOW())
       RETURNING id`,
      [userId, bankName, cardNumber, cardNumberMask, cardType, holderName]
    )

    return success({ id: result!.id }, '添加成功')
  }

  /**
   * 删除银行卡
   * DELETE /api/v1/wallet/cards/:id
   */
  @Delete('/cards/:id')
  @Authorized()
  async deleteCard(
    @Param('id') cardId: string,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<null>> {
    await execute(
      'DELETE FROM bank_cards WHERE id = $1 AND user_id = $2',
      [cardId, userId]
    )

    return success(null, '删除成功')
  }

  /**
   * 设置默认银行卡
   * POST /api/v1/wallet/cards/:id/default
   */
  @Post('/cards/:id/default')
  @Authorized()
  async setDefaultCard(
    @Param('id') cardId: string,
    @QueryParam('userId') userId: string
  ): Promise<ApiResponse<null>> {
    await transaction(async (client) => {
      // 取消其他默认卡
      await client.query(
        'UPDATE bank_cards SET is_default = false WHERE user_id = $1',
        [userId]
      )

      // 设置当前卡为默认
      await client.query(
        'UPDATE bank_cards SET is_default = true WHERE id = $1 AND user_id = $2',
        [cardId, userId]
      )
    })

    return success(null, '设置成功')
  }

  /**
   * 获取优惠券列表
   * GET /api/v1/wallet/coupons
   */
  @Get('/coupons')
  @Authorized()
  async getCoupons(@QueryParam('userId') userId: string): Promise<ApiResponse<CouponItem[]>> {
    const coupons = await query<{
      id: string
      name: string
      description: string
      amount: string
      min_spend: string
      valid_start: string
      valid_end: string
      status: string
    }>(
      `SELECT id, name, description, amount, min_spend, valid_start, valid_end, status
       FROM coupons
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    )

    return success(coupons.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      amount: parseFloat(c.amount),
      minSpend: parseFloat(c.min_spend),
      validStart: c.valid_start,
      validEnd: c.valid_end,
      status: c.status as CouponItem['status'],
    })))
  }
}
