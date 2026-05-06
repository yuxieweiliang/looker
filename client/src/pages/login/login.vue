<template>
  <view class="page-container">
    <CustomNavbar title="登录" :show-back="true" />

    <!-- Logo区域 -->
    <view class="logo-section">
      <view class="logo-circle">
        <AppIcon name="photo-o" size="80rpx" color="#ff6b6b" />
      </view>
      <text class="app-name">Looker</text>
      <text class="app-slogan">发现美好，分享精彩</text>
    </view>

    <!-- 登录方式切换 -->
    <view class="login-tabs">
      <view
        v-for="(tab, index) in loginTabs"
        :key="index"
        class="tab-item"
        :class="{ active: currentTab === index }"
        @click="switchTab(index)"
      >
        <text>{{ tab }}</text>
      </view>
      <view class="tab-indicator" :style="{ left: indicatorLeft }"></view>
    </view>

    <!-- 密码登录 -->
    <view v-if="currentTab === 0" class="form-section">
      <view class="input-group">
        <view class="input-item">
          <AppIcon name="phone-o" size="40rpx" color="#999" />
          <input
            v-model="passwordForm.phone"
            class="input-field"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
          />
        </view>
        <view class="input-item">
          <AppIcon name="lock-o" size="40rpx" color="#999" />
          <input
            v-model="passwordForm.password"
            class="input-field"
            type="password"
            maxlength="20"
            placeholder="请输入密码"
          />
        </view>
      </view>

      <button class="submit-btn" @click="onPasswordLogin">
        <text>登录</text>
      </button>

      <view class="form-footer">
        <text class="link-text" @click="goToRegister">注册账号</text>
        <text class="link-text" @click="goToForgot">忘记密码？</text>
      </view>
    </view>

    <!-- 验证码登录 -->
    <view v-else-if="currentTab === 1" class="form-section">
      <view class="input-group">
        <view class="input-item">
          <AppIcon name="phone-o" size="40rpx" color="#999" />
          <input
            v-model="codeForm.phone"
            class="input-field"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
          />
        </view>
        <view class="input-item">
          <AppIcon name="shield-o" size="40rpx" color="#999" />
          <input
            v-model="codeForm.code"
            class="input-field"
            type="number"
            maxlength="6"
            placeholder="请输入验证码"
          />
          <button
            class="code-btn"
            :disabled="codeCountdown > 0"
            @click="sendCode"
          >
            {{ codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码' }}
          </button>
        </view>
      </view>

      <button class="submit-btn" @click="onCodeLogin">
        <text>登录 / 注册</text>
      </button>
    </view>

    <!-- 第三方登录 -->
    <view v-else class="third-section">
      <view class="third-list">
        <view class="third-item" @click="onWechatLogin">
          <view class="third-icon wechat">
            <AppIcon name="wechat" size="56rpx" color="#fff" />
          </view>
          <text class="third-name">微信登录</text>
        </view>

        <view class="third-item" @click="onWeiboLogin">
          <view class="third-icon weibo">
            <AppIcon name="weibo" size="56rpx" color="#fff" />
          </view>
          <text class="third-name">微博登录</text>
        </view>
      </view>
    </view>

    <!-- 协议 -->
    <view class="agreement-section">
      <checkbox
        :checked="agreed"
        @click="agreed = !agreed"
        color="#ff6b6b"
      />
      <text class="agreement-text">
        我已阅读并同意
        <text class="link" @click="showAgreement">《用户协议》</text>
        和
        <text class="link" @click="showPrivacy">《隐私政策》</text>
      </text>
    </view>

    <!-- 游客入口 -->
    <view class="guest-entry" @click="onGuestLogin">
      <text>暂不登录，先逛逛</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppIcon from "../../components/AppIcon.vue"
import { ref, computed } from 'vue'
import CustomNavbar from '../../components/CustomNavbar.vue'
import { loginByPassword, loginByPhone, sendVerifyCode } from '../../api/auth'
import { useUserStore } from '../../stores/user'

const loginTabs = ['密码登录', '验证码登录', '第三方登录']
const currentTab = ref(0)
const agreed = ref(false)
const codeCountdown = ref(0)

const userStore = useUserStore()

const passwordForm = ref({
  phone: '',
  password: '',
})

const codeForm = ref({
  phone: '',
  code: '',
})

const indicatorLeft = computed(() => {
  const positions = ['16.67%', '50%', '83.33%']
  return positions[currentTab.value]
})

const switchTab = (index: number) => {
  currentTab.value = index
}

// 发送验证码
const sendCode = async () => {
  if (!codeForm.value.phone || codeForm.value.phone.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  try {
    const res = await sendVerifyCode(codeForm.value.phone)
    if (res.code === 0) {
      uni.showToast({ title: '验证码已发送', icon: 'success' })
      codeCountdown.value = 60
      const timer = setInterval(() => {
        codeCountdown.value--
        if (codeCountdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      uni.showToast({ title: res.message || '发送失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '发送失败', icon: 'none' })
  }
}

// 密码登录
const onPasswordLogin = async () => {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' })
    return
  }

  if (!passwordForm.value.phone || !passwordForm.value.password) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  if (passwordForm.value.phone.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  uni.showLoading({ title: '登录中...' })

  try {
    const res = await loginByPassword({
      phone: passwordForm.value.phone,
      password: passwordForm.value.password,
    })

    uni.hideLoading()

    if (res.code === 0 && res.data) {
      // 保存登录信息
      userStore.setToken(res.data.token)
      userStore.setUserInfo(res.data.user)

      uni.showToast({ title: '登录成功', icon: 'success' })

      setTimeout(() => {
        uni.switchTab({ url: '/pages/home/home' })
      }, 1500)
    } else {
      uni.showToast({ title: res.message || '登录失败', icon: 'none' })
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
  }
}

// 验证码登录
const onCodeLogin = async () => {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' })
    return
  }

  if (!codeForm.value.phone || !codeForm.value.code) {
    uni.showToast({ title: '请填写完整信息', icon: 'none' })
    return
  }

  if (codeForm.value.phone.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  uni.showLoading({ title: '登录中...' })

  try {
    const res = await loginByPhone({
      phone: codeForm.value.phone,
      code: codeForm.value.code,
    })

    uni.hideLoading()

    if (res.code === 0 && res.data) {
      // 保存登录信息
      userStore.setToken(res.data.token)
      userStore.setUserInfo(res.data.user)

      uni.showToast({ title: '登录成功', icon: 'success' })

      setTimeout(() => {
        uni.switchTab({ url: '/pages/home/home' })
      }, 1500)
    } else {
      uni.showToast({ title: res.message || '登录失败', icon: 'none' })
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
  }
}

// 微信登录
const onWechatLogin = () => {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' })
    return
  }

  uni.login({
    provider: 'weixin',
    success: (res) => {
      console.log('微信登录成功', res)
      // 调用后端登录接口
      uni.showToast({ title: '登录成功', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: '登录失败', icon: 'none' })
    },
  })
}

// 微博登录
const onWeiboLogin = () => {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' })
    return
  }

  uni.login({
    provider: 'sinaweibo',
    success: (res) => {
      console.log('微博登录成功', res)
      uni.showToast({ title: '登录成功', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: '登录失败', icon: 'none' })
    },
  })
}

// 游客登录
const onGuestLogin = () => {
  uni.switchTab({ url: '/pages/home/home' })
}

// 去注册
const goToRegister = () => {
  uni.navigateTo({ url: '/pages/register/register' })
}

// 忘记密码
const goToForgot = () => {
  uni.navigateTo({ url: '/pages/forgot-password/forgot-password' })
}

// 显示协议
const showAgreement = () => {
  uni.navigateTo({ url: '/pages/agreement/agreement?type=user' })
}

const showPrivacy = () => {
  uni.navigateTo({ url: '/pages/agreement/agreement?type=privacy' })
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff5f5 0%, #fff 50%);
  padding-top: calc(var(--status-bar-height) + 44px);
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;

  .logo-circle {
    width: 160rpx;
    height: 160rpx;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30rpx;
    box-shadow: 0 16rpx 40rpx rgba(255, 107, 107, 0.3);
  }

  .app-name {
    font-size: 48rpx;
    font-weight: 700;
    color: #333;
    margin-bottom: 16rpx;
  }

  .app-slogan {
    font-size: 28rpx;
    color: #999;
  }
}

.login-tabs {
  position: relative;
  display: flex;
  justify-content: space-around;
  padding: 0 40rpx;
  margin-bottom: 60rpx;

  .tab-item {
    padding: 20rpx 0;
    font-size: 30rpx;
    color: #999;
    transition: all 0.3s ease;

    &.active {
      color: #ff6b6b;
      font-weight: 600;
    }
  }

  .tab-indicator {
    position: absolute;
    bottom: 0;
    transform: translateX(-50%);
    width: 40rpx;
    height: 6rpx;
    background: #ff6b6b;
    border-radius: 3rpx;
    transition: all 0.3s ease;
  }
}

.form-section {
  padding: 0 60rpx;
}

.input-group {
  margin-bottom: 40rpx;
}

.input-item {
  display: flex;
  align-items: center;
  background: #f8f8f8;
  border-radius: 16rpx;
  padding: 0 30rpx;
  margin-bottom: 24rpx;
  height: 100rpx;

  .input-field {
    flex: 1;
    margin-left: 20rpx;
    font-size: 30rpx;
    color: #333;
  }

  .code-btn {
    padding: 0 24rpx;
    height: 60rpx;
    line-height: 60rpx;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
    color: #fff;
    font-size: 24rpx;
    border-radius: 30rpx;

    &:disabled {
      background: #ddd;
    }
  }
}

.submit-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 40rpx rgba(255, 107, 107, 0.3);

  &:active {
    opacity: 0.9;
  }
}

.form-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 30rpx;
  padding: 0 20rpx;

  .link-text {
    font-size: 26rpx;
    color: #ff6b6b;
  }
}

.third-section {
  padding: 40rpx 100rpx;
}

.third-list {
  display: flex;
  justify-content: space-around;
}

.third-item {
  display: flex;
  flex-direction: column;
  align-items: center;

  &:active {
    opacity: 0.8;
  }
}

.third-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;

  &.wechat {
    background: linear-gradient(135deg, #07c160 0%, #0aad4d 100%);
  }

  &.weibo {
    background: linear-gradient(135deg, #e6162d 0%, #f04c5d 100%);
  }
}

.third-name {
  font-size: 26rpx;
  color: #666;
}

.agreement-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60rpx 40rpx 40rpx;

  .agreement-text {
    font-size: 24rpx;
    color: #666;
    margin-left: 12rpx;

    .link {
      color: #ff6b6b;
    }
  }
}

.guest-entry {
  text-align: center;
  padding: 20rpx;

  text {
    font-size: 26rpx;
    color: #999;
    text-decoration: underline;
  }
}
</style>
