<template>
  <view class="privacy-container">
    <view class="header">
      <view class="nav-back" @click="router.back()">
        <text class="iconfont icon-arrow-left"></text>
      </view>
      <text class="title">隐私政策</text>
    </view>

    <view class="content">
      <view class="section">
        <text class="section-title">1. 信息收集</text>
        <text class="section-text">
          我们收集的信息包括但不限于： • 账户信息（用户名、密码、手机号、邮箱等） •
          实名认证信息（姓名、身份证号等） • 交易信息（订单、支付记录等） •
          设备信息（设备型号、操作系统、IP地址等）
        </text>
      </view>

      <view class="section">
        <text class="section-title">2. 信息使用</text>
        <text class="section-text">
          我们使用收集的信息用于： • 提供、维护和改进我们的服务 • 处理您的交易请求 •
          向您推送相关产品信息 • 预防欺诈等违法行为
        </text>
      </view>

      <view class="section">
        <text class="section-title">3. 信息保护</text>
        <text class="section-text">
          我们采取严格的数据安全措施，包括： • 数据加密存储 • 访问权限控制 • 安全审计机制 •
          应急响应机制
        </text>
      </view>

      <view class="section">
        <text class="section-title">4. 信息共享</text>
        <text class="section-text">
          除以下情况外，我们不会与第三方共享您的信息： • 获得您的明确授权 • 法律法规要求 •
          维护平台安全与权益
        </text>
      </view>

      <view class="section">
        <text class="section-title">5. 您的权利</text>
        <text class="section-text">
          您对个人信息享有以下权利： • 访问、更正您的信息 • 删除账户 • 撤回授权同意 • 投诉举报
        </text>
      </view>
    </view>

    <view class="footer">
      <text class="update-time">更新日期：2024年3月1日</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useRouter } from '@/hooks/router'

const router = useRouter()
</script>

<style lang="scss">
.privacy-container {
  min-height: 100vh;
  background-color: #fff;

  .header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    background-color: #fff;
    border-bottom: 1px solid #f5f5f5;

    .nav-back {
      position: absolute;
      left: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 88rpx;
      height: 88rpx;
      margin-left: -32rpx;

      .iconfont {
        font-size: 40rpx;
        color: #333;
      }
    }

    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .content {
    padding: 32rpx;

    .section {
      margin-bottom: 40rpx;

      .section-title {
        display: block;
        margin-bottom: 20rpx;
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .section-text {
        font-size: 28rpx;
        line-height: 1.6;
        color: #666;
        white-space: pre-line;
      }
    }
  }

  .footer {
    padding: 32rpx;
    text-align: center;

    .update-time {
      font-size: 24rpx;
      color: #999;
    }
  }
}
</style>
