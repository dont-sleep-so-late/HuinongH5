<template>
  <view class="user-page">
    <!-- 用户信息区域 -->
    <view class="user-header">
      <view class="user-info">
        <image
          :src="userInfo?.avatar || '/static/avatar/default.png'"
          class="avatar"
          mode="aspectFill"
        />
        <view class="info">
          <text class="nickname">{{ userInfo?.nickname || '未登录' }}</text>
          <text class="phone" v-if="userInfo?.phone">{{ userInfo.phone }}</text>
        </view>
      </view>
      <view class="settings" @click="handleSettings">
        <text class="iconfont icon-settings"></text>
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="stats-section">
      <view class="stat-item" @click="navigateTo('/pages-sub/user/follow-goods')">
        <text class="number">{{ stats.followGoods }}</text>
        <text class="label">关注商品</text>
      </view>
      <view class="stat-item" @click="navigateTo('/pages-sub/user/follow-shops')">
        <text class="number">{{ stats.followShops }}</text>
        <text class="label">关注商家</text>
      </view>
      <view class="stat-item" @click="navigateTo('/pages-sub/user/footprints')">
        <text class="number">{{ stats.footprints }}</text>
        <text class="label">浏览足迹</text>
      </view>
      <view class="stat-item" @click="navigateTo('/pages-sub/user/purchase-records')">
        <text class="number">{{ stats.purchaseRecords }}</text>
        <text class="label">采购记录</text>
      </view>
    </view>

    <!-- 我的订单 -->
    <view class="section order-section">
      <view class="section-header">
        <text class="title">我的订单</text>
        <view class="more" @click="navigateTo('/pages-sub/order/list')">
          <text>全部订单</text>
          <text class="iconfont icon-arrow-right"></text>
        </view>
      </view>
      <view class="order-types">
        <view class="type-item" @click="navigateTo('/pages-sub/order/list?type=reserved')">
          <view class="badge" v-if="orderCounts.reserved > 0">{{ orderCounts.reserved }}</view>
          <text class="iconfont icon-reserved"></text>
          <text>已预定</text>
        </view>
        <view class="type-item" @click="navigateTo('/pages-sub/order/list?type=shipped')">
          <view class="badge" v-if="orderCounts.shipped > 0">{{ orderCounts.shipped }}</view>
          <text class="iconfont icon-shipped"></text>
          <text>已发货</text>
        </view>
        <view class="type-item" @click="navigateTo('/pages-sub/order/list?type=received')">
          <view class="badge" v-if="orderCounts.received > 0">{{ orderCounts.received }}</view>
          <text class="iconfont icon-received"></text>
          <text>已提货</text>
        </view>
        <view class="type-item" @click="navigateTo('/pages-sub/order/list?type=afterSale')">
          <view class="badge" v-if="orderCounts.afterSale > 0">{{ orderCounts.afterSale }}</view>
          <text class="iconfont icon-after-sale"></text>
          <text>售后</text>
        </view>
      </view>
    </view>

    <!-- 我的农场 -->
    <view class="section farm-section">
      <view class="section-header">
        <text class="title">我的农场</text>
        <view class="more" @click="navigateTo('/pages-sub/farm/index')">
          <text>更多福利</text>
          <text class="iconfont icon-arrow-right"></text>
        </view>
      </view>
      <view class="farm-actions">
        <view class="action-item" @click="handleFarmAction('weeding')">
          <image src="/static/icons/farm/weeding.png" mode="aspectFit" />
          <text>除草</text>
        </view>
        <view class="action-item" @click="handleFarmAction('watering')">
          <image src="/static/icons/farm/watering.png" mode="aspectFit" />
          <text>浇水</text>
        </view>
        <view class="action-item" @click="handleFarmAction('fertilizing')">
          <image src="/static/icons/farm/fertilizing.png" mode="aspectFit" />
          <text>施肥</text>
        </view>
        <view class="action-item" @click="handleFarmAction('harvesting')">
          <image src="/static/icons/farm/harvesting.png" mode="aspectFit" />
          <text>收获</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import { useUserStore } from '@/stores/user'
import { showToast } from '@/utils/toast'

const router = useRouter()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 统计数据
const stats = ref({
  followGoods: 12,
  followShops: 28,
  footprints: 500,
  purchaseRecords: 11,
})

// 订单数量
const orderCounts = ref({
  reserved: 2,
  shipped: 0,
  received: 0,
  afterSale: 0,
})

// 页面跳转
const navigateTo = (url: string) => {
  if (!userStore.isLoggedIn) {
    router.navigate('/pages/login/index')
    return
  }
  router.navigate(url)
}

// 设置
const handleSettings = () => {
  router.navigate('/pages-sub/user/settings')
}

// 农场操作
const handleFarmAction = (action: 'weeding' | 'watering' | 'fertilizing' | 'harvesting') => {
  if (!userStore.isLoggedIn) {
    router.navigate('/pages/login/index')
    return
  }
  // TODO: 实现农场操作逻辑
  showToast('功能开发中')
}

// 获取用户数据
const getUserData = async () => {
  try {
    // TODO: 调用接口获取用户数据
  } catch (error) {
    showToast('获取数据失败')
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    getUserData()
  }
})
</script>

<style lang="scss">
.user-page {
  min-height: 100vh;
  padding-bottom: env(safe-area-inset-bottom);
  background-color: #f8f8f8;
}

.user-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx;
  background-color: #018d71;

  .user-info {
    display: flex;
    align-items: center;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border: 4rpx solid rgba(255, 255, 255, 0.2);
      border-radius: 60rpx;
    }

    .info {
      margin-left: 24rpx;

      .nickname {
        display: block;
        margin-bottom: 8rpx;
        font-size: 36rpx;
        font-weight: bold;
        color: #fff;
      }

      .phone {
        font-size: 26rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  .settings {
    padding: 20rpx;

    .iconfont {
      font-size: 40rpx;
      color: #fff;
    }
  }
}

.stats-section {
  display: flex;
  padding: 30rpx 0;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;

  .stat-item {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;

    &:not(:last-child)::after {
      position: absolute;
      top: 50%;
      right: 0;
      width: 1px;
      height: 50%;
      content: '';
      background-color: #eee;
      transform: translateY(-50%);
    }

    .number {
      margin-bottom: 8rpx;
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }

    .label {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.section {
  padding: 30rpx;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30rpx;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .more {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #999;

      .iconfont {
        margin-left: 4rpx;
      }
    }
  }
}

.order-types {
  display: flex;
  justify-content: space-around;

  .type-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;

    .badge {
      position: absolute;
      top: -16rpx;
      right: -16rpx;
      min-width: 32rpx;
      height: 32rpx;
      padding: 0 8rpx;
      font-size: 20rpx;
      line-height: 32rpx;
      color: #fff;
      text-align: center;
      background-color: #ff6b6b;
      border-radius: 16rpx;
    }

    .iconfont {
      margin-bottom: 12rpx;
      font-size: 48rpx;
      color: #333;
    }

    text {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.farm-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    image {
      width: 80rpx;
      height: 80rpx;
      margin-bottom: 12rpx;
    }

    text {
      font-size: 24rpx;
      color: #666;
    }
  }
}
</style>
