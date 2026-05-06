<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="创建话题" show-back>
      <template #right>
        <text class="submit-btn" :class="{ disabled: !canSubmit }" @click="onSubmit">发布</text>
      </template>
    </CustomNavbar>

    <view class="create-container">
      <!-- 话题封面 -->
      <view class="cover-section">
        <text class="section-label">话题封面 <text class="required">*</text></text>
        <view class="cover-upload" @click="chooseCover">
          <image
            v-if="form.cover"
            class="cover-image"
            :src="form.cover"
            mode="aspectFill"
          />
          <view v-else class="upload-placeholder">
            <AppIcon name="plus" size="48rpx" color="#ccc" />
            <text>上传封面</text>
            <text class="upload-tip">建议尺寸 400x400</text>
          </view>
        </view>
      </view>

      <!-- 话题名称 -->
      <view class="form-section">
        <view class="form-item">
          <text class="item-label">话题名称 <text class="required">*</text></text>
          <input
            v-model="form.name"
            class="item-input"
            placeholder="请输入话题名称，2-20个字符"
            maxlength="20"
          />
          <text class="input-count">{{ form.name.length }}/20</text>
        </view>

        <view class="form-item">
          <text class="item-label">话题分类 <text class="required">*</text></text>
          <view class="category-list">
            <view
              v-for="cat in categories"
              :key="cat.id"
              class="category-tag"
              :class="{ active: form.category === cat.id }"
              @click="form.category = cat.id"
            >
              {{ cat.name }}
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="item-label">话题简介</text>
          <textarea
            v-model="form.description"
            class="item-textarea"
            placeholder="描述一下这个话题，让更多人了解它..."
            maxlength="200"
            auto-height
          />
          <text class="input-count">{{ form.description.length }}/200</text>
        </view>

        <view class="form-item">
          <text class="item-label">参与规则</text>
          <textarea
            v-model="form.rules"
            class="item-textarea"
            placeholder="设置话题的参与规则（选填）"
            maxlength="500"
            auto-height
          />
        </view>
      </view>

      <!-- 提示信息 -->
      <view class="tips-section">
        <view class="tips-title">
          <AppIcon name="info-o" size="28rpx" color="#ff6b6b" />
          <text>创建须知</text>
        </view>
        <view class="tips-list">
          <text class="tip-item">1. 话题名称应简洁明了，避免使用敏感词汇</text>
          <text class="tip-item">2. 话题创建后需要审核，审核通过后方可使用</text>
          <text class="tip-item">3. 禁止创建违法违规、低俗色情话题</text>
          <text class="tip-item">4. 优质话题将获得平台推荐</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useSystemInfo, showToast } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import AppIcon from '../../components/AppIcon.vue'

const { navbarHeight } = useSystemInfo()

interface CreateTopicForm {
  name: string
  cover: string
  category: string
  description: string
  rules: string
}

const form = ref<CreateTopicForm>({
  name: '',
  cover: '',
  category: '',
  description: '',
  rules: '',
})

const categories = [
  { id: 'life', name: '生活' },
  { id: 'travel', name: '旅行' },
  { id: 'food', name: '美食' },
  { id: 'fashion', name: '时尚' },
  { id: 'photo', name: '摄影' },
  { id: 'art', name: '艺术' },
  { id: 'tech', name: '科技' },
  { id: 'pet', name: '萌宠' },
  { id: 'sports', name: '运动' },
  { id: 'music', name: '音乐' },
  { id: 'movie', name: '影视' },
  { id: 'game', name: '游戏' },
  { id: 'study', name: '学习' },
  { id: 'work', name: '职场' },
  { id: 'emotion', name: '情感' },
  { id: 'other', name: '其他' },
]

const canSubmit = computed(() => {
  return form.value.name.length >= 2 &&
         form.value.cover &&
         form.value.category
})

// 接收传入的话题名称
onLoad((options) => {
  if (options?.name) {
    form.value.name = options.name as string
  }
})

const chooseCover = () => {
  uni.chooseMedia({
    count: 1,
    mediaType: ['image'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      form.value.cover = res.tempFiles[0].tempFilePath
    },
  })
}

const onSubmit = () => {
  if (!canSubmit.value) {
    if (!form.value.name || form.value.name.length < 2) {
      showToast('请输入至少2个字符的话题名称')
    } else if (!form.value.cover) {
      showToast('请上传话题封面')
    } else if (!form.value.category) {
      showToast('请选择话题分类')
    }
    return
  }

  uni.showLoading({ title: '创建中...' })

  // 模拟提交
  setTimeout(() => {
    uni.hideLoading()
    showToast('创建成功，审核通过后将显示', 'success')

    // 通知话题选择页
    uni.$emit('topicCreated', {
      name: form.value.name,
      cover: form.value.cover,
      category: categories.find(c => c.id === form.value.category)?.name,
      count: 0,
    })

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

.submit-btn {
  font-size: 28rpx;
  color: #ff6b6b;
  font-weight: 500;

  &.disabled {
    color: #ccc;
  }
}

.create-container {
  padding: 20rpx;
}

.cover-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .section-label {
    font-size: 30rpx;
    font-weight: 500;
    color: #333;
    display: block;
    margin-bottom: 20rpx;

    .required {
      color: #ff6b6b;
    }
  }
}

.cover-upload {
  width: 240rpx;
  height: 240rpx;
  border: 2rpx dashed #ddd;
  border-radius: 16rpx;
  overflow: hidden;

  .cover-image {
    width: 100%;
    height: 100%;
  }

  .upload-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12rpx;

    text {
      font-size: 28rpx;
      color: #666;
    }

    .upload-tip {
      font-size: 22rpx;
      color: #999;
    }
  }
}

.form-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.form-item {
  margin-bottom: 30rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .item-label {
    font-size: 30rpx;
    font-weight: 500;
    color: #333;
    display: block;
    margin-bottom: 16rpx;

    .required {
      color: #ff6b6b;
    }
  }

  .item-input {
    width: 100%;
    height: 88rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 30rpx;
    color: #333;
  }

  .item-textarea {
    width: 100%;
    min-height: 160rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    padding: 20rpx 24rpx;
    font-size: 30rpx;
    color: #333;
    line-height: 1.6;
  }

  .input-count {
    font-size: 24rpx;
    color: #999;
    text-align: right;
    display: block;
    margin-top: 8rpx;
  }
}

.category-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;

  .category-tag {
    padding: 16rpx 32rpx;
    background: #f5f5f5;
    border-radius: 32rpx;
    font-size: 28rpx;
    color: #666;

    &.active {
      background: rgba(255, 107, 107, 0.1);
      color: #ff6b6b;
    }
  }
}

.tips-section {
  background: #fff5f5;
  border-radius: 16rpx;
  padding: 30rpx;

  .tips-title {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 20rpx;

    text {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;
    }
  }

  .tips-list {
    display: flex;
    flex-direction: column;
    gap: 16rpx;

    .tip-item {
      font-size: 26rpx;
      color: #666;
      line-height: 1.5;
    }
  }
}
</style>
