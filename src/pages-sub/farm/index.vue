<template>
  <view class="farm-page">
    <!-- 农场信息 -->
    <view class="farm-info">
      <view class="user-info">
        <image :src="farmInfo.avatar" mode="aspectFill" class="avatar" />
        <view class="info-content">
          <text class="nickname">{{ farmInfo.nickname }}</text>
          <text class="level">Lv.{{ farmInfo.level }}</text>
        </view>
      </view>
      <view class="farm-stats">
        <view class="stat-item">
          <text class="value">{{ farmInfo.harvestCount }}</text>
          <text class="label">收获次数</text>
        </view>
        <view class="stat-item">
          <text class="value">{{ farmInfo.experience }}/{{ farmInfo.nextLevelExperience }}</text>
          <text class="label">经验值</text>
        </view>
      </view>
    </view>

    <!-- 农场土地 -->
    <view class="farm-land">
      <view class="land-grid">
        <view
          class="land-plot"
          v-for="plot in farmPlots"
          :key="plot.id"
          @click="handlePlotClick(plot)"
        >
          <image
            :src="plot.cropImage"
            mode="aspectFit"
            class="crop-image"
            v-if="plot.status !== 'empty'"
          />
          <view class="plot-info" :class="plot.status">
            <text class="crop-name" v-if="plot.cropName">{{ plot.cropName }}</text>
            <text class="status-text">{{ getStatusText(plot.status) }}</text>
            <view class="progress-bar" v-if="plot.status === 'growing'">
              <view class="progress" :style="{ width: plot.progress + '%' }"></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-buttons">
        <wd-button type="primary" @click="waterAll">浇水</wd-button>
        <wd-button type="warning" @click="fertilizeAll">施肥</wd-button>
      </view>
    </view>

    <!-- 种子选择弹窗 -->
    <wd-popup v-model="showSeedPopup" position="bottom">
      <view class="seed-popup">
        <view class="popup-header">
          <text class="title">选择种子</text>
          <wd-icon name="close" size="20" @click="showSeedPopup = false" />
        </view>
        <view class="seed-list">
          <view
            class="seed-item"
            v-for="seed in seedList"
            :key="seed.id"
            @click="handleSeedSelect(seed)"
          >
            <image :src="seed.image" mode="aspectFit" class="seed-image" />
            <view class="seed-info">
              <text class="seed-name">{{ seed.name }}</text>
              <text class="grow-time">生长周期：{{ seed.growDays }}天</text>
              <text class="yield">预计产量：{{ seed.yield }}{{ seed.unit }}</text>
            </view>
          </view>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
/// <reference types="@dcloudio/types" />

// 农场信息
const farmInfo = ref({
  avatar: '/static/avatar/default.png',
  nickname: '张三',
  level: 5,
  experience: 2580,
  nextLevelExperience: 5000,
  harvestCount: 28,
})

// 农场地块数据
const farmPlots = ref([
  {
    id: 1,
    status: 'growing', // empty, growing, ready, withered
    cropName: '小白菜',
    cropImage: '/static/crops/cabbage.png',
    progress: 65,
    plantTime: '2024-01-10',
    harvestTime: '2024-01-15',
  },
  {
    id: 2,
    status: 'ready',
    cropName: '胡萝卜',
    cropImage: '/static/crops/carrot.png',
    progress: 100,
    plantTime: '2024-01-08',
    harvestTime: '2024-01-12',
  },
  {
    id: 3,
    status: 'empty',
  },
  // ... 更多地块
])

// 种子列表
const seedList = ref([
  {
    id: 1,
    name: '小白菜',
    image: '/static/seeds/cabbage.png',
    growDays: 5,
    yield: '2-3',
    unit: '斤',
  },
  {
    id: 2,
    name: '胡萝卜',
    image: '/static/seeds/carrot.png',
    growDays: 7,
    yield: '3-4',
    unit: '斤',
  },
  {
    id: 3,
    name: '西红柿',
    image: '/static/seeds/tomato.png',
    growDays: 10,
    yield: '4-5',
    unit: '斤',
  },
])

// 种子选择弹窗
const showSeedPopup = ref(false)
const selectedPlot = ref<any>(null)

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    empty: '空地',
    growing: '生长中',
    ready: '可收获',
    withered: '已枯萎',
  }
  return statusMap[status] || status
}

// 处理地块点击
const handlePlotClick = (plot: any) => {
  switch (plot.status) {
    case 'empty':
      selectedPlot.value = plot
      showSeedPopup.value = true
      break
    case 'ready':
      harvestCrop(plot)
      break
    case 'withered':
      clearPlot(plot)
      break
  }
}

// 显示种子列表
const showSeedList = () => {
  showSeedPopup.value = true
}

// 选择种子
const handleSeedSelect = (seed: any) => {
  if (selectedPlot.value) {
    plantSeed(selectedPlot.value, seed)
  }
  showSeedPopup.value = false
}

// 种植种子
const plantSeed = (plot: any, seed: any) => {
  // TODO: 调用后端API进行种植
  uni.showToast({
    title: '种植成功',
    icon: 'success',
  })
}

// 收获作物
const harvestCrop = (plot: any) => {
  // TODO: 调用后端API进行收获
  uni.showToast({
    title: '收获成功',
    icon: 'success',
  })
}

// 清理地块
const clearPlot = (plot: any) => {
  // TODO: 调用后端API清理地块
  uni.showToast({
    title: '清理成功',
    icon: 'success',
  })
}

// 浇水
const waterAll = () => {
  // TODO: 调用后端API进行浇水
  uni.showToast({
    title: '浇水成功',
    icon: 'success',
  })
}

// 施肥
const fertilizeAll = () => {
  // TODO: 调用后端API进行施肥
  uni.showToast({
    title: '施肥成功',
    icon: 'success',
  })
}
</script>

<style lang="scss">
.farm-page {
  min-height: 100vh;
  padding-bottom: 120rpx;
  background-color: #f8f8f8;
}

.farm-info {
  padding: 30rpx;
  margin-bottom: 20rpx;
  background-color: #fff;

  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .avatar {
      width: 100rpx;
      height: 100rpx;
      margin-right: 20rpx;
      border-radius: 50rpx;
    }

    .info-content {
      flex: 1;

      .nickname {
        margin-bottom: 8rpx;
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .level {
        font-size: 24rpx;
        color: #666;
      }
    }
  }

  .farm-stats {
    display: flex;
    justify-content: space-around;

    .stat-item {
      text-align: center;

      .value {
        margin-bottom: 8rpx;
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }

      .label {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.farm-land {
  height: calc(100vh - 400rpx);
  padding: 20rpx;

  .land-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;

    .land-plot {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
      background-color: #e6d5ac;
      border-radius: 12rpx;
      box-shadow: inset 0 2rpx 4rpx rgba(0, 0, 0, 0.1);

      .crop-image {
        width: 100%;
        height: 100%;
        padding: 20rpx;
        object-fit: contain;
      }

      .plot-info {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        padding: 16rpx;
        background-color: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4rpx);

        .crop-name {
          display: block;
          margin-bottom: 8rpx;
          font-size: 28rpx;
          color: #fff;
        }

        .status-text {
          font-size: 24rpx;
          color: rgba(255, 255, 255, 0.8);
        }

        .progress-bar {
          height: 6rpx;
          margin-top: 8rpx;
          overflow: hidden;
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 3rpx;

          .progress {
            height: 100%;
            background-color: #4cd964;
            transition: width 0.3s ease;
          }
        }

        &.empty {
          background-color: rgba(0, 0, 0, 0.3);
        }

        &.ready {
          background-color: rgba(76, 217, 100, 0.6);
        }

        &.withered {
          background-color: rgba(255, 59, 48, 0.6);
        }
      }
    }
  }
}

.action-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .action-buttons {
    display: flex;
    gap: 20rpx;

    .wd-button {
      flex: 1;
    }
  }
}

.seed-popup {
  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1rpx solid #eee;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .seed-list {
    max-height: 60vh;
    padding: 20rpx;
    overflow-y: auto;

    .seed-item {
      display: flex;
      align-items: center;
      padding: 20rpx;
      border-bottom: 1rpx solid #eee;

      &:last-child {
        border-bottom: none;
      }

      .seed-image {
        width: 100rpx;
        height: 100rpx;
        margin-right: 20rpx;
      }

      .seed-info {
        flex: 1;

        .seed-name {
          margin-bottom: 8rpx;
          font-size: 28rpx;
          font-weight: bold;
          color: #333;
        }

        .grow-time,
        .yield {
          margin-bottom: 4rpx;
          font-size: 24rpx;
          color: #666;
        }
      }
    }
  }
}
</style>
