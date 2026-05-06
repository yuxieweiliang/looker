# Looker 数据迁移文档

## 概述

本文档描述了如何将 Looker 项目中的静态 mock 数据转换为真实数据库数据。

## 数据迁移步骤

### 1. 创建数据库表结构

使用 `schema.sql` 创建 PostgreSQL 数据库表：

```bash
psql -U postgres -d looker -f src/data/schema.sql
```

### 2. 导入种子数据

使用 `seed-data.sql` 插入初始数据：

```bash
psql -U postgres -d looker -f src/data/seed-data.sql


```

## 数据内容

### 用户数据 (8个)

| 用户ID | 手机号 | 昵称 | 密码 | 等级 | VIP |
|--------|--------|------|------|------|-----|
| user-001 | 13800138001 | 摄影师小王 | Photo2024! | LV5 | ✓ |
| user-002 | 13800138002 | 张三 | Zhang1234! | LV8 | ✓ |
| user-003 | 13800138003 | 美食博主小美 | Foodie2024@ | LV3 | - |
| user-004 | 13800138004 | 旅行达人阿杰 | Travel2024# | LV6 | ✓ |
| user-005 | 13800138005 | 萌宠铲屎官 | PetLover1! | LV4 | - |
| user-006 | 13800138006 | 穿搭时尚达人 | Fashion88$ | LV7 | ✓ |
| user-007 | 13800138007 | 街拍摄影师 | Street99& | LV5 | - |
| user-008 | 13800138008 | 生活记录者 | Life2024* | LV2 | - |

密码使用 bcrypt 加密存储，详细账号信息见 `account.json`。

### 话题数据 (8个)

- 春日摄影、美食探店、旅行日记、萌宠日常
- 穿搭分享、生活记录、人像摄影、街拍摄影

### 动态数据 (10条)

包含图片、位置、话题标签、点赞数、评论数等完整数据。

### 其他数据

- 评论：10条
- 关注关系：10条
- 点赞记录：10条
- 收藏记录：5条
- 银行卡：4张
- 交易记录：8条
- 积分记录：5条
- 钱包：5个
- 消息通知：5条

## 验证登录

运行验证脚本：

```bash
node src/data/verify-login.js
```

## 文件说明

- `mock-data.ts` - TypeScript 数据定义和原始数据
- `schema.sql` - PostgreSQL 数据库表结构
- `seed-data.sql` - 数据插入 SQL 脚本
- `account.json` - 用户账号密码信息（明文）
- `init-data.ts` - TypeScript 数据初始化脚本（可选）
- `verify-login.js` - 登录验证脚本

## 登录接口

使用以下接口验证登录：

**手机号+密码登录**
```http
POST /api/v1/auth/login/password
Content-Type: application/json

{
  "phone": "13800138001",
  "password": "Photo2024!"
}
```

**验证码登录**（验证码为 `123456`，用于测试）
```http
POST /api/v1/auth/login/phone
Content-Type: application/json

{
  "phone": "13800138001",
  "code": "123456"
}
```

## 注意事项

1. 数据库连接配置在 `.env` 文件中
2. `account.json` 包含明文密码，请勿提交到版本控制
3. 生产环境请使用更强的密码策略
4. 所有图片使用 picsum.photos 随机图片服务
