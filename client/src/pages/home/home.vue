<template>
  <view class="page-container">
    <!-- 导航栏 -->
    <CustomNavbar title="看客" :show-back="false">
      <template #right>
        <AppIcon
          name="search"
          size="44rpx"
          color="#333"
          @click="onSearch"
        />
      </template>
    </CustomNavbar>

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
      <!-- 轮播图 -->
      <swiper
        class="banner-swiper"
        :indicator-dots="true"
        :autoplay="true"
        :interval="3000"
        :circular="true"
      >
        <swiper-item
          v-for="(item, index) in banners"
          :key="index"
          @click="onBannerClick(item)"
        >
          <image class="banner-image" :src="item.image" mode="aspectFill" />
          <view v-if="item.title" class="banner-title">
            <text>{{ item.title }}</text>
          </view>
        </swiper-item>
      </swiper>

      <!-- 分类标签 -->
      <scroll-view scroll-x class="category-scroll" :show-scrollbar="false">
        <view class="category-list">
          <view
            v-for="(cat, index) in categories"
            :key="index"
            class="category-item"
            :class="{ active: currentCategory === index }"
            @click="onCategoryClick(index)"
          >
            <image class="category-icon" :src="cat.icon" mode="aspectFit" />
            <text class="category-name">{{ cat.name }}</text>
          </view>
        </view>
      </scroll-view>

      <!-- 瀑布流图片列表 -->
      <view class="photo-section">
        <view class="section-header">
          <text class="section-title">发现精彩</text>
          <view class="filter-tabs">
            <text
              v-for="(tab, index) in filterTabs"
              :key="index"
              class="filter-tab"
              :class="{ active: currentFilter === index }"
              @click="onFilterClick(index)"
            >
              {{ tab }}
            </text>
          </view>
        </view>

        <WaterfallList
          :list="photoList"
          :gap="16"
          :border-radius="16"
          @item-click="onPhotoClick"
        />

        <!-- 加载状态 -->
        <view class="load-more">
          <AppLoading v-if="loading" type="spinner" size="32rpx" />
          <text v-else-if="!hasMore" class="no-more">没有更多了</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSystemInfo } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import WaterfallList from '../../components/WaterfallList.vue'
import AppIcon from '../../components/AppIcon.vue'
import AppLoading from '../../components/AppLoading.vue'
import { getPhotoList } from '../../api/content'

const { navbarHeight } = useSystemInfo()

// 轮播图数据
const banners = ref<Banner[]>([
  {
    id: '1',
    image: 'https://picsum.photos/750/400?random=1',
    link: '/pages/detail/detail?id=1',
    title: '发现美好瞬间',
  },
  {
    id: '2',
    image: 'https://picsum.photos/750/400?random=2',
    link: '/pages/detail/detail?id=2',
    title: '记录生活点滴',
  },
  {
    id: '3',
    image: 'https://picsum.photos/750/400?random=3',
    link: '/pages/detail/detail?id=3',
    title: '分享精彩时刻',
  },
])

// 分类数据
const categories = ref<Category[]>([
  { id: '1', name: '推荐', icon: 'https://img.yzcdn.cn/vant/cat.jpeg', count: 0 },
  { id: '2', name: '风景', icon: 'https://img.yzcdn.cn/vant/cat.jpeg', count: 128 },
  { id: '3', name: '美食', icon: 'https://img.yzcdn.cn/vant/cat.jpeg', count: 256 },
  { id: '4', name: '人像', icon: 'https://img.yzcdn.cn/vant/cat.jpeg', count: 64 },
  { id: '5', name: '萌宠', icon: 'https://img.yzcdn.cn/vant/cat.jpeg', count: 512 },
  { id: '6', name: '旅行', icon: 'https://img.yzcdn.cn/vant/cat.jpeg', count: 32 },
  { id: '7', name: '街拍', icon: 'https://img.yzcdn.cn/vant/cat.jpeg', count: 128 },
  { id: '8', name: '建筑', icon: 'https://img.yzcdn.cn/vant/cat.jpeg', count: 64 },
])

// 筛选标签
const filterTabs = ['热门', '最新', '关注']
const currentCategory = ref(0)
const currentFilter = ref(0)

// 瀑布流数据
const photoList = ref<WaterfallItem[]>([])
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const page = ref(1)

// 滚动区域样式 - 在 page-container 内占满剩余空间
const scrollStyle = computed(() => ({
  height: '100%', // 占满 page-container 剩余空间
}))

console.log('navbarHeight', navbarHeight)
// 获取瀑布流数据
const fetchPhotos = async (isRefresh = false) => {
  if (loading.value) return
  loading.value = true

  try {
    const res = await getPhotoList({
      page: page.value,
      pageSize: 10,
      sort: currentFilter.value === 0 ? 'hot' : 'new',
      category: currentCategory.value === 0 ? undefined : categories.value[currentCategory.value]?.name,
    })

    const list = res.list || []

    // 转换后端数据为前端需要的格式
    const newPhotos: WaterfallItem[] = list.map((photo) => ({
      id: photo.id,
      url: photo.url,
      title: photo.title,
      user: photo.user,
      likes: photo.likes,
      views: photo.views,
    }))

    if (isRefresh) {
      photoList.value = newPhotos
    } else {
      photoList.value.push(...newPhotos)
    }

    page.value++
    hasMore.value = res.hasMore
  } catch (err) {
    console.error('获取图片列表失败', err)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true
  page.value = 1
  fetchPhotos(true)
}

// 上拉加载
const onLoadMore = () => {
  if (!hasMore.value || loading.value) return
  fetchPhotos()
}

// 搜索
const onSearch = () => {
  uni.navigateTo({
    url: '/pages/search/search',
  })
}

// 轮播图点击
const onBannerClick = (banner: Banner) => {
  uni.navigateTo({
    url: banner.link,
  })
}

// 分类点击
const onCategoryClick = (index: number) => {
  currentCategory.value = index
  page.value = 1
  photoList.value = []
  fetchPhotos()
}

// 筛选切换
const onFilterClick = (index: number) => {
  currentFilter.value = index
  page.value = 1
  photoList.value = []
  fetchPhotos()
}

// 图片点击
const onPhotoClick = (item: WaterfallItem) => {
  uni.navigateTo({
    url: `/pages/detail/detail?id=${item.id}`,
  })
}

onMounted(() => {
  fetchPhotos()
})
</script>

<style lang="scss" scoped>
.page-container {
  margin-top: 92rpx;
  height: 100vh; // 减去 tabBar 高度
  padding-top: 94rpx; // 给 navbar 留出空间
  box-sizing: border-box;
  background: #f5f5f5;
  border: 1rpx solid red;
}

.content-scroll {
  box-sizing: border-box;
}

// 轮播图
.banner-swiper {
  height: 400rpx;
  margin: 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.banner-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 60rpx 30rpx 30rpx;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));

  text {
    color: #fff;
    font-size: 36rpx;
    font-weight: 600;
  }
}

// 分类
.category-scroll {
  white-space: nowrap;
  padding: 20rpx 0;
}

.category-list {
  display: flex;
  padding: 0 20rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 40rpx;
  padding: 16rpx 24rpx;
  border-radius: 16rpx;
  transition: all 0.3s ease;

  &.active {
    background: rgba(255, 107, 107, 0.1);

    .category-name {
      color: #ff6b6b;
      font-weight: 600;
    }
  }
}

.category-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  margin-bottom: 12rpx;
}

.category-name {
  font-size: 24rpx;
  color: #666;
}

// 图片区域
.photo-section {
  padding: 20rpx 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx 20rpx;
}

.section-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #333;
}

.filter-tabs {
  display: flex;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 30rpx;
  padding: 4rpx;
}

.filter-tab {
  font-size: 26rpx;
  color: #666;
  padding: 12rpx 24rpx;
  border-radius: 26rpx;
  transition: all 0.3s ease;

  &.active {
    background: #fff;
    color: #ff6b6b;
    font-weight: 600;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  }
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
