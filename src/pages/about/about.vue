<route lang="json5">
{
  style: {
    navigationBarTitleText: '关于',
  },
}
</route>

<template>
  <view class="about-container" :style="{ marginTop: safeAreaInsets?.top + 'px' }">
    <view class="header">
      <image class="logo" src="/static/images/logo.png" mode="aspectFit" />
      <text class="title">惠农 H5</text>
      <text class="version">Version 1.0.0</text>
    </view>

    <view class="content">
      <view class="intro">
        <text class="intro-title">项目简介</text>
        <text class="intro-text">
          惠农 H5
          是一款专注于农产品电商领域的移动端应用，旨在打造农产品供需对接的智能化平台。本项目由广东海洋大学信息学院
          2025 届毕业生欧文聪开发，致力于运用现代技术助力农产品流通，促进农业产业升级。
        </text>
      </view>

      <view class="features">
        <text class="features-title">核心功能</text>
        <view class="feature-list">
          <view class="feature-item">
            <text class="iconfont icon-shop"></text>
            <text>智能商城</text>
          </view>
          <view class="feature-item">
            <text class="iconfont icon-data"></text>
            <text>行情分析</text>
          </view>
          <view class="feature-item">
            <text class="iconfont icon-farm"></text>
            <text>农场管理</text>
          </view>
          <view class="feature-item">
            <text class="iconfont icon-forecast"></text>
            <text>价格预测</text>
          </view>
        </view>
      </view>

      <view class="tech-stack">
        <text class="tech-title">技术栈</text>
        <view class="tech-list">
          <text class="tech-item">Vue3</text>
          <text class="tech-item">TypeScript</text>
          <text class="tech-item">Uni-App</text>
          <text class="tech-item">Pinia</text>
        </view>
      </view>
    </view>

    <view class="footer">
      <text class="copyright">© 2024 惠农 H5. All rights reserved.</text>
      <text class="author">Developed by Owen Ou</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
</script>

<style lang="scss">
.about-container {
  min-height: 100vh;
  padding: 40rpx;
  background-color: #fff;

  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 60rpx;

    .logo {
      width: 160rpx;
      height: 160rpx;
      margin-bottom: 20rpx;
    }

    .title {
      margin-bottom: 12rpx;
      font-size: 48rpx;
      font-weight: bold;
      color: #333;
    }

    .version {
      font-size: 28rpx;
      color: #999;
    }
  }

  .content {
    .intro {
      margin-bottom: 60rpx;

      .intro-title {
        display: block;
        margin-bottom: 20rpx;
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
      }

      .intro-text {
        font-size: 28rpx;
        line-height: 1.6;
        color: #666;
      }
    }

    .features {
      margin-bottom: 60rpx;

      .features-title {
        display: block;
        margin-bottom: 30rpx;
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
      }

      .feature-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 30rpx;

        .feature-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 30rpx;
          background-color: #f8f8f8;
          border-radius: 16rpx;

          .iconfont {
            margin-bottom: 16rpx;
            font-size: 48rpx;
            color: #018d71;
          }

          text {
            font-size: 28rpx;
            color: #333;
          }
        }
      }
    }

    .tech-stack {
      margin-bottom: 60rpx;

      .tech-title {
        display: block;
        margin-bottom: 30rpx;
        font-size: 36rpx;
        font-weight: bold;
        color: #333;
      }

      .tech-list {
        display: flex;
        flex-wrap: wrap;
        gap: 20rpx;

        .tech-item {
          padding: 12rpx 24rpx;
          font-size: 26rpx;
          color: #018d71;
          background-color: rgba(1, 141, 113, 0.1);
          border-radius: 30rpx;
        }
      }
    }
  }

  .footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 60rpx;
    border-top: 1px solid #f5f5f5;

    .copyright {
      margin-bottom: 12rpx;
      font-size: 24rpx;
      color: #999;
    }

    .author {
      font-size: 24rpx;
      color: #666;
    }
  }
}
</style>
