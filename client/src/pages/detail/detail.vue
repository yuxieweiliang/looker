<template>
  <view class="page-container">
    <CustomNavbar :title="postInfo.user.name" show-back />

    <scroll-view scroll-y class="content-scroll">
      <!-- 用户信息 -->
      <view class="user-header">
        <image class="user-avatar" :src="postInfo.user.avatar" mode="aspectFill" />
        <view class="user-meta">
          <text class="user-name">{{ postInfo.user.name }}</text>
          <text class="post-time">{{ postInfo.createdAt }}</text>
        </view>
        <button
          class="follow-btn"
          :class="{ following: postInfo.isFollowing }"
          @click="toggleFollow"
        >
          {{ postInfo.isFollowing ? '已关注' : '关注' }}
        </button>
      </view>

      <!-- 内容 -->
      <view class="content-section">
        <text class="content-text">{{ postInfo.content }}</text>

        <!-- 图片列表 -->
        <view v-if="postInfo.images.length > 0" class="image-list">
          <image
            v-for="(img, index) in postInfo.images"
            :key="index"
            class="content-image"
            :src="img.url"
            mode="widthFix"
            @click="previewImage(index)"
          />
        </view>

        <!-- 话题标签 -->
        <view v-if="postInfo.topics.length > 0" class="topic-tags">
          <text
            v-for="(topic, index) in postInfo.topics"
            :key="index"
            class="topic-tag"
            @click="goToTopic(topic)"
          >
            #{{ topic }}
          </text>
        </view>

        <!-- 位置 -->
        <view v-if="postInfo.location" class="location-info">
          <AppIcon name="location-o" size="28rpx" color="#999" />
          <text>{{ postInfo.location }}</text>
        </view>
      </view>

      <!-- 互动数据 -->
      <view class="stats-bar">
        <view class="stat-item">
          <text class="stat-num">{{ postInfo.views }}</text>
          <text class="stat-label">浏览</text>
        </view>
        <view class="stat-item" @click="onLike">
          <AppIcon
            :name="postInfo.isLiked ? 'like' : 'like-o'"
            :color="postInfo.isLiked ? '#ff6b6b' : '#666'"
            size="36rpx"
          />
          <text class="stat-num" :class="{ active: postInfo.isLiked }">
            {{ postInfo.likes }}
          </text>
        </view>
        <view class="stat-item" @click="onCollect">
          <AppIcon
            :name="postInfo.isCollected ? 'star' : 'star-o'"
            :color="postInfo.isCollected ? '#f7b731' : '#666'"
            size="36rpx"
          />
          <text class="stat-num" :class="{ active: postInfo.isCollected }">
            {{ postInfo.collections }}
          </text>
        </view>
        <view class="stat-item" @click="onShare">
          <AppIcon name="share-o" color="#666" size="36rpx" />
          <text class="stat-num">{{ postInfo.shares }}</text>
        </view>
      </view>

      <!-- 评论区域 -->
      <view class="comment-section">
        <view class="section-title">
          <text>评论</text>
          <text class="comment-count">({{ comments.length }})</text>
        </view>

        <view class="comment-list">
          <view
            v-for="(comment, index) in comments"
            :key="index"
            class="comment-item"
          >
            <image class="comment-avatar" :src="comment.user.avatar" mode="aspectFill" />
            <view class="comment-content">
              <view class="comment-header">
                <text class="comment-name">{{ comment.user.name }}</text>
                <text class="comment-time">{{ comment.createdAt }}</text>
              </view>
              <text class="comment-text">{{ comment.content }}</text>
              <view class="comment-actions">
                <view class="action-btn" @click="likeComment(comment)">
                  <AppIcon
                    :name="comment.isLiked ? 'like' : 'like-o'"
                    :color="comment.isLiked ? '#ff6b6b' : '#999'"
                    size="28rpx"
                  />
                  <text>{{ comment.likes }}</text>
                </view>
                <view class="action-btn" @click="replyComment(comment)">
                  <AppIcon name="comment-o" color="#999" size="28rpx" />
                  <text>回复</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view v-if="hasMoreComments" class="load-more" @click="loadMoreComments">
          <text>加载更多评论</text>
          <AppIcon name="arrow-down" size="24rpx" color="#999" />
        </view>
      </view>
    </scroll-view>

    <!-- 底部评论栏 -->
    <view class="bottom-bar">
      <view class="comment-input" @click="showCommentInput">
        <AppIcon name="edit" size="32rpx" color="#999" />
        <text>写评论...</text>
      </view>
      <view class="action-btns">
        <view class="action-btn" @click="onLike">
          <AppIcon
            :name="postInfo.isLiked ? 'like' : 'like-o'"
            :color="postInfo.isLiked ? '#ff6b6b' : '#666'"
            size="44rpx"
          />
        </view>
        <view class="action-btn" @click="onCollect">
          <AppIcon
            :name="postInfo.isCollected ? 'star' : 'star-o'"
            :color="postInfo.isCollected ? '#f7b731' : '#666'"
            size="44rpx"
          />
        </view>
        <view class="action-btn" @click="onShare">
          <AppIcon name="share-o" color="#666" size="44rpx" />
        </view>
      </view>
    </view>

    <!-- 评论输入弹窗 -->
    <van-popup
      :show="showInput"
      position="bottom"
      custom-style="height: auto;"
      @close="showInput = false"
    >
      <view class="comment-popup">
        <textarea
          v-model="commentText"
          class="comment-textarea"
          placeholder="写下你的评论..."
          auto-focus
          fixed
        />
        <button
          class="submit-btn"
          :disabled="!commentText.trim()"
          @click="submitComment"
        >
          发送
        </button>
      </view>
    </van-popup>
  </view>
</template>

<script setup lang="ts">
import AppIcon from "../../components/AppIcon.vue"
import { ref, onMounted } from 'vue'
import { showToast } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import { getFeedDetail, toggleLike, toggleBookmark, getComments, postComment } from '../../api/content'
import { toggleFollow } from '../../api/social'
import type { FeedItem, Comment } from '../../types'

const postInfo = ref<FeedItem>({
  id: '',
  user: {
    id: '',
    name: '',
    avatar: '',
  },
  content: '',
  images: [],
  topics: [],
  location: '',
  views: 0,
  likes: 0,
  collections: 0,
  shares: 0,
  comments: 0,
  isLiked: false,
  isCollected: false,
  isFollowing: false,
  createdAt: '',
})

const comments = ref<Comment[]>([])
const hasMoreComments = ref(true)
const showInput = ref(false)
const commentText = ref('')
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)

// 获取动态详情
const fetchDetail = async () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const id = currentPage?.$page?.options?.id

  if (!id) {
    showToast('动态ID不存在')
    return
  }

  try {
    const res = await getFeedDetail(id)
    if (res.code === 0 && res.data) {
      postInfo.value = res.data
      // 获取评论列表
      await fetchComments()
    } else {
      showToast(res.message || '获取详情失败')
    }
  } catch (error) {
    console.error('获取详情失败', error)
    showToast('获取详情失败')
  }
}

// 获取评论列表
const fetchComments = async (isRefresh = false) => {
  if (loading.value || !hasMoreComments.value) return
  loading.value = true

  try {
    if (isRefresh) {
      page.value = 1
      comments.value = []
    }

    const res = await getComments({
      targetId: postInfo.value.id,
      targetType: 'feed',
      page: page.value,
      pageSize: pageSize.value,
    })

    if (res.code === 0 && res.data) {
      comments.value.push(...res.data.list)
      hasMoreComments.value = res.data.hasMore
      page.value++
    }
  } catch (error) {
    console.error('获取评论失败', error)
  } finally {
    loading.value = false
  }
}

const toggleFollow = async () => {
  try {
    const res = await toggleFollow(postInfo.value.user.id)
    if (res.code === 0) {
      postInfo.value.isFollowing = res.data.isFollowing
      showToast(postInfo.value.isFollowing ? '关注成功' : '已取消关注')
    } else {
      showToast(res.message || '操作失败')
    }
  } catch (error) {
    console.error('关注操作失败', error)
    showToast('操作失败')
  }
}

const onLike = async () => {
  try {
    const res = await toggleLike('feed', postInfo.value.id)
    if (res.code === 0) {
      postInfo.value.isLiked = res.data.isLiked
      postInfo.value.likes = res.data.likes
    } else {
      showToast(res.message || '操作失败')
    }
  } catch (error) {
    console.error('点赞失败', error)
    showToast('操作失败')
  }
}

const onCollect = async () => {
  try {
    const res = await toggleBookmark(postInfo.value.id)
    if (res.code === 0) {
      postInfo.value.isCollected = res.data.isBookmarked
      postInfo.value.collections += postInfo.value.isCollected ? 1 : -1
      showToast(postInfo.value.isCollected ? '收藏成功' : '已取消收藏')
    } else {
      showToast(res.message || '操作失败')
    }
  } catch (error) {
    console.error('收藏操作失败', error)
    showToast('操作失败')
  }
}

const onShare = () => {
  // #ifdef APP-PLUS
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    title: postInfo.value.content.slice(0, 50) || '精彩作品分享',
    summary: `来自 ${postInfo.value.user.name} 的作品`,
    imageUrl: postInfo.value.images[0]?.url || '',
    href: `https://your-domain.com/detail/${postInfo.value.id}`,
    success: () => {
      showToast('分享成功', 'success')
      postInfo.value.shares++
    },
    fail: (err) => {
      console.error('分享失败:', err)
      showToast('分享失败')
    },
  })
  // #endif

  // #ifdef MP-WEIXIN
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline'],
  })
  // #endif

  // #ifdef H5
  // H5 使用剪贴板复制链接
  uni.setClipboardData({
    data: `https://your-domain.com/detail/${postInfo.value.id}`,
    success: () => {
      showToast('链接已复制，快去分享吧', 'success')
    },
  })
  // #endif
}

const previewImage = (index: number) => {
  const urls = postInfo.value.images.map(img => img.url)
  uni.previewImage({
    urls,
    current: urls[index],
  })
}

const goToTopic = (topic: string) => {
  uni.navigateTo({
    url: `/pages/topic/topic?name=${topic}`,
  })
}

const likeComment = async (comment: Comment) => {
  try {
    const res = await toggleLike('comment', comment.id)
    if (res.code === 0) {
      comment.isLiked = res.data.isLiked
      comment.likes = res.data.likes
    } else {
      showToast(res.message || '操作失败')
    }
  } catch (error) {
    console.error('点赞失败', error)
    showToast('操作失败')
  }
}

const replyComment = (comment: Comment) => {
  showInput.value = true
  commentText.value = `@${comment.user.name} `
}

const showCommentInput = () => {
  showInput.value = true
}

const submitComment = async () => {
  if (!commentText.value.trim()) return

  try {
    const res = await postComment({
      targetId: postInfo.value.id,
      targetType: 'feed',
      content: commentText.value,
    })

    if (res.code === 0 && res.data) {
      comments.value.unshift(res.data)
      commentText.value = ''
      showInput.value = false
      postInfo.value.comments++
      showToast('评论成功', 'success')
    } else {
      showToast(res.message || '评论失败')
    }
  } catch (error) {
    console.error('评论失败', error)
    showToast('评论失败，请重试')
  }
}

const loadMoreComments = () => {
  fetchComments()
}

onMounted(() => {
  fetchDetail()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #fff;
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
}

.content-scroll {
  height: calc(100vh - 200rpx);
}

.user-header {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.user-meta {
  flex: 1;

  .user-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    display: block;
  }

  .post-time {
    font-size: 24rpx;
    color: #999;
    margin-top: 4rpx;
    display: block;
  }
}

.follow-btn {
  font-size: 28rpx;
  color: #fff;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  padding: 12rpx 32rpx;
  border-radius: 30rpx;
  line-height: 1;

  &.following {
    background: #f0f0f0;
    color: #666;
  }

  &::after {
    display: none;
  }
}

.content-section {
  padding: 30rpx;
}

.content-text {
  font-size: 32rpx;
  color: #333;
  line-height: 1.8;
  display: block;
  margin-bottom: 20rpx;
}

.image-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.content-image {
  width: 100%;
  border-radius: 16rpx;
}

.topic-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.topic-tag {
  font-size: 28rpx;
  color: #576574;
}

.location-info {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #999;

  text {
    margin-left: 8rpx;
  }
}

.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 30rpx;
  border-top: 1rpx solid #f5f5f5;
  border-bottom: 1rpx solid #f5f5f5;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.stat-num {
  font-size: 32rpx;
  color: #666;
  font-weight: 600;

  &.active {
    color: #ff6b6b;
  }
}

.stat-label {
  font-size: 26rpx;
  color: #999;
}

.comment-section {
  padding: 30rpx;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 30rpx;

  .comment-count {
    font-size: 28rpx;
    color: #999;
    margin-left: 12rpx;
  }
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.comment-item {
  display: flex;
}

.comment-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.comment-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #576574;
}

.comment-time {
  font-size: 24rpx;
  color: #999;
}

.comment-text {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  display: block;
  margin-bottom: 16rpx;
}

.comment-actions {
  display: flex;
  gap: 30rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #999;
}

.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
  font-size: 28rpx;
  color: #999;
  gap: 8rpx;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(100rpx + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
}

.comment-input {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 36rpx;
  padding: 16rpx 30rpx;
  margin-right: 30rpx;

  text {
    font-size: 28rpx;
    color: #999;
    margin-left: 16rpx;
  }
}

.action-btns {
  display: flex;
  gap: 30rpx;
}

.comment-popup {
  padding: 30rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
}

.comment-textarea {
  width: 100%;
  height: 200rpx;
  background: #f5f5f5;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 30rpx;
  margin-bottom: 20rpx;
}

.submit-btn {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: #fff;
  font-size: 30rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &:disabled {
    opacity: 0.5;
  }

  &::after {
    display: none;
  }
}
</style>
