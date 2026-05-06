<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="我的" :show-back="false" />

    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info" @click="onEditProfile">
        <image
          class="user-avatar"
          :src="userInfo.avatar || '/src/static/images/default-avatar.png'"
          mode="aspectFill"
        />
        <view class="user-meta">
          <text class="user-name">{{ userInfo.name || '点击登录' }}</text>
          <text class="user-id">ID: {{ userInfo.id || '--' }}</text>
          <view class="user-badges">
            <view v-if="userInfo.vip" class="badge vip">VIP</view>
            <view class="badge level">Lv.{{ userInfo.level || 1 }}</view>
          </view>
        </view>
        <AppIcon name="arrow" size="32rpx" color="#999" />
      </view>

      <view class="user-stats">
        <view class="stat-item" @click="navigateToSocial('following')">
          <text class="stat-num">{{ userInfo.following || 0 }}</text>
          <text class="stat-label">关注</text>
        </view>
        <view class="stat-item" @click="navigateToSocial('followers')">
          <text class="stat-num">{{ userInfo.followers || 0 }}</text>
          <text class="stat-label">粉丝</text>
        </view>
        <view class="stat-item" @click="navigateToSocial('likes')">
          <text class="stat-num">{{ userInfo.likes || 0 }}</text>
          <text class="stat-label">获赞</text>
        </view>
      </view>
    </view>

    <!-- 内容统计 -->
    <view class="content-stats">
      <view class="stat-card" @click="navigateToWorks('works')">
        <view class="stat-icon works">
          <AppIcon name="photo-o" size="48rpx" color="#fff" />
        </view>
        <text class="stat-title">我的作品</text>
        <text class="stat-value">{{ userInfo.works || 0 }}</text>
      </view>
      <view class="stat-card" @click="navigateToWorks('collect')">
        <view class="stat-icon collect">
          <AppIcon name="star-o" size="48rpx" color="#fff" />
        </view>
        <text class="stat-title">我的收藏</text>
        <text class="stat-value">{{ userInfo.collections || 0 }}</text>
      </view>
      <view class="stat-card" @click="navigateToWorks('history')">
        <view class="stat-icon history">
          <AppIcon name="clock-o" size="48rpx" color="#fff" />
        </view>
        <text class="stat-title">浏览历史</text>
        <text class="stat-value">{{ userInfo.history || 0 }}</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-group">
        <view
          v-for="(item, index) in menuItems"
          :key="index"
          class="menu-item"
          @click="onMenuClick(item)"
        >
          <view class="menu-left">
            <AppIcon :name="item.icon" size="40rpx" :color="item.color" />
            <text class="menu-text">{{ item.name }}</text>
          </view>
          <view class="menu-right">
            <text v-if="item.badge" class="menu-badge">{{ item.badge }}</text>
            <AppIcon name="arrow" size="32rpx" color="#ccc" />
          </view>
        </view>
      </view>
    </view>

    <!-- 其他选项 -->
    <view class="menu-section">
      <view class="menu-group">
        <view
          v-for="(item, index) in settingItems"
          :key="index"
          class="menu-item"
          @click="onMenuClick(item)"
        >
          <view class="menu-left">
            <AppIcon :name="item.icon" size="40rpx" :color="item.color" />
            <text class="menu-text">{{ item.name }}</text>
          </view>
          <AppIcon name="arrow" size="32rpx" color="#ccc" />
        </view>
      </view>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text>Looker v{{ version }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppIcon from "../../components/AppIcon.vue"
import { ref, onMounted } from 'vue'
import { useSystemInfo, showToast } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import { getUserInfo } from '../../api/auth'
import { useUserStore } from '../../stores/user'

const { navbarHeight } = useSystemInfo()
const userStore = useUserStore()

interface UserInfo {
  id: string
  name: string
  avatar: string
  vip: boolean
  level: number
  following: number
  followers: number
  likes: number
  works: number
  collections: number
  history: number
}

interface MenuItem {
  name: string
  icon: string
  color: string
  path: string
  badge?: string
}

const version = ref('1.0.0')

// 用户信息
const userInfo = ref<Partial<UserInfo>>({})

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const res = await getUserInfo()
    if (res.code === 0 && res.data) {
      userInfo.value = res.data
      // 更新 store
      userStore.setUserInfo(res.data)
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
    showToast('获取用户信息失败')
  }
}

// 菜单项
const menuItems: MenuItem[] = [
  { name: '消息通知', icon: 'bell-o', color: '#ff6b6b', path: '/pages/message/message', badge: '3' },
  { name: '草稿箱', icon: 'todo-list-o', color: '#4ecdc4', path: '/pages/topic/draft' },
  { name: '钱包', icon: 'balance-o', color: '#f7b731', path: '/pages/account/wallet' },
  { name: '任务中心', icon: 'gift-o', color: '#5f27cd', path: '/pages/task/task' },
]

// 设置项
const settingItems: MenuItem[] = [
  { name: '账号安全', icon: 'shield-o', color: '#10ac84', path: '/pages/account/security' },
  { name: '隐私设置', icon: 'eye-o', color: '#576574', path: '/pages/settings/privacy' },
  { name: '通用设置', icon: 'setting-o', color: '#8395a7', path: '/pages/settings/index' },
  { name: '帮助与反馈', icon: 'question-o', color: '#48dbfb', path: '/pages/about/help-feedback' },
  { name: '关于我们', icon: 'info-o', color: '#ff9ff3', path: '/pages/about/about' },
]

const onEditProfile = () => {
  navigateTo('/pages/profile/edit')
}

const navigateTo = (url: string) => {
  if (url.startsWith('/pages/')) {
    uni.navigateTo({ url })
  }
}

const navigateToWorks = (type: 'works' | 'collect' | 'history') => {
  uni.navigateTo({
    url: `/pages/profile/works?type=${type}`,
  })
}

const navigateToSocial = (type: 'following' | 'followers' | 'likes') => {
  const tabMap: Record<string, number> = {
    following: 0,
    followers: 1,
    likes: 2,
  }
  uni.navigateTo({
    url: `/pages/profile/social?tab=${tabMap[type]}`,
  })
}

const onMenuClick = (item: MenuItem) => {
  if (item.path) {
    navigateTo(item.path)
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #ffe4e1 0%, #f5f5f5 30%);
  padding-bottom: 40rpx;
}

.user-card {
  background: #fff;
  margin: 30rpx;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;

  .user-avatar {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    margin-right: 30rpx;
    border: 4rpx solid #fff;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  }

  .user-meta {
    flex: 1;

    .user-name {
      font-size: 40rpx;
      font-weight: 600;
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
  }

  .user-badges {
    display: flex;
    gap: 12rpx;

    .badge {
      padding: 6rpx 16rpx;
      border-radius: 8rpx;
      font-size: 22rpx;
      font-weight: 500;

      &.vip {
        background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
        color: #fff;
      }

      &.level {
        background: rgba(255, 107, 107, 0.1);
        color: #ff6b6b;
      }
    }
  }
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 30rpx;
  border-top: 1rpx solid #f0f0f0;

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    .stat-num {
      font-size: 40rpx;
      font-weight: 700;
      color: #333;
      margin-bottom: 8rpx;
    }

    .stat-label {
      font-size: 26rpx;
      color: #666;
    }
  }
}

.content-stats {
  display: flex;
  justify-content: space-between;
  margin: 0 30rpx 30rpx;
}

.content-stats .stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx 0;
  flex: 1;
  margin-right: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.content-stats .stat-card:last-child {
  margin-right: 0;
}

.content-stats .stat-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.content-stats .stat-icon.works {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
}

.content-stats .stat-icon.collect {
  background: linear-gradient(135deg, #f7b731 0%, #ffcc00 100%);
}

.content-stats .stat-icon.history {
  background: linear-gradient(135deg, #5f27cd 0%, #7c3aed 100%);
}

.content-stats .stat-title {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.content-stats .stat-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.menu-section {
  margin: 0 30rpx 30rpx;

  .menu-group {
    background: #fff;
    border-radius: 20rpx;
    overflow: hidden;
  }

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background: #f9f9f9;
    }
  }

  .menu-left {
    display: flex;
    align-items: center;

    .menu-text {
      margin-left: 20rpx;
      font-size: 30rpx;
      color: #333;
    }
  }

  .menu-right {
    display: flex;
    align-items: center;
    gap: 16rpx;

    .menu-badge {
      background: #ff6b6b;
      color: #fff;
      font-size: 22rpx;
      padding: 4rpx 12rpx;
      border-radius: 20rpx;
      min-width: 32rpx;
      text-align: center;
    }
  }
}

.version-info {
  text-align: center;
  padding: 40rpx;

  text {
    font-size: 24rpx;
    color: #999;
  }
}
</style>
