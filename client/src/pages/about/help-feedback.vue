<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="帮助与反馈" />

    <!-- 常见问题 -->
    <view class="section">
      <view class="section-title">常见问题</view>
      <view class="faq-list">
        <view
          v-for="(item, index) in faqList"
          :key="index"
          class="faq-item"
          @click="toggleFaq(index)"
        >
          <view class="faq-header">
            <text class="faq-q">{{ item.question }}</text>
            <AppIcon
              :name="item.expanded ? 'arrow-up' : 'arrow-down'"
              size="28rpx"
              color="#999"
            />
          </view>
          <view v-if="item.expanded" class="faq-answer">
            <text>{{ item.answer }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 反馈入口 -->
    <view class="section">
      <view class="section-title">问题反馈</view>
      <view class="feedback-card">
        <textarea
          v-model="feedbackContent"
          class="feedback-input"
          placeholder="请描述您遇到的问题或建议..."
          maxlength="500"
        />
        <text class="word-count">{{ feedbackContent.length }}/500</text>

        <!-- 图片上传 -->
        <view class="upload-section">
          <view
            v-for="(img, idx) in uploadImages"
            :key="idx"
            class="upload-item"
          >
            <image :src="img" mode="aspectFill" />
            <view class="delete-btn" @click="removeImage(idx)">
              <AppIcon name="cross" size="20rpx" color="#fff" />
            </view>
          </view>
          <view v-if="uploadImages.length < 4" class="upload-btn" @click="chooseImage">
            <AppIcon name="photo-o" size="48rpx" color="#ccc" />
            <text>{{ uploadImages.length }}/4</text>
          </view>
        </view>

        <!-- 联系方式 -->
        <view class="contact-input">
          <text class="label">联系方式（选填）</text>
          <input
            v-model="contactInfo"
            type="text"
            placeholder="手机号或邮箱"
          />
        </view>

        <button class="submit-btn" :disabled="!canSubmit" @click="submitFeedback">
          提交反馈
        </button>
      </view>
    </view>

    <!-- 客服信息 -->
    <view class="section">
      <view class="section-title">联系客服</view>
      <view class="contact-card">
        <view class="contact-item" @click="copyEmail">
          <AppIcon name="envelope-o" size="40rpx" color="#ff6b6b" />
          <view class="contact-info">
            <text class="contact-label">客服邮箱</text>
            <text class="contact-value">support@looker.app</text>
          </view>
          <AppIcon name="copy-o" size="32rpx" color="#999" />
        </view>
        <view class="contact-item" @click="callService">
          <AppIcon name="phone-o" size="40rpx" color="#4ecdc4" />
          <view class="contact-info">
            <text class="contact-label">客服热线</text>
            <text class="contact-value">400-888-8888</text>
          </view>
          <AppIcon name="phone-o" size="32rpx" color="#999" />
        </view>
        <view class="service-time">
          服务时间：周一至周日 9:00-21:00
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSystemInfo, showToast } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import AppIcon from '../../components/AppIcon.vue'

const { navbarHeight } = useSystemInfo()

interface FaqItem {
  question: string
  answer: string
  expanded: boolean
}

const faqList = ref<FaqItem[]>([
  {
    question: '如何发布图片作品？',
    answer: '点击底部导航栏的"话题"按钮，选择"发布图片"，上传您的作品并添加描述和话题标签即可发布。',
    expanded: false,
  },
  {
    question: '如何修改个人资料？',
    answer: '进入"我的"页面，点击头像区域进入个人资料编辑页面，可以修改昵称、头像、简介等信息。',
    expanded: false,
  },
  {
    question: '如何删除已发布的作品？',
    answer: '进入"我的作品"页面，点击作品右上角的更多按钮，选择"删除"即可。',
    expanded: false,
  },
  {
    question: '忘记密码怎么办？',
    answer: '在登录页面点击"忘记密码"，通过注册手机号验证身份后重置密码。',
    expanded: false,
  },
  {
    question: '如何举报违规内容？',
    answer: '在作品详情页点击右上角更多按钮，选择"举报"，填写举报原因并提交。',
    expanded: false,
  },
])

const feedbackContent = ref('')
const uploadImages = ref<string[]>([])
const contactInfo = ref('')

const canSubmit = computed(() => feedbackContent.value.trim().length >= 10)

const toggleFaq = (index: number) => {
  faqList.value[index].expanded = !faqList.value[index].expanded
}

const chooseImage = () => {
  uni.chooseImage({
    count: 4 - uploadImages.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      uploadImages.value.push(...res.tempFilePaths)
    },
  })
}

const removeImage = (index: number) => {
  uploadImages.value.splice(index, 1)
}

const submitFeedback = () => {
  if (!canSubmit.value) {
    showToast('请至少输入10个字')
    return
  }

  // 模拟提交
  uni.showLoading({ title: '提交中...' })
  setTimeout(() => {
    uni.hideLoading()
    showToast('提交成功，感谢您的反馈', 'success')
    feedbackContent.value = ''
    uploadImages.value = []
    contactInfo.value = ''
  }, 1500)
}

const copyEmail = () => {
  uni.setClipboardData({
    data: 'support@looker.app',
    success: () => {
      showToast('邮箱已复制')
    },
  })
}

const callService = () => {
  uni.makePhoneCall({
    phoneNumber: '400-888-8888',
  })
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

.section {
  margin: 20rpx;
}

.section-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
  padding-left: 10rpx;
}

.faq-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.faq-item {
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.faq-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;

  &:active {
    background: #f9f9f9;
  }
}

.faq-q {
  flex: 1;
  font-size: 30rpx;
  color: #333;
  margin-right: 20rpx;
}

.faq-answer {
  padding: 0 30rpx 30rpx;
  background: #fafafa;

  text {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
  }
}

.feedback-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.feedback-input {
  width: 100%;
  height: 240rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
}

.word-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.upload-section {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.upload-item {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;

  image {
    width: 100%;
    height: 100%;
  }
}

.delete-btn {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 36rpx;
  height: 36rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-btn {
  width: 160rpx;
  height: 160rpx;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;

  text {
    font-size: 24rpx;
    color: #999;
  }

  &:active {
    background: #f9f9f9;
  }
}

.contact-input {
  margin-bottom: 30rpx;

  .label {
    display: block;
    font-size: 26rpx;
    color: #666;
    margin-bottom: 16rpx;
  }

  input {
    height: 80rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: #333;
  }
}

.submit-btn {
  height: 88rpx;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;

  &:disabled {
    opacity: 0.5;
  }

  &:active:not(:disabled) {
    opacity: 0.9;
  }
}

.contact-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 10rpx 0;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-of-type {
    border-bottom: none;
  }

  &:active {
    background: #f9f9f9;
  }
}

.contact-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
}

.contact-label {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.contact-value {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.service-time {
  text-align: center;
  font-size: 24rpx;
  color: #999;
  padding: 20rpx 0;
  border-top: 1rpx solid #f5f5f5;
  margin-top: 10rpx;
}
</style>
