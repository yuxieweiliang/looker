<template>
  <view class="page-container" :style="{ paddingTop: navbarHeight + 'px' }">
    <CustomNavbar title="隐私政策" />

    <scroll-view scroll-y class="content-scroll">
      <view class="content-card">
        <text class="main-title">Looker 隐私政策</text>
        <text class="effective-date">生效日期：2024年1月1日</text>
        <text class="effective-date update-date">最近更新：2024年1月1日</text>

        <view class="section">
          <text class="section-title">引言</text>
          <text class="paragraph">
            Looker（以下简称"我们"）深知个人信息对您的重要性，我们一向庄严承诺保护使用我们的产品和服务的用户（以下统称"用户"或"您"）的个人信息及隐私安全。您在使用 Looker 服务时，我们可能会收集和使用您的相关信息。
          </text>
          <text class="paragraph">
            本《隐私政策》适用于我们提供的所有服务，旨在帮助您了解我们如何收集、使用、存储、共享和保护您的个人信息，以及您如何管理您的个人信息。
          </text>
        </view>

        <view class="section">
          <text class="section-title">一、我们如何收集您的信息</text>
          <text class="paragraph">
            1.1 您主动提供的信息
          </text>
          <view class="list">
            <text class="list-item">• 账号信息：昵称、头像、手机号、邮箱地址等；</text>
            <text class="list-item">• 个人资料：性别、生日、个人简介等；</text>
            <text class="list-item">• 内容信息：您发布的图片、文字、评论等；</text>
            <text class="list-item">• 联系信息：当您联系客服时提供的信息。</text>
          </view>
          <text class="paragraph">
            1.2 我们自动收集的信息
          </text>
          <view class="list">
            <text class="list-item">• 设备信息：设备型号、操作系统版本、设备标识符等；</text>
            <text class="list-item">• 日志信息：IP地址、访问时间、浏览记录、操作记录等；</text>
            <text class="list-item">• 位置信息：经您授权后获取的粗略或精确位置信息；</text>
            <text class="list-item">• 相册信息：经您授权后访问您的相册以选择和上传图片。</text>
          </view>
        </view>

        <view class="section">
          <text class="section-title">二、我们如何使用您的信息</text>
          <text class="paragraph">
            2.1 为您提供服务
          </text>
          <view class="list">
            <text class="list-item">• 注册、登录和管理您的账号；</text>
            <text class="list-item">• 展示您的个人资料和发布的内容；</text>
            <text class="list-item">• 实现图片上传、评论、点赞、关注等功能；</text>
            <text class="list-item">• 为您推荐感兴趣的内容和用户。</text>
          </view>
          <text class="paragraph">
            2.2 改善服务质量
          </text>
          <view class="list">
            <text class="list-item">• 分析用户使用情况，优化产品功能和体验；</text>
            <text class="list-item">• 进行数据统计和研究分析；</text>
            <text class="list-item">• 排查和解决技术问题。</text>
          </view>
          <text class="paragraph">
            2.3 安全保障
          </text>
          <view class="list">
            <text class="list-item">• 进行身份验证和安全防护；</text>
            <text class="list-item">• 检测和预防欺诈及滥用行为；</text>
            <text class="list-item">• 保护您和其他用户的合法权益。</text>
          </view>
        </view>

        <view class="section">
          <text class="section-title">三、我们如何共享、转让、公开披露您的信息</text>
          <text class="paragraph">
            3.1 共享
          </text>
          <text class="paragraph">
            我们不会与 Looker 以外的任何公司、组织和个人分享您的个人信息，但以下情形除外：
          </text>
          <view class="list">
            <text class="list-item">• 获得您的明确同意；</text>
            <text class="list-item">• 根据法律法规规定或政府主管部门的强制性要求；</text>
            <text class="list-item">• 与我们的关联公司共享必要的个人信息；</text>
            <text class="list-item">• 与授权合作伙伴共享以提供特定服务。</text>
          </view>
          <text class="paragraph">
            3.2 转让
          </text>
          <text class="paragraph">
            我们不会将您的个人信息转让给任何第三方，除非获得您的明确同意或发生合并、收购、资产转让等情形。
          </text>
          <text class="paragraph">
            3.3 公开披露
          </text>
          <text class="paragraph">
            我们仅会在以下情况下公开披露您的个人信息：获得您的明确同意，或基于法律法规的要求。
          </text>
        </view>

        <view class="section">
          <text class="section-title">四、我们如何保护您的信息</text>
          <text class="paragraph">
            4.1 我们采取各种合理可行的安全措施来保护您的个人信息，防止未经授权的访问、使用、修改或披露。
          </text>
          <text class="paragraph">
            4.2 我们使用加密技术保护数据传输安全，使用安全的服务器存储您的个人信息。
          </text>
          <text class="paragraph">
            4.3 我们对员工进行数据安全和隐私保护培训，严格限制访问用户信息的人员范围。
          </text>
          <text class="paragraph">
            4.4 请理解，尽管我们采取了上述措施，但互联网上不存在绝对安全的保障。您应妥善保管您的账号信息，避免使用简单密码。
          </text>
        </view>

        <view class="section">
          <text class="section-title">五、您的权利</text>
          <text class="paragraph">
            根据相关法律法规，您对您的个人信息享有以下权利：
          </text>
          <view class="list">
            <text class="list-item">• 访问权：您有权访问您的个人信息；</text>
            <text class="list-item">• 更正权：您有权更正不准确的个人信息；</text>
            <text class="list-item">• 删除权：您有权要求删除您的个人信息；</text>
            <text class="list-item">• 撤回同意权：您有权撤回之前给予的授权；</text>
            <text class="list-item">• 注销账号权：您有权申请注销您的账号。</text>
          </view>
          <text class="paragraph">
            您可以通过 Looker 应用内的设置功能或联系客服行使上述权利。
          </text>
        </view>

        <view class="section">
          <text class="section-title">六、未成年人保护</text>
          <text class="paragraph">
            6.1 我们非常重视对未成年人个人信息的保护。我们的服务主要面向成年人，未成年人使用我们的服务应征得监护人的同意。
          </text>
          <text class="paragraph">
            6.2 如果我们发现自己在未事先获得监护人同意的情况下收集了未成年人的个人信息，我们会尽快删除相关数据。
          </text>
        </view>

        <view class="section">
          <text class="section-title">七、Cookie 和类似技术</text>
          <text class="paragraph">
            我们可能使用 Cookie 和类似技术来收集和存储您的信息，以便为您提供更好的服务体验。您可以通过浏览器设置管理 Cookie 偏好。
          </text>
        </view>

        <view class="section">
          <text class="section-title">八、隐私政策的更新</text>
          <text class="paragraph">
            我们可能适时修订本隐私政策的内容。更新后的隐私政策将在 Looker 应用中公布，并在生效前通过适当方式通知您。如您继续使用我们的服务，视为您接受修订后的隐私政策。
          </text>
        </view>

        <view class="section">
          <text class="section-title">九、联系我们</text>
          <text class="paragraph">
            如您对本隐私政策有任何疑问、意见或建议，或您认为您的个人信息权益受到侵害，请通过以下方式与我们联系：
          </text>
          <text class="paragraph">
            客服邮箱：support@looker.app
          </text>
          <text class="paragraph">
            客服热线：400-888-8888
          </text>
          <text class="paragraph">
            通讯地址：北京市朝阳区xxx路xxx号
          </text>
          <text class="paragraph">
            我们将在收到您的反馈后15个工作日内回复。
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
}

.update-date {
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
