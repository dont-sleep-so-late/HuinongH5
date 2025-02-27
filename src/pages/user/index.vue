<template>
  <view class="user-page">
    <!-- 用户信息区域 -->
    <view class="user-header">
      <view class="user-info">
        <image
          :src="userInfo?.avatar || '/static/images/Ayo.png'"
          class="avatar"
          mode="aspectFill"
        />
        <view class="info">
          <text class="nickname">{{ userInfo?.nickname || '未登录' }}</text>
          <text class="phone" v-if="userInfo?.phone">{{ userInfo.phone }}</text>
        </view>
      </view>
      <view class="settings" @click="handleSettings">
        <text class="iconfont icon-settings">设置</text>
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
    <view class="menu-section">
      <view class="menu-header">
        <text class="menu-title">我的订单</text>
        <view class="more" @click="navigateTo('/pages-sub/order/list/index')">
          <text>全部订单</text>
          <wd-icon name="arrow-right" size="28" color="#999" />
        </view>
      </view>
      <view class="menu-grid">
        <view class="menu-item" @click="navigateTo('/pages-sub/order/list/index?status=pending')">
          <wd-icon name="pay" size="48" color="#018d71" />
          <text>待付款</text>
          <view class="badge" v-if="orderCounts.pending > 0">
            {{ formatBadge(orderCounts.pending) }}
          </view>
        </view>
        <view class="menu-item" @click="navigateTo('/pages-sub/order/list/index?status=paid')">
          <wd-icon name="cart" size="48" color="#018d71" />
          <text>待发货</text>
          <view class="badge" v-if="orderCounts.paid > 0">{{ formatBadge(orderCounts.paid) }}</view>
        </view>
        <view class="menu-item" @click="navigateTo('/pages-sub/order/list/index?status=shipped')">
          <wd-icon name="logistics" size="48" color="#018d71" />
          <text>待收货</text>
          <view class="badge" v-if="orderCounts.shipped > 0">
            {{ formatBadge(orderCounts.shipped) }}
          </view>
        </view>
        <view class="menu-item" @click="navigateTo('/pages-sub/order/list/index?status=received')">
          <wd-icon name="comment" size="48" color="#018d71" />
          <text>待评价</text>
          <view class="badge" v-if="orderCounts.received > 0">
            {{ formatBadge(orderCounts.received) }}
          </view>
        </view>
        <view class="menu-item" @click="navigateTo('/pages-sub/order/after-sale/list/index')">
          <wd-icon name="service" size="48" color="#018d71" />
          <text>售后</text>
        </view>
      </view>
    </view>

    <!-- 我的优惠 -->
    <view class="menu-section">
      <view class="menu-header">
        <text class="menu-title">我的优惠</text>
      </view>
      <view class="menu-grid">
        <view class="menu-item" @click="navigateTo('/pages-sub/user/my-coupon/index')">
          <wd-icon name="coupon" size="48" color="#ff5000" />
          <text>优惠券</text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages-sub/user/points/index')">
          <wd-icon name="success" size="48" color="#ff5000" />
          <text>积分</text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages-sub/marketing/group-buy/index')">
          <wd-icon name="friends" size="48" color="#ff5000" />
          <text>拼团</text>
        </view>
        <view class="menu-item" @click="navigateTo('/pages-sub/marketing/seckill/index')">
          <wd-icon name="clock" size="48" color="#ff5000" />
          <text>秒杀</text>
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

    <!-- 退出登录按钮 -->
    <view class="logout-section">
      <wd-button type="danger" block @click="handleLogout">退出登录</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from '@/hooks/router'
import { useUserStore } from '@/stores/user'
import { showToast } from '@/utils/toast'
import { getUserInfo } from '@/services/user'
import { logout } from '@/services/auth'

const router = useRouter()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const isSeller = computed(() => userInfo.value?.role === 'seller')

// 统计数据
const stats = ref({
  followGoods: 0,
  followShops: 0,
  footprints: 0,
  purchaseRecords: 0,
})

// 订单数量
const orderCounts = ref({
  pending: 0,
  paid: 0,
  shipped: 0,
  received: 0,
})

// 页面跳转
const navigateTo = (url: string) => {
  if (!userStore.isLoggedIn) {
    router.navigate('/pages/login/index')
    return
  }
  router.navigate(url)
}

// 格式化徽章数字
const formatBadge = (count: number): string => {
  return count > 99 ? '99+' : count.toString()
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

// 退出登录
const handleLogout = async () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 调用退出登录接口
          await logout()
          // 清除用户信息
          userStore.logout()
          // 显示提示
          showToast('退出成功')
          // 跳转到登录页
          router.reLaunch('/pages/login/index')
        } catch (error: any) {
          showToast(error.message || '退出失败')
        }
      }
    },
  })
}

// 编辑个人信息
const handleEditProfile = () => {
  router.navigate('/pages-sub/user/profile')
}

// 获取用户数据
const getUserData = async () => {
  try {
    const res = await getUserInfo()
    if (res.data) {
      // 更新用户信息
      userStore.updateUserInfo(res.data)
      // 初始化统计数据
      stats.value = {
        followGoods: 0,
        followShops: 0,
        footprints: 0,
        purchaseRecords: 0,
      }
      // 初始化订单数量
      orderCounts.value = {
        pending: 0,
        paid: 0,
        shipped: 0,
        received: 0,
      }
    }
  } catch (error: any) {
    showToast(error.message || '获取数据失败')
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    getUserData()
  } else {
    // 未登录跳转到登录页
    router.navigate('/pages/login/index')
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

.logout-section {
  padding: 40rpx 0;
}

.menu-section {
  padding: 30rpx;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;

  .menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30rpx;

    .menu-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .more {
      display: flex;
      align-items: center;
      font-size: 26rpx;
      color: #999;

      .wd-icon {
        margin-left: 4rpx;
      }
    }
  }

  .menu-grid {
    display: flex;
    justify-content: space-around;

    .menu-item {
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

      .wd-icon {
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
}
</style>
