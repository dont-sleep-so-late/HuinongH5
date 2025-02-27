<template>
  <view class="logistics-container">
    <!-- 头部导航 -->
    <view class="header">
      <view class="nav-back" @click="router.back()">
        <text class="iconfont icon-arrow-left"></text>
      </view>
      <text class="title">物流追踪</text>
    </view>

    <!-- 物流信息卡片 -->
    <view class="logistics-card">
      <view class="company-info">
        <text class="company">{{ logisticsInfo?.logisticsCompany }}</text>
        <text class="number">运单号：{{ logisticsInfo?.logisticsNumber }}</text>
        <text class="copy" @click="handleCopy">复制</text>
      </view>
      <view class="current-info" v-if="logisticsInfo?.currentLocation">
        <text class="location">{{ logisticsInfo.currentLocation.address }}</text>
        <text class="time">{{ formatTime(logisticsInfo.currentLocation.updateTime) }}</text>
      </view>
    </view>

    <!-- 地图容器 -->
    <view class="map-container">
      <map
        id="logistics-map"
        class="map"
        :latitude="mapCenter.latitude"
        :longitude="mapCenter.longitude"
        :markers="markers"
        :polyline="[polyline]"
        :scale="12"
        show-location
      ></map>
    </view>

    <!-- 物流进度 -->
    <scroll-view class="progress-container" scroll-y>
      <view class="progress-list">
        <view
          v-for="(node, index) in logisticsInfo?.nodes"
          :key="index"
          class="progress-item"
          :class="{ active: index === 0 }"
        >
          <view class="time-info">
            <text class="time">{{ formatTime(node.time) }}</text>
          </view>
          <view class="content">
            <view class="dot"></view>
            <view class="line" v-if="index !== logisticsInfo.nodes.length - 1"></view>
            <view class="info">
              <text class="status">{{ node.status }}</text>
              <text class="desc">{{ node.location }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import { getLogisticsInfo } from '@/services/order'
import type { LogisticsInfo, LogisticsNode } from '@/services/order'
import { AMAP_CONFIG, LOGISTICS_MARKER } from '@/config/amap'

const router = useRouter()
const logisticsInfo = ref<LogisticsInfo>()

// 获取页面参数
const orderId = ref<number>()

// 地图中心点
const mapCenter = computed(() => {
  if (logisticsInfo.value?.currentLocation) {
    return {
      latitude: logisticsInfo.value.currentLocation.latitude,
      longitude: logisticsInfo.value.currentLocation.longitude,
    }
  }
  // 默认中心点（广州）
  return {
    latitude: 23.12908,
    longitude: 113.264385,
  }
})

// 标记点
const markers = computed(() => {
  if (!logisticsInfo.value?.nodes) return []

  return logisticsInfo.value.nodes
    .filter((node) => node.coordinates)
    .map((node, index) => ({
      id: index,
      latitude: node.coordinates!.latitude,
      longitude: node.coordinates!.longitude,
      ...LOGISTICS_MARKER[index === 0 ? 'current' : 'history'],
    }))
})

// 路线
const polyline = computed(() => {
  if (!logisticsInfo.value?.nodes) return { points: [] }

  const points = logisticsInfo.value.nodes
    .filter((node) => node.coordinates)
    .map((node) => ({
      latitude: node.coordinates!.latitude,
      longitude: node.coordinates!.longitude,
    }))

  return {
    points,
    color: '#018d71',
    width: 4,
    arrowLine: true,
  }
})

// 格式化时间
const formatTime = (time: string) => {
  const date = new Date(time)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

// 复制运单号
const handleCopy = () => {
  if (!logisticsInfo.value?.logisticsNumber) return
  uni.setClipboardData({
    data: logisticsInfo.value.logisticsNumber,
    success: () => {
      showToast('复制成功')
    },
  })
}

// 获取物流信息
const getLogistics = async () => {
  try {
    if (!orderId.value) return
    const res = await getLogisticsInfo(orderId.value)
    logisticsInfo.value = res.data
  } catch (error: any) {
    showToast(error.message || '获取物流信息失败')
  }
}

// 页面加载
onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const { id } = currentPage?.options || {}

  if (id) {
    orderId.value = Number(id)
    getLogistics()
  }
})
</script>

<style lang="scss">
.logistics-container {
  min-height: 100vh;
  background-color: #f8f8f8;

  .header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    background-color: #fff;
    border-bottom: 1px solid #f5f5f5;

    .nav-back {
      position: absolute;
      left: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 88rpx;
      height: 88rpx;
      margin-left: -32rpx;

      .iconfont {
        font-size: 40rpx;
        color: #333;
      }
    }

    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .logistics-card {
    padding: 32rpx;
    margin: 20rpx;
    background-color: #fff;
    border-radius: 16rpx;

    .company-info {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;

      .company {
        margin-right: 20rpx;
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .number {
        flex: 1;
        font-size: 28rpx;
        color: #666;
      }

      .copy {
        padding: 8rpx 20rpx;
        font-size: 24rpx;
        color: #018d71;
        background-color: rgba(1, 141, 113, 0.1);
        border-radius: 24rpx;
      }
    }

    .current-info {
      display: flex;
      flex-direction: column;

      .location {
        margin-bottom: 8rpx;
        font-size: 28rpx;
        color: #333;
      }

      .time {
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .map-container {
    margin: 0 20rpx;
    overflow: hidden;
    background-color: #fff;
    border-radius: 16rpx;

    .map {
      width: 100%;
      height: 400rpx;
    }
  }

  .progress-container {
    height: calc(100vh - 88rpx - 240rpx - 440rpx);
    padding: 32rpx;
    margin: 20rpx;
    overflow: hidden;
    background-color: #fff;
    border-radius: 16rpx;

    .progress-list {
      .progress-item {
        display: flex;
        margin-bottom: 32rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .time-info {
          width: 120rpx;
          margin-right: 32rpx;
          font-size: 24rpx;
          color: #999;
          text-align: right;
        }

        .content {
          position: relative;
          flex: 1;
          padding-left: 30rpx;

          .dot {
            position: absolute;
            top: 8rpx;
            left: 0;
            width: 16rpx;
            height: 16rpx;
            background-color: #999;
            border-radius: 50%;
          }

          .line {
            position: absolute;
            top: 24rpx;
            left: 7rpx;
            width: 2rpx;
            height: calc(100% + 16rpx);
            background-color: #eee;
          }

          .info {
            .status {
              display: block;
              margin-bottom: 8rpx;
              font-size: 28rpx;
              color: #333;
            }

            .desc {
              font-size: 24rpx;
              color: #666;
            }
          }
        }

        &.active {
          .time-info {
            color: #018d71;
          }

          .content {
            .dot {
              background-color: #018d71;
            }

            .status {
              color: #018d71;
            }
          }
        }
      }
    }
  }
}
</style>
