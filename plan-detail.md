# Looker 登录体验优化详细方案

## 一、现状总览

### 1.1 接口公开性（服务端 - 已验证）

#### 公开接口（无需登录）

| 接口 | 方法 | 说明 |
|------|------|------|
| `/feeds` | GET | 动态列表 |
| `/feeds/:id` | GET | 动态详情 + 评论 |
| `/photos` | GET | 瀑布流图片 |
| `/topics` | GET | 话题列表 |
| `/search` | GET | 搜索 |
| `/search/hot` | GET | 热门搜索 |
| `/search/suggestions` | GET | 搜索建议 |
| `/users/:id` | GET | 用户主页 |

#### 需要登录的接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/topics/:name` | GET | 话题详情 |
| `/topics/:name/follow` | POST | 关注话题 |
| `/feeds` | POST | 发布动态 |
| `/feeds/:id` | DELETE | 删除动态 |
| `/feeds/likes/received` | GET | 获赞列表 |
| `/feeds/user/works` | GET | 我的作品 |
| `/feeds/user/collections` | GET | 我的收藏 |
| `/likes` | POST | 点赞/取消点赞 |
| `/bookmarks` | POST | 收藏/取消收藏 |
| `/follows` | POST | 关注/取关 |
| `/comments` | POST | 发表评论 |
| `/comments/:id` | DELETE | 删除评论 |
| `/comments/:id/like` | POST | 点赞评论 |
| `/messages` | GET | 消息列表 |
| `/messages/unread` | GET | 未读数 |
| `/messages/:id/read` | POST | 标记已读 |
| `/messages/read-all` | POST | 一键已读 |
| `/messages/:id` | DELETE | 删除消息 |
| `/user/info` | GET | 当前用户信息 |
| `/user/update` | POST | 更新用户信息 |
| `/user/avatar` | POST | 上传头像 |
| `/user/password` | POST | 修改密码 |
| `/user/phone` | POST | 修改手机号 |
| `/user/following` | GET | 关注列表 |
| `/user/followers` | GET | 粉丝列表 |
| `/user/history` | GET/DELETE | 浏览历史 |
| `/user/blacklist` | GET/POST/DELETE | 黑名单 |
| `/wallet` | GET | 钱包信息 |
| `/wallet/transactions` | GET | 交易记录 |
| `/wallet/recharge` | POST | 充值 |
| `/wallet/withdraw` | POST | 提现 |
| `/wallet/cards` | GET/POST/DELETE | 银行卡 |
| `/wallet/coupons` | GET | 优惠券 |
| `/points` | GET | 积分信息 |
| `/points/signin` | POST | 签到 |
| `/points/tasks` | GET | 任务列表 |
| `/points/tasks/:id/claim` | POST | 领取奖励 |
| `/points/goods` | GET | 商品列表 |
| `/points/exchange` | POST | 兑换商品 |
| `/drafts` | GET/POST | 草稿列表/创建 |
| `/drafts/:id` | GET/PUT/DELETE | 草稿详情/更新/删除 |
| `/upload/*` | POST | 上传文件 |
| `/auth/*` | POST | 认证相关（除公开接口外） |

---

### 1.2 客户端 API 调用

#### 公开 API（无需登录检查）

| 文件 | 函数 | 用途 |
|------|------|------|
| content.ts | getPhotoList() | 瀑布流图片 |
| content.ts | getFeedList() | 动态列表 |
| content.ts | getFeedDetail() | 动态详情 |
| content.ts | getComments() | 评论列表 |
| content.ts | search() | 搜索 |
| content.ts | getHotSearch() | 热门搜索 |
| content.ts | getSearchSuggestions() | 搜索建议 |
| topic.ts | getTopicList() | 话题列表 |
| user.ts | getUserProfile() | 用户主页 |

#### 需要登录检查的 API

| 文件 | 函数 | 用途 |
|------|------|------|
| content.ts | publishFeed() | 发布动态 |
| content.ts | deleteFeed() | 删除动态 |
| content.ts | toggleLike() | 点赞/取消 |
| content.ts | toggleBookmark() | 收藏/取消 |
| content.ts | postComment() | 发表评论 |
| content.ts | deleteComment() | 删除评论 |
| content.ts | likeComment() | 点赞评论 |
| content.ts | getUserWorks() | 我的作品 |
| content.ts | getUserCollections() | 我的收藏 |
| content.ts | getReceivedLikes() | 获赞列表 |
| social.ts | toggleFollow() | 关注/取关 |
| social.ts | getFollowingList() | 关注列表 |
| social.ts | getFollowerList() | 粉丝列表 |
| social.ts | addToBlacklist() | 加入黑名单 |
| social.ts | removeFromBlacklist() | 移除黑名单 |
| social.ts | getBlacklist() | 黑名单列表 |
| topic.ts | getTopicDetail() | 话题详情 |
| topic.ts | toggleTopicFollow() | 关注话题 |
| auth.ts | getUserInfo() | 当前用户信息 |
| auth.ts | updateUserInfo() | 更新用户信息 |
| auth.ts | uploadAvatar() | 上传头像 |
| auth.ts | changePassword() | 修改密码 |
| auth.ts | changePhone() | 修改手机号 |
| message.ts | getMessageList() | 消息列表 |
| message.ts | getUnreadCount() | 未读数 |
| message.ts | markMessageRead() | 标记已读 |
| message.ts | markAllRead() | 一键已读 |
| message.ts | deleteMessage() | 删除消息 |
| points.ts | getPointsInfo() | 积分信息 |
| points.ts | signIn() | 签到 |
| points.ts | getTaskList() | 任务列表 |
| points.ts | claimTaskReward() | 领取奖励 |
| points.ts | getGoodsList() | 商品列表 |
| points.ts | exchangeGoods() | 兑换商品 |
| wallet.ts | getWalletInfo() | 钱包信息 |
| wallet.ts | getTransactionList() | 交易记录 |
| wallet.ts | recharge() | 充值 |
| wallet.ts | withdraw() | 提现 |
| wallet.ts | getBankCardList() | 银行卡列表 |
| wallet.ts | addBankCard() | 添加银行卡 |
| wallet.ts | deleteBankCard() | 删除银行卡 |
| wallet.ts | setDefaultCard() | 设置默认卡 |
| wallet.ts | getCouponList() | 优惠券 |

---

### 1.3 页面交互矩阵

| 页面 | 功能 | 当前处理 | 方案处理 |
|------|------|---------|---------|
| **首页** | 浏览瀑布流 | 无需登录 | 灰色禁用按钮 |
| 首页 | 点赞 | 无前置检查 | checkLoginAndGuide |
| 首页 | 收藏 | 无前置检查 | checkLoginAndGuide |
| **广场** | 浏览动态 | 无需登录 | 灰色禁用按钮 |
| 广场 | 点赞 | 无前置检查 | checkLoginAndGuide |
| 广场 | 评论 | 无前置检查 | checkLoginAndGuide |
| 广场 | 分享 | 无前置检查 | Toast 提示 |
| **详情页** | 浏览内容 | 无需登录 | 正常展示 |
| 详情页 | 点赞 | 无前置检查 | checkLoginAndGuide |
| 详情页 | 收藏 | 无前置检查 | checkLoginAndGuide |
| 详情页 | 关注 | 无前置检查 | checkLoginAndGuide |
| 详情页 | 评论 | 无前置检查 | checkLoginAndGuide |
| 详情页 | 点赞评论 | 无前置检查 | checkLoginAndGuide |
| **话题页** | 浏览话题 | 无需登录 | 正常展示 |
| 话题页 | 关注话题 | 无前置检查 | checkLoginAndGuide |
| 话题页 | 发布动态 | 无前置检查 | checkLoginAndGuide |
| **个人中心** | 浏览 | 静默失败 | 显示登录入口 |
| 个人中心 | 编辑资料 | 无前置检查 | checkLoginAndGuide |
| 个人中心 | 作品/收藏/历史 | 无前置检查 | checkLoginAndGuide |
| 个人中心 | 消息/钱包/设置 | 无前置检查 | checkLoginAndGuide |
| **搜索页** | 热搜/建议 | 需要登录(需改) | 公开访问 |
| 搜索页 | 执行搜索 | 无需登录 | 正常展示 |
| 搜索页 | 关注用户 | 无前置检查 | checkLoginAndGuide |

---

## 二、技术实现

### 2.1 服务端改造

#### 2.1.1 修改 SearchController

**文件**: `server/src/controllers/SearchController.ts`

移除 `getHotSearches` 和 `getSuggestions` 方法的 `@Authorized()` 装饰器：

```typescript
@Get('/hot')
// @Authorized()  // 删除此行
async getHotSearches(): Promise<ApiResponse<SearchHot[]>> {
  // ...
}

@Get('/suggestions')
// @Authorized()  // 删除此行
async getSuggestions(
  @QueryParam('keyword') keyword: string
): Promise<ApiResponse<string[]>> {
  // ...
}
```

#### 2.1.2 验证 CommentController

确保评论相关接口正确配置：

```typescript
// 公开 - 无需 @Authorized()
@Get('/feed/:feedId')
async getComments(@Param('feedId') feedId: string): Promise<ApiResponse<Comment[]>> {
  // 评论列表，公开访问
}

// 需要登录 - @Authorized()
@Post()
@Authorized()
async postComment(@Body() body: CommentDto): Promise<ApiResponse<Comment>> {
  // 发表评论，需要登录
}
```

---

### 2.2 客户端工具函数

#### 2.2.1 创建 auth.ts

**文件**: `client/src/utils/auth.ts`

```typescript
/**
 * 检查用户是否已登录
 */
export function isLoggedIn(): boolean {
  const token = uni.getStorageSync('token')
  return !!token
}

/**
 * 检查登录状态并引导登录
 * @param message 提示文案
 * @returns boolean true 表示已登录，false 表示未登录（已引导）
 */
export function checkLoginAndGuide(message = '请先登录后再操作'): boolean {
  if (isLoggedIn()) {
    return true
  }

  uni.showModal({
    title: '提示',
    content: message,
    confirmText: '去登录',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        uni.navigateTo({ url: '/pages/login/login' })
      }
    }
  })
  return false
}

/**
 * 强制登录（无法跳过）
 * @param message 提示文案
 */
export function requireLogin(message = '该功能需要登录'): void {
  uni.showModal({
    title: '提示',
    content: message,
    confirmText: '去登录',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        uni.navigateTo({ url: '/pages/login/login' })
      }
    }
  })
}
```

---

### 2.3 页面改造详细清单

#### 2.3.1 首页 home.vue

**文件**: `client/src/pages/home/home.vue`

```typescript
// 1. 引入 checkLoginAndGuide
import { checkLoginAndGuide } from '../../utils/auth'

// 2. 瀑布流点击 - 需要登录才能查看详情
const onPhotoClick = (item: WaterfallItem) => {
  // 如果需要查看详情才检查，这里可以跳过
  uni.navigateTo({ url: `/pages/detail/detail?id=${item.id}` })
}

// 3. 点赞按钮（如果首页有点赞功能）
const onLike = (item: WaterfallItem) => {
  if (!checkLoginAndGuide('登录后即可点赞')) {
    return
  }
  // 执行点赞逻辑...
}
```

#### 2.3.2 广场 square.vue

**文件**: `client/src/pages/square/square.vue`

```typescript
// 1. 引入 checkLoginAndGuide
import { checkLoginAndGuide } from '../../utils/auth'

// 2. 修复缺失的 import（需确认 toggleLike 已导入）

// 3. 点赞
const onLike = (feed: FeedItem) => {
  if (!checkLoginAndGuide('登录后即可点赞')) {
    return
  }
  // 执行点赞...
}

// 4. 评论
const onComment = (feed: FeedItem) => {
  if (!checkLoginAndGuide('登录后即可评论')) {
    return
  }
  // 跳转评论页或打开评论框...
}

// 5. 分享
const onShare = () => {
  uni.showToast({ title: '登录后即可分享', icon: 'none' })
}
```

#### 2.3.3 详情页 detail.vue

**文件**: `client/src/pages/detail/detail.vue`

```typescript
// 1. 引入 checkLoginAndGuide
import { checkLoginAndGuide } from '../../utils/auth'

// 2. 点赞动态
const onLike = () => {
  if (!checkLoginAndGuide('登录后即可点赞')) {
    return
  }
  // 执行点赞...
}

// 3. 收藏
const onCollect = () => {
  if (!checkLoginAndGuide('登录后即可收藏')) {
    return
  }
  // 执行收藏...
}

// 4. 关注用户
const toggleFollow = () => {
  if (!checkLoginAndGuide('登录后即可关注')) {
    return
  }
  // 执行关注...
}

// 5. 发表评论
const submitComment = async () => {
  if (!checkLoginAndGuide('登录后即可发表评论')) {
    return
  }
  // 执行评论...
}

// 6. 点赞评论
const likeComment = (commentId: string) => {
  if (!checkLoginAndGuide('登录后即可点赞')) {
    return
  }
  // 执行点赞评论...
}
```

#### 2.3.4 个人中心 profile.vue

**文件**: `client/src/pages/profile/profile.vue`

```typescript
// 1. 引入 checkLoginAndGuide, isLoggedIn
import { checkLoginAndGuide, isLoggedIn } from '../../utils/auth'

// 2. 未登录时显示登录入口
const showLoginGuide = computed(() => !isLoggedIn())

// 3. 功能菜单点击
const onMenuClick = (menu: string) => {
  if (!checkLoginAndGuide('登录后即可使用该功能')) {
    return
  }
  // 跳转对应页面...
}

// 4. 社交数量点击（需要登录）
const navigateToSocial = (type: 'following' | 'followers' | 'likes') => {
  if (!checkLoginAndGuide('登录后即可查看')) {
    return
  }
  // 跳转社交页...
}

// 5. 编辑资料
const onEditProfile = () => {
  if (!checkLoginAndGuide('登录后即可编辑资料')) {
    return
  }
  // 跳转编辑页...
}
```

#### 2.3.5 搜索页 search.vue

**文件**: `client/src/pages/search/search.vue`

```typescript
// 1. 引入 checkLoginAndGuide
import { checkLoginAndGuide } from '../../utils/auth'

// 2. 修复缺失的 import（需确认 toggleFollow 已导入）

// 3. 关注用户
const handleToggleFollow = (userId: string) => {
  if (!checkLoginAndGuide('登录后即可关注')) {
    return
  }
  // 执行关注...
}
```

#### 2.3.6 话题页 topic.vue

**文件**: `client/src/pages/topic/topic.vue`

```typescript
// 1. 引入 checkLoginAndGuide
import { checkLoginAndGuide } from '../../utils/auth'

// 2. 关注话题
const onToggleFollow = (topic: TopicItem) => {
  if (!checkLoginAndGuide('登录后即可关注话题')) {
    return
  }
  // 执行关注...
}

// 3. 发布动态（点击右下角 FAB）
const goToPublish = () => {
  if (!checkLoginAndGuide('登录后即可发布动态')) {
    return
  }
  // 跳转发布页...
}
```

---

### 2.4 组件改造

#### 2.4.1 FeedCard.vue

**文件**: `client/src/components/FeedCard.vue`

```typescript
// 1. Props 中添加 isLoggedIn
interface Props {
  data: FeedItem
  isLoggedIn?: boolean  // 新增
}

// 2. 点赞按钮点击
const onLikeClick = () => {
  if (!props.isLoggedIn) {
    checkLoginAndGuide('登录后即可点赞')
    return
  }
  emit('like', props.data.id)
}

// 3. 评论按钮点击
const onCommentClick = () => {
  if (!props.isLoggedIn) {
    checkLoginAndGuide('登录后即可评论')
    return
  }
  emit('comment', props.data.id)
}
```

#### 2.4.2 CommentItem.vue

**文件**: `client/src/components/CommentItem.vue`

```typescript
// 1. Props 中添加 isLoggedIn
interface Props {
  data: CommentData
  isLoggedIn?: boolean  // 新增
}

// 2. 点赞评论
const onLikeClick = () => {
  if (!props.isLoggedIn) {
    checkLoginAndGuide('登录后即可点赞')
    return
  }
  emit('like', props.data.id)
}
```

---

### 2.5 状态同步

#### 2.5.1 登录成功事件

**登录页 login.vue 登录成功后**：

```typescript
// 登录成功回调
const onLoginSuccess = () => {
  uni.$emit('loginSuccess')
  // 跳转回之前页面或首页
  uni.switchTab({ url: '/pages/home/home' })
}
```

**需要监听的页面**：

```typescript
// 在各页面的 onShow 或 onMounted 中
onShow(() => {
  // 监听登录成功事件
  uni.$on('loginSuccess', () => {
    // 刷新当前页数据
    fetchData()
  })
})

// 页面卸载时移除监听
onUnmounted(() => {
  uni.$off('loginSuccess')
})
```

#### 2.5.2 登出事件

```typescript
// 登出时
const onLogout = () => {
  userStore.logout()
  uni.$emit('logout')
  uni.switchTab({ url: '/pages/home/home' })
}

// 各页面监听
uni.$on('logout', () => {
  // 重置页面状态
  resetState()
})
```

---

## 三、按钮状态设计

### 3.1 未登录状态

| 按钮 | 样式 | 点击行为 |
|------|------|---------|
| 点赞 | 灰色 + 空心 | 弹出登录提示 |
| 收藏 | 灰色 + 空心 | 弹出登录提示 |
| 评论 | 灰色 + 输入禁用 | 弹出登录提示 |
| 关注 | 灰色 + "登录关注" | 弹出登录提示 |
| 分享 | 正常样式 | Toast 提示登录后分享 |
| 发布 | 正常样式 | 弹出登录提示 |

### 3.2 已登录状态

| 按钮 | 样式 | 点击行为 |
|------|------|---------|
| 点赞（未点赞） | 红色 + 空心 | 执行点赞 |
| 点赞（已点赞） | 红色 + 实心 | 取消点赞 |
| 收藏（未收藏） | 灰色 + 空心 | 执行收藏 |
| 收藏（已收藏） | 黄色 + 实心 | 取消收藏 |
| 评论 | 正常样式 | 打开评论框 |
| 关注（未关注） | 红色边框按钮 | 执行关注 |
| 关注（已关注） | 灰色文字"已关注" | 取消关注 |
| 分享 | 正常样式 | 打开分享面板 |
| 发布 | 正常样式 | 跳转发布页 |

---

## 四、登录提示文案

| 场景 | 文案 |
|------|------|
| 点赞 | 登录后即可点赞 |
| 收藏 | 登录后即可收藏 |
| 评论 | 登录后即可发表评论 |
| 关注 | 登录后即可关注 |
| 分享 | 登录后即可分享 |
| 发布 | 登录后即可发布动态 |
| 查看作品 | 登录后即可查看作品 |
| 查看收藏 | 登录后即可查看收藏 |
| 消息 | 登录后即可查看消息 |
| 钱包 | 登录后即可使用钱包 |
| 编辑资料 | 登录后即可编辑资料 |
| 通用 | 请先登录后再操作 |

---

## 五、实施步骤

### Phase 1: 服务端改造
- [ ] 修改 SearchController，移除热门搜索和搜索建议的 @Authorized()
- [ ] 验证 CommentController 评论列表为公开

### Phase 2: 工具函数
- [ ] 创建 client/src/utils/auth.ts

### Phase 3: 页面改造
- [ ] home.vue - 点赞/收藏检查
- [ ] square.vue - 点赞/评论/分享检查
- [ ] detail.vue - 点赞/收藏/关注/评论检查
- [ ] profile.vue - 功能入口检查
- [ ] search.vue - 关注用户检查
- [ ] topic.vue - 关注话题/发布检查

### Phase 4: 组件改造
- [ ] FeedCard.vue - 点赞/评论登录检查
- [ ] CommentItem.vue - 点赞评论检查

### Phase 5: 状态同步
- [ ] 登录成功事件触发和监听
- [ ] 登出事件触发和监听
- [ ] 各页面数据刷新逻辑

---

## 六、验证清单

### 功能验证
- [ ] 未登录可浏览首页瀑布流
- [ ] 未登录可浏览广场动态
- [ ] 未登录可浏览话题列表
- [ ] 未登录可查看动态详情
- [ ] 未登录可查看评论列表
- [ ] 未登录可执行搜索
- [ ] 未登录可查看热搜/建议

### 交互验证
- [ ] 未登录点赞弹出登录提示
- [ ] 未登录收藏弹出登录提示
- [ ] 未登录评论弹出登录提示
- [ ] 未登录关注弹出登录提示
- [ ] 点击去登录跳转到登录页
- [ ] 点击取消留在当前页面

### 状态同步验证
- [ ] 登录成功后页面刷新
- [ ] 显示正确的点赞/收藏状态
- [ ] 登出后状态正确重置

### 边界情况
- [ ] Token 过期正确处理
- [ ] 网络错误正确提示
- [ ] 快速连续点击防抖处理