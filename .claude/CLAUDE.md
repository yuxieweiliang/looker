# Looker 图片分享社区

## 项目概述

Looker 是一个包含客户端和服务端两部分的 app 图片分享社区项目，支持多平台（小程序、Android、iOS、H5）。

- **client**: 基于 uni-app 的图片分享社区 APP
- **server**: Node.js/Express 后端服务，提供用户认证、图片分享、评论互动等 API

## 技术栈

### Client
- 框架：uni-app + @vant/weapp
- 语言：TypeScript 5.x（strict 模式）
- 样式：UnoCSS / Tailwind CSS 3.x
- 状态管理：Pinia
- 组件语法：`<script setup lang="ts">`

### Server
- 框架：Express.js
- 语言：TypeScript
- 数据库：PostgreSQL + Prisma
- 认证：JWT + bcrypt

## 项目结构

```
Looker/
├── client/                    # 客户端 (uni-app)
│   ├── src/
│   │   ├── pages/            # 页面目录
│   │   │   ├── home/          # 首页
│   │   │   ├── square/        # 广场
│   │   │   ├── topic/          # 话题
│   │   │   ├── profile/        # 个人中心
│   │   │   ├── detail/         # 详情页
│   │   │   ├── login/          # 登录
│   │   │   ├── register/       # 注册
│   │   │   ├── search/         # 搜索
│   │   │   ├── comment/        # 评论
│   │   │   ├── user/           # 用户主页
│   │   │   ├── message/        # 消息通知
│   │   │   ├── settings/       # 设置
│   │   │   ├── about/          # 关于
│   │   │   └── account/        # 账户
│   │   ├── components/        # 组件（ui/ 基础组件，features/ 业务组件）
│   │   ├── api/               # 接口封装
│   │   ├── utils/             # 工具函数
│   │   ├── types/             # TypeScript 类型定义
│   │   ├── styles/            # 公共样式
│   │   └── static/            # 静态资源
│   ├── index.html
│   └── package.json
│
└── server/                    # 服务端
    ├── src/
    │   ├── controllers/       # 控制器
    │   ├── services/         # 服务层
    │   ├── models/            # 数据模型
    │   ├── routes/            # 路由
    │   ├── middleware/        # 中间件
    │   ├── utils/             # 工具函数
    │   └── types/             # 类型定义
    ├── prisma/
    │   └── schema.prisma      # Prisma 数据模型
    ├── .env                   # 环境配置
    └── package.json
```

## 编码规范

### 通用
- 缩进：2 个空格
- 引号：单引号（字符串）
- 分号：不使用（除非 ASI 有歧义）
- 命名导入优先于默认导入
- 禁止使用 `any` 类型，所有变量和参数必须有明确类型
- 修改/新增之前先使用 git commit 提交现有文档，如果没有需要提交的内容，则跳过；
- 修改/新增完成后，再次 commit 已修改的文档；

### Client 组件
- 组件声明：使用 `function` 关键字，不用箭头函数导出
  - 正确：`export function FunctionName() {}`
  - 错误：`export const FunctionName = () => {}`
- Props 使用 `defineProps<PropsType>()` 声明
- Emits 使用 `defineEmits<EmitsType>()` 声明
- 组合式函数放在 `hooks/` 目录下，以 `use` 开头命名

### Server
- 控制器处理请求/响应逻辑
- 服务层处理业务逻辑
- 使用 Prisma 进行数据库操作
- API 响应格式统一使用 `ApiResponse<T>` 封装

### Commit 规范
- 格式：`type(scope): description`（英文）
- 示例：`feat(blog): add article search functionality`
- type: feat, fix, chore, docs, style, refactor, test

## 常用命令

### Client
```bash
cd client
pnpm install
pnpm dev:h5        # 调试 H5
pnpm dev:app-android  # 调试 Android
pnpm dev:app-ios   # 调试 iOS
pnpm build          # 生产构建 H5
pnpm build:app-android  # 生产构建 Android
pnpm build:app-ios # 生产构建 iOS
pnpm lint           # 代码检查
npx tsc --noEmit    # 类型检查
```

### Server
```bash
cd server
pnpm install
pnpm dev           # 开发模式
pnpm build         # 构建
pnpm start         # 生产启动
pnpm prisma:generate  # 生成 Prisma Client
pnpm prisma:migrate   # 数据库迁移
pnpm prisma:seed      # 种子数据
```

## API 基础路径

- 开发环境：`/api/v1`
- 生产环境：配置在 `VITE_API_BASE_URL`

## 环境变量

### Server (.env)
- `DATABASE_URL`: PostgreSQL 连接字符串
- `JWT_SECRET`: JWT 密钥
- `SALT_ROUNDS`: bcrypt 盐值轮数

### Client
- `VITE_API_BASE_URL`: API 基础路径

## 导航栏高度计算

- iPhone 无刘海：约 64px（20 + 44）
- iPhone 有刘海：约 88px（44 + 44）
- 从 `useSystemInfo()` 获取实际 `navbarHeight`（状态栏高度 + 标题栏高度）
- 使用内联样式动态设置 `padding-top`，单位是 rpx，不在 CSS 中硬编码