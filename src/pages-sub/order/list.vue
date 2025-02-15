<template>
  <view class="order-list">
    <!-- 订单状态切换 -->
    <view class="status-tabs">
      <view
        class="tab-item"
        v-for="(item, index) in statusTabs"
        :key="index"
        :class="{ active: currentStatus === item.value }"
        @tap="switchStatus(item.value)"
      >
        {{ item.name }}
      </view>
    </view>

    <!-- 订单列表 -->
    <z-paging ref="paging" v-model="orderList" @query="queryList">
      <view class="order-item" v-for="(item, index) in orderList" :key="index">
        <view class="order-header">
          <text class="order-no">订单号：{{ item.orderNo }}</text>
          <text class="order-status">{{ item.statusText }}</text>
        </view>

        <view class="goods-list">
          <view
            class="goods-item"
            v-for="(goods, goodsIndex) in item.goods"
            :key="goodsIndex"
            @tap="navigateToDetail(item.id)"
          >
            <image :src="goods.image" mode="aspectFill" />
            <view class="goods-info">
              <view class="name">{{ goods.name }}</view>
              <view class="spec">{{ goods.spec }}</view>
              <view class="price-wrap">
                <text class="price">¥{{ goods.price }}</text>
                <text class="quantity">x{{ goods.quantity }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="order-footer">
          <view class="total">
            共{{ item.totalQuantity }}件商品 合计：
            <text class="price">¥{{ item.totalAmount }}</text>
          </view>
          <view class="action-buttons">
            <button
              class="btn"
              v-for="(btn, btnIndex) in getOrderButtons(item.status)"
              :key="btnIndex"
              :class="btn.type"
              @tap="handleOrderAction(btn.action, item)"
            >
              {{ btn.text }}
            </button>
          </view>
        </view>
      </view>
    </z-paging>

    <!-- 确认收货弹窗 -->
    <wd-popup v-model="showConfirm" :mask-close-able="false">
      <view class="confirm-popup">
        <view class="popup-title">确认收货</view>
        <view class="popup-content">确认已收到该订单商品？</view>
        <view class="popup-buttons">
          <button class="btn cancel" @tap="closeConfirm">取消</button>
          <button class="btn confirm" @tap="confirmReceive">确认</button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'

// 订单状态
const statusTabs = [
  { name: '全部', value: '' },
  { name: '待付款', value: 'unpaid' },
  { name: '待发货', value: 'unshipped' },
  { name: '待收货', value: 'unreceived' },
  { name: '已完成', value: 'completed' },
]

// 当前状态
const currentStatus = ref('')

// 订单列表
const orderList: Ref<any[]> = ref([])
const paging = ref(null)

// 确认收货
const showConfirm = ref(false)
const currentOrder = ref<any>(null)

// 切换订单状态
const switchStatus = (status: string) => {
  currentStatus.value = status
  reloadList()
}

// 重新加载列表
const reloadList = () => {
  if (paging.value) {
    paging.value.reload()
  }
}

// 查询订单列表
const queryList = async (pageNo: number, pageSize: number) => {
  // 模拟数据
  const list = Array(pageSize)
    .fill(0)
    .map((_, index) => ({
      id: pageNo * pageSize + index + 1,
      orderNo: `202401${String(pageNo * pageSize + index + 1).padStart(8, '0')}`,
      status: ['unpaid', 'unshipped', 'unreceived', 'completed'][Math.floor(Math.random() * 4)],
      statusText: ['待付款', '待发货', '待收货', '已完成'][Math.floor(Math.random() * 4)],
      goods: [
        {
          id: 1,
          name: '新鲜水蜜桃',
          spec: '2.5kg装',
          price: 29.9,
          quantity: 2,
          image: '/static/goods/peach.jpg',
        },
      ],
      totalQuantity: 2,
      totalAmount: 59.8,
    }))
    .filter((item) => !currentStatus.value || item.status === currentStatus.value)

  return {
    list,
    total: 100,
  }
}

// 获取订单操作按钮
const getOrderButtons = (status: string) => {
  switch (status) {
    case 'unpaid':
      return [
        { text: '取消订单', action: 'cancel', type: 'default' },
        { text: '立即付款', action: 'pay', type: 'primary' },
      ]
    case 'unshipped':
      return [
        { text: '申请退款', action: 'refund', type: 'default' },
        { text: '提醒发货', action: 'remind', type: 'primary' },
      ]
    case 'unreceived':
      return [
        { text: '查看物流', action: 'logistics', type: 'default' },
        { text: '确认收货', action: 'receive', type: 'primary' },
      ]
    case 'completed':
      return [
        { text: '删除订单', action: 'delete', type: 'default' },
        { text: '评价', action: 'comment', type: 'primary' },
      ]
    default:
      return []
  }
}

// 处理订单操作
const handleOrderAction = (action: string, order: any) => {
  switch (action) {
    case 'cancel':
      cancelOrder(order)
      break
    case 'pay':
      payOrder(order)
      break
    case 'refund':
      refundOrder(order)
      break
    case 'remind':
      remindShipping(order)
      break
    case 'logistics':
      viewLogistics(order)
      break
    case 'receive':
      showReceiveConfirm(order)
      break
    case 'delete':
      deleteOrder(order)
      break
    case 'comment':
      commentOrder(order)
      break
  }
}

// 取消订单
const cancelOrder = (order: any) => {
  uni.showModal({
    title: '提示',
    content: '确认取消该订单？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '订单已取消',
          icon: 'success',
        })
        reloadList()
      }
    },
  })
}

// 支付订单
const payOrder = (order: any) => {
  uni.navigateTo({
    url: `/pages-sub/order/payment?id=${order.id}`,
  })
}

// 申请退款
const refundOrder = (order: any) => {
  uni.navigateTo({
    url: `/pages-sub/order/refund?id=${order.id}`,
  })
}

// 提醒发货
const remindShipping = (order: any) => {
  uni.showToast({
    title: '已提醒商家发货',
    icon: 'success',
  })
}

// 查看物流
const viewLogistics = (order: any) => {
  uni.navigateTo({
    url: `/pages-sub/order/logistics?id=${order.id}`,
  })
}

// 显示确认收货弹窗
const showReceiveConfirm = (order: any) => {
  currentOrder.value = order
  showConfirm.value = true
}

// 关闭确认收货弹窗
const closeConfirm = () => {
  showConfirm.value = false
  currentOrder.value = null
}

// 确认收货
const confirmReceive = () => {
  uni.showLoading({
    title: '处理中',
  })

  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '确认收货成功',
      icon: 'success',
    })
    closeConfirm()
    reloadList()
  }, 1000)
}

// 删除订单
const deleteOrder = (order: any) => {
  uni.showModal({
    title: '提示',
    content: '确认删除该订单？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '订单已删除',
          icon: 'success',
        })
        reloadList()
      }
    },
  })
}

// 评价订单
const commentOrder = (order: any) => {
  uni.navigateTo({
    url: `/pages-sub/order/comment?id=${order.id}`,
  })
}

// 跳转到订单详情
const navigateToDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages-sub/order/detail?id=${id}`,
  })
}
</script>

<style lang="scss">
.order-list {
  min-height: 100vh;
  background-color: #f8f8f8;

  .price {
    font-size: 32rpx;
    font-weight: bold;
    color: #ff6b6b;
  }

  .btn {
    min-width: 160rpx;
    height: 60rpx;
    margin-left: 20rpx;
    font-size: 26rpx;
    line-height: 60rpx;
    text-align: center;
    border-radius: 30rpx;

    &.primary {
      color: #fff;
      background-color: #018d71;
    }

    &.default {
      color: #666;
      background-color: #f5f5f5;
    }
  }

  .status-tabs {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    height: 88rpx;
    background-color: #fff;
    border-bottom: 2rpx solid #f5f5f5;

    .tab-item {
      position: relative;
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      color: #333;

      &.active {
        color: #018d71;

        &::after {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 40rpx;
          height: 4rpx;
          content: '';
          background-color: #018d71;
          transform: translateX(-50%);
        }
      }
    }
  }

  .order-item {
    margin: 20rpx;
    overflow: hidden;
    background-color: #fff;
    border-radius: 12rpx;

    .order-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20rpx;
      border-bottom: 2rpx solid #f5f5f5;

      .order-no {
        font-size: 24rpx;
        color: #999;
      }

      .order-status {
        font-size: 28rpx;
        color: #018d71;
      }
    }

    .goods-list {
      padding: 20rpx;

      .goods-item {
        display: flex;
        padding: 20rpx 0;

        &:not(:last-child) {
          border-bottom: 2rpx solid #f5f5f5;
        }

        image {
          width: 160rpx;
          height: 160rpx;
          margin-right: 20rpx;
          border-radius: 8rpx;
        }

        .goods-info {
          flex: 1;

          .name {
            margin-bottom: 10rpx;
            font-size: 28rpx;
            color: #333;
          }

          .spec {
            margin-bottom: 20rpx;
            font-size: 24rpx;
            color: #999;
          }

          .price-wrap {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
        }
      }
    }

    .order-footer {
      padding: 20rpx;
      border-top: 2rpx solid #f5f5f5;

      .total {
        margin-bottom: 20rpx;
        font-size: 28rpx;
        color: #666;
        text-align: right;

        .price {
          font-size: 32rpx;
          font-weight: bold;
          color: #f04c41;
        }
      }

      .action-buttons {
        display: flex;
        align-items: center;
      }
    }
  }

  .confirm-popup {
    width: 560rpx;
    padding: 40rpx;
    background-color: #fff;
    border-radius: 12rpx;

    .popup-title {
      margin-bottom: 30rpx;
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      text-align: center;
    }

    .popup-content {
      margin-bottom: 40rpx;
      font-size: 28rpx;
      color: #666;
      text-align: center;
    }

    .popup-buttons {
      display: flex;
      justify-content: space-between;

      .btn {
        width: 220rpx;
        height: 80rpx;
        font-size: 28rpx;
        line-height: 80rpx;
        text-align: center;
        border-radius: 40rpx;

        &.cancel {
          color: #666;
          background-color: #f8f8f8;
        }

        &.confirm {
          color: #fff;
          background-color: #018d71;
        }
      }
    }
  }
}
</style>
