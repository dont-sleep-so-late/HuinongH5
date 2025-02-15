<template>
  <view class="role-select">
    <view class="welcome">
      <text class="title">欢迎来到农选</text>
      <text class="subtitle">3000万人在农选轻松买卖农产品</text>
    </view>

    <view class="role-buttons">
      <view class="role-button buyer" @click="handleRoleSelect('buyer')">
        <text class="role-title">我要买货</text>
        <text class="role-desc">找美味，找新鲜，应有尽有</text>
        <text class="arrow">→</text>
      </view>

      <view class="role-button seller" @click="handleRoleSelect('seller')">
        <text class="role-title">我要卖货</text>
        <text class="role-desc">找合作，找销路，财源滚滚</text>
        <text class="arrow">→</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useRouter } from '@/hooks/router'

const router = useRouter()

const handleRoleSelect = (role: 'buyer' | 'seller') => {
  // 存储用户角色
  uni.setStorageSync('userRole', role)

  // 跳转到对应页面
  if (role === 'buyer') {
    router.switchTab('/pages/index/index')
  } else {
    router.switchTab('/pages/user/index')
  }
}
</script>

<style lang="scss">
.role-select {
  min-height: 100vh;
  padding: 60rpx 32rpx;
  background-color: #fff;

  .welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 80rpx;

    .title {
      margin-bottom: 16rpx;
      font-size: 48rpx;
      font-weight: bold;
      color: #333;
    }

    .subtitle {
      font-size: 28rpx;
      color: #666;
    }
  }

  .role-buttons {
    display: flex;
    flex-direction: column;
    gap: 32rpx;

    .role-button {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 240rpx;
      padding: 40rpx;
      border-radius: 24rpx;

      &.buyer {
        background-color: #ffa500;
      }

      &.seller {
        background-color: #4caf50;
      }

      .role-title {
        margin-bottom: 16rpx;
        font-size: 40rpx;
        font-weight: bold;
        color: #fff;
      }

      .role-desc {
        font-size: 28rpx;
        color: rgba(255, 255, 255, 0.9);
      }

      .arrow {
        position: absolute;
        top: 50%;
        right: 40rpx;
        font-size: 48rpx;
        color: #fff;
        transform: translateY(-50%);
      }
    }
  }
}
</style>
