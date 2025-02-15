<template>
  <view class="detail-page">
    <!-- 标题栏 -->
    <view class="header">
      <text class="title">{{ productInfo.name }}</text>
    </view>

    <!-- 价格概览 -->
    <view class="price-overview">
      <view class="price-item">
        <text class="label">7日均价</text>
        <text class="value price">{{ productInfo.averagePrice }}</text>
      </view>
      <view class="price-item">
        <text class="label">7日最低</text>
        <text class="value price">{{ productInfo.lowestPrice }}</text>
        <text class="date">{{ productInfo.lowestDate }}</text>
      </view>
      <view class="price-item">
        <text class="label">7日最高</text>
        <text class="value price">{{ productInfo.highestPrice }}</text>
        <text class="date">{{ productInfo.highestDate }}</text>
      </view>
    </view>

    <!-- 更新时间和单位 -->
    <view class="meta-info">
      <text class="update-time">更新时间 {{ productInfo.updateTime }}</text>
      <text class="unit">单位：{{ productInfo.unit }}</text>
    </view>

    <!-- 近7日预测 -->
    <view class="forecast-section">
      <view class="section-header">
        <text class="title">近7日预测</text>
      </view>
      <view class="forecast-list">
        <view class="forecast-item" v-for="(item, index) in forecastList" :key="index">
          <text class="label">{{ item.label }}:</text>
          <view class="progress-bar">
            <view class="progress" :style="{ width: item.value + '%' }" :class="item.type"></view>
          </view>
          <text class="value">{{ item.value }}%</text>
        </view>
      </view>
    </view>

    <!-- 最新行情 -->
    <view class="market-section">
      <view class="section-header">
        <text class="title">最新行情</text>
        <text class="update-time">更新时间 {{ productInfo.updateTime }}</text>
      </view>
      <view class="market-list">
        <view
          class="market-item"
          v-for="item in marketList"
          :key="item.id"
          @click="navigateToDetail(item)"
        >
          <view class="item-header">
            <text class="name">{{ item.name }}</text>
            <view class="tag hot" v-if="item.isHot">热门品种</view>
          </view>
          <view class="item-content">
            <text class="price">{{ item.price }}{{ productInfo.unit }}</text>
            <text class="change" :class="item.change >= 0 ? 'up' : 'down'">
              {{ item.change >= 0 ? '+' : '' }}{{ item.change }}%
            </text>
          </view>
          <wd-icon name="arrow-right" size="16" color="#999" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 商品信息
const productInfo = ref({
  id: 0,
  name: '',
  averagePrice: '6.66',
  lowestPrice: '6.36',
  highestPrice: '6.95',
  lowestDate: '01-07',
  highestDate: '01-06',
  updateTime: '2024-01-12',
  unit: '元/斤',
})

// 预测数据
const forecastList = ref([
  {
    label: '看跌',
    value: 17.2,
    type: 'down',
  },
  {
    label: '看稳',
    value: 45.2,
    type: 'stable',
  },
  {
    label: '看涨',
    value: 77.2,
    type: 'up',
  },
])

// 市场行情数据
const marketList = ref([
  {
    id: 1,
    name: '土鸡蛋',
    price: '6.72',
    change: -7.31,
    isHot: true,
  },
  {
    id: 2,
    name: '绿壳鸡蛋',
    price: '6.85',
    change: -2.21,
    isHot: true,
  },
  {
    id: 3,
    name: '初生蛋',
    price: '6.86',
    change: -0.68,
    isHot: true,
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
    productInfo.value.id = id
    productInfo.value.name = name
  } catch (error) {
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    })
  }
}

// 跳转到详情
const navigateToDetail = (item: any) => {
  uni.navigateTo({
    url: `/pages-sub/data/forecast-detail?id=${item.id}&name=${encodeURIComponent(item.name)}`,
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

.price-overview {
  display: flex;
  padding: 30rpx;
  margin-bottom: 20rpx;
  background-color: #fff;

  .price-item {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;

    &:not(:last-child)::after {
      position: absolute;
      top: 50%;
      right: 0;
      width: 1rpx;
      height: 60%;
      content: '';
      background-color: #eee;
      transform: translateY(-50%);
    }

    .label {
      margin-bottom: 16rpx;
      font-size: 28rpx;
      color: #666;
    }

    .value {
      margin-bottom: 8rpx;
      font-size: 36rpx;
      font-weight: bold;
      color: #333;

      &.price {
        color: #ff6b6b;
      }
    }

    .date {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.meta-info {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  margin-bottom: 20rpx;
  font-size: 24rpx;
  color: #999;
  background-color: #fff;
}

.forecast-section {
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

  .forecast-list {
    .forecast-item {
      display: flex;
      align-items: center;
      margin-bottom: 30rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .label {
        width: 100rpx;
        font-size: 28rpx;
        color: #333;
      }

      .progress-bar {
        flex: 1;
        height: 30rpx;
        margin: 0 20rpx;
        overflow: hidden;
        background-color: #f5f5f5;
        border-radius: 15rpx;

        .progress {
          height: 100%;
          border-radius: 15rpx;
          transition: width 0.3s ease;

          &.down {
            background-color: #018d71;
          }

          &.stable {
            background-color: #4facfe;
          }

          &.up {
            background-color: #ff6b6b;
          }
        }
      }

      .value {
        width: 80rpx;
        font-size: 24rpx;
        color: #666;
        text-align: right;
      }
    }
  }
}

.market-section {
  padding: 30rpx;
  background-color: #fff;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 30rpx;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .update-time {
      font-size: 24rpx;
      color: #999;
    }
  }

  .market-list {
    .market-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #eee;

      &:last-child {
        border-bottom: none;
      }

      .item-header {
        display: flex;
        flex: 1;
        align-items: center;

        .name {
          margin-right: 16rpx;
          font-size: 28rpx;
          color: #333;
        }

        .tag {
          padding: 4rpx 12rpx;
          font-size: 20rpx;
          border-radius: 4rpx;

          &.hot {
            color: #fff;
            background-color: #ff6b6b;
          }
        }
      }

      .item-content {
        margin-right: 20rpx;
        text-align: right;

        .price {
          margin-right: 16rpx;
          font-size: 28rpx;
          font-weight: bold;
          color: #333;
        }

        .change {
          font-size: 24rpx;

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
