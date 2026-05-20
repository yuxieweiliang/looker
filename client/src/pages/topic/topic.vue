<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="话题">
      <template #right>
        <view class="create-btn" @click="goToTopicCreate">
          <AppIcon name="plus" size="44rpx" color="#333" />
        </view>
      </template>
    </CustomNavbar>

    <!-- 内容区域 -->
    <scroll-view
      scroll-y
      class="content-scroll"
      :style="scrollStyle"
      @scrolltolower="onLoadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 分类标签 -->
      <scroll-view scroll-x class="category-scroll" :show-scrollbar="false">
        <view class="category-list">
          <view
            v-for="(cat, index) in categories"
            :key="index"
            class="category-item"
            :class="{ active: currentCategory === index }"
            @click="onCategoryClick(index)"
          >
            <text class="category-name">{{ cat.name }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- 筛选标签 -->
      <view class="filter-tabs">
        <text
          v-for="(tab, index) in filterTabs"
          :key="index"
          class="filter-tab"
          :class="{ active: currentFilter === index }"
          @click="onFilterClick(index)"
        >
          {{ tab }}
        </text>
      </view>

      <!-- 话题列表 -->
      <view class="topics-section">
        <view class="topics-list" v-if="topicList.length > 0">
          <view
            v-for="topic in topicList"
            :key="topic.id"
            class="topic-item"
            @click="goToTopicDetail(topic)"
          >
            <image v-if="topic.cover" class="topic-cover" :src="topic.cover" mode="aspectFill" />
            <view class="topic-content">
              <view class="topic-header">
                <text class="topic-name">#{{ topic.name }}</text>
                <view v-if="topic.isFollowed" class="followed-tag">
                  <text>已关注</text>
                </view>
              </view>
              <text class="topic-desc">{{ topic.description }}</text>
              <view class="topic-meta">
                <text class="topic-count">{{ topic.count }} 动态</text>
                <text class="topic-category">{{ topic.category }}</text>
              </view>
            </view>
          </view>
        </view>
        <view v-else class="empty-state">
          <text>暂无话题</text>
        </view>

        <!-- 加载状态 -->
        <view class="load-more">
          <AppLoading v-if="loading" type="spinner" size="32rpx" />
          <text v-else-if="!hasMore && topicList.length > 0" class="no-more">没有更多了</text>
        </view>
      </view>
    </scroll-view>

    <!-- 发布入口 -->
    <view class="publish-fab" @click="goToPublish">
      <AppIcon name="edit" size="48rpx" color="#fff" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSystemInfo } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import AppLoading from '../../components/AppLoading.vue'
import AppIcon from '../../components/AppIcon.vue'

const { navbarHeight } = useSystemInfo()

interface TopicItem {
  id: string
  name: string
  cover?: string
  description: string
  count: number
  category: string
  isFollowed: boolean
}

// 分类数据
const categories = ref([
  { id: '1', name: '推荐' },
  { id: '2', name: '风景' },
  { id: '3', name: '美食' },
  { id: '4', name: '人像' },
  { id: '5', name: '萌宠' },
  { id: '6', name: '旅行' },
  { id: '7', name: '街拍' },
  { id: '8', name: '建筑' },
])

// 筛选标签
const filterTabs = ['热门', '最新', '关注']
const currentCategory = ref(0)
const currentFilter = ref(0)

// 话题列表数据
const topicList = ref<TopicItem[]>([])
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const page = ref(1)

// 滚动区域样式
const scrollStyle = computed(() => ({
  height: 'calc(100vh - 88rpx - env(safe-area-inset-top))'
}))

// 获取话题列表数据
const fetchTopics = async (isRefresh = false) => {
  if (loading.value) return
  loading.value = true

  try {
    // 模拟数据
    const mockTopics: TopicItem[] = [
      { id: '1', name: '春日摄影', cover: 'https://picsum.photos/200/200?random=topic1', description: '记录春天的美好瞬间', count: 2341, category: '风景', isFollowed: false },
      { id: '2', name: '美食探店', cover: 'https://picsum.photos/200/200?random=topic2', description: '发现身边的美味', count: 1856, category: '美食', isFollowed: true },
      { id: '3', name: '旅行日记', cover: 'https://picsum.photos/200/200?random=topic3', description: '分享旅途风景', count: 3421, category: '旅行', isFollowed: false },
      { id: '4', name: '萌宠日常', cover: 'https://picsum.photos/200/200?random=topic4', description: '铲屎官的日常', count: 4523, category: '萌宠', isFollowed: false },
      { id: '5', name: '穿搭分享', cover: 'https://picsum.photos/200/200?random=topic5', description: '每日穿搭灵感', count: 2134, category: '时尚', isFollowed: true },
      { id: '6', name: '生活记录', cover: 'https://picsum.photos/200/200?random=topic6', description: '记录生活点滴', count: 1876, category: '生活', isFollowed: false },
      { id: '7', name: '人像摄影', cover: 'https://picsum.photos/200/200?random=topic7', description: '人像摄影技巧分享', count: 1280, category: '摄影', isFollowed: false },
      { id: '8', name: '街拍摄影', cover: 'https://picsum.photos/200/200?random=topic8', description: '街头人文纪实', count: 980, category: '摄影', isFollowed: false },
    ]

    if (isRefresh) {
      topicList.value = mockTopics
    } else {
      topicList.value.push(...mockTopics)
    }

    page.value++
    hasMore.value = page.value <= 3 // 模拟3页数据
  } catch (err) {
    console.error('获取话题列表失败', err)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  page.value = 1
  fetchTopics(true)
}

// 上拉加载
const onLoadMore = () => {
  if (!hasMore.value || loading.value) return
  fetchTopics()
}

// 分类点击
const onCategoryClick = (index: number) => {
  currentCategory.value = index
  page.value = 1
  topicList.value = []
  fetchTopics(true)
}

// 筛选切换
const onFilterClick = (index: number) => {
  currentFilter.value = index
  page.value = 1
  topicList.value = []
  fetchTopics(true)
}

// 话题点击 - 跳转到话题详情
const goToTopicDetail = (topic: TopicItem) => {
  uni.navigateTo({
    url: `/pages/detail/detail?id=${topic.id}&type=topic`,
  })
}

// 跳转创建话题
const goToTopicCreate = () => {
  uni.navigateTo({
    url: '/pages/topic/topic-create'
  })
}

// 跳转发布页面
const goToPublish = () => {
  uni.navigateTo({
    url: '/pages/topic/publish'
  })
}

onMounted(() => {
  fetchTopics()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.create-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
}

.content-scroll {
  box-sizing: border-box;
}

// 分类
.category-scroll {
  white-space: nowrap;
  padding: 20rpx 0;
  background: #fff;
}

.category-list {
  display: flex;
  padding: 0 20rpx;
}

.category-item {
  padding: 16rpx 32rpx;
  border-radius: 32rpx;
  margin-right: 16rpx;
  transition: all 0.3s ease;
  background: #f5f5f5;

  &.active {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
    color: #fff;
    font-weight: 600;
  }

  .category-name {
    font-size: 28rpx;
    color: #666;
  }

  &.active .category-name {
    color: #fff;
  }
}

// 筛选标签
.filter-tabs {
  display: flex;
  background: #fff;
  padding: 20rpx 30rpx;
  gap: 20rpx;
}

.filter-tab {
  font-size: 28rpx;
  color: #999;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  transition: all 0.3s ease;

  &.active {
    background: rgba(255, 107, 107, 0.1);
    color: #ff6b6b;
    font-weight: 600;
  }
}

// 话题列表
.topics-section {
  padding: 20rpx;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.topic-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.topic-cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.topic-content {
  flex: 1;
  margin-left: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.topic-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topic-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.followed-tag {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
}

.topic-desc {
  font-size: 26rpx;
  color: #666;
  margin-top: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.topic-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 16rpx;
}

.topic-count {
  font-size: 24rpx;
  color: #999;
}

.topic-category {
  font-size: 22rpx;
  color: #fff;
  background: rgba(255, 107, 107, 0.6);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

// 空状态
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;

  text {
    font-size: 28rpx;
    color: #999;
  }
}

// 加载更多
.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.no-more {
  font-size: 26rpx;
  color: #999;
}

// 发布悬浮按钮
.publish-fab {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.4);
  z-index: 100;
}
</style>