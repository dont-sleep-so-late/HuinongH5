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
          @click="goDetail(item.id)"
        >
          <view class="header">
            <text class="order-no">订单号：{{ item.orderNo }}</text>
            <text class="status" :style="{ color: getStatusColor(item.status) }">
              {{ getStatusText(item.status) }}
            </text>
          </view>
          <view class="goods-info">
            <image class="goods-image" :src="item.goodsImage" mode="aspectFill" />
            <view class="goods-detail">
              <text class="goods-name">{{ item.goodsName }}</text>
              <text class="goods-spec">{{ item.goodsSpec }}</text>
              <text class="goods-price">¥{{ item.goodsPrice }}</text>
            </view>
          </view>
          <view class="footer">
            <text class="time">申请时间：{{ formatTime(item.createTime) }}</text>
            <view class="actions">
              <wd-button
                v-if="item.status === 'pending'"
                size="small"
                @click.stop="cancelAfterSale(item.id)"
              >
                取消申请
              </wd-button>
              <wd-button
                v-if="item.status === 'approved'"
                type="primary"
                size="small"
                @click.stop="goLogistics(item.id)"
              >
                查看物流
              </wd-button>
            </view>
          </view>
        </view>
      </template>
      <template v-else>
        <wd-status-tip type="search" tip="暂无售后记录" />
      </template>
    </z-paging>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast, showModal } from '@/utils/toast'
import { formatTime } from '@/utils/time'
import { getAfterSaleList, cancelAfterSale as cancelAfterSaleApi } from '@/api/order'

const router = useRouter()
const paging = ref()
const activeTab = ref('all')
const list = ref([])

// 状态选项
const tabs = [
  { label: '全部', value: 'all' },
  { label: '处理中', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
]

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '处理中',
    approved: '已通过',
    rejected: '已拒绝',
    canceled: '已取消',
  }
  return statusMap[status] || status
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: '#ff9900',
    approved: '#52c41a',
    rejected: '#ff4d4f',
    canceled: '#999999',
  }
  return colorMap[status] || '#333333'
}

// 查询列表
const queryList = async (pageNo: number, pageSize: number) => {
  try {
    const res = await getAfterSaleList({
      pageNo,
      pageSize,
      status: activeTab.value === 'all' ? undefined : activeTab.value,
    })
    if (res.code === 200) {
      paging.value.complete(res.data.records)
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

// 取消售后
const cancelAfterSale = async (id: number) => {
  try {
    const { confirm } = await showModal({
      title: '提示',
      content: '确定要取消售后申请吗？',
    })
    if (confirm) {
      const res = await cancelAfterSaleApi(id)
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

        .goods-price {
          font-size: 32rpx;
          font-weight: bold;
          color: #ff4d4f;
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
