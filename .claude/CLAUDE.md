## 项目概述
Looker 是一个基于 uni-app 的图片分享社区APP，兼容小程序，Android，IOS，harnmay，多个平台
支持图片文章发布、用户认证、评论互动和全局搜索。面向用户社区，部署在 Vercel 上。

## 技术栈
- 框架：uni-app @vant/weapp
- 语言：TypeScript 5.x（strict 模式，tsconfig 中 strict: true）
- 样式：UnoCSS / Tailwind CSS 3.x（不使用 CSS Modules）
- 状态管理：Pinia

## 项目结构
src/
├── pages/                       # 页面目录
│   ├── home/                    # 首页
│   │   └── home.vue
│   ├── square/                  # 广场
│   │   └── square.vue
│   ├── topic/                   # 话题
│   │   ├── topic.vue            # 话题列表
│   │   ├── topic-select.vue     # 选择话题
│   │   └── draft.vue            # 草稿箱
│   ├── profile/                 # 我的
│   │   ├── profile.vue          # 个人中心
│   │   ├── edit.vue             # 编辑资料
│   │   ├── works.vue            # 我的作品
│   │   └── social.vue           # 社交（关注/粉丝）
│   ├── detail/                  # 详情页
│   │   └── detail.vue
│   ├── login/                   # 登录
│   │   └── login.vue
│   ├── register/                # 注册
│   │   └── register.vue
│   ├── search/                  # 搜索
│   │   └── search.vue
│   ├── comment/                 # 评论
│   │   └── comment.vue
│   ├── user/                    # 用户主页
│   │   └── user.vue
│   ├── message/                 # 消息通知
│   │   └── message.vue
│   ├── settings/                # 设置
│   │   ├── index.vue            # 通用设置
│   │   └── privacy.vue          # 隐私设置
│   ├── about/                   # 关于
│   │   ├── about.vue            # 关于我们
│   │   ├── help-feedback.vue    # 帮助与反馈
│   │   ├── terms.vue            # 用户协议
│   │   └── privacy.vue          # 隐私政策
│   ├── account/                 # 账户
│   │   ├── security.vue         # 账号安全
│   │   ├── wallet.vue           # 我的钱包
│   │   ├── transactions.vue     # 交易记录
│   │   ├── bank-cards.vue       # 银行卡管理
│   │   ├── coupons.vue          # 优惠券
│   │   └── exchange.vue         # 积分兑换
│   └── settings/                # 设置（扩展）
│       ├── index.vue            # 通用设置
│       ├── privacy.vue          # 隐私设置
│       ├── task.vue             # 任务中心
│       ├── phone.vue            # 修改手机号
│       ├── password.vue         # 修改密码
│       └── blacklist.vue        # 黑名单管理
├── components/                  # 可复用组件
│   ├── ui/                      # 基础 UI（Button、Input、Modal 等）
│   └── features/                # 业务组件（Comment、Search、Square 等）
├── static/                      # 静态资源
├── styles/                      # 公共样式
├── api/                         # 接口封装
├── utils/                       # 工具函数、配置、第三方封装
└── types/                       # TypeScript 类型定义（全局共享类型）

## 编码规范
- 组件声明：使用 function 关键字，不用箭头函数导出
  正确：export function FunctionName() {}
  错误：export const FunctionName = () => {}
- 服务端组件是默认值，只在需要交互时添加 'use client'
- 禁止使用 any 类型，所有变量和参数必须有明确类型
- import 使用命名导入，避免 default export（组件除外）
- 提交信息格式：type(scope): description（英文）
  示例：feat(blog): add article search functionality
- 组件使用 <script setup lang="ts"> 语法
- Props 使用 defineProps<PropsType>() 声明
- Emits 使用 defineEmits<EmitsType>() 声明
- 组合式函数放在 hooks/ 目录下，以 use 开头命名
- 页面组件放在 pages/，布局放在 layouts/

## 常用命令
- 调试(H5)：npm run dev:h5
- 调试(android)：npm run dev:app-android
- 调试(ios)：npm run dev:app-ios
- 生产构建(H5)：npm run build
- 生产构建(android)：npm run build:app-android
- 生产构建(ios)：npm run build:app-ios
- 类型检查：npx tsc --noEmit
- 代码检查：npm run lint
- 运行测试：npm run test
- 测试覆盖率：npm run test -- --coverage

## 导航栏高度计算：
- iPhone 无刘海：约 64（20 + 44）
- iPhone 有刘海：约 88（44 + 44）
- 根据实际状态栏高度计算，从 useSystemInfo() 获取实际的 navbarHeight（状态栏高度 + 标题栏高度）
- 使用内联样式动态设置 padding-top，单位是 rpx， 不在 CSS 中使用硬编码