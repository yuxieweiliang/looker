<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="黑名单" show-back />

    <view class="blacklist-container">
      <!-- 说明文字 -->
      <view class="tips-bar">
        <AppIcon name="info-o" size="28rpx" color="#ff6b6b" />
        <text>你将不会看到黑名单用户的作品，对方也无法与你互动</text>
      </view>

      <!-- 黑名单列表 -->
      <scroll-view
        scroll-y
        class="blacklist-scroll"
        @scrolltolower="onLoadMore"
        :refresher-enabled="true"
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <view v-if="blacklist.length > 0" class="user-list">
          <view
            v-for="user in blacklist"
            :key="user.id"
            class="user-item"
          >
            <image class="user-avatar" :src="user.avatar" mode="aspectFill" />
            <view class="user-info">
              <text class="user-name">{{ user.name }}</text>
              <text class="user-time">拉黑于 {{ user.blockTime }}</text>
            </view>
            <view class="unblock-btn" @click="onUnblock(user)">
              <text>解除</text>
            </view>
          </view>

          <!-- 加载更多 -->
          <view class="load-more">
            <AppLoading v-if="loading" type="spinner" size="32rpx" />
            <text v-else-if="!hasMore" class="no-more">没有更多了</text>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else class="empty-state">
          <AppIcon name="user-o" size="120rpx" color="#ddd" />
          <text class="empty-text">黑名单为空</text>
          <text class="empty-subtext">你还没有拉黑任何用户</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSystemInfo, showToast } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import AppIcon from '../../components/AppIcon.vue'
import AppLoading from '../../components/AppLoading.vue'
import { getBlacklist, removeFromBlacklist } from '../../api/social'
import type { PaginationParams } from '../../types/user'

const { navbarHeight } = useSystemInfo()

interface BlacklistUser {
  id: string
  name: string
  avatar: string
  blockTime: string
}

const blacklist = ref<BlacklistUser[]>([])
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const page = ref(1)

// 加载黑名单
const loadBlacklist = async (isRefresh = false) => {
  if (loading.value) return
  loading.value = true

  try {
    if (isRefresh) {
      page.value = 1
      blacklist.value = []
    }

    const params: PaginationParams = { page: page.value, pageSize: 20 }
    const res = await getBlacklist(params)

    if (res.code === 0 && res.data) {
      const list = res.data.list.map(item => ({
        id: item.id,
        name: item.name,
        avatar: item.avatar,
        blockTime: item.blockTime,
      }))
      blacklist.value.push(...list)
      hasMore.value = res.data.hasMore
      page.value++
    }
  } catch (error) {
    console.error('获取黑名单失败', error)
    showToast('获取失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 解除拉黑
const onUnblock = async (user: BlacklistUser) => {
  uni.showModal({
    title: '解除拉黑',
    content: `确定将 "${user.name}" 从黑名单移除吗？`,
    confirmColor: '#ff6b6b',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await removeFromBlacklist(user.id)
          if (result.code === 0) {
            blacklist.value = blacklist.value.filter(u => u.id !== user.id)
            showToast('已解除拉黑', 'success')
          } else {
            showToast(result.message || '解除失败')
          }
        } catch (error) {
          console.error('解除拉黑失败', error)
          showToast('解除失败')
        }
      }
    },
  })
}

const onRefresh = () => {
  refreshing.value = true
  page.value = 1
  loadBlacklist(true)
}

const onLoadMore = () => {
  if (!hasMore.value || loading.value) return
  loadBlacklist()
}

onMounted(() => {
  loadBlacklist(true)
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.blacklist-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - v-bind(navbarHeight) * 1px);
}

.tips-bar {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 30rpx;
  background: #fff5f5;

  text {
    font-size: 26rpx;
    color: #ff6b6b;
  }
}

.blacklist-scroll {
  flex: 1;
  padding: 20rpx;
}

.user-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f9f9f9;
  }
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 24rpx;
}

.user-info {
  flex: 1;

  .user-name {
    font-size: 30rpx;
    color: #333;
    font-weight: 500;
    display: block;
    margin-bottom: 8rpx;
  }

  .user-time {
    font-size: 24rpx;
    color: #999;
  }
}

.unblock-btn {
  padding: 16rpx 32rpx;
  background: #f5f5f5;
  border-radius: 32rpx;

  text {
    font-size: 28rpx;
    color: #666;
  }

  &:active {
    background: #e0e0e0;
  }
}

.load-more {
  padding: 30rpx;
  text-align: center;

  .no-more {
    font-size: 26rpx;
    color: #999;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;

  .empty-text {
    font-size: 32rpx;
    color: #666;
    margin-top: 30rpx;
    margin-bottom: 12rpx;
  }

  .empty-subtext {
    font-size: 26rpx;
    color: #999;
  }
}
</style>
