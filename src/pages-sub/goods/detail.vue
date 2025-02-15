<template>
  <view class="container">
    <!-- 商品轮播图 -->
    <swiper
      class="swiper"
      :indicator-dots="true"
      :autoplay="true"
      :interval="3000"
      :duration="1000"
    >
      <swiper-item v-for="(image, index) in goodsImages" :key="index">
        <image :src="image" mode="aspectFill" class="swiper-image" />
      </swiper-item>
    </swiper>

    <!-- 商品信息 -->
    <view class="goods-info">
      <view class="price-section">
        <text class="price">¥{{ goodsInfo.price }}</text>
        <text class="original-price" v-if="goodsInfo.originalPrice">
          ¥{{ goodsInfo.originalPrice }}
        </text>
      </view>
      <text class="title">{{ goodsInfo.name }}</text>
      <view class="tags" v-if="goodsInfo.tags && goodsInfo.tags.length">
        <text v-for="(tag, index) in goodsInfo.tags" :key="index" class="tag">{{ tag }}</text>
      </view>
      <text class="desc">{{ goodsInfo.description }}</text>
    </view>

    <!-- 规格选择 -->
    <view class="spec-section">
      <view class="section-header">
        <text class="title">规格</text>
        <text class="selected-spec">已选：{{ selectedSpec || '请选择' }}</text>
      </view>
      <view class="spec-list">
        <view
          v-for="spec in specifications"
          :key="spec.value"
          class="spec-item"
          :class="{ active: selectedSpec === spec.value }"
          @click="selectSpec(spec.value)"
        >
          {{ spec.label }}
        </view>
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="detail-section">
      <view class="section-header">
        <text class="title">商品详情</text>
      </view>
      <rich-text :nodes="goodsInfo.detail"></rich-text>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="left-actions">
        <view class="action-item" @click="goToCart">
          <wd-icon name="cart" size="24" />
          <text>购物车</text>
        </view>
      </view>
      <view class="right-actions">
        <wd-button type="warning" @click="addToCart">加入购物车</wd-button>
        <wd-button type="primary" @click="buyNow">立即购买</wd-button>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { showToast } from '@/utils/toast'

// 商品信息
const goodsInfo = ref({
  id: 0,
  name: '',
  price: 0,
  originalPrice: 0,
  description: '',
  tags: [],
  detail: '',
})

// 商品图片
const goodsImages = ref<string[]>([])

// 规格相关
const specifications = ref([
  { label: '1斤装', value: '1斤' },
  { label: '2斤装', value: '2斤' },
  { label: '5斤装', value: '5斤' },
])
const selectedSpec = ref('')

// 获取商品详情
const getGoodsDetail = async (id: string) => {
  try {
    // TODO: 调用接口获取商品详情
    // 模拟数据
    goodsInfo.value = {
      id: Number(id),
      name: '有机大米',
      price: 29.9,
      originalPrice: 39.9,
      description: '优质有机大米，无农药残留',
      tags: ['有机认证', '无农药', '产地直供'],
      detail: '<p>这是商品详情的富文本内容</p>',
    }
    goodsImages.value = [
      '/static/goods/rice1.jpg',
      '/static/goods/rice2.jpg',
      '/static/goods/rice3.jpg',
    ]
  } catch (error) {
    console.error('获取商品详情失败：', error)
    showToast('获取商品详情失败')
  }
}

// 选择规格
const selectSpec = (spec: string) => {
  selectedSpec.value = spec
}

// 加入购物车
const addToCart = () => {
  if (!selectedSpec.value) {
    showToast('请选择规格')
    return
  }
  // TODO: 调用加入购物车接口
  showToast('已加入购物车')
}

// 立即购买
const buyNow = () => {
  if (!selectedSpec.value) {
    showToast('请选择规格')
    return
  }
  uni.navigateTo({
    url: '/pages-sub/order/create',
  })
}

// 跳转到购物车
const goToCart = () => {
  uni.switchTab({
    url: '/pages/cart/index',
  })
}

// 页面加载
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const { id } = currentPage?.options || {}
  if (id) {
    getGoodsDetail(id)
  }
})
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  background-color: #f8f8f8;
}

.swiper {
  width: 100%;
  height: 750rpx;

  .swiper-image {
    width: 100%;
    height: 100%;
  }
}

.goods-info {
  padding: 30rpx;
  margin-bottom: 20rpx;
  background-color: #fff;

  .price-section {
    margin-bottom: 20rpx;

    .price {
      margin-right: 20rpx;
      font-size: 40rpx;
      font-weight: bold;
      color: #ff6b6b;
    }

    .original-price {
      font-size: 28rpx;
      color: #999;
      text-decoration: line-through;
    }
  }

  .title {
    display: block;
    margin-bottom: 20rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 20rpx;

    .tag {
      padding: 4rpx 16rpx;
      margin: 0 20rpx 10rpx 0;
      font-size: 24rpx;
      color: #ff6b6b;
      background-color: #fff5f5;
      border-radius: 4rpx;
    }
  }

  .desc {
    font-size: 28rpx;
    color: #666;
  }
}

.spec-section {
  padding: 30rpx;
  margin-bottom: 20rpx;
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

    .selected-spec {
      font-size: 28rpx;
      color: #666;
    }
  }

  .spec-list {
    display: flex;
    flex-wrap: wrap;

    .spec-item {
      padding: 12rpx 30rpx;
      margin: 0 20rpx 20rpx 0;
      font-size: 28rpx;
      color: #666;
      background-color: #f5f5f5;
      border-radius: 8rpx;
      transition: all 0.3s;

      &.active {
        color: #fff;
        background-color: #ff6b6b;
      }
    }
  }
}

.detail-section {
  padding: 30rpx;
  background-color: #fff;

  .section-header {
    margin-bottom: 30rpx;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }
}

.action-bar {
  position: fixed;
  right: 0;
  bottom: env(safe-area-inset-bottom);
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;

  .left-actions {
    display: flex;

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 40rpx;

      text {
        margin-top: 4rpx;
        font-size: 24rpx;
        color: #666;
      }
    }
  }

  .right-actions {
    display: flex;

    .wd-button {
      width: 200rpx;
      margin-left: 20rpx;
    }
  }
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom);
}
</style>
