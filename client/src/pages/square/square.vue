<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="广场" :show-back="false" />

    <!-- 话题标签 -->
    <view class="topic-section">
      <text class="section-title">热门话题</text>
      <scroll-view scroll-x class="topic-scroll" :show-scrollbar="false">
        <view class="topic-list">
          <view
            v-for="topic in hotTopics"
            :key="topic.id"
            class="topic-item"
            :style="{ backgroundColor: topic.bgColor || '#FFE4E1' }"
            @click="onTopicClick(topic)"
          >
            <text class="topic-name">#{{ topic.name }}</text>
            <text class="topic-count">{{ formatCount(topic.count) }} 参与</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 动态列表 -->
    <view class="feed-section">
      <text class="section-title">最新动态</text>
      <view class="feed-list">
        <FeedCard
          v-for="item in feedList"
          :key="item.id"
          :data="item"
          @avatar-click="onUserClick"
          @image-click="onImageClick"
          @like="onLike"
          @comment="onComment"
          @share="onShare"
        />
      </view>

      <!-- 加载状态 -->
      <view class="load-more">
        <AppLoading v-if="loading" type="spinner" size="32rpx" />
        <text v-else-if="!hasMore && feedList.length > 0" class="no-more">没有更多动态了</text>
      </view>
    </view>

    <!-- 发布按钮 -->
    <view class="publish-btn" @click="onPublish">
      <AppIcon name="plus" size="48rpx" color="#fff" />
    </view>
  </view>
</template>

<script setup lang="ts">
import AppIcon from "../../components/AppIcon.vue"
import AppLoading from "../../components/AppLoading.vue"
import { ref, onMounted } from 'vue'
import { onReachBottom } from '@dcloudio/uni-app'
import CustomNavbar from '../../components/CustomNavbar.vue'
import FeedCard from '../../components/FeedCard.vue'
import { useSystemInfo, showToast } from '../../utils/uniapi'
import { getFeedList } from '../../api/content'
import { getTopicList } from '../../api/topic'
import type { FeedItem } from '../../types'
import type { Topic } from '../../api/topic'

const { navbarHeight } = useSystemInfo()

// 热门话题
const hotTopics = ref<Topic[]>([])

// 动态列表
const feedList = ref<FeedItem[]>([])
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const hasMore = ref(true)

// 格式化数字
const formatCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}

// 获取话题列表
const fetchTopics = async () => {
  try {
    const res = await getTopicList({ page: 1, pageSize: 10, sort: 'hot' })
    if (res.code === 0 && res.data) {
      hotTopics.value = res.data.list.slice(0, 8)
    }
  } catch (error) {
    console.error('获取话题失败', error)
  }
}

// 获取动态列表
const fetchFeeds = async (isRefresh = false) => {
  if (loading.value || !hasMore.value) return

  loading.value = true

  try {
    if (isRefresh) {
      page.value = 1
      feedList.value = []
    }

    const res = await getFeedList({
      page: page.value,
      pageSize: pageSize.value,
      type: 'recent'
    })

    if (res.code === 0 && res.data) {
      const { list, hasMore: more } = res.data

      // 转换数据格式
      const feeds: FeedItem[] = list.map(f => ({
        id: f.id,
        user: {
          id: f.user.id,
          name: f.user.name,
          avatar: f.user.avatar,
        },
        content: f.content,
        images: f.images || [],
        topics: f.topics || [],
        location: f.location,
        views: f.views || 0,
        likes: f.likes || 0,
        comments: f.comments || 0,
        shares: f.shares || 0,
        isLiked: f.isLiked || false,
        createdAt: formatTime(f.createdAt),
      }))

      feedList.value.push(...feeds)
      hasMore.value = more
      page.value++
    }
  } catch (error) {
    console.error('获取动态失败', error)
    showToast('加载失败，请重试')
  } finally {
    loading.value = false
  }
}

// 格式化时间
const formatTime = (time: string): string => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`

  return date.toLocaleDateString('zh-CN')
}

// 话题点击
const onTopicClick = (topic: Topic) => {
  uni.navigateTo({
    url: `/pages/topic/topic?id=${topic.name}`,
  })
}

// 用户点击
const onUserClick = (userId: string) => {
  uni.navigateTo({
    url: `/pages/user/user?id=${userId}`,
  })
}

// 图片点击
const onImageClick = (images: string[], index: number) => {
  uni.previewImage({
    urls: images,
    current: images[index],
  })
}

// 点赞
const onLike = async (id: string) => {
  const feed = feedList.value.find(item => item.id === id)
  if (!feed) return

  try {
    const res = await toggleLike('feed', id)
    if (res.code === 0 && res.data) {
      feed.isLiked = res.data.isLiked
      feed.likes = res.data.likes
    }
  } catch (error) {
    console.error('点赞失败', error)
  }
}

// 评论
const onComment = (id: string) => {
  uni.navigateTo({
    url: `/pages/comment/comment?id=${id}`,
  })
}

// 分享
const onShare = (id: string) => {
  const feed = feedList.value.find(item => item.id === id)
  if (!feed) return

  // #ifdef APP-PLUS
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    title: feed.content.slice(0, 50) || '精彩作品分享',
    summary: `来自 ${feed.user.name} 的作品`,
    imageUrl: feed.images[0]?.url || '',
    href: `https://your-domain.com/detail/${id}`,
    success: () => {
      showToast('分享成功', 'success')
    },
    fail: () => {
      showToast('分享失败')
    },
  })
  // #endif

  // #ifdef MP-WEIXIN
  uni.showShareMenu({
    withShareTicket: true,
  })
  // #endif

  // #ifdef H5
  uni.setClipboardData({
    data: `https://your-domain.com/detail/${id}`,
    success: () => {
      showToast('链接已复制，快去分享吧', 'success')
    },
  })
  // #endif
}

// 发布
const onPublish = () => {
  uni.switchTab({
    url: '/pages/topic/topic',
  })
}

onMounted(() => {
  fetchTopics()
  fetchFeeds()
})

onReachBottom(() => {
  fetchFeeds()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
  overflow-x: hidden;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  padding: 30rpx;
  display: block;
}

.topic-section {
  background: #fff;
  margin-bottom: 20rpx;
}

.topic-scroll {
  white-space: nowrap;
  padding-bottom: 30rpx;
  width: 100vw;
  box-sizing: border-box;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.topic-list {
  display: inline-flex;
  padding-left: 20rpx;
  box-sizing: border-box;
}

.topic-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 40rpx;
  margin-right: 20rpx;
  border-radius: 16rpx;
  min-width: 180rpx;
}

.topic-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.topic-count {
  font-size: 22rpx;
  color: #666;
}

.feed-section {
  padding: 0 20rpx;
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;

  .no-more {
    font-size: 26rpx;
    color: #999;
  }
}

.publish-btn {
  position: fixed;
  right: 30rpx;
  bottom: 180rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
  z-index: 100;

  &:active {
    transform: scale(0.95);
  }
}
</style>
