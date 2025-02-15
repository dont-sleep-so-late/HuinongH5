<template>
  <view class="container">
    <!-- 商品图片轮播 -->
    <swiper
      class="goods-swiper"
      :indicator-dots="true"
      :autoplay="true"
      :interval="3000"
      :duration="1000"
    >
      <swiper-item v-for="(item, index) in goodsDetail.images" :key="index">
        <image :src="item" mode="aspectFill" class="goods-image" />
      </swiper-item>
    </swiper>

    <!-- 商品基本信息 -->
    <view class="goods-info">
      <view class="price-section">
        <text class="price">¥{{ goodsDetail.price }}</text>
        <text class="market-price">市场价：¥{{ goodsDetail.marketPrice }}</text>
      </view>
      <text class="title">{{ goodsDetail.name }}</text>
      <view class="sales-info">
        <text class="sales">已售 {{ goodsDetail.sales }} 件</text>
        <text class="stock">库存 {{ goodsDetail.stock }} 件</text>
      </view>
    </view>

    <!-- 农场信息 -->
    <view class="farm-info">
      <view class="farm-header">
        <image :src="goodsDetail.farmInfo.logo" mode="aspectFill" class="farm-logo" />
        <view class="farm-detail">
          <text class="farm-name">{{ goodsDetail.farmInfo.name }}</text>
          <text class="farm-address">{{ goodsDetail.farmInfo.address }}</text>
        </view>
        <wd-button size="small" @click="navigateToFarm">查看农场</wd-button>
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="detail-section">
      <view class="section-title">
        <text>商品详情</text>
      </view>
      <view class="harvest-info">
        <view class="info-item">
          <text class="label">预计成熟期：</text>
          <text class="value">{{ goodsDetail.harvestTime }}</text>
        </view>
        <view class="info-item">
          <text class="label">种植方式：</text>
          <text class="value">{{ goodsDetail.plantingMethod }}</text>
        </view>
        <view class="info-item">
          <text class="label">施肥方案：</text>
          <text class="value">{{ goodsDetail.fertilizationPlan }}</text>
        </view>
        <view class="info-item">
          <text class="label">农药使用：</text>
          <text class="value">{{ goodsDetail.pesticideUsage }}</text>
        </view>
      </view>
      <view class="detail-images">
        <image
          v-for="(img, index) in goodsDetail.detailImages"
          :key="index"
          :src="img"
          mode="widthFix"
          class="detail-image"
        />
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="left-actions">
        <view class="action-item" @click="navigateToCart">
          <wd-icon name="cart" size="24" />
          <text>购物车</text>
          <view class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</view>
        </view>
        <view class="action-item" @click="toggleFavorite">
          <wd-icon :name="isFavorite ? 'star-fill' : 'star'" size="24" />
          <text>收藏</text>
        </view>
      </view>
      <view class="right-actions">
        <wd-button type="warning" size="large" @click="addToCart">加入购物车</wd-button>
        <wd-button type="primary" size="large" @click="buyNow">立即购买</wd-button>
      </view>
    </view>

    <!-- 规格选择弹窗 -->
    <wd-popup v-model="showSkuPopup" position="bottom">
      <view class="sku-popup">
        <view class="sku-header">
          <image :src="goodsDetail.images[0]" mode="aspectFill" class="sku-image" />
          <view class="sku-info">
            <text class="sku-price">¥{{ goodsDetail.price }}</text>
            <text class="sku-stock">库存：{{ goodsDetail.stock }}件</text>
            <text class="sku-selected">已选：{{ selectedSku }}</text>
          </view>
          <wd-icon name="close" size="20" @click="showSkuPopup = false" />
        </view>
        <view class="sku-content">
          <view class="sku-group">
            <text class="group-title">规格</text>
            <view class="sku-options">
              <text
                v-for="item in goodsDetail.specifications"
                :key="item"
                :class="['sku-option', selectedSpec === item ? 'selected' : '']"
                @click="selectedSpec = item"
              >
                {{ item }}
              </text>
            </view>
          </view>
          <view class="quantity-section">
            <text class="group-title">数量</text>
            <wd-input-number v-model="quantity" :min="1" :max="goodsDetail.stock" />
          </view>
        </view>
        <view class="sku-footer">
          <wd-button type="primary" block @click="confirmSku">确定</wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface FarmInfo {
  id: number
  logo: string
  name: string
  address: string
}

interface GoodsDetail {
  id: number
  name: string
  price: number
  marketPrice: number
  sales: number
  stock: number
  images: string[]
  specifications: string[]
  harvestTime: string
  plantingMethod: string
  fertilizationPlan: string
  pesticideUsage: string
  detailImages: string[]
  farmInfo: FarmInfo
}

// 商品详情数据
const goodsDetail = ref<GoodsDetail>({
  id: 1,
  name: '从化本地火龙果',
  price: 8.9,
  marketPrice: 12.8,
  sales: 2380,
  stock: 1000,
  images: [
    '/static/goods/dragon-fruit-1.jpg',
    '/static/goods/dragon-fruit-2.jpg',
    '/static/goods/dragon-fruit-3.jpg',
  ],
  specifications: ['500g', '1kg', '2kg', '5kg'],
  harvestTime: '2024-08-20',
  plantingMethod: '有机种植',
  fertilizationPlan: '使用天然有机肥料，定期施肥',
  pesticideUsage: '不使用化学农药，采用生物防治',
  detailImages: [
    '/static/goods/detail-1.jpg',
    '/static/goods/detail-2.jpg',
    '/static/goods/detail-3.jpg',
  ],
  farmInfo: {
    id: 1,
    logo: '/static/farm/logo.jpg',
    name: '阳光农场',
    address: '广州市从化区温泉镇',
  },
})

// 购物车数量
const cartCount = ref(2)

// 收藏状态
const isFavorite = ref(false)

// SKU 相关
const showSkuPopup = ref(false)
const selectedSpec = ref('')
const quantity = ref(1)

const selectedSku = computed(() => {
  return selectedSpec.value ? selectedSpec.value : '请选择规格'
})

// 方法
const toggleFavorite = () => {
  isFavorite.value = !isFavorite.value
  uni.showToast({
    title: isFavorite.value ? '收藏成功' : '已取消收藏',
    icon: 'success',
  })
}

const navigateToCart = () => {
  uni.switchTab({
    url: '/pages/cart/index',
  })
}

const navigateToFarm = () => {
  uni.navigateTo({
    url: '/pages-sub/farm/detail?id=' + goodsDetail.value.farmInfo.id,
  })
}

const addToCart = () => {
  showSkuPopup.value = true
}

const buyNow = () => {
  showSkuPopup.value = true
}

const confirmSku = () => {
  if (!selectedSpec.value) {
    uni.showToast({
      title: '请选择规格',
      icon: 'none',
    })
    return
  }

  // TODO: 处理加入购物车或立即购买逻辑
  showSkuPopup.value = false
  uni.showToast({
    title: '添加成功',
    icon: 'success',
  })
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  padding-bottom: 120rpx;
  background-color: #f8f8f8;
}

.goods-swiper {
  height: 750rpx;

  .goods-image {
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
      font-size: 48rpx;
      font-weight: bold;
      color: #ff6b6b;
    }

    .market-price {
      font-size: 24rpx;
      color: #999;
      text-decoration: line-through;
    }
  }

  .title {
    margin-bottom: 20rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .sales-info {
    font-size: 24rpx;
    color: #999;

    .sales {
      margin-right: 40rpx;
    }
  }
}

.farm-info {
  padding: 30rpx;
  margin-bottom: 20rpx;
  background-color: #fff;

  .farm-header {
    display: flex;
    align-items: center;

    .farm-logo {
      width: 80rpx;
      height: 80rpx;
      margin-right: 20rpx;
      border-radius: 40rpx;
    }

    .farm-detail {
      flex: 1;

      .farm-name {
        margin-bottom: 8rpx;
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }

      .farm-address {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.detail-section {
  padding: 30rpx;
  background-color: #fff;

  .section-title {
    padding-left: 20rpx;
    margin-bottom: 30rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    border-left: 8rpx solid #018d71;
  }

  .harvest-info {
    margin-bottom: 30rpx;

    .info-item {
      display: flex;
      margin-bottom: 20rpx;

      .label {
        width: 180rpx;
        font-size: 26rpx;
        color: #666;
      }

      .value {
        flex: 1;
        font-size: 26rpx;
        color: #333;
      }
    }
  }

  .detail-images {
    .detail-image {
      width: 100%;
      margin-bottom: 20rpx;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.action-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 0 20rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .left-actions {
    display: flex;
    margin-right: 20rpx;

    .action-item {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 30rpx;

      text {
        margin-top: 4rpx;
        font-size: 20rpx;
        color: #666;
      }

      .cart-badge {
        position: absolute;
        top: -8rpx;
        right: 10rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32rpx;
        height: 32rpx;
        padding: 0 8rpx;
        font-size: 20rpx;
        color: #fff;
        background-color: #ff6b6b;
        border-radius: 16rpx;
      }
    }
  }

  .right-actions {
    display: flex;
    flex: 1;
    gap: 20rpx;

    .wd-button {
      flex: 1;
    }
  }
}

.sku-popup {
  .sku-header {
    display: flex;
    padding: 30rpx;

    .sku-image {
      width: 160rpx;
      height: 160rpx;
      margin-right: 20rpx;
      border-radius: 8rpx;
    }

    .sku-info {
      flex: 1;

      .sku-price {
        margin-bottom: 12rpx;
        font-size: 36rpx;
        font-weight: bold;
        color: #ff6b6b;
      }

      .sku-stock,
      .sku-selected {
        display: block;
        margin-bottom: 8rpx;
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  .sku-content {
    padding: 0 30rpx;

    .sku-group {
      margin-bottom: 30rpx;

      .group-title {
        margin-bottom: 20rpx;
        font-size: 28rpx;
        color: #333;
      }

      .sku-options {
        display: flex;
        flex-wrap: wrap;
        gap: 20rpx;

        .sku-option {
          padding: 12rpx 30rpx;
          font-size: 24rpx;
          color: #666;
          background-color: #f8f8f8;
          border-radius: 100rpx;

          &.selected {
            color: #018d71;
            background-color: #e6f7f3;
          }
        }
      }
    }

    .quantity-section {
      margin-bottom: 30rpx;

      .group-title {
        margin-bottom: 20rpx;
        font-size: 28rpx;
        color: #333;
      }
    }
  }

  .sku-footer {
    padding: 30rpx;
  }
}
</style>
