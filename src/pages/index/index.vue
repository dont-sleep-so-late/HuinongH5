<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
}
</route>
<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-wrapper">
        <wd-input
          v-model="searchKeyword"
          placeholder="搜索你想要的吧"
          prefix-icon="search"
          clearable
          @click="navigateToSearch"
        />
      </view>
    </view>

    <!-- 轮播图 -->
    <swiper
      class="banner"
      :indicator-dots="true"
      :autoplay="true"
      :interval="3000"
      :duration="1000"
      :indicator-color="'rgba(255, 255, 255, 0.6)'"
      :indicator-active-color="'#018d71'"
    >
      <swiper-item v-for="(item, index) in bannerList" :key="index">
        <image :src="item.image" mode="aspectFill" />
      </swiper-item>
    </swiper>

    <!-- 功能导航 -->
    <view class="nav-section">
      <view class="nav-grid">
        <view class="nav-item" @click="navigateToPrice">
          <view class="icon-wrapper price">
            <wd-icon name="chart-bar" size="40"></wd-icon>
          </view>
          <text>行情价格</text>
          <text class="sub-text">实时掌握</text>
        </view>
        <view class="nav-item" @click="navigateToForecast">
          <view class="icon-wrapper forecast">
            <wd-icon name="barcode" size="40"></wd-icon>
          </view>
          <text>价格预测</text>
          <text class="sub-text">智能分析</text>
        </view>
        <view class="nav-item" @click="navigateToPlanting">
          <view class="icon-wrapper planting">
            <wd-icon name="windows-filled" size="40"></wd-icon>
          </view>
          <text>种植面积</text>
          <text class="sub-text">科学规划</text>
        </view>
        <view class="nav-item" @click="navigateToFarm">
          <view class="icon-wrapper farm">
            <wd-icon name="home" size="40" />
          </view>
          <text>我的农场</text>
          <text class="sub-text">一键管理</text>
        </view>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="goods-section">
      <view class="section-header">
        <text class="title">精选商品</text>
        <text class="more">查看更多</text>
      </view>
      <view class="goods-list">
        <view
          class="goods-item"
          v-for="item in goodsList"
          :key="item.id"
          @click="navigateToDetail(item.id)"
        >
          <image :src="item.image" mode="aspectFill" class="goods-image" />
          <view class="goods-info">
            <text class="goods-name">{{ item.name }}</text>
            <view class="goods-meta">
              <view class="meta-item">
                <wd-icon name="time" size="28" class="meta-icon" />
                <text>{{ item.harvestTime }}成熟</text>
              </view>
              <view class="meta-item">
                <wd-icon name="cart" size="28" class="meta-icon" />
                <text>{{ item.quantity }}件可预订</text>
              </view>
            </view>
            <view class="price-action">
              <view class="price-box">
                <text class="price-symbol">¥</text>
                <text class="price-value">{{ item.price }}</text>
                <text class="price-unit">/斤</text>
              </view>
              <wd-button type="primary" size="small" class="reserve-btn">预定</wd-button>
            </view>
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

// 轮播图数据
const bannerList = ref([
  {
    image: '/static/banner/banner1.jpg',
    url: '/pages/activity/spring',
  },
  {
    image: '/static/banner/banner2.jpg',
    url: '/pages/activity/summer',
  },
])

// 商品列表数据
const goodsList = ref([
  {
    id: 1,
    name: '从化本地火龙果',
    price: 8.9,
    image: '/static/goods/dragon-fruit.jpg',
    harvestTime: '08/20',
    quantity: '1000',
  },
  {
    id: 2,
    name: '湛江龙眼',
    price: 12.8,
    image: '/static/goods/longan.jpg',
    harvestTime: '07/30',
    quantity: '1000',
  },
])

// 页面跳转方法
const navigateToSearch = () => {
  uni.navigateTo({
    url: '/pages-sub/search/index',
  })
}

const navigateToPrice = () => {
  uni.navigateTo({
    url: '/pages-sub/data/price',
  })
}

const navigateToForecast = () => {
  uni.navigateTo({
    url: '/pages-sub/data/forecast',
  })
}

const navigateToPlanting = () => {
  uni.navigateTo({
    url: '/pages-sub/data/planting',
  })
}

const navigateToFarm = () => {
  uni.navigateTo({
    url: '/pages-sub/farm/index',
  })
}

const navigateToDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages-sub/goods/detail?id=${id}`,
  })
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  padding-bottom: 120rpx;
  background-color: #f8f8f8;
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 20rpx;
  background: linear-gradient(to bottom, #018d71, #018d71cc);

  .search-wrapper {
    padding: 6rpx;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  }
}

.banner {
  height: 360rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  border-radius: 0 0 30rpx 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

  image {
    width: 100%;
    height: 100%;
  }
}

.nav-section {
  margin: 20rpx;
  overflow: hidden;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.nav-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 20rpx;

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 25%;
    padding: 20rpx 0;
    transition: transform 0.2s;

    &:active {
      transform: scale(0.95);
    }

    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100rpx;
      height: 100rpx;
      margin-bottom: 16rpx;
      color: #fff;
      border-radius: 30rpx;
      box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-4rpx);
      }

      &.price {
        background: linear-gradient(135deg, #ff6b6b, #ff8787);
      }

      &.forecast {
        background: linear-gradient(135deg, #4facfe, #00f2fe);
      }

      &.planting {
        background: linear-gradient(135deg, #43e97b, #38f9d7);
      }

      &.farm {
        background: linear-gradient(135deg, #fa709a, #fee140);
      }
    }

    text {
      margin-bottom: 4rpx;
      font-size: 28rpx;
      font-weight: 600;
      color: #333;
    }

    .sub-text {
      margin-top: 4rpx;
      font-size: 22rpx;
      color: #999;
    }
  }
}

.goods-section {
  margin: 20rpx;
  overflow: hidden;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx;
    border-bottom: 2rpx solid #f5f5f5;

    .title {
      position: relative;
      padding-left: 24rpx;
      font-size: 32rpx;
      font-weight: bold;
      color: #333;

      &::before {
        position: absolute;
        top: 50%;
        left: 0;
        width: 8rpx;
        height: 32rpx;
        content: '';
        background-color: #018d71;
        border-radius: 4rpx;
        transform: translateY(-50%);
      }
    }

    .more {
      font-size: 26rpx;
      color: #666;
    }
  }
}

.goods-list {
  padding: 20rpx;

  .goods-item {
    display: flex;
    padding: 20rpx;
    margin-bottom: 20rpx;
    background-color: #fff;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    transition: transform 0.2s;

    &:active {
      transform: scale(0.98);
    }

    .goods-image {
      width: 220rpx;
      height: 220rpx;
      margin-right: 24rpx;
      border-radius: 12rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
    }

    .goods-info {
      display: flex;
      flex: 1;
      flex-direction: column;

      .goods-name {
        margin-bottom: 16rpx;
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }

      .goods-meta {
        display: flex;
        flex-direction: column;
        gap: 12rpx;
        margin-bottom: 20rpx;

        .meta-item {
          display: flex;
          align-items: center;
          font-size: 24rpx;
          color: #666;

          .meta-icon {
            margin-right: 8rpx;
            color: #018d71;
          }
        }
      }

      .price-action {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: auto;

        .price-box {
          display: flex;
          align-items: baseline;

          .price-symbol {
            font-size: 24rpx;
            color: #ff6b6b;
          }

          .price-value {
            margin: 0 4rpx;
            font-size: 36rpx;
            font-weight: bold;
            color: #ff6b6b;
          }

          .price-unit {
            font-size: 24rpx;
            color: #999;
          }
        }

        .reserve-btn {
          padding: 0 30rpx;
          background: linear-gradient(135deg, #018d71, #01a884);
          border: none;
          border-radius: 30rpx;
        }
      }
    }
  }
}
</style>
