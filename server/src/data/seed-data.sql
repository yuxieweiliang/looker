-- Looker 数据库数据初始化脚本
-- PostgreSQL 数据插入 SQL
-- 运行方式: psql -U postgres -d looker -f seed-data.sql

-- 使用 pgcrypto 扩展（如果需要生成 UUID）
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== 1. 清除现有数据 ====================
TRUNCATE TABLE transactions, bank_cards, user_points, wallets, bookmarks, likes, blacklist, follows, comments, feeds, topics, user_social_bindings, users RESTART IDENTITY CASCADE;

-- ==================== 2. 插入用户数据 ====================
-- 密码使用 bcrypt hash，saltRounds=10

INSERT INTO users (phone, password_hash, name, avatar, bio, gender, birthday, location, vip, level, following_count, followers_count, likes_count, works_count, collections_count, created_at, updated_at) VALUES
('13800138001', '$2a$10$Q.JXQLaTTIw3aGv9zmYzMeJ6v6LenZr8AdTB/zepEq3/87kp30b/q', '摄影师小王', 'https://picsum.photos/200/200?random=user1', '热爱摄影，记录生活中的美好瞬间。喜欢用镜头捕捉世界的色彩，分享每一个感动的时刻。', 'male', '1995-06-15', '北京市朝阳区', true, 5, 128, 3420, 12580, 156, 89, NOW(), NOW()),
('13800138002', '$2a$10$CSodgBkZ5E3P2pvwHjWEE.TCWerd8mk3DaLNAz.ZWNxAOdzXnLdIC', '张三', 'https://picsum.photos/200/200?random=user2', '旅行达人，走遍世界各地。美食探店爱好者。', 'male', '1990-03-20', '上海市浦东新区', true, 8, 256, 5200, 23450, 312, 178, NOW(), NOW()),
('13800138003', '$2a$10$o.f.m4QxuX39m.EH2tBgiejTRJE0Ni/pqk/EOdTSVZ36gwoI/09eW', '美食博主小美', 'https://picsum.photos/200/200?random=user3', '美食探店 | 食谱分享 | 生活记录', 'female', '1998-09-08', '广州市天河区', false, 3, 89, 1240, 5670, 78, 45, NOW(), NOW()),
('13800138004', '$2a$10$5qgqzeywfFZEbF9L42mv0e/Dkzdl89goSk1WhuXYxEWE8e5eyd1Vm', '旅行达人阿杰', 'https://picsum.photos/200/200?random=user4', '摄影师 | 旅行博主 | 无人机爱好者', 'male', '1992-11-25', '深圳市南山区', true, 6, 189, 2890, 9870, 234, 67, NOW(), NOW()),
('13800138005', '$2a$10$Wp4T4L1vuZBUOnE6WTAIie7cMXyLcUHDxy3k7yE1fE7uz4erV7Xly', '萌宠铲屎官', 'https://picsum.photos/200/200?random=user5', '家有喵主子 | 日常分享 | 萌宠摄影', 'female', '1996-04-12', '成都市锦江区', false, 4, 67, 890, 4560, 123, 34, NOW(), NOW()),
('13800138006', '$2a$10$/C3DAUNdbIiqGdyBts0olOzgbIyMDpKXqnS3M7xF66kBoLwR28mu.', '穿搭时尚达人', 'https://picsum.photos/200/200?random=user6', '时尚博主 | 穿搭分享 | 街拍达人', 'female', '1994-07-30', '杭州市西湖区', true, 7, 234, 6780, 15670, 289, 156, NOW(), NOW()),
('13800138007', '$2a$10$TgjL2kqCdmojZw3b8DJkoe2ev7vvO2zgAyfe061o28HyMP0Kvvrae', '街拍摄影师', 'https://picsum.photos/200/200?random=user7', '街头人文纪实 | 城市记录者', 'male', '1988-12-05', '重庆市渝中区', false, 5, 156, 1890, 6780, 167, 89, NOW(), NOW()),
('13800138008', '$2a$10$se4rtewDWyWjX/oneug32eBNU23ABnKhr9O340qpZ07Yqq0m0uR7W', '生活记录者', 'https://picsum.photos/200/200?random=user8', '记录生活点滴 | 分享美好瞬间', 'unknown', NULL, '武汉市江汉区', false, 2, 45, 230, 1230, 56, 23, NOW(), NOW());

-- ==================== 3. 插入话题数据 ====================
INSERT INTO topics (name, cover, category, count, description, created_at, updated_at) VALUES
('春日摄影', 'https://picsum.photos/200/200?random=topic1', '风景', 2341, '记录春天的美好瞬间', NOW(), NOW()),
('美食探店', 'https://picsum.photos/200/200?random=topic2', '美食', 1856, '发现身边的美味', NOW(), NOW()),
('旅行日记', 'https://picsum.photos/200/200?random=topic3', '旅行', 3421, '分享旅途风景', NOW(), NOW()),
('萌宠日常', 'https://picsum.photos/200/200?random=topic4', '宠物', 4523, '铲屎官的日常', NOW(), NOW()),
('穿搭分享', 'https://picsum.photos/200/200?random=topic5', '时尚', 2134, '每日穿搭灵感', NOW(), NOW()),
('生活记录', 'https://picsum.photos/200/200?random=topic6', '生活', 5632, '记录生活点滴', NOW(), NOW()),
('人像摄影', 'https://picsum.photos/200/200?random=topic7', '摄影', 1280, '人像摄影技巧分享', NOW(), NOW()),
('街拍摄影', 'https://picsum.photos/200/200?random=topic8', '摄影', 980, '街头人文纪实', NOW(), NOW());

-- ==================== 4. 插入动态数据 ====================
-- 动态 1
INSERT INTO feeds (user_id, content, images, topics, location, latitude, longitude, status, views, likes, comments, shares, collections, created_at, updated_at) VALUES
('user-001', '今天去了公园拍摄，春天的花开得太美了！#春日摄影 #生活记录',
'[
  {"id": "img-1-0", "url": "https://picsum.photos/800/800?random=1-0", "width": 800, "height": 800},
  {"id": "img-1-1", "url": "https://picsum.photos/800/800?random=1-1", "width": 800, "height": 800},
  {"id": "img-1-2", "url": "https://picsum.photos/800/800?random=1-2", "width": 800, "height": 800},
  {"id": "img-1-3", "url": "https://picsum.photos/800/800?random=1-3", "width": 800, "height": 800},
  {"id": "img-1-4", "url": "https://picsum.photos/800/800?random=1-4", "width": 800, "height": 800},
  {"id": "img-1-5", "url": "https://picsum.photos/800/800?random=1-5", "width": 800, "height": 800}
]',
ARRAY['春日摄影', '生活记录'], '北京市朝阳区奥林匹克公园', 39.9928, 116.3912, 'published', 1234, 456, 89, 23, 67, '2024-04-20 10:30:00', NOW());

-- 动态 2
INSERT INTO feeds (id, user_id, content, images, topics, location, latitude, longitude, status, views, likes, comments, shares, collections, created_at, updated_at) VALUES
('feed-002', 'user-002', '分享一家超赞的日料店，刺身新鲜度满分！#美食探店',
'[
  {"id": "img-2-0", "url": "https://picsum.photos/800/800?random=2-0", "width": 800, "height": 800},
  {"id": "img-2-1", "url": "https://picsum.photos/800/800?random=2-1", "width": 800, "height": 800},
  {"id": "img-2-2", "url": "https://picsum.photos/800/800?random=2-2", "width": 800, "height": 800},
  {"id": "img-2-3", "url": "https://picsum.photos/800/800?random=2-3", "width": 800, "height": 800}
]',
ARRAY['美食探店'], '上海市静安区', 31.2304, 121.4737, 'published', 2345, 678, 156, 45, 123, '2024-04-19 18:20:00', NOW());

-- 动态 3
INSERT INTO feeds (id, user_id, content, images, topics, location, latitude, longitude, status, views, likes, comments, shares, collections, created_at, updated_at) VALUES
('feed-003', 'user-003', '自制提拉米苏，第一次做就成功了！步骤超简单～ #美食探店 #生活记录',
'[
  {"id": "img-3-0", "url": "https://picsum.photos/800/800?random=3-0", "width": 800, "height": 800},
  {"id": "img-3-1", "url": "https://picsum.photos/800/800?random=3-1", "width": 800, "height": 800},
  {"id": "img-3-2", "url": "https://picsum.photos/800/800?random=3-2", "width": 800, "height": 800},
  {"id": "img-3-3", "url": "https://picsum.photos/800/800?random=3-3", "width": 800, "height": 800},
  {"id": "img-3-4", "url": "https://picsum.photos/800/800?random=3-4", "width": 800, "height": 800}
]',
ARRAY['美食探店', '生活记录'], '广州市天河区', 23.1291, 113.2644, 'published', 3456, 890, 234, 67, 189, '2024-04-19 14:15:00', NOW());

-- 动态 4
INSERT INTO feeds (id, user_id, content, images, topics, location, latitude, longitude, status, views, likes, comments, shares, collections, created_at, updated_at) VALUES
('feed-004', 'user-004', '云南之旅 Day 3，大理的洱海真的太美了，随手一拍都是大片。#旅行日记',
'[
  {"id": "img-4-0", "url": "https://picsum.photos/800/800?random=4-0", "width": 800, "height": 800},
  {"id": "img-4-1", "url": "https://picsum.photos/800/800?random=4-1", "width": 800, "height": 800},
  {"id": "img-4-2", "url": "https://picsum.photos/800/800?random=4-2", "width": 800, "height": 800},
  {"id": "img-4-3", "url": "https://picsum.photos/800/800?random=4-3", "width": 800, "height": 800},
  {"id": "img-4-4", "url": "https://picsum.photos/800/800?random=4-4", "width": 800, "height": 800},
  {"id": "img-4-5", "url": "https://picsum.photos/800/800?random=4-5", "width": 800, "height": 800},
  {"id": "img-4-6", "url": "https://picsum.photos/800/800?random=4-6", "width": 800, "height": 800},
  {"id": "img-4-7", "url": "https://picsum.photos/800/800?random=4-7", "width": 800, "height": 800},
  {"id": "img-4-8", "url": "https://picsum.photos/800/800?random=4-8", "width": 800, "height": 800}
]',
ARRAY['旅行日记'], '云南省大理市', 25.6065, 100.2676, 'published', 5678, 1234, 345, 123, 456, '2024-04-18 09:45:00', NOW());

-- 动态 5
INSERT INTO feeds (id, user_id, content, images, topics, location, latitude, longitude, status, views, likes, comments, shares, collections, created_at, updated_at) VALUES
('feed-005', 'user-005', '我家主子今天又在卖萌了，这表情太治愈了～ #萌宠日常',
'[
  {"id": "img-5-0", "url": "https://picsum.photos/800/800?random=5-0", "width": 800, "height": 800},
  {"id": "img-5-1", "url": "https://picsum.photos/800/800?random=5-1", "width": 800, "height": 800},
  {"id": "img-5-2", "url": "https://picsum.photos/800/800?random=5-2", "width": 800, "height": 800}
]',
ARRAY['萌宠日常'], '成都市锦江区', 30.6586, 104.0648, 'published', 8901, 2345, 567, 234, 678, '2024-04-18 20:00:00', NOW());

-- 动态 6
INSERT INTO feeds (id, user_id, content, images, topics, location, latitude, longitude, status, views, likes, comments, shares, collections, created_at, updated_at) VALUES
('feed-006', 'user-006', '今日 OOTD，春日约会穿搭分享 💕 #穿搭分享 #春日摄影',
'[
  {"id": "img-6-0", "url": "https://picsum.photos/800/800?random=6-0", "width": 800, "height": 800},
  {"id": "img-6-1", "url": "https://picsum.photos/800/800?random=6-1", "width": 800, "height": 800},
  {"id": "img-6-2", "url": "https://picsum.photos/800/800?random=6-2", "width": 800, "height": 800},
  {"id": "img-6-3", "url": "https://picsum.photos/800/800?random=6-3", "width": 800, "height": 800}
]',
ARRAY['穿搭分享', '春日摄影'], '杭州市西湖区', 30.2741, 120.1551, 'published', 4567, 1234, 234, 89, 345, '2024-04-17 12:30:00', NOW());

-- 动态 7
INSERT INTO feeds (id, user_id, content, images, topics, location, latitude, longitude, status, views, likes, comments, shares, collections, created_at, updated_at) VALUES
('feed-007', 'user-007', '街头随拍，老城区的烟火气最能打动人心。#街拍摄影 #生活记录',
'[
  {"id": "img-7-0", "url": "https://picsum.photos/800/800?random=7-0", "width": 800, "height": 800},
  {"id": "img-7-1", "url": "https://picsum.photos/800/800?random=7-1", "width": 800, "height": 800},
  {"id": "img-7-2", "url": "https://picsum.photos/800/800?random=7-2", "width": 800, "height": 800},
  {"id": "img-7-3", "url": "https://picsum.photos/800/800?random=7-3", "width": 800, "height": 800},
  {"id": "img-7-4", "url": "https://picsum.photos/800/800?random=7-4", "width": 800, "height": 800},
  {"id": "img-7-5", "url": "https://picsum.photos/800/800?random=7-5", "width": 800, "height": 800}
]',
ARRAY['街拍摄影', '生活记录'], '重庆市渝中区', 29.5630, 106.5516, 'published', 2345, 567, 123, 45, 234, '2024-04-17 16:45:00', NOW());

-- 动态 8
INSERT INTO feeds (id, user_id, content, images, topics, location, latitude, longitude, status, views, likes, comments, shares, collections, created_at, updated_at) VALUES
('feed-008', 'user-001', '人像摄影练习，自然光下的人像更有质感。#人像摄影',
'[
  {"id": "img-8-0", "url": "https://picsum.photos/800/800?random=8-0", "width": 800, "height": 800},
  {"id": "img-8-1", "url": "https://picsum.photos/800/800?random=8-1", "width": 800, "height": 800},
  {"id": "img-8-2", "url": "https://picsum.photos/800/800?random=8-2", "width": 800, "height": 800},
  {"id": "img-8-3", "url": "https://picsum.photos/800/800?random=8-3", "width": 800, "height": 800},
  {"id": "img-8-4", "url": "https://picsum.photos/800/800?random=8-4", "width": 800, "height": 800}
]',
ARRAY['人像摄影'], '北京市朝阳区', 39.9042, 116.4074, 'published', 3456, 890, 234, 67, 123, '2024-04-16 15:20:00', NOW());

-- 动态 9
INSERT INTO feeds (id, user_id, content, images, topics, location, latitude, longitude, status, views, likes, comments, shares, collections, created_at, updated_at) VALUES
('feed-009', 'user-008', '周末的下午，一杯咖啡，一本书，完美的时光。#生活记录',
'[
  {"id": "img-9-0", "url": "https://picsum.photos/800/800?random=9-0", "width": 800, "height": 800},
  {"id": "img-9-1", "url": "https://picsum.photos/800/800?random=9-1", "width": 800, "height": 800}
]',
ARRAY['生活记录'], '武汉市江汉区', 30.5928, 114.3055, 'published', 1234, 345, 67, 23, 89, '2024-04-16 14:00:00', NOW());

-- 动态 10
INSERT INTO feeds (id, user_id, content, images, topics, location, latitude, longitude, status, views, likes, comments, shares, collections, created_at, updated_at) VALUES
('feed-010', 'user-002', '周末自驾去海边，海风真的太舒服了。#旅行日记 #生活记录',
'[
  {"id": "img-10-0", "url": "https://picsum.photos/800/800?random=10-0", "width": 800, "height": 800},
  {"id": "img-10-1", "url": "https://picsum.photos/800/800?random=10-1", "width": 800, "height": 800},
  {"id": "img-10-2", "url": "https://picsum.photos/800/800?random=10-2", "width": 800, "height": 800},
  {"id": "img-10-3", "url": "https://picsum.photos/800/800?random=10-3", "width": 800, "height": 800},
  {"id": "img-10-4", "url": "https://picsum.photos/800/800?random=10-4", "width": 800, "height": 800},
  {"id": "img-10-5", "url": "https://picsum.photos/800/800?random=10-5", "width": 800, "height": 800},
  {"id": "img-10-6", "url": "https://picsum.photos/800/800?random=10-6", "width": 800, "height": 800}
]',
ARRAY['旅行日记', '生活记录'], '浙江省舟山市', 29.9853, 122.2072, 'published', 6789, 1890, 456, 178, 567, '2024-04-15 11:30:00', NOW());

-- ==================== 5. 插入评论数据 ====================
INSERT INTO comments (id, feed_id, user_id, content, likes, parent_id, created_at, updated_at) VALUES
('comment-001', 'feed-001', 'user-002', '这张照片拍得真棒！构图和光线都很完美，学习了！', 45, NULL, '2024-04-20 11:00:00', NOW()),
('comment-002', 'feed-001', 'user-003', '太美了！请问用的是什么相机呀？', 23, NULL, '2024-04-20 11:30:00', NOW()),
('comment-003', 'feed-001', 'user-001', '用的是 Sony A7M4，感谢喜欢！', 12, 'comment-002', '2024-04-20 12:00:00', NOW()),
('comment-004', 'feed-002', 'user-004', '看起来好好吃！求地址～', 34, NULL, '2024-04-19 19:00:00', NOW()),
('comment-005', 'feed-003', 'user-005', '做得好精致！求教程', 56, NULL, '2024-04-19 15:00:00', NOW()),
('comment-006', 'feed-004', 'user-006', '大理我也去过！洱海真的太美了', 78, NULL, '2024-04-18 10:00:00', NOW()),
('comment-007', 'feed-005', 'user-007', '喵主子太可爱了！想rua', 123, NULL, '2024-04-18 21:00:00', NOW()),
('comment-008', 'feed-006', 'user-008', '这套穿搭太好看了！求链接', 89, NULL, '2024-04-17 13:00:00', NOW()),
('comment-009', 'feed-007', 'user-001', '老城区的氛围感拿捏得死死的', 45, NULL, '2024-04-17 17:00:00', NOW()),
('comment-010', 'feed-008', 'user-002', '自然光运用得太好了，皮肤质感很棒', 67, NULL, '2024-04-16 16:00:00', NOW());

-- ==================== 6. 插入关注数据 ====================
INSERT INTO follows (id, follower_id, following_id, created_at) VALUES
('follow-001', 'user-001', 'user-002', '2024-04-01 10:00:00'),
('follow-002', 'user-001', 'user-003', '2024-04-02 11:00:00'),
('follow-003', 'user-001', 'user-004', '2024-04-03 12:00:00'),
('follow-004', 'user-002', 'user-001', '2024-04-01 09:00:00'),
('follow-005', 'user-002', 'user-005', '2024-04-04 13:00:00'),
('follow-006', 'user-003', 'user-001', '2024-04-02 14:00:00'),
('follow-007', 'user-003', 'user-006', '2024-04-05 15:00:00'),
('follow-008', 'user-004', 'user-001', '2024-04-03 10:30:00'),
('follow-009', 'user-004', 'user-007', '2024-04-06 16:00:00'),
('follow-010', 'user-005', 'user-002', '2024-04-04 11:00:00');

-- ==================== 7. 插入点赞数据 ====================
INSERT INTO likes (id, user_id, target_id, target_type, created_at) VALUES
('like-001', 'user-002', 'feed-001', 'feed', '2024-04-20 11:00:00'),
('like-002', 'user-003', 'feed-001', 'feed', '2024-04-20 11:30:00'),
('like-003', 'user-004', 'feed-001', 'feed', '2024-04-20 12:00:00'),
('like-004', 'user-001', 'feed-002', 'feed', '2024-04-19 19:00:00'),
('like-005', 'user-005', 'feed-003', 'feed', '2024-04-19 15:30:00'),
('like-006', 'user-006', 'feed-004', 'feed', '2024-04-18 10:30:00'),
('like-007', 'user-007', 'feed-005', 'feed', '2024-04-18 21:30:00'),
('like-008', 'user-008', 'feed-006', 'feed', '2024-04-17 13:30:00'),
('like-009', 'user-001', 'comment-001', 'comment', '2024-04-20 11:30:00'),
('like-010', 'user-004', 'comment-004', 'comment', '2024-04-19 19:30:00');

-- ==================== 8. 插入收藏数据 ====================
INSERT INTO bookmarks (id, user_id, feed_id, created_at) VALUES
('bookmark-001', 'user-002', 'feed-001', '2024-04-20 11:30:00'),
('bookmark-002', 'user-003', 'feed-002', '2024-04-19 19:30:00'),
('bookmark-003', 'user-004', 'feed-003', '2024-04-19 15:30:00'),
('bookmark-004', 'user-001', 'feed-004', '2024-04-18 10:30:00'),
('bookmark-005', 'user-005', 'feed-006', '2024-04-17 13:30:00');

-- ==================== 9. 插入银行卡数据 ====================
INSERT INTO bank_cards (id, user_id, bank_name, card_type, card_no, holder_name, is_default, bg_color, created_at, updated_at) VALUES
('card-001', 'user-002', '工商银行', '储蓄卡', '8888', '张三', true, 'linear-gradient(135deg, #c41e3a 0%, #e31837 100%)', NOW(), NOW()),
('card-002', 'user-002', '招商银行', '信用卡', '6666', '张三', false, 'linear-gradient(135deg, #e60012 0%, #ff1744 100%)', NOW(), NOW()),
('card-003', 'user-002', '支付宝', '余额', '9999', '张三', false, 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)', NOW(), NOW()),
('card-004', 'user-001', '建设银行', '储蓄卡', '1234', '摄影师小王', true, 'linear-gradient(135deg, #0066b3 0%, #0099cc 100%)', NOW(), NOW());

-- ==================== 10. 插入交易记录数据 ====================
INSERT INTO transactions (id, user_id, title, amount, type, status, created_at, updated_at) VALUES
('trans-001', 'user-002', '作品打赏', 128.50, 'income', 'completed', '2024-04-20 10:30:00', NOW()),
('trans-002', 'user-002', '任务奖励', 50.00, 'income', 'completed', '2024-04-19 15:00:00', NOW()),
('trans-003', 'user-002', '余额充值', 500.00, 'recharge', 'completed', '2024-04-18 09:00:00', NOW()),
('trans-004', 'user-002', '购买服务', 99.00, 'expense', 'completed', '2024-04-17 14:00:00', NOW()),
('trans-005', 'user-001', '活动奖励', 200.00, 'income', 'completed', '2024-04-20 11:00:00', NOW()),
('trans-006', 'user-001', '余额提现', 300.00, 'withdraw', 'completed', '2024-04-19 16:00:00', NOW()),
('trans-007', 'user-003', '邀请奖励', 20.00, 'income', 'completed', '2024-04-20 09:00:00', NOW()),
('trans-008', 'user-004', '打赏他人', 66.00, 'expense', 'completed', '2024-04-19 20:00:00', NOW());

-- ==================== 11. 插入积分数据 ====================
INSERT INTO user_points (id, user_id, points, consecutive_days, last_check_in, created_at, updated_at) VALUES
('points-001', 'user-001', 2580, 15, '2024-04-20', NOW(), NOW()),
('points-002', 'user-002', 4560, 30, '2024-04-20', NOW(), NOW()),
('points-003', 'user-003', 890, 5, '2024-04-19', NOW(), NOW()),
('points-004', 'user-004', 3450, 20, '2024-04-20', NOW(), NOW()),
('points-005', 'user-005', 1230, 10, '2024-04-18', NOW(), NOW());

-- ==================== 12. 插入钱包数据 ====================
INSERT INTO wallets (id, user_id, balance, created_at, updated_at) VALUES
('wallet-001', 'user-001', 128.50, NOW(), NOW()),
('wallet-002', 'user-002', 2560.80, NOW(), NOW()),
('wallet-003', 'user-003', 89.60, NOW(), NOW()),
('wallet-004', 'user-004', 567.30, NOW(), NOW()),
('wallet-005', 'user-005', 234.90, NOW(), NOW());

-- ==================== 13. 插入消息数据 ====================
INSERT INTO messages (id, user_id, sender_id, type, title, content, target_id, target_type, is_read, created_at) VALUES
('msg-001', 'user-001', 'user-002', 'like', '张三 赞了你的作品', '张三 赞了你的作品《今天去了公园拍摄》', 'feed-001', 'feed', false, '2024-04-20 11:00:00'),
('msg-002', 'user-001', 'user-003', 'comment', '美食博主小美 评论了你的作品', '美食博主小美 评论：太美了！请问用的是什么相机呀？', 'feed-001', 'feed', false, '2024-04-20 11:30:00'),
('msg-003', 'user-002', 'user-004', 'follow', '旅行达人阿杰 关注了你', '旅行达人阿杰 开始关注你', 'user-002', 'user', true, '2024-04-03 10:30:00'),
('msg-004', 'user-002', NULL, 'system', '欢迎来到 Looker', '欢迎来到 Looker，开始分享你的精彩瞬间吧！', NULL, NULL, true, '2024-04-01 09:00:00'),
('msg-005', 'user-003', 'user-001', 'like', '摄影师小王 赞了你的评论', '摄影师小王 赞了你的评论', 'comment-005', 'comment', false, '2024-04-19 15:30:00');

-- ==================== 验证数据 ====================
SELECT 'users' as table_name, COUNT(*) as count FROM users UNION ALL
SELECT 'topics', COUNT(*) FROM topics UNION ALL
SELECT 'feeds', COUNT(*) FROM feeds UNION ALL
SELECT 'comments', COUNT(*) FROM comments UNION ALL
SELECT 'follows', COUNT(*) FROM follows UNION ALL
SELECT 'likes', COUNT(*) FROM likes UNION ALL
SELECT 'bookmarks', COUNT(*) FROM bookmarks UNION ALL
SELECT 'bank_cards', COUNT(*) FROM bank_cards UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions UNION ALL
SELECT 'user_points', COUNT(*) FROM user_points UNION ALL
SELECT 'wallets', COUNT(*) FROM wallets UNION ALL
SELECT 'messages', COUNT(*) FROM messages;
