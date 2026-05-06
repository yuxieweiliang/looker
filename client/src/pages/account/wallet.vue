<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="我的钱包" />

    <view class="wallet-container">
      <!-- 余额卡片 -->
      <view class="balance-card">
        <text class="balance-label">账户余额（元）</text>
        <text class="balance-value">{{ balance }}</text>
        <view class="balance-actions">
          <view class="action-btn primary" @click="onRecharge">
            <AppIcon name="add-o" size="32rpx" color="#fff" />
            <text>充值</text>
          </view>
          <view class="action-btn" @click="onWithdraw">
            <AppIcon name="cash-o" size="32rpx" color="#ff6b6b" />
            <text>提现</text>
          </view>
        </view>
      </view>

      <!-- 功能菜单 -->
      <view class="menu-group">
        <view class="menu-item" @click="onTransactionHistory">
          <view class="menu-left">
            <view class="menu-icon" style="background: #e3f2fd;">
              <AppIcon name="bill-o" size="36rpx" color="#2196f3" />
            </view>
            <text class="menu-text">交易记录</text>
          </view>
          <AppIcon name="arrow" size="28rpx" color="#ccc" />
        </view>
        <view class="menu-item" @click="onBankCards">
          <view class="menu-left">
            <view class="menu-icon" style="background: #e8f5e9;">
              <AppIcon name="card-o" size="36rpx" color="#4caf50" />
            </view>
            <text class="menu-text">银行卡</text>
          </view>
          <view class="menu-right">
            <text class="menu-value">{{ cardCount }}张</text>
            <AppIcon name="arrow" size="28rpx" color="#ccc" />
          </view>
        </view>
        <view class="menu-item" @click="onCoupons">
          <view class="menu-left">
            <view class="menu-icon" style="background: #fff3e0;">
              <AppIcon name="coupon-o" size="36rpx" color="#ff9800" />
            </view>
            <text class="menu-text">优惠券</text>
          </view>
          <view class="menu-right">
            <text class="menu-value">{{ couponCount }}张</text>
            <AppIcon name="arrow" size="28rpx" color="#ccc" />
          </view>
        </view>
      </view>

      <!-- 安全提示 -->
      <view class="security-tips">
        <AppIcon name="shield-o" size="28rpx" color="#999" />
        <text>账户资金由银行全程监管，安全有保障</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSystemInfo, showToast } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import AppIcon from '../../components/AppIcon.vue'
import { getWalletInfo } from '../../api/wallet'

const { navbarHeight } = useSystemInfo()

const balance = ref('0.00')
const cardCount = ref(0)
const couponCount = ref(0)
const loading = ref(false)

// 获取钱包信息
const fetchWalletInfo = async () => {
  loading.value = true
  try {
    const res = await getWalletInfo()
    if (res.code === 0 && res.data) {
      balance.value = res.data.balance
      cardCount.value = res.data.cardCount
      couponCount.value = res.data.couponCount
    }
  } catch (error) {
    console.error('获取钱包信息失败', error)
    showToast('获取信息失败')
  } finally {
    loading.value = false
  }
}

const onRecharge = () => {
  showToast('充值功能开发中')
}

const onWithdraw = () => {
  showToast('提现功能开发中')
}

const onTransactionHistory = () => {
  uni.navigateTo({ url: '/pages/account/transactions' })
}

const onBankCards = () => {
  uni.navigateTo({ url: '/pages/account/bank-cards' })
}

const onCoupons = () => {
  uni.navigateTo({ url: '/pages/account/coupons' })
}

onMounted(() => {
  fetchWalletInfo()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.wallet-container {
  padding: 20rpx;
}

.balance-card {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  border-radius: 24rpx;
  padding: 50rpx 40rpx;
  margin-bottom: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8rpx 32rpx rgba(255, 107, 107, 0.3);
}

.balance-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 16rpx;
}

.balance-value {
  font-size: 72rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 40rpx;
}

.balance-actions {
  display: flex;
  gap: 30rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 50rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 40rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.3);

  text {
    font-size: 30rpx;
    color: #fff;
  }

  &.primary {
    background: #fff;

    text {
      color: #ff6b6b;
    }
  }
}

.menu-group {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f9f9f9;
  }
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.menu-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu-text {
  font-size: 30rpx;
  color: #333;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.menu-value {
  font-size: 28rpx;
  color: #999;
}

.security-tips {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 30rpx;

  text {
    font-size: 24rpx;
    color: #999;
  }
}
</style>
