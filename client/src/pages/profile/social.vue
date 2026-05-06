<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" :style="navbarStyle">
      <view class="navbar-inner" :style="innerStyle">
        <view class="back-btn" @click="onBack">
          <AppIcon name="arrow-left" size="40rpx" color="#333" />
        </view>
        <text class="navbar-title">社交</text>
        <view class="navbar-right" />
      </view>
    </view>

    <!-- Tab 切换栏 -->
    <view class="tab-bar" :style="tabBarStyle">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        class="tab-item"
        :class="{ active: currentTab === index }"
        @click="onTabClick(index)"
      >
        <text class="tab-text">{{ tab.name }}(<text class="tab-count">{{ tab.count }}</text>)</text>
      </view>
      <view class="tab-indicator" :style="indicatorStyle" />
    </view>

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
      <!-- 关注列表 -->
      <template v-if="currentTab === 0">
        <view
          v-for="(item, index) in followingList"
          :key="item.id"
          class="user-card"
          @click="onUserClick(item.id)"
        >
          <view class="user-main">
            <image class="user-avatar" :src="item.avatar" mode="aspectFill" />
            <view class="user-info">
              <text class="user-name">{{ item.name }}</text>
              <text class="user-bio">{{ item.bio || '这个人很懒，什么都没有写' }}</text>
              <view class="user-stats">
                <text class="stat-item">作品 {{ item.worksCount || 0 }}</text>
                <text class="stat-item">粉丝 {{ item.followersCount || 0 }}</text>
              </view>
            </view>
            <view
              class="follow-btn"
              :class="{ active: item.isFollowing }"
              @click.stop="onToggleFollow(item)"
            >
              {{ item.isFollowing ? '已关注' : '关注' }}
            </view>
          </view>
          <!-- 最新关注作品 -->
          <view v-if="item.recentWork" class="recent-work">
            <image class="work-thumb" :src="item.recentWork.thumb" mode="aspectFill" />
            <view class="work-info">
              <text class="work-title">{{ item.recentWork.title }}</text>
              <text class="work-time">{{ item.recentWork.time }}</text>
            </view>
          </view>
        </view>
      </template>

      <!-- 粉丝列表 -->
      <template v-if="currentTab === 1">
        <view
          v-for="(item, index) in followersList"
          :key="item.id"
          class="user-card"
          @click="onUserClick(item.id)"
        >
          <view class="user-main">
            <image class="user-avatar" :src="item.avatar" mode="aspectFill" />
            <view class="user-info">
              <text class="user-name">{{ item.name }}</text>
              <text class="user-bio">{{ item.bio || '这个人很懒，什么都没有写' }}</text>
              <view class="interaction-stats">
                <text class="interaction-item">
                  <AppIcon name="like-o" size="22rpx" color="#ff6b6b" />
                  赞过 {{ item.likeCount || 0 }} 个作品
                </text>
                <text class="interaction-item">
                  <AppIcon name="eye-o" size="22rpx" color="#5f27cd" />
                  浏览 {{ item.viewCount || 0 }} 个作品
                </text>
              </view>
            </view>
            <view
              class="follow-btn"
              :class="{ active: item.isFollowing }"
              @click.stop="onToggleFollow(item)"
            >
              {{ item.isFollowing ? '互相关注' : '回关' }}
            </view>
          </view>
        </view>
      </template>

      <!-- 获赞列表 -->
      <template v-if="currentTab === 2">
        <view
          v-for="(item, index) in likesList"
          :key="item.id"
          class="like-card"
          @click="onWorkClick(item.workId)"
        >
          <view class="liker-info">
            <image class="liker-avatar" :src="item.user.avatar" mode="aspectFill" />
            <view class="liker-meta">
              <text class="liker-name">{{ item.user.name }}</text>
              <text class="like-time">{{ item.time }}</text>
            </view>
          </view>
          <view class="liked-work">
            <image class="work-thumb" :src="item.work.thumb" mode="aspectFill" />
            <view class="work-detail">
              <text class="work-title">{{ item.work.title }}</text>
              <view class="work-stats">
                <text class="work-stat">
                  <AppIcon name="like" size="20rpx" color="#ff6b6b" />
                  {{ item.work.likes }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </template>

      <!-- 空状态 -->
      <view v-if="isEmpty && !loading" class="empty-state">
        <AppIcon :name="emptyIcon" size="120rpx" color="#ddd" />
        <text class="empty-text">{{ emptyText }}</text>
      </view>

      <!-- 加载状态 -->
      <view class="load-more">
        <AppLoading v-if="loading" type="spinner" size="32rpx" />
        <text v-else-if="!hasMore && !isEmpty" class="no-more">没有更多了</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSystemInfo, showToast } from '../../utils/uniapi'
import AppIcon from '../../components/AppIcon.vue'
import AppLoading from '../../components/AppLoading.vue'
import { getFollowingList, getFollowerList, getReceivedLikes } from '../../api/content'
import { toggleFollow } from '../../api/social'
import type { PaginationParams } from '../../types/user'

const { statusBarHeight, navContentHeight } = useSystemInfo()

// 类型定义
interface FollowingUser {
  id: string
  name: string
  avatar: string
  bio: string
  worksCount: number
  followersCount: number
  isFollowing: boolean
  recentWork?: {
    thumb: string
    title: string
    time: string
  }
}

interface FollowerUser {
  id: string
  name: string
  avatar: string
  bio: string
  likeCount: number
  viewCount: number
  isFollowing: boolean
}

interface LikeRecord {
  id: string
  user: {
    id: string
    name: string
    avatar: string
  }
  workId: string
  work: {
    thumb: string
    title: string
    likes: number
  }
  time: string
}

// 获取页面参数
const pageInstance = getCurrentPages()[getCurrentPages().length - 1] as any
const initialTab = parseInt(pageInstance?.$page?.options?.tab || '0') || 0

// Tab 配置
const tabs = ref([
  { name: '关注', key: 'following', count: 0 },
  { name: '粉丝', key: 'followers', count: 0 },
  { name: '获赞', key: 'likes', count: 0 },
])

const currentTab = ref(Math.min(Math.max(initialTab, 0), 2))

// 数据列表
const followingList = ref<FollowingUser[]>([])
const followersList = ref<FollowerUser[]>([])
const likesList = ref<LikeRecord[]>([])

// 数据状态
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(20)

// 导航栏样式
const navbarStyle = computed(() => ({
  paddingTop: `${statusBarHeight}px`,
  backgroundColor: '#fff',
}))

const innerStyle = computed(() => ({
  height: `${navContentHeight}px`,
}))

const tabBarStyle = computed(() => ({
  top: `${statusBarHeight + navContentHeight}px`,
}))

const scrollStyle = computed(() => ({
  marginTop: `${statusBarHeight + navContentHeight + 44}px`,
  height: `calc(100vh - ${statusBarHeight + navContentHeight + 44}px)`,
}))

const indicatorStyle = computed(() => ({
  transform: `translateX(${currentTab.value * 100}%)`,
}))

// 空状态判断
const isEmpty = computed(() => {
  if (currentTab.value === 0) return followingList.value.length === 0
  if (currentTab.value === 1) return followersList.value.length === 0
  return likesList.value.length === 0
})

const emptyIcon = computed(() => {
  const icons = ['user-o', 'friends-o', 'like-o']
  return icons[currentTab.value]
})

const emptyText = computed(() => {
  const texts = [
    '还没有关注任何人，去发现精彩内容吧',
    '还没有粉丝，发布优质内容吸引关注吧',
    '还没有收到赞，发布优质内容获得更多赞吧',
  ]
  return texts[currentTab.value]
})

// 获取数据
const fetchData = async (isRefresh = false) => {
  if (loading.value) return
  loading.value = true

  try {
    if (isRefresh) {
      page.value = 1
    }

    const params: PaginationParams = { page: page.value, pageSize: pageSize.value }

    if (currentTab.value === 0) {
      // 关注列表
      const res = await getFollowingList(params)
      if (res.code === 0 && res.data) {
        const list = res.data.list.map(item => ({
          id: item.id,
          name: item.name,
          avatar: item.avatar,
          bio: '',
          worksCount: 0,
          followersCount: 0,
          isFollowing: item.isFollowing,
        }))
        if (isRefresh) {
          followingList.value = list
        } else {
          followingList.value.push(...list)
        }
        hasMore.value = res.data.hasMore
        tabs.value[0].count = res.data.total
      }
    } else if (currentTab.value === 1) {
      // 粉丝列表
      const res = await getFollowerList(params)
      if (res.code === 0 && res.data) {
        const list = res.data.list.map(item => ({
          id: item.id,
          name: item.name,
          avatar: item.avatar,
          bio: '',
          likeCount: 0,
          viewCount: 0,
          isFollowing: item.isFollowing,
        }))
        if (isRefresh) {
          followersList.value = list
        } else {
          followersList.value.push(...list)
        }
        hasMore.value = res.data.hasMore
        tabs.value[1].count = res.data.total
      }
    } else {
      // 获赞列表
      const res = await getReceivedLikes(params)
      if (res.code === 0 && res.data) {
        const list = res.data.list.map(item => ({
          id: item.id,
          user: item.user,
          workId: item.workId,
          work: item.work,
          time: formatTime(item.time),
        }))
        if (isRefresh) {
          likesList.value = list
        } else {
          likesList.value.push(...list)
        }
        hasMore.value = res.data.hasMore
        tabs.value[2].count = res.data.total
      }
    }

    page.value++
  } catch (error) {
    console.error('获取数据失败', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    refreshing.value = false
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

// Tab 切换
const onTabClick = (index: number) => {
  if (currentTab.value === index) return
  currentTab.value = index
  page.value = 1
  hasMore.value = true
  followingList.value = []
  followersList.value = []
  likesList.value = []
  fetchData(true)
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  page.value = 1
  fetchData(true)
}

// 上拉加载
const onLoadMore = () => {
  if (!hasMore.value || loading.value) return
  fetchData()
}

// 返回
const onBack = () => {
  uni.navigateBack()
}

// 点击用户
const onUserClick = (userId: string) => {
  uni.navigateTo({
    url: `/pages/user/user?id=${userId}`,
  })
}

// 点击作品
const onWorkClick = (workId: string) => {
  uni.navigateTo({
    url: `/pages/detail/detail?id=${workId}`,
  })
}

// 切换关注状态
const onToggleFollow = async (item: FollowingUser | FollowerUser) => {
  try {
    const res = await toggleFollow(item.id)
    if (res.code === 0) {
      item.isFollowing = res.data.isFollowing
      showToast(item.isFollowing ? '关注成功' : '已取消关注')
    } else {
      showToast(res.message || '操作失败')
    }
  } catch (error) {
    console.error('关注操作失败', error)
    showToast('操作失败')
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

// 自定义导航栏
.custom-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
}

.back-btn {
  width: 80rpx;
  display: flex;
  align-items: center;
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.navbar-right {
  width: 80rpx;
}

// Tab 栏
.tab-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  height: 88rpx;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  position: relative;
}

.tab-text {
  font-size: 30rpx;
  color: #666;
  transition: all 0.3s ease;

  .tab-item.active & {
    color: #ff6b6b;
    font-weight: 600;
  }
}

.tab-count {
  font-size: 22rpx;
  color: #999;
  transition: all 0.3s ease;

  .tab-item.active & {
    color: #ff6b6b;
  }
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 33.33%;
  height: 4rpx;
  background: #ff6b6b;
  transition: transform 0.3s ease;
}

// 内容区域
.content-scroll {
  padding: 20rpx;
  box-sizing: border-box;
}

// 用户卡片（关注/粉丝共用）
.user-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;

  &:active {
    opacity: 0.95;
  }
}

.user-main {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.user-bio {
  font-size: 26rpx;
  color: #999;
  display: block;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-stats {
  display: flex;
  gap: 24rpx;
}

.stat-item {
  font-size: 24rpx;
  color: #666;
}

.interaction-stats {
  display: flex;
  gap: 24rpx;
}

.interaction-item {
  font-size: 24rpx;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.follow-btn {
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  font-weight: 500;
  background: #ff6b6b;
  color: #fff;
  flex-shrink: 0;

  &.active {
    background: #f0f0f0;
    color: #666;
  }

  &:active {
    opacity: 0.9;
  }
}

// 最新关注作品
.recent-work {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f5f5f5;
}

.work-thumb {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.work-info {
  flex: 1;
  min-width: 0;
}

.work-title {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.work-time {
  font-size: 24rpx;
  color: #999;
}

// 获赞卡片
.like-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;

  &:active {
    opacity: 0.95;
  }
}

.liker-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.liker-avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.liker-meta {
  flex: 1;
}

.liker-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.like-time {
  font-size: 24rpx;
  color: #999;
}

.liked-work {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
}

.work-detail {
  flex: 1;
  min-width: 0;
}

.work-stats {
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
}

.work-stat {
  font-size: 24rpx;
  color: #999;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 60rpx;
}

.empty-text {
  margin-top: 30rpx;
  font-size: 28rpx;
  color: #999;
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
</style>
