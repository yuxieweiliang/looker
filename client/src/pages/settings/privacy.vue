<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="隐私设置" />

    <view class="settings-section">
      <!-- 作品可见性 -->
      <view class="menu-group">
        <view class="group-title">作品可见性</view>
        <view class="menu-item" @click="showPrivacyPicker = true">
          <text class="menu-label">谁可以看我的作品</text>
          <view class="menu-right">
            <text class="menu-value">{{ privacyOptions[privacyIndex] }}</text>
            <AppIcon name="arrow" size="28rpx" color="#ccc" />
          </view>
        </view>
        <view class="menu-item" @click="showFollowPicker = true">
          <text class="menu-label">谁可以关注我</text>
          <view class="menu-right">
            <text class="menu-value">{{ followOptions[followIndex] }}</text>
            <AppIcon name="arrow" size="28rpx" color="#ccc" />
          </view>
        </view>
      </view>

      <!-- 互动权限 -->
      <view class="menu-group">
        <view class="group-title">互动权限</view>
        <view class="menu-item">
          <text class="menu-label">允许评论</text>
          <switch :checked="allowComment" @change="onAllowCommentChange" color="#ff6b6b" />
        </view>
        <view class="menu-item">
          <text class="menu-label">允许私信</text>
          <switch :checked="allowMessage" @change="onAllowMessageChange" color="#ff6b6b" />
        </view>
      </view>

      <!-- 黑名单 -->
      <view class="menu-group">
        <view class="menu-item" @click="onBlacklist">
          <text class="menu-label">黑名单</text>
          <view class="menu-right">
            <text class="menu-value">{{ blacklistCount }}人</text>
            <AppIcon name="arrow" size="28rpx" color="#ccc" />
          </view>
        </view>
      </view>
    </view>

    <!-- 隐私选项选择器 -->
    <view v-if="showPrivacyPicker" class="picker-mask" @click="showPrivacyPicker = false">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">谁可以看我的作品</text>
          <view class="picker-close" @click="showPrivacyPicker = false">
            <AppIcon name="cross" size="32rpx" color="#999" />
          </view>
        </view>
        <view class="picker-list">
          <view
            v-for="(option, index) in privacyOptions"
            :key="index"
            class="picker-item"
            :class="{ active: privacyIndex === index }"
            @click="selectPrivacy(index)"
          >
            <text class="picker-item-text">{{ option }}</text>
            <AppIcon v-if="privacyIndex === index" name="success" size="32rpx" color="#ff6b6b" />
          </view>
        </view>
      </view>
    </view>

    <!-- 关注选项选择器 -->
    <view v-if="showFollowPicker" class="picker-mask" @click="showFollowPicker = false">
      <view class="picker-content" @click.stop>
        <view class="picker-header">
          <text class="picker-title">谁可以关注我</text>
          <view class="picker-close" @click="showFollowPicker = false">
            <AppIcon name="cross" size="32rpx" color="#999" />
          </view>
        </view>
        <view class="picker-list">
          <view
            v-for="(option, index) in followOptions"
            :key="index"
            class="picker-item"
            :class="{ active: followIndex === index }"
            @click="selectFollow(index)"
          >
            <text class="picker-item-text">{{ option }}</text>
            <AppIcon v-if="followIndex === index" name="success" size="32rpx" color="#ff6b6b" />
          </view>
        </view>
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

const privacyOptions = ['所有人', '仅粉丝', '仅自己']
const privacyIndex = ref(0)
const showPrivacyPicker = ref(false)

const followOptions = ['所有人', '需要验证']
const followIndex = ref(0)
const showFollowPicker = ref(false)

const allowComment = ref(true)
const allowMessage = ref(true)
const blacklistCount = ref(3)

const selectPrivacy = (index: number) => {
  privacyIndex.value = index
  showPrivacyPicker.value = false
  showToast('设置已保存')
}

const selectFollow = (index: number) => {
  followIndex.value = index
  showFollowPicker.value = false
  showToast('设置已保存')
}

const onAllowCommentChange = (e: any) => {
  allowComment.value = e.detail.value
  showToast(e.detail.value ? '已开启评论' : '已关闭评论')
}

const onAllowMessageChange = (e: any) => {
  allowMessage.value = e.detail.value
  showToast(e.detail.value ? '已开启私信' : '已关闭私信')
}

const onBlacklist = () => {
  uni.navigateTo({ url: '/pages/settings/blacklist' })
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

// 选择器弹窗
.picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 2000;
}

.picker-content {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.picker-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.picker-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;

  &:active {
    opacity: 0.7;
  }
}

.picker-list {
  padding: 20rpx 0;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;

  &:active {
    background: #f9f9f9;
  }

  &.active {
    .picker-item-text {
      color: #ff6b6b;
      font-weight: 500;
    }
  }
}

.picker-item-text {
  font-size: 30rpx;
  color: #333;
}
</style>
