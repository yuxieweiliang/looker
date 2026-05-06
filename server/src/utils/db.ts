import { Pool, PoolClient } from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { logger } from './logger'

// 加载环境变量 - 指定 .env 文件路径
dotenv.config({ path: path.join(__dirname, '../../.env') })

/**
 * PostgreSQL 数据库连接池
 */
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'looker',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '3342',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})



// 监听连接错误
pool.on('error', (err) => {
  logger.error('Unexpected database error', err)
})

/**
 * 执行 SQL 查询
 * @param text SQL 语句
 * @param params 参数
 */
export async function query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result.rows as T[]
  } finally {
    client.release()
  }
}

/**
 * 执行单条查询
 * @param text SQL 语句
 * @param params 参数
 */
export async function queryOne<T = unknown>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows.length > 0 ? rows[0] : null
}

/**
 * 执行插入/更新/删除
 * @param text SQL 语句
 * @param params 参数
 */
export async function execute(text: string, params?: unknown[]): Promise<{ rowCount: number; rows: unknown[] }> {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return { rowCount: result.rowCount || 0, rows: result.rows }
  } finally {
    client.release()
  }
}

/**
 * 事务执行
 * @param callback 事务回调
 */
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
