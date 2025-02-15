<template>
  <view class="order-list">
    <!-- 订单状态切换 -->
    <wd-tabs v-model="activeTab" sticky>
      <wd-tab title="全部" name="all" />
      <wd-tab title="待付款" name="unpaid" />
      <wd-tab title="待发货" name="unshipped" />
      <wd-tab title="待收货" name="unreceived" />
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
          <!-- 店铺信息 -->
          <view class="shop-info">
            <view class="shop-left">
              <image :src="order.shopAvatar" mode="aspectFill" class="shop-avatar" />
              <text class="shop-name">{{ order.shopName }}</text>
            </view>
            <text class="order-status">{{ getStatusText(order.status) }}</text>
          </view>

          <!-- 商品列表 -->
          <view class="goods-list">
            <view v-for="goods in order.goodsList" :key="goods.id" class="goods-item">
              <image :src="goods.image" mode="aspectFill" class="goods-image" />
              <view class="goods-info">
                <text class="goods-name">{{ goods.name }}</text>
                <text class="goods-spec">{{ goods.spec }}</text>
                <view class="goods-bottom">
                  <text class="goods-price">¥{{ goods.price }}</text>
                  <text class="goods-quantity">x{{ goods.quantity }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 订单金额 -->
          <view class="order-amount">
            <text>共{{ order.totalQuantity }}件商品</text>
            <text>实付款：</text>
            <text class="price">¥{{ order.totalAmount }}</text>
          </view>

          <!-- 订单操作 -->
          <view class="order-actions">
            <template v-if="order.status === 'unpaid'">
              <wd-button size="small" @click="cancelOrder(order)">取消订单</wd-button>
              <wd-button size="small" type="primary" @click="payOrder(order)">立即付款</wd-button>
            </template>
            <template v-else-if="order.status === 'unshipped'">
              <wd-button size="small" @click="viewLogistics(order)">查看物流</wd-button>
              <wd-button size="small" type="primary" @click="urgeShipment(order)">催发货</wd-button>
            </template>
            <template v-else-if="order.status === 'unreceived'">
              <wd-button size="small" @click="viewLogistics(order)">查看物流</wd-button>
              <wd-button size="small" type="primary" @click="confirmReceipt(order)">
                确认收货
              </wd-button>
            </template>
            <template v-else-if="order.status === 'completed'">
              <wd-button size="small" @click="viewLogistics(order)">查看物流</wd-button>
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
        <image src="/static/icons/empty-order.png" mode="aspectFit" class="empty-icon" />
        <text>暂无相关订单</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'

const router = useRouter()

// 当前选中的标签
const activeTab = ref('all')

// 加载状态
const isLoading = ref(false)
const isRefreshing = ref(false)
const page = ref(1)
const pageSize = ref(10)

// 订单列表
const orderList = ref([])

// 获取订单状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    unpaid: '待付款',
    unshipped: '待发货',
    unreceived: '待收货',
    completed: '已完成',
  }
  return statusMap[status] || '未知状态'
}

// 加载订单列表
const loadOrders = async () => {
  if (isLoading.value) return
  isLoading.value = true

  try {
    // TODO: 调用获取订单列表接口
    // 模拟数据
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const mockOrders = Array(pageSize.value)
      .fill(null)
      .map((_, index) => ({
        id: page.value * pageSize.value + index,
        shopName: '测试店铺',
        shopAvatar: '/static/shop/avatar.png',
        status: ['unpaid', 'unshipped', 'unreceived', 'completed'][Math.floor(Math.random() * 4)],
        goodsList: [
          {
            id: 1,
            name: '测试商品',
            spec: '规格：1kg',
            price: 29.9,
            quantity: 2,
            image: '/static/goods/default.jpg',
          },
        ],
        totalQuantity: 2,
        totalAmount: 59.8,
      }))

    if (page.value === 1) {
      orderList.value = mockOrders
    } else {
      orderList.value = [...orderList.value, ...mockOrders]
    }
    page.value++
  } catch (error) {
    showToast('加载失败')
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

// 取消订单
const cancelOrder = async (order: any) => {
  try {
    // TODO: 调用取消订单接口
    await new Promise((resolve) => setTimeout(resolve, 1000))
    showToast('取消成功', { icon: 'success' })
    // 重新加载订单列表
    page.value = 1
    orderList.value = []
    loadOrders()
  } catch (error) {
    showToast('取消失败')
  }
}

// 支付订单
const payOrder = (order: any) => {
  // TODO: 调用支付接口
  showToast('支付功能开发中')
}

// 查看物流
const viewLogistics = (order: any) => {
  router.navigate(`/pages-sub/order/logistics?id=${order.id}`)
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
  const { type } = currentPage?.options || {}
  if (type) {
    activeTab.value = type
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

    .shop-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20rpx;

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
