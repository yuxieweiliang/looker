<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="选择话题" show-back>
      <template #right>
        <text class="add-btn" @click="() => goToCreateTopic()">添加</text>
      </template>
    </CustomNavbar>

    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-box">
        <AppIcon name="search" size="32rpx" color="#999" />
        <input
          v-model="searchKey"
          class="search-input"
          type="text"
          placeholder="搜索话题"
          confirm-type="search"
          @confirm="onSearch"
        />
        <AppIcon
          v-if="searchKey"
          name="cross"
          size="28rpx"
          color="#999"
          @click="clearSearch"
        />
      </view>
    </view>

    <!-- 已选话题 -->
    <view v-if="selectedTopics.length > 0" class="selected-section">
      <text class="section-title">已选择</text>
      <view class="selected-list">
        <view
          v-for="(topic, index) in selectedTopics"
          :key="'selected-' + index"
          class="selected-tag"
          @click="toggleTopic(topic)"
        >
          <image v-if="topic.cover" class="tag-cover" :src="topic.cover" mode="aspectFill" />
          <text>#{{ topic.name }}</text>
          <AppIcon name="cross" size="16rpx" color="#fff" />
        </view>
      </view>
    </view>

    <!-- 话题列表 -->
    <scroll-view scroll-y class="topic-scroll" @scrolltolower="loadMore">
      <view v-if="filteredTopics.length > 0" class="topic-list">
        <view
          v-for="topic in filteredTopics"
          :key="topic.id"
          class="topic-item"
          :class="{ selected: isSelected(topic) }"
          @click="toggleTopic(topic)"
        >
          <image class="topic-cover" :src="topic.cover || defaultCover" mode="aspectFill" />
          <view class="topic-info">
            <text class="topic-name">#{{ topic.name }}</text>
            <text class="topic-desc">{{ topic.description || topic.category || '热门话题' }}</text>
            <text class="topic-count">{{ formatCount(topic.count) }} 参与</text>
          </view>
          <view class="check-icon" v-if="isSelected(topic)">
            <AppIcon name="check" size="32rpx" color="#ff6b6b" />
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!loading" class="empty-state">
        <AppIcon name="search" size="80rpx" color="#ddd" />
        <text class="empty-text">未找到相关话题</text>
        <view class="create-entry" @click="goToCreateTopic(searchKey)">
          <AppIcon name="plus" size="32rpx" color="#ff6b6b" />
          <text>创建话题 "{{ searchKey }}"</text>
        </view>
      </view>

      <!-- 加载状态 -->
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>
    </scroll-view>

    <!-- 底部确认栏 -->
    <view class="bottom-bar">
      <text class="selected-count">已选择 {{ selectedTopics.length }} 个</text>
      <button class="confirm-btn" @click="confirmSelect">确定</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import AppIcon from '../../components/AppIcon.vue'
import CustomNavbar from '../../components/CustomNavbar.vue'
import { useSystemInfo } from '../../utils/uniapi'
import { getTopicList } from '../../api/topic'
import type { Topic } from '../../api/topic'

const { navbarHeight } = useSystemInfo()

// 默认封面图
const defaultCover = 'https://picsum.photos/200/200?random=default'

// 搜索关键词
const searchKey = ref('')

// 话题列表
const allTopics = ref<Topic[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)

// 已选择的话题
const selectedTopics = ref<Topic[]>([])

// 过滤后的话题列表
const filteredTopics = computed(() => {
  if (!searchKey.value.trim()) return allTopics.value
  const key = searchKey.value.toLowerCase()
  return allTopics.value.filter(topic =>
    topic.name.toLowerCase().includes(key) ||
    (topic.description && topic.description.toLowerCase().includes(key))
  )
})

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

// 页面加载时获取已选择的话题
onLoad((options: any) => {
  if (options && options.selected) {
    try {
      const selected = JSON.parse(decodeURIComponent(options.selected))
      if (Array.isArray(selected)) {
        selectedTopics.value = selected
      }
    } catch (e) {
      console.error('解析已选话题失败', e)
    }
  }

  // 加载话题列表
  fetchTopics()
})

// 获取话题列表
const fetchTopics = async (isRefresh = false) => {
  if (loading.value || !hasMore.value) return

  loading.value = true

  try {
    if (isRefresh) {
      page.value = 1
      allTopics.value = []
    }

    const res = await getTopicList({
      page: page.value,
      pageSize: pageSize.value,
      sort: 'hot'
    })

    if (res.code === 0 && res.data) {
      const { list, hasMore: more } = res.data
      allTopics.value.push(...list)
      hasMore.value = more
      page.value++
    }
  } catch (error) {
    console.error('获取话题失败', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 搜索
const onSearch = () => {
  // 搜索逻辑在 computed 中自动处理
  console.log('搜索:', searchKey.value)
}

// 清空搜索
const clearSearch = () => {
  searchKey.value = ''
}

// 判断是否已选择
const isSelected = (topic: Topic) => {
  return selectedTopics.value.some(item => item.id === topic.id)
}

// 切换选择状态
const toggleTopic = (topic: Topic) => {
  const index = selectedTopics.value.findIndex(item => item.id === topic.id)
  if (index > -1) {
    selectedTopics.value.splice(index, 1)
  } else {
    selectedTopics.value.push(topic)
  }
}

// 跳转到创建话题页面
const goToCreateTopic = (name?: string) => {
  const nameParam = name || searchKey.value || ''
  uni.navigateTo({
    url: `/pages/topic/topic-create?name=${encodeURIComponent(nameParam)}`
  })
}

// 确认选择
const confirmSelect = () => {
  const pages = getCurrentPages()
  const prevPage = pages[pages.length - 2]

  if (prevPage) {
    const eventChannel = (prevPage as any).getOpenerEventChannel && (prevPage as any).getOpenerEventChannel()
    if (eventChannel) {
      eventChannel.emit('selectedTopics', { topics: selectedTopics.value })
    }
  }

  uni.navigateBack()
}

// 加载更多
const loadMore = () => {
  fetchTopics()
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.add-btn {
  font-size: 30rpx;
  color: #ff6b6b;
  padding: 10rpx 20rpx;
}

.search-section {
  background: #fff;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 36rpx;
  padding: 16rpx 30rpx;
}

.search-input {
  flex: 1;
  margin: 0 20rpx;
  font-size: 30rpx;
}

.selected-section {
  background: #fff;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;

  .section-title {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 20rpx;
    display: block;
  }
}

.selected-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.selected-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #ff6b6b;
  color: #fff;
  padding: 12rpx 20rpx;
  border-radius: 30rpx;
  font-size: 26rpx;

  .tag-cover {
    width: 28rpx;
    height: 28rpx;
    border-radius: 50%;
  }
}

.topic-scroll {
  height: calc(100vh - 200rpx - v-bind(navbarHeight + 'px'));
}

.topic-list {
  padding: 20rpx;
}

.topic-item {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border: 2rpx solid transparent;

  &.selected {
    border-color: #ff6b6b;
    background: rgba(255, 107, 107, 0.05);
  }
}

.topic-cover {
  width: 100rpx;
  height: 100rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
}

.topic-info {
  flex: 1;

  .topic-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    display: block;
    margin-bottom: 8rpx;
  }

  .topic-desc {
    font-size: 26rpx;
    color: #666;
    display: block;
    margin-bottom: 8rpx;
  }

  .topic-count {
    font-size: 24rpx;
    color: #999;
  }
}

.check-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 40rpx;

  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin: 30rpx 0;
  }
}

.create-entry {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #fff;
  padding: 30rpx 40rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  color: #ff6b6b;
}

.loading-state {
  text-align: center;
  padding: 40rpx;
  font-size: 26rpx;
  color: #999;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.selected-count {
  font-size: 28rpx;
  color: #666;
  flex: 1;
}

.confirm-btn {
  background-color: #ff6b6b;
  color: #fff;
  font-size: 30rpx;
  padding: 16rpx 50rpx;
  border-radius: 36rpx;
  line-height: 1;

  &::after {
    display: none;
  }
}
</style>
