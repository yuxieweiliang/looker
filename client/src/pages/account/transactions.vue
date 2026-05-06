<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="交易记录" show-back />

    <view class="record-container">
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
        </view>
      </view>

      <!-- 统计卡片 -->
      <view class="stat-card" v-if="currentFilter === 0">
        <view class="stat-item">
          <text class="stat-label">本月收入</text>
          <text class="stat-value income">+¥{{ monthlyIncome }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">本月支出</text>
          <text class="stat-value expense">-¥{{ monthlyExpense }}</text>
        </view>
      </view>

      <!-- 记录列表 -->
      <scroll-view
        scroll-y
        class="record-list"
        @scrolltolower="onLoadMore"
        :refresher-enabled="true"
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <view v-if="recordList.length > 0" class="list-content">
          <view
            v-for="record in recordList"
            :key="record.id"
            class="record-item"
          >
            <view class="record-icon" :class="record.type">
              <AppIcon :name="getIconName(record.type)" size="36rpx" color="#fff" />
            </view>
            <view class="record-info">
              <text class="record-title">{{ record.title }}</text>
              <text class="record-time">{{ formatTime(record.time) }}</text>
            </view>
            <view class="record-amount" :class="record.type">
              <text>{{ record.type === 'income' || record.type === 'recharge' ? '+' : '-' }}¥{{ record.amount }}</text>
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
          <AppIcon name="bill-o" size="120rpx" color="#ddd" />
          <text class="empty-text">暂无交易记录</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSystemInfo } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import AppIcon from '../../components/AppIcon.vue'
import AppLoading from '../../components/AppLoading.vue'
import { getTransactionList } from '../../api/wallet'
import type { Transaction } from '../../api/wallet'

const { navbarHeight } = useSystemInfo()

const filterTabs = [
  { name: '全部', key: 'all' },
  { name: '收入', key: 'income' },
  { name: '支出', key: 'expense' },
  { name: '充值', key: 'recharge' },
  { name: '提现', key: 'withdraw' },
]

const currentFilter = ref(0)
const recordList = ref<Transaction[]>([])
const loading = ref(false)
const refreshing = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(20)

// 统计数据
const monthlyIncome = ref('0.00')
const monthlyExpense = ref('0.00')

const getIconName = (type: string): string => {
  const iconMap: Record<string, string> = {
    income: 'cash-o',
    expense: 'shopping-o',
    recharge: 'add-o',
    withdraw: 'minus-o',
  }
  return iconMap[type] || 'bill-o'
}

// 格式化时间
const formatTime = (time: string): string => {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const days = Math.floor(diff / 86400000)

  if (days === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }
  if (days === 1) {
    return '昨天'
  }
  if (days < 7) {
    return `${days}天前`
  }

  return date.toLocaleDateString('zh-CN')
}

// 获取交易记录
const fetchRecords = async (isRefresh = false) => {
  if (loading.value) return
  loading.value = true

  try {
    if (isRefresh) {
      page.value = 1
      recordList.value = []
    }

    const filterKey = filterTabs[currentFilter.value].key
    const res = await getTransactionList({
      type: filterKey as any,
      page: page.value,
      pageSize: pageSize.value,
    })

    if (res.code === 0 && res.data) {
      const { list, hasMore: more } = res.data
      recordList.value.push(...list)
      hasMore.value = more

      // 计算本月统计
      calculateMonthlyStats()
    }
  } catch (error) {
    console.error('获取交易记录失败', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// 计算本月统计
const calculateMonthlyStats = () => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  let income = 0
  let expense = 0

  recordList.value.forEach(record => {
    const recordDate = new Date(record.time)
    if (recordDate.getFullYear() === currentYear && recordDate.getMonth() === currentMonth) {
      if (record.type === 'income' || record.type === 'recharge') {
        income += record.amount
      } else {
        expense += record.amount
      }
    }
  })

  monthlyIncome.value = income.toFixed(2)
  monthlyExpense.value = expense.toFixed(2)
}

const onFilterClick = (index: number) => {
  if (currentFilter.value === index) return
  currentFilter.value = index
  page.value = 1
  recordList.value = []
  hasMore.value = true
  fetchRecords(true)
}

const onRefresh = () => {
  refreshing.value = true
  page.value = 1
  fetchRecords(true)
}

const onLoadMore = () => {
  if (!hasMore.value || loading.value) return
  page.value++
  fetchRecords()
}

onMounted(() => {
  fetchRecords(true)
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.record-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - v-bind(navbarHeight) * 1px);
}

.filter-tabs {
  display: flex;
  background: #fff;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
  gap: 30rpx;

  .tab-item {
    padding: 12rpx 24rpx;
    border-radius: 32rpx;
    background: #f5f5f5;

    text {
      font-size: 26rpx;
      color: #666;
    }

    &.active {
      background: rgba(255, 107, 107, 0.1);

      text {
        color: #ff6b6b;
        font-weight: 500;
      }
    }
  }
}

.stat-card {
  display: flex;
  background: #fff;
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 16rpx;
  gap: 40rpx;

  .stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;

    .stat-label {
      font-size: 26rpx;
      color: #999;
      margin-bottom: 12rpx;
    }

    .stat-value {
      font-size: 36rpx;
      font-weight: 600;

      &.income {
        color: #10ac84;
      }

      &.expense {
        color: #ff6b6b;
      }
    }
  }
}

.record-list {
  flex: 1;
  padding: 0 20rpx;
}

.list-content {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.record-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.record-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;

  &.income {
    background: linear-gradient(135deg, #10ac84 0%, #1dd1a1 100%);
  }

  &.expense {
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  }

  &.recharge {
    background: linear-gradient(135deg, #f7b731 0%, #ffcc00 100%);
  }

  &.withdraw {
    background: linear-gradient(135deg, #5f27cd 0%, #7c3aed 100%);
  }
}

.record-info {
  flex: 1;

  .record-title {
    font-size: 30rpx;
    color: #333;
    display: block;
    margin-bottom: 8rpx;
  }

  .record-time {
    font-size: 24rpx;
    color: #999;
  }
}

.record-amount {
  font-size: 32rpx;
  font-weight: 600;

  &.income, &.recharge {
    color: #10ac84;
  }

  &.expense, &.withdraw {
    color: #ff6b6b;
  }
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
    font-size: 28rpx;
    color: #999;
    margin-top: 30rpx;
  }
}
</style>
