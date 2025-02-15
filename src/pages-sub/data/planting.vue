<template>
  <view class="planting-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <wd-input
        v-model="searchKeyword"
        placeholder="搜索农产品"
        prefix-icon="search"
        clearable
        @click-input="handleSearch"
        @enter="handleSearch"
      />
    </view>

    <!-- 统计概览 -->
    <view class="overview-section">
      <view class="overview-card">
        <text class="label">全国总种植面积</text>
        <text class="value">{{ overview.totalArea }}万亩</text>
        <text class="change" :class="overview.areaChange >= 0 ? 'up' : 'down'">
          同比{{ overview.areaChange >= 0 ? '增长' : '下降' }}{{ Math.abs(overview.areaChange) }}%
        </text>
      </view>
      <view class="overview-grid">
        <view class="grid-item">
          <text class="label">主产区数量</text>
          <text class="value">{{ overview.regionCount }}个</text>
        </view>
        <view class="grid-item">
          <text class="label">平均亩产</text>
          <text class="value">{{ overview.averageYield }}kg</text>
        </view>
        <view class="grid-item">
          <text class="label">预计产量</text>
          <text class="value">{{ overview.estimatedOutput }}万吨</text>
        </view>
        <view class="grid-item">
          <text class="label">种植农户</text>
          <text class="value">{{ overview.farmerCount }}万户</text>
        </view>
      </view>
    </view>

    <!-- 主产区分布 -->
    <view class="region-section">
      <view class="section-header">
        <text class="title">主产区分布</text>
        <view class="year-selector">
          <text
            v-for="year in years"
            :key="year"
            :class="['year-item', activeYear === year ? 'active' : '']"
            @click="handleYearChange(year)"
          >
            {{ year }}年
          </text>
        </view>
      </view>
      <view class="map-container">
        <!-- TODO: 集成地图组件 -->
        <view class="map-placeholder">
          <text>主产区分布地图</text>
        </view>
      </view>
    </view>

    <!-- 种植数据 -->
    <view class="data-section">
      <view class="section-header">
        <text class="title">种植数据</text>
      </view>
      <view class="data-list">
        <view class="data-item" v-for="item in plantingData" :key="item.id">
          <view class="region-info">
            <text class="region-name">{{ item.region }}</text>
            <text class="area-value">{{ item.area }}万亩</text>
          </view>
          <view class="progress-bar">
            <view class="progress" :style="{ width: item.percentage + '%' }"></view>
          </view>
          <view class="detail-info">
            <text class="yield">亩产：{{ item.yield }}kg</text>
            <text class="trend" :class="item.trend">
              {{ item.trend === 'up' ? '↑' : '↓' }} {{ item.changeRate }}%
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 搜索关键词
const searchKeyword = ref('')

// 年份选择
const years = [2024, 2023, 2022, 2021, 2020]
const activeYear = ref(2024)

// 统计概览
const overview = ref({
  totalArea: 1580,
  areaChange: 5.8,
  regionCount: 12,
  averageYield: 450,
  estimatedOutput: 720,
  farmerCount: 168,
})

// 种植数据
const plantingData = ref([
  {
    id: 1,
    region: '山东省',
    area: 320,
    percentage: 85,
    yield: 480,
    trend: 'up',
    changeRate: 6.5,
  },
  {
    id: 2,
    region: '河北省',
    area: 280,
    percentage: 75,
    yield: 460,
    trend: 'up',
    changeRate: 4.2,
  },
  {
    id: 3,
    region: '河南省',
    area: 260,
    percentage: 70,
    yield: 440,
    trend: 'down',
    changeRate: 2.1,
  },
])

// 处理搜索
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    uni.showToast({
      title: '请输入搜索关键词',
      icon: 'none',
    })
  }
  // TODO: 实现搜索功能
}

// 处理年份切换
const handleYearChange = (year: number) => {
  activeYear.value = year
  // TODO: 更新地图和数据
}
</script>

<style lang="scss">
.planting-page {
  min-height: 100vh;
  padding-bottom: env(safe-area-inset-bottom);
  background-color: #f8f8f8;
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 20rpx;
  background-color: #fff;
}

.overview-section {
  padding: 30rpx;
  margin-bottom: 20rpx;
  background-color: #fff;

  .overview-card {
    margin-bottom: 30rpx;
    text-align: center;

    .label {
      display: block;
      margin-bottom: 16rpx;
      font-size: 28rpx;
      color: #666;
    }

    .value {
      display: block;
      margin-bottom: 16rpx;
      font-size: 48rpx;
      font-weight: bold;
      color: #333;
    }

    .change {
      padding: 4rpx 16rpx;
      font-size: 26rpx;
      border-radius: 100rpx;

      &.up {
        color: #ff6b6b;
        background-color: #fff2f2;
      }

      &.down {
        color: #018d71;
        background-color: #e6f7f3;
      }
    }
  }

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;

    .grid-item {
      padding: 20rpx;
      text-align: center;
      background-color: #f8f8f8;
      border-radius: 12rpx;

      .label {
        display: block;
        margin-bottom: 8rpx;
        font-size: 24rpx;
        color: #666;
      }

      .value {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
    }
  }
}

.region-section {
  padding: 30rpx;
  margin-bottom: 20rpx;
  background-color: #fff;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20rpx;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .year-selector {
      display: flex;

      .year-item {
        padding: 8rpx 20rpx;
        margin-left: 16rpx;
        font-size: 24rpx;
        color: #666;
        background-color: #f5f5f5;
        border-radius: 100rpx;

        &.active {
          color: #018d71;
          background-color: #e6f7f3;
        }
      }
    }
  }

  .map-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 500rpx;
    font-size: 28rpx;
    color: #999;
    background-color: #f8f8f8;
    border-radius: 12rpx;
  }
}

.data-section {
  padding: 30rpx;
  background-color: #fff;

  .section-header {
    margin-bottom: 20rpx;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .data-list {
    .data-item {
      margin-bottom: 30rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .region-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12rpx;

        .region-name {
          font-size: 28rpx;
          font-weight: bold;
          color: #333;
        }

        .area-value {
          font-size: 28rpx;
          color: #666;
        }
      }

      .progress-bar {
        height: 20rpx;
        margin-bottom: 8rpx;
        overflow: hidden;
        background-color: #f5f5f5;
        border-radius: 10rpx;

        .progress {
          height: 100%;
          background-color: #018d71;
          border-radius: 10rpx;
          transition: width 0.3s ease;
        }
      }

      .detail-info {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .yield {
          font-size: 24rpx;
          color: #666;
        }

        .trend {
          font-size: 24rpx;
          font-weight: bold;

          &.up {
            color: #ff6b6b;
          }

          &.down {
            color: #018d71;
          }
        }
      }
    }
  }
}
</style>
