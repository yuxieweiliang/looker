<template>
  <view class="comment-item">
    <image class="avatar" :src="data.user.avatar" mode="aspectFill" />
    <view class="content">
      <view class="header">
        <view class="user-info">
          <text class="username">{{ data.user.name }}</text>
          <view v-if="data.replyTo" class="reply-info">
            <text class="reply-text">回复</text>
            <text class="reply-user">{{ data.replyTo }}</text>
          </view>
        </view>
        <view class="like-btn" @click="onLike">
          <AppIcon
            :name="data.isLiked ? 'like' : 'like-o'"
            size="32rpx"
            :color="data.isLiked ? '#ff6b6b' : '#999'"
          />
          <text class="like-count" :class="{ active: data.isLiked }">
            {{ formatCount(data.likes) }}
          </text>
        </view>
      </view>
      <text class="comment-text">{{ data.content }}</text>
      <view class="footer">
        <text class="time">{{ data.createdAt }}</text>
        <text class="reply-btn" @click="onReply">回复</text>
        <text
          v-if="data.replies && data.replies > 0"
          class="replies-count"
          @click="toggleReplies"
        >
          {{ showReplies ? '收起' : `${data.replies} 条回复` }}
        </text>
      </view>

      <!-- 回复列表 -->
      <view v-if="showReplies && replyList.length > 0" class="reply-list">
        <view
          v-for="reply in replyList"
          :key="reply.id"
          class="reply-item"
          @click="onReplyToReply(reply.user.name)"
        >
          <text class="reply-username">{{ reply.user.name }}</text>
          <text v-if="reply.replyTo" class="reply-text">回复</text>
          <text v-if="reply.replyTo" class="reply-to-user">{{ reply.replyTo }}</text>
          <text class="reply-content">{{ reply.content }}</text>
        </view>
        <view v-if="hasMoreReplies" class="view-more" @click="loadMoreReplies">
          <text>查看更多回复</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from "./AppIcon.vue"
import { getComments } from '../api/content'

interface Reply {
  id: string
  user: {
    id: string
    name: string
    avatar: string
  }
  content: string
  replyTo?: string
}

interface CommentData {
  id: string
  user: {
    id: string
    name: string
    avatar: string
  }
  content: string
  likes: number
  isLiked: boolean
  replies?: number
  replyTo?: string
  createdAt: string
}

interface Props {
  data: CommentData
}

const props = defineProps<Props>()

const emit = defineEmits<{
  like: [id: string]
  reply: [userName: string, commentId: string]
  replyToReply: [userName: string, replyId: string]
}>()

const showReplies = ref(false)
const replyList = ref<Reply[]>([])
const hasMoreReplies = ref(false)
const loadingReplies = ref(false)
const replyPage = ref(1)
const replyPageSize = ref(5)

const formatCount = (count: number): string => {
  if (count >= 10000) return (count / 10000).toFixed(1) + 'w'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'k'
  return String(count)
}

const onLike = () => {
  emit('like', props.data.id)
}

const onReply = () => {
  emit('reply', props.data.user.name, props.data.id)
}

const onReplyToReply = (userName: string, replyId: string) => {
  emit('replyToReply', userName, replyId)
}

// 展开/收起回复
const toggleReplies = async () => {
  showReplies.value = !showReplies.value
  if (showReplies.value && replyList.value.length === 0) {
    await loadReplies()
  }
}

// 加载回复列表
const loadReplies = async (isLoadMore = false) => {
  if (loadingReplies.value) return
  loadingReplies.value = true

  try {
    if (!isLoadMore) {
      replyPage.value = 1
      replyList.value = []
    }

    const res = await getComments({
      targetId: props.data.id,
      targetType: 'comment',
      page: replyPage.value,
      pageSize: replyPageSize.value,
    })

    if (res.code === 0 && res.data) {
      const replies = res.data.list.map(item => ({
        id: item.id,
        user: item.user,
        content: item.content,
        replyTo: item.replyTo,
      }))

      if (isLoadMore) {
        replyList.value.push(...replies)
      } else {
        replyList.value = replies
      }

      hasMoreReplies.value = res.data.hasMore
      replyPage.value++
    }
  } catch (error) {
    console.error('加载回复失败', error)
  } finally {
    loadingReplies.value = false
  }
}

// 加载更多回复
const loadMoreReplies = async () => {
  await loadReplies(true)
}
</script>

<style lang="scss" scoped>
.comment-item {
  display: flex;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.content {
  flex: 1;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.user-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.username {
  font-size: 28rpx;
  color: #666;
}

.reply-info {
  display: flex;
  align-items: center;
  margin-left: 16rpx;

  .reply-text {
    font-size: 26rpx;
    color: #999;
  }

  .reply-user {
    font-size: 28rpx;
    color: #576574;
    margin-left: 8rpx;
  }
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.like-count {
  font-size: 26rpx;
  color: #999;

  &.active {
    color: #ff6b6b;
  }
}

.comment-text {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 16rpx;
  display: block;
}

.footer {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.time {
  font-size: 24rpx;
  color: #999;
}

.reply-btn {
  font-size: 26rpx;
  color: #576574;
}

.replies-count {
  font-size: 24rpx;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
}

// 回复列表样式
.reply-list {
  margin-top: 20rpx;
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 20rpx;
}

.reply-item {
  padding: 12rpx 0;
  font-size: 28rpx;
  line-height: 1.5;

  .reply-username {
    color: #576574;
    font-weight: 500;
  }

  .reply-text {
    color: #999;
    margin: 0 8rpx;
  }

  .reply-to-user {
    color: #576574;
    margin-right: 8rpx;
  }

  .reply-content {
    color: #333;
  }

  &:active {
    opacity: 0.7;
  }
}

.view-more {
  padding: 16rpx 0;
  text-align: center;

  text {
    font-size: 26rpx;
    color: #ff6b6b;
  }
}
</style>
