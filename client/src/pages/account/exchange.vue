<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="积分兑换" show-back />

    <view class="exchange-container">
      <!-- 积分卡片 -->
      <view class="points-card">
        <view class="points-display">
          <text class="points-label">我的积分</text>
          <text class="points-value">{{ userPoints }}</text>
        </view>
        <view class="points-actions">
          <view class="action-item" @click="goToTask">
            <AppIcon name="todo-list-o" size="40rpx" color="#fff" />
            <text>赚积分</text>
          </view>
        </view>
      </view>

      <!-- 兑换商品列表 -->
      <view class="goods-section">
        <view class="section-header">
          <text class="section-title">可兑换</text>
          <view class="filter-tabs">
            <text
              v-for="(tab, index) in tabs"
              :key="index"
              class="tab-item"
              :class="{ active: currentTab === index }"
              @click="currentTab = index"
            >
              {{ tab }}
            </text>
          </view>
        </view>

        <scroll-view
          scroll-y
          class="goods-scroll"
          @scrolltolower="onLoadMore"
        >
          <view class="goods-grid">
            <view
              v-for="goods in goodsList"
              :key="goods.id"
              class="goods-item"
              @click="onExchange(goods)"
            >
              <image class="goods-image" :src="goods.image" mode="aspectFill" />
              <view class="goods-info">
                <text class="goods-name">{{ goods.name }}</text>
                <text class="goods-desc">{{ goods.description }}</text>
                <view class="goods-footer">
                  <view class="goods-points">
                    <AppIcon name="star-o" size="24rpx" color="#ff6b6b" />
                    <text>{{ goods.points }}</text>
                  </view>
                  <view
                    class="exchange-btn"
                    :class="{ disabled: userPoints < goods.points || goods.stock === 0 }"
                  >
                    {{ goods.stock === 0 ? '已兑完' : '兑换' }}
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 加载更多 -->
          <view class="load-more">
            <AppLoading v-if="loading" type="spinner" size="32rpx" />
            <text v-else-if="!hasMore" class="no-more">没有更多了</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 兑换确认弹窗 -->
    <view v-if="showModal" class="modal-mask" @click="showModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">确认兑换</text>
          <view class="modal-close" @click="showModal = false">
            <AppIcon name="cross" size="32rpx" color="#999" />
          </view>
        </view>
        <view class="modal-body" v-if="selectedGoods">
          <image class="modal-image" :src="selectedGoods.image" mode="aspectFill" />
          <text class="modal-name">{{ selectedGoods.name }}</text>
          <view class="modal-points">
            <text>消耗积分：</text>
            <text class="points">{{ selectedGoods.points }}</text>
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="showModal = false">取消</button>
          <button class="modal-btn confirm" @click="confirmExchange">确认兑换</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSystemInfo, showToast } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import AppIcon from '../../components/AppIcon.vue'
import AppLoading from '../../components/AppLoading.vue'

const { navbarHeight } = useSystemInfo()

interface Goods {
  id: string
  name: string
  description: string
  image: string
  points: number
  stock: number
  type: 'virtual' | 'physical' | 'coupon'
}

const userPoints = ref(2580)
const currentTab = ref(0)
const tabs = ['全部', '虚拟', '实物', '优惠券']
const loading = ref(false)
const hasMore = ref(true)
const page = ref(1)
const showModal = ref(false)
const selectedGoods = ref<Goods | null>(null)

const goodsList = ref<Goods[]>([])

// 加载商品列表
const loadGoods = async () => {
  if (loading.value) return
  loading.value = true

  await new Promise(resolve => setTimeout(resolve, 500))

  const mockData: Goods[] = [
    {
      id: '1',
      name: '7天会员',
      description: '享受会员专属特权',
      image: 'https://picsum.photos/300/300?random=1',
      points: 500,
      stock: 100,
      type: 'virtual',
    },
    {
      id: '2',
      name: '30天会员',
      description: '享受会员专属特权',
      image: 'https://picsum.photos/300/300?random=2',
      points: 1500,
      stock: 50,
      type: 'virtual',
    },
    {
      id: '3',
      name: '定制马克杯',
      description: 'Looker 限定周边',
      image: 'https://picsum.photos/300/300?random=3',
      points: 2000,
      stock: 20,
      type: 'physical',
    },
    {
      id: '4',
      name: '5元优惠券',
      description: '全场通用',
      image: 'https://picsum.photos/300/300?random=4',
      points: 200,
      stock: 0,
      type: 'coupon',
    },
    {
      id: '5',
      name: '20元优惠券',
      description: '满100可用',
      image: 'https://picsum.photos/300/300?random=5',
      points: 800,
      stock: 30,
      type: 'coupon',
    },
    {
      id: '6',
      name: '定制T恤',
      description: 'Looker 限定周边',
      image: 'https://picsum.photos/300/300?random=6',
      points: 3000,
      stock: 10,
      type: 'physical',
    },
  ]

  goodsList.value.push(...mockData)
  page.value++
  hasMore.value = page.value <= 3
  loading.value = false
}

const onLoadMore = () => {
  if (!hasMore.value || loading.value) return
  loadGoods()
}

const onExchange = (goods: Goods) => {
  if (goods.stock === 0) {
    showToast('该商品已兑完')
    return
  }
  if (userPoints.value < goods.points) {
    showToast('积分不足')
    return
  }
  selectedGoods.value = goods
  showModal.value = true
}

const confirmExchange = () => {
  if (!selectedGoods.value) return

  showModal.value = false
  uni.showLoading({ title: '兑换中...' })

  setTimeout(() => {
    uni.hideLoading()
    userPoints.value -= selectedGoods.value!.points
    selectedGoods.value!.stock--
    showToast('兑换成功', 'success')
  }, 1500)
}

const goToTask = () => {
  uni.navigateTo({ url: '/pages/settings/task' })
}

onMounted(() => {
  loadGoods()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.exchange-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - v-bind(navbarHeight) * 1px);
}

.points-card {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  margin: 20rpx;
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .points-display {
    .points-label {
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.8);
      display: block;
      margin-bottom: 12rpx;
    }

    .points-value {
      font-size: 56rpx;
      font-weight: 700;
      color: #fff;
    }
  }

  .points-actions {
    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8rpx;
      padding: 20rpx 30rpx;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 16rpx;

      text {
        font-size: 24rpx;
        color: #fff;
      }
    }
  }
}

.goods-section {
  flex: 1;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }

  .filter-tabs {
    display: flex;
    gap: 24rpx;

    .tab-item {
      font-size: 28rpx;
      color: #999;

      &.active {
        color: #ff6b6b;
        font-weight: 500;
      }
    }
  }
}

.goods-scroll {
  flex: 1;
  padding: 20rpx;
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.goods-item {
  background: #f9f9f9;
  border-radius: 16rpx;
  overflow: hidden;

  &:active {
    opacity: 0.8;
  }

  .goods-image {
    width: 100%;
    height: 280rpx;
  }

  .goods-info {
    padding: 20rpx;

    .goods-name {
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
      display: block;
      margin-bottom: 8rpx;
    }

    .goods-desc {
      font-size: 24rpx;
      color: #999;
      display: block;
      margin-bottom: 16rpx;
    }

    .goods-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .goods-points {
        display: flex;
        align-items: center;
        gap: 8rpx;

        text {
          font-size: 28rpx;
          color: #ff6b6b;
          font-weight: 600;
        }
      }

      .exchange-btn {
        padding: 12rpx 24rpx;
        background: #ff6b6b;
        border-radius: 24rpx;

        text {
          font-size: 24rpx;
          color: #fff;
        }

        &.disabled {
          background: #ccc;
        }
      }
    }
  }
}

.load-more {
  padding: 30rpx;
  text-align: center;

  .no-more {
    font-size: 26rpx;
    color: #999;
  }
}

// 弹窗样式
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  width: 80%;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;

  .modal-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
}

.modal-body {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .modal-image {
    width: 200rpx;
    height: 200rpx;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
  }

  .modal-name {
    font-size: 30rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 16rpx;
  }

  .modal-points {
    font-size: 28rpx;
    color: #666;

    .points {
      color: #ff6b6b;
      font-weight: 600;
    }
  }
}

.modal-footer {
  display: flex;
  padding: 20rpx 30rpx 30rpx;
  gap: 20rpx;

  .modal-btn {
    flex: 1;
    height: 80rpx;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30rpx;

    &.cancel {
      background: #f5f5f5;
      color: #666;
    }

    &.confirm {
      background: #ff6b6b;
      color: #fff;
    }
  }
}
</style>
