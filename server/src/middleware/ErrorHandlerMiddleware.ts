import { Middleware, ExpressErrorMiddlewareInterface } from 'routing-controllers'
import { Request, Response, NextFunction } from 'express'
import { ValidationError } from 'class-validator'
import { error } from '../utils/response'
import { logger } from '../utils/logger'

/**
 * 错误处理中间件
 * 统一处理应用中的错误
 */
@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  error(err: Error, _req: Request, res: Response, _next: NextFunction): void {
    // 记录错误日志
    logger.error('Request error:', err)

    // 参数验证错误
    if (Array.isArray(err) && err[0] instanceof ValidationError) {
      const messages = err.map((e: ValidationError) => Object.values(e.constraints || {}).join(', '))
      res.status(400).json(error(`参数验证失败: ${messages.join('; ')}`, 400))
      return
    }

    // 自定义业务错误
    if (err.name === 'BadRequestError') {
      res.status(400).json(error(err.message, 400))
      return
    }

    if (err.name === 'UnauthorizedError') {
      res.status(401).json(error('未授权', 401))
      return
    }

    if (err.name === 'NotFoundError') {
      res.status(404).json(error('资源不存在', 404))
      return
    }

    if (err.name === 'ForbiddenError') {
      res.status(403).json(error('禁止访问', 403))
      return
    }

    // 数据库错误
    if (err.name === 'QueryFailedError') {
      res.status(500).json(error('数据库操作失败', 500))
      return
    }

    // 其他未知错误
    res.status(500).json(error('服务器内部错误', 500))
  }
}
