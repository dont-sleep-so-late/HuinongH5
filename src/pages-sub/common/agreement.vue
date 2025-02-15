<template>
  <view class="agreement">
    <rich-text :nodes="content"></rich-text>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 协议内容
const content = ref('')

// 用户协议
const userAgreement = `
<div class="agreement-content">
  <h1>用户协议</h1>

  <h2>1. 总则</h2>
  <p>1.1 惠农商城的所有权和运营权归XX公司所有。</p>
  <p>1.2 用户在注册之前，应当仔细阅读本协议，并同意遵守本协议后方可成为注册用户。</p>

  <h2>2. 服务内容</h2>
  <p>2.1 惠农商城的具体内容由本站根据实际情况提供。</p>
  <p>2.2 本站仅提供相关的网络服务，除此之外与相关网络服务有关的设备（如个人电脑、手机、及其他与接入互联网或移动网有关的装置）及所需的费用（如为接入互联网而支付的电话费及上网费、为使用移动网而支付的手机费）均应由用户自行负担。</p>

  <h2>3. 用户帐号</h2>
  <p>3.1 经本站注册系统完成注册程序并通过身份认证的用户即成为正式用户，可以获得本站规定用户所应享有的一切权限。</p>
  <p>3.2 用户有义务保证密码和帐号的安全，用户利用该密码和帐号所进行的一切活动引起的任何损失或损害，由用户自行承担全部责任，本站不承担任何责任。</p>

  <h2>4. 用户声明与保证</h2>
  <p>4.1 用户承诺其为具有完全民事行为能力的民事主体，且具有达成交易履行其义务的能力。</p>
  <p>4.2 用户有义务在注册时提供自己的真实资料，并保证诸如手机号码、姓名、所在地区等内容的有效性及安全性。</p>

  <h2>5. 商品信息</h2>
  <p>5.1 本站上的商品价格、数量、是否有货等商品信息随时都有可能发生变动，本站不作特别通知。</p>
  <p>5.2 用户在下订单时选择的商品的价格和数量等信息以订单提交时为准。</p>

  <h2>6. 配送</h2>
  <p>6.1 本站将会把商品送到用户所指定的收货地址。</p>
  <p>6.2 因如下情况造成订单延迟或无法配送等，本站不承担责任：</p>
  <p>（1）用户提供的信息错误、地址不详细等原因导致的；</p>
  <p>（2）货物送达后无人签收，导致无法配送或延迟配送的；</p>
  <p>（3）情势变更因素导致的；</p>
  <p>（4）不可抗力因素导致的，例如：自然灾害、交通戒严、突发战争等。</p>
</div>
`

// 隐私政策
const privacyPolicy = `
<div class="agreement-content">
  <h1>隐私政策</h1>

  <h2>1. 信息收集</h2>
  <p>1.1 为了给您提供更好的服务，我们可能收集您的以下信息：</p>
  <p>（1）个人身份信息：如姓名、电话号码、电子邮件等；</p>
  <p>（2）设备信息：如设备型号、操作系统、唯一设备标识符等；</p>
  <p>（3）位置信息：如GPS信息、IP地址等；</p>
  <p>（4）日志信息：如您的搜索查询内容、IP地址、浏览器的类型等。</p>

  <h2>2. 信息使用</h2>
  <p>2.1 我们可能将收集的信息用于以下用途：</p>
  <p>（1）向您提供服务；</p>
  <p>（2）改进我们的服务；</p>
  <p>（3）向您发送重要通知；</p>
  <p>（4）预防或禁止非法的活动。</p>

  <h2>3. 信息共享</h2>
  <p>3.1 除以下情况外，未经您同意，我们不会与任何第三方分享您的个人信息：</p>
  <p>（1）根据法律法规的要求；</p>
  <p>（2）根据您的要求；</p>
  <p>（3）为了向您提供服务所必需。</p>

  <h2>4. 信息安全</h2>
  <p>4.1 我们采取各种安全技术和程序来保护您的个人信息不被未经授权的访问、使用或泄漏。</p>
  <p>4.2 我们会采取一切合理可行的措施，保护您的个人信息。</p>

  <h2>5. Cookie的使用</h2>
  <p>5.1 我们可能会使用Cookie来：</p>
  <p>（1）记住您的身份；</p>
  <p>（2）分析您使用我们服务的情况；</p>
  <p>（3）改善用户体验。</p>

  <h2>6. 未成年人隐私保护</h2>
  <p>6.1 我们建议未成年人在使用我们的服务时请监护人陪同。</p>
  <p>6.2 我们不会故意收集未成年人的个人信息。</p>
</div>
`

onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const type = currentPage.$page?.options?.type

  // 设置页面标题
  uni.setNavigationBarTitle({
    title: type === 'user' ? '用户协议' : '隐私政策',
  })

  // 设置内容
  content.value = type === 'user' ? userAgreement : privacyPolicy
})
</script>

<style>
.agreement {
  padding: 30rpx;
  background-color: #fff;
}

.agreement-content {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
}

.agreement-content h1 {
  margin-bottom: 60rpx;
  font-size: 40rpx;
  font-weight: bold;
  text-align: center;
}

.agreement-content h2 {
  margin: 40rpx 0 20rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.agreement-content p {
  margin-bottom: 20rpx;
  text-align: justify;
}
</style>
