<template>
  <view class="purchase-records">
    <!-- 记录列表 -->
    <z-paging ref="paging" v-model="recordsList" @query="queryRecords">
      <template #default>
        <view class="records-list">
          <view v-for="record in recordsList" :key="record.id" class="record-item">
            <view class="record-header">
              <text class="shop-name">{{ record.shopName }}</text>
              <text class="status" :class="record.status">{{ record.statusText }}</text>
            </view>
            <view class="goods-info">
              <image :src="record.cover" mode="aspectFill" class="goods-image" />
              <view class="goods-detail">
                <view class="goods-name">{{ record.goodsName }}</view>
                <view class="goods-specs">
                  <text>数量：{{ record.quantity }}{{ record.unit }}</text>
                  <text>单价：¥{{ record.price }}/{{ record.unit }}</text>
                </view>
                <view class="total-price">总价：¥{{ record.totalPrice }}</view>
              </view>
            </view>
            <view class="record-footer">
              <text class="time">{{ record.createTime }}</text>
              <view class="actions">
                <wd-button size="small" @click="handleViewDetail(record)">查看详情</wd-button>
                <wd-button
                  v-if="record.status === 'pending'"
                  type="primary"
                  size="small"
                  @click="handleConfirm(record)"
                >
                  确认收货
                </wd-button>
              </view>
            </view>
          </view>
        </view>
      </template>
    </z-paging>

    <!-- 空状态 -->
    <view v-if="recordsList.length === 0" class="empty-state">
      <image src="/static/images/empty/purchase.png" mode="aspectFit" />
      <text>暂无采购记录</text>
      <wd-button type="primary" size="small" @click="handleGoShopping">去采购</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '@/hooks/router'

interface PurchaseRecord {
  id: string
  shopName: string
  status: 'pending' | 'completed' | 'cancelled'
  statusText: string
  goodsName: string
  cover: string
  quantity: number
  unit: string
  price: number
  totalPrice: number
  createTime: string
}

const router = useRouter()
const paging = ref()
const recordsList = ref<PurchaseRecord[]>([])

// 查询采购记录
const queryRecords = async (pageNo: number, pageSize: number) => {
  try {
    const res = await uni.$api.user.getPurchaseRecords({ pageNo, pageSize })
    return {
      list: res.data.list,
      total: res.data.total,
    }
  } catch (error) {
    uni.showToast({
      title: '获取采购记录失败',
      icon: 'none',
    })
    return {
      list: [],
      total: 0,
    }
  }
}

// 查看详情
const handleViewDetail = (record: PurchaseRecord) => {
  router.navigate('/pages-sub/purchase/detail', {
    id: record.id,
  })
}

// 确认收货
const handleConfirm = (record: PurchaseRecord) => {
  uni.showModal({
    title: '提示',
    content: '确认已收到货物吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await uni.$api.user.confirmPurchase(record.id)
          uni.showToast({
            title: '确认成功',
            icon: 'success',
          })
          paging.value?.reload()
        } catch (error) {
          uni.showToast({
            title: '确认失败',
            icon: 'none',
          })
        }
      }
    },
  })
}

// 去采购
const handleGoShopping = () => {
  router.switchTab('/pages/index/index')
}
</script>

<style lang="scss">
.purchase-records {
  min-height: 100vh;
  padding: 20rpx;
  background-color: #f8f8f8;

  .records-list {
    .record-item {
      padding: 20rpx;
      margin-bottom: 20rpx;
      background-color: #fff;
      border-radius: 12rpx;

      .record-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 20rpx;
        margin-bottom: 20rpx;
        border-bottom: 1px solid #f5f5f5;

        .shop-name {
          font-size: 28rpx;
          font-weight: bold;
          color: #333;
        }

        .status {
          font-size: 24rpx;

          &.pending {
            color: #faad14;
          }

          &.completed {
            color: #52c41a;
          }

          &.cancelled {
            color: #ff4d4f;
          }
        }
      }

      .goods-info {
        display: flex;
        margin-bottom: 20rpx;

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
          justify-content: space-between;

          .goods-name {
            font-size: 28rpx;
            line-height: 1.4;
            color: #333;
          }

          .goods-specs {
            display: flex;
            flex-direction: column;
            gap: 8rpx;
            font-size: 24rpx;
            color: #666;
          }

          .total-price {
            font-size: 28rpx;
            font-weight: bold;
            color: #ff4d4f;
          }
        }
      }

      .record-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 20rpx;
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

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100rpx 0;

    image {
      width: 240rpx;
      height: 240rpx;
      margin-bottom: 20rpx;
    }

    text {
      margin-bottom: 30rpx;
      font-size: 28rpx;
      color: #999;
    }
  }
}
</style>
