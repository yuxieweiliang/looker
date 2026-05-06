<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="银行卡" show-back>
      <template #right>
        <text class="add-btn" @click="onAddCard">添加</text>
      </template>
    </CustomNavbar>

    <view class="card-container">
      <!-- 银行卡列表 -->
      <scroll-view
        scroll-y
        class="card-list"
        :refresher-enabled="true"
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <view v-if="cardList.length > 0" class="list-content">
          <view
            v-for="card in cardList"
            :key="card.id"
            class="bank-card"
            :style="{ background: getBankColor(card.bankName) }"
            @click="onCardClick(card)"
          >
            <view class="card-header">
              <view class="bank-info">
                <text class="bank-name">{{ card.bankName }}</text>
                <text v-if="card.isDefault" class="default-tag">默认</text>
              </view>
              <AppIcon name="credit-card" size="48rpx" color="rgba(255,255,255,0.6)" />
            </view>
            <view class="card-number">
              <text class="card-type">{{ card.cardType }}</text>
              <text class="number">**** **** **** {{ card.cardNumber.slice(-4) }}</text>
            </view>
            <view class="card-holder">
              <text>{{ card.holderName }}</text>
            </view>
          </view>

          <!-- 提示 -->
          <view class="security-tips">
            <AppIcon name="shield-o" size="28rpx" color="#999" />
            <text>您的银行卡信息已加密保护，仅用于提现</text>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else class="empty-state">
          <AppIcon name="credit-card" size="120rpx" color="#ddd" />
          <text class="empty-text">还没有绑定银行卡</text>
          <text class="empty-sub">添加银行卡后可以快速提现</text>
          <button class="add-card-btn" @click="onAddCard">添加银行卡</button>
        </view>
      </scroll-view>
    </view>

    <!-- 操作菜单 -->
    <uni-popup ref="actionPopup" type="bottom">
      <view class="action-sheet">
        <view class="action-header">
          <text>{{ selectedCard?.bankName }}</text>
        </view>
        <view class="action-item" @click="onSetDefault">
          <text>设为默认</text>
        </view>
        <view class="action-item delete" @click="onDeleteCard">
          <text>解除绑定</text>
        </view>
        <view class="action-cancel" @click="closeAction">
          <text>取消</text>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSystemInfo, showToast } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import AppIcon from '../../components/AppIcon.vue'
import { getBankCardList, setDefaultCard, deleteBankCard } from '../../api/wallet'
import type { BankCard } from '../../api/wallet'

const { navbarHeight } = useSystemInfo()

const cardList = ref<BankCard[]>([])
const refreshing = ref(false)
const selectedCard = ref<BankCard | null>(null)
const actionPopup = ref<any>(null)

// 银行背景色
const bankColors: Record<string, string> = {
  '工商银行': 'linear-gradient(135deg, #c41e3a 0%, #e31837 100%)',
  '建设银行': 'linear-gradient(135deg, #0066b3 0%, #0099cc 100%)',
  '农业银行': 'linear-gradient(135deg, #00a651 0%, #00c853 100%)',
  '中国银行': 'linear-gradient(135deg, #a71e32 0%, #c41e3a 100%)',
  '招商银行': 'linear-gradient(135deg, #e60012 0%, #ff1744 100%)',
  '支付宝': 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)',
}

const getBankColor = (bankName: string): string => {
  return bankColors[bankName] || 'linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%)'
}

// 获取银行卡列表
const fetchCards = async () => {
  try {
    const res = await getBankCardList()
    if (res.code === 0 && res.data) {
      cardList.value = res.data
    }
  } catch (error) {
    console.error('获取银行卡失败', error)
    showToast('获取失败')
  } finally {
    refreshing.value = false
  }
}

const onRefresh = () => {
  refreshing.value = true
  fetchCards()
}

const onAddCard = () => {
  uni.showToast({
    title: '添加银行卡功能开发中',
    icon: 'none',
  })
}

const onCardClick = (card: BankCard) => {
  selectedCard.value = card
  actionPopup.value?.open()
}

const closeAction = () => {
  actionPopup.value?.close()
}

const onSetDefault = async () => {
  if (!selectedCard.value) return

  try {
    const res = await setDefaultCard(selectedCard.value.id)
    if (res.code === 0) {
      cardList.value.forEach(card => {
        card.isDefault = card.id === selectedCard.value?.id
      })
      showToast('设置成功', 'success')
    } else {
      showToast(res.message || '设置失败')
    }
  } catch (error) {
    showToast('设置失败')
  }

  closeAction()
}

const onDeleteCard = async () => {
  if (!selectedCard.value) return

  uni.showModal({
    title: '解除绑定',
    content: `确定要解除 ${selectedCard.value.bankName} 的绑定吗？`,
    confirmColor: '#ff6b6b',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await deleteBankCard(selectedCard.value!.id)
          if (result.code === 0) {
            cardList.value = cardList.value.filter(card => card.id !== selectedCard.value?.id)
            showToast('解绑成功', 'success')
          } else {
            showToast(result.message || '解绑失败')
          }
        } catch (error) {
          showToast('解绑失败')
        }
      }
      closeAction()
    },
  })
}

onMounted(() => {
  fetchCards()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.add-btn {
  font-size: 28rpx;
  color: #ff6b6b;
  padding: 10rpx 20rpx;
}

.card-container {
  padding: 20rpx;
}

.card-list {
  height: calc(100vh - v-bind(navbarHeight) * 1px - 40rpx);
}

.bank-card {
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300rpx;
    height: 300rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
}

.bank-info {
  display: flex;
  align-items: center;
  gap: 16rpx;

  .bank-name {
    font-size: 32rpx;
    color: #fff;
    font-weight: 600;
  }

  .default-tag {
    font-size: 20rpx;
    color: #fff;
    background: rgba(255, 255, 255, 0.3);
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
  }
}

.card-number {
  margin-bottom: 30rpx;

  .card-type {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    display: block;
    margin-bottom: 12rpx;
  }

  .number {
    font-size: 40rpx;
    color: #fff;
    font-weight: 500;
    letter-spacing: 4rpx;
  }
}

.card-holder {
  text {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
  }
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
    margin-bottom: 40rpx;
  }
}

.add-card-btn {
  width: 300rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: #fff;
  font-size: 30rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-sheet {
  background: #f5f5f5;
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;
}

.action-header {
  padding: 30rpx;
  text-align: center;
  background: #fff;
  border-bottom: 1rpx solid #f5f5f5;

  text {
    font-size: 28rpx;
    color: #999;
  }
}

.action-item {
  padding: 30rpx;
  background: #fff;
  text-align: center;
  border-bottom: 1rpx solid #f5f5f5;

  text {
    font-size: 32rpx;
    color: #333;
  }

  &.delete text {
    color: #ff6b6b;
  }

  &:active {
    background: #f9f9f9;
  }
}

.action-cancel {
  padding: 30rpx;
  background: #fff;
  text-align: center;
  margin-top: 16rpx;

  text {
    font-size: 32rpx;
    color: #666;
  }

  &:active {
    background: #f9f9f9;
  }
}
</style>
