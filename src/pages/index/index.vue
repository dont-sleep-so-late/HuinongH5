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
      <wd-input
        v-model="searchKeyword"
        placeholder="搜索你想要的吧"
        prefix-icon="search"
        clearable
        @click="navigateToSearch"
      />
    </view>

    <!-- 轮播图 -->
    <swiper
      class="banner"
      :indicator-dots="true"
      :autoplay="true"
      :interval="3000"
      :duration="1000"
    >
      <swiper-item v-for="(item, index) in bannerList" :key="index">
        <image :src="item.image" mode="aspectFill" />
      </swiper-item>
    </swiper>

    <!-- 功能导航 -->
    <view class="nav-grid">
      <view class="nav-item" @click="navigateToPrice">
        <view class="icon-wrapper price">
          <wd-icon name="trend" size="40" />
        </view>
        <text>行情价格</text>
      </view>
      <view class="nav-item" @click="navigateToForecast">
        <view class="icon-wrapper forecast">
          <wd-icon name="line-chart" size="40" />
        </view>
        <text>价格预测</text>
      </view>
      <view class="nav-item" @click="navigateToPlanting">
        <view class="icon-wrapper planting">
          <wd-icon name="bar-chart" size="40" />
        </view>
        <text>种植面积</text>
      </view>
      <view class="nav-item" @click="navigateToFarm">
        <view class="icon-wrapper farm">
          <wd-icon name="home" size="40" />
        </view>
        <text>我的农场</text>
      </view>
    </view>

    <!-- 商品列表 -->
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
            <text class="goods-label">预售：</text>
            <text class="goods-value">{{ item.quantity }}件</text>
          </view>
          <view class="goods-meta">
            <text class="goods-label">价格：</text>
            <text class="goods-price">{{ item.price }}元</text>
          </view>
          <view class="goods-meta">
            <text class="goods-label">成熟期：</text>
            <text class="goods-value">{{ item.harvestTime }}</text>
          </view>
          <wd-button type="primary" size="small" class="reserve-btn">一键预定</wd-button>
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
  background-color: #f8f8f8;
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 20rpx;
  background-color: #fff;
}

.banner {
  height: 300rpx;

  image {
    width: 100%;
    height: 100%;
  }
}

.nav-grid {
  display: flex;
  justify-content: space-around;
  padding: 30rpx 20rpx;
  margin-bottom: 20rpx;
  background-color: #fff;

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;

    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100rpx;
      height: 100rpx;
      margin-bottom: 16rpx;
      color: #fff;
      border-radius: 50%;

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
      font-size: 26rpx;
      font-weight: 500;
      color: #333;
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
    border-radius: 12rpx;

    .goods-image {
      width: 240rpx;
      height: 240rpx;
      margin-right: 20rpx;
      border-radius: 8rpx;
    }

    .goods-info {
      display: flex;
      flex: 1;
      flex-direction: column;

      .goods-name {
        margin-bottom: 16rpx;
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }

      .goods-meta {
        display: flex;
        align-items: center;
        margin-bottom: 12rpx;

        .goods-label {
          margin-right: 8rpx;
          font-size: 24rpx;
          color: #666;
        }

        .goods-value {
          font-size: 24rpx;
          color: #333;
        }

        .goods-price {
          font-size: 28rpx;
          font-weight: bold;
          color: #ff6b6b;
        }
      }

      .reserve-btn {
        align-self: flex-end;
        margin-top: auto;
      }
    }
  }
}
</style>
