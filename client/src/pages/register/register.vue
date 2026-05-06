<template>
  <view class="page-container">
    <view class="register-header">
      <AppIcon name="arrow-left" size="44rpx" color="#333" @click="goBack" />
      <text class="header-title">注册</text>
      <view class="header-right"></view>
    </view>

    <view class="register-form">
      <!-- 头像上传 -->
      <view class="avatar-upload" @click="chooseAvatar">
        <image v-if="avatar" class="avatar-img" :src="avatar" mode="aspectFill" />
        <view v-else class="avatar-placeholder">
          <AppIcon name="photo-o" size="80rpx" color="#ff6b6b" />
          <text class="upload-text">点击上传头像</text>
        </view>
      </view>

      <!-- 表单 -->
      <view class="form-item">
        <AppIcon name="user-o" size="40rpx" color="#999" />
        <input
          v-model="form.username"
          class="form-input"
          placeholder="请输入用户名"
          maxlength="20"
        />
      </view>

      <view class="form-item">
        <AppIcon name="phone-o" size="40rpx" color="#999" />
        <input
          v-model="form.phone"
          class="form-input"
          placeholder="请输入手机号"
          type="number"
          maxlength="11"
        />
      </view>

      <view class="form-item">
        <AppIcon name="shield-o" size="40rpx" color="#999" />
        <input
          v-model="form.code"
          class="form-input"
          placeholder="请输入验证码"
          type="number"
          maxlength="6"
        />
        <button
          class="code-btn"
          :disabled="countdown > 0"
          @click="sendCode"
        >
          {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
        </button>
      </view>

      <view class="form-item">
        <AppIcon name="lock-o" size="40rpx" color="#999" />
        <input
          v-model="form.password"
          class="form-input"
          placeholder="请设置密码"
          type="password"
          maxlength="20"
        />
      </view>

      <!-- 协议 -->
      <view class="agreement">
        <view class="checkbox" :class="{ checked: agree }" @click="agree = !agree">
          <AppIcon v-if="agree" name="success" size="20rpx" color="#fff" />
        </view>
        <text class="agreement-text">
          我已阅读并同意
          <text class="link" @click="showAgreement">《用户协议》</text>
          和
          <text class="link" @click="showPrivacy">《隐私政策》</text>
        </text>
      </view>

      <!-- 注册按钮 -->
      <button
        class="register-btn"
        :disabled="!canSubmit"
        :class="{ active: canSubmit }"
        @click="handleRegister"
      >
        注册
      </button>

      <!-- 登录入口 -->
      <view class="login-entry">
        <text>已有账号？</text>
        <text class="login-link" @click="goLogin">立即登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppIcon from '../../components/AppIcon.vue'

const avatar = ref('')
const agree = ref(false)
const countdown = ref(0)

const form = ref({
  username: '',
  phone: '',
  code: '',
  password: ''
})

const canSubmit = computed(() => {
  return (
    form.value.username &&
    form.value.phone.length === 11 &&
    form.value.code.length === 6 &&
    form.value.password.length >= 6 &&
    agree.value
  )
})

const chooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    success: (res) => {
      avatar.value = res.tempFilePaths[0]
    }
  })
}

const sendCode = () => {
  if (form.value.phone.length !== 11) {
    uni.showToast({ title: '请输入正确手机号', icon: 'none' })
    return
  }
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
  uni.showToast({ title: '验证码已发送', icon: 'success' })
}

const handleRegister = () => {
  if (!canSubmit.value) return
  uni.showLoading({ title: '注册中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '注册成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }, 1500)
}

const goBack = () => {
  uni.navigateBack()
}

const goLogin = () => {
  uni.redirectTo({ url: '/pages/login/login' })
}

const showAgreement = () => {
  uni.showModal({ title: '用户协议', content: '这里是用户协议内容...', showCancel: false })
}

const showPrivacy = () => {
  uni.showModal({ title: '隐私政策', content: '这里是隐私政策内容...', showCancel: false })
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #fff;
  padding: 0 40rpx;
}

.register-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  height: 88rpx;
}

.header-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.header-right {
  width: 44rpx;
}

.register-form {
  padding-top: 40rpx;
}

.avatar-upload {
  width: 200rpx;
  height: 200rpx;
  margin: 0 auto 60rpx;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .avatar-img {
    width: 100%;
    height: 100%;
  }

  .avatar-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;

    .upload-text {
      font-size: 24rpx;
      color: #999;
      margin-top: 16rpx;
    }
  }
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  .form-input {
    flex: 1;
    margin-left: 20rpx;
    font-size: 30rpx;
    color: #333;
  }

  .code-btn {
    padding: 16rpx 24rpx;
    background: #ff6b6b;
    color: #fff;
    font-size: 26rpx;
    border-radius: 8rpx;

    &:disabled {
      background: #ddd;
    }
  }
}

.agreement {
  display: flex;
  align-items: center;
  margin-top: 40rpx;

  .checkbox {
    width: 32rpx;
    height: 32rpx;
    border: 2rpx solid #ccc;
    border-radius: 50%;
    margin-right: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    &.checked {
      background: #ff6b6b;
      border-color: #ff6b6b;
    }
  }

  .agreement-text {
    font-size: 26rpx;
    color: #666;

    .link {
      color: #ff6b6b;
    }
  }
}

.register-btn {
  margin-top: 60rpx;
  height: 90rpx;
  background: #ddd;
  color: #fff;
  font-size: 32rpx;
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &.active {
    background: #ff6b6b;
  }
}

.login-entry {
  text-align: center;
  margin-top: 40rpx;
  font-size: 28rpx;
  color: #666;

  .login-link {
    color: #ff6b6b;
    margin-left: 8rpx;
  }
}
</style>
