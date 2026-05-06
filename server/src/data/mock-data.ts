/**
 * 数据迁移脚本 - 将静态 mock 数据转换为真实数据库数据
 * 用于 Looker 项目的初始化数据
 */

// ==================== 1. 用户数据 ====================
// 来源: social.vue, edit.vue, bank-cards.vue, comment.vue, square.vue

export interface UserData {
  id: string
  phone: string
  name: string
  avatar: string
  bio: string
  gender: 'male' | 'female' | 'unknown'
  birthday: string | null
  location: string
  vip: boolean
  level: number
  password: string // 明文密码，用于 account.json
  following_count: number
  followers_count: number
  likes_count: number
  works_count: number
  collections_count: number
}

export const mockUsers: UserData[] = [
  {
    id: 'user-001',
    phone: '13800138001',
    name: '摄影师小王',
    avatar: 'https://picsum.photos/200/200?random=user1',
    bio: '热爱摄影，记录生活中的美好瞬间。喜欢用镜头捕捉世界的色彩，分享每一个感动的时刻。',
    gender: 'male',
    birthday: '1995-06-15',
    location: '北京市朝阳区',
    vip: true,
    level: 5,
    password: 'Photo2024!',
    following_count: 128,
    followers_count: 3420,
    likes_count: 12580,
    works_count: 156,
    collections_count: 89,
  },
  {
    id: 'user-002',
    phone: '13800138002',
    name: '张三',
    avatar: 'https://picsum.photos/200/200?random=user2',
    bio: '旅行达人，走遍世界各地。美食探店爱好者。',
    gender: 'male',
    birthday: '1990-03-20',
    location: '上海市浦东新区',
    vip: true,
    level: 8,
    password: 'Zhang1234!',
    following_count: 256,
    followers_count: 5200,
    likes_count: 23450,
    works_count: 312,
    collections_count: 178,
  },
  {
    id: 'user-003',
    phone: '13800138003',
    name: '美食博主小美',
    avatar: 'https://picsum.photos/200/200?random=user3',
    bio: '美食探店 | 食谱分享 | 生活记录',
    gender: 'female',
    birthday: '1998-09-08',
    location: '广州市天河区',
    vip: false,
    level: 3,
    password: 'Foodie2024@',
    following_count: 89,
    followers_count: 1240,
    likes_count: 5670,
    works_count: 78,
    collections_count: 45,
  },
  {
    id: 'user-004',
    phone: '13800138004',
    name: '旅行达人阿杰',
    avatar: 'https://picsum.photos/200/200?random=user4',
    bio: '摄影师 | 旅行博主 | 无人机爱好者',
    gender: 'male',
    birthday: '1992-11-25',
    location: '深圳市南山区',
    vip: true,
    level: 6,
    password: 'Travel2024#',
    following_count: 189,
    followers_count: 2890,
    likes_count: 9870,
    works_count: 234,
    collections_count: 67,
  },
  {
    id: 'user-005',
    phone: '13800138005',
    name: '萌宠铲屎官',
    avatar: 'https://picsum.photos/200/200?random=user5',
    bio: '家有喵主子 | 日常分享 | 萌宠摄影',
    gender: 'female',
    birthday: '1996-04-12',
    location: '成都市锦江区',
    vip: false,
    level: 4,
    password: 'PetLover1!',
    following_count: 67,
    followers_count: 890,
    likes_count: 4560,
    works_count: 123,
    collections_count: 34,
  },
  {
    id: 'user-006',
    phone: '13800138006',
    name: '穿搭时尚达人',
    avatar: 'https://picsum.photos/200/200?random=user6',
    bio: '时尚博主 | 穿搭分享 | 街拍达人',
    gender: 'female',
    birthday: '1994-07-30',
    location: '杭州市西湖区',
    vip: true,
    level: 7,
    password: 'Fashion88$',
    following_count: 234,
    followers_count: 6780,
    likes_count: 15670,
    works_count: 289,
    collections_count: 156,
  },
  {
    id: 'user-007',
    phone: '13800138007',
    name: '街拍摄影师',
    avatar: 'https://picsum.photos/200/200?random=user7',
    bio: '街头人文纪实 | 城市记录者',
    gender: 'male',
    birthday: '1988-12-05',
    location: '重庆市渝中区',
    vip: false,
    level: 5,
    password: 'Street99&',
    following_count: 156,
    followers_count: 1890,
    likes_count: 6780,
    works_count: 167,
    collections_count: 89,
  },
  {
    id: 'user-008',
    phone: '13800138008',
    name: '生活记录者',
    avatar: 'https://picsum.photos/200/200?random=user8',
    bio: '记录生活点滴 | 分享美好瞬间',
    gender: 'unknown',
    birthday: null,
    location: '武汉市江汉区',
    vip: false,
    level: 2,
    password: 'Life2024*',
    following_count: 45,
    followers_count: 230,
    likes_count: 1230,
    works_count: 56,
    collections_count: 23,
  },
]

// ==================== 2. 话题数据 ====================
// 来源: topic-select.vue, square.vue

export interface TopicData {
  id: string
  name: string
  cover: string
  category: string
  count: number
  desc: string
}

export const mockTopics: TopicData[] = [
  {
    id: 'topic-001',
    name: '春日摄影',
    cover: 'https://picsum.photos/200/200?random=topic1',
    category: '风景',
    count: 2341,
    desc: '记录春天的美好瞬间',
  },
  {
    id: 'topic-002',
    name: '美食探店',
    cover: 'https://picsum.photos/200/200?random=topic2',
    category: '美食',
    count: 1856,
    desc: '发现身边的美味',
  },
  {
    id: 'topic-003',
    name: '旅行日记',
    cover: 'https://picsum.photos/200/200?random=topic3',
    category: '旅行',
    count: 3421,
    desc: '分享旅途风景',
  },
  {
    id: 'topic-004',
    name: '萌宠日常',
    cover: 'https://picsum.photos/200/200?random=topic4',
    category: '宠物',
    count: 4523,
    desc: '铲屎官的日常',
  },
  {
    id: 'topic-005',
    name: '穿搭分享',
    cover: 'https://picsum.photos/200/200?random=topic5',
    category: '时尚',
    count: 2134,
    desc: '每日穿搭灵感',
  },
  {
    id: 'topic-006',
    name: '生活记录',
    cover: 'https://picsum.photos/200/200?random=topic6',
    category: '生活',
    count: 5632,
    desc: '记录生活点滴',
  },
  {
    id: 'topic-007',
    name: '人像摄影',
    cover: 'https://picsum.photos/200/200?random=topic7',
    category: '摄影',
    count: 1280,
    desc: '人像摄影技巧分享',
  },
  {
    id: 'topic-008',
    name: '街拍摄影',
    cover: 'https://picsum.photos/200/200?random=topic8',
    category: '摄影',
    count: 980,
    desc: '街头人文纪实',
  },
]

// ==================== 3. 动态数据 ====================
// 来源: square.vue, topic.vue

export interface FeedData {
  id: string
  user_id: string
  content: string
  images: Array<{ id: string; url: string; width: number; height: number }>
  topics: string[]
  location: string | null
  latitude: number | null
  longitude: number | null
  views: number
  likes: number
  comments: number
  shares: number
  collections: number
  created_at: string
}

function generateImages(feedIndex: number, count: number) {
  return Array.from({ length: count }, (_, j) => ({
    id: `img-${feedIndex}-${j}`,
    url: `https://picsum.photos/800/800?random=${feedIndex}-${j}`,
    width: 800,
    height: 800,
  }))
}

export const mockFeeds: FeedData[] = [
  {
    id: 'feed-001',
    user_id: 'user-001',
    content: '今天去了公园拍摄，春天的花开得太美了！#春日摄影 #生活记录',
    images: generateImages(1, 6),
    topics: ['春日摄影', '生活记录'],
    location: '北京市朝阳区奥林匹克公园',
    latitude: 39.9928,
    longitude: 116.3912,
    views: 1234,
    likes: 456,
    comments: 89,
    shares: 23,
    collections: 67,
    created_at: '2024-04-20 10:30:00',
  },
  {
    id: 'feed-002',
    user_id: 'user-002',
    content: '分享一家超赞的日料店，刺身新鲜度满分！#美食探店',
    images: generateImages(2, 4),
    topics: ['美食探店'],
    location: '上海市静安区',
    latitude: 31.2304,
    longitude: 121.4737,
    views: 2345,
    likes: 678,
    comments: 156,
    shares: 45,
    collections: 123,
    created_at: '2024-04-19 18:20:00',
  },
  {
    id: 'feed-003',
    user_id: 'user-003',
    content: '自制提拉米苏，第一次做就成功了！步骤超简单～ #美食探店 #生活记录',
    images: generateImages(3, 5),
    topics: ['美食探店', '生活记录'],
    location: '广州市天河区',
    latitude: 23.1291,
    longitude: 113.2644,
    views: 3456,
    likes: 890,
    comments: 234,
    shares: 67,
    collections: 189,
    created_at: '2024-04-19 14:15:00',
  },
  {
    id: 'feed-004',
    user_id: 'user-004',
    content: '云南之旅 Day 3，大理的洱海真的太美了，随手一拍都是大片。#旅行日记',
    images: generateImages(4, 9),
    topics: ['旅行日记'],
    location: '云南省大理市',
    latitude: 25.6065,
    longitude: 100.2676,
    views: 5678,
    likes: 1234,
    comments: 345,
    shares: 123,
    collections: 456,
    created_at: '2024-04-18 09:45:00',
  },
  {
    id: 'feed-005',
    user_id: 'user-005',
    content: '我家主子今天又在卖萌了，这表情太治愈了～ #萌宠日常',
    images: generateImages(5, 3),
    topics: ['萌宠日常'],
    location: '成都市锦江区',
    latitude: 30.6586,
    longitude: 104.0648,
    views: 8901,
    likes: 2345,
    comments: 567,
    shares: 234,
    collections: 678,
    created_at: '2024-04-18 20:00:00',
  },
  {
    id: 'feed-006',
    user_id: 'user-006',
    content: '今日 OOTD，春日约会穿搭分享 💕 #穿搭分享 #春日摄影',
    images: generateImages(6, 4),
    topics: ['穿搭分享', '春日摄影'],
    location: '杭州市西湖区',
    latitude: 30.2741,
    longitude: 120.1551,
    views: 4567,
    likes: 1234,
    comments: 234,
    shares: 89,
    collections: 345,
    created_at: '2024-04-17 12:30:00',
  },
  {
    id: 'feed-007',
    user_id: 'user-007',
    content: '街头随拍，老城区的烟火气最能打动人心。#街拍摄影 #生活记录',
    images: generateImages(7, 6),
    topics: ['街拍摄影', '生活记录'],
    location: '重庆市渝中区',
    latitude: 29.5630,
    longitude: 106.5516,
    views: 2345,
    likes: 567,
    comments: 123,
    shares: 45,
    collections: 234,
    created_at: '2024-04-17 16:45:00',
  },
  {
    id: 'feed-008',
    user_id: 'user-001',
    content: '人像摄影练习，自然光下的人像更有质感。#人像摄影',
    images: generateImages(8, 5),
    topics: ['人像摄影'],
    location: '北京市朝阳区',
    latitude: 39.9042,
    longitude: 116.4074,
    views: 3456,
    likes: 890,
    comments: 234,
    shares: 67,
    collections: 123,
    created_at: '2024-04-16 15:20:00',
  },
  {
    id: 'feed-009',
    user_id: 'user-008',
    content: '周末的下午，一杯咖啡，一本书，完美的时光。#生活记录',
    images: generateImages(9, 2),
    topics: ['生活记录'],
    location: '武汉市江汉区',
    latitude: 30.5928,
    longitude: 114.3055,
    views: 1234,
    likes: 345,
    comments: 67,
    shares: 23,
    collections: 89,
    created_at: '2024-04-16 14:00:00',
  },
  {
    id: 'feed-010',
    user_id: 'user-002',
    content: '周末自驾去海边，海风真的太舒服了。#旅行日记 #生活记录',
    images: generateImages(10, 7),
    topics: ['旅行日记', '生活记录'],
    location: '浙江省舟山市',
    latitude: 29.9853,
    longitude: 122.2072,
    views: 6789,
    likes: 1890,
    comments: 456,
    shares: 178,
    collections: 567,
    created_at: '2024-04-15 11:30:00',
  },
]

// ==================== 4. 评论数据 ====================
// 来源: comment.vue

export interface CommentData {
  id: string
  feed_id: string
  user_id: string
  content: string
  likes: number
  parent_id: string | null
  created_at: string
}

export const mockComments: CommentData[] = [
  {
    id: 'comment-001',
    feed_id: 'feed-001',
    user_id: 'user-002',
    content: '这张照片拍得真棒！构图和光线都很完美，学习了！',
    likes: 45,
    parent_id: null,
    created_at: '2024-04-20 11:00:00',
  },
  {
    id: 'comment-002',
    feed_id: 'feed-001',
    user_id: 'user-003',
    content: '太美了！请问用的是什么相机呀？',
    likes: 23,
    parent_id: null,
    created_at: '2024-04-20 11:30:00',
  },
  {
    id: 'comment-003',
    feed_id: 'feed-001',
    user_id: 'user-001',
    content: '用的是 Sony A7M4，感谢喜欢！',
    likes: 12,
    parent_id: 'comment-002',
    created_at: '2024-04-20 12:00:00',
  },
  {
    id: 'comment-004',
    feed_id: 'feed-002',
    user_id: 'user-004',
    content: '看起来好好吃！求地址～',
    likes: 34,
    parent_id: null,
    created_at: '2024-04-19 19:00:00',
  },
  {
    id: 'comment-005',
    feed_id: 'feed-003',
    user_id: 'user-005',
    content: '做得好精致！求教程',
    likes: 56,
    parent_id: null,
    created_at: '2024-04-19 15:00:00',
  },
  {
    id: 'comment-006',
    feed_id: 'feed-004',
    user_id: 'user-006',
    content: '大理我也去过！洱海真的太美了',
    likes: 78,
    parent_id: null,
    created_at: '2024-04-18 10:00:00',
  },
  {
    id: 'comment-007',
    feed_id: 'feed-005',
    user_id: 'user-007',
    content: '喵主子太可爱了！想rua',
    likes: 123,
    parent_id: null,
    created_at: '2024-04-18 21:00:00',
  },
  {
    id: 'comment-008',
    feed_id: 'feed-006',
    user_id: 'user-008',
    content: '这套穿搭太好看了！求链接',
    likes: 89,
    parent_id: null,
    created_at: '2024-04-17 13:00:00',
  },
  {
    id: 'comment-009',
    feed_id: 'feed-007',
    user_id: 'user-001',
    content: '老城区的氛围感拿捏得死死的',
    likes: 45,
    parent_id: null,
    created_at: '2024-04-17 17:00:00',
  },
  {
    id: 'comment-010',
    feed_id: 'feed-008',
    user_id: 'user-002',
    content: '自然光运用得太好了，皮肤质感很棒',
    likes: 67,
    parent_id: null,
    created_at: '2024-04-16 16:00:00',
  },
]

// ==================== 5. 银行卡数据 ====================
// 来源: bank-cards.vue

export interface BankCardData {
  id: string
  user_id: string
  bank_name: string
  card_type: string
  card_no: string
  holder_name: string
  is_default: boolean
  bg_color: string
}

export const mockBankCards: BankCardData[] = [
  {
    id: 'card-001',
    user_id: 'user-002',
    bank_name: '工商银行',
    card_type: '储蓄卡',
    card_no: '8888',
    holder_name: '张三',
    is_default: true,
    bg_color: 'linear-gradient(135deg, #c41e3a 0%, #e31837 100%)',
  },
  {
    id: 'card-002',
    user_id: 'user-002',
    bank_name: '招商银行',
    card_type: '信用卡',
    card_no: '6666',
    holder_name: '张三',
    is_default: false,
    bg_color: 'linear-gradient(135deg, #e60012 0%, #ff1744 100%)',
  },
  {
    id: 'card-003',
    user_id: 'user-002',
    bank_name: '支付宝',
    card_type: '余额',
    card_no: '9999',
    holder_name: '张三',
    is_default: false,
    bg_color: 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
  },
  {
    id: 'card-004',
    user_id: 'user-001',
    bank_name: '建设银行',
    card_type: '储蓄卡',
    card_no: '1234',
    holder_name: '摄影师小王',
    is_default: true,
    bg_color: 'linear-gradient(135deg, #0066b3 0%, #0099cc 100%)',
  },
]

// ==================== 6. 交易记录数据 ====================
// 来源: transactions.vue

export interface TransactionData {
  id: string
  user_id: string
  title: string
  amount: number
  type: 'income' | 'expense' | 'recharge' | 'withdraw'
  time: string
}

export const mockTransactions: TransactionData[] = [
  {
    id: 'trans-001',
    user_id: 'user-002',
    title: '作品打赏',
    amount: 128.50,
    type: 'income',
    time: '2024-04-20 10:30:00',
  },
  {
    id: 'trans-002',
    user_id: 'user-002',
    title: '任务奖励',
    amount: 50.00,
    type: 'income',
    time: '2024-04-19 15:00:00',
  },
  {
    id: 'trans-003',
    user_id: 'user-002',
    title: '余额充值',
    amount: 500.00,
    type: 'recharge',
    time: '2024-04-18 09:00:00',
  },
  {
    id: 'trans-004',
    user_id: 'user-002',
    title: '购买服务',
    amount: 99.00,
    type: 'expense',
    time: '2024-04-17 14:00:00',
  },
  {
    id: 'trans-005',
    user_id: 'user-001',
    title: '活动奖励',
    amount: 200.00,
    type: 'income',
    time: '2024-04-20 11:00:00',
  },
  {
    id: 'trans-006',
    user_id: 'user-001',
    title: '余额提现',
    amount: 300.00,
    type: 'withdraw',
    time: '2024-04-19 16:00:00',
  },
  {
    id: 'trans-007',
    user_id: 'user-003',
    title: '邀请奖励',
    amount: 20.00,
    type: 'income',
    time: '2024-04-20 09:00:00',
  },
  {
    id: 'trans-008',
    user_id: 'user-004',
    title: '打赏他人',
    amount: 66.00,
    type: 'expense',
    time: '2024-04-19 20:00:00',
  },
]

// ==================== 7. 关注关系数据 ====================
// 来源: social.vue

export interface FollowData {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export const mockFollows: FollowData[] = [
  { id: 'follow-001', follower_id: 'user-001', following_id: 'user-002', created_at: '2024-04-01 10:00:00' },
  { id: 'follow-002', follower_id: 'user-001', following_id: 'user-003', created_at: '2024-04-02 11:00:00' },
  { id: 'follow-003', follower_id: 'user-001', following_id: 'user-004', created_at: '2024-04-03 12:00:00' },
  { id: 'follow-004', follower_id: 'user-002', following_id: 'user-001', created_at: '2024-04-01 09:00:00' },
  { id: 'follow-005', follower_id: 'user-002', following_id: 'user-005', created_at: '2024-04-04 13:00:00' },
  { id: 'follow-006', follower_id: 'user-003', following_id: 'user-001', created_at: '2024-04-02 14:00:00' },
  { id: 'follow-007', follower_id: 'user-003', following_id: 'user-006', created_at: '2024-04-05 15:00:00' },
  { id: 'follow-008', follower_id: 'user-004', following_id: 'user-001', created_at: '2024-04-03 10:30:00' },
  { id: 'follow-009', follower_id: 'user-004', following_id: 'user-007', created_at: '2024-04-06 16:00:00' },
  { id: 'follow-010', follower_id: 'user-005', following_id: 'user-002', created_at: '2024-04-04 11:00:00' },
]

// ==================== 8. 点赞数据 ====================

export interface LikeData {
  id: string
  user_id: string
  target_id: string
  target_type: 'feed' | 'comment'
  created_at: string
}

export const mockLikes: LikeData[] = [
  { id: 'like-001', user_id: 'user-002', target_id: 'feed-001', target_type: 'feed', created_at: '2024-04-20 11:00:00' },
  { id: 'like-002', user_id: 'user-003', target_id: 'feed-001', target_type: 'feed', created_at: '2024-04-20 11:30:00' },
  { id: 'like-003', user_id: 'user-004', target_id: 'feed-001', target_type: 'feed', created_at: '2024-04-20 12:00:00' },
  { id: 'like-004', user_id: 'user-001', target_id: 'feed-002', target_type: 'feed', created_at: '2024-04-19 19:00:00' },
  { id: 'like-005', user_id: 'user-005', target_id: 'feed-003', target_type: 'feed', created_at: '2024-04-19 15:30:00' },
  { id: 'like-006', user_id: 'user-006', target_id: 'feed-004', target_type: 'feed', created_at: '2024-04-18 10:30:00' },
  { id: 'like-007', user_id: 'user-007', target_id: 'feed-005', target_type: 'feed', created_at: '2024-04-18 21:30:00' },
  { id: 'like-008', user_id: 'user-008', target_id: 'feed-006', target_type: 'feed', created_at: '2024-04-17 13:30:00' },
  { id: 'like-009', user_id: 'user-001', target_id: 'comment-001', target_type: 'comment', created_at: '2024-04-20 11:30:00' },
  { id: 'like-010', user_id: 'user-004', target_id: 'comment-004', target_type: 'comment', created_at: '2024-04-19 19:30:00' },
]

// ==================== 9. 收藏数据 ====================

export interface BookmarkData {
  id: string
  user_id: string
  feed_id: string
  created_at: string
}

export const mockBookmarks: BookmarkData[] = [
  { id: 'bookmark-001', user_id: 'user-002', feed_id: 'feed-001', created_at: '2024-04-20 11:30:00' },
  { id: 'bookmark-002', user_id: 'user-003', feed_id: 'feed-002', created_at: '2024-04-19 19:30:00' },
  { id: 'bookmark-003', user_id: 'user-004', feed_id: 'feed-003', created_at: '2024-04-19 15:30:00' },
  { id: 'bookmark-004', user_id: 'user-001', feed_id: 'feed-004', created_at: '2024-04-18 10:30:00' },
  { id: 'bookmark-005', user_id: 'user-005', feed_id: 'feed-006', created_at: '2024-04-17 13:30:00' },
]

// ==================== 10. 积分数据 ====================

export interface UserPointsData {
  id: string
  user_id: string
  points: number
  consecutive_days: number
  last_check_in: string | null
}

export const mockUserPoints: UserPointsData[] = [
  { id: 'points-001', user_id: 'user-001', points: 2580, consecutive_days: 15, last_check_in: '2024-04-20' },
  { id: 'points-002', user_id: 'user-002', points: 4560, consecutive_days: 30, last_check_in: '2024-04-20' },
  { id: 'points-003', user_id: 'user-003', points: 890, consecutive_days: 5, last_check_in: '2024-04-19' },
  { id: 'points-004', user_id: 'user-004', points: 3450, consecutive_days: 20, last_check_in: '2024-04-20' },
  { id: 'points-005', user_id: 'user-005', points: 1230, consecutive_days: 10, last_check_in: '2024-04-18' },
]

// ==================== 11. 钱包数据 ====================

export interface WalletData {
  id: string
  user_id: string
  balance: number
}

export const mockWallets: WalletData[] = [
  { id: 'wallet-001', user_id: 'user-001', balance: 128.50 },
  { id: 'wallet-002', user_id: 'user-002', balance: 2560.80 },
  { id: 'wallet-003', user_id: 'user-003', balance: 89.60 },
  { id: 'wallet-004', user_id: 'user-004', balance: 567.30 },
  { id: 'wallet-005', user_id: 'user-005', balance: 234.90 },
]
