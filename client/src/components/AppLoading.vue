<template>
  <view class="app-loading">
    <view class="spinner" :style="spinnerStyle"></view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'spinner' | 'circular'
  size?: string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'spinner',
  size: '32rpx',
  color: '#ff6b6b'
})

const spinnerStyle = computed(() => ({
  width: props.size,
  height: props.size,
  borderColor: `${props.color} transparent transparent transparent`
}))
</script>

<style lang="scss">
.app-loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 3rpx solid;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
