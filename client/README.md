# Looker - 看客图片分享 APP

一款跨平台图片分享应用，支持微信小程序、Android、iOS、HarmonyOS 等多端部署。

## 技术栈

- **框架**: Vue 3 + Composition API + `<script setup>`
- **语言**: TypeScript 5.x (严格模式)
- **构建工具**: Vite
- **UI 组件**: @vant/weapp
- **样式**: Tailwind CSS + SCSS
- **跨平台**: uni-app

## 项目结构

```
Looker/
├── src/
│   ├── api/              # API 接口封装
│   │   ├── auth.ts       # 认证相关
│   │   └── content.ts    # 内容相关
│   ├── app/              # 页面
│   │   ├── home/         # 首页
│   │   ├── square/       # 广场
│   │   ├── share/        # 共享
│   │   ├── profile/      # 我的
│   │   ├── login/        # 登录
│   │   ├── register/     # 注册
│   │   ├── detail/       # 详情
│   │   ├── search/       # 搜索
│   │   ├── comment/      # 评论
│   │   └── user/         # 用户主页
│   ├── components/       # 组件
│   │   ├── CustomNavbar.vue
│   │   ├── CustomTabBar.vue
│   │   ├── FeedCard.vue
│   │   ├── WaterfallList.vue
│   │   └── CommentItem.vue
│   ├── types/            # 类型定义
│   │   ├── index.ts
│   │   └── user.ts
│   ├── utils/            # 工具函数
│   │   ├── request.ts    # HTTP 请求封装
│   │   ├── uniapi.ts     # uni-app API 封装
│   │   └── vant.ts       # Vant 配置
│   └── styles/           # 样式文件
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## 核心功能

### 认证模块
- 手机号 + 验证码登录
- 手机号 + 密码登录
- 微信 OAuth 登录
- 微博 OAuth 登录
- 用户注册
- 账号绑定/解绑

### 内容模块
- 瀑布流图片浏览
- 动态发布（图片/视频）
- 点赞/取消点赞
- 收藏/取消收藏
- 评论/回复
- 关注/取消关注

### 发现模块
- 轮播图推荐
- 分类筛选
- 热门话题
- 全文搜索
- 智能推荐

## 启动命令

```bash
# 安装依赖
npm install

# 微信小程序
npm run dev:mp-weixin

# H5
npm run dev:h5

# App (Android/iOS)
npm run dev:app

# 生产构建
npm run build:mp-weixin
npm run build:app
npm run build:h5
```

## 环境变量

创建 `.env.local`:

```env
VITE_API_BASE_URL=https://api.looker.com/v1
VITE_APP_ID=looker_app_xxx
```

## 多端适配

- **Android/iOS**: App 原生体验，支持推送、相机、定位
- **微信小程序**: 轻量级，支持分享、扫码
- **HarmonyOS**: 鸿蒙原生适配

## 开发规范

- 组件使用 PascalCase 命名
- 页面文件使用小写命名
- Props 使用 interface 定义
- 所有 API 调用封装在 `src/api/`
- 类型定义统一放在 `src/types/`
