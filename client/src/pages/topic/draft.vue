<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="草稿箱" />

    <view class="draft-container">
      <!-- 提示栏 -->
      <view class="tips-bar">
        <AppIcon name="info-o" size="28rpx" color="#ff6b6b" />
        <text>草稿仅保存30天，过期将自动删除</text>
      </view>

      <!-- 草稿列表 -->
      <view v-if="draftList.length > 0" class="draft-list">
        <view
          v-for="draft in draftList"
          :key="draft.id"
          class="draft-item"
          @click="onEditDraft(draft)"
        >
          <image
            v-if="draft.images && draft.images.length > 0"
            class="draft-cover"
            :src="draft.images[0]"
            mode="aspectFill"
          />
          <view v-else class="draft-cover empty">
            <AppIcon name="photo-o" size="60rpx" color="#ddd" />
          </view>
          <view class="draft-info">
            <text class="draft-title">{{ draft.title || '未命名草稿' }}</text>
            <text class="draft-content" v-if="draft.content">{{ draft.content }}</text>
            <view class="draft-meta">
              <text class="draft-time">保存于 {{ formatTime(draft.saveTime) }}</text>
              <text class="draft-expire" :class="{ urgent: isExpiringSoon(draft) }">
                {{ getExpireDays(draft.saveTime) }}天后过期
              </text>
            </view>
          </view>
          <view class="draft-actions" @click.stop>
            <view class="action-btn" @click="onEditDraft(draft)">
              <AppIcon name="edit-o" size="32rpx" color="#666" />
            </view>
            <view class="action-btn delete" @click="onDeleteDraft(draft.id)">
              <AppIcon name="delete-o" size="32rpx" color="#ff6b6b" />
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <AppIcon name="todo-list-o" size="120rpx" color="#ddd" />
        <text class="empty-text">暂无草稿</text>
        <text class="empty-subtext">未发布的内容将自动保存到这里</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useSystemInfo, showToast } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import AppIcon from '../../components/AppIcon.vue'

const { navbarHeight } = useSystemInfo()

interface DraftItem {
  id: string
  title: string
  content: string
  images: string[]
  saveTime: number
  topicId?: string
}

const DRAFT_STORAGE_KEY = 'looker_draft_list'
const MAX_DRAFT_DAYS = 30

const draftList = ref<DraftItem[]>([])

// 从本地存储加载草稿
const loadDrafts = () => {
  try {
    const stored = uni.getStorageSync(DRAFT_STORAGE_KEY)
    if (stored) {
      const drafts: DraftItem[] = JSON.parse(stored)
      // 过滤过期草稿（30天）
      const now = Date.now()
      const validDrafts = drafts.filter(
        draft => now - draft.saveTime < MAX_DRAFT_DAYS * 24 * 60 * 60 * 1000
      )
      // 如果有过期草稿，更新存储
      if (validDrafts.length !== drafts.length) {
        saveDraftsToStorage(validDrafts)
      }
      draftList.value = validDrafts.sort((a, b) => b.saveTime - a.saveTime)
    }
  } catch (error) {
    console.error('加载草稿失败:', error)
  }
}

// 保存草稿到本地存储
const saveDraftsToStorage = (drafts: DraftItem[]) => {
  try {
    uni.setStorageSync(DRAFT_STORAGE_KEY, JSON.stringify(drafts))
  } catch (error) {
    console.error('保存草稿失败:', error)
  }
}

// 页面显示时加载草稿
onShow(() => {
  loadDrafts()
})

// 格式化时间
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

// 计算剩余天数
const getExpireDays = (saveTime: number): number => {
  const expireTime = saveTime + 30 * 24 * 60 * 60 * 1000
  const remainTime = expireTime - Date.now()
  return Math.max(0, Math.ceil(remainTime / (24 * 60 * 60 * 1000)))
}

// 是否即将过期（3天内）
const isExpiringSoon = (draft: DraftItem): boolean => {
  return getExpireDays(draft.saveTime) <= 3
}

// 编辑草稿
const onEditDraft = (draft: DraftItem) => {
  uni.navigateTo({
    url: `/pages/topic/publish?draftId=${draft.id}`,
  })
}

// 删除草稿
const onDeleteDraft = (id: string) => {
  uni.showModal({
    title: '删除草稿',
    content: '确定要删除这条草稿吗？删除后无法恢复。',
    confirmColor: '#ff6b6b',
    success: (res) => {
      if (res.confirm) {
        draftList.value = draftList.value.filter(item => item.id !== id)
        showToast('已删除', 'success')
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

.draft-container {
  padding: 20rpx;
}

.tips-bar {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 24rpx;
  background: #fff5f5;
  border-radius: 12rpx;
  margin-bottom: 20rpx;

  text {
    font-size: 26rpx;
    color: #ff6b6b;
  }
}

.draft-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.draft-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  gap: 20rpx;

  &:active {
    background: #fafafa;
  }
}

.draft-cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  flex-shrink: 0;

  &.empty {
    background: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.draft-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.draft-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.draft-content {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12rpx;
}

.draft-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.draft-time {
  font-size: 24rpx;
  color: #999;
}

.draft-expire {
  font-size: 22rpx;
  color: #999;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;

  &.urgent {
    color: #ff6b6b;
    background: #fff5f5;
  }
}

.draft-actions {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20rpx;
  padding-left: 20rpx;
  border-left: 1rpx solid #f0f0f0;
}

.action-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 50%;

  &:active {
    background: #eee;
  }

  &.delete:active {
    background: #fff5f5;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx;
}

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
</style>
