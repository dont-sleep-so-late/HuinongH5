<template>
  <view class="after-sale-list">
    <!-- 顶部状态切换 -->
    <wd-tabs v-model="activeTab" sticky>
      <wd-tab v-for="tab in tabs" :key="tab.value" :title="tab.label" :name="tab.value" />
    </wd-tabs>

    <!-- 列表内容 -->
    <z-paging ref="paging" v-model="list" @query="queryList">
      <template v-if="list.length > 0">
        <view
          class="after-sale-item"
          v-for="item in list"
          :key="item.id"
          @click="goDetail(item.orderId)"
        >
          <view class="header">
            <text class="order-no">订单号：{{ item.orderNo }}</text>
            <text class="status" :style="{ color: getStatusColor(item.status) }">
              {{ getStatusText(item.status) }}
            </text>
          </view>
          <view class="goods-info">
            <image class="goods-image" :src="item.orderItem.productImage" mode="aspectFill" />
            <view class="goods-detail">
              <text class="goods-name">{{ item.orderItem.productName }}</text>
              <text class="goods-spec" v-if="item.orderItem.specName || item.orderItem.specValue">
                {{ item.orderItem.specName }} {{ item.orderItem.specValue }}
              </text>
              <view class="refund-info">
                <text class="refund-amount">退款金额：¥{{ item.refundAmount }}</text>
                <text class="refund-reason">退款原因：{{ item.reason }}</text>
              </view>
            </view>
          </view>
          <view class="footer">
            <text class="time">申请时间：{{ formatTime(item.createTime) }}</text>
            <view class="actions">
              <wd-button
                v-if="item.status === RefundStatus.PENDING"
                size="small"
                @click.stop="cancelAfterSale(item.orderId)"
              >
                取消申请
              </wd-button>
              <wd-button
                v-if="item.status === RefundStatus.APPROVED"
                type="primary"
                size="small"
                @click.stop="goLogistics(item.orderId)"
              >
                查看物流
              </wd-button>
            </view>
          </view>
        </view>
      </template>
      <template v-else>
        <wd-status-tip type="search" tip="暂无退款记录" />
      </template>
    </z-paging>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast, showModal } from '@/utils/toast'
import { formatTime } from '@/utils/time'
import { getRefundList, cancelRefund, type RefundListItem, RefundStatus } from '@/api/refund'

const router = useRouter()
const paging = ref()
const activeTab = ref<RefundStatus | 'all'>('all')
const list = ref<RefundListItem[]>([])

// 状态选项
const tabs = [
  { label: '全部', value: 'all' },
  { label: '处理中', value: RefundStatus.PENDING },
  { label: '已通过', value: RefundStatus.APPROVED },
  { label: '已拒绝', value: RefundStatus.REJECTED },
]

// 获取状态文本
const getStatusText = (status: RefundStatus) => {
  const statusMap: Record<RefundStatus, string> = {
    [RefundStatus.PENDING]: '处理中',
    [RefundStatus.APPROVED]: '已通过',
    [RefundStatus.REJECTED]: '已拒绝',
    [RefundStatus.COMPLETED]: '已完成',
  }
  return statusMap[status] || status
}

// 获取状态颜色
const getStatusColor = (status: RefundStatus) => {
  const colorMap: Record<RefundStatus, string> = {
    [RefundStatus.PENDING]: '#ff9900',
    [RefundStatus.APPROVED]: '#52c41a',
    [RefundStatus.REJECTED]: '#ff4d4f',
    [RefundStatus.COMPLETED]: '#999999',
  }
  return colorMap[status] || '#333333'
}

// 查询列表
const queryList = async (pageNo: number, pageSize: number) => {
  try {
    const res = await getRefundList({
      pageNum: pageNo,
      pageSize,
      status: activeTab.value === 'all' ? undefined : activeTab.value,
    })
    if (res.code === 200 && res.data) {
      paging.value.complete(res.data.list)
    }
  } catch (error: any) {
    showToast(error.message || '获取数据失败')
    paging.value.complete(false)
  }
}

// 跳转详情
const goDetail = (id: number) => {
  router.navigate(`/pages-sub/order/after-sale/detail?id=${id}`)
}

// 跳转物流
const goLogistics = (id: number) => {
  router.navigate(`/pages-sub/order/logistics?afterSaleId=${id}`)
}

// 取消退款
const cancelAfterSale = async (id: number) => {
  try {
    const result = await showModal({
      title: '提示',
      content: '确定要取消退款申请吗？',
    })
    if (result?.confirm) {
      const res = await cancelRefund(id)
      if (res.code === 200) {
        showToast('取消成功')
        // 刷新列表
        paging.value.reload()
      }
    }
  } catch (error: any) {
    showToast(error.message || '取消失败')
  }
}

// 监听状态切换
watch(
  () => activeTab.value,
  () => {
    paging.value.reload()
  },
)
</script>

<style lang="scss">
.after-sale-list {
  min-height: 100vh;
  background-color: #f8f8f8;

  .after-sale-item {
    margin: 20rpx;
    background-color: #fff;
    border-radius: 12rpx;

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20rpx;
      border-bottom: 1px solid #f5f5f5;

      .order-no {
        font-size: 28rpx;
        color: #666;
      }

      .status {
        font-size: 28rpx;
        font-weight: bold;
      }
    }

    .goods-info {
      display: flex;
      padding: 20rpx;

      .goods-image {
        width: 160rpx;
        height: 160rpx;
        margin-right: 20rpx;
        border-radius: 8rpx;
      }

      .goods-detail {
        display: flex;
        flex: 1;
        flex-direction: column;

        .goods-name {
          margin-bottom: 8rpx;
          font-size: 28rpx;
          color: #333;
        }

        .goods-spec {
          margin-bottom: 8rpx;
          font-size: 24rpx;
          color: #999;
        }

        .refund-info {
          margin-top: 8rpx;
          font-size: 24rpx;
          color: #666;

          .refund-amount {
            display: block;
            margin-bottom: 4rpx;
            color: #ff4d4f;
          }

          .refund-reason {
            display: block;
          }
        }
      }
    }

    .footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20rpx;
      border-top: 1px solid #f5f5f5;

      .time {
        font-size: 24rpx;
        color: #999;
      }

      .actions {
        display: flex;
        gap: 20rpx;
      }
    }
  }
}
</style>
