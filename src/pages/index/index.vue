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
      <swiper-item
        v-for="(item, index) in bannerList"
        :key="index"
        @click="handleBannerClick(item.url)"
      >
        <image :src="item.image" mode="aspectFill" />
        <view class="banner-title" v-if="item.title">{{ item.title }}</view>
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
        <view class="sort-wrapper">
          <text
            class="sort-item"
            :class="{ active: currentSort === 'new' }"
            @click="handleSort('new')"
          >
            最新
          </text>
          <text
            class="sort-item"
            :class="{ active: currentSort === 'sales' }"
            @click="handleSort('sales')"
          >
            销量
          </text>
          <text
            class="sort-item"
            :class="{ active: currentSort === 'price_asc' || currentSort === 'price_desc' }"
            @click="handleSortPrice"
          >
            价格
            <text class="iconfont" :class="priceIcon"></text>
          </text>
        </view>
      </view>

      <z-paging
        ref="paging"
        v-model="goodsList"
        @query="queryList"
        :show-refresher-when-reload="true"
        :auto-shows-back-to-top="true"
        :loading-more-no-more-text="'没有更多了'"
      >
        <view class="goods-grid">
          <view
            class="goods-item"
            v-for="item in goodsList"
            :key="item.id"
            @click="navigateToDetail(item.id)"
          >
            <image :src="item.mainImage" mode="aspectFill" class="goods-image" />
            <view class="goods-info">
              <text class="goods-name">{{ item.name }}</text>
              <view class="goods-meta">
                <view class="meta-item">
                  <wd-icon name="location" size="24" class="meta-icon" />
                  <text>{{ item.region }}</text>
                </view>
                <view class="meta-item">
                  <wd-icon name="shop" size="24" class="meta-icon" />
                  <text>{{ item.sellerName }}</text>
                </view>
              </view>
              <view class="price-action">
                <view class="price-box">
                  <text class="price-symbol">¥</text>
                  <text class="price-value">{{ item.price }}</text>
                </view>
                <text class="sales-count">已售{{ item.salesVolume }}件</text>
              </view>
            </view>
          </view>
        </view>
      </z-paging>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getActiveBanners } from '@/services/banner'
import { getHomeProducts, type Product, type SortType } from '@/services/product'
import { showToast } from '@/utils/toast'
import { getUserInfo as fetchUserInfo } from '@/services/user'
import { useUserStore } from '@/stores/user'
import { useRouter } from '@/hooks/router'

const router = useRouter()
const userStore = useUserStore()

// 搜索关键词
const searchKeyword = ref('')

// 轮播图数据
const bannerList = ref<
  {
    image: string
    url: string
    title: string
  }[]
>([])

// 获取轮播图数据
const getBanners = async () => {
  try {
    const res = await getActiveBanners()
    if (res.data) {
      bannerList.value = res.data.map((item) => ({
        image: item.image,
        url: item.url,
        title: item.title,
      }))
    }
  } catch (error: any) {
    showToast(error.message || '获取轮播图失败')
  }
}

// 点击轮播图
const handleBannerClick = (url: string) => {
  if (url) {
    uni.navigateTo({ url })
  }
}

// 商品列表数据
const goodsList = ref<Product[]>([])
const paging = ref<any>(null)
const currentSort = ref<SortType>('new')
const currentCategoryId = ref<number | undefined>(undefined)

// 价格排序图标
const priceIcon = computed(() => {
  if (currentSort.value === 'price_asc') return 'icon-arrow-up'
  if (currentSort.value === 'price_desc') return 'icon-arrow-down'
  return 'icon-arrow-up-down'
})

// 处理排序方式切换
const handleSort = (sort: SortType) => {
  if (currentSort.value === sort) return
  currentSort.value = sort
  paging.value?.reload()
}

// 处理价格排序
const handleSortPrice = () => {
  if (currentSort.value === 'price_asc') {
    currentSort.value = 'price_desc'
  } else {
    currentSort.value = 'price_asc'
  }
  paging.value?.reload()
}

// 查询商品列表
const queryList = async (pageNo: number, pageSize: number) => {
  try {
    const res = await getHomeProducts({
      pageNum: pageNo,
      pageSize,
      categoryId: currentCategoryId.value,
      sort: currentSort.value,
    })
    return {
      list: res.data.records,
      total: res.data.total,
    }
  } catch (error: any) {
    showToast(error.message || '获取商品列表失败')
    return {
      list: [],
      total: 0,
    }
  }
}

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

// 获取用户信息
const getUserInfo = async () => {
  try {
    const res = await fetchUserInfo()
    if (res.data) {
      userStore.updateUserInfo(res.data)
    }
  } catch (error: any) {
    showToast(error.message || '获取用户信息失败')
  }
}

// 页面加载时获取用户信息
onMounted(() => {
  getBanners()
  if (userStore.isLoggedIn) {
    getUserInfo()
  }
})
</script>

<style lang="scss">
@import '@/styles/mixins';

.container {
  width: 100%;
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

  .banner-title {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 20rpx;
    font-size: 28rpx;
    color: #fff;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
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

    .sort-wrapper {
      display: flex;
      gap: 20rpx;
      align-items: center;

      .sort-item {
        font-size: 26rpx;
        color: #666;
        cursor: pointer;

        &.active {
          color: #018d71;
        }
      }

      .iconfont {
        margin-left: 8rpx;
        font-size: 24rpx;
        color: #666;
      }
    }
  }
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 20rpx;

  .goods-item {
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    transition: transform 0.2s;

    &:active {
      transform: scale(0.98);
    }

    .goods-image {
      width: 100%;
      height: 320rpx;
      border-radius: 16rpx 16rpx 0 0;
    }

    .goods-info {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 20rpx;

      .goods-name {
        margin-bottom: 16rpx;
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
        @include text-ellipsis(2);
      }

      .goods-meta {
        display: flex;
        flex-direction: column;
        gap: 8rpx;
        margin-bottom: 16rpx;

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
            margin-left: 4rpx;
            font-size: 32rpx;
            font-weight: bold;
            color: #ff6b6b;
          }
        }

        .sales-count {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
}
</style>
