<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="选择位置" show-back />

    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-box">
        <AppIcon name="search" size="32rpx" color="#999" />
        <input
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索地点"
          confirm-type="search"
          @confirm="onSearch"
        />
        <view v-if="searchKeyword" class="clear-btn" @click="clearSearch">
          <AppIcon name="clear" size="28rpx" color="#ccc" />
        </view>
      </view>
      <text class="cancel-btn" @click="cancelSearch">取消</text>
    </view>

    <!-- 当前位置 -->
    <view class="current-location" @click="useCurrentLocation">
      <view class="location-icon">
        <AppIcon name="location-o" size="40rpx" color="#ff6b6b" />
      </view>
      <view class="location-info">
        <text class="location-name">当前位置</text>
        <text class="location-address">{{ currentAddress || '点击获取当前位置' }}</text>
      </view>
      <view v-if="locationLoading" class="loading">
        <text>定位中...</text>
      </view>
      <AppIcon v-else name="arrow" size="32rpx" color="#ccc" />
    </view>

    <!-- 附近地点列表 -->
    <view class="nearby-section">
      <view class="section-title">
        <text>附近地点</text>
        <text v-if="nearbyList.length > 0" class="refresh" @click="refreshNearby">刷新</text>
      </view>

      <scroll-view scroll-y class="location-list">
        <view
          v-for="(item, index) in nearbyList"
          :key="index"
          class="location-item"
          @click="selectLocation(item)"
        >
          <view class="item-icon">
            <AppIcon name="location-o" size="36rpx" color="#999" />
          </view>
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-address">{{ item.address }}</text>
          </view>
          <view v-if="selectedId === item.id" class="selected-mark">
            <AppIcon name="success" size="32rpx" color="#ff6b6b" />
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="nearbyList.length === 0 && !loading" class="empty-state">
          <AppIcon name="location-o" size="80rpx" color="#ddd" />
          <text>暂无附近地点</text>
          <text class="sub">点击上方获取当前位置</text>
        </view>
      </scroll-view>
    </view>

    <!-- 确认按钮 -->
    <view class="confirm-section">
      <button class="confirm-btn" @click="confirmLocation">
        确认选择
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useSystemInfo } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import AppIcon from '../../components/AppIcon.vue'

const { navbarHeight } = useSystemInfo()

interface LocationItem {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
}

const searchKeyword = ref('')
const currentAddress = ref('')
const locationLoading = ref(false)
const loading = ref(false)
const nearbyList = ref<LocationItem[]>([])
const selectedLocation = ref<LocationItem | null>(null)
const selectedId = ref('')

// 模拟附近地点数据
const mockNearbyLocations: LocationItem[] = [
  { id: '1', name: '当前位置', address: '北京市朝阳区建国路88号', latitude: 39.9042, longitude: 116.4074 },
  { id: '2', name: '万达广场', address: '北京市朝阳区建国路88号', latitude: 39.9042, longitude: 116.4074 },
  { id: '3', name: '三里屯太古里', address: '北京市朝阳区三里屯路19号', latitude: 39.9354, longitude: 116.4546 },
  { id: '4', name: '国贸商城', address: '北京市朝阳区建国门外大街1号', latitude: 39.9042, longitude: 116.4074 },
  { id: '5', name: '朝阳公园', address: '北京市朝阳区朝阳公园南路1号', latitude: 39.9342, longitude: 116.4868 },
  { id: '6', name: '鸟巢', address: '北京市朝阳区国家体育场南路1号', latitude: 39.9929, longitude: 116.3967 },
  { id: '7', name: '水立方', address: '北京市朝阳区天辰东路11号', latitude: 39.9928, longitude: 116.3855 },
  { id: '8', name: '颐和园', address: '北京市海淀区新建宫门路19号', latitude: 39.9999, longitude: 116.2754 },
]

onMounted(() => {
  // 加载默认附近地点
  nearbyList.value = mockNearbyLocations.slice(1)
})

const useCurrentLocation = () => {
  locationLoading.value = true

  // #ifdef APP-PLUS
  // App 端使用 plus.geolocation
  plus.geolocation.getCurrentPosition(
    (res) => {
      locationLoading.value = false
      currentAddress.value = res.addresses || `${res.coords.latitude.toFixed(4)}, ${res.coords.longitude.toFixed(4)}`

      const currentLoc: LocationItem = {
        id: 'current',
        name: '当前位置',
        address: currentAddress.value,
        latitude: res.coords.latitude,
        longitude: res.coords.longitude,
      }

      selectedLocation.value = currentLoc
      selectedId.value = 'current'

      // 更新列表
      nearbyList.value = [currentLoc, ...mockNearbyLocations.slice(1)]
    },
    (err) => {
      locationLoading.value = false
      console.error('定位失败:', err)
      uni.showToast({
        title: '定位失败，请检查权限',
        icon: 'none',
      })
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
    }
  )
  // #endif

  // #ifndef APP-PLUS
  // H5/小程序使用 uni.getLocation
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      locationLoading.value = false
      currentAddress.value = `${res.latitude.toFixed(4)}, ${res.longitude.toFixed(4)}`

      const currentLoc: LocationItem = {
        id: 'current',
        name: '当前位置',
        address: currentAddress.value,
        latitude: res.latitude,
        longitude: res.longitude,
      }

      selectedLocation.value = currentLoc
      selectedId.value = 'current'
      nearbyList.value = [currentLoc, ...mockNearbyLocations.slice(1)]
    },
    fail: (err) => {
      locationLoading.value = false
      console.error('定位失败:', err)
      uni.showToast({
        title: '定位失败，请检查权限',
        icon: 'none',
      })
    },
  })
  // #endif
}

const selectLocation = (item: LocationItem) => {
  selectedLocation.value = item
  selectedId.value = item.id
}

const confirmLocation = () => {
  if (!selectedLocation.value) {
    uni.showToast({
      title: '请选择一个位置',
      icon: 'none',
    })
    return
  }

  // 返回上一页并传递选择的位置
  const pages = getCurrentPages()
  const prevPage = pages[pages.length - 2] as any

  if (prevPage && prevPage.$vm) {
    prevPage.$vm.location = {
      name: selectedLocation.value.name,
      address: selectedLocation.value.address,
      latitude: selectedLocation.value.latitude,
      longitude: selectedLocation.value.longitude,
    }
  }

  uni.navigateBack()
}

const onSearch = () => {
  if (!searchKeyword.value.trim()) {
    nearbyList.value = mockNearbyLocations.slice(1)
    return
  }

  // 模拟搜索
  const keyword = searchKeyword.value.toLowerCase()
  nearbyList.value = mockNearbyLocations.filter(
    item =>
      item.name.toLowerCase().includes(keyword) ||
      item.address.toLowerCase().includes(keyword)
  )
}

const clearSearch = () => {
  searchKeyword.value = ''
  nearbyList.value = mockNearbyLocations.slice(1)
}

const cancelSearch = () => {
  uni.navigateBack()
}

const refreshNearby = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    uni.showToast({
      title: '已刷新',
      icon: 'success',
    })
  }, 500)
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.search-section {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 32rpx;
  padding: 16rpx 24rpx;
  margin-right: 20rpx;
}

.search-input {
  flex: 1;
  margin-left: 16rpx;
  font-size: 28rpx;
  color: #333;
}

.clear-btn {
  padding: 8rpx;
}

.cancel-btn {
  font-size: 28rpx;
  color: #666;
}

.current-location {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: #fff;
  margin-bottom: 20rpx;
}

.location-icon {
  width: 72rpx;
  height: 72rpx;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.location-info {
  flex: 1;
}

.location-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.location-address {
  font-size: 26rpx;
  color: #999;
}

.loading {
  font-size: 26rpx;
  color: #ff6b6b;
}

.nearby-section {
  flex: 1;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;

  text {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;

    &.refresh {
      color: #ff6b6b;
      font-weight: normal;
    }
  }
}

.location-list {
  flex: 1;
  padding: 0 30rpx;
}

.location-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.item-icon {
  margin-right: 20rpx;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 30rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.item-address {
  font-size: 24rpx;
  color: #999;
}

.selected-mark {
  margin-left: 20rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 40rpx;

  text {
    font-size: 28rpx;
    color: #666;
    margin-top: 20rpx;

    &.sub {
      font-size: 24rpx;
      color: #999;
      margin-top: 10rpx;
    }
  }
}

.confirm-section {
  padding: 30rpx;
  background: #fff;
  border-top: 1rpx solid #f5f5f5;
}

.confirm-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
