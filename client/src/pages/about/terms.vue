<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="用户协议" />

    <scroll-view scroll-y class="content-scroll">
      <view class="content-card">
        <text class="main-title">Looker 用户协议</text>
        <text class="effective-date">生效日期：2024年1月1日</text>

        <view class="section">
          <text class="section-title">一、协议确认与接受</text>
          <text class="paragraph">
            欢迎使用 Looker！Looker 是一款由 Looker 团队（以下简称"我们"）开发运营的图片分享社区应用。
          </text>
          <text class="paragraph">
            请您在使用 Looker 服务前，仔细阅读并充分理解本协议的全部内容。当您点击"同意"或开始使用我们的服务时，即表示您已阅读、理解并接受本协议的所有条款。如果您不同意本协议的任何内容，请停止使用我们的服务。
          </text>
        </view>

        <view class="section">
          <text class="section-title">二、账号注册与安全</text>
          <text class="paragraph">
            2.1 您承诺以真实身份注册成为 Looker 用户，并提供真实、准确、完整、合法有效的注册资料。
          </text>
          <text class="paragraph">
            2.2 您有责任妥善保管账号信息及密码，因您保管不善导致的账号被盗或密码泄露，由您自行承担责任。
          </text>
          <text class="paragraph">
            2.3 您应当对以您账号进行的所有活动和事件承担法律责任。如发现任何未经授权使用您账号的情况，请立即通知我们。
          </text>
        </view>

        <view class="section">
          <text class="section-title">三、用户行为规范</text>
          <text class="paragraph">
            3.1 您在使用 Looker 服务时，必须遵守中华人民共和国相关法律法规，不得利用本服务从事违法违规行为。
          </text>
          <text class="paragraph">
            3.2 您同意并承诺不发布、传播以下内容：
          </text>
          <view class="list">
            <text class="list-item">• 违反宪法所确定的基本原则的；</text>
            <text class="list-item">• 危害国家安全，泄露国家秘密，颠覆国家政权，破坏国家统一的；</text>
            <text class="list-item">• 损害国家荣誉和利益的；</text>
            <text class="list-item">• 煽动民族仇恨、民族歧视，破坏民族团结的；</text>
            <text class="list-item">• 破坏国家宗教政策，宣扬邪教和封建迷信的；</text>
            <text class="list-item">• 散布谣言，扰乱社会秩序，破坏社会稳定的；</text>
            <text class="list-item">• 散布淫秽、色情、赌博、暴力、凶杀、恐怖或者教唆犯罪的；</text>
            <text class="list-item">• 侮辱或者诽谤他人，侵害他人合法权益的；</text>
            <text class="list-item">• 含有法律、行政法规禁止的其他内容的。</text>
          </view>
          <text class="paragraph">
            3.3 您不得从事以下行为：
          </text>
          <view class="list">
            <text class="list-item">• 未经授权使用他人作品或侵犯他人知识产权；</text>
            <text class="list-item">• 恶意注册、批量注册账号；</text>
            <text class="list-item">• 使用自动化手段访问、抓取服务数据；</text>
            <text class="list-item">• 干扰、破坏服务正常运行；</text>
            <text class="list-item">• 发布垃圾信息、广告信息或进行恶意营销。</text>
          </view>
        </view>

        <view class="section">
          <text class="section-title">四、内容发布与知识产权</text>
          <text class="paragraph">
            4.1 您在 Looker 发布的内容（包括但不限于图片、文字、评论等），您保证对其拥有合法权利或已获得必要授权。
          </text>
          <text class="paragraph">
            4.2 您授予 Looker 一项全球性的、免费的、非独占的许可，允许我们使用、复制、修改、发布、展示您的内容，用于服务的运营、推广和改进。
          </text>
          <text class="paragraph">
            4.3 Looker 尊重知识产权，如发现侵权行为，请及时联系我们，我们将依法处理。
          </text>
        </view>

        <view class="section">
          <text class="section-title">五、服务变更与终止</text>
          <text class="paragraph">
            5.1 我们保留随时修改、中断或终止服务的权利，且无需事先通知您。
          </text>
          <text class="paragraph">
            5.2 如您违反本协议的规定，我们有权随时暂停或终止向您提供服务，并保留追究法律责任的权利。
          </text>
          <text class="paragraph">
            5.3 您有权随时停止使用我们的服务，并申请注销账号。
          </text>
        </view>

        <view class="section">
          <text class="section-title">六、免责声明</text>
          <text class="paragraph">
            6.1 Looker 服务按"现状"提供，我们不保证服务不会中断，对服务的及时性、安全性、准确性不作担保。
          </text>
          <text class="paragraph">
            6.2 因不可抗力或第三方原因导致的服务中断或数据丢失，我们不承担责任。
          </text>
          <text class="paragraph">
            6.3 您通过 Looker 与其他用户产生的任何交易或纠纷，由您自行承担风险和责任。
          </text>
        </view>

        <view class="section">
          <text class="section-title">七、协议修改</text>
          <text class="paragraph">
            我们有权根据需要不时修改本协议的内容。修改后的协议将在 Looker 公布，如您继续使用服务，视为接受修改后的协议。
          </text>
        </view>

        <view class="section">
          <text class="section-title">八、争议解决</text>
          <text class="paragraph">
            本协议的订立、执行和解释及争议的解决均应适用中华人民共和国法律。如双方就本协议内容或执行发生争议，应友好协商解决；协商不成的，任何一方均可向有管辖权的人民法院提起诉讼。
          </text>
        </view>

        <view class="section">
          <text class="section-title">九、联系我们</text>
          <text class="paragraph">
            如您对本协议有任何疑问，请通过以下方式联系我们：
          </text>
          <text class="paragraph">
            客服邮箱：support@looker.app
          </text>
          <text class="paragraph">
            客服热线：400-888-8888
          </text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { useSystemInfo } from '../../utils/uniapi'
import CustomNavbar from '../../components/CustomNavbar.vue'

const { navbarHeight } = useSystemInfo()
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.content-scroll {
  height: calc(100vh - v-bind(navbarHeight) * 1px);
}

.content-card {
  margin: 20rpx;
  padding: 40rpx;
  background: #fff;
  border-radius: 16rpx;
}

.main-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #333;
  text-align: center;
  margin-bottom: 16rpx;
}

.effective-date {
  display: block;
  font-size: 26rpx;
  color: #999;
  text-align: center;
  margin-bottom: 50rpx;
}

.section {
  margin-bottom: 40rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.paragraph {
  display: block;
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  margin-bottom: 16rpx;
  text-align: justify;
}

.list {
  margin: 16rpx 0 24rpx 20rpx;
}

.list-item {
  display: block;
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  margin-bottom: 8rpx;
}
</style>
