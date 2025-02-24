<template>
  <view class="agreement-container">
    <view class="header">
      <view class="nav-back" @click="router.back()">
        <text class="iconfont icon-arrow-left"></text>
      </view>
      <text class="title">用户协议</text>
    </view>

    <view class="content">
      <view class="section">
        <text class="section-title">1. 协议范围</text>
        <text class="section-text">
          本协议是您与惠农H5平台之间就平台服务等相关事宜所订立的契约。您通过注册、登录、使用等行为表示接受本协议的全部条款。
        </text>
      </view>

      <view class="section">
        <text class="section-title">2. 账户规则</text>
        <text class="section-text">
          • 您承诺注册信息真实、准确、完整 • 您必须保管好自己的账号和密码 •
          未经允许不得转让或授权他人使用账号 • 不得利用平台从事违法违规活动
        </text>
      </view>

      <view class="section">
        <text class="section-title">3. 交易规则</text>
        <text class="section-text">
          • 遵守平台发布的交易流程 • 保证商品信息真实可靠 • 遵守支付、配送等相关规定 •
          遵守售后服务相关规定
        </text>
      </view>

      <view class="section">
        <text class="section-title">4. 平台责任</text>
        <text class="section-text">
          • 提供安全、稳定的平台服务 • 保护用户个人信息安全 • 维护正常的交易秩序 •
          处理用户投诉和建议
        </text>
      </view>

      <view class="section">
        <text class="section-title">5. 知识产权</text>
        <text class="section-text">
          • 平台所有内容归平台所有 • 未经许可不得复制或传播 • 尊重他人知识产权 •
          违规使用将承担法律责任
        </text>
      </view>

      <view class="section">
        <text class="section-title">6. 违约责任</text>
        <text class="section-text">
          • 违反协议将承担相应责任 • 造成损失需要赔偿 • 平台有权限制或终止服务 •
          保留追究法律责任的权利
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
.agreement-container {
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
