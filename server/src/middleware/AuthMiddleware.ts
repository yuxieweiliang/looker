import { Middleware } from 'routing-controllers'
import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { error } from '../utils/response'

// 公开路由白名单（精确匹配）
const PUBLIC_PATHS = [
  '/auth/login/phone',
  '/auth/login/password',
  '/auth/register',
  '/auth/send-code',
  '/health',
]

// 公开路由前缀（以这些开头的路径都公开）
const PUBLIC_PREFIXES = [
  '/auth/login',
]

/**
 * 认证中间件
 * 验证 JWT Token 并将用户信息附加到请求
 */
@Middleware({ type: 'before' })
export class AuthMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const path = req.path

    // 检查是否是公开路由（精确匹配或前缀匹配）
    const isPublicPath = PUBLIC_PATHS.includes(path) ||
      PUBLIC_PREFIXES.some(prefix => path === prefix || path.startsWith(`${prefix}/`))

    if (isPublicPath) {
      next()
      return
    }

    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(error('未授权，请先登录', 401))
      return
    }

    const token = authHeader.substring(7)
    try {
      const payload = verifyToken(token)
      // 将用户信息附加到请求
      ;(req as unknown as Record<string, unknown>).user = {
        userId: payload.userId,
        phone: payload.phone,
      }
      next()
    } catch {
      res.status(401).json(error('Token 无效或已过期', 401))
    }
  }
}
