<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="消息通知">
      <template #right>
        <text
          v-if="unreadCount > 0"
          class="read-all-btn"
          @click="onReadAll"
        >
          一键已读
        </text>
      </template>
    </CustomNavbar>

    <!-- 消息分类标签 -->
    <view class="message-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @click="onTabChange(tab.value)"
      >
        <text class="tab-text">{{ tab.label }}</text>
        <view v-if="tab.badge > 0" class="tab-badge">{{ tab.badge }}</view>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view
      class="message-list"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <view v-if="filteredMessages.length > 0" class="message-content">
        <view
          v-for="msg in filteredMessages"
          :key="msg.id"
          class="message-item"
          :class="{ unread: !msg.read }"
          @click="onMessageClick(msg)"
        >
          <image class="msg-avatar" :src="msg.avatar" mode="aspectFill" />
          <view class="msg-content">
            <view class="msg-header">
              <text class="msg-name">{{ msg.name }}</text>
              <text class="msg-time">{{ msg.time }}</text>
            </view>
            <text class="msg-text">{{ msg.content }}</text>
            <view v-if="msg.image" class="msg-image">
              <image :src="msg.image" mode="aspectFill" />
            </view>
          </view>
          <view v-if="!msg.read" class="unread-dot" />
        </view>

        <!-- 加载更多 -->
        <view v-if="loadingMore" class="load-more">
          <text>加载中...</text>
        </view>
        <view v-else-if="noMore" class="load-more">
          <text>没有更多消息了</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <AppIcon name="bell-o" size="120rpx" color="#ddd" />
        <text class="empty-text">暂无消息</text>
        <text class="empty-subtext">暂时没有{{ currentTab === 'all' ? '' : '该类' }}消息通知</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSystemInfo, showToast } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import AppIcon from '../../components/AppIcon.vue'
import { getMessageList, getUnreadCount, markMessageRead, markAllRead } from '../../api/message'
import type { Message, MessageType } from '../../api/message'

const { navbarHeight } = useSystemInfo()

interface TabItem {
  label: string
  value: MessageType | 'all'
  badge: number
}

const currentTab = ref<MessageType | 'all'>('all')
const refreshing = ref(false)
const loadingMore = ref(false)
const noMore = ref(false)
const page = ref(1)
const pageSize = ref(20)
const messages = ref<Message[]>([])
const unreadStats = ref({ total: 0, like: 0, comment: 0, follow: 0, system: 0 })

// 未读消息数
const unreadCount = computed(() => {
  return unreadStats.value.total
})

// 标签页数据
const tabs = computed<TabItem[]>(() => [
  { label: '全部', value: 'all', badge: unreadStats.value.total },
  {
    label: '点赞',
    value: 'like',
    badge: unreadStats.value.like,
  },
  {
    label: '评论',
    value: 'comment',
    badge: unreadStats.value.comment,
  },
  {
    label: '关注',
    value: 'follow',
    badge: unreadStats.value.follow,
  },
  {
    label: '系统',
    value: 'system',
    badge: unreadStats.value.system,
  },
])

// 过滤后的消息
const filteredMessages = computed(() => {
  if (currentTab.value === 'all') {
    return messages.value
  }
  return messages.value.filter((msg) => msg.type === currentTab.value)
})

// 获取消息列表
const fetchMessages = async (isRefresh = false) => {
  if (loadingMore.value) return

  try {
    if (isRefresh) {
      page.value = 1
      noMore.value = false
    }

    const res = await getMessageList({
      type: currentTab.value === 'all' ? undefined : currentTab.value,
      page: page.value,
      pageSize: pageSize.value,
    })

    if (res.code === 0 && res.data) {
      const list = res.data.list.map(item => ({
        ...item,
        time: formatTime(item.time),
      }))

      if (isRefresh) {
        messages.value = list
      } else {
        messages.value.push(...list)
      }

      noMore.value = !res.data.hasMore
      page.value++
    }
  } catch (error) {
    console.error('获取消息失败', error)
  }
}

// 获取未读消息数
const fetchUnreadCount = async () => {
  try {
    const res = await getUnreadCount()
    if (res.code === 0 && res.data) {
      unreadStats.value = res.data
    }
  } catch (error) {
    console.error('获取未读数失败', error)
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

// 切换标签
const onTabChange = (tab: MessageType | 'all') => {
  currentTab.value = tab
  fetchMessages(true)
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  await Promise.all([fetchMessages(true), fetchUnreadCount()])
  refreshing.value = false
}

// 加载更多
const onLoadMore = async () => {
  if (loadingMore.value || noMore.value) return
  loadingMore.value = true
  await fetchMessages()
  loadingMore.value = false
}

// 一键已读
const onReadAll = async () => {
  uni.showModal({
    title: '一键已读',
    content: '是否将所有消息标记为已读？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await markAllRead()
          if (result.code === 0) {
            messages.value.forEach((msg) => {
              msg.read = true
            })
            unreadStats.value = { total: 0, like: 0, comment: 0, follow: 0, system: 0 }
            showToast('已全部标记为已读', 'success')
          } else {
            showToast(result.message || '操作失败')
          }
        } catch (error) {
          console.error('标记已读失败', error)
          showToast('操作失败')
        }
      }
    },
  })
}

// 点击消息
const onMessageClick = async (msg: Message) => {
  // 标记为已读
  if (!msg.read) {
    try {
      const res = await markMessageRead(msg.id)
      if (res.code === 0) {
        msg.read = true
        // 更新未读数
        await fetchUnreadCount()
      }
    } catch (error) {
      console.error('标记已读失败', error)
    }
  }

  // 根据消息类型跳转
  switch (msg.type) {
    case 'like':
    case 'comment':
      if (msg.targetId) {
        uni.navigateTo({ url: `/pages/detail/detail?id=${msg.targetId}` })
      }
      break
    case 'follow':
      uni.navigateTo({ url: `/pages/user/user?id=${msg.id}` })
      break
    case 'system':
      // 系统通知不跳转或跳转到公告页面
      break
  }
}

onMounted(() => {
  fetchMessages()
  fetchUnreadCount()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.read-all-btn {
  font-size: 28rpx;
  color: #ff6b6b;
  font-weight: 500;
}

.message-tabs {
  display: flex;
  background: #fff;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 10rpx 0;

    &.active {
      .tab-text {
        color: #ff6b6b;
        font-weight: 600;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: -10rpx;
        left: 50%;
        transform: translateX(-50%);
        width: 40rpx;
        height: 4rpx;
        background: #ff6b6b;
        border-radius: 2rpx;
      }
    }

    .tab-text {
      font-size: 28rpx;
      color: #666;
    }

    .tab-badge {
      position: absolute;
      top: 0;
      right: 20rpx;
      min-width: 32rpx;
      height: 32rpx;
      background: #ff6b6b;
      color: #fff;
      font-size: 22rpx;
      border-radius: 16rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 8rpx;
    }
  }
}

.message-list {
  height: calc(100vh - v-bind(navbarHeight) * 1px - 100rpx);
}

.message-content {
  padding: 20rpx;
}

.message-item {
  display: flex;
  align-items: flex-start;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  position: relative;

  &.unread {
    background: linear-gradient(135deg, #fff5f5 0%, #fff 100%);
  }

  &:active {
    opacity: 0.8;
  }

  .msg-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    flex-shrink: 0;
  }

  .msg-content {
    flex: 1;
    min-width: 0;

    .msg-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12rpx;

      .msg-name {
        font-size: 30rpx;
        font-weight: 600;
        color: #333;
      }

      .msg-time {
        font-size: 24rpx;
        color: #999;
      }
    }

    .msg-text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.5;
      display: block;
    }

    .msg-image {
      margin-top: 16rpx;
      width: 160rpx;
      height: 160rpx;
      border-radius: 12rpx;
      overflow: hidden;

      image {
        width: 100%;
        height: 100%;
      }
    }
  }

  .unread-dot {
    position: absolute;
    top: 30rpx;
    right: 30rpx;
    width: 16rpx;
    height: 16rpx;
    background: #ff6b6b;
    border-radius: 50%;
  }
}

.load-more {
  text-align: center;
  padding: 30rpx;

  text {
    font-size: 26rpx;
    color: #999;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;

  .empty-text {
    font-size: 32rpx;
    color: #666;
    margin-top: 30rpx;
  }

  .empty-subtext {
    font-size: 26rpx;
    color: #999;
    margin-top: 16rpx;
  }
}
</style>
