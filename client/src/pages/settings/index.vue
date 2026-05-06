<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="通用设置" />

    <view class="settings-section">
      <!-- 通知设置 -->
      <view class="menu-group">
        <view class="group-title">通知</view>
        <view class="menu-item">
          <text class="menu-label">接收新消息通知</text>
          <switch :checked="pushEnabled" @change="onPushChange" color="#ff6b6b" />
        </view>
        <view class="menu-item">
          <text class="menu-label">点赞和关注提醒</text>
          <switch :checked="likeNotify" @change="onLikeNotifyChange" color="#ff6b6b" />
        </view>
      </view>

      <!-- 存储与性能 -->
      <view class="menu-group">
        <view class="group-title">存储与性能</view>
        <view class="menu-item" @click="onClearCache">
          <text class="menu-label">清除缓存</text>
          <view class="menu-right">
            <text class="menu-value">{{ cacheSize }}</text>
            <AppIcon name="arrow" size="28rpx" color="#ccc" />
          </view>
        </view>
        <view class="menu-item">
          <text class="menu-label">自动播放视频</text>
          <switch :checked="autoPlay" @change="onAutoPlayChange" color="#ff6b6b" />
        </view>
      </view>

      <!-- 关于 -->
      <view class="menu-group">
        <view class="menu-item" @click="onAbout">
          <text class="menu-label">关于我们</text>
          <view class="menu-right">
            <text class="menu-value">v{{ version }}</text>
            <AppIcon name="arrow" size="28rpx" color="#ccc" />
          </view>
        </view>
        <view class="menu-item" @click="onFeedback">
          <text class="menu-label">帮助与反馈</text>
          <AppIcon name="arrow" size="28rpx" color="#ccc" />
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-btn" @click="onLogout">
        <text>退出登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSystemInfo, showToast } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import AppIcon from '../../components/AppIcon.vue'

const { navbarHeight } = useSystemInfo()

const version = ref('1.0.0')
const cacheSize = ref('128MB')
const pushEnabled = ref(true)
const likeNotify = ref(true)
const autoPlay = ref(true)

const onPushChange = (e: any) => {
  pushEnabled.value = e.detail.value
  showToast(e.detail.value ? '已开启' : '已关闭')
}

const onLikeNotifyChange = (e: any) => {
  likeNotify.value = e.detail.value
}

const onAutoPlayChange = (e: any) => {
  autoPlay.value = e.detail.value
}

const onClearCache = () => {
  uni.showModal({
    title: '清除缓存',
    content: '确定要清除所有缓存吗？',
    success: (res) => {
      if (res.confirm) {
        cacheSize.value = '0MB'
        showToast('清除成功', 'success')
      }
    },
  })
}

const onAbout = () => {
  uni.navigateTo({ url: '/pages/about/about' })
}

const onFeedback = () => {
  uni.navigateTo({ url: '/pages/about/help-feedback' })
}

const onLogout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    confirmColor: '#ff6b6b',
    success: (res) => {
      if (res.confirm) {
        showToast('已退出登录')
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/login/login' })
        }, 1000)
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.settings-section {
  padding: 20rpx;
}

.menu-group {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.group-title {
  padding: 20rpx 30rpx;
  font-size: 24rpx;
  color: #999;
  background: #fafafa;
  border-bottom: 1rpx solid #f0f0f0;
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

.menu-label {
  font-size: 30rpx;
  color: #333;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.menu-value {
  font-size: 28rpx;
  color: #999;
}

.logout-btn {
  margin: 40rpx 20rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 16rpx;

  text {
    font-size: 30rpx;
    color: #ff6b6b;
    font-weight: 500;
  }

  &:active {
    background: #fff5f5;
  }
}
</style>
