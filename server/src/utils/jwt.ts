import jwt from 'jsonwebtoken'
import { JWTPayload } from '../types'
import { logger } from './logger'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES: jwt.SignOptions['expiresIn'] = (process.env.JWT_EXPIRES || '7d') as jwt.SignOptions['expiresIn']

// 生产环境强制要求设置 JWT_SECRET
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    logger.error('JWT_SECRET 环境变量未设置，这是严重的安全风险')
    throw new Error('JWT_SECRET must be set in production')
  } else {
    logger.warn('JWT_SECRET 未设置，使用开发环境默认密钥')
  }
}

const SECRET = JWT_SECRET || 'dev-secret-key-do-not-use-in-production'

/**
 * JWT 工具函数
 */

/**
 * 生成 JWT Token
 * @param userId 用户ID
 * @param phone 手机号
 */
export function generateToken(userId: string, phone: string): string {
  return jwt.sign({ userId, phone }, SECRET, { expiresIn: JWT_EXPIRES })
}

/**
 * 验证 JWT Token
 * @param token Token字符串
 */
export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, SECRET) as JWTPayload
}

/**
 * 刷新 Token
 * @param token 旧Token
 */
export function refreshToken(token: string): string {
  const payload = verifyToken(token)
  return generateToken(payload.userId, payload.phone)
}
