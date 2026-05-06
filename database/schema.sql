-- =====================================================
-- Looker 数据库表结构 (PostgreSQL)
-- =====================================================

-- 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- 用于模糊搜索

-- =====================================================
-- 1. 用户模块
-- =====================================================

-- 用户表
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(50) NOT NULL,
    avatar VARCHAR(500),
    bio VARCHAR(500),
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'unknown')),
    birthday DATE,
    location VARCHAR(100),
    vip BOOLEAN DEFAULT FALSE,
    level INTEGER DEFAULT 1,
    following_count INTEGER DEFAULT 0,
    followers_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    works_count INTEGER DEFAULT 0,
    collections_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 社交账号绑定表
CREATE TABLE user_social_bindings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('wechat', 'weibo')),
    openid VARCHAR(100) NOT NULL,
    unionid VARCHAR(100),
    nickname VARCHAR(100),
    avatar VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(type, openid)
);

-- 关注关系表
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- 黑名单表
CREATE TABLE blacklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, blocked_user_id)
);

-- =====================================================
-- 2. 内容模块
-- =====================================================

-- 动态表
CREATE TABLE feeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    images JSONB DEFAULT '[]', -- [{id, url, width, height}]
    topics VARCHAR(50)[], -- 话题标签数组
    location VARCHAR(200),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    collections INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'deleted', 'hidden')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 话题表
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    bg_color VARCHAR(20) DEFAULT '#FFE4E1',
    count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 话题关注表
CREATE TABLE topic_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, topic_id)
);

-- 图片资源表（用于瀑布流推荐）
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feed_id UUID REFERENCES feeds(id) ON DELETE SET NULL,
    url VARCHAR(500) NOT NULL,
    width INTEGER,
    height INTEGER,
    title VARCHAR(200),
    category_id UUID,
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 分类表
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. 互动模块
-- =====================================================

-- 点赞表（支持动态和评论）
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL, -- feed_id 或 comment_id
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('feed', 'comment')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_id, target_type)
);

-- 收藏表
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feed_id UUID NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, feed_id)
);

-- 评论表
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id UUID NOT NULL, -- feed_id 或 photo_id
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('feed', 'photo')),
    content TEXT NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    likes INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deleted')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. 消息模块
-- =====================================================

-- 消息表
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- 接收者
    sender_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'system')),
    content TEXT NOT NULL,
    target_id UUID, -- 关联的动态/评论ID
    target_type VARCHAR(20),
    image VARCHAR(500), -- 预览图
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. 积分模块
-- =====================================================

-- 用户积分表
CREATE TABLE user_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    consecutive_days INTEGER DEFAULT 0,
    last_signin_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 积分记录表
CREATE TABLE point_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('signin', 'task', 'exchange', 'reward')),
    points INTEGER NOT NULL, -- 正数获得，负数消耗
    description VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 任务表
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('daily', 'newbie', 'achievement')),
    points INTEGER NOT NULL,
    icon VARCHAR(500),
    action_type VARCHAR(50), -- 触发动作：publish, like, comment 等
    action_count INTEGER DEFAULT 1, -- 需要完成的次数
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户任务完成记录
CREATE TABLE user_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    claimed BOOLEAN DEFAULT FALSE, -- 是否已领取奖励
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, task_id)
);

-- 积分商品表
CREATE TABLE point_goods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    points INTEGER NOT NULL,
    stock INTEGER DEFAULT 0,
    type VARCHAR(20) NOT NULL CHECK (type IN ('virtual', 'physical', 'coupon')),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 积分兑换记录
CREATE TABLE point_exchanges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goods_id UUID NOT NULL REFERENCES point_goods(id),
    points INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. 钱包模块
-- =====================================================

-- 钱包表
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    frozen_amount DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 交易记录表
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'recharge', 'withdraw')),
    title VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    balance DECIMAL(10, 2) NOT NULL, -- 交易后余额
    remark VARCHAR(200),
    related_id UUID, -- 关联订单ID
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 银行卡表
CREATE TABLE bank_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bank_name VARCHAR(50) NOT NULL,
    card_number VARCHAR(30) NOT NULL, -- 加密存储
    card_number_mask VARCHAR(30), -- 脱敏显示 ****8888
    card_type VARCHAR(20) DEFAULT '储蓄卡',
    holder_name VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 优惠券表
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    min_spend DECIMAL(10, 2) DEFAULT 0.00,
    valid_start DATE,
    valid_end DATE,
    status VARCHAR(20) DEFAULT 'unused' CHECK (status IN ('unused', 'used', 'expired')),
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. 草稿模块
-- =====================================================

-- 草稿表
CREATE TABLE drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    images JSONB DEFAULT '[]',
    location VARCHAR(200),
    topics VARCHAR(50)[],
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. 系统模块
-- =====================================================

-- 轮播图表
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image VARCHAR(500) NOT NULL,
    link VARCHAR(500),
    title VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 搜索记录表（用于热门搜索统计）
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    keyword VARCHAR(100) NOT NULL,
    count INTEGER DEFAULT 1,
    last_searched_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 索引优化
-- =====================================================

-- 用户表索引
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- 关注关系索引
CREATE INDEX idx_follows_follower ON follows(follower_id, created_at DESC);
CREATE INDEX idx_follows_following ON follows(following_id, created_at DESC);

-- 动态表索引
CREATE INDEX idx_feeds_user ON feeds(user_id, created_at DESC);
CREATE INDEX idx_feeds_status ON feeds(status, created_at DESC);
CREATE INDEX idx_feeds_topics ON feeds USING GIN(topics);

-- 图片表索引
CREATE INDEX idx_photos_user ON photos(user_id, created_at DESC);
CREATE INDEX idx_photos_category ON photos(category_id, created_at DESC);

-- 点赞表索引
CREATE INDEX idx_likes_user ON likes(user_id, created_at DESC);
CREATE INDEX idx_likes_target ON likes(target_id, target_type);

-- 收藏表索引
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id, created_at DESC);

-- 评论表索引
CREATE INDEX idx_comments_target ON comments(target_id, target_type, created_at DESC);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_user ON comments(user_id);

-- 消息表索引
CREATE INDEX idx_messages_user ON messages(user_id, read, created_at DESC);
CREATE INDEX idx_messages_type ON messages(user_id, type, created_at DESC);

-- 积分记录索引
CREATE INDEX idx_point_records_user ON point_records(user_id, created_at DESC);

-- 交易记录索引
CREATE INDEX idx_transactions_user ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_type ON transactions(user_id, type, created_at DESC);

-- 搜索记录索引
CREATE INDEX idx_search_keyword ON search_history(keyword);
CREATE INDEX idx_search_count ON search_history(count DESC);

-- =====================================================
-- 触发器：自动更新 updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feeds_updated_at BEFORE UPDATE ON feeds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_points_updated_at BEFORE UPDATE ON user_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 触发器：计数自动更新
-- =====================================================

-- 关注后更新计数
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE users SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
        UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE users SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
        UPDATE users SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_follow_counts
    AFTER INSERT OR DELETE ON follows
    FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- 点赞后更新计数
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.target_type = 'feed' THEN
            UPDATE feeds SET likes = likes + 1 WHERE id = NEW.target_id;
        ELSIF NEW.target_type = 'comment' THEN
            UPDATE comments SET likes = likes + 1 WHERE id = NEW.target_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.target_type = 'feed' THEN
            UPDATE feeds SET likes = likes - 1 WHERE id = OLD.target_id;
        ELSIF OLD.target_type = 'comment' THEN
            UPDATE comments SET likes = likes - 1 WHERE id = OLD.target_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_like_counts
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW EXECUTE FUNCTION update_like_counts();

-- =====================================================
-- 初始化数据
-- =====================================================

-- 默认话题
INSERT INTO topics (name, description, bg_color, count) VALUES
    ('春日摄影', '记录春天的美好瞬间', '#FFE4E1', 2341),
    ('美食探店', '发现身边的美食', '#E6F3FF', 1856),
    ('旅行日记', '分享旅途中的风景', '#E8F5E9', 3421),
    ('萌宠日常', '可爱宠物大集合', '#FFF3E0', 4523),
    ('穿搭分享', '时尚穿搭灵感', '#F3E5F5', 2134),
    ('生活记录', '记录生活的点滴', '#E0F7FA', 5632);

-- 默认分类
INSERT INTO categories (name, icon, sort_order) VALUES
    ('推荐', '', 1),
    ('热门', '', 2),
    ('风景', '', 3),
    ('人像', '', 4),
    ('美食', '', 5),
    ('街拍', '', 6);

-- 默认任务
INSERT INTO tasks (name, description, type, points, action_type, action_count) VALUES
    ('每日签到', '每天登录签到获得积分', 'daily', 10, 'signin', 1),
    ('发布作品', '发布一篇动态', 'daily', 5, 'publish', 1),
    ('首次点赞', '给喜欢的作品点赞', 'newbie', 5, 'like', 1),
    ('首次评论', '发表评论与其他用户互动', 'newbie', 5, 'comment', 1),
    ('累计发布10篇', '发布10篇动态', 'achievement', 50, 'publish', 10),
    ('获得100个赞', '累计获得100个赞', 'achievement', 100, 'receive_like', 100);
