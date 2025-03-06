<template>
  <view class="after-sale-detail">
    <!-- 状态卡片 -->
    <view class="status-card">
      <view class="status-text">{{ getStatusText(detail.status) }}</view>
      <view class="status-desc">{{ getStatusDesc(detail.status) }}</view>
    </view>

    <!-- 商品信息 -->
    <view class="card">
      <view class="card-title">商品信息</view>
      <view class="goods-info">
        <image class="goods-image" :src="detail.goodsImage" mode="aspectFill" />
        <view class="goods-detail">
          <text class="goods-name">{{ detail.goodsName }}</text>
          <text class="goods-spec">{{ detail.goodsSpec }}</text>
          <text class="goods-price">¥{{ detail.goodsPrice }}</text>
        </view>
      </view>
    </view>

    <!-- 售后信息 -->
    <view class="card">
      <view class="card-title">售后信息</view>
      <view class="info-list">
        <view class="info-item">
          <text class="label">售后类型</text>
          <text class="value">{{ detail.type === 'refund' ? '仅退款' : '退货退款' }}</text>
        </view>
        <view class="info-item">
          <text class="label">申请原因</text>
          <text class="value">{{ detail.reason }}</text>
        </view>
        <view class="info-item">
          <text class="label">退款金额</text>
          <text class="value price">¥{{ detail.refundAmount }}</text>
        </view>
        <view class="info-item">
          <text class="label">申请说明</text>
          <text class="value">{{ detail.description || '无' }}</text>
        </view>
        <view class="info-item">
          <text class="label">凭证图片</text>
          <view class="image-list">
            <image
              v-for="(image, index) in detail.images"
              :key="index"
              :src="image"
              mode="aspectFill"
              @click="previewImage(image, detail.images)"
            />
          </view>
        </view>
      </view>
    </view>

    <!-- 处理进度 -->
    <view class="card">
      <view class="card-title">处理进度</view>
      <view class="progress-list">
        <view
          class="progress-item"
          v-for="(item, index) in detail.progress"
          :key="index"
          :class="{ active: index === 0 }"
        >
          <view class="time">{{ formatTime(item.time) }}</view>
          <view class="content">{{ item.content }}</view>
          <view class="operator" v-if="item.operator">操作人：{{ item.operator }}</view>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="footer" v-if="detail.status === 'pending'">
      <wd-button size="large" @click="cancelAfterSale">取消申请</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast, showModal } from '@/utils/toast'
import { formatTime } from '@/utils/time'
import { getAfterSaleDetail, cancelAfterSale as cancelAfterSaleApi } from '@/api/order'

const router = useRouter()
const detail = ref<any>({})

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

// 获取状态描述
const getStatusDesc = (status: string) => {
  const descMap: Record<string, string> = {
    pending: '商家正在处理您的售后申请',
    approved: '商家已同意您的售后申请',
    rejected: '商家已拒绝您的售后申请',
    canceled: '您已取消售后申请',
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
    const res = await getAfterSaleDetail(Number(id))
    if (res.code === 200) {
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

// 取消售后
const cancelAfterSale = async () => {
  try {
    const { confirm } = await showModal({
      title: '提示',
      content: '确定要取消售后申请吗？',
    })
    if (confirm) {
      const res = await cancelAfterSaleApi(detail.value.id)
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
