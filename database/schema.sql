-- =====================================================
-- Looker 数据库表结构 (PostgreSQL)
-- 统一 Schema - 兼容 mock-data 和 seed-data
-- =====================================================

-- 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- 1. 用户模块
-- =====================================================

-- 用户表
-- id 使用 VARCHAR(50) 兼容 mock-data 中的 'user-001' 格式
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
    id VARCHAR(50) PRIMARY KEY,
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
    id VARCHAR(50) PRIMARY KEY,
    follower_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- 黑名单表
CREATE TABLE blacklist (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, blocked_user_id)
);

-- =====================================================
-- 2. 内容模块
-- =====================================================

-- 话题表
-- id 使用 VARCHAR(50) 兼容 mock-data 中的 'topic-001' 格式
CREATE TABLE topics (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    cover VARCHAR(500),
    category VARCHAR(50) DEFAULT '其他',
    count INTEGER DEFAULT 0,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 话题关注表
CREATE TABLE topic_follows (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id VARCHAR(50) NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, topic_id)
);

-- 动态表
-- id 使用 VARCHAR(50) 兼容 mock-data 中的 'feed-001' 格式
-- topics 存储话题名数组，用于标签筛选
CREATE TABLE feeds (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    images JSONB DEFAULT '[]',
    topics VARCHAR(50)[] DEFAULT '{}',
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

-- 图片资源表
CREATE TABLE photos (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feed_id VARCHAR(50) REFERENCES feeds(id) ON DELETE SET NULL,
    url VARCHAR(500) NOT NULL,
    width INTEGER,
    height INTEGER,
    title VARCHAR(200),
    category_id VARCHAR(50),
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 分类表
CREATE TABLE categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. 互动模块
-- =====================================================

-- 点赞表（支持动态和评论）
-- id 使用 VARCHAR(50) 兼容 mock-data 中的 'like-001' 格式
CREATE TABLE likes (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id VARCHAR(50) NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('feed', 'comment')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_id, target_type)
);

-- 收藏表
-- id 使用 VARCHAR(50) 兼容 mock-data 中的 'bookmark-001' 格式
CREATE TABLE bookmarks (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feed_id VARCHAR(50) NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, feed_id)
);

-- 评论表
-- id 使用 VARCHAR(50) 兼容 mock-data 中的 'comment-001' 格式
-- feed_id 兼容 mock-data 结构
CREATE TABLE comments (
    id VARCHAR(50) PRIMARY KEY,
    feed_id VARCHAR(50) NOT NULL REFERENCES feeds(id) ON DELETE CASCADE,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    parent_id VARCHAR(50) REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. 消息模块
-- =====================================================

-- 消息表
CREATE TABLE messages (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'system', 'message')),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    target_id VARCHAR(50),
    target_type VARCHAR(20),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. 积分模块
-- =====================================================

-- 用户积分表
CREATE TABLE user_points (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    consecutive_days INTEGER DEFAULT 0,
    last_signin_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 积分记录表
CREATE TABLE point_records (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('signin', 'task', 'exchange', 'reward')),
    points INTEGER NOT NULL,
    description VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 任务表
CREATE TABLE tasks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('daily', 'newbie', 'achievement')),
    points INTEGER NOT NULL,
    icon VARCHAR(500),
    action_type VARCHAR(50),
    action_count INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户任务完成记录
CREATE TABLE user_tasks (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id VARCHAR(50) NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    claimed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, task_id)
);

-- 积分商品表
CREATE TABLE point_goods (
    id VARCHAR(50) PRIMARY KEY,
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
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goods_id VARCHAR(50) NOT NULL REFERENCES point_goods(id),
    points INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. 钱包模块
-- =====================================================

-- 钱包表
CREATE TABLE wallets (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    frozen_amount DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 交易记录表
CREATE TABLE transactions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'recharge', 'withdraw')),
    title VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    balance DECIMAL(10, 2),
    remark VARCHAR(200),
    related_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 银行卡表
CREATE TABLE bank_cards (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bank_name VARCHAR(50) NOT NULL,
    card_type VARCHAR(20) DEFAULT '储蓄卡',
    card_number VARCHAR(30) NOT NULL,
    card_number_mask VARCHAR(30),
    holder_name VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    bg_color VARCHAR(200) DEFAULT 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 优惠券表
CREATE TABLE coupons (
    id VARCHAR(50) PRIMARY KEY,
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
    id VARCHAR(50) PRIMARY KEY,
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
    id VARCHAR(50) PRIMARY KEY,
    image VARCHAR(500) NOT NULL,
    link VARCHAR(500),
    title VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 搜索记录表
CREATE TABLE search_history (
    id VARCHAR(50) PRIMARY KEY,
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
CREATE INDEX idx_comments_feed ON comments(feed_id, created_at DESC);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- 消息表索引
CREATE INDEX idx_messages_user ON messages(user_id, is_read, created_at DESC);
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
