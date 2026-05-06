<template>
  <text
    class="app-icon"
    :class="iconClass"
    :style="iconStyle"
    @click="$emit('click', $event)"
  >
    {{ iconChar }}
  </text>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// FontAwesome Unicode 映射表 (Free 版本)
const iconMap: Record<string, { char: string; weight: '400' | '900' }> = {
  // 导航
  'arrow-left': { char: '\uf060', weight: '900' },
  'arrow': { char: '\uf061', weight: '900' },
  'arrow-down': { char: '\uf063', weight: '900' },
  'arrow-up': { char: '\uf062', weight: '900' },
  // 操作
  'search': { char: '\uf002', weight: '900' },
  'ellipsis': { char: '\uf141', weight: '900' },
  'cross': { char: '\uf00d', weight: '900' },
  'plus': { char: '\uf067', weight: '900' },
  'close': { char: '\uf00d', weight: '900' },
  // 社交/互动
  'like': { char: '\u{f004}', weight: '900' },      // solid heart
  'like-o': { char: '\u{f004}', weight: '400' },    // regular heart
  'heart-filled': { char: '\u{f004}', weight: '900' },
  'heart': { char: '\u{f004}', weight: '400' },
  'comment-o': { char: '\u{f075}', weight: '400' },
  'comment': { char: '\u{f075}', weight: '900' },
  'share-o': { char: '\uf1e0', weight: '400' },
  'share': { char: '\uf1e0', weight: '900' },
  // 状态/统计
  'eye-o': { char: '\uf06e', weight: '400' },
  'eye': { char: '\uf06e', weight: '900' },
  'eye-filled': { char: '\uf06e', weight: '900' },
  'star-o': { char: '\uf005', weight: '400' },
  'star': { char: '\uf005', weight: '900' },
  'fire-o': { char: '\uf7e4', weight: '400' },
  'fire': { char: '\uf7e4', weight: '900' },
  // 功能
  'location-o': { char: '\uf3c5', weight: '400' },
  'location': { char: '\uf3c5', weight: '900' },
  'photo-o': { char: '\uf03e', weight: '400' },
  'photo': { char: '\uf03e', weight: '900' },
  'smile-o': { char: '\uf118', weight: '400' },
  'smile': { char: '\uf118', weight: '900' },
  'edit': { char: '\uf044', weight: '400' },
  'clock-o': { char: '\uf017', weight: '400' },
  'clock': { char: '\uf017', weight: '900' },
  'delete-o': { char: '\uf2ed', weight: '400' },
  'delete': { char: '\uf2ed', weight: '900' },
  'shield-o': { char: '\uf3ed', weight: '400' },
  'shield': { char: '\uf3ed', weight: '900' },
  'phone-o': { char: '\uf095', weight: '400' },
  'phone': { char: '\uf095', weight: '900' },
  'success': { char: '\uf00c', weight: '900' },
  'check': { char: '\uf00c', weight: '900' },
  // TabBar 图标
  'home': { char: '\uf015', weight: '900' },
  'home-o': { char: '\uf015', weight: '400' },
  'square': { char: '\uf0c9', weight: '900' },
  'square-o': { char: '\uf0c9', weight: '400' },
  'user': { char: '\uf007', weight: '900' },
  'user-o': { char: '\uf007', weight: '400' },
  'plus-circle': { char: '\uf055', weight: '900' },
  // 默认
  'default': { char: '\uf111', weight: '400' }
}

interface Props {
  name: string
  size?: string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: '40rpx',
  color: '#666'
})

defineEmits<{
  click: [event: any]
}>()

const iconData = computed(() => {
  return iconMap[props.name] || iconMap['default']
})

// iOS 兼容：Regular 字重在 iOS 上可能无法加载，使用 Solid 配合透明度模拟
const isOutline = computed(() => iconData.value.weight === '400')

const iconChar = computed(() => {
  return iconData.value.char
})

const iconClass = computed(() => {
  // 统一使用 fas (900) 避免 iOS 字体加载问题
  return 'fas'
})

const iconStyle = computed(() => {
  return {
    fontSize: props.size,
    color: props.color,
    fontWeight: 900,
    opacity: isOutline.value ? 0.6 : 1 // outline 图标降低透明度
  }
})
</script>

<style lang="scss">
/* 全局样式 - 确保字体生效 */
.app-icon {
  font-family: 'Font Awesome 6 Free', 'FontAwesome', sans-serif !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-style: normal;
  font-variant: normal;
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.fas {
  font-weight: 900 !important;
}

.far {
  font-weight: 400 !important;
}
</style>
