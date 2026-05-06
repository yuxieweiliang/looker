<template>
  <view class="tab-bar">
    <view
      v-for="(item, index) in tabs"
      :key="index"
      class="tab-item"
      :class="{ active: current === index }"
      @click="onTabClick(index)"
    >
      <AppIcon
        :name="current === index ? item.activeIcon : item.icon"
        size="48rpx"
        :color="current === index ? activeColor : inactiveColor"
      />
      <text class="tab-text" :class="{ active: current === index }">
        {{ item.name }}
      </text>
      <view v-if="item.badge" class="badge">{{ item.badge }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppIcon from "./AppIcon.vue"
interface TabItem {
  name: string
  icon: string
  activeIcon: string
  path: string
  badge?: string
}

interface Props {
  current: number
  tabs: TabItem[]
  activeColor?: string
  inactiveColor?: string
}

withDefaults(defineProps<Props>(), {
  activeColor: '#ff6b6b',
  inactiveColor: '#999',
})

const emit = defineEmits<{
  change: [index: number]
}>()

const onTabClick = (index: number) => {
  emit('change', index)
}
</script>

<style lang="scss" scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(100rpx + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1rpx solid #f0f0f0;
  z-index: 1000;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 10rpx 30rpx;

  &:active {
    opacity: 0.7;
  }
}

.tab-text {
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;

  &.active {
    color: #ff6b6b;
    font-weight: 500;
  }
}

.badge {
  position: absolute;
  top: 0;
  right: 20rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: #ff6b6b;
  color: #fff;
  font-size: 20rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}
</style>
