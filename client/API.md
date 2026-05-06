# Looker API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3000/api/v1` (开发环境)
- **协议**: HTTP/HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

### 接口前缀说明

所有接口路径前需要加上 `/api/v1`，例如：
- API 文档中的 `/auth/login/password` 对应实际接口 `/api/v1/auth/login/password`
- API 文档中的 `/feeds` 对应实际接口 `/api/v1/feeds`

## 通用规范

### 请求头

```http
Content-Type: application/json
Authorization: Bearer {token}
X-Request-ID: {uuid}
```

### 响应格式

```typescript
interface ApiResponse<T> {
  code: number      // 状态码，0 表示成功
  message: string   // 提示信息
  data: T           // 响应数据
}
```

### 分页参数

| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码，从 1 开始 |
| pageSize | number | 每页数量，默认 20 |

### 分页响应

```typescript
interface PaginationData<T> {
  list: T[]       // 数据列表
  total: number   // 总数量
  hasMore: boolean // 是否还有更多
}
```

### 状态码

| 状态码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，token 无效或过期 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

---

## 1. 认证模块

### 1.1 发送验证码

```http
POST /auth/send-code
```

**请求体**:
```json
{
  "phone": "13800138000"
}
```

**响应**:
```json
{
  "code": 0,
  "message": "验证码已发送",
  "data": null
}
```

### 1.2 手机号+验证码登录

```http
POST /auth/login/phone
```

**请求体**:
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**响应**:
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_123",
      "name": "用户123",
      "avatar": "https://...",
      "bio": "个人简介",
      "vip": false,
      "level": 1,
      "following": 0,
      "followers": 0,
      "likes": 0,
      "works": 0,
      "collections": 0
    }
  }
}
```

### 1.3 手机号+密码登录

```http
POST /auth/login/password
```

**请求体**:
```json
{
  "phone": "13800138000",
  "password": "encrypted_password"
}
```

### 1.4 微信登录

```http
POST /auth/login/wechat
```

**请求体**:
```json
{
  "code": "wx_auth_code"
}
```

### 1.5 微博登录

```http
POST /auth/login/weibo
```

**请求体**:
```json
{
  "code": "weibo_auth_code"
}
```

### 1.6 用户注册

```http
POST /auth/register
```

**请求体**:
```json
{
  "phone": "13800138000",
  "code": "123456",
  "password": "encrypted_password",
  "nickname": "新用户"
}
```

### 1.7 退出登录

```http
POST /auth/logout
```

**响应**:
```json
{
  "code": 0,
  "message": "退出成功",
  "data": null
}
```

### 1.8 刷新 Token

```http
POST /auth/refresh
```

**响应**:
```json
{
  "code": 0,
  "message": "刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 1.9 绑定社交账号

```http
POST /auth/bind
```

**请求体**:
```json
{
  "type": "wechat",
  "openid": "wx_openid",
  "unionid": "wx_unionid",
  "nickname": "微信昵称",
  "avatar": "https://..."
}
```

### 1.10 解绑社交账号

```http
POST /auth/unbind
```

**请求体**:
```json
{
  "type": "wechat"
}
```

---

## 2. 用户模块

### 2.1 获取当前用户信息

```http
GET /user/info
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "user_123",
    "name": "用户名",
    "avatar": "https://...",
    "bio": "个人简介",
    "vip": false,
    "level": 5,
    "following": 128,
    "followers": 3420,
    "likes": 12580,
    "works": 56,
    "collections": 238
  }
}
```

### 2.2 更新用户信息

```http
POST /user/update
```

**请求体**:
```json
{
  "name": "新昵称",
  "avatar": "https://...",
  "bio": "新的个人简介",
  "gender": "male",
  "birthday": "1995-06-15",
  "location": "北京市"
}
```

### 2.3 上传头像

```http
POST /user/avatar
Content-Type: multipart/form-data
```

**请求体**:
- `file`: 图片文件

**响应**:
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "url": "https://cdn.looker.com/avatar/xxx.jpg"
  }
}
```

### 2.4 获取用户主页

```http
GET /users/:id
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "user_123",
    "name": "用户名",
    "avatar": "https://...",
    "bio": "个人简介",
    "vip": true,
    "level": 10,
    "following": 128,
    "followers": 3420,
    "works": 56,
    "isFollowing": false
  }
}
```

### 2.5 修改手机号

```http
POST /user/phone
```

**请求体**:
```json
{
  "oldPhone": "13800138000",
  "newPhone": "13900139000",
  "code": "123456"
}
```

### 2.6 修改密码

```http
POST /user/password
```

**请求体**:
```json
{
  "oldPassword": "old_encrypted",
  "newPassword": "new_encrypted"
}
```

---

## 3. 内容模块

### 3.1 获取瀑布流图片列表

```http
GET /photos
```

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码 |
| pageSize | number | 每页数量 |
| category | string | 分类ID，可选 |
| sort | string | 排序方式: hot/new |

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "photo_123",
        "url": "https://cdn.looker.com/photos/xxx.jpg",
        "title": "作品标题",
        "user": {
          "id": "user_123",
          "name": "作者名",
          "avatar": "https://..."
        },
        "likes": 128,
        "views": 2341,
        "width": 800,
        "height": 1200
      }
    ],
    "total": 1000,
    "hasMore": true
  }
}
```

### 3.2 获取动态列表

```http
GET /feeds
```

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码 |
| pageSize | number | 每页数量 |
| type | string | 类型: following/hot/recent |

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "feed_123",
        "user": {
          "id": "user_123",
          "name": "用户名",
          "avatar": "https://..."
        },
        "content": "动态内容 #话题",
        "images": [
          {
            "id": "img_1",
            "url": "https://...",
            "width": 800,
            "height": 600
          }
        ],
        "likes": 128,
        "comments": 32,
        "shares": 8,
        "isLiked": false,
        "createdAt": "2024-01-15T10:30:00Z",
        "location": "北京市朝阳区"
      }
    ],
    "total": 500,
    "hasMore": true
  }
}
```

### 3.3 发布动态

```http
POST /feeds
```

**请求体**:
```json
{
  "content": "分享内容",
  "images": ["url1", "url2"],
  "location": "北京市朝阳区",
  "topics": ["摄影", "风景"],
  "latitude": 39.9042,
  "longitude": 116.4074
}
```

**响应**:
```json
{
  "code": 0,
  "message": "发布成功",
  "data": {
    "id": "feed_123",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 3.4 获取动态详情

```http
GET /feeds/:id
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "feed_123",
    "user": {
      "id": "user_123",
      "name": "用户名",
      "avatar": "https://..."
    },
    "content": "动态内容",
    "images": [...],
    "topics": ["摄影"],
    "location": "北京市",
    "views": 2341,
    "likes": 128,
    "collections": 56,
    "shares": 23,
    "isLiked": true,
    "isCollected": false,
    "isFollowing": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 3.5 删除动态

```http
DELETE /feeds/:id
```

### 3.6 点赞/取消点赞

```http
POST /likes
```

**请求体**:
```json
{
  "type": "feed",
  "id": "feed_123"
}
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "isLiked": true,
    "likes": 129
  }
}
```

### 3.7 收藏/取消收藏

```http
POST /bookmarks
```

**请求体**:
```json
{
  "id": "feed_123"
}
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "isBookmarked": true
  }
}
```

---

## 4. 评论模块

### 4.1 获取评论列表

```http
GET /comments
```

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| targetId | string | 目标ID |
| targetType | string | 目标类型: feed/photo |
| page | number | 页码 |
| pageSize | number | 每页数量 |

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "comment_123",
        "user": {
          "id": "user_123",
          "name": "评论者",
          "avatar": "https://..."
        },
        "content": "评论内容",
        "likes": 12,
        "isLiked": false,
        "replies": 3,
        "replyTo": "被回复者名",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 100,
    "hasMore": true
  }
}
```

### 4.2 发表评论

```http
POST /comments
```

**请求体**:
```json
{
  "targetId": "feed_123",
  "targetType": "feed",
  "content": "评论内容",
  "parentId": "comment_456"
}
```

### 4.3 删除评论

```http
DELETE /comments/:id
```

### 4.4 点赞评论

```http
POST /comments/:id/like
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "isLiked": true,
    "likes": 13
  }
}
```

---

## 5. 社交模块

### 5.1 关注/取消关注

```http
POST /follows
```

**请求体**:
```json
{
  "userId": "user_123"
}
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "isFollowing": true
  }
}
```

### 5.2 获取关注列表

```http
GET /follows/following
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "user_123",
        "name": "用户名",
        "avatar": "https://...",
        "isFollowing": true
      }
    ],
    "total": 128,
    "hasMore": false
  }
}
```

### 5.3 获取粉丝列表

```http
GET /follows/followers
```

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码 |
| pageSize | number | 每页数量 |

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "user_789",
        "name": "粉丝用户",
        "avatar": "https://...",
        "bio": "这是我的简介",
        "worksCount": 15,
        "followersCount": 200,
        "isFollowing": false
      }
    ],
    "total": 3420,
    "hasMore": true
  }
}
```

### 5.4 获取获赞列表

获取用户作品收到的所有点赞记录。

```http
GET /feeds/likes/received
```

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码 |
| pageSize | number | 每页数量 |

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "like_001",
        "user": {
          "id": "user_123",
          "name": "点赞用户",
          "avatar": "https://..."
        },
        "workId": "feed_456",
        "work": {
          "thumb": "https://...",
          "title": "被点赞的作品标题",
          "likes": 128
        },
        "time": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 12580,
    "hasMore": true
  }
}
```

### 5.5 获取黑名单列表

```http
GET /blacklist
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "user_123",
        "name": "被拉黑用户",
        "avatar": "https://...",
        "blockTime": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 10,
    "hasMore": false
  }
}
```

### 5.6 加入黑名单

```http
POST /blacklist
```

**请求体**:
```json
{
  "userId": "user_123"
}
```

### 5.7 移除黑名单

```http
DELETE /blacklist/:userId
```

---

## 6. 搜索模块

### 6.1 搜索

```http
GET /search
```

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| keyword | string | 搜索关键词 |
| type | string | 类型: all/user/post/topic |
| page | number | 页码 |
| pageSize | number | 每页数量 |

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "post_123",
        "type": "post",
        "title": "搜索结果标题",
        "subtitle": "副标题",
        "image": "https://..."
      }
    ],
    "total": 50,
    "hasMore": true
  }
}
```

### 6.2 获取热门搜索

```http
GET /search/hot
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": ["热门词1", "热门词2", "热门词3"]
}
```

### 6.3 获取搜索建议

```http
GET /search/suggestions
```

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| keyword | string | 输入关键词 |

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": ["建议1", "建议2", "建议3"]
}
```

---

## 7. 话题模块

### 7.1 获取话题列表

```http
GET /topics
```

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码 |
| pageSize | number | 每页数量 |
| sort | string | 排序: hot/new |

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "name": "春日摄影",
        "count": 2341,
        "bgColor": "#FFE4E1"
      }
    ],
    "total": 100,
    "hasMore": true
  }
}
```

### 7.2 获取话题详情

```http
GET /topics/:name
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "name": "春日摄影",
    "description": "话题描述",
    "count": 2341,
    "bgColor": "#FFE4E1",
    "isFollowed": false
  }
}
```

### 7.3 关注/取消关注话题

```http
POST /topics/:name/follow
```

---

## 8. 消息模块

### 8.1 获取消息列表

```http
GET /messages
```

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| type | string | 类型: all/like/comment/follow/system |
| page | number | 页码 |
| pageSize | number | 每页数量 |

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "msg_123",
        "type": "like",
        "name": "小明",
        "avatar": "https://...",
        "content": "赞了你的作品《春日风景》",
        "time": "2024-01-15T10:30:00Z",
        "read": false,
        "image": "https://...",
        "targetId": "feed_123"
      }
    ],
    "total": 50,
    "hasMore": true
  }
}
```

### 8.2 获取未读消息数

```http
GET /messages/unread
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 10,
    "like": 3,
    "comment": 5,
    "follow": 1,
    "system": 1
  }
}
```

### 8.3 标记消息已读

```http
POST /messages/:id/read
```

### 8.4 一键已读

```http
POST /messages/read-all
```

### 8.5 删除消息

```http
DELETE /messages/:id
```

---

## 9. 用户作品模块

### 9.1 获取我的作品

```http
GET /user/works
```

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码 |
| pageSize | number | 每页数量 |

**响应**: 同 `/photos` 接口

### 9.2 获取我的收藏

```http
GET /user/collections
```

### 9.3 获取浏览历史

```http
GET /user/history
```

### 9.4 清除浏览历史

```http
DELETE /user/history
```

---

## 10. 积分模块

### 10.1 获取积分信息

```http
GET /points
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "points": 2580,
    "consecutiveDays": 5,
    "hasSignedToday": false
  }
}
```

### 10.2 签到

```http
POST /points/signin
```

**响应**:
```json
{
  "code": 0,
  "message": "签到成功",
  "data": {
    "points": 10,
    "consecutiveDays": 6
  }
}
```

### 10.3 获取任务列表

```http
GET /points/tasks
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "daily": [...],
    "newbie": [...],
    "achievements": [...]
  }
}
```

### 10.4 领取任务奖励

```http
POST /points/tasks/:id/claim
```

### 10.5 获取可兑换商品

```http
GET /points/goods
```

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| type | string | 类型: all/virtual/physical/coupon |
| page | number | 页码 |

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "goods_123",
        "name": "7天会员",
        "description": "享受会员专属特权",
        "image": "https://...",
        "points": 500,
        "stock": 100,
        "type": "virtual"
      }
    ],
    "total": 20,
    "hasMore": false
  }
}
```

### 10.6 兑换商品

```http
POST /points/exchange
```

**请求体**:
```json
{
  "goodsId": "goods_123"
}
```

---

## 11. 钱包模块

### 11.1 获取钱包信息

```http
GET /wallet
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "balance": "128.50",
    "cardCount": 2,
    "couponCount": 3
  }
}
```

### 11.2 获取交易记录

```http
GET /wallet/transactions
```

**查询参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| type | string | 类型: all/income/expense/recharge/withdraw |
| page | number | 页码 |
| pageSize | number | 每页数量 |

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "trans_123",
        "title": "作品打赏",
        "amount": "50.00",
        "type": "income",
        "time": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 100,
    "hasMore": true
  }
}
```

### 11.3 充值

```http
POST /wallet/recharge
```

**请求体**:
```json
{
  "amount": 100,
  "paymentMethod": "wechat"
}
```

### 11.4 提现

```http
POST /wallet/withdraw
```

**请求体**:
```json
{
  "amount": 100,
  "cardId": "card_123"
}
```

---

## 12. 银行卡模块

### 12.1 获取银行卡列表

```http
GET /wallet/cards
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "card_123",
        "bankName": "工商银行",
        "cardNumber": "****8888",
        "cardType": "储蓄卡",
        "isDefault": true
      }
    ]
  }
}
```

### 12.2 添加银行卡

```http
POST /wallet/cards
```

**请求体**:
```json
{
  "bankName": "工商银行",
  "cardNumber": "622202123456788888",
  "holderName": "张三",
  "idCard": "110101199001011234",
  "phone": "13800138000",
  "code": "123456"
}
```

### 12.3 删除银行卡

```http
DELETE /wallet/cards/:id
```

### 12.4 设置默认银行卡

```http
POST /wallet/cards/:id/default
```

---

## 13. 优惠券模块

### 13.1 获取优惠券列表

```http
GET /wallet/coupons
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "coupon_123",
        "name": "5元优惠券",
        "description": "全场通用",
        "amount": 5,
        "minSpend": 0,
        "validStart": "2024-01-01",
        "validEnd": "2024-12-31",
        "status": "unused"
      }
    ]
  }
}
```

---

## 14. 文件上传

### 14.1 上传图片

```http
POST /upload/image
Content-Type: multipart/form-data
```

**请求体**:
- `file`: 图片文件
- `type`: 用途类型 (avatar/feed/comment)

**响应**:
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "url": "https://cdn.looker.com/images/xxx.jpg",
    "width": 800,
    "height": 600
  }
}
```

### 14.2 上传多张图片

```http
POST /upload/images
Content-Type: multipart/form-data
```

**请求体**:
- `files[]`: 多个图片文件
- `type`: 用途类型

**响应**:
```json
{
  "code": 0,
  "message": "上传成功",
  "data": {
    "urls": [
      { "url": "https://...", "width": 800, "height": 600 }
    ]
  }
}
```

---

## 15. WebSocket 接口

### 15.1 连接地址

```
wss://api.looker.com/ws/messages?token={jwt_token}
```

### 15.2 心跳消息

**客户端发送**:
```json
{ "type": "ping" }
```

**服务端响应**:
```json
{ "type": "pong" }
```

### 15.3 新消息推送

**服务端推送**:
```json
{
  "type": "new_message",
  "data": {
    "id": "msg_123",
    "type": "like",
    "name": "小明",
    "avatar": "https://...",
    "content": "赞了你的作品",
    "targetId": "feed_123",
    "image": "https://..."
  }
}
```

---

## 16. 草稿箱模块

### 16.1 获取草稿列表

```http
GET /drafts
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "draft_123",
        "content": "草稿内容",
        "images": ["url1", "url2"],
        "location": "北京市",
        "topics": ["摄影"],
        "savedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### 16.2 保存草稿

```http
POST /drafts
```

**请求体**: 同发布动态

### 16.3 获取草稿详情

```http
GET /drafts/:id
```

### 16.4 删除草稿

```http
DELETE /drafts/:id
```

---

## 17. 系统模块

### 17.1 获取轮播图

```http
GET /banners
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "banner_1",
      "image": "https://...",
      "link": "/pages/topic/topic",
      "title": "活动标题"
    }
  ]
}
```

### 17.2 获取分类列表

```http
GET /categories
```

**响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": "cat_1",
      "name": "推荐",
      "icon": "icon_url",
      "count": 1000
    }
  ]
}
```

---

## 数据模型

### User 用户

```typescript
interface User {
  id: string
  name: string
  avatar: string
  bio?: string
  gender?: 'male' | 'female' | 'unknown'
  birthday?: string
  location?: string
  vip: boolean
  level: number
  following: number
  followers: number
  likes: number
  works: number
  collections: number
}
```

### Feed 动态

```typescript
interface Feed {
  id: string
  user: User
  content: string
  images: ImageItem[]
  topics: string[]
  location?: string
  latitude?: number
  longitude?: number
  views: number
  likes: number
  comments: number
  shares: number
  collections: number
  isLiked: boolean
  isCollected: boolean
  isFollowing: boolean
  createdAt: string
}
```

### ImageItem 图片项

```typescript
interface ImageItem {
  id: string
  url: string
  width: number
  height: number
}
```

### Comment 评论

```typescript
interface Comment {
  id: string
  user: User
  content: string
  likes: number
  isLiked: boolean
  replies?: number
  replyTo?: string
  parentId?: string
  createdAt: string
}
```

---

## 错误处理

### 统一错误响应

```json
{
  "code": 40001,
  "message": "手机号格式错误",
  "data": null
}
```

### 常见错误码

| 错误码 | 说明 |
|--------|------|
| 40001 | 手机号格式错误 |
| 40002 | 验证码错误 |
| 40003 | 密码强度不足 |
| 40004 | 图片格式不支持 |
| 40005 | 文件过大 |
| 40101 | Token 过期 |
| 40102 | Token 无效 |
| 40301 | 权限不足 |
| 40401 | 用户不存在 |
| 40402 | 动态不存在 |
| 40403 | 评论不存在 |
| 40901 | 已关注该用户 |
| 40902 | 已点赞 |
| 42901 | 请求过于频繁 |
| 50001 | 服务器内部错误 |

---

## 安全说明

1. **HTTPS**: 所有接口必须使用 HTTPS 协议
2. **Token**: 登录后获取的 JWT Token 需在每个请求的 Header 中携带
3. **签名**: 敏感操作需增加请求签名验证
4. **限流**: API 接口需实现限流保护，防止恶意请求
5. **加密**: 密码等敏感信息需加密传输

---

## 更新日志

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0.0 | 2024-03-06 | 初始版本，包含所有核心接口 |
