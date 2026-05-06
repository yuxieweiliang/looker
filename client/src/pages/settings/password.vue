<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="修改密码" show-back />

    <view class="form-container">
      <!-- 密码输入 -->
      <view class="input-group">
        <view class="input-item">
          <text class="input-label">当前密码</text>
          <view class="password-input">
            <input
              v-model="form.oldPassword"
              class="input-field"
              :type="showOldPwd ? 'text' : 'password'"
              placeholder="请输入当前密码"
              maxlength="20"
            />
            <AppIcon
              :name="showOldPwd ? 'eye' : 'eye-o'"
              size="40rpx"
              color="#999"
              @click="showOldPwd = !showOldPwd"
            />
          </view>
        </view>

        <view class="input-item">
          <text class="input-label">新密码</text>
          <view class="password-input">
            <input
              v-model="form.newPassword"
              class="input-field"
              :type="showNewPwd ? 'text' : 'password'"
              placeholder="请输入新密码（6-20位）"
              maxlength="20"
            />
            <AppIcon
              :name="showNewPwd ? 'eye' : 'eye-o'"
              size="40rpx"
              color="#999"
              @click="showNewPwd = !showNewPwd"
            />
          </view>
        </view>

        <view class="input-item">
          <text class="input-label">确认新密码</text>
          <view class="password-input">
            <input
              v-model="form.confirmPassword"
              class="input-field"
              :type="showConfirmPwd ? 'text' : 'password'"
              placeholder="请再次输入新密码"
              maxlength="20"
            />
            <AppIcon
              :name="showConfirmPwd ? 'eye' : 'eye-o'"
              size="40rpx"
              color="#999"
              @click="showConfirmPwd = !showConfirmPwd"
            />
          </view>
        </view>
      </view>

      <!-- 密码强度 -->
      <view class="strength-section" v-if="form.newPassword">
        <text class="strength-label">密码强度</text>
        <view class="strength-bar">
          <view class="strength-fill" :class="strengthClass" :style="{ width: strengthWidth }"></view>
        </view>
        <text class="strength-text">{{ strengthText }}</text>
      </view>

      <!-- 提示信息 -->
      <view class="tips">
        <view class="tip-item">
          <AppIcon :name="hasLength ? 'success' : 'circle-o'" size="24rpx" :color="hasLength ? '#10ac84' : '#999'" />
          <text :class="{ valid: hasLength }">6-20位字符</text>
        </view>
        <view class="tip-item">
          <AppIcon :name="hasLetter ? 'success' : 'circle-o'" size="24rpx" :color="hasLetter ? '#10ac84' : '#999'" />
          <text :class="{ valid: hasLetter }">包含字母</text>
        </view>
        <view class="tip-item">
          <AppIcon :name="hasNumber ? 'success' : 'circle-o'" size="24rpx" :color="hasNumber ? '#10ac84' : '#999'" />
          <text :class="{ valid: hasNumber }">包含数字</text>
        </view>
      </view>

      <!-- 确认按钮 -->
      <button class="submit-btn" :disabled="!canSubmit" @click="onSubmit">
        确认修改
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

const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const showOldPwd = ref(false)
const showNewPwd = ref(false)
const showConfirmPwd = ref(false)

// 密码验证
const hasLength = computed(() => form.value.newPassword.length >= 6)
const hasLetter = computed(() => /[a-zA-Z]/.test(form.value.newPassword))
const hasNumber = computed(() => /\d/.test(form.value.newPassword))

// 密码强度
const strength = computed(() => {
  let score = 0
  if (hasLength.value) score++
  if (hasLetter.value) score++
  if (hasNumber.value) score++
  if (form.value.newPassword.length >= 10) score++
  if (/[^a-zA-Z0-9]/.test(form.value.newPassword)) score++
  return score
})

const strengthClass = computed(() => {
  if (strength.value <= 2) return 'weak'
  if (strength.value <= 4) return 'medium'
  return 'strong'
})

const strengthWidth = computed(() => {
  const width = (strength.value / 5) * 100
  return `${width}%`
})

const strengthText = computed(() => {
  if (strength.value <= 2) return '弱'
  if (strength.value <= 4) return '中'
  return '强'
})

const canSubmit = computed(() => {
  return form.value.oldPassword.length >= 6 &&
    form.value.newPassword.length >= 6 &&
    form.value.newPassword === form.value.confirmPassword
})

const onSubmit = () => {
  if (form.value.newPassword !== form.value.confirmPassword) {
    showToast('两次输入的密码不一致')
    return
  }

  uni.showLoading({ title: '处理中...' })

  setTimeout(() => {
    uni.hideLoading()
    showToast('密码修改成功', 'success')

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

.password-input {
  display: flex;
  align-items: center;

  .input-field {
    flex: 1;
    height: 60rpx;
    font-size: 32rpx;
    color: #333;
  }
}

.strength-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;

  .strength-label {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 16rpx;
    display: block;
  }

  .strength-bar {
    height: 8rpx;
    background: #f0f0f0;
    border-radius: 4rpx;
    overflow: hidden;
    margin-bottom: 12rpx;

    .strength-fill {
      height: 100%;
      border-radius: 4rpx;
      transition: all 0.3s;

      &.weak {
        background: #ff6b6b;
      }

      &.medium {
        background: #f7b731;
      }

      &.strong {
        background: #10ac84;
      }
    }
  }

  .strength-text {
    font-size: 26rpx;
    color: #999;
  }
}

.tips {
  margin-bottom: 60rpx;

  .tip-item {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 16rpx;

    text {
      font-size: 26rpx;
      color: #999;

      &.valid {
        color: #10ac84;
      }
    }
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
