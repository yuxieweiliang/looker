<template>
  <view class="navbar" :style="navbarStyle">
    <view class="navbar-inner" :style="innerStyle">
      <view class="left" @click="onBack">
        <AppIcon
          v-if="showBack"
          name="arrow-left"
          size="40rpx"
          color="#333"
        />
        <slot name="left" />
      </view>
      <view class="center">
        <text class="title">{{ title }}</text>
        <slot name="center" />
      </view>
      <view class="right">
        <slot name="right" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppIcon from "./AppIcon.vue"
import { computed } from 'vue'
import { useSystemInfo } from '../utils/uniapi'

interface Props {
  title?: string
  showBack?: boolean
  backgroundColor?: string
  textColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showBack: true,
  backgroundColor: '#fff',
  textColor: '#333',
})

const emit = defineEmits<{
  back: []
}>()

const { statusBarHeight, navContentHeight } = useSystemInfo()

const navbarStyle = computed(() => ({
  paddingTop: `${statusBarHeight}px`,
  backgroundColor: props.backgroundColor,
}))

const innerStyle = computed(() => ({
  height: `${navContentHeight}px`,
}))

const onBack = (e?: Event) => {
  if (props.showBack) {
    emit('back')
    const pages = getCurrentPages()
    if (pages.length > 1) {
      uni.navigateBack()
    } else {
      // 浏览器环境或页面栈为空时，跳转首页
      uni.reLaunch({ url: '/pages/home/home' })
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20rpx;
}

.left,
.right {
  width: 80rpx;
  display: flex;
  align-items: center;
}

.right {
  justify-content: flex-end;
}

.center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}
</style>
