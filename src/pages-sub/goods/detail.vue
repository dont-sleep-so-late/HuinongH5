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
      <text class="desc">{{ goodsInfo.description }}</text>
    </view>

    <!-- 规格选择 -->
    <view class="spec-section">
      <view class="section-header">
        <text class="title">规格</text>
        <text class="selected-spec">
          已选：{{ selectedSpec ? selectedSpec.specValue : '请选择' }}
        </text>
      </view>
      <view class="spec-list">
        <view
          v-for="spec in specifications"
          :key="spec.id"
          class="spec-item"
          :class="{ active: selectedSpec && selectedSpec.id === spec.id }"
          @click="selectSpec(spec)"
        >
          {{ spec.specValue }}
        </view>
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="detail-section">
      <view class="section-header">
        <text class="title">商品详情</text>
      </view>
      <view class="detail-content">
        <image
          v-for="(image, index) in goodsInfo.detailImages"
          :key="index"
          :src="image"
          mode="widthFix"
          class="detail-image"
        />
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="left-actions">
        <view class="action-item" @click="goToCart">
          <wd-icon name="cart" size="24" />
          <text>购物车</text>
        </view>
        <view class="action-item" @click="handleToggleFavorite">
          <wd-icon
            :name="isFavorite ? 'star-fill' : 'star'"
            size="24"
            :color="isFavorite ? '#ff6b6b' : ''"
          />
          <text :style="{ color: isFavorite ? '#ff6b6b' : '' }">
            {{ isFavorite ? '已关注' : '关注' }}
          </text>
        </view>
        <view class="action-item" @click="handleContactSeller">
          <wd-icon name="chat" size="24" />
          <text>联系卖家</text>
        </view>
      </view>
      <view class="right-actions">
        <wd-button type="primary" @click="handleAddToCart">加入购物车</wd-button>
        <wd-button type="warning" @click="handleBuyNow">立即购买</wd-button>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import { getProductDetail, getProductSpecs } from '@/api/product'
import { addToCart } from '@/api/cart'
import { previewBuyNowOrder } from '@/api/order'
import { toggleFavoriteProduct } from '@/api/profile'
import type { ProductDetail, ProductSpec } from '@/api/product'
import type { AddCartParams } from '@/api/cart'

const router = useRouter()

// 商品信息
const goodsInfo = ref<ProductDetail>({
  id: 0,
  name: '',
  description: '',
  mainImage: '',
  detailImages: [],
  categoryId: 0,
  categoryName: '',
  price: 0,
  stock: 0,
  status: 1,
  salesVolume: 0,
  region: '',
  unit: '',
  weight: 0,
  createdTime: '',
  updatedTime: '',
  sellerId: 0,
  sellerName: '',
  auditStatus: 1,
  auditRemark: null,
  sellerAvatar: '',
})

// 是否已关注
const isFavorite = ref(false)

// 商品图片
const goodsImages = computed(() => {
  return [goodsInfo.value.mainImage, ...goodsInfo.value.detailImages]
})

// 规格相关
const specifications = ref<ProductSpec[]>([])
const selectedSpec = ref<ProductSpec | null>(null)

// 选择规格
const selectSpec = (spec: ProductSpec) => {
  selectedSpec.value = spec
}

// 获取商品详情
const getGoodsDetail = async (id: string) => {
  try {
    const res = await getProductDetail(Number(id))
    if (res.code === 200 && res.data) {
      goodsInfo.value = res.data as unknown as ProductDetail
      // 获取商品规格
      const specRes = await getProductSpecs(Number(id))
      if (specRes.code === 200 && specRes.data) {
        specifications.value = specRes.data as unknown as ProductSpec[]
      }
    }
  } catch (error: any) {
    showToast(error.message || '获取商品详情失败')
  }
}

// 关注/取消关注商品
const handleToggleFavorite = async () => {
  try {
    const res = await toggleFavoriteProduct(goodsInfo.value.id)
    if (res.code === 200) {
      isFavorite.value = Boolean(res.data)
      showToast(isFavorite.value ? '关注成功' : '取消关注成功')
    }
  } catch (error: any) {
    showToast(error.message || '操作失败')
  }
}

// 加入购物车
const handleAddToCart = async () => {
  if (!selectedSpec.value) {
    showToast('请选择商品规格')
    return
  }

  try {
    const params: AddCartParams = {
      productId: goodsInfo.value.id,
      quantity: 1,
      specId: selectedSpec.value.id,
    }
    const res = await addToCart(params)
    if (res.code === 200) {
      showToast('添加成功')
    }
  } catch (error: any) {
    showToast(error.message || '添加失败')
  }
}

// 立即购买
const handleBuyNow = async () => {
  if (!selectedSpec.value) {
    showToast('请选择商品规格')
    return
  }

  try {
    const res = await previewBuyNowOrder({
      productId: goodsInfo.value.id,
      specId: selectedSpec.value.id,
      quantity: 1,
    })

    if (res.code === 200 && res.data) {
      // 将预览数据存储到本地，用于订单确认页面
      uni.setStorageSync('order_preview', {
        type: 'buy_now',
        data: res.data,
        params: {
          productId: goodsInfo.value.id,
          specId: selectedSpec.value.id,
          quantity: 1,
        },
      })
      router.navigate('/pages-sub/order/create')
    }
  } catch (error: any) {
    showToast(error.message || '获取订单信息失败')
  }
}

// 跳转到购物车
const goToCart = () => {
  uni.switchTab({
    url: '/pages/cart/index',
  })
}

// 联系卖家
const handleContactSeller = () => {
  console.log('联系卖家')
  router.navigate('/pages-sub/chat/detail')
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
      width: 100rpx;
      margin-left: 20rpx;
    }
  }
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom);
}
</style>
