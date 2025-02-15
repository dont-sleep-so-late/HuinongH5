<template>
  <view class="farm-page">
    <!-- 农场信息 -->
    <view class="farm-header">
      <view class="farm-info">
        <image class="farm-image" src="/static/images/farm-bg.png" mode="aspectFill" />
        <view class="info-content">
          <view class="farm-name">
            <text class="name">{{ farmInfo.name || '我的小农场' }}</text>
            <text class="level">Lv.{{ farmInfo.level || 1 }}</text>
          </view>
          <view class="farm-assets">
            <view class="asset-item">
              <text class="icon">💰</text>
              <text class="value">{{ farmInfo.money }}</text>
            </view>
            <view class="asset-item">
              <text class="icon">🌟</text>
              <text class="value">{{ farmInfo.points }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 农田九宫格 -->
    <view class="farm-land">
      <view class="land-grid">
        <view
          v-for="(plot, index) in farmPlots"
          :key="index"
          class="land-plot"
          :class="[plot.status]"
          @click="handlePlotClick(plot)"
        >
          <block v-if="plot.crop">
            <image :src="plot.crop.image" mode="aspectFit" class="crop-image" />
            <view class="plot-info">
              <text class="crop-name">{{ plot.crop.name }}</text>
              <text class="status-text">{{ getStatusText(plot.status) }}</text>
              <view class="progress-bar" v-if="plot.status === 'growing'">
                <view class="progress-inner" :style="{ width: `${plot.growthProgress}%` }"></view>
              </view>
            </view>
          </block>
          <block v-else>
            <text class="empty-text">空地</text>
          </block>
        </view>
      </view>
    </view>

    <!-- 工具栏 -->
    <view class="farm-tools">
      <view
        v-for="(tool, index) in tools"
        :key="index"
        class="tool-item"
        @click="handleToolAction(tool)"
      >
        <image :src="tool.icon" mode="aspectFit" class="tool-icon" />
        <text class="tool-name">{{ tool.name }}</text>
        <view class="tool-count" v-if="tool.count !== undefined">
          <text>{{ tool.count }}</text>
        </view>
      </view>
    </view>

    <!-- 种子商店弹窗 -->
    <wd-popup v-model="showSeedShop" position="bottom">
      <view class="seed-shop">
        <view class="shop-header">
          <text class="title">种子商店</text>
          <text class="close" @click="showSeedShop = false">×</text>
        </view>
        <view class="seed-list">
          <view v-for="seed in seeds" :key="seed.id" class="seed-item" @click="handleBuySeed(seed)">
            <image :src="seed.image" mode="aspectFit" class="seed-image" />
            <view class="seed-info">
              <text class="seed-name">{{ seed.name }}</text>
              <view class="seed-meta">
                <text class="grow-time">生长期: {{ seed.growthTime }}分钟</text>
                <text class="price">💰{{ seed.price }}</text>
              </view>
              <text class="yield">
                产量: {{ seed.minYield }}-{{ seed.maxYield }}{{ seed.unit }}
              </text>
            </view>
            <wd-button size="small" type="primary" :disabled="farmInfo.money < seed.price">
              购买
            </wd-button>
          </view>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { showToast } from '@/utils/toast'
/// <reference types="@dcloudio/types" />

// 农场信息
const farmInfo = ref({
  name: '我的小农场',
  level: 1,
  money: 1000, // 初始资金
  points: 0,
})

// 土地状态
type PlotStatus = 'empty' | 'growing' | 'ready' | 'withered'

// 土地数据
const farmPlots = ref(
  Array(9)
    .fill(null)
    .map((_, index) => ({
      id: index + 1,
      status: 'empty' as PlotStatus,
      crop: null,
      plantTime: null,
      growthProgress: 0,
      needWater: false,
      needFertilizer: false,
      hasWeed: false,
    })),
)

// 工具数据
const tools = ref([
  {
    id: 1,
    name: '种子',
    icon: '/static/tools/seed.png',
    action: 'openSeedShop',
  },
  {
    id: 2,
    name: '水壶',
    icon: '/static/tools/water.png',
    count: 10,
  },
  {
    id: 3,
    name: '化肥',
    icon: '/static/tools/fertilizer.png',
    count: 5,
  },
  {
    id: 4,
    name: '除草剂',
    icon: '/static/tools/herbicide.png',
    count: 3,
  },
])

// 种子商店
const showSeedShop = ref(false)
const seeds = ref([
  {
    id: 1,
    name: '白菜',
    image: '/static/crops/cabbage.png',
    price: 100,
    growthTime: 10,
    minYield: 3,
    maxYield: 5,
    unit: '颗',
    sellPrice: 50,
  },
  {
    id: 2,
    name: '胡萝卜',
    image: '/static/crops/carrot.png',
    price: 150,
    growthTime: 15,
    minYield: 4,
    maxYield: 6,
    unit: '根',
    sellPrice: 80,
  },
  {
    id: 3,
    name: '玉米',
    image: '/static/crops/corn.png',
    price: 200,
    growthTime: 20,
    minYield: 2,
    maxYield: 4,
    unit: '穗',
    sellPrice: 120,
  },
])

// 获取状态文本
const getStatusText = (status: PlotStatus) => {
  const statusMap = {
    empty: '空地',
    growing: '生长中',
    ready: '可收获',
    withered: '已枯萎',
  }
  return statusMap[status]
}

// 处理土地点击
const handlePlotClick = (plot: any) => {
  if (plot.status === 'empty') {
    showSeedShop.value = true
    selectedPlot.value = plot
  } else if (plot.status === 'ready') {
    harvestCrop(plot)
  } else if (plot.status === 'withered') {
    clearPlot(plot)
  }
}

// 处理工具使用
const handleToolAction = (tool: any) => {
  if (tool.action === 'openSeedShop') {
    showSeedShop.value = true
    return
  }

  if (tool.count <= 0) {
    showToast('工具数量不足')
    return
  }

  // TODO: 实现工具使用逻辑
  showToast('使用成功')
  tool.count--
}

// 选中的土地
const selectedPlot = ref(null)

// 购买种子
const handleBuySeed = (seed: any) => {
  if (!selectedPlot.value) {
    showToast('请先选择要种植的土地')
    return
  }

  if (farmInfo.value.money < seed.price) {
    showToast('金币不足')
    return
  }

  // 扣除金币
  farmInfo.value.money -= seed.price

  // 种植作物
  const plot = selectedPlot.value
  plot.crop = seed
  plot.status = 'growing'
  plot.plantTime = Date.now()
  plot.growthProgress = 0
  plot.needWater = false
  plot.needFertilizer = false
  plot.hasWeed = false

  showSeedShop.value = false
  showToast('种植成功')

  // 启动生长计时器
  startGrowthTimer(plot)
}

// 收获作物
const harvestCrop = (plot: any) => {
  const crop = plot.crop
  const cropYield = Math.floor(Math.random() * (crop.maxYield - crop.minYield + 1)) + crop.minYield
  const earnings = cropYield * crop.sellPrice

  farmInfo.value.money += earnings
  farmInfo.value.points += Math.floor(earnings / 10)

  showToast(`收获了 ${cropYield}${crop.unit}${crop.name}，获得 ${earnings} 金币`)

  // 清空土地
  plot.crop = null
  plot.status = 'empty'
  plot.plantTime = null
  plot.growthProgress = 0
}

// 清理土地
const clearPlot = (plot: any) => {
  plot.crop = null
  plot.status = 'empty'
  plot.plantTime = null
  plot.growthProgress = 0
  showToast('土地已清理')
}

// 生长计时器
const growthTimers: any = {}

const startGrowthTimer = (plot: any) => {
  const timerId = setInterval(() => {
    if (plot.status !== 'growing') {
      clearInterval(timerId)
      return
    }

    // 随机生成需要照料的状态
    if (Math.random() < 0.1) plot.needWater = true
    if (Math.random() < 0.05) plot.needFertilizer = true
    if (Math.random() < 0.08) plot.hasWeed = true

    // 检查是否需要照料
    if (plot.needWater || plot.needFertilizer || plot.hasWeed) {
      // 生长停滞
      return
    }

    // 更新生长进度
    plot.growthProgress += 100 / (plot.crop.growthTime * 60) // 每秒更新

    // 检查是否生长完成
    if (plot.growthProgress >= 100) {
      plot.status = 'ready'
      plot.growthProgress = 100
      clearInterval(timerId)
    }
  }, 1000)

  growthTimers[plot.id] = timerId
}

// 组件卸载时清理定时器
onUnmounted(() => {
  Object.values(growthTimers).forEach((timer: any) => clearInterval(timer))
})

// 页面加载
onMounted(() => {
  // TODO: 从后端加载农场数据
})
</script>

<style lang="scss">
.farm-page {
  min-height: 100vh;
  padding-bottom: env(safe-area-inset-bottom);
  background-color: #f8f8f8;
}

.farm-header {
  padding: 40rpx 30rpx;
  margin-bottom: 20rpx;
  background-color: #018d71;
  border-bottom-right-radius: 40rpx;
  border-bottom-left-radius: 40rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

  .farm-info {
    position: relative;
    height: 240rpx;
    overflow: hidden;
    background: linear-gradient(45deg, #02a884, #018d71);
    border-radius: 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);

    .farm-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.2;
    }

    .info-content {
      position: relative;
      z-index: 1;
      padding: 40rpx;

      .farm-name {
        display: flex;
        align-items: center;
        margin-bottom: 40rpx;

        .name {
          margin-right: 20rpx;
          font-size: 44rpx;
          font-weight: bold;
          color: #fff;
          text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
        }

        .level {
          padding: 8rpx 24rpx;
          font-size: 28rpx;
          color: #fff;
          background-color: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 100rpx;
        }
      }

      .farm-assets {
        display: flex;
        gap: 30rpx;

        .asset-item {
          display: flex;
          align-items: center;
          padding: 12rpx 24rpx;
          background-color: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: 100rpx;

          .icon {
            margin-right: 12rpx;
            font-size: 32rpx;
          }

          .value {
            font-size: 32rpx;
            font-weight: bold;
            color: #fff;
            text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
          }
        }
      }
    }
  }
}

.farm-land {
  padding: 30rpx;
  margin-bottom: 140rpx;

  .land-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30rpx;

    .land-plot {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1;
      overflow: hidden;
      background: linear-gradient(135deg, #98fb98, #90ee90);
      border-radius: 24rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.95);
      }

      &.growing {
        background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
      }

      &.ready {
        background: linear-gradient(135deg, #fff9c4, #fff59d);
        animation: pulse 2s infinite;
      }

      &.withered {
        background: linear-gradient(135deg, #ffebee, #ffcdd2);
      }

      .crop-image {
        width: 75%;
        height: 75%;
        object-fit: contain;
        filter: drop-shadow(0 4rpx 8rpx rgba(0, 0, 0, 0.2));
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.05);
        }
      }

      .plot-info {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        padding: 16rpx;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(10px);

        .crop-name {
          margin-bottom: 6rpx;
          font-size: 26rpx;
          font-weight: bold;
          color: #fff;
        }

        .status-text {
          font-size: 22rpx;
          color: rgba(255, 255, 255, 0.9);
        }

        .progress-bar {
          height: 6rpx;
          margin-top: 8rpx;
          overflow: hidden;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 3rpx;

          .progress-inner {
            height: 100%;
            background: linear-gradient(90deg, #4caf50, #81c784);
            border-radius: 3rpx;
            transition: width 0.3s ease;
          }
        }
      }

      .empty-text {
        font-size: 28rpx;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.4);
      }
    }
  }
}

.farm-tools {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: space-around;
  padding: 20rpx 30rpx calc(20rpx + env(safe-area-inset-bottom));
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1rpx solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);

  .tool-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12rpx 24rpx;
    border-radius: 16rpx;
    transition: all 0.3s ease;

    &:active {
      background-color: rgba(0, 0, 0, 0.05);
      transform: scale(0.95);
    }

    .tool-icon {
      width: 88rpx;
      height: 88rpx;
      margin-bottom: 12rpx;
      filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.1));
    }

    .tool-name {
      font-size: 26rpx;
      font-weight: 500;
      color: #333;
    }

    .tool-count {
      position: absolute;
      top: -6rpx;
      right: -6rpx;
      min-width: 36rpx;
      height: 36rpx;
      padding: 0 10rpx;
      font-size: 22rpx;
      line-height: 36rpx;
      color: #fff;
      text-align: center;
      background: linear-gradient(45deg, #ff6b6b, #ff8787);
      border-radius: 18rpx;
      box-shadow: 0 2rpx 6rpx rgba(255, 107, 107, 0.3);
    }
  }
}

.seed-shop {
  overflow: hidden;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;

  .shop-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    background-color: #f8f8f8;
    border-bottom: 1rpx solid #eee;

    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }

    .close {
      width: 60rpx;
      height: 60rpx;
      font-size: 44rpx;
      line-height: 60rpx;
      color: #999;
      text-align: center;
      border-radius: 30rpx;
      transition: all 0.3s ease;

      &:active {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
  }

  .seed-list {
    max-height: 65vh;
    padding: 20rpx;
    overflow-y: auto;

    .seed-item {
      display: flex;
      align-items: center;
      padding: 24rpx;
      margin-bottom: 20rpx;
      background-color: #fff;
      border-radius: 16rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

      &:last-child {
        margin-bottom: 0;
      }

      .seed-image {
        width: 120rpx;
        height: 120rpx;
        padding: 16rpx;
        margin-right: 24rpx;
        object-fit: contain;
        background-color: #f8f8f8;
        border-radius: 12rpx;
      }

      .seed-info {
        flex: 1;

        .seed-name {
          margin-bottom: 12rpx;
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
        }

        .seed-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12rpx;

          .grow-time,
          .price {
            font-size: 26rpx;
            color: #666;
          }

          .price {
            font-weight: bold;
            color: #ff6b6b;
          }
        }

        .yield {
          display: inline-block;
          padding: 6rpx 16rpx;
          font-size: 26rpx;
          color: #666;
          background-color: #f8f8f8;
          border-radius: 100rpx;
        }
      }

      .wd-button {
        margin-left: 24rpx;

        &--disabled {
          opacity: 0.5;
        }
      }
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 235, 59, 0.4);
  }
  70% {
    box-shadow: 0 0 0 20rpx rgba(255, 235, 59, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 235, 59, 0);
  }
}
</style>
