<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="话题" :show-back="false" />

    <!-- 上传区域 -->
    <view class="upload-section">
      <view class="upload-title">
        <text class="title-text">分享你的精彩瞬间</text>
        <text class="title-sub">支持图片、视频上传</text>
      </view>

      <view class="upload-grid">
        <view
          v-for="(file, index) in fileList"
          :key="index"
          class="upload-item"
        >
          <image
            :src="file.url"
            mode="aspectFill"
            class="upload-image"
            @click="previewImage(index)"
          />
          <view class="delete-btn" @click="deleteFile(index)">
            <AppIcon name="cross" size="24rpx" color="#fff" />
          </view>
        </view>

        <view
          v-if="fileList.length < maxCount"
          class="upload-add"
          @click="chooseMedia"
        >
          <AppIcon name="plus" size="48rpx" color="#ccc" />
          <text class="add-text">添加</text>
        </view>
      </view>

      <text class="upload-tip">最多可上传 9 张图片</text>
    </view>

    <!-- 内容编辑 -->
    <view class="content-section">
      <textarea
        v-model="content"
        class="content-input"
        placeholder="写下你的想法..."
        maxlength="500"
        auto-height
      />
      <text class="word-count">{{ content.length }}/500</text>
    </view>

    <!-- 位置信息 -->
    <view class="location-section" @click="chooseLocation">
      <view class="location-left">
        <AppIcon name="location-o" size="40rpx" color="#ff6b6b" />
        <text class="location-text">
          {{ location.name || '添加位置' }}
        </text>
      </view>
      <AppIcon name="arrow" size="32rpx" color="#999" />
    </view>

    <!-- 话题选择 -->
    <view class="topic-select-section" @click="goToTopicSelect">
      <view class="topic-select-header">
        <text class="section-label">选择话题</text>
        <AppIcon name="arrow" size="32rpx" color="#999" />
      </view>
      <view class="selected-topics" v-if="topics.length > 0">
        <view
          v-for="(topic, index) in topics"
          :key="index"
          class="topic-tag"
        >
          <image v-if="topic.cover" class="topic-cover-mini" :src="topic.cover" mode="aspectFill" />
          <text>#{{ topic.name }}</text>
          <AppIcon
            name="cross"
            size="20rpx"
            color="#ff6b6b"
            @click.stop="removeTopic(index)"
          />
        </view>
      </view>
      <text v-else class="topic-placeholder">点击选择话题</text>
    </view>

    <!-- 发布按钮 -->
    <view class="publish-section">
      <button
        class="publish-button"
        @click="onPublish"
      >
        {{ currentDraftId ? '重新发布' : '发布' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import AppIcon from "../../components/AppIcon.vue"
import { ref, computed } from 'vue'
import { onShow, onLoad } from '@dcloudio/uni-app'
import { useSystemInfo, showToast } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'

const { navbarHeight } = useSystemInfo()

interface FileItem {
  url: string
  type: 'image' | 'video'
  size?: number
}

interface Location {
  name: string
  address: string
  latitude: number
  longitude: number
}

interface DraftItem {
  id: string
  title: string
  content: string
  images: string[]
  saveTime: number
  topicId?: string
}

const fileList = ref<FileItem[]>([])
const content = ref('')
const location = ref<Partial<Location>>({})
const topics = ref<Array<{name: string; cover?: string; desc?: string; category?: string}>>([])
const maxCount = 9
const loading = ref(false)
const currentDraftId = ref<string>('')

const canPublish = computed(() => {
  return fileList.value.length > 0 && content.value.trim().length > 0 && !loading.value
})

// 加载草稿数据
onLoad((options) => {
  if (options?.draftId) {
    currentDraftId.value = options.draftId as string
    loadDraft(options.draftId as string)
  }
})

// 从本地存储加载草稿
const loadDraft = (draftId: string) => {
  // 模拟从本地存储获取草稿数据
  const mockDrafts: DraftItem[] = [
    {
      id: '1',
      title: '周末的摄影之旅',
      content: '今天去了公园拍摄，天气很好...',
      images: ['https://picsum.photos/400/400?random=1'],
      saveTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
    },
    {
      id: '2',
      title: '',
      content: '分享一个美食食谱，需要准备以下材料...',
      images: [],
      saveTime: Date.now() - 15 * 24 * 60 * 60 * 1000,
    },
    {
      id: '3',
      title: '旅行日记 - 云南',
      content: '',
      images: [
        'https://picsum.photos/400/400?random=2',
        'https://picsum.photos/400/400?random=3',
      ],
      saveTime: Date.now() - 25 * 24 * 60 * 60 * 1000,
    },
  ]

  const draft = mockDrafts.find(d => d.id === draftId)
  if (draft) {
    content.value = draft.content
    if (draft.images.length > 0) {
      fileList.value = draft.images.map(url => ({
        url,
        type: 'image' as const,
      }))
    }
    showToast('已加载草稿', 'success')
  }
}

// 删除已发布的草稿
const deletePublishedDraft = () => {
  if (!currentDraftId.value) return
  console.log('删除已发布草稿:', currentDraftId.value)
  // 实际项目中从本地存储删除
  // const draftList = uni.getStorageSync('draftList') || []
  // const newList = draftList.filter((item: DraftItem) => item.id !== currentDraftId.value)
  // uni.setStorageSync('draftList', newList)
}

const chooseMedia = () => {
  uni.chooseMedia({
    count: maxCount - fileList.value.length,
    mediaType: ['image'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const files = res.tempFiles.map(file => ({
        url: file.tempFilePath,
        type: 'image' as const,
        size: file.size,
      }))
      fileList.value.push(...files)
    },
  })
}

const previewImage = (index: number) => {
  const urls = fileList.value.map(f => f.url)
  uni.previewImage({
    urls,
    current: urls[index],
  })
}

const deleteFile = (index: number) => {
  fileList.value.splice(index, 1)
}

const chooseLocation = () => {
  uni.navigateTo({
    url: '/pages/topic/location-select'
  })
}

const goToTopicSelect = () => {
  const topicsParam = encodeURIComponent(JSON.stringify(topics.value))
  uni.navigateTo({
    url: `/pages/topic/topic-select?selected=${topicsParam}`
  })
}

const removeTopic = (index: number) => {
  topics.value.splice(index, 1)
}

onShow(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const eventChannel = currentPage.getOpenerEventChannel && currentPage.getOpenerEventChannel()

  if (eventChannel) {
    eventChannel.on('selectedTopics', (data: { topics: Array<{name: string; cover?: string; desc?: string; category?: string}> }) => {
      if (data && data.topics) {
        topics.value = data.topics
      }
    })
  }
})

const onPublish = async () => {
  // 表单验证
  if (fileList.value.length === 0) {
    uni.showToast({
      title: '请至少上传一张图片',
      icon: 'none',
    })
    return
  }

  if (content.value.trim().length === 0) {
    uni.showToast({
      title: '请写下你的想法',
      icon: 'none',
    })
    return
  }

  if (loading.value) return

  loading.value = true
  uni.showLoading({ title: '发布中...' })

  try {
    // 模拟上传
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 如果是从草稿箱发布的，删除对应草稿
    if (currentDraftId.value) {
      deletePublishedDraft()
    }

    uni.hideLoading()
    uni.showToast({
      title: '发布成功',
      icon: 'success',
    })

    // 清空表单
    fileList.value = []
    content.value = ''
    topics.value = []
    location.value = {}
    currentDraftId.value = ''

    // 切换到首页
    setTimeout(() => {
      uni.switchTab({ url: '/pages/home/home' })
    }, 1500)
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '发布失败，请重试',
      icon: 'none',
    })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.upload-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.upload-title {
  margin-bottom: 30rpx;

  .title-text {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    display: block;
    margin-bottom: 10rpx;
  }

  .title-sub {
    font-size: 26rpx;
    color: #999;
  }
}

.upload-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.upload-item {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  overflow: hidden;
}

.upload-image {
  width: 100%;
  height: 100%;
}

.delete-btn {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-add {
  width: 200rpx;
  height: 200rpx;
  border: 2rpx dashed #ddd;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .add-text {
    font-size: 24rpx;
    color: #999;
    margin-top: 10rpx;
  }
}

.upload-tip {
  font-size: 24rpx;
  color: #999;
  margin-top: 20rpx;
  display: block;
}

.content-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  position: relative;
}

.content-input {
  width: 100%;
  min-height: 200rpx;
  font-size: 30rpx;
  line-height: 1.6;
}

.word-count {
  position: absolute;
  right: 30rpx;
  bottom: 30rpx;
  font-size: 24rpx;
  color: #999;
}

.location-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.location-left {
  display: flex;
  align-items: center;

  .location-text {
    margin-left: 16rpx;
    font-size: 28rpx;
    color: #333;
  }
}

.topic-select-section {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.topic-select-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.section-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.selected-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.topic-placeholder {
  font-size: 28rpx;
  color: #999;
}

.topic-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
  padding: 12rpx 20rpx;
  border-radius: 8rpx;
  font-size: 26rpx;

  .topic-cover-mini {
    width: 32rpx;
    height: 32rpx;
    border-radius: 4rpx;
  }
}

.publish-section {
  padding: 40rpx;
  display: flex;
  justify-content: center;
}

.publish-button {
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
  transition: all 0.3s ease;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 107, 0.3);
}
</style>
