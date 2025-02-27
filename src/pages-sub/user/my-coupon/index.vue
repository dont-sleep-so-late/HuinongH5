<route lang="json5">
{
  style: {
    navigationBarTitleText: '我的优惠券',
  },
}
</route>
<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="tabs">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        class="tab-item"
        :class="{ active: activeTabIndex === index }"
        @click="handleTabChange(index)"
      >
        <text>{{ tab.name }}</text>
      </view>
    </view>

    <!-- 优惠券列表 -->
    <z-paging
      ref="paging"
      v-model="coupons"
      @query="queryList"
      :show-refresher-when-reload="true"
      :auto-shows-back-to-top="true"
      :loading-more-no-more-text="'没有更多了'"
    >
      <view class="coupon-list">
        <view
          class="coupon-item"
          v-for="coupon in coupons"
          :key="coupon.id"
          :class="getStatusClass(coupon)"
        >
          <!-- 优惠券左侧 -->
          <view class="coupon-left">
            <view class="coupon-amount">
              <text class="symbol" v-if="coupon.type === 'cash'">¥</text>
              <text class="value">{{ formatCouponValue(coupon) }}</text>
              <text class="unit" v-if="coupon.type === 'discount'">折</text>
            </view>
            <view class="coupon-limit">
              {{ formatLimitDesc(coupon) }}
            </view>
          </view>

          <!-- 优惠券中间 -->
          <view class="coupon-center">
            <view class="coupon-name">{{ coupon.name }}</view>
            <view class="coupon-time">{{ formatTime(coupon) }}</view>
            <view class="coupon-desc">{{ coupon.description }}</view>
          </view>

          <!-- 优惠券右侧 -->
          <view class="coupon-right">
            <text class="status-tag" :class="getStatusClass(coupon)">
              {{ getStatusText(coupon) }}
            </text>
            <view class="action-btn" v-if="coupon.status === 'available'">
              <wd-button type="primary" size="small" @click="handleUse(coupon)">去使用</wd-button>
            </view>
          </view>

          <!-- 优惠券波浪边 -->
          <view class="coupon-edge left">
            <view class="edge-circle" v-for="i in 6" :key="i"></view>
          </view>
          <view class="coupon-edge right">
            <view class="edge-circle" v-for="i in 6" :key="i"></view>
          </view>

          <!-- 已使用/已过期水印 -->
          <view class="coupon-watermark" v-if="coupon.status !== 'available'">
            {{ coupon.status === 'used' ? '已使用' : '已过期' }}
          </view>
        </view>
      </view>
    </z-paging>

    <!-- 空状态 -->
    <view class="empty-state" v-if="isEmpty">
      <image src="/static/images/empty/empty-coupon.png" mode="aspectFit"></image>
      <text>{{ emptyText }}</text>
      <wd-button
        class="to-coupon-center"
        type="primary"
        size="small"
        @click="navigateToCouponCenter"
      >
        去领券中心
      </wd-button>
    </view>

    <!-- 弹窗提示 -->
    <wd-toast ref="toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Coupon, CouponStatus, GetCouponsParams, getMyCoupons } from '@/services/coupon'
import { useToast } from '@/hooks/useToast'

// 状态
const tabs = [
  { name: '可使用', status: 'available' },
  { name: '已使用', status: 'used' },
  { name: '已过期', status: 'expired' },
]
const activeTabIndex = ref(0)
const coupons = ref<Coupon[]>([])
const paging = ref<any>(null)
const isEmpty = ref(false)
const { toastRef: toast } = useToast()

// 空状态提示文本
const emptyText = computed(() => {
  const status = tabs[activeTabIndex.value].status
  if (status === 'available') {
    return '暂无可用优惠券'
  } else if (status === 'used') {
    return '暂无已使用的优惠券'
  } else {
    return '暂无已过期的优惠券'
  }
})

// 处理tab切换
const handleTabChange = (index: number) => {
  activeTabIndex.value = index
  paging.value?.reload()
}

// 查询列表数据
const queryList = async (pageNo: number, pageSize: number) => {
  isEmpty.value = false
  try {
    // 构建查询参数
    const params: GetCouponsParams = {
      status: tabs[activeTabIndex.value].status as CouponStatus,
      pageNum: pageNo,
      pageSize,
    }

    // 请求数据
    const res = await getMyCoupons(params)

    // 判断是否为空
    if (pageNo === 1 && (!res.data.records || res.data.records.length === 0)) {
      isEmpty.value = true
    }

    // 返回数据给z-paging组件
    return {
      list: res.data.records,
      total: res.data.total,
    }
  } catch (error) {
    console.error('获取优惠券列表失败', error)
    return {
      list: [],
      total: 0,
    }
  }
}

// 使用优惠券
const handleUse = (coupon: Coupon) => {
  // 根据优惠券使用范围跳转到不同页面
  if (coupon.scope === 'category') {
    // 跳转到分类页面
    uni.switchTab({
      url: '/pages/category/index',
    })
  } else if (coupon.scope === 'product' && coupon.scopeIds && coupon.scopeIds.length > 0) {
    // 跳转到特定商品详情页
    uni.navigateTo({
      url: `/pages-sub/goods/detail/index?id=${coupon.scopeIds[0]}`,
    })
  } else {
    // 跳转到首页
    uni.switchTab({
      url: '/pages/index/index',
    })
  }
}

// 导航到优惠券中心
const navigateToCouponCenter = () => {
  uni.navigateTo({
    url: '/pages-sub/marketing/coupon-center/index',
  })
}

// 格式化优惠券金额
const formatCouponValue = (coupon: Coupon): string => {
  if (coupon.type === 'cash') {
    return coupon.value.toString()
  } else if (coupon.type === 'discount') {
    return (coupon.value * 10).toFixed(1)
  } else {
    return coupon.value.toString()
  }
}

// 格式化使用限制描述
const formatLimitDesc = (coupon: Coupon): string => {
  if (coupon.minAmount > 0) {
    return `满${coupon.minAmount}元可用`
  } else {
    return '无门槛使用'
  }
}

// 格式化时间
const formatTime = (coupon: Coupon): string => {
  if (coupon.status === 'used' && coupon.usedTime) {
    // 已使用的优惠券显示使用时间
    return `使用时间: ${new Date(coupon.usedTime).toLocaleDateString()}`
  } else if (coupon.status === 'expired') {
    // 已过期的优惠券显示过期时间
    return `过期时间: ${new Date(coupon.endTime).toLocaleDateString()}`
  } else {
    // 未使用的优惠券显示过期时间
    const end = new Date(coupon.endTime)
    const now = new Date()

    // 计算剩余天数
    const diff = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diff <= 0) {
      return '今日到期'
    } else {
      return `${diff}天后到期`
    }
  }
}

// 获取状态样式类
const getStatusClass = (coupon: Coupon): string => {
  if (coupon.status === 'used') {
    return 'used'
  } else if (coupon.status === 'expired') {
    return 'expired'
  } else {
    return 'available'
  }
}

// 获取状态文本
const getStatusText = (coupon: Coupon): string => {
  if (coupon.status === 'used') {
    return '已使用'
  } else if (coupon.status === 'expired') {
    return '已过期'
  } else {
    return '可使用'
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #f5f6fa;
}

.tabs {
  display: flex;
  padding: 20rpx 0;
  background-color: #fff;

  .tab-item {
    position: relative;
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    height: 80rpx;
    font-size: 28rpx;
    color: #666;

    &.active {
      font-weight: bold;
      color: #018d71;

      &::after {
        position: absolute;
        bottom: -10rpx;
        left: 50%;
        width: 40rpx;
        height: 4rpx;
        content: '';
        background-color: #018d71;
        border-radius: 2rpx;
        transform: translateX(-50%);
      }
    }
  }
}

.coupon-list {
  padding: 30rpx;
}

.coupon-item {
  position: relative;
  display: flex;
  height: 240rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);

  &.used,
  &.expired {
    filter: grayscale(0.5);
    opacity: 0.8;
  }
}

.coupon-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 220rpx;
  padding: 0 20rpx;
  color: #fff;
  background-color: #018d71;

  .coupon-amount {
    display: flex;
    align-items: baseline;

    .symbol {
      margin-right: 4rpx;
      font-size: 36rpx;
    }

    .value {
      font-size: 72rpx;
      font-weight: bold;
      line-height: 1;
    }

    .unit {
      margin-left: 4rpx;
      font-size: 32rpx;
    }
  }

  .coupon-limit {
    margin-top: 16rpx;
    font-size: 24rpx;
    text-align: center;
    opacity: 0.8;
  }
}

.coupon-center {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  padding: 30rpx;

  .coupon-name {
    margin-bottom: 16rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .coupon-time {
    margin-bottom: 16rpx;
    font-size: 24rpx;
    color: #999;
  }

  .coupon-desc {
    display: -webkit-box;
    overflow: hidden;
    font-size: 24rpx;
    color: #666;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.coupon-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 160rpx;

  .status-tag {
    padding: 6rpx 16rpx;
    margin-bottom: 20rpx;
    font-size: 24rpx;
    border-radius: 20rpx;

    &.available {
      color: #018d71;
      background-color: rgba(1, 141, 113, 0.1);
    }

    &.used {
      color: #999;
      background-color: #f5f5f5;
    }

    &.expired {
      color: #ff4949;
      background-color: rgba(255, 73, 73, 0.1);
    }
  }

  .action-btn {
    margin-top: 10rpx;

    .wd-button {
      background-color: #018d71;
      border-color: #018d71;
    }
  }
}

.coupon-edge {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 20rpx;

  &.left {
    left: 210rpx;
  }

  &.right {
    right: 150rpx;
  }

  .edge-circle {
    width: 20rpx;
    height: 20rpx;
    background-color: #f5f6fa;
    border-radius: 50%;
  }
}

.coupon-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  font-size: 80rpx;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.1);
  pointer-events: none;
  transform: translate(-50%, -50%) rotate(-30deg);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;

  image {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: 30rpx;
  }

  text {
    margin-bottom: 30rpx;
    font-size: 28rpx;
    color: #999;
  }

  .to-coupon-center {
    background-color: #018d71;
    border-color: #018d71;
  }
}
</style>
