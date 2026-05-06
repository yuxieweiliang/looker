/**
 * 数据库数据初始化脚本
 * 将 mock 数据插入到 PostgreSQL 数据库
 */

import bcrypt from 'bcryptjs'
import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

// 导入 mock 数据
import {
  mockUsers,
  mockTopics,
  mockFeeds,
  mockComments,
  mockBankCards,
  mockTransactions,
  mockFollows,
  mockLikes,
  mockBookmarks,
  mockUserPoints,
  mockWallets,
} from './mock-data.js'

// 数据库连接池
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'looker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '3342',
})

// 账号信息（明文密码用于保存到 account.json）
interface AccountInfo {
  userId: string
  phone: string
  name: string
  password: string
  level: number
  vip: boolean
}

const accounts: AccountInfo[] = []

/**
 * 加密密码
 */
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * 插入用户数据
 */
async function insertUsers(client: any): Promise<void> {
  console.log('插入用户数据...')

  for (const user of mockUsers) {
    const passwordHash = await hashPassword(user.password)

    await client.query(
      `INSERT INTO users (id, phone, password_hash, name, avatar, bio, gender, birthday, location, vip, level,
        following_count, followers_count, likes_count, works_count, collections_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
        phone = EXCLUDED.phone,
        name = EXCLUDED.name,
        avatar = EXCLUDED.avatar,
        bio = EXCLUDED.bio`,
      [
        user.id,
        user.phone,
        passwordHash,
        user.name,
        user.avatar,
        user.bio,
        user.gender,
        user.birthday,
        user.location,
        user.vip,
        user.level,
        user.following_count,
        user.followers_count,
        user.likes_count,
        user.works_count,
        user.collections_count,
      ]
    )

    accounts.push({
      userId: user.id,
      phone: user.phone,
      name: user.name,
      password: user.password,
      level: user.level,
      vip: user.vip,
    })

    console.log(`  ✓ 用户: ${user.name} (${user.phone})`)
  }

  console.log(`✅ 已插入 ${mockUsers.length} 个用户\n`)
}

/**
 * 插入话题数据
 */
async function insertTopics(client: any): Promise<void> {
  console.log('插入话题数据...')

  for (const topic of mockTopics) {
    await client.query(
      `INSERT INTO topics (id, name, cover, category, count, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       ON CONFLICT (name) DO UPDATE SET
        cover = EXCLUDED.cover,
        category = EXCLUDED.category,
        count = EXCLUDED.count,
        description = EXCLUDED.description`,
      [topic.id, topic.name, topic.cover, topic.category, topic.count, topic.desc]
    )

    console.log(`  ✓ 话题: #${topic.name}`)
  }

  console.log(`✅ 已插入 ${mockTopics.length} 个话题\n`)
}

/**
 * 插入动态数据
 */
async function insertFeeds(client: any): Promise<void> {
  console.log('插入动态数据...')

  for (const feed of mockFeeds) {
    await client.query(
      `INSERT INTO feeds (id, user_id, content, images, topics, location, latitude, longitude,
        status, views, likes, comments, shares, collections, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $15)
       ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        images = EXCLUDED.images,
        topics = EXCLUDED.topics`,
      [
        feed.id,
        feed.user_id,
        feed.content,
        JSON.stringify(feed.images),
        feed.topics,
        feed.location,
        feed.latitude,
        feed.longitude,
        'published',
        feed.views,
        feed.likes,
        feed.comments,
        feed.shares,
        feed.collections,
        feed.created_at,
      ]
    )

    console.log(`  ✓ 动态: ${feed.id} by ${feed.user_id}`)
  }

  console.log(`✅ 已插入 ${mockFeeds.length} 条动态\n`)
}

/**
 * 插入评论数据
 */
async function insertComments(client: any): Promise<void> {
  console.log('插入评论数据...')

  for (const comment of mockComments) {
    await client.query(
      `INSERT INTO comments (id, feed_id, user_id, content, likes, parent_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
       ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        likes = EXCLUDED.likes`,
      [
        comment.id,
        comment.feed_id,
        comment.user_id,
        comment.content,
        comment.likes,
        comment.parent_id,
        comment.created_at,
      ]
    )

    console.log(`  ✓ 评论: ${comment.id}`)
  }

  console.log(`✅ 已插入 ${mockComments.length} 条评论\n`)
}

/**
 * 插入关注数据
 */
async function insertFollows(client: any): Promise<void> {
  console.log('插入关注数据...')

  for (const follow of mockFollows) {
    await client.query(
      `INSERT INTO follows (id, follower_id, following_id, created_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [follow.id, follow.follower_id, follow.following_id, follow.created_at]
    )

    console.log(`  ✓ 关注: ${follow.follower_id} -> ${follow.following_id}`)
  }

  console.log(`✅ 已插入 ${mockFollows.length} 条关注关系\n`)
}

/**
 * 插入点赞数据
 */
async function insertLikes(client: any): Promise<void> {
  console.log('插入点赞数据...')

  for (const like of mockLikes) {
    await client.query(
      `INSERT INTO likes (id, user_id, target_id, target_type, created_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
      [like.id, like.user_id, like.target_id, like.target_type, like.created_at]
    )

    console.log(`  ✓ 点赞: ${like.user_id} -> ${like.target_type}:${like.target_id}`)
  }

  console.log(`✅ 已插入 ${mockLikes.length} 条点赞\n`)
}

/**
 * 插入收藏数据
 */
async function insertBookmarks(client: any): Promise<void> {
  console.log('插入收藏数据...')

  for (const bookmark of mockBookmarks) {
    await client.query(
      `INSERT INTO bookmarks (id, user_id, feed_id, created_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [bookmark.id, bookmark.user_id, bookmark.feed_id, bookmark.created_at]
    )

    console.log(`  ✓ 收藏: ${bookmark.user_id} -> ${bookmark.feed_id}`)
  }

  console.log(`✅ 已插入 ${mockBookmarks.length} 条收藏\n`)
}

/**
 * 插入银行卡数据
 */
async function insertBankCards(client: any): Promise<void> {
  console.log('插入银行卡数据...')

  for (const card of mockBankCards) {
    await client.query(
      `INSERT INTO bank_cards (id, user_id, bank_name, card_type, card_no, holder_name, is_default, bg_color, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
        is_default = EXCLUDED.is_default`,
      [
        card.id,
        card.user_id,
        card.bank_name,
        card.card_type,
        card.card_no,
        card.holder_name,
        card.is_default,
        card.bg_color,
      ]
    )

    console.log(`  ✓ 银行卡: ${card.bank_name} ****${card.card_no}`)
  }

  console.log(`✅ 已插入 ${mockBankCards.length} 张银行卡\n`)
}

/**
 * 插入交易记录数据
 */
async function insertTransactions(client: any): Promise<void> {
  console.log('插入交易记录数据...')

  for (const trans of mockTransactions) {
    await client.query(
      `INSERT INTO transactions (id, user_id, title, amount, type, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
       ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        amount = EXCLUDED.amount`,
      [trans.id, trans.user_id, trans.title, trans.amount, trans.type, 'completed', trans.time]
    )

    console.log(`  ✓ 交易: ${trans.title} ${trans.type === 'income' || trans.type === 'recharge' ? '+' : '-'}${trans.amount}`)
  }

  console.log(`✅ 已插入 ${mockTransactions.length} 条交易记录\n`)
}

/**
 * 插入积分数据
 */
async function insertUserPoints(client: any): Promise<void> {
  console.log('插入积分数据...')

  for (const points of mockUserPoints) {
    await client.query(
      `INSERT INTO user_points (id, user_id, points, consecutive_days, last_check_in, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE SET
        points = EXCLUDED.points,
        consecutive_days = EXCLUDED.consecutive_days,
        last_check_in = EXCLUDED.last_check_in`,
      [points.id, points.user_id, points.points, points.consecutive_days, points.last_check_in]
    )

    console.log(`  ✓ 积分: ${points.user_id} = ${points.points}`)
  }

  console.log(`✅ 已插入 ${mockUserPoints.length} 条积分记录\n`)
}

/**
 * 插入钱包数据
 */
async function insertWallets(client: any): Promise<void> {
  console.log('插入钱包数据...')

  for (const wallet of mockWallets) {
    await client.query(
      `INSERT INTO wallets (id, user_id, balance, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE SET
        balance = EXCLUDED.balance`,
      [wallet.id, wallet.user_id, wallet.balance]
    )

    console.log(`  ✓ 钱包: ${wallet.user_id} = ¥${wallet.balance}`)
  }

  console.log(`✅ 已插入 ${mockWallets.length} 个钱包\n`)
}

/**
 * 保存账号信息到 account.json
 */
function saveAccountsToFile(): void {
  const outputPath = path.join(process.cwd(), 'account.json')

  const accountData = {
    generatedAt: new Date().toISOString(),
    totalUsers: accounts.length,
    accounts: accounts,
    notice: '此文件包含用户明文密码，请妥善保管，不要提交到版本控制',
  }

  fs.writeFileSync(outputPath, JSON.stringify(accountData, null, 2), 'utf-8')
  console.log(`\n💾 账号信息已保存到: ${outputPath}`)
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log('=================================')
  console.log('🚀 Looker 数据库数据初始化')
  console.log('=================================\n')

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 按依赖顺序插入数据
    await insertUsers(client)
    await insertTopics(client)
    await insertFeeds(client)
    await insertComments(client)
    await insertFollows(client)
    await insertLikes(client)
    await insertBookmarks(client)
    await insertBankCards(client)
    await insertTransactions(client)
    await insertUserPoints(client)
    await insertWallets(client)

    await client.query('COMMIT')

    console.log('=================================')
    console.log('✅ 数据初始化完成！')
    console.log('=================================')

    // 保存账号信息
    saveAccountsToFile()

    console.log('\n📋 账号登录信息：')
    console.log('-------------------')
    for (const acc of accounts) {
      console.log(`👤 ${acc.name}`)
      console.log(`   手机号: ${acc.phone}`)
      console.log(`   密码: ${acc.password}`)
      console.log(`   等级: LV${acc.level} ${acc.vip ? '(VIP)' : ''}`)
      console.log('')
    }

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ 数据初始化失败:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

// 运行主函数
main()
