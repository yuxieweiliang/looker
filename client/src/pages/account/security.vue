<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="账号安全" />

    <view class="settings-section">
      <!-- 账号信息 -->
      <view class="menu-group">
        <view class="group-title">账号信息</view>
        <view class="menu-item" @click="onChangePhone">
          <text class="menu-label">手机号</text>
          <view class="menu-right">
            <text class="menu-value">{{ phone }}</text>
            <AppIcon name="arrow" size="28rpx" color="#ccc" />
          </view>
        </view>
        <view class="menu-item" @click="onChangePassword">
          <text class="menu-label">修改密码</text>
          <AppIcon name="arrow" size="28rpx" color="#ccc" />
        </view>
      </view>

      <!-- 安全设置 -->
      <view class="menu-group">
        <view class="group-title">安全设置</view>
        <view class="menu-item">
          <text class="menu-label">登录设备管理</text>
          <view class="menu-right">
            <text class="menu-value">2台设备</text>
            <AppIcon name="arrow" size="28rpx" color="#ccc" />
          </view>
        </view>
        <view class="menu-item">
          <text class="menu-label">指纹/面容解锁</text>
          <switch :checked="bioUnlock" @change="onBioUnlockChange" color="#ff6b6b" />
        </view>
      </view>

      <!-- 注销账号 -->
      <view class="menu-group danger">
        <view class="menu-item" @click="onDeleteAccount">
          <text class="menu-label danger">注销账号</text>
          <AppIcon name="arrow" size="28rpx" color="#ff6b6b" />
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

const phone = ref('138****8888')
const bioUnlock = ref(false)

const onChangePhone = () => {
  uni.navigateTo({ url: '/pages/settings/phone' })
}

const onChangePassword = () => {
  uni.navigateTo({ url: '/pages/settings/password' })
}

const onBioUnlockChange = (e: any) => {
  bioUnlock.value = e.detail.value
  showToast(e.detail.value ? '已开启' : '已关闭')
}

const onDeleteAccount = () => {
  uni.showModal({
    title: '注销账号',
    content: '注销后无法恢复，确定继续吗？',
    confirmColor: '#ff6b6b',
    success: (res) => {
      if (res.confirm) {
        showToast('请联系客服完成注销')
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

  &.danger {
    .menu-item {
      &:active {
        background: #fff5f5;
      }
    }
  }
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

  &.danger {
    color: #ff6b6b;
  }
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
</style>
