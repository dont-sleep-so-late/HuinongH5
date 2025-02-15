<template>
  <view class="logistics">
    <!-- 物流状态 -->
    <view class="status-section">
      <view class="status-info">
        <text class="status-text">{{ logisticsInfo.status }}</text>
        <text class="status-desc">{{ logisticsInfo.lastTrack?.desc }}</text>
        <text class="status-time">{{ logisticsInfo.lastTrack?.time }}</text>
      </view>
      <image class="status-bg" src="/static/images/logistics-bg.png" mode="aspectFill" />
    </view>

    <!-- 收货地址 -->
    <view class="address-section">
      <view class="address-info">
        <view class="contact">
          <text class="name">{{ logisticsInfo.address?.name }}</text>
          <text class="phone">{{ logisticsInfo.address?.phone }}</text>
        </view>
        <text class="address">{{ logisticsInfo.address?.fullAddress }}</text>
      </view>
      <text class="iconfont icon-location"></text>
    </view>

    <!-- 包裹信息 -->
    <view class="package-section">
      <view class="package-header">
        <text>包裹信息</text>
      </view>
      <view class="package-content">
        <view class="info-item">
          <text>快递公司</text>
          <text>{{ logisticsInfo.company }}</text>
        </view>
        <view class="info-item">
          <text>运单编号</text>
          <view class="copy-wrapper">
            <text>{{ logisticsInfo.trackingNo }}</text>
            <text class="copy-btn" @click="copyTrackingNo">复制</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 物流轨迹 -->
    <view class="track-section">
      <view class="track-header">
        <text>物流轨迹</text>
      </view>
      <view class="track-list">
        <view
          v-for="(track, index) in logisticsInfo.tracks"
          :key="index"
          class="track-item"
          :class="{ active: index === 0 }"
        >
          <view class="track-dot"></view>
          <view class="track-line" v-if="index !== logisticsInfo.tracks.length - 1"></view>
          <view class="track-info">
            <text class="track-desc">{{ track.desc }}</text>
            <text class="track-time">{{ track.time }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showToast } from '@/utils/toast'

// 物流信息
const logisticsInfo = ref({
  status: '运输中',
  company: '顺丰快递',
  trackingNo: 'SF1234567890123',
  address: {
    name: '张三',
    phone: '13800138000',
    fullAddress: '广东省广州市天河区天河路1号',
  },
  lastTrack: {
    desc: '快件已到达【广州天河集散中心】',
    time: '2024-03-15 14:30:00',
  },
  tracks: [
    {
      desc: '快件已到达【广州天河集散中心】',
      time: '2024-03-15 14:30:00',
    },
    {
      desc: '快件已从【广州白云仓】发出',
      time: '2024-03-15 10:20:00',
    },
    {
      desc: '快件已到达【广州白云仓】',
      time: '2024-03-15 08:15:00',
    },
    {
      desc: '快件已揽收',
      time: '2024-03-15 06:30:00',
    },
    {
      desc: '商家已发货',
      time: '2024-03-14 18:00:00',
    },
  ],
})

// 复制运单号
const copyTrackingNo = () => {
  uni.setClipboardData({
    data: logisticsInfo.value.trackingNo,
    success: () => {
      showToast('复制成功')
    },
  })
}

// 页面加载
onMounted(async () => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const { id } = currentPage?.options || {}

  if (id) {
    try {
      // TODO: 调用获取物流信息接口
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // 模拟数据已经在 logisticsInfo 中
    } catch (error) {
      showToast('加载失败')
    }
  }
})
</script>

<style lang="scss">
.logistics {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.status-section {
  position: relative;
  height: 200rpx;
  padding: 40rpx;
  color: #fff;
  background: linear-gradient(to right, #4a90e2, #87c4ff);

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
      display: block;
      margin-bottom: 8rpx;
      font-size: 26rpx;
      opacity: 0.9;
    }

    .status-time {
      font-size: 24rpx;
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

.package-section {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;

  .package-header {
    padding: 30rpx;
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    border-bottom: 1rpx solid #eee;
  }

  .package-content {
    padding: 20rpx 30rpx;

    .info-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10rpx 0;
      font-size: 26rpx;
      color: #666;

      .copy-wrapper {
        display: flex;
        align-items: center;

        .copy-btn {
          margin-left: 20rpx;
          color: #4a90e2;
        }
      }
    }
  }
}

.track-section {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;

  .track-header {
    padding: 30rpx;
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    border-bottom: 1rpx solid #eee;
  }

  .track-list {
    padding: 30rpx;

    .track-item {
      position: relative;
      padding-left: 30rpx;
      margin-bottom: 40rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .track-dot {
        position: absolute;
        top: 6rpx;
        left: 0;
        width: 16rpx;
        height: 16rpx;
        background-color: #ddd;
        border-radius: 50%;
      }

      .track-line {
        position: absolute;
        top: 22rpx;
        left: 7rpx;
        width: 2rpx;
        height: calc(100% + 24rpx);
        background-color: #eee;
      }

      .track-info {
        .track-desc {
          display: block;
          margin-bottom: 8rpx;
          font-size: 26rpx;
          color: #666;
        }

        .track-time {
          font-size: 24rpx;
          color: #999;
        }
      }

      &.active {
        .track-dot {
          left: -2rpx;
          width: 20rpx;
          height: 20rpx;
          background-color: #4a90e2;
          border: 4rpx solid rgba(74, 144, 226, 0.2);
        }

        .track-info {
          .track-desc {
            font-weight: bold;
            color: #333;
          }

          .track-time {
            color: #666;
          }
        }
      }
    }
  }
}
</style>
