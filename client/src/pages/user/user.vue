<template>
  <view class="page-container">
    <CustomNavbar title="用户主页" show-back />

    <!-- 用户信息 -->
    <view class="user-header">
      <image class="user-bg" src="https://picsum.photos/750/400" mode="aspectFill" />
      <view class="user-content">
        <image class="user-avatar" :src="userInfo.avatar" mode="aspectFill" />
        <view class="user-actions">
          <button
            class="action-btn primary"
            :class="{ following: userInfo.isFollowing }"
            @click="toggleFollowUser"
          >
            {{ userInfo.isFollowing ? '已关注' : '关注' }}
          </button>
          <button class="action-btn" @click="sendMessage">私信</button>
        </view>
      </view>
    </view>

    <!-- 用户资料 -->
    <view class="user-profile">
      <text class="user-name">{{ userInfo.name }}</text>
      <text class="user-id">ID: {{ userInfo.id }}</text>
      <text class="user-bio">{{ userInfo.bio }}</text>

      <view class="user-stats">
        <view class="stat-item" @click="showFollows">
          <text class="stat-num">{{ userInfo.following }}</text>
          <text class="stat-label">关注</text>
        </view>
        <view class="stat-item" @click="showFollowers">
          <text class="stat-num">{{ userInfo.followers }}</text>
          <text class="stat-label">粉丝</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ userInfo.likes }}</text>
          <text class="stat-label">获赞</text>
        </view>
      </view>
    </view>

    <!-- 内容标签 -->
    <view class="content-tabs">
      <text
        v-for="(tab, index) in tabs"
        :key="index"
        class="tab-item"
        :class="{ active: currentTab === index }"
        @click="switchTab(index)"
      >
        {{ tab }}
        <text v-if="index === 0" class="tab-count">{{ userInfo.works }}</text>
      </text>
    </view>

    <!-- 作品列表 -->
    <scroll-view scroll-y class="works-scroll" @scrolltolower="loadMore">
      <WaterfallList v-if="currentTab === 0" :list="worksList" @item-click="onWorkClick" />

      <!-- 喜欢的作品 -->
      <WaterfallList v-if="currentTab === 1" :list="likesList" @item-click="onWorkClick" />

      <!-- 收藏 -->
      <view v-if="currentTab === 2" class="collect-list">
        <view
          v-for="(item, index) in collectList"
          :key="index"
          class="collect-item"
          @click="onWorkClick(item)"
        >
          <image class="collect-cover" :src="item.url" mode="aspectFill" />
          <view class="collect-info">
            <text class="collect-title">{{ item.title }}</text>
            <view class="collect-user">
              <image class="mini-avatar" :src="item.user.avatar" />
              <text>{{ item.user.name }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import CustomNavbar from '../../components/CustomNavbar.vue'
import WaterfallList from '../../components/WaterfallList.vue'
import { getUserProfile, getUserWorks } from '../../api/user'
import { toggleFollow as toggleFollowAPI } from '../../api/social'
import { showToast } from '../../utils/uniapi'
import type { WaterfallItem } from '../../types'

interface UserInfo {
  id: string
  name: string
  avatar: string
  bio: string
  following: number
  followers: number
  likes: number
  works: number
  isFollowing: boolean
}

const userInfo = ref<UserInfo>({
  id: '',
  name: '',
  avatar: '',
  bio: '',
  following: 0,
  followers: 0,
  likes: 0,
  works: 0,
  isFollowing: false,
})

const tabs = ['作品', '喜欢', '收藏']
const currentTab = ref(0)

const worksList = ref<WaterfallItem[]>([])
const likesList = ref<WaterfallItem[]>([])
const collectList = ref<WaterfallItem[]>([])

onMounted(() => {
  fetchUserData()
})

const userId = ref('')

// 获取用户信息和作品
const fetchUserData = async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const id = currentPage?.$page?.options?.id

  if (!id) {
    showToast('用户ID不存在')
    return
  }

  userId.value = id

  try {
    const res = await getUserProfile(id)
    if (res.code === 0 && res.data) {
      userInfo.value = res.data
      // 获取用户作品
      await fetchUserWorks()
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
    showToast('获取用户信息失败')
  }
}

const fetchUserWorks = async () => {
  try {
    const res = await getUserWorks({ page: 1, pageSize: 20 })
    if (res.code === 0 && res.data) {
      worksList.value = res.data.list.map(item => ({
        id: item.id,
        url: item.images?.[0]?.url || '',
        title: item.content.slice(0, 50),
        user: item.user,
        likes: item.likes,
      }))
    }
  } catch (error) {
    console.error('获取用户作品失败', error)
  }
}

const toggleFollowUser = async () => {
  try {
    const res = await toggleFollowAPI(userId.value)
    if (res.code === 0 && res.data) {
      userInfo.value.isFollowing = res.data.isFollowing
      showToast(userInfo.value.isFollowing ? '关注成功' : '已取消关注')
    }
  } catch (error) {
    console.error('关注操作失败', error)
    showToast('操作失败')
  }
}

const sendMessage = () => {
  uni.navigateTo({
    url: `/pages/chat/chat?id=${userInfo.value.id}`,
  })
}

const showFollows = () => {
  uni.navigateTo({
    url: `/pages/fans/fans?type=following&id=${userInfo.value.id}`,
  })
}

const showFollowers = () => {
  uni.navigateTo({
    url: `/pages/fans/fans?type=followers&id=${userInfo.value.id}`,
  })
}

const switchTab = (index: number) => {
  currentTab.value = index
}

const onWorkClick = (item: WaterfallItem) => {
  uni.navigateTo({
    url: `/pages/detail/detail?id=${item.id}`,
  })
}

const loadMore = () => {
  // 加载更多
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.user-header {
  position: relative;
}

.user-bg {
  width: 100%;
  height: 300rpx;
}

.user-content {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 30rpx;
  margin-top: -80rpx;
}

.user-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 6rpx solid #fff;
}

.user-actions {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.action-btn {
  font-size: 28rpx;
  color: #666;
  background: #f0f0f0;
  padding: 16rpx 40rpx;
  border-radius: 36rpx;
  line-height: 1;

  &.primary {
    color: #fff;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);

    &.following {
      background: #f0f0f0;
      color: #666;
    }
  }

  &::after {
    display: none;
  }
}

.user-profile {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.user-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.user-id {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 16rpx;
}

.user-bio {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
  display: block;
  margin-bottom: 30rpx;
}

.user-stats {
  display: flex;
  gap: 60rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-num {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 4rpx;
}

.content-tabs {
  display: flex;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  font-size: 30rpx;
  color: #666;
  padding: 30rpx 0;
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

.tab-count {
  font-size: 24rpx;
  margin-left: 8rpx;
}

.works-scroll {
  height: calc(100vh - 700rpx);
  padding: 20rpx 0;
}

.collect-list {
  padding: 20rpx;
}

.collect-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;

  &:active {
    opacity: 0.9;
  }
}

.collect-cover {
  width: 200rpx;
  height: 200rpx;
}

.collect-info {
  flex: 1;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.collect-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.collect-user {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #999;
}

.mini-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}
</style>
