<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="关于我们" />

    <!-- Logo 区域 -->
    <view class="logo-section">
      <image
        class="logo"
        src="/static/images/logo.png"
        mode="aspectFit"
      />
      <text class="app-name">Looker</text>
      <text class="app-slogan">发现美好，分享精彩</text>
      <text class="version">版本 {{ version }}</text>
    </view>

    <!-- 应用介绍 -->
    <view class="intro-section">
      <view class="intro-card">
        <text class="intro-title">关于 Looker</text>
        <text class="intro-text">
          Looker 是一个专注于图片分享的社区平台，我们致力于为用户提供一个发现美好、分享精彩、交流灵感的空间。

在这里，你可以：
• 发布你的摄影作品，记录生活美好瞬间
• 发现来自世界各地的优质图片内容
• 关注感兴趣的创作者，建立你的灵感圈
• 参与话题讨论，与志同道合的朋友交流

我们相信每一张图片都有它的故事，每一个创作者都值得被看见。
        </text>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-num">100万+</text>
        <text class="stat-label">注册用户</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">500万+</text>
        <text class="stat-label">优质作品</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">1000+</text>
        <text class="stat-label">活跃话题</text>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-item" @click="navigateTo('/pages/about/terms')">
          <text class="menu-text">用户协议</text>
          <AppIcon name="arrow" size="32rpx" color="#ccc" />
        </view>
        <view class="menu-item" @click="navigateTo('/pages/about/privacy')">
          <text class="menu-text">隐私政策</text>
          <AppIcon name="arrow" size="32rpx" color="#ccc" />
        </view>
        <view class="menu-item" @click="checkUpdate">
          <text class="menu-text">检查更新</text>
          <view class="menu-right">
            <text v-if="hasUpdate" class="update-dot" />
            <text class="menu-value">{{ hasUpdate ? '有新版本' : '已是最新' }}</text>
            <AppIcon name="arrow" size="32rpx" color="#ccc" />
          </view>
        </view>
      </view>
    </view>

    <!-- 第三方开源 -->
    <view class="opensource-section">
      <text class="opensource-title">开源致谢</text>
      <view class="opensource-list">
        <text
          v-for="(lib, index) in openSourceLibs"
          :key="index"
          class="opensource-item"
        >
          {{ lib }}
        </text>
      </view>
    </view>

    <!-- 版权信息 -->
    <view class="footer">
      <text>© 2024 Looker Team. All rights reserved.</text>
      <text>由 Looker 团队荣誉出品</text>
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
const hasUpdate = ref(false)

const openSourceLibs = [
  'Vue 3',
  'uni-app',
  'TypeScript',
  'Vant Weapp',
  'Pinia',
  'Tailwind CSS',
]

const navigateTo = (url: string) => {
  uni.navigateTo({ url })
}

const checkUpdate = () => {
  uni.showLoading({ title: '检查中...' })
  setTimeout(() => {
    uni.hideLoading()
    if (hasUpdate.value) {
      uni.showModal({
        title: '发现新版本',
        content: '版本 v1.1.0\n\n• 优化了图片加载速度\n• 新增滤镜功能\n• 修复已知问题',
        confirmText: '立即更新',
        success: (res) => {
          if (res.confirm) {
            showToast('开始下载更新...')
          }
        },
      })
    } else {
      showToast('已是最新版本', 'success')
    }
  }, 1000)
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #ffe4e1 0%, #f5f5f5 200px);
  padding-bottom: 60rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;

  .logo {
    width: 160rpx;
    height: 160rpx;
    border-radius: 36rpx;
    margin-bottom: 24rpx;
    background: #fff;
    box-shadow: 0 8rpx 32rpx rgba(255, 107, 107, 0.2);
  }

  .app-name {
    font-size: 48rpx;
    font-weight: 700;
    color: #333;
    margin-bottom: 12rpx;
  }

  .app-slogan {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 16rpx;
  }

  .version {
    font-size: 24rpx;
    color: #999;
    background: rgba(0, 0, 0, 0.05);
    padding: 8rpx 24rpx;
    border-radius: 20rpx;
  }
}

.intro-section {
  margin: 0 30rpx 30rpx;

  .intro-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 40rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  }

  .intro-title {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 24rpx;
    text-align: center;
  }

  .intro-text {
    display: block;
    font-size: 28rpx;
    color: #666;
    line-height: 1.8;
    white-space: pre-line;
  }
}

.stats-section {
  display: flex;
  justify-content: space-around;
  margin: 0 30rpx 30rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 0;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-num {
    font-size: 40rpx;
    font-weight: 700;
    color: #ff6b6b;
    margin-bottom: 12rpx;
  }

  .stat-label {
    font-size: 24rpx;
    color: #666;
  }
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

  .menu-text {
    font-size: 30rpx;
    color: #333;
  }

  .menu-right {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .menu-value {
    font-size: 26rpx;
    color: #999;
  }

  .update-dot {
    width: 16rpx;
    height: 16rpx;
    background: #ff6b6b;
    border-radius: 50%;
  }
}

.opensource-section {
  margin: 0 30rpx 40rpx;
  text-align: center;

  .opensource-title {
    display: block;
    font-size: 24rpx;
    color: #999;
    margin-bottom: 20rpx;
  }

  .opensource-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16rpx;
  }

  .opensource-item {
    font-size: 22rpx;
    color: #999;
    background: rgba(0, 0, 0, 0.03);
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
  }
}

.footer {
  text-align: center;
  padding: 20rpx;

  text {
    display: block;
    font-size: 22rpx;
    color: #bbb;
    margin-bottom: 8rpx;
  }
}
</style>
