<template>
  <view class="page-container">
    <!-- 搜索栏 -->
    <view class="search-header" :style="headerStyle">
      <view class="search-box">
        <AppIcon name="search" size="32rpx" color="#999" />
        <input
          v-model="keyword"
          class="search-input"
          type="text"
          placeholder="搜索用户、内容、话题"
          confirm-type="search"
          @confirm="onSearch"
          @input="onInput"
          focus
        />
        <AppIcon
          v-if="keyword"
          name="clear"
          size="32rpx"
          color="#999"
          @click="clearSearch"
        />
      </view>
      <text class="cancel-btn" @click="onCancel">取消</text>
    </view>

    <!-- 搜索建议 -->
    <view v-if="showSuggestions && suggestions.length > 0" class="suggestions">
      <view
        v-for="(item, index) in suggestions"
        :key="index"
        class="suggestion-item"
        @click="selectSuggestion(item)"
      >
        <AppIcon name="search" size="32rpx" color="#ccc" />
        <text class="suggestion-text" v-html="highlightKeyword(item)"></text>
      </view>
    </view>

    <!-- 历史记录 -->
    <view v-else-if="!hasSearch && history.length > 0" class="history-section">
      <view class="section-header">
        <text class="section-title">历史搜索</text>
        <AppIcon name="delete-o" size="36rpx" color="#999" @click="clearHistory" />
      </view>
      <view class="history-list">
        <text
          v-for="(item, index) in history"
          :key="index"
          class="history-tag"
          @click="quickSearch(item)"
        >
          {{ item }}
        </text>
      </view>
    </view>

    <!-- 热门搜索 -->
    <view v-if="!hasSearch" class="hot-section">
      <view class="section-header">
        <text class="section-title">热门搜索</text>
        <view class="refresh-btn" @click="refreshHotSearch">
          <AppIcon name="clock-o" size="28rpx" color="#999" />
          <text>换一批</text>
        </view>
      </view>
      <view class="hot-list">
        <view
          v-for="(item, index) in hotSearch"
          :key="index"
          class="hot-item"
          @click="quickSearch(item.keyword)"
        >
          <text class="hot-rank" :class="{ top: index < 3 }">{{ index + 1 }}</text>
          <text class="hot-keyword">{{ item.keyword }}</text>
          <text v-if="item.isHot" class="hot-tag">热</text>
        </view>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view v-if="hasSearch" class="result-section" :style="resultSectionStyle">
      <!-- 筛选标签 -->
      <view class="filter-tabs">
        <text
          v-for="(tab, index) in tabs"
          :key="index"
          class="filter-tab"
          :class="{ active: currentTab === index }"
          @click="switchTab(index)"
        >
          {{ tab }}
        </text>
      </view>

      <!-- 结果列表 -->
      <scroll-view
        scroll-y
        class="result-scroll"
        @scrolltolower="loadMore"
      >
        <!-- 综合/内容结果 -->
        <view v-if="currentTab === 0 || currentTab === 1" class="content-results">
          <WaterfallList :list="contentResults" @item-click="onItemClick" />
        </view>

        <!-- 用户结果 -->
        <view v-if="currentTab === 2" class="user-results">
          <view
            v-for="(user, index) in userResults"
            :key="index"
            class="user-item"
            @click="goToUser(user.id)"
          >
            <image class="user-avatar" :src="user.avatar" mode="aspectFill" />
            <view class="user-info">
              <text class="user-name">{{ user.name }}</text>
              <text class="user-desc">{{ user.description }}</text>
            </view>
            <button
              class="follow-btn"
              :class="{ following: user.isFollowing }"
              @click.stop="handleToggleFollow(user)"
            >
              {{ user.isFollowing ? '已关注' : '关注' }}
            </button>
          </view>
        </view>

        <!-- 话题结果 -->
        <view v-if="currentTab === 3" class="topic-results">
          <view
            v-for="(topic, index) in topicResults"
            :key="index"
            class="topic-item"
            @click="goToTopic(topic.name)"
          >
            <image class="topic-cover" :src="topic.cover" mode="aspectFill" />
            <view class="topic-info">
              <text class="topic-name">#{{ topic.name }}</text>
              <text class="topic-count">{{ topic.count }} 篇内容</text>
            </view>
            <AppIcon name="arrow" size="32rpx" color="#ccc" />
          </view>
        </view>

        <!-- 加载状态 -->
        <view class="load-status">
          <AppLoading v-if="loading" type="spinner" size="32rpx" />
          <text v-else-if="!hasMore" class="no-more">没有更多了</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppLoading from "../../components/AppLoading.vue"
import AppIcon from "../../components/AppIcon.vue"
import { ref, computed, onMounted } from 'vue'
import WaterfallList from '../../components/WaterfallList.vue'
import { useSystemInfo, showToast } from '../../utils/uniapi'
import { getHotSearch, getSearchSuggestions, search } from '../../api/content'
import { toggleFollow } from '../../api/social'
import type { WaterfallItem } from '../../types'
import type { PaginationParams } from '../../types/user'

interface HotItem {
  keyword: string
  isHot: boolean
}

interface UserResult {
  id: string
  name: string
  avatar: string
  description: string
  isFollowing: boolean
}

interface TopicResult {
  name: string
  cover: string
  count: number
}

const keyword = ref('')
const hasSearch = ref(false)
const showSuggestions = ref(false)
const loading = ref(false)
const hasMore = ref(true)
const currentTab = ref(0)
const tabs = ['综合', '内容', '用户', '话题']
const page = ref(1)
const pageSize = ref(20)

// 本地存储 key
const SEARCH_HISTORY_KEY = 'looker_search_history'
const MAX_HISTORY_COUNT = 20

// 获取系统信息，计算状态栏高度
const { statusBarHeight } = useSystemInfo()

// 搜索头部样式（添加状态栏高度）
const headerStyle = computed(() => ({
  paddingTop: `${statusBarHeight}px`
}))

// 搜索结果区域高度（减去搜索头部高度）
const resultSectionStyle = computed(() => ({
  height: `calc(100vh - ${statusBarHeight + 44}px)`
}))

// 历史记录
const history = ref<string[]>([])

// 热门搜索
const hotSearch = ref<HotItem[]>([])

// 搜索建议
const suggestions = ref<string[]>([])

// 搜索结果
const contentResults = ref<WaterfallItem[]>([])
const userResults = ref<UserResult[]>([])
const topicResults = ref<TopicResult[]>([])

// 获取热门搜索
const fetchHotSearch = async () => {
  try {
    const res = await getHotSearch()
    if (res.code === 0 && res.data) {
      hotSearch.value = res.data.map((keyword: string, index: number) => ({
        keyword,
        isHot: index < 3,
      }))
    }
  } catch (error) {
    console.error('获取热门搜索失败', error)
  }
}

// 换一批热门搜索
const refreshHotSearch = () => {
  fetchHotSearch()
}

// 加载历史记录
onMounted(() => {
  loadSearchHistory()
})

const loadSearchHistory = () => {
  try {
    const stored = uni.getStorageSync(SEARCH_HISTORY_KEY)
    if (stored) {
      history.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
  }
}

const saveSearchHistory = () => {
  try {
    uni.setStorageSync(SEARCH_HISTORY_KEY, JSON.stringify(history.value))
  } catch (error) {
    console.error('保存搜索历史失败:', error)
  }
}

// 刷新热门搜索
const refreshHotSearch = () => {
  fetchHotSearch()
}

let searchTimer: NodeJS.Timeout | null = null

const onInput = () => {
  if (searchTimer) clearTimeout(searchTimer)

  if (!keyword.value.trim()) {
    showSuggestions.value = false
    return
  }

  searchTimer = setTimeout(async () => {
    try {
      const res = await getSearchSuggestions(keyword.value)
      if (res.code === 0 && res.data) {
        suggestions.value = res.data
        showSuggestions.value = true
      }
    } catch (error) {
      console.error('获取搜索建议失败', error)
    }
  }, 300)
}

const highlightKeyword = (text: string) => {
  return text.replace(
    new RegExp(keyword.value, 'gi'),
    match => `<text style="color: #ff6b6b">${match}</text>`
  )
}

const selectSuggestion = (item: string) => {
  keyword.value = item
  showSuggestions.value = false
  onSearch()
}

const onSearch = async () => {
  if (!keyword.value.trim()) return

  hasSearch.value = true
  showSuggestions.value = false
  loading.value = true

  // 保存到历史记录
  const index = history.value.indexOf(keyword.value)
  if (index > -1) {
    history.value.splice(index, 1)
  }
  history.value.unshift(keyword.value)
  if (history.value.length > MAX_HISTORY_COUNT) {
    history.value = history.value.slice(0, MAX_HISTORY_COUNT)
  }
  saveSearchHistory()

  try {
    const res = await search({ keyword: keyword.value, page: 1, pageSize: 20 })
    if (res.code === 0 && res.data) {
      // 处理搜索结果
      contentResults.value = res.data.list
        .filter(item => item.type === 'post')
        .map(item => ({
          id: item.id,
          url: item.image || '',
          title: item.title,
          user: { id: '', name: '', avatar: '' },
          likes: 0,
        }))

      userResults.value = res.data.list
        .filter(item => item.type === 'user')
        .map(item => ({
          id: item.id,
          name: item.title,
          avatar: item.image || '',
          description: item.subtitle || '',
          isFollowing: false,
        }))

      topicResults.value = res.data.list
        .filter(item => item.type === 'topic')
        .map(item => ({
          name: item.title.replace(/^#/, ''),
          cover: item.image || '',
          count: parseInt(item.subtitle?.match(/\d+/)?.[0] || '0'),
        }))

      hasMore.value = res.data.hasMore
    }
  } catch (error) {
    console.error('搜索失败', error)
    showToast('搜索失败')
  } finally {
    loading.value = false
  }
}

const clearSearch = () => {
  keyword.value = ''
  hasSearch.value = false
  showSuggestions.value = false
}

const onCancel = () => {
  uni.navigateBack()
}

const clearHistory = () => {
  uni.showModal({
    title: '提示',
    content: '确定清空搜索历史？',
    success: (res) => {
      if (res.confirm) {
        history.value = []
        saveSearchHistory()
      }
    },
  })
}

const quickSearch = (item: string) => {
  keyword.value = item
  onSearch()
}

const switchTab = (index: number) => {
  currentTab.value = index
}

const onItemClick = (item: WaterfallItem) => {
  uni.navigateTo({
    url: `/pages/detail/detail?id=${item.id}`,
  })
}

const goToUser = (id: string) => {
  uni.navigateTo({
    url: `/pages/user/user?id=${id}`,
  })
}

const handleToggleFollow = async (user: UserResult) => {
  try {
    const res = await toggleFollow(user.id)
    if (res.code === 0 && res.data) {
      user.isFollowing = res.data.isFollowing
      showToast(user.isFollowing ? '关注成功' : '已取消关注')
    }
  } catch (error) {
    console.error('关注操作失败', error)
    showToast('操作失败')
  }
}

const goToTopic = (name: string) => {
  uni.navigateTo({
    url: `/pages/topic/topic?name=${name}`,
  })
}

const loadMore = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true

  try {
    const res = await search({ keyword: keyword.value, page: page.value, pageSize: 20 })
    if (res.code === 0 && res.data) {
      const newItems = res.data.list
        .filter(item => item.type === 'post')
        .map(item => ({
          id: item.id,
          url: item.image || '',
          title: item.title,
          user: { id: '', name: '', avatar: '' },
          likes: 0,
        }))

      contentResults.value.push(...newItems)
      hasMore.value = res.data.hasMore
      page.value++
    }
  } catch (error) {
    console.error('加载更多失败', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.search-header {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.search-box {
  flex: 1;
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

.cancel-btn {
  font-size: 30rpx;
  color: #666;
  margin-left: 30rpx;
}

.suggestions {
  background: #fff;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:active {
    background: #f9f9f9;
  }
}

.suggestion-text {
  margin-left: 20rpx;
  font-size: 30rpx;
  color: #333;
}

.history-section,
.hot-section {
  background: #fff;
  margin-bottom: 20rpx;
  padding: 30rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;

  text {
    font-size: 26rpx;
    color: #999;
  }
}

.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.history-tag {
  font-size: 28rpx;
  color: #666;
  background: #f5f5f5;
  padding: 16rpx 30rpx;
  border-radius: 30rpx;
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.hot-item {
  display: flex;
  align-items: center;
}

.hot-rank {
  width: 48rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #999;

  &.top {
    color: #ff6b6b;
  }
}

.hot-keyword {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.hot-tag {
  font-size: 22rpx;
  color: #fff;
  background: #ff6b6b;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.filter-tabs {
  display: flex;
  background: #fff;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-tab {
  font-size: 30rpx;
  color: #666;
  padding: 30rpx 40rpx;
  position: relative;

  &.active {
    color: #ff6b6b;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 4rpx;
      background: #ff6b6b;
      border-radius: 2rpx;
    }
  }
}

.result-scroll {
  height: calc(100% - 100rpx);
}

.content-results {
  padding: 20rpx 0;
}

.user-results,
.topic-results {
  background: #fff;
}

.user-item,
.topic-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:active {
    background: #f9f9f9;
  }
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}

.user-info {
  flex: 1;

  .user-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    display: block;
    margin-bottom: 8rpx;
  }

  .user-desc {
    font-size: 26rpx;
    color: #999;
  }
}

.follow-btn {
  font-size: 28rpx;
  color: #fff;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  padding: 12rpx 36rpx;
  border-radius: 30rpx;
  line-height: 1;

  &.following {
    background: #f0f0f0;
    color: #666;
  }

  &::after {
    display: none;
  }
}

.topic-cover {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  margin-right: 24rpx;
}

.topic-info {
  flex: 1;

  .topic-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    display: block;
    margin-bottom: 12rpx;
  }

  .topic-count {
    font-size: 26rpx;
    color: #999;
  }
}

.load-status {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.no-more {
  font-size: 26rpx;
  color: #999;
}
</style>
