<template>
  <view class="payment-result">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="title">支付结果</text>
    </view>

    <!-- 结果展示 -->
    <view class="result-content">
      <view class="status-icon">
        <text class="iconfont" :class="status.icon"></text>
      </view>
      <text class="status-text">{{ status.text }}</text>
      <text class="order-no">订单号：{{ orderNo }}</text>
      <text class="amount">支付金额：¥{{ amount }}</text>
    </view>

    <!-- 按钮区域 -->
    <view class="button-group">
      <view class="primary-btn" @click="viewOrder">查看订单</view>
      <view class="secondary-btn" @click="backToHome">返回首页</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import { getPayResult } from '@/api/pay'
import { showToast } from '@/utils/toast'

const router = useRouter()

// 支付状态
const status = ref({
  icon: 'icon-loading',
  text: '正在查询支付结果...',
})

// 订单信息
const orderNo = ref('')
const amount = ref(0)

// 查询支付结果
const queryPayResult = async (orderId: string) => {
  try {
    const res = await getPayResult(orderId)
    if (res.code === 200 && res.data) {
      const result = res.data
      orderNo.value = result.orderId
      amount.value = result.amount

      if (result.status === 'PAID') {
        status.value = {
          icon: 'icon-success',
          text: '支付成功',
        }
      } else if (result.status === 'CLOSED') {
        status.value = {
          icon: 'icon-close',
          text: '支付已关闭',
        }
      } else {
        status.value = {
          icon: 'icon-warning',
          text: '等待支付',
        }
      }
    }
  } catch (error) {
    console.error('查询支付结果失败：', error)
    status.value = {
      icon: 'icon-error',
      text: '查询失败',
    }
  }
}

// 查看订单
const viewOrder = () => {
  router.redirect(`/pages-sub/order/detail?orderId=${orderNo.value}`)
}

// 返回首页
const backToHome = () => {
  router.redirect('/pages/index/index')
}

onMounted(() => {
  // 获取URL参数
  const query = router.query()
  const orderId = query.orderId

  if (orderId) {
    // 开始轮询查询支付结果
    const maxAttempts = 60 // 最多轮询60次，即10分钟
    let attempts = 0

    const poll = async () => {
      await queryPayResult(orderId)
      attempts++

      // 如果还未支付成功且未超过最大尝试次数，继续轮询
      if (status.value.text === '等待支付' && attempts < maxAttempts) {
        setTimeout(poll, 3000) // 每3秒查询一次
      }
    }

    poll()
  } else {
    showToast('订单不存在')
    setTimeout(() => {
      router.redirect('/pages/index/index')
    }, 1500)
  }
})
</script>

<style lang="scss">
.payment-result {
  min-height: 100vh;
  background-color: #f8f8f8;

  .nav-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    background: #fff;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .result-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx 32rpx;
    margin: 20rpx;
    background-color: #fff;
    border-radius: 16rpx;

    .status-icon {
      margin-bottom: 32rpx;

      .iconfont {
        font-size: 120rpx;

        &.icon-success {
          color: #07c160;
        }

        &.icon-error,
        &.icon-close {
          color: #ff4d4f;
        }

        &.icon-warning {
          color: #faad14;
        }

        &.icon-loading {
          color: #1890ff;
          animation: rotate 1s linear infinite;
        }
      }
    }

    .status-text {
      margin-bottom: 40rpx;
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }

    .order-no,
    .amount {
      margin-bottom: 16rpx;
      font-size: 28rpx;
      color: #666;
    }
  }

  .button-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32rpx;

    .primary-btn,
    .secondary-btn {
      width: 80%;
      height: 88rpx;
      margin-bottom: 20rpx;
      font-size: 32rpx;
      line-height: 88rpx;
      text-align: center;
      border-radius: 44rpx;
    }

    .primary-btn {
      color: #fff;
      background-color: #ff6b6b;
    }

    .secondary-btn {
      color: #666;
      background-color: #fff;
      border: 2rpx solid #ddd;
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
