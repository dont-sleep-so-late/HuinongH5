<template>
  <view class="order-list">
    <!-- 订单状态切换 -->
    <wd-tabs v-model="activeTab" sticky>
      <wd-tab title="全部" name="all" />
      <wd-tab title="待付款" name="pending" />
      <wd-tab title="待发货" name="paid" />
      <wd-tab title="待收货" name="shipped" />
      <wd-tab title="已完成" name="completed" />
    </wd-tabs>

    <!-- 订单列表 -->
    <scroll-view
      scroll-y
      class="order-content"
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="order-items" v-if="orderList.length > 0">
        <view v-for="order in orderList" :key="order.id" class="order-item">
          <!-- 订单信息 -->
          <view class="order-header">
            <text class="order-no">订单号：{{ order.orderNo }}</text>
            <text class="order-status">{{ getStatusText(order.status) }}</text>
          </view>

          <!-- 商品列表 -->
          <view class="goods-list">
            <view v-for="item in order.items" :key="item.productId" class="goods-item">
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

          <!-- 订单金额 -->
          <view class="order-amount">
            <text>共{{ order.items.length }}件商品</text>
            <text>实付款：</text>
            <text class="price">¥{{ order.payableAmount }}</text>
          </view>

          <!-- 订单操作 -->
          <view class="order-actions">
            <template v-if="order.status === 'pending'">
              <wd-button size="small" @click="handleCancelOrder(order)">取消订单</wd-button>
              <wd-button size="small" type="primary" @click="payOrder(order)">立即付款</wd-button>
            </template>
            <template v-else-if="order.status === 'paid'">
              <wd-button size="small" @click="viewOrderDetail(order)">查看详情</wd-button>
              <wd-button size="small" type="primary" @click="urgeShipment(order)">催发货</wd-button>
            </template>
            <template v-else-if="order.status === 'shipped'">
              <wd-button size="small" @click="viewOrderDetail(order)">查看详情</wd-button>
              <wd-button size="small" type="primary" @click="confirmReceipt(order)">
                确认收货
              </wd-button>
            </template>
            <template v-else-if="order.status === 'completed'">
              <wd-button size="small" @click="viewOrderDetail(order)">查看详情</wd-button>
              <wd-button size="small" @click="deleteOrder(order)">删除订单</wd-button>
              <wd-button size="small" type="primary" @click="reviewOrder(order)">评价</wd-button>
            </template>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="loading" v-if="isLoading">
        <wd-loading size="20" />
        <text>加载中...</text>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-if="orderList.length === 0 && !isLoading">
        <image src="" mode="aspectFit" class="empty-icon" />
        <text>暂无相关订单</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import {
  getOrderList,
  cancelOrder as cancelOrderApi,
  type OrderListItem,
  type OrderStatus,
} from '@/api/order'

const router = useRouter()

// 当前选中的标签
const activeTab = ref<OrderStatus | 'all'>('all')

// 加载状态
const isLoading = ref(false)
const isRefreshing = ref(false)
const page = ref(1)
const pageSize = ref(10)

// 订单列表
const orderList = ref<OrderListItem[]>([])

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

// 加载订单列表
const loadOrders = async () => {
  if (isLoading.value) return
  isLoading.value = true

  try {
    const res = await getOrderList({
      status: activeTab.value === 'all' ? undefined : activeTab.value,
      pageNum: page.value,
      pageSize: pageSize.value,
    })

    if (res.code === 200 && res.data) {
      const orderData = res.data
      if (page.value === 1) {
        orderList.value = orderData.list
      } else {
        orderList.value = [...orderList.value, ...orderData.list]
      }
      // 如果没有更多数据了，禁止继续加载
      if (orderData.pageNum >= orderData.pages) {
        isLoading.value = false
      } else {
        page.value++
      }
    }
  } catch (error: any) {
    showToast(error.message || '加载失败')
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

// 取消订单
const handleCancelOrder = async (order: OrderListItem) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const res = await cancelOrderApi(order.id)
          if (res.code === 200) {
            showToast('取消成功', { icon: 'success' })
            // 重新加载订单列表
            page.value = 1
            orderList.value = []
            loadOrders()
          }
        } catch (error: any) {
          showToast(error.message || '取消失败')
        }
      }
    },
  })
}

// 支付订单
const payOrder = (order: any) => {
  // TODO: 调用支付接口
  showToast('支付功能开发中')
}

// 查看订单详情
const viewOrderDetail = (order: OrderListItem) => {
  router.navigate(`/pages-sub/order/detail?id=${order.id}`)
}

// 催发货
const urgeShipment = async (order: any) => {
  try {
    // TODO: 调用催发货接口
    await new Promise((resolve) => setTimeout(resolve, 1000))
    showToast('已通知卖家尽快发货')
  } catch (error) {
    showToast('操作失败')
  }
}

// 确认收货
const confirmReceipt = async (order: any) => {
  try {
    // TODO: 调用确认收货接口
    await new Promise((resolve) => setTimeout(resolve, 1000))
    showToast('确认收货成功', { icon: 'success' })
    // 重新加载订单列表
    page.value = 1
    orderList.value = []
    loadOrders()
  } catch (error) {
    showToast('确认失败')
  }
}

// 删除订单
const deleteOrder = (order: any) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          // TODO: 调用删除订单接口
          await new Promise((resolve) => setTimeout(resolve, 1000))
          showToast('删除成功', { icon: 'success' })
          // 重新加载订单列表
          page.value = 1
          orderList.value = []
          loadOrders()
        } catch (error) {
          showToast('删除失败')
        }
      }
    },
  })
}

// 评价订单
const reviewOrder = (order: any) => {
  router.navigate(`/pages-sub/order/review?id=${order.id}`)
}

// 加载更多
const loadMore = () => {
  loadOrders()
}

// 下拉刷新
const onRefresh = async () => {
  isRefreshing.value = true
  page.value = 1
  orderList.value = []
  await loadOrders()
}

// 页面加载
onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const { status } = currentPage?.options || {}
  if (status) {
    activeTab.value = status as OrderStatus | 'all'
  }
  loadOrders()
})
</script>

<style lang="scss">
.order-list {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.order-content {
  height: calc(100vh - 100rpx);
  padding: 20rpx;
}

.order-items {
  .order-item {
    padding: 30rpx;
    margin-bottom: 20rpx;
    background-color: #fff;
    border-radius: 16rpx;

    .order-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20rpx;

      .order-no {
        font-size: 26rpx;
        color: #666;
      }

      .order-status {
        font-size: 26rpx;
        color: #ff6b6b;
      }
    }

    .goods-list {
      .goods-item {
        display: flex;
        padding: 20rpx 0;

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

    .order-amount {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 20rpx 0;
      font-size: 26rpx;
      color: #666;
      border-top: 1rpx solid #eee;

      .price {
        margin-left: 8rpx;
        font-size: 32rpx;
        font-weight: bold;
        color: #ff6b6b;
      }
    }

    .order-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 20rpx;
      border-top: 1rpx solid #eee;

      .wd-button {
        margin-left: 20rpx;
      }
    }
  }
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  font-size: 24rpx;
  color: #999;

  .wd-loading {
    margin-right: 10rpx;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;

  .empty-icon {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 20rpx;
  }

  text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>
