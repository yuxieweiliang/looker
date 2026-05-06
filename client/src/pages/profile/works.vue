<template>
  <view class="page-container">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar" :style="navbarStyle">
      <view class="navbar-inner" :style="innerStyle">
        <view class="back-btn" @click="onBack">
          <AppIcon name="arrow-left" size="40rpx" color="#333" />
        </view>
        <text class="navbar-title">{{ pageTitle }}</text>
        <view class="navbar-right" />
      </view>
    </view>

    <!-- Tab 切换栏 -->
    <view class="tab-bar" :style="tabBarStyle">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        class="tab-item"
        :class="{ active: currentTab === index }"
        @click="onTabClick(index)"
      >
        <text class="tab-text">{{ tab.name }}(<text class="tab-count">{{ tab.count }}</text>)</text>
      </view>
      <view class="tab-indicator" :style="indicatorStyle" />
    </view>

    <!-- 内容区域 -->
    <scroll-view
      scroll-y
      class="content-scroll"
      :style="scrollStyle"
      @scrolltolower="onLoadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 瀑布流列表 -->
      <view class="waterfall-section">
        <WaterfallList
          :list="contentList"
          :gap="16"
          :border-radius="16"
          @item-click="onItemClick"
        />

        <!-- 空状态 -->
        <view v-if="contentList.length === 0 && !loading" class="empty-state">
          <AppIcon :name="emptyIcon" size="120rpx" color="#ddd" />
          <text class="empty-text">{{ emptyText }}</text>
        </view>

        <!-- 加载状态 -->
        <view class="load-more">
          <AppLoading v-if="loading" type="spinner" size="32rpx" />
          <text v-else-if="!hasMore && contentList.length > 0" class="no-more">没有更多了</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSystemInfo } from '../../utils/uniapi'
import WaterfallList from '../../components/WaterfallList.vue'
import AppIcon from '../../components/AppIcon.vue'
import AppLoading from '../../components/AppLoading.vue'
import { getUserWorks, getUserCollections, getHistory } from '../../api/user'
import { showToast } from '../../utils/uniapi'

const { statusBarHeight, navContentHeight } = useSystemInfo()

// 获取页面参数
const pageInstance = getCurrentPages()[getCurrentPages().length - 1] as any
const initialType = (pageInstance?.$page?.options?.type || 'works') as 'works' | 'collect' | 'history'

// Tab 配置
const tabs = [
  { name: '作品', key: 'works', count: 0 },
  { name: '收藏', key: 'collect', count: 0 },
  { name: '历史', key: 'history', count: 0 },
]

// 当前激活的 tab
const currentTab = ref(tabs.findIndex(t => t.key === initialType) || 0)

// 页面标题
const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    works: '我的作品',
    collect: '我的收藏',
    history: '浏览历史',
  }
  return titles[tabs[currentTab.value].key] || '我的作品'
})

// 空状态图标
const emptyIcon = computed(() => {
  const icons: Record<string, string> = {
    works: 'photo-o',
    collect: 'star-o',
    history: 'clock-o',
  }
  return icons[tabs[currentTab.value].key] || 'photo-o'
})

// 空状态文本
const emptyText = computed(() => {
  const texts: Record<string, string> = {
    works: '还没有发布作品，快去创作吧',
    collect: '还没有收藏内容，去发现精彩吧',
    history: '还没有浏览记录，去探索吧',
  }
  return texts[tabs[currentTab.value].key] || '暂无内容'
})

// 数据状态
const contentList = ref<WaterfallItem[]>([])
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const page = ref(1)

// 导航栏样式
const navbarStyle = computed(() => ({
  paddingTop: `${statusBarHeight}px`,
  backgroundColor: '#fff',
}))

const innerStyle = computed(() => ({
  height: `${navContentHeight}px`,
}))

// Tab 栏样式（固定位置）
const tabBarHeight = 88 // rpx
const tabBarStyle = computed(() => ({
  top: `${statusBarHeight + navContentHeight}px`,
}))

// 滚动区域样式
const scrollStyle = computed(() => ({
  marginTop: `${statusBarHeight + navContentHeight + 44}px`,
  height: `calc(100vh - ${statusBarHeight + navContentHeight + 44}px)`,
}))

// Tab 指示器位置
const indicatorStyle = computed(() => ({
  transform: `translateX(${currentTab.value * 100}%)`,
}))

// 获取内容数据
const fetchContent = async (isRefresh = false) => {
  if (loading.value) return
  loading.value = true

  const currentKey = tabs[currentTab.value].key

  try {
    if (currentKey === 'works') {
      const res = await getUserWorks({ page: page.value, pageSize: 10 })
      if (res.code === 0 && res.data) {
        const list = res.data.list.map(item => ({
          id: item.id,
          url: item.images?.[0]?.url || '',
          title: item.content.slice(0, 50),
          user: item.user,
          likes: item.likes,
          views: 0,
        }))
        if (isRefresh) {
          contentList.value = list
        } else {
          contentList.value.push(...list)
        }
        hasMore.value = res.data.hasMore
        tabs[0].count = res.data.total || 0
      }
    } else if (currentKey === 'collect') {
      const res = await getUserCollections({ page: page.value, pageSize: 10 })
      if (res.code === 0 && res.data) {
        const list = res.data.list.map(item => ({
          id: item.id,
          url: item.images?.[0]?.url || '',
          title: item.content.slice(0, 50),
          user: item.user,
          likes: item.likes,
          views: 0,
        }))
        if (isRefresh) {
          contentList.value = list
        } else {
          contentList.value.push(...list)
        }
        hasMore.value = res.data.hasMore
        tabs[1].count = res.data.total || 0
      }
    } else if (currentKey === 'history') {
      const res = await getHistory({ page: page.value, pageSize: 10 })
      if (res.code === 0 && res.data) {
        const list = res.data.list.map(item => ({
          id: item.id,
          url: item.image,
          title: item.title,
          user: { id: '', name: '', avatar: '' },
          likes: 0,
          views: 0,
        }))
        if (isRefresh) {
          contentList.value = list
        } else {
          contentList.value.push(...list)
        }
        hasMore.value = res.data.hasMore
        tabs[2].count = res.data.total || 0
      }
    }

    page.value++
  } catch (error) {
    console.error('获取内容失败', error)
    showToast('获取内容失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// Tab 切换
const onTabClick = (index: number) => {
  if (currentTab.value === index) return
  currentTab.value = index
  page.value = 1
  contentList.value = []
  hasMore.value = true
  fetchContent(true)
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  page.value = 1
  fetchContent(true)
}

// 上拉加载
const onLoadMore = () => {
  if (!hasMore.value || loading.value) return
  fetchContent()
}

// 返回
const onBack = () => {
  uni.navigateBack()
}

// 点击作品
const onItemClick = (item: WaterfallItem) => {
  uni.navigateTo({
    url: `/pages/detail/detail?id=${item.id}`,
  })
}

onMounted(() => {
  fetchContent()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

// 自定义导航栏
.custom-navbar {
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

.back-btn {
  width: 80rpx;
  display: flex;
  align-items: center;
}

.navbar-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.navbar-right {
  width: 80rpx;
}

// Tab 栏
.tab-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
  height: 88rpx;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  position: relative;
}

.tab-text {
  font-size: 30rpx;
  color: #666;
  transition: all 0.3s ease;

  .tab-item.active & {
    color: #ff6b6b;
    font-weight: 600;
  }
}

.tab-count {
  font-size: 22rpx;
  color: #999;
  transition: all 0.3s ease;

  .tab-item.active & {
    color: #ff6b6b;
  }
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 33.33%;
  height: 4rpx;
  background: #ff6b6b;
  transition: transform 0.3s ease;
}

// 内容区域
.content-scroll {
  box-sizing: border-box;
}

.waterfall-section {
  padding: 20rpx;
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 60rpx;
}

.empty-text {
  margin-top: 30rpx;
  font-size: 28rpx;
  color: #999;
}

// 加载更多
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
</style>
