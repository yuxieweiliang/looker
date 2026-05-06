<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="优惠券" show-back />

    <view class="coupon-container">
      <!-- 筛选标签 -->
      <view class="filter-tabs">
        <view
          v-for="(tab, index) in filterTabs"
          :key="index"
          class="tab-item"
          :class="{ active: currentFilter === index }"
          @click="onFilterClick(index)"
        >
          <text>{{ tab.name }}</text>
          <text v-if="tab.count > 0" class="tab-count">{{ tab.count }}</text>
        </view>
      </view>

      <!-- 优惠券列表 -->
      <scroll-view
        scroll-y
        class="coupon-list"
        @scrolltolower="onLoadMore"
        :refresher-enabled="true"
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <view v-if="couponList.length > 0" class="list-content">
          <view
            v-for="(coupon, index) in couponList"
            :key="coupon.id"
            class="coupon-item"
            :class="{ expired: coupon.status === 'expired', used: coupon.status === 'used' }"
          >
            <view class="coupon-left">
              <view class="coupon-value">
                <text class="currency">¥</text>
                <text class="amount">{{ coupon.amount }}</text>
              </view>
              <text class="coupon-condition">满{{ coupon.minSpend }}可用</text>
            </view>
            <view class="coupon-right">
              <view class="coupon-info">
                <text class="coupon-name">{{ coupon.name }}</text>
                <text class="coupon-desc">{{ coupon.description }}</text>
                <text class="coupon-time">{{ coupon.validTime }}</text>
              </view>
              <view class="coupon-action">
                <button
                  v-if="coupon.status === 'unused'"
                  class="use-btn"
                  @click="onUseCoupon(coupon)"
                >
                  去使用
                </button>
                <text v-else-if="coupon.status === 'used'" class="status-text">已使用</text>
                <text v-else class="status-text">已过期</text>
              </view>
            </view>
          </view>

          <!-- 加载更多 -->
          <view class="load-more">
            <AppLoading v-if="loading" type="spinner" size="32rpx" />
            <text v-else-if="!hasMore" class="no-more">没有更多了</text>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else class="empty-state">
          <AppIcon name="coupon-o" size="120rpx" color="#ddd" />
          <text class="empty-text">暂无优惠券</text>
          <text class="empty-sub">参与活动可以获得更多优惠券</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSystemInfo, showToast } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import AppIcon from '../../components/AppIcon.vue'
import AppLoading from '../../components/AppLoading.vue'
import { getCouponList } from '../../api/wallet'
import type { Coupon } from '../../api/wallet'

const { navbarHeight } = useSystemInfo()

const filterTabs = [
  { name: '未使用', key: 'unused', count: 0 },
  { name: '已使用', key: 'used', count: 0 },
  { name: '已过期', key: 'expired', count: 0 },
]

const currentFilter = ref(0)
const couponList = ref<Coupon[]>([])
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const page = ref(1)

const currentStatus = computed(() => filterTabs[currentFilter.value].key)

const fetchCoupons = async (isRefresh = false) => {
  if (loading.value) return
  loading.value = true

  try {
    const res = await getCouponList()
    if (res.code === 0 && res.data) {
      // 根据状态过滤
      const filtered = res.data.filter(c => c.status === currentStatus.value)
      if (isRefresh) {
        couponList.value = filtered
      } else {
        couponList.value.push(...filtered)
      }
      // 更新各状态数量
      filterTabs[0].count = res.data.filter(c => c.status === 'unused').length
      filterTabs[1].count = res.data.filter(c => c.status === 'used').length
      filterTabs[2].count = res.data.filter(c => c.status === 'expired').length
    }
    hasMore.value = false
  } catch (error) {
    console.error('获取优惠券失败', error)
    showToast('获取失败')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onFilterClick = (index: number) => {
  if (currentFilter.value === index) return
  currentFilter.value = index
  page.value = 1
  couponList.value = []
  hasMore.value = true
  fetchCoupons(true)
}

const onRefresh = () => {
  refreshing.value = true
  page.value = 1
  fetchCoupons(true)
}

const onLoadMore = () => {
  if (!hasMore.value || loading.value) return
  fetchCoupons()
}

const onUseCoupon = (coupon: Coupon) => {
  showToast('跳转使用页面', 'none')
}

// 更新数量
const updateCounts = () => {
  filterTabs[0].count = 5
  filterTabs[1].count = 3
  filterTabs[2].count = 2
}

onMounted(() => {
  updateCounts()
  fetchCoupons(true)
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.coupon-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - v-bind(navbarHeight) * 1px);
}

.filter-tabs {
  display: flex;
  background: #fff;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
  gap: 40rpx;

  .tab-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding-bottom: 16rpx;
    position: relative;

    text {
      font-size: 28rpx;
      color: #666;
    }

    .tab-count {
      font-size: 22rpx;
      color: #ff6b6b;
      background: rgba(255, 107, 107, 0.1);
      padding: 2rpx 10rpx;
      border-radius: 12rpx;
    }

    &.active {
      text {
        color: #ff6b6b;
        font-weight: 500;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4rpx;
        background: #ff6b6b;
        border-radius: 2rpx;
      }
    }
  }
}

.coupon-list {
  flex: 1;
  padding: 20rpx;
}

.coupon-item {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  position: relative;

  &.expired, &.used {
    opacity: 0.6;

    .coupon-left {
      background: #ccc;
    }
  }
}

.coupon-left {
  width: 200rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
  position: relative;

  &::before, &::after {
    content: '';
    position: absolute;
    right: -16rpx;
    width: 32rpx;
    height: 32rpx;
    background: #f5f5f5;
    border-radius: 50%;
  }

  &::before {
    top: -16rpx;
  }

  &::after {
    bottom: -16rpx;
  }
}

.coupon-value {
  display: flex;
  align-items: baseline;
  margin-bottom: 10rpx;

  .currency {
    font-size: 28rpx;
    color: #fff;
  }

  .amount {
    font-size: 56rpx;
    color: #fff;
    font-weight: 700;
  }
}

.coupon-condition {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
}

.coupon-right {
  flex: 1;
  padding: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupon-info {
  flex: 1;
}

.coupon-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
}

.coupon-desc {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-bottom: 8rpx;
}

.coupon-time {
  font-size: 22rpx;
  color: #ff6b6b;
}

.coupon-action {
  margin-left: 20rpx;
}

.use-btn {
  width: 120rpx;
  height: 56rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: #fff;
  font-size: 24rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-text {
  font-size: 24rpx;
  color: #999;
}

.load-more {
  padding: 30rpx;
  text-align: center;

  .no-more {
    font-size: 24rpx;
    color: #999;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 150rpx 40rpx;

  .empty-text {
    font-size: 32rpx;
    color: #333;
    margin-top: 30rpx;
    margin-bottom: 12rpx;
  }

  .empty-sub {
    font-size: 26rpx;
    color: #999;
  }
}
</style>
