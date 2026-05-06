<template>
  <view class="waterfall-wrapper">
    <view class="waterfall-column" :style="{ marginRight: gap + 'rpx' }">
      <view
        v-for="item in leftList"
        :key="item.id"
        class="waterfall-item"
        @click="onItemClick(item)"
      >
        <image
          class="item-image"
          :src="item.url"
          mode="widthFix"
          :style="{ borderRadius: borderRadius + 'rpx' }"
        />
        <view v-if="showInfo" class="item-info">
          <text class="item-title">{{ item.title }}</text>
          <view class="item-bottom">
            <view class="user-info">
              <image class="mini-avatar" :src="item.user.avatar" />
              <text class="mini-name">{{ item.user.name }}</text>
            </view>
            <view class="stats-info">
              <view class="view-info">
                <AppIcon name="eye" size="24rpx" color="#999" />
                <text class="view-count">{{ formatCount(item.views || 0) }}</text>
              </view>
              <view class="like-info">
                <AppIcon name="like-o" size="24rpx" color="#999" />
                <text class="like-count">{{ formatCount(item.likes) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="waterfall-column">
      <view
        v-for="item in rightList"
        :key="item.id"
        class="waterfall-item"
        @click="onItemClick(item)"
      >
        <image
          class="item-image"
          :src="item.url"
          mode="widthFix"
          :style="{ borderRadius: borderRadius + 'rpx' }"
        />
        <view v-if="showInfo" class="item-info">
          <text class="item-title">{{ item.title }}</text>
          <view class="item-bottom">
            <view class="user-info">
              <image class="mini-avatar" :src="item.user.avatar" />
              <text class="mini-name">{{ item.user.name }}</text>
            </view>
            <view class="stats-info">
              <view class="view-info">
                <AppIcon name="eye" size="24rpx" color="#999" />
                <text class="view-count">{{ formatCount(item.views || 0) }}</text>
              </view>
              <view class="like-info">
                <AppIcon name="like-o" size="24rpx" color="#999" />
                <text class="like-count">{{ formatCount(item.likes) }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from './AppIcon.vue'
import type { WaterfallItem } from '../types'

interface Props {
  list: WaterfallItem[]
  gap?: number
  borderRadius?: number
  showInfo?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  gap: 16,
  borderRadius: 16,
  showInfo: true,
})

const emit = defineEmits<{
  itemClick: [item: WaterfallItem]
}>()

// 左右分栏
const leftList = computed(() => {
  return props.list.filter((_, index) => index % 2 === 0)
})

const rightList = computed(() => {
  return props.list.filter((_, index) => index % 2 === 1)
})

const onItemClick = (item: WaterfallItem) => {
  emit('itemClick', item)
}

// 格式化数字（如：1200 -> 1.2k）
const formatCount = (count: number): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k'
  }
  return count.toString()
}
</script>

<style lang="scss" scoped>
.waterfall-wrapper {
  display: flex;
  padding: 0 16rpx;
}

.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.waterfall-item {
  margin-bottom: 16rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);

  &:active {
    opacity: 0.9;
  }
}

.item-image {
  width: 100%;
  display: block;
}

.item-info {
  padding: 20rpx;
}

.item-title {
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
  margin-bottom: 16rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
}

.mini-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}

.mini-name {
  font-size: 24rpx;
  color: #666;
}

.like-info {
  display: flex;
  align-items: center;
}

.like-count {
  font-size: 24rpx;
  color: #999;
  margin-left: 8rpx;
}

.stats-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.view-info {
  display: flex;
  align-items: center;
}

.view-count {
  font-size: 24rpx;
  color: #999;
  margin-left: 8rpx;
}
</style>
