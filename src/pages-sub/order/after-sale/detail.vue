<template>
  <view class="after-sale-detail" v-if="detail">
    <!-- 状态卡片 -->
    <view class="status-card">
      <view class="status-text">{{ getStatusText(detail.status) }}</view>
      <view class="status-desc">{{ getStatusDesc(detail.status) }}</view>
    </view>

    <!-- 商品信息 -->
    <view class="card">
      <view class="card-title">退款信息</view>
      <view class="goods-info">
        <view class="goods-detail">
          <text class="goods-name">退款金额：¥{{ detail.refundAmount }}</text>
          <text class="goods-spec">退款原因：{{ detail.reason }}</text>
          <text class="goods-desc" v-if="detail.description">
            退款说明：{{ detail.description }}
          </text>
        </view>
      </view>
    </view>

    <!-- 凭证图片 -->
    <view class="card" v-if="detail.images && detail.images.length > 0">
      <view class="card-title">凭证图片</view>
      <view class="image-list">
        <image
          v-for="(image, index) in detail.images"
          :key="index"
          :src="image"
          mode="aspectFill"
          @click="previewImage(image, detail.images || [])"
        />
      </view>
    </view>

    <!-- 处理进度 -->
    <view class="card">
      <view class="card-title">处理进度</view>
      <view class="progress-list">
        <view class="progress-item active">
          <view class="time">{{ formatTime(detail.createTime) }}</view>
          <view class="content">提交退款申请</view>
        </view>
        <view class="progress-item" v-if="detail.status !== 'PENDING'">
          <view class="time">{{ formatTime(detail.updateTime) }}</view>
          <view class="content">
            {{ detail.status === 'APPROVED' ? '退款申请已通过' : '退款申请已拒绝' }}
          </view>
          <view class="operator" v-if="detail.rejectReason">
            拒绝原因：{{ detail.rejectReason }}
          </view>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="footer" v-if="detail.status === 'PENDING'">
      <wd-button size="large" @click="cancelAfterSale">取消申请</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast, showModal } from '@/utils/toast'
import { formatTime } from '@/utils/time'
import { getRefundDetail, cancelRefund, type RefundDetail, type RefundStatus } from '@/api/refund'

const router = useRouter()
const detail = ref<RefundDetail | null>(null)

// 获取状态文本
const getStatusText = (status: RefundStatus) => {
  const statusMap: Record<RefundStatus, string> = {
    PENDING: '处理中',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
    COMPLETED: '已完成',
  }
  return statusMap[status] || status
}

// 获取状态描述
const getStatusDesc = (status: RefundStatus) => {
  const descMap: Record<RefundStatus, string> = {
    PENDING: '商家正在处理您的退款申请',
    APPROVED: '商家已同意您的退款申请',
    REJECTED: '商家已拒绝您的退款申请',
    COMPLETED: '退款已完成',
  }
  return descMap[status] || ''
}

// 获取详情
const getDetail = async () => {
  try {
    const { id } = router.query()
    if (!id) {
      showToast('参数错误')
      return
    }
    const res = await getRefundDetail(Number(id))
    if (res.code === 200 && res.data) {
      detail.value = res.data
    }
  } catch (error: any) {
    showToast(error.message || '获取数据失败')
  }
}

// 预览图片
const previewImage = (current: string, urls: string[]) => {
  uni.previewImage({
    current,
    urls,
  })
}

// 取消退款
const cancelAfterSale = async () => {
  if (!detail.value) return
  try {
    const result = await showModal({
      title: '提示',
      content: '确定要取消退款申请吗？',
    })
    if (result?.confirm) {
      const res = await cancelRefund(detail.value.orderId)
      if (res.code === 200) {
        showToast('取消成功')
        // 刷新详情
        getDetail()
      }
    }
  } catch (error: any) {
    showToast(error.message || '取消失败')
  }
}

onMounted(() => {
  getDetail()
})
</script>

<style lang="scss">
.after-sale-detail {
  min-height: 100vh;
  padding-bottom: 120rpx;
  background-color: #f8f8f8;

  .status-card {
    padding: 40rpx;
    color: #fff;
    background-color: #ff4d4f;

    .status-text {
      margin-bottom: 20rpx;
      font-size: 36rpx;
      font-weight: bold;
    }

    .status-desc {
      font-size: 28rpx;
      opacity: 0.8;
    }
  }

  .card {
    padding: 20rpx;
    margin: 20rpx;
    background-color: #fff;
    border-radius: 12rpx;

    .card-title {
      margin-bottom: 20rpx;
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .goods-info {
      display: flex;
      padding: 20rpx 0;

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

    .info-list {
      .info-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 20rpx;

        .label {
          width: 140rpx;
          font-size: 28rpx;
          color: #666;
        }

        .value {
          flex: 1;
          font-size: 28rpx;
          color: #333;

          &.price {
            font-weight: bold;
            color: #ff4d4f;
          }
        }

        .image-list {
          display: flex;
          flex-wrap: wrap;
          gap: 20rpx;

          image {
            width: 160rpx;
            height: 160rpx;
            border-radius: 8rpx;
          }
        }
      }
    }

    .progress-list {
      .progress-item {
        position: relative;
        padding-bottom: 40rpx;
        padding-left: 30rpx;

        &::before {
          position: absolute;
          top: 12rpx;
          left: 0;
          width: 12rpx;
          height: 12rpx;
          content: '';
          background-color: #999;
          border-radius: 50%;
        }

        &::after {
          position: absolute;
          top: 24rpx;
          bottom: 0;
          left: 5rpx;
          width: 2rpx;
          content: '';
          background-color: #eee;
        }

        &:last-child::after {
          display: none;
        }

        &.active {
          &::before {
            background-color: #ff4d4f;
          }

          .time {
            color: #ff4d4f;
          }
        }

        .time {
          margin-bottom: 8rpx;
          font-size: 24rpx;
          color: #999;
        }

        .content {
          margin-bottom: 8rpx;
          font-size: 28rpx;
          color: #333;
        }

        .operator {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }

  .footer {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 20rpx;
    background-color: #fff;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  }
}
</style>
