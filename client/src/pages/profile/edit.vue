<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="编辑资料" :show-back="true" />

    <!-- 头像区域 -->
    <view class="avatar-section">
      <view class="avatar-wrapper" @click="onChooseAvatar">
        <image
          class="avatar-image"
          :src="formData.avatar || '/src/static/images/default-avatar.png'"
          mode="aspectFill"
        />
        <view class="avatar-mask">
          <AppIcon name="camera-o" size="40rpx" color="#fff" />
        </view>
      </view>
      <text class="avatar-tip">点击更换头像</text>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <!-- 基础信息 -->
      <view class="form-group">
        <view class="group-title">基础信息</view>

        <view class="form-item">
          <text class="item-label">昵称</text>
          <input
            v-model="formData.name"
            class="item-input"
            placeholder="请输入昵称"
            maxlength="20"
          />
        </view>

        <view class="form-item">
          <text class="item-label">简介</text>
          <textarea
            v-model="formData.bio"
            class="item-textarea"
            placeholder="介绍一下你自己..."
            maxlength="200"
            auto-height
          />
        </view>

        <view class="form-item">
          <text class="item-label">性别</text>
          <picker mode="selector" :range="genderOptions" :value="genderIndex" @change="onGenderChange">
            <view class="item-content">
              <text class="item-value">{{ genderText }}</text>
              <AppIcon name="arrow" size="28rpx" color="#ccc" />
            </view>
          </picker>
        </view>

        <view class="form-item">
          <text class="item-label">生日</text>
          <picker mode="date" :value="formData.birthday || ''" @change="onBirthdayChange">
            <view class="item-content">
              <text class="item-value">{{ formData.birthday || '请选择' }}</text>
              <AppIcon name="arrow" size="28rpx" color="#ccc" />
            </view>
          </picker>
        </view>
      </view>

      <!-- 联系方式 -->
      <view class="form-group">
        <view class="group-title">联系方式</view>

        <view class="form-item" @click="onEditPhone">
          <text class="item-label">手机号</text>
          <view class="item-content">
            <text class="item-value">{{ maskPhone(formData.phone) || '未绑定' }}</text>
            <AppIcon name="arrow" size="28rpx" color="#ccc" />
          </view>
        </view>

        <view class="form-item">
          <text class="item-label">地址</text>
          <input
            v-model="formData.location"
            class="item-input"
            placeholder="请输入地址"
            maxlength="100"
          />
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="footer">
      <button class="save-btn" :class="{ disabled: !hasChanged || saving }" @click="onSave">
        {{ saving ? '保存中...' : '保存修改' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSystemInfo, showToast, showLoading, hideLoading } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import AppIcon from '../../components/AppIcon.vue'
import { getUserInfo, updateUserInfo, uploadAvatar } from '../../api/user'
import { useUserStore } from '../../stores/user'
import type { UserInfo } from '../../types/user'

const { navbarHeight } = useSystemInfo()
const userStore = useUserStore()

const genderOptions = ['未知', '男', '女']
const genderMap: Record<string, number> = { unknown: 0, male: 1, female: 2 }
const genderReverseMap: Record<number, 'unknown' | 'male' | 'female'> = { 0: 'unknown', 1: 'male', 2: 'female' }

const loading = ref(false)
const saving = ref(false)

// 原始数据（用于对比是否修改）
const originalData = ref<Partial<UserInfo>>({})

// 表单数据
const formData = ref<Partial<UserInfo>>({
  name: '',
  avatar: '',
  bio: '',
  gender: 'unknown',
  birthday: '',
  phone: '',
  location: '',
})

// 性别索引
const genderIndex = computed(() => {
  return genderMap[formData.value.gender || 'unknown'] || 0
})

// 性别文本
const genderText = computed(() => {
  return genderOptions[genderIndex.value]
})

// 是否有修改
const hasChanged = computed(() => {
  return (
    formData.value.avatar !== originalData.value.avatar ||
    formData.value.name !== originalData.value.name ||
    formData.value.bio !== originalData.value.bio ||
    formData.value.gender !== originalData.value.gender ||
    formData.value.birthday !== originalData.value.birthday ||
    formData.value.location !== originalData.value.location
  )
})

// 隐藏手机号
const maskPhone = (phone?: string): string => {
  if (!phone || phone.length !== 11) return ''
  return phone.slice(0, 3) + '****' + phone.slice(7)
}

// 性别选择
const onGenderChange = (e: any) => {
  formData.value.gender = genderReverseMap[e.detail.value]
}

// 生日选择
const onBirthdayChange = (e: any) => {
  formData.value.birthday = e.detail.value
}

// 选择头像
const onChooseAvatar = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      uploadAvatarFile(tempFilePath)
    },
  })
}

// 上传头像
const uploadAvatarFile = async (filePath: string) => {
  showLoading('上传中...')
  try {
    const res = await uploadAvatar(filePath)
    if (res.code === 0 && res.data) {
      formData.value.avatar = res.data.url
      showToast('上传成功', 'success')
    } else {
      showToast(res.message || '上传失败')
    }
  } catch (error) {
    console.error('上传失败', error)
    showToast('上传失败')
  } finally {
    hideLoading()
  }
}

// 编辑手机号
const onEditPhone = () => {
  uni.navigateTo({
    url: '/pages/settings/phone',
  })
}

// 保存修改
const onSave = async () => {
  if (!hasChanged.value || saving.value) return

  // 表单验证
  if (!formData.value.name?.trim()) {
    showToast('请输入昵称')
    return
  }

  saving.value = true
  showLoading('保存中...')

  try {
    const res = await updateUserInfo({
      name: formData.value.name,
      avatar: formData.value.avatar,
      bio: formData.value.bio,
      gender: formData.value.gender,
      birthday: formData.value.birthday,
      location: formData.value.location,
    })

    hideLoading()

    if (res.code === 0) {
      // 更新原始数据
      originalData.value = { ...formData.value }

      // 更新 store
      userStore.setUserInfo(res.data)

      showToast('保存成功', 'success')

      // 通知上一页刷新
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2] as any
      if (prevPage && prevPage.$vm && prevPage.$vm.refreshUserInfo) {
        prevPage.$vm.refreshUserInfo()
      }

      setTimeout(() => {
        uni.navigateBack()
      }, 500)
    } else {
      showToast(res.message || '保存失败')
    }
  } catch (error) {
    hideLoading()
    console.error('保存失败', error)
    showToast('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  try {
    const res = await getUserInfo()
    if (res.code === 0 && res.data) {
      formData.value = { ...res.data }
      originalData.value = { ...res.data }
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
    showToast('获取信息失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 160rpx;
}

// 头像区域
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  background: linear-gradient(180deg, #ffe4e1 0%, #f5f5f5 100%);
}

.avatar-wrapper {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 6rpx solid #fff;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);

  &:active {
    opacity: 0.9;
  }
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.avatar-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60rpx;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-tip {
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #666;
}

// 表单区域
.form-section {
  padding: 0 30rpx;
}

.form-group {
  margin-bottom: 30rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.group-title {
  padding: 24rpx 30rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  background: #fafafa;
  border-bottom: 1rpx solid #f0f0f0;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #fafafa;
  }
}

.item-label {
  width: 160rpx;
  font-size: 30rpx;
  color: #333;
  flex-shrink: 0;
}

.item-input {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  text-align: right;
}

.item-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
}

.item-value {
  font-size: 30rpx;
  color: #666;
}

.item-textarea {
  flex: 1;
  min-height: 120rpx;
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  text-align: right;
}

// 底部按钮
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 44rpx;
  border: none;

  &:active {
    opacity: 0.9;
  }

  &.disabled {
    background: #ddd;
  }

  &::after {
    display: none;
  }
}
</style>
