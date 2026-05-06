<template>
  <view class="page-container">
    <view class="comment-header" :style="headerStyle">
      <view class="header-left" @click="goBack">
        <AppIcon name="arrow-left" size="44rpx" color="#333" />
      </view>
      <text class="header-title">评论 ({{ total }})</text>
      <view class="header-right"></view>
    </view>

    <!-- 评论列表 -->
    <scroll-view
      scroll-y
      class="comment-list"
      :style="scrollStyle"
      @scrolltolower="loadMore"
    >
      <!-- 原帖信息 -->
      <view v-if="postInfo" class="post-preview">
        <image class="preview-image" :src="postInfo.cover" mode="aspectFill" />
        <view class="preview-info">
          <text class="preview-title">{{ postInfo.title }}</text>
          <text class="preview-author">@{{ postInfo.author }}</text>
        </view>
      </view>

      <!-- 热门评论 -->
      <view v-if="hotComments.length > 0" class="comment-section">
        <view class="section-title">
          <AppIcon name="fire-o" size="32rpx" color="#ff6b6b" />
          <text>热门评论</text>
        </view>
        <CommentItem
          v-for="item in hotComments"
          :key="item.id"
          :data="item"
          @like="onLike"
          @reply="onReply"
        />
      </view>

      <!-- 全部评论 -->
      <view class="comment-section">
        <view class="section-title">
          <text>全部评论</text>
          <view class="sort-tabs">
            <text
              v-for="(tab, index) in sortTabs"
              :key="index"
              class="sort-tab"
              :class="{ active: currentSort === index }"
              @click="currentSort = index"
            >
              {{ tab }}
            </text>
          </view>
        </view>
        <CommentItem
          v-for="item in comments"
          :key="item.id"
          :data="item"
          @like="onLike"
          @reply="onReply"
          @reply-to-reply="onReplyToReply"
        />
      </view>

      <!-- 加载状态 -->
      <view class="load-more">
        <AppLoading v-if="loading" type="spinner" size="32rpx" />
        <text v-else-if="!hasMore" class="no-more">没有更多评论了</text>
      </view>
    </scroll-view>

    <!-- 评论输入框 -->
    <view class="comment-input-bar">
      <view class="input-wrapper">
        <input
          v-model="commentText"
          class="comment-input"
          :placeholder="placeholderText"
          confirm-type="send"
          @confirm="submitComment"
        />
      </view>
      <view class="input-actions">
        <AppIcon name="smile-o" size="48rpx" color="#666" @click="showEmoji" />
        <button
          class="send-btn"
          :disabled="!canSubmit"
          :class="{ active: canSubmit }"
          @click="submitComment"
        >
          发送
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppLoading from "../../components/AppLoading.vue"
import AppIcon from "../../components/AppIcon.vue"
import { ref, computed, onMounted } from 'vue'
import { useSystemInfo, showToast } from '../../utils/uniapi'
import CommentItem from '../../components/CommentItem.vue'
import { getComments, postComment as apiPostComment, toggleLike } from '../../api/content'
import type { Comment } from '../../types'

const { statusBarHeight } = useSystemInfo()

// 页面参数
const _postId = ref('')
const targetType = ref('feed') // 评论目标类型：feed/comment

const postInfo = ref({
  title: '',
  author: '',
  cover: '',
})

const comments = ref<Comment[]>([])
const hotComments = ref<Comment[]>([])
const total = ref(0)
const commentText = ref('')
const replyTo = ref('')
const replyToId = ref('') // 回复的评论ID
const loading = ref(false)
const hasMore = ref(true)
const currentSort = ref(0)
const sortTabs = ['最热', '最新']
const page = ref(1)
const pageSize = ref(20)

const headerStyle = computed(() => ({
  paddingTop: `${statusBarHeight}px`,
}))

const scrollStyle = computed(() => ({
  paddingTop: `${(statusBarHeight || 0) + 88}px`,
  paddingBottom: '120rpx',
  height: '100vh',
}))

const canSubmit = computed(() => {
  return commentText.value.trim().length > 0
})

const placeholderText = computed(() => {
  if (replyTo.value) {
    return '回复 ' + replyTo.value + '：'
  }
  return '说点什么...'
})

const fetchComments = async (isRefresh = false) => {
  if (loading.value) return
  loading.value = true

  try {
    if (isRefresh) {
      page.value = 1
      comments.value = []
      hotComments.value = []
    }

    if (!_postId.value) {
      loading.value = false
      return
    }

    const res = await getComments({
      targetId: _postId.value,
      targetType: targetType.value,
      page: page.value,
      pageSize: pageSize.value,
    })

    if (res.code === 0 && res.data) {
      const list = res.data.list.map(item => ({
        id: item.id,
        user: item.user,
        content: item.content,
        likes: item.likes,
        isLiked: item.isLiked,
        replies: item.replies,
        replyTo: item.replyTo,
        createdAt: formatTime(item.createdAt),
      }))

      comments.value.push(...list)
      total.value = res.data.total
      hasMore.value = res.data.hasMore

      // 前3条作为热门评论
      if (isRefresh && list.length > 0) {
        hotComments.value = list.slice(0, 3).filter(c => c.likes > 0)
      }
    }

    page.value++
  } catch (error) {
    console.error('获取评论失败', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
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
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

const loadMore = () => {
  fetchComments()
}

const onLike = async (id: string) => {
  try {
    const res = await toggleLike('comment', id)
    if (res.code === 0) {
      const comment = comments.value.find(c => c.id === id)
      if (comment) {
        comment.isLiked = res.data.isLiked
        comment.likes = res.data.likes
      }
    } else {
      showToast(res.message || '操作失败')
    }
  } catch (error) {
    console.error('点赞失败', error)
    showToast('操作失败')
  }
}

const onReply = (userName: string, commentId?: string) => {
  replyTo.value = userName
  if (commentId) {
    replyToId.value = commentId
  }
}

const onReplyToReply = (userName: string, replyId?: string) => {
  replyTo.value = userName
  if (replyId) {
    replyToId.value = replyId
  }
}

const submitComment = async () => {
  if (!canSubmit.value) return

  try {
    const res = await apiPostComment({
      targetId: replyToId.value || _postId.value,
      targetType: targetType.value,
      content: replyTo.value
        ? `回复 ${replyTo.value}: ${commentText.value}`
        : commentText.value,
      parentId: replyToId.value || undefined,
    })

    if (res.code === 0 && res.data) {
      const newComment: Comment = {
        id: res.data.id,
        user: res.data.user,
        content: res.data.content,
        likes: 0,
        isLiked: false,
        createdAt: '刚刚',
      }

      comments.value.unshift(newComment)
      commentText.value = ''
      replyTo.value = ''
      replyToId.value = ''
      total.value++

      showToast('评论成功', 'success')
    } else {
      showToast(res.message || '评论失败')
    }
  } catch (error) {
    console.error('评论失败', error)
    showToast('评论失败，请重试')
  }
}

const showEmoji = () => {
  uni.showToast({
    title: '表情功能开发中',
    icon: 'none',
  })
}

const goBack = () => {
  uni.navigateBack()
}

onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const options = currentPage?.$page?.options || {}

  if (options.id) {
    _postId.value = options.id
  }
  if (options.type) {
    targetType.value = options.type
  }

  fetchComments(true)
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.comment-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
  z-index: 100;
  border-bottom: 1rpx solid #f0f0f0;
}

.header-left,
.header-right {
  width: 80rpx;
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.comment-list {
  box-sizing: border-box;
}

.post-preview {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .preview-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
  }

  .preview-info {
    flex: 1;

    .preview-title {
      font-size: 30rpx;
      color: #333;
      font-weight: 500;
      display: block;
      margin-bottom: 12rpx;
    }

    .preview-author {
      font-size: 26rpx;
      color: #999;
    }
  }
}

.comment-section {
  background: #fff;
  margin-bottom: 20rpx;
  padding: 0 30rpx;
}

.section-title {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;

  text {
    margin-left: 12rpx;
  }
}

.sort-tabs {
  display: flex;
  margin-left: auto;
  gap: 30rpx;
}

.sort-tab {
  font-size: 28rpx;
  color: #666;
  font-weight: normal;

  &.active {
    color: #ff6b6b;
    font-weight: 600;
  }
}

.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.no-more {
  font-size: 26rpx;
  color: #999;
}

.comment-input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  border-top: 1rpx solid #f0f0f0;
}

.input-wrapper {
  flex: 1;
  background: #f5f5f5;
  border-radius: 40rpx;
  padding: 0 30rpx;
  margin-right: 20rpx;
}

.comment-input {
  height: 80rpx;
  font-size: 30rpx;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.send-btn {
  width: 100rpx;
  height: 64rpx;
  background: #ddd;
  color: #fff;
  font-size: 28rpx;
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &.active {
    background: #ff6b6b;
  }
}
</style>
