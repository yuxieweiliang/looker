<template>
  <view class="feed-card" @click="onCardClick">
    <!-- 用户信息 -->
    <view class="user-row">
      <image
        class="user-avatar"
        :src="data.user.avatar"
        mode="aspectFill"
        @click.stop="onAvatarClick"
      />
      <view class="user-info">
        <text class="user-name">{{ data.user.name }}</text>
        <text class="post-time">{{ data.createdAt }}</text>
      </view>
      <AppIcon name="ellipsis" size="40rpx" color="#999" />
    </view>

    <!-- 内容 -->
    <text class="content-text">{{ data.content }}</text>

    <!-- 图片网格 -->
    <view v-if="data.images.length > 0" class="image-grid" :class="gridClass">
      <image
        v-for="(img, index) in displayedImages"
        :key="index"
        class="grid-image"
        :src="img.url"
        mode="aspectFill"
        @click.stop="onImageClick(index)"
      />
      <view v-if="hasMoreImages" class="more-overlay">
        <text class="more-text">+{{ data.images.length - 9 }}</text>
      </view>
    </view>

    <!-- 位置 -->
    <view v-if="data.location" class="location-row">
      <AppIcon name="location-o" size="24rpx" color="#999" />
      <text class="location-text">{{ data.location }}</text>
    </view>

    <!-- 操作栏 -->
    <view class="action-row">
      <view class="action-item" @click.stop="onLike">
        <AppIcon
          :name="data.isLiked ? 'like' : 'like-o'"
          size="40rpx"
          :color="data.isLiked ? '#ff6b6b' : '#666'"
        />
        <text class="action-text" :class="{ active: data.isLiked }">
          {{ formatCount(data.likes) }}
        </text>
      </view>
      <view class="action-item" @click.stop="onComment">
        <AppIcon name="comment-o" size="40rpx" color="#666" />
        <text class="action-text">{{ formatCount(data.comments) }}</text>
      </view>
      <view class="action-item" @click.stop="onShare">
        <AppIcon name="share-o" size="40rpx" color="#666" />
        <text class="action-text">{{ formatCount(data.shares) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppIcon from "./AppIcon.vue"
import { computed } from 'vue'
import type { FeedItem } from '../types'

interface Props {
  data: FeedItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  avatarClick: [userId: string]
  imageClick: [images: string[], index: number]
  like: [id: string]
  comment: [id: string]
  share: [id: string]
  cardClick: [id: string]
}>()

// 图片网格布局
const gridClass = computed(() => {
  const count = props.data.images.length
  if (count === 1) return 'grid-1'
  if (count === 2 || count === 4) return 'grid-2'
  return 'grid-3'
})

// 最多显示 9 张
const displayedImages = computed(() => {
  return props.data.images.slice(0, 9)
})

const hasMoreImages = computed(() => {
  return props.data.images.length > 9
})

// 格式化数字
const formatCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return String(count)
}

const onCardClick = () => {
  emit('cardClick', props.data.id)
}

const onAvatarClick = () => {
  emit('avatarClick', props.data.user.id)
}

const onImageClick = (index: number) => {
  const images = props.data.images.map(img => img.url)
  emit('imageClick', images, index)
}

const onLike = () => {
  emit('like', props.data.id)
}

const onComment = () => {
  emit('comment', props.data.id)
}

const onShare = () => {
  emit('share', props.data.id)
}
</script>

<style lang="scss" scoped>
.feed-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.user-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;

  .user-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
  }

  .user-info {
    flex: 1;

    .user-name {
      font-size: 30rpx;
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
}

.content-text {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  margin-bottom: 20rpx;
  display: block;
}

.image-grid {
  display: grid;
  gap: 8rpx;
  margin-bottom: 20rpx;

  &.grid-1 {
    grid-template-columns: 1fr;

    .grid-image {
      height: 400rpx;
    }
  }

  &.grid-2 {
    grid-template-columns: repeat(2, 1fr);

    .grid-image {
      height: 300rpx;
    }
  }

  &.grid-3 {
    grid-template-columns: repeat(3, 1fr);

    .grid-image {
      height: 200rpx;
    }
  }
}

.grid-image {
  width: 100%;
  border-radius: 12rpx;
}

.more-overlay {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .more-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    font-size: 40rpx;
    font-weight: 600;
    z-index: 1;
  }
}

.location-row {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;

  .location-text {
    font-size: 24rpx;
    color: #576574;
    margin-left: 8rpx;
  }
}

.action-row {
  display: flex;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.action-item {
  display: flex;
  align-items: center;
  margin-right: 60rpx;

  &:active {
    opacity: 0.7;
  }
}

.action-text {
  font-size: 26rpx;
  color: #666;
  margin-left: 12rpx;

  &.active {
    color: #ff6b6b;
  }
}
</style>
