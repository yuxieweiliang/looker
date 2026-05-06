# Looker Backend

基于 Express + TypeScript + PostgreSQL 的后端 API 服务。

## 技术栈

- **框架**: Express + routing-controllers（装饰器路由）
- **语言**: TypeScript 5.x
- **数据库**: PostgreSQL 14+
- **ORM**: 原生 SQL + pg
- **认证**: JWT + bcrypt
- **依赖注入**: typedi
- **验证**: class-validator

## 快速开始

### 1. 安装依赖

```bash
cd server
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 配置数据库连接
```

### 3. 创建数据库

```bash
psql -U postgres -c "CREATE DATABASE looker;"
psql -U postgres -d looker -f ../database/schema.sql
```

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
src/
├── controllers/          # API 控制器（装饰器路由）
│   ├── AuthController.ts
│   ├── UserController.ts
│   ├── FeedController.ts
│   ├── CommentController.ts
│   ├── LikeController.ts
│   ├── BookmarkController.ts
│   ├── FollowController.ts
│   ├── TopicController.ts
│   ├── MessageController.ts
│   ├── SearchController.ts
│   ├── PointsController.ts
│   ├── WalletController.ts
│   └── UploadController.ts
├── middleware/           # 中间件
│   ├── AuthMiddleware.ts
│   └── ErrorHandlerMiddleware.ts
├── types/                # TypeScript 类型定义
│   ├── index.ts
│   ├── user.ts
│   └── content.ts
├── utils/                # 工具函数
│   ├── logger.ts
│   ├── db.ts
│   ├── jwt.ts
│   ├── crypto.ts
│   └── response.ts
├── index.ts             # 入口文件
```

## API 设计

### 装饰器使用

使用 `routing-controllers` 实现装饰器路由：

```typescript
@JsonController('/users')
export class UserController {
  @Get('/:id')
  async getUser(@Param('id') id: string) {
    // ...
  }

  @Post()
  async createUser(@Body() body: CreateUserBody) {
    // ...
  }
}
```

### 参数验证

使用 `class-validator` 验证请求参数：

```typescript
class LoginBody {
  @IsString()
  @Length(11, 11)
  phone!: string

  @IsString()
  @Length(6, 20)
  password!: string
}
```

### 认证保护

使用 `@Authorized()` 装饰器保护需要登录的接口：

```typescript
@Get('/profile')
@Authorized()
async getProfile(@QueryParam('userId') userId: string) {
  // 只有登录用户可访问
}
```

## 数据库

使用 PostgreSQL，表结构定义在 `../database/schema.sql` 中。

### 核心表

- `users` - 用户表
- `feeds` - 动态表（JSONB 存储图片）
- `likes` - 点赞表（通用设计，支持动态和评论）
- `comments` - 评论表
- `follows` - 关注关系表
- `bookmarks` - 收藏表
- `messages` - 消息表
- `wallets` - 钱包表
- `transactions` - 交易记录表

## 安全措施

1. **密码加密**: bcrypt 哈希存储
2. **JWT 认证**: Bearer Token 验证
3. **SQL 注入防护**: 参数化查询
4. **输入验证**: class-validator 严格验证
5. **错误处理**: 统一错误响应，不暴露敏感信息

## API 列表

详见根目录 `API.md` 文档。



