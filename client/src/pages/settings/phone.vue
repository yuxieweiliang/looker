<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="修改手机号" show-back />

    <view class="form-container">
      <!-- 当前手机号 -->
      <view class="current-phone">
        <text class="label">当前手机号</text>
        <text class="phone">{{ maskedPhone }}</text>
      </view>

      <!-- 新手机号输入 -->
      <view class="input-group">
        <view class="input-item">
          <text class="input-label">新手机号</text>
          <input
            v-model="form.phone"
            class="input-field"
            type="number"
            placeholder="请输入新手机号"
            maxlength="11"
          />
        </view>

        <view class="input-item">
          <text class="input-label">验证码</text>
          <view class="code-input">
            <input
              v-model="form.code"
              class="input-field"
              type="number"
              placeholder="请输入验证码"
              maxlength="6"
            />
            <button
              class="code-btn"
              :class="{ disabled: counting }"
              :disabled="counting || !canSendCode"
              @click="sendCode"
            >
              {{ codeText }}
            </button>
          </view>
        </view>
      </view>

      <!-- 提示信息 -->
      <view class="tips">
        <AppIcon name="info-o" size="28rpx" color="#999" />
        <text>更换手机号后，下次登录需使用新手机号</text>
      </view>

      <!-- 确认按钮 -->
      <button class="submit-btn" :disabled="!canSubmit" @click="onSubmit">
        确认更换
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSystemInfo, showToast } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import AppIcon from '../../components/AppIcon.vue'

const { navbarHeight } = useSystemInfo()

// 当前手机号（从存储或用户信息获取）
const currentPhone = ref('13888888888')
const maskedPhone = computed(() => {
  return currentPhone.value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
})

const form = ref({
  phone: '',
  code: '',
})

const counting = ref(false)
const countDown = ref(60)
const codeText = computed(() => {
  return counting.value ? `${countDown.value}s后重发` : '获取验证码'
})

const canSendCode = computed(() => {
  return form.value.phone.length === 11 && /^1[3-9]\d{9}$/.test(form.value.phone)
})

const canSubmit = computed(() => {
  return form.value.phone.length === 11 && form.value.code.length === 6
})

// 发送验证码
const sendCode = () => {
  if (!canSendCode.value) {
    showToast('请输入正确的手机号')
    return
  }

  counting.value = true
  countDown.value = 60
  showToast('验证码已发送')

  const timer = setInterval(() => {
    countDown.value--
    if (countDown.value <= 0) {
      clearInterval(timer)
      counting.value = false
    }
  }, 1000)
}

// 提交更换
const onSubmit = () => {
  if (!canSubmit.value) return

  uni.showLoading({ title: '处理中...' })

  setTimeout(() => {
    uni.hideLoading()
    showToast('手机号更换成功', 'success')

    // 更新本地存储
    uni.setStorageSync('userPhone', form.value.phone)

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }, 1500)
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.form-container {
  padding: 30rpx;
}

.current-phone {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  display: flex;
  flex-direction: column;
  align-items: center;

  .label {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 16rpx;
  }

  .phone {
    font-size: 48rpx;
    font-weight: 600;
    color: #333;
  }
}

.input-group {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 30rpx;
}

.input-item {
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  .input-label {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 16rpx;
    display: block;
  }
}

.input-field {
  height: 60rpx;
  font-size: 32rpx;
  color: #333;
}

.code-input {
  display: flex;
  align-items: center;

  .input-field {
    flex: 1;
  }

  .code-btn {
    width: 200rpx;
    height: 64rpx;
    background: #ff6b6b;
    color: #fff;
    font-size: 26rpx;
    border-radius: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    &.disabled {
      background: #ccc;
    }
  }
}

.tips {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 60rpx;

  text {
    font-size: 26rpx;
    color: #999;
  }
}

.submit-btn {
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

  &[disabled] {
    background: #ccc;
  }
}
</style>
