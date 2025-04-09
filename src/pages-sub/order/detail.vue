<template>
  <view class="order-detail" v-if="orderInfo">
    <!-- 订单状态 -->
    <view class="status-section">
      <view class="status-info">
        <text class="status-text">{{ getStatusText(orderInfo.status) }}</text>
        <text class="status-desc">{{ getStatusDesc(orderInfo.status) }}</text>
      </view>
      <image class="status-bg" src="/static/images/status-bg.png" mode="aspectFill" />
    </view>

    <!-- 收货地址 -->
    <view class="address-section">
      <view class="address-info">
        <view class="contact">
          <text class="name">{{ orderInfo.shippingName }}</text>
          <text class="phone">{{ orderInfo.shippingPhone }}</text>
        </view>
        <text class="address">{{ orderInfo.shippingAddress }}</text>
      </view>
      <text class="iconfont icon-location"></text>
    </view>

    <!-- 商品列表 -->
    <view class="goods-section">
      <view class="shop-info">
        <view class="shop-left">
          <image :src="orderInfo.shopAvatar" mode="aspectFill" class="shop-avatar" />
          <text class="shop-name">{{ orderInfo.shopName }}</text>
        </view>
        <text class="iconfont icon-arrow-right"></text>
      </view>
      <view class="goods-list">
        <view v-for="item in orderInfo.orderItems" :key="item.productId" class="goods-item">
          <image :src="item.productImage" mode="aspectFill" class="goods-image" />
          <view class="goods-info">
            <text class="goods-name">{{ item.productName }}</text>
            <text class="goods-spec">{{ item.specName }} {{ item.specValue }}</text>
            <view class="goods-bottom">
              <text class="goods-price">¥{{ item.price }}</text>
              <text class="goods-quantity">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>
      <view class="delivery-info">
        <text>配送方式</text>
        <text>{{ orderInfo.deliveryType === 'express' ? '快递配送' : '到店自提' }}</text>
      </view>
      <view class="remark" v-if="orderInfo.remark">
        <text>备注</text>
        <text>{{ orderInfo.remark }}</text>
      </view>
    </view>

    <!-- 订单金额 -->
    <view class="amount-section">
      <view class="amount-item">
        <text>商品总额</text>
        <text>¥{{ orderInfo.totalAmount }}</text>
      </view>
      <view class="amount-item">
        <text>运费</text>
        <text>¥{{ orderInfo.freightAmount }}</text>
      </view>
      <view class="amount-item" v-if="orderInfo.couponAmount > 0">
        <text>优惠券</text>
        <text>-¥{{ orderInfo.couponAmount }}</text>
      </view>
      <view class="divider"></view>
      <view class="amount-item total">
        <text>实付款</text>
        <text class="price">¥{{ orderInfo.payableAmount }}</text>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="order-info-section">
      <view class="info-item">
        <text>订单编号</text>
        <view class="copy-wrapper">
          <text>{{ orderInfo.orderNo }}</text>
          <text class="copy-btn" @click="copyOrderNo">复制</text>
        </view>
      </view>
      <view class="info-item">
        <text>创建时间</text>
        <text>{{ orderInfo.createTime }}</text>
      </view>
      <view class="info-item" v-if="orderInfo.payTime">
        <text>付款时间</text>
        <text>{{ orderInfo.payTime }}</text>
      </view>
      <view class="info-item" v-if="orderInfo.deliveryTime">
        <text>发货时间</text>
        <text>{{ orderInfo.deliveryTime }}</text>
      </view>
      <view class="info-item" v-if="orderInfo.receiveTime">
        <text>收货时间</text>
        <text>{{ orderInfo.receiveTime }}</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="footer">
      <template v-if="orderInfo.status === 'pending'">
        <wd-button size="large" @click="handleCancelOrder">取消订单</wd-button>
        <wd-button size="large" type="primary" @click="payOrder">立即付款</wd-button>
      </template>
      <template v-else-if="orderInfo.status === 'paid'">
        <wd-button size="large" @click="urgeShipment">催发货</wd-button>
      </template>
      <template v-else-if="orderInfo.status === 'shipped'">
        <wd-button size="large" @click="handleConfirmReceipt">确认收货</wd-button>
      </template>
      <template v-else-if="orderInfo.status === 'completed'">
        <wd-button size="large" @click="deleteOrder">删除订单</wd-button>
        <wd-button size="large" type="primary" @click="reviewOrder">评价</wd-button>
      </template>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import {
  getOrderDetail,
  cancelOrder,
  confirmOrder,
  type OrderDetail,
  type OrderStatus,
} from '@/api/order'
import { createPayOrder, getPayResult } from '@/api/pay'
import type { ApiResponse } from '@/types/api'
import type { PayResult } from '@/api/pay'

const router = useRouter()

// 订单信息
const orderInfo = ref<OrderDetail | null>(null)

// 获取订单状态文本
const getStatusText = (status: OrderStatus) => {
  const statusMap: Record<OrderStatus, string> = {
    pending: '待付款',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消',
  }
  return statusMap[status] || '未知状态'
}

// 获取订单状态描述
const getStatusDesc = (status: OrderStatus) => {
  const descMap: Record<OrderStatus, string> = {
    pending: '请尽快完成支付',
    paid: '商家正在处理您的订单',
    shipped: '商品正在配送中',
    completed: '交易已完成',
    cancelled: '订单已取消',
  }
  return descMap[status] || ''
}

// 复制订单号
const copyOrderNo = () => {
  if (!orderInfo.value) return
  uni.setClipboardData({
    data: orderInfo.value.orderNo,
    success: () => {
      showToast('复制成功')
    },
  })
}

// 取消订单
const handleCancelOrder = () => {
  if (!orderInfo.value) return
  uni.showModal({
    title: '提示',
    content: '确定要取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const res = await cancelOrder(orderInfo.value!.orderId)
          if (res.code === 200) {
            showToast('取消成功', { icon: 'success' })
            // 返回上一页
            router.back()
          }
        } catch (error: any) {
          showToast(error.message || '取消失败')
        }
      }
    },
  })
}

// 获取订单详情
const loadOrderDetail = async () => {
  try {
    const { orderId } = router.query()
    if (!orderId) {
      showToast('参数错误')
      return
    }
    const res = await getOrderDetail(Number(orderId))
    if (res.code === 200 && res.data) {
      orderInfo.value = res.data as unknown as OrderDetail
    }
  } catch (error: any) {
    showToast(error.message || '获取数据失败')
  }
}

// 支付订单
const payOrder = async () => {
  try {
    if (!orderInfo.value?.orderId) {
      showToast('订单不存在')
      return
    }

    // 如果没有选择支付方式，默认使用支付宝支付
    const paymentMethod = orderInfo.value.paymentMethod || 'ALIPAY'

    // 创建支付订单
    const res = await createPayOrder(String(orderInfo.value.orderId), paymentMethod)

    if (res.code === 200 && res.data) {
      const payData = res.data
      if (payData.paymentMethod === 'ALIPAY') {
        // 使用web-view打开支付宝支付页面
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>支付宝支付</title>
            </head>
            <body>
              ${payData.paymentForm}
            </body>
          </html>
        `
        // 打开web-view页面
        uni.navigateTo({
          url: `/pages-sub/common/web-view?html=${encodeURIComponent(htmlContent)}&title=支付宝支付`,
        })

        // 启动轮询查询支付结果
        startPollingPayResult(String(orderInfo.value.orderId))
      } else if (payData.paymentMethod === 'WECHAT') {
        // 微信支付，调用微信支付SDK
        uni.requestPayment({
          provider: 'wxpay',
          ...JSON.parse(payData.paymentForm),
          success: () => {
            showToast('支付成功')
            // 刷新订单详情
            loadOrderDetail()
          },
          fail: () => {
            showToast('支付失败')
          },
        })
      }
    } else {
      showToast('创建支付订单失败')
    }
  } catch (error: any) {
    showToast(error.message || '支付失败')
  }
}

// 轮询查询支付结果
const startPollingPayResult = (orderId: string) => {
  const maxAttempts = 60 // 最多轮询60次，即10分钟
  let attempts = 0

  const poll = async () => {
    try {
      const res = await getPayResult(orderId)
      if (res.code === 200 && res.data) {
        const result = res.data
        if (result.status === 'PAID') {
          // 支付成功
          showToast('支付成功')
          // 刷新订单详情
          loadOrderDetail()
          return
        } else if (result.status === 'CLOSED') {
          // 订单关闭
          showToast('订单已关闭')
          return
        }
      }

      // 继续轮询
      attempts++
      if (attempts < maxAttempts) {
        setTimeout(poll, 10000) // 每10秒查询一次
      }
    } catch (error) {
      console.error('查询支付结果失败：', error)
    }
  }

  // 开始轮询
  poll()
}

// 催发货
const urgeShipment = () => {
  showToast('催发货功能开发中')
}

// 确认收货
const handleConfirmReceipt = () => {
  if (!orderInfo.value) return
  uni.showModal({
    title: '提示',
    content: '确认已收到商品吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const res = await confirmOrder(orderInfo.value!.orderId)
          if (res.code === 200) {
            showToast('确认收货成功', { icon: 'success' })
            // 返回上一页
            router.back()
          }
        } catch (error: any) {
          showToast(error.message || '确认失败')
        }
      }
    },
  })
}

// 删除订单
const deleteOrder = () => {
  if (!orderInfo.value) return
  uni.showModal({
    title: '提示',
    content: '确定要删除该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          // TODO: 调用删除订单接口
          await new Promise((resolve) => setTimeout(resolve, 1000))
          showToast('删除成功', { icon: 'success' })
          // 返回上一页
          router.back()
        } catch (error: any) {
          showToast('删除失败')
        }
      }
    },
  })
}

// 评价订单
const reviewOrder = () => {
  if (!orderInfo.value) return
  router.navigate(`/pages-sub/order/review?id=${orderInfo.value.orderId}`)
}

// 页面加载
onMounted(() => {
  loadOrderDetail()
})
</script>

<style lang="scss">
.order-detail {
  min-height: 100vh;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  background-color: #f8f8f8;
}

.status-section {
  position: relative;
  height: 200rpx;
  padding: 40rpx;
  color: #fff;
  background: linear-gradient(to right, #ff6b6b, #ff9f9f);

  .status-info {
    position: relative;
    z-index: 1;

    .status-text {
      display: block;
      margin-bottom: 16rpx;
      font-size: 36rpx;
      font-weight: bold;
    }

    .status-desc {
      font-size: 26rpx;
      opacity: 0.8;
    }
  }

  .status-bg {
    position: absolute;
    right: 0;
    bottom: 0;
    width: 200rpx;
    height: 200rpx;
    opacity: 0.1;
  }
}

.address-section {
  display: flex;
  align-items: center;
  padding: 30rpx;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;

  .address-info {
    flex: 1;
    margin-right: 20rpx;

    .contact {
      margin-bottom: 12rpx;

      .name {
        margin-right: 20rpx;
        font-size: 30rpx;
        font-weight: bold;
      }

      .phone {
        font-size: 28rpx;
        color: #666;
      }
    }

    .address {
      font-size: 26rpx;
      color: #666;
    }
  }

  .iconfont {
    font-size: 40rpx;
    color: #999;
  }
}

.goods-section {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;

  .shop-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1rpx solid #eee;

    .shop-left {
      display: flex;
      align-items: center;

      .shop-avatar {
        width: 40rpx;
        height: 40rpx;
        margin-right: 12rpx;
        border-radius: 50%;
      }

      .shop-name {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }
    }

    .iconfont {
      font-size: 32rpx;
      color: #999;
    }
  }

  .goods-list {
    .goods-item {
      display: flex;
      padding: 30rpx;
      border-bottom: 1rpx solid #eee;

      .goods-image {
        width: 160rpx;
        height: 160rpx;
        margin-right: 20rpx;
        border-radius: 8rpx;
      }

      .goods-info {
        display: flex;
        flex: 1;
        flex-direction: column;

        .goods-name {
          margin-bottom: 12rpx;
          font-size: 28rpx;
          color: #333;
        }

        .goods-spec {
          margin-bottom: 20rpx;
          font-size: 24rpx;
          color: #999;
        }

        .goods-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .goods-price {
            font-size: 32rpx;
            font-weight: bold;
            color: #ff6b6b;
          }

          .goods-quantity {
            font-size: 24rpx;
            color: #999;
          }
        }
      }
    }
  }

  .delivery-info,
  .remark {
    display: flex;
    justify-content: space-between;
    padding: 30rpx;
    font-size: 26rpx;
    color: #666;
    border-bottom: 1rpx solid #eee;

    text:last-child {
      color: #333;
    }
  }
}

.amount-section {
  padding: 30rpx;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;

  .amount-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
    font-size: 26rpx;
    color: #666;

    &.total {
      margin-bottom: 0;
      font-size: 28rpx;
      color: #333;

      .price {
        font-size: 32rpx;
        font-weight: bold;
        color: #ff6b6b;
      }
    }
  }

  .divider {
    height: 1rpx;
    margin: 20rpx 0;
    background-color: #eee;
  }
}

.order-info-section {
  padding: 30rpx;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;

  .info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
    font-size: 26rpx;
    color: #666;

    &:last-child {
      margin-bottom: 0;
    }

    .copy-wrapper {
      display: flex;
      align-items: center;

      .copy-btn {
        margin-left: 20rpx;
        color: #ff6b6b;
      }
    }
  }
}

.footer {
  position: fixed;
  right: 0;
  bottom: env(safe-area-inset-bottom);
  left: 0;
  display: flex;
  justify-content: flex-end;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .wd-button {
    margin-left: 20rpx;
  }
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom);
  background-color: #fff;
}
</style>
