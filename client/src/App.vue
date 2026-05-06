<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('Looker App Launch')
})

onShow(() => {
  console.log('Looker App Show')
})

onHide(() => {
  console.log('Looker App Hide')
})
</script>

<style lang="scss">
@import 'styles/index';
@import 'styles/fontawesome';
</style>
