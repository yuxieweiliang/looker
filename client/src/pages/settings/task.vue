<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="任务中心" show-back />

    <view class="task-container">
      <!-- 用户积分卡片 -->
      <view class="points-card">
        <view class="points-info">
          <text class="points-label">我的积分</text>
          <text class="points-value">{{ userPoints }}</text>
        </view>
        <view class="points-actions">
          <view class="action-btn" @click="goToExchange">
            <AppIcon name="gift-o" size="32rpx" color="#ff6b6b" />
            <text>积分兑换</text>
          </view>
        </view>
      </view>

      <!-- 签到区域 -->
      <view class="signin-section">
        <view class="signin-header">
          <view class="signin-title">
            <text class="title">每日签到</text>
            <text class="subtitle">连续签到 {{ consecutiveDays }} 天</text>
          </view>
          <view
            class="signin-btn"
            :class="{ signed: hasSignedToday }"
            @click="onSignIn"
          >
            {{ hasSignedToday ? '已签到' : '签到' }}
          </view>
        </view>

        <!-- 签到日历 -->
        <view class="signin-calendar">
          <view
            v-for="(day, index) in weekDays"
            :key="index"
            class="calendar-day"
            :class="{ signed: day.signed, today: day.isToday }"
          >
            <text class="day-name">{{ day.name }}</text>
            <view class="day-icon">
              <AppIcon v-if="day.signed" name="success" size="28rpx" color="#10ac84" />
              <text v-else class="points">+{{ day.points }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 任务列表 -->
      <scroll-view scroll-y class="task-list">
        <!-- 每日任务 -->
        <view class="task-group">
          <view class="group-title">
            <text>每日任务</text>
            <text class="subtitle">每日 0 点重置</text>
          </view>

          <view
            v-for="task in dailyTasks"
            :key="task.id"
            class="task-item"
          >
            <view class="task-icon" :style="{ background: task.bgColor }">
              <AppIcon :name="task.icon" size="40rpx" color="#fff" />
            </view>
            <view class="task-info">
              <text class="task-name">{{ task.name }}</text>
              <text class="task-desc">{{ task.description }}</text>
              <view class="task-progress">
                <view class="progress-bar">
                  <view class="progress-fill" :style="{ width: (task.progress / task.total) * 100 + '%' }" />
                </view>
                <text class="progress-text">{{ task.progress }}/{{ task.total }}</text>
              </view>
            </view>
            <view class="task-reward">
              <text class="reward-points">+{{ task.points }}</text>
              <view
                class="do-btn"
                :class="{ completed: task.completed, claimable: task.claimable }"
                @click="onTaskAction(task)"
              >
                {{ task.completed ? '已完成' : task.claimable ? '领取' : '去完成' }}
              </view>
            </view>
          </view>
        </view>

        <!-- 新手任务 -->
        <view class="task-group">
          <view class="group-title">
            <text>新手任务</text>
            <text class="subtitle">一次性奖励</text>
          </view>

          <view
            v-for="task in newbieTasks"
            :key="task.id"
            class="task-item"
          >
            <view class="task-icon" :style="{ background: task.bgColor }">
              <AppIcon :name="task.icon" size="40rpx" color="#fff" />
            </view>
            <view class="task-info">
              <text class="task-name">{{ task.name }}</text>
              <text class="task-desc">{{ task.description }}</text>
            </view>
            <view class="task-reward">
              <text class="reward-points">+{{ task.points }}</text>
              <view
                class="do-btn"
                :class="{ completed: task.completed }"
                @click="onNewbieTask(task)"
              >
                {{ task.completed ? '已完成' : '去完成' }}
              </view>
            </view>
          </view>
        </view>

        <!-- 成就任务 -->
        <view class="task-group">
          <view class="group-title">
            <text>成就任务</text>
            <text class="subtitle">长期目标</text>
          </view>

          <view
            v-for="achievement in achievements"
            :key="achievement.id"
            class="achievement-item"
          >
            <view class="achievement-icon" :style="{ background: achievement.bgColor }">
              <AppIcon :name="achievement.icon" size="48rpx" color="#fff" />
            </view>
            <view class="achievement-info">
              <text class="achievement-name">{{ achievement.name }}</text>
              <text class="achievement-desc">{{ achievement.description }}</text>
              <view class="achievement-progress">
                <view class="progress-bar">
                  <view class="progress-fill" :style="{ width: (achievement.progress / achievement.total) * 100 + '%' }" />
                </view>
                <text class="progress-text">{{ achievement.progress }}/{{ achievement.total }}</text>
              </view>
            </view>
            <view class="achievement-reward">
              <text class="reward-points">+{{ achievement.points }}</text>
              <view
                class="claim-btn"
                :class="{ claimable: achievement.claimable, claimed: achievement.claimed }"
                @click="claimAchievement(achievement)"
              >
                {{ achievement.claimed ? '已领取' : achievement.claimable ? '领取' : '未完成' }}
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSystemInfo, showToast } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'
import AppIcon from '../../components/AppIcon.vue'
import { getPointsInfo, signIn, getTaskList, claimTaskReward } from '../../api/points'
import type { Task } from '../../api/points'

const { navbarHeight } = useSystemInfo()

interface Task {
  id: string
  name: string
  description: string
  icon: string
  bgColor: string
  points: number
  progress: number
  total: number
  completed: boolean
  claimable?: boolean
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  bgColor: string
  points: number
  progress: number
  total: number
  claimable: boolean
  claimed: boolean
}

const userPoints = ref(0)
const hasSignedToday = ref(false)
const consecutiveDays = ref(0)

const weekDays = ref([
  { name: '周一', signed: false, points: 10, isToday: false },
  { name: '周二', signed: false, points: 10, isToday: false },
  { name: '周三', signed: false, points: 10, isToday: false },
  { name: '周四', signed: false, points: 10, isToday: false },
  { name: '周五', signed: false, points: 10, isToday: false },
  { name: '周六', signed: false, points: 20, isToday: false },
  { name: '周日', signed: false, points: 30, isToday: false },
])

const dailyTasks = ref<Task[]>([])
const newbieTasks = ref<Task[]>([])
const achievements = ref<Task[]>([])

// 获取积分和任务信息
const fetchData = async () => {
  try {
    // 获取积分信息
    const pointsRes = await getPointsInfo()
    if (pointsRes.code === 0 && pointsRes.data) {
      userPoints.value = pointsRes.data.points
      hasSignedToday.value = pointsRes.data.hasSignedToday
      consecutiveDays.value = pointsRes.data.consecutiveDays
    }

    // 获取任务列表
    const tasksRes = await getTaskList()
    if (tasksRes.code === 0 && tasksRes.data) {
      dailyTasks.value = tasksRes.data.daily
      newbieTasks.value = tasksRes.data.newbie
      achievements.value = tasksRes.data.achievements
    }
  } catch (error) {
    console.error('获取任务信息失败', error)
    showToast('获取信息失败')
  }
}

const onSignIn = async () => {
  if (hasSignedToday.value) {
    showToast('今天已经签到过了')
    return
  }
  try {
    const res = await signIn()
    if (res.code === 0 && res.data) {
      hasSignedToday.value = true
      consecutiveDays.value = res.data.consecutiveDays
      userPoints.value = res.data.points
      showToast('签到成功', 'success')
    }
  } catch (error) {
    console.error('签到失败', error)
    showToast('签到失败')
  }
}

const onTaskAction = async (task: Task) => {
  if (task.completed) return
  try {
    const res = await claimTaskReward(task.id)
    if (res.code === 0 && res.data) {
      task.completed = true
      userPoints.value = res.data.points
      showToast(`领取成功，积分 +${task.points}`, 'success')
    }
  } catch (error) {
    console.error('领取奖励失败', error)
    showToast('领取失败')
  }
}

const onNewbieTask = async (task: Task) => {
  if (task.completed) return
  try {
    const res = await claimTaskReward(task.id)
    if (res.code === 0 && res.data) {
      task.completed = true
      userPoints.value = res.data.points
      showToast(`领取成功，积分 +${task.points}`, 'success')
    }
  } catch (error) {
    console.error('领取奖励失败', error)
    showToast('领取失败')
  }
}

const claimAchievement = async (achievement: Task) => {
  if (achievement.claimed) return
  try {
    const res = await claimTaskReward(achievement.id)
    if (res.code === 0 && res.data) {
      achievement.claimed = true
      userPoints.value = res.data.points
      showToast(`领取成功，积分 +${achievement.points}`, 'success')
    }
  } catch (error) {
    console.error('领取奖励失败', error)
    showToast('领取失败')
  }
}

const goToExchange = () => {
  showToast('积分兑换功能开发中')
}

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.task-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - v-bind(navbarHeight) * 1px);
}

.points-card {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 40rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .points-info {
    .points-label {
      font-size: 26rpx;
      color: rgba(255, 255, 255, 0.8);
      display: block;
      margin-bottom: 12rpx;
    }

    .points-value {
      font-size: 56rpx;
      font-weight: 700;
      color: #fff;
    }
  }

  .points-actions {
    .action-btn {
      display: flex;
      align-items: center;
      gap: 12rpx;
      padding: 16rpx 32rpx;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 32rpx;

      text {
        font-size: 26rpx;
        color: #fff;
      }
    }
  }
}

.signin-section {
  background: #fff;
  margin: 0 20rpx 20rpx;
  border-radius: 16rpx;
  padding: 30rpx;
}

.signin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;

  .signin-title {
    .title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      display: block;
    }

    .subtitle {
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx;
    }
  }

  .signin-btn {
    padding: 16rpx 40rpx;
    background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
    border-radius: 32rpx;
    color: #fff;
    font-size: 28rpx;
    font-weight: 500;

    &.signed {
      background: #e0e0e0;
    }
  }
}

.signin-calendar {
  display: flex;
  justify-content: space-between;

  .calendar-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    padding: 16rpx 12rpx;
    border-radius: 12rpx;

    &.today {
      background: rgba(255, 107, 107, 0.1);
    }

    &.signed {
      background: rgba(16, 172, 132, 0.1);
    }

    .day-name {
      font-size: 24rpx;
      color: #666;
    }

    .day-icon {
      width: 48rpx;
      height: 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      .points {
        font-size: 22rpx;
        color: #ff6b6b;
        font-weight: 500;
      }
    }
  }
}

.task-list {
  flex: 1;
  padding: 0 20rpx;
}

.task-group {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;

  .group-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    text {
      font-size: 30rpx;
      font-weight: 600;
      color: #333;

      &.subtitle {
        font-size: 24rpx;
        color: #999;
        font-weight: normal;
      }
    }
  }
}

.task-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.task-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.task-info {
  flex: 1;

  .task-name {
    font-size: 30rpx;
    color: #333;
    display: block;
    margin-bottom: 6rpx;
  }

  .task-desc {
    font-size: 24rpx;
    color: #999;
    display: block;
    margin-bottom: 12rpx;
  }
}

.task-progress {
  display: flex;
  align-items: center;
  gap: 16rpx;

  .progress-bar {
    flex: 1;
    height: 8rpx;
    background: #f0f0f0;
    border-radius: 4rpx;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #ff6b6b 0%, #ff8e8e 100%);
      border-radius: 4rpx;
      transition: width 0.3s ease;
    }
  }

  .progress-text {
    font-size: 22rpx;
    color: #999;
    min-width: 60rpx;
    text-align: right;
  }
}

.task-reward {
  text-align: right;

  .reward-points {
    font-size: 28rpx;
    color: #ff6b6b;
    font-weight: 600;
    display: block;
    margin-bottom: 12rpx;
  }

  .do-btn {
    padding: 12rpx 24rpx;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 24rpx;
    font-size: 24rpx;
    color: #ff6b6b;

    &.completed {
      background: #f0f0f0;
      color: #999;
    }

    &.claimable {
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
      color: #fff;
    }
  }
}

.achievement-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.achievement-icon {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.achievement-info {
  flex: 1;

  .achievement-name {
    font-size: 30rpx;
    color: #333;
    display: block;
    margin-bottom: 6rpx;
  }

  .achievement-desc {
    font-size: 24rpx;
    color: #999;
    display: block;
    margin-bottom: 12rpx;
  }
}

.achievement-reward {
  text-align: right;

  .reward-points {
    font-size: 28rpx;
    color: #ff6b6b;
    font-weight: 600;
    display: block;
    margin-bottom: 12rpx;
  }

  .claim-btn {
    padding: 12rpx 24rpx;
    background: #f0f0f0;
    border-radius: 24rpx;
    font-size: 24rpx;
    color: #999;

    &.claimable {
      background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
      color: #fff;
    }

    &.claimed {
      background: #f0f0f0;
      color: #999;
    }
  }
}
</style>
