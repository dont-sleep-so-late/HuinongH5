<template>
  <view class="detail-page">
    <!-- 标题栏 -->
    <view class="header">
      <text class="title">{{ productInfo.name }}</text>
    </view>

    <!-- 全国均价信息 -->
    <view class="price-info-card">
      <view class="main-price">
        <text class="label">全国平均批发价格</text>
        <text class="price">{{ productInfo.currentPrice }}元/{{ productInfo.unit }}</text>
        <text class="change" :class="productInfo.priceChange >= 0 ? 'up' : 'down'">
          同比{{ productInfo.priceChange >= 0 ? '增长' : '下降'
          }}{{ Math.abs(productInfo.priceChange) }}%
        </text>
      </view>
    </view>

    <!-- 全国地图 -->
    <view class="map-section">
      <view class="map-container">
        <!-- TODO: 集成地图组件 -->
        <view class="map-placeholder">
          <text>全国价格分布地图</text>
        </view>
      </view>
    </view>

    <!-- 市场动态 -->
    <view class="market-dynamics">
      <view class="section-header">
        <text class="title">市场动态</text>
      </view>
      <view class="dynamics-list">
        <view class="dynamic-item">
          <text class="label">上市情况</text>
          <view class="progress-bar">
            <view class="progress" :style="{ width: marketDynamics.marketSupply + '%' }"></view>
          </view>
          <text class="value">逐步减量 {{ marketDynamics.marketSupply }}%</text>
        </view>
        <view class="dynamic-item">
          <text class="label">货源情况</text>
          <view class="progress-bar">
            <view class="progress" :style="{ width: marketDynamics.supply + '%' }"></view>
          </view>
          <text class="value">减少 {{ marketDynamics.supply }}%</text>
        </view>
        <view class="dynamic-item">
          <text class="label">客商积极性</text>
          <view class="progress-bar">
            <view class="progress" :style="{ width: marketDynamics.buyerActivity + '%' }"></view>
          </view>
          <text class="value">高 {{ marketDynamics.buyerActivity }}%</text>
        </view>
        <view class="dynamic-item">
          <text class="label">走货速度</text>
          <view class="progress-bar">
            <view class="progress" :style="{ width: marketDynamics.salesSpeed + '%' }"></view>
          </view>
          <text class="value">稳 {{ marketDynamics.salesSpeed }}%</text>
        </view>
        <view class="dynamic-item">
          <text class="label">后期价格</text>
          <view class="progress-bar">
            <view class="progress" :style="{ width: marketDynamics.futurePriceIndex + '%' }"></view>
          </view>
          <text class="value">看涨 {{ marketDynamics.futurePriceIndex }}%</text>
        </view>
      </view>
    </view>

    <!-- 价格走势 -->
    <view class="price-trend">
      <view class="section-header">
        <text class="title">价格走势</text>
        <view class="time-range">
          <text
            v-for="(item, index) in timeRanges"
            :key="index"
            :class="['range-item', activeTimeRange === item.value ? 'active' : '']"
            @click="handleTimeRangeChange(item.value)"
          >
            {{ item.label }}
          </text>
        </view>
      </view>
      <view class="chart-container">
        <!-- TODO: 集成图表组件 -->
        <view class="chart-placeholder">
          <text>价格走势图表</text>
        </view>
      </view>
    </view>

    <!-- 主产区信息 -->
    <view class="production-areas">
      <view class="section-header">
        <text class="title">主产区信息</text>
      </view>
      <scroll-view scroll-x class="areas-scroll">
        <view class="areas-list">
          <view
            class="area-item"
            v-for="item in productionAreas"
            :key="item.id"
            @click="handleAreaClick(item)"
          >
            <image :src="item.image" mode="aspectFill" class="area-image" />
            <view class="area-info">
              <text class="area-name">{{ item.name }}</text>
              <text class="area-price">¥{{ item.price }}/{{ productInfo.unit }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 时间范围选项
const timeRanges = [
  { label: '7天', value: 7 },
  { label: '30天', value: 30 },
  { label: '90天', value: 90 },
  { label: '180天', value: 180 },
  { label: '1年', value: 365 },
]

// 当前选中的时间范围
const activeTimeRange = ref(7)

// 商品信息
const productInfo = ref({
  id: 0,
  name: '',
  image: '/static/products/default.jpg',
  currentPrice: '8.50',
  unit: '公斤',
  priceChange: -4.35,
  averagePrice: '8.50',
  highestPrice: '9.20',
  lowestPrice: '7.80',
})

// 市场动态指标
const marketDynamics = ref({
  marketSupply: 47, // 上市情况
  supply: 79, // 货源情况
  buyerActivity: 58, // 客商积极性
  salesSpeed: 55, // 走货速度
  futurePriceIndex: 83, // 后期价格指数
})

// 主产区信息
const productionAreas = ref([
  {
    id: 1,
    name: '山东寿光',
    price: '8.2',
    image: '/static/areas/shandong.jpg',
  },
  {
    id: 2,
    name: '河北石家庄',
    price: '8.5',
    image: '/static/areas/hebei.jpg',
  },
  {
    id: 3,
    name: '广东从化',
    price: '8.8',
    image: '/static/areas/guangdong.jpg',
  },
])

// 获取URL参数
const getUrlParam = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const options = currentPage.options
  if (options?.id && options?.name) {
    loadProductDetail(Number(options.id), decodeURIComponent(options.name))
  }
}

// 加载商品详情
const loadProductDetail = async (id: number, name: string) => {
  try {
    // TODO: 调用后端API获取商品详情
    productInfo.value.name = name
  } catch (error) {
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    })
  }
}

// 处理时间范围切换
const handleTimeRangeChange = (days: number) => {
  activeTimeRange.value = days
  // TODO: 更新价格走势图表
}

// 处理产区点击
const handleAreaClick = (area: any) => {
  uni.navigateTo({
    url: `/pages-sub/data/area-detail?id=${area.id}&name=${encodeURIComponent(area.name)}`,
  })
}

// 页面加载
onMounted(() => {
  getUrlParam()
})
</script>

<style lang="scss">
.detail-page {
  min-height: 100vh;
  padding-bottom: env(safe-area-inset-bottom);
  background-color: #f8f8f8;
}

.header {
  padding: 30rpx;
  background-color: #fff;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.price-info-card {
  padding: 30rpx;
  margin-bottom: 20rpx;
  background-color: #fff;

  .main-price {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .label {
      margin-bottom: 16rpx;
      font-size: 28rpx;
      color: #666;
    }

    .price {
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
}

.map-section {
  padding: 30rpx;
  margin-bottom: 20rpx;
  background-color: #fff;

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

.market-dynamics {
  padding: 30rpx;
  margin-bottom: 20rpx;
  background-color: #fff;

  .section-header {
    margin-bottom: 30rpx;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .dynamics-list {
    .dynamic-item {
      margin-bottom: 30rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        display: block;
        margin-bottom: 16rpx;
        font-size: 28rpx;
        color: #333;
      }

      .progress-bar {
        height: 30rpx;
        margin-bottom: 8rpx;
        overflow: hidden;
        background-color: #f5f5f5;
        border-radius: 15rpx;

        .progress {
          height: 100%;
          background-color: #4cd964;
          border-radius: 15rpx;
          transition: width 0.3s ease;
        }
      }

      .value {
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.price-trend {
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

    .time-range {
      display: flex;

      .range-item {
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

  .chart-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 400rpx;
    font-size: 28rpx;
    color: #999;
    background-color: #f8f8f8;
    border-radius: 12rpx;
  }
}

.production-areas {
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

  .areas-scroll {
    .areas-list {
      display: flex;
      padding: 10rpx 0;

      .area-item {
        width: 240rpx;
        margin-right: 30rpx;
        overflow: hidden;
        background-color: #fff;
        border-radius: 12rpx;
        box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

        &:last-child {
          margin-right: 0;
        }

        .area-image {
          width: 240rpx;
          height: 160rpx;
        }

        .area-info {
          padding: 16rpx;

          .area-name {
            display: block;
            margin-bottom: 8rpx;
            font-size: 26rpx;
            color: #333;
          }

          .area-price {
            font-size: 28rpx;
            font-weight: bold;
            color: #ff6b6b;
          }
        }
      }
    }
  }
}
</style>
