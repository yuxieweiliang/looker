import 'reflect-metadata'
import type { Request, Response } from 'express'
import { createExpressServer } from 'routing-controllers'
import { Container } from 'typedi'
import cors from 'cors'
import dotenv from 'dotenv'

import { AuthController } from './controllers/AuthController'
import { UserController } from './controllers/UserController'
import { FeedController } from './controllers/FeedController'
import { PhotoController } from './controllers/PhotoController'
import { CommentController } from './controllers/CommentController'
import { LikeController } from './controllers/LikeController'
import { BookmarkController } from './controllers/BookmarkController'
import { FollowController } from './controllers/FollowController'
import { TopicController } from './controllers/TopicController'
import { MessageController } from './controllers/MessageController'
import { SearchController } from './controllers/SearchController'
import { PointsController } from './controllers/PointsController'
import { WalletController } from './controllers/WalletController'
import { UploadController } from './controllers/UploadController'
import { DraftController } from './controllers/DraftController'
import { AuthMiddleware } from './middleware/AuthMiddleware'
import { ErrorHandlerMiddleware } from './middleware/ErrorHandlerMiddleware'
import { logger } from './utils/logger'

dotenv.config()

/**
 * Express 应用入口
 * 使用 routing-controllers 实现装饰器路由
 */
const app = createExpressServer({
  routePrefix: '/api/v1',
  controllers: [
    AuthController,
    UserController,
    FeedController,
    PhotoController,
    CommentController,
    LikeController,
    BookmarkController,
    FollowController,
    TopicController,
    MessageController,
    SearchController,
    PointsController,
    WalletController,
    UploadController,
    DraftController,
  ],
  middlewares: [AuthMiddleware, ErrorHandlerMiddleware],
  defaultErrorHandler: false,
  classTransformer: true,
  validation: true,
})

// 启用 CORS
app.use(cors())

// 健康检查
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`)
})
