<template>
  <view class="container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="user-info">
        <image :src="userInfo.avatar" mode="aspectFill" class="avatar" />
        <view class="info-content">
          <text class="nickname">{{ userInfo.nickname }}</text>
          <text class="user-id">ID: {{ userInfo.userId }}</text>
        </view>
      </view>
      <view class="user-stats">
        <view class="stat-item" @click="navigateTo('/pages-sub/user/wallet')">
          <text class="stat-value">{{ userInfo.balance }}</text>
          <text class="stat-label">余额</text>
        </view>
        <view class="stat-item" @click="navigateTo('/pages-sub/user/points')">
          <text class="stat-value">{{ userInfo.points }}</text>
          <text class="stat-label">积分</text>
        </view>
        <view class="stat-item" @click="navigateTo('/pages-sub/user/coupons')">
          <text class="stat-value">{{ userInfo.coupons }}</text>
          <text class="stat-label">优惠券</text>
        </view>
      </view>
    </view>

    <!-- 订单管理 -->
    <view class="order-section">
      <view class="section-header">
        <text class="section-title">我的订单</text>
        <view class="view-all" @click="navigateTo('/pages-sub/order/list')">
          查看全部
          <wd-icon name="arrow-right" size="14"></wd-icon>
        </view>
      </view>
      <view class="order-types">
        <view class="type-item" @click="navigateTo('/pages-sub/order/list?status=unpaid')">
          <wd-icon name="payment" size="28"></wd-icon>
          <text>待付款</text>
          <view class="badge" v-if="orderCounts.unpaid">{{ orderCounts.unpaid }}</view>
        </view>
        <view class="type-item" @click="navigateTo('/pages-sub/order/list?status=unshipped')">
          <wd-icon name="truck" size="28"></wd-icon>
          <text>待发货</text>
          <view class="badge" v-if="orderCounts.unshipped">{{ orderCounts.unshipped }}</view>
        </view>
        <view class="type-item" @click="navigateTo('/pages-sub/order/list?status=shipped')">
          <wd-icon name="logistics" size="28"></wd-icon>
          <text>待收货</text>
          <view class="badge" v-if="orderCounts.shipped">{{ orderCounts.shipped }}</view>
        </view>
        <view class="type-item" @click="navigateTo('/pages-sub/order/list?status=completed')">
          <wd-icon name="comment" size="28"></wd-icon>
          <text>待评价</text>
          <view class="badge" v-if="orderCounts.completed">{{ orderCounts.completed }}</view>
        </view>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="feature-list">
      <view class="feature-item" @click="navigateTo('/pages-sub/user/address')">
        <wd-icon name="location" size="24"></wd-icon>
        <text>收货地址</text>
        <wd-icon name="arrow-right" size="14" class="arrow"></wd-icon>
      </view>
      <view class="feature-item" @click="navigateTo('/pages-sub/user/profile')">
        <wd-icon name="user" size="24"></wd-icon>
        <text>个人资料</text>
        <wd-icon name="arrow-right" size="14" class="arrow"></wd-icon>
      </view>
      <view class="feature-item" @click="navigateTo('/pages-sub/user/settings')">
        <wd-icon name="setting" size="24"></wd-icon>
        <text>系统设置</text>
        <wd-icon name="arrow-right" size="14" class="arrow"></wd-icon>
      </view>
      <view class="feature-item" @click="navigateTo('/pages-sub/user/help')">
        <wd-icon name="question" size="24"></wd-icon>
        <text>帮助中心</text>
        <wd-icon name="arrow-right" size="14" class="arrow"></wd-icon>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 用户信息
const userInfo = ref({
  avatar: '/static/avatar/default.png',
  nickname: '张三',
  userId: '10086',
  balance: '¥999.99',
  points: '1,288',
  coupons: '3',
})

// 订单数量统计
const orderCounts = ref({
  unpaid: 1,
  unshipped: 2,
  shipped: 0,
  completed: 3,
})

// 页面跳转
const navigateTo = (url: string) => {
  uni.navigateTo({ url })
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  padding-bottom: env(safe-area-inset-bottom);
  background-color: #f8f8f8;
}

.user-card {
  padding: 30rpx;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      margin-right: 20rpx;
      border-radius: 60rpx;
    }

    .info-content {
      flex: 1;

      .nickname {
        margin-bottom: 8rpx;
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .user-id {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .user-stats {
    display: flex;
    justify-content: space-around;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .stat-value {
        margin-bottom: 8rpx;
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .stat-label {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.order-section {
  padding: 30rpx;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .view-all {
      display: flex;
      align-items: center;
      font-size: 24rpx;
      color: #999;
    }
  }

  .order-types {
    display: flex;
    justify-content: space-between;

    text {
      margin-top: 12rpx;
      font-size: 24rpx;
      color: #666;
    }

    .type-item {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;

      .badge {
        position: absolute;
        top: -8rpx;
        right: -8rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32rpx;
        height: 32rpx;
        padding: 0 8rpx;
        font-size: 20rpx;
        color: #fff;
        background-color: #ff6b6b;
        border-radius: 16rpx;
      }
    }
  }
}

.feature-list {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;

  .feature-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #eee;

    &:last-child {
      border-bottom: none;
    }

    text {
      flex: 1;
      margin-left: 20rpx;
      font-size: 28rpx;
      color: #333;
    }

    .arrow {
      color: #999;
    }
  }
}
</style>
