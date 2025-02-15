<template>
  <view class="container">
    <!-- 购物车列表 -->
    <view class="cart-list" v-if="cartList.length > 0">
      <view class="cart-section">
        <view class="section-header">
          <wd-checkbox v-model="isAllSelected" @change="selectAll">全选</wd-checkbox>
          <text class="edit-btn" @click="isEditing = !isEditing">
            {{ isEditing ? '完成' : '编辑' }}
          </text>
        </view>
        <view class="cart-item" v-for="item in cartList" :key="item.id">
          <view class="checkbox">
            <wd-checkbox v-model="item.selected" @change="updateTotal"></wd-checkbox>
          </view>
          <image
            :src="item.image"
            mode="aspectFill"
            class="goods-image"
            @click="navigateToDetail(item)"
          />
          <view class="goods-info" @click="navigateToDetail(item)">
            <text class="goods-name">{{ item.name }}</text>
            <text class="goods-spec" v-if="item.spec">规格：{{ item.spec }}</text>
            <view class="goods-meta">
              <text class="goods-price">¥{{ item.price }}</text>
              <view class="quantity-control">
                <wd-button size="small" @click.stop="decreaseQuantity(item)">-</wd-button>
                <wd-input-number
                  v-model="item.quantity"
                  min="1"
                  :max="item.stock"
                  @change="updateTotal"
                />
                <wd-button size="small" @click.stop="increaseQuantity(item)">+</wd-button>
              </view>
            </view>
          </view>
          <view class="delete-btn" v-if="isEditing" @click.stop="removeItem(item)">
            <wd-icon name="delete" size="20"></wd-icon>
          </view>
        </view>
      </view>

      <!-- 优惠券选择 -->
      <view class="coupon-section" v-if="!isEditing">
        <view class="section-item" @click="showCouponPopup = true">
          <text class="label">优惠券</text>
          <view class="value">
            <text>{{ selectedCoupon ? '-¥' + selectedCoupon.amount : '未使用' }}</text>
            <wd-icon name="arrow-right" size="16" color="#999" />
          </view>
        </view>
      </view>

      <!-- 商品推荐 -->
      <view class="recommend-section">
        <view class="section-title">
          <text>猜你喜欢</text>
        </view>
        <scroll-view scroll-x class="recommend-list">
          <view
            class="recommend-item"
            v-for="item in recommendList"
            :key="item.id"
            @click="addToCart(item)"
          >
            <image :src="item.image" mode="aspectFill" class="recommend-image" />
            <text class="recommend-name">{{ item.name }}</text>
            <text class="recommend-price">¥{{ item.price }}</text>
            <wd-button size="small" type="warning">加入购物车</wd-button>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 空购物车提示 -->
    <view class="empty-cart" v-else>
      <image src="/static/icons/empty-cart.png" mode="aspectFit" class="empty-icon" />
      <text class="empty-text">购物车是空的</text>
      <text class="empty-desc">去挑选一些心仪的商品吧</text>
      <wd-button type="primary" @click="goToHome">去逛逛</wd-button>
    </view>

    <!-- 底部结算栏 -->
    <view class="settlement-bar" v-if="cartList.length > 0">
      <view class="select-all" v-if="isEditing">
        <wd-checkbox v-model="isAllSelected" @change="selectAll">全选</wd-checkbox>
      </view>
      <view class="total-info" v-else>
        <view class="price-detail">
          <text class="total-price">合计：¥{{ totalPrice }}</text>
          <text class="discount-price" v-if="selectedCoupon">
            已优惠：¥{{ selectedCoupon.amount }}
          </text>
        </view>
        <text class="total-desc">不含运费</text>
      </view>
      <wd-button
        type="primary"
        :disabled="!selectedCount"
        @click="isEditing ? deleteSelected() : settlement()"
      >
        {{ isEditing ? '删除(' + selectedCount + ')' : '结算(' + selectedCount + ')' }}
      </wd-button>
    </view>

    <!-- 优惠券弹窗 -->
    <wd-popup v-model="showCouponPopup" position="bottom">
      <view class="coupon-popup">
        <view class="popup-header">
          <text class="title">优惠券</text>
          <wd-icon name="close" size="20" @click="showCouponPopup = false" />
        </view>
        <view class="coupon-list">
          <view
            class="coupon-item"
            v-for="coupon in availableCoupons"
            :key="coupon.id"
            :class="{ disabled: !coupon.available }"
            @click="selectCoupon(coupon)"
          >
            <view class="coupon-left">
              <text class="amount">¥{{ coupon.amount }}</text>
              <text class="condition">满{{ coupon.condition }}可用</text>
            </view>
            <view class="coupon-right">
              <text class="desc">{{ coupon.desc }}</text>
              <text class="time">{{ coupon.validTime }}</text>
            </view>
          </view>
        </view>
      </view>
    </wd-popup>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <wd-button
        type="primary"
        :disabled="!selectedCount"
        @click="isEditing ? deleteSelected() : settlement()"
      >
        {{ isEditing ? '删除(' + selectedCount + ')' : '结算(' + selectedCount + ')' }}
      </wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface CartItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number
  selected: boolean
  spec?: string
  stock: number
}

interface Coupon {
  id: number
  amount: number
  condition: number
  desc: string
  validTime: string
  available: boolean
}

// 编辑模式
const isEditing = ref(false)

// 优惠券弹窗
const showCouponPopup = ref(false)
const selectedCoupon = ref<Coupon | null>(null)

// 购物车列表数据
const cartList = ref<CartItem[]>([
  {
    id: 1,
    name: '优质红富士苹果',
    price: 15.8,
    image: '/static/goods/apple.jpg',
    quantity: 2,
    selected: true,
    spec: '5kg装',
    stock: 10,
  },
  {
    id: 2,
    name: '有机大米',
    price: 49.9,
    image: '/static/goods/rice.jpg',
    quantity: 1,
    selected: true,
    spec: '10kg装',
    stock: 20,
  },
])

// 推荐商品列表
const recommendList = ref([
  {
    id: 3,
    name: '新鲜西红柿',
    price: 8.8,
    image: '/static/goods/tomato.jpg',
  },
  {
    id: 4,
    name: '黄瓜',
    price: 5.5,
    image: '/static/goods/cucumber.jpg',
  },
  {
    id: 5,
    name: '胡萝卜',
    price: 4.8,
    image: '/static/goods/carrot.jpg',
  },
])

// 可用优惠券列表
const availableCoupons = ref<Coupon[]>([
  {
    id: 1,
    amount: 10,
    condition: 100,
    desc: '全场通用券',
    validTime: '2024-03-31到期',
    available: true,
  },
  {
    id: 2,
    amount: 5,
    condition: 50,
    desc: '新鲜水果券',
    validTime: '2024-03-20到期',
    available: true,
  },
  {
    id: 3,
    amount: 20,
    condition: 200,
    desc: '有机蔬菜券',
    validTime: '2024-03-15到期',
    available: false,
  },
])

// 计算属性
const isAllSelected = computed({
  get: () => cartList.value.length > 0 && cartList.value.every((item) => item.selected),
  set: (value) => cartList.value.forEach((item) => (item.selected = value)),
})

const selectedCount = computed(() => cartList.value.filter((item) => item.selected).length)

const totalPrice = computed(() => {
  const price = cartList.value
    .filter((item) => item.selected)
    .reduce((total, item) => total + item.price * item.quantity, 0)

  if (selectedCoupon.value && price >= selectedCoupon.value.condition) {
    return (price - selectedCoupon.value.amount).toFixed(2)
  }
  return price.toFixed(2)
})

// 方法
const updateTotal = () => {
  // 触发计算属性更新
}

const selectAll = (value: boolean) => {
  cartList.value.forEach((item) => (item.selected = value))
}

const increaseQuantity = (item: CartItem) => {
  if (item.quantity < item.stock) {
    item.quantity++
    updateTotal()
  } else {
    uni.showToast({
      title: '已达到最大库存',
      icon: 'none',
    })
  }
}

const decreaseQuantity = (item: CartItem) => {
  if (item.quantity > 1) {
    item.quantity--
    updateTotal()
  }
}

const removeItem = (item: CartItem) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这个商品吗？',
    success: (res) => {
      if (res.confirm) {
        const index = cartList.value.findIndex((i) => i.id === item.id)
        if (index !== -1) {
          cartList.value.splice(index, 1)
        }
      }
    },
  })
}

const deleteSelected = () => {
  uni.showModal({
    title: '提示',
    content: '确定要删除选中的商品吗？',
    success: (res) => {
      if (res.confirm) {
        cartList.value = cartList.value.filter((item) => !item.selected)
      }
    },
  })
}

const selectCoupon = (coupon: Coupon) => {
  if (!coupon.available) {
    uni.showToast({
      title: '该优惠券不可用',
      icon: 'none',
    })
    return
  }

  const totalAmount = cartList.value
    .filter((item) => item.selected)
    .reduce((total, item) => total + item.price * item.quantity, 0)

  if (totalAmount < coupon.condition) {
    uni.showToast({
      title: '购物满' + coupon.condition + '元可用',
      icon: 'none',
    })
    return
  }

  selectedCoupon.value = coupon
  showCouponPopup.value = false
}

const addToCart = (item: any) => {
  const existItem = cartList.value.find((i) => i.id === item.id)
  if (existItem) {
    increaseQuantity(existItem)
  } else {
    cartList.value.push({
      ...item,
      quantity: 1,
      selected: true,
      stock: 99,
    })
  }
  uni.showToast({
    title: '已加入购物车',
    icon: 'success',
  })
}

const settlement = () => {
  const selectedItems = cartList.value.filter((item) => item.selected)
  if (selectedItems.length === 0) {
    uni.showToast({
      title: '请选择要结算的商品',
      icon: 'none',
    })
    return
  }

  uni.navigateTo({
    url: '/pages-sub/order/create',
  })
}

const goToHome = () => {
  uni.switchTab({
    url: '/pages/index/index',
  })
}

// 跳转到商品详情
const navigateToDetail = (item: CartItem) => {
  if (!isEditing.value) {
    uni.navigateTo({
      url: '/pages-sub/goods/detail?id=' + item.id + '&name=' + encodeURIComponent(item.name),
    })
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  background-color: #f8f8f8;
}

.cart-section {
  margin-bottom: 20rpx;
  background-color: #fff;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx;
    border-bottom: 1rpx solid #eee;

    .edit-btn {
      font-size: 28rpx;
      color: #666;
    }
  }
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f5f5f5;

  .checkbox {
    margin-right: 20rpx;
  }

  .goods-image {
    width: 160rpx;
    height: 160rpx;
    margin-right: 20rpx;
    border-radius: 8rpx;
  }

  .goods-info {
    flex: 1;

    .goods-name {
      margin-bottom: 12rpx;
      font-size: 28rpx;
      color: #333;
    }

    .goods-spec {
      margin-bottom: 12rpx;
      font-size: 24rpx;
      color: #999;
    }

    .goods-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .goods-price {
        font-size: 32rpx;
        font-weight: bold;
        color: #ff6b6b;
      }

      .quantity-control {
        display: flex;
        align-items: center;

        .wd-input-number {
          width: 80rpx;
          margin: 0 10rpx;
        }
      }
    }
  }

  .delete-btn {
    padding: 20rpx;
    color: #999;
  }
}

.coupon-section {
  margin-bottom: 20rpx;
  background-color: #fff;

  .section-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx 20rpx;

    .label {
      font-size: 28rpx;
      color: #333;
    }

    .value {
      display: flex;
      align-items: center;
      font-size: 28rpx;
      color: #666;

      .wd-icon {
        margin-left: 10rpx;
      }
    }
  }
}

.recommend-section {
  padding: 30rpx 0;
  background-color: #fff;

  .section-title {
    padding: 0 20rpx;
    margin-bottom: 20rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .recommend-list {
    padding: 0 20rpx;
    white-space: nowrap;

    .recommend-item {
      display: inline-block;
      width: 200rpx;
      margin-right: 20rpx;
      text-align: center;

      &:last-child {
        margin-right: 0;
      }

      .recommend-image {
        width: 200rpx;
        height: 200rpx;
        margin-bottom: 12rpx;
        border-radius: 8rpx;
      }

      .recommend-name {
        margin-bottom: 8rpx;
        overflow: hidden;
        font-size: 26rpx;
        color: #333;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .recommend-price {
        margin-bottom: 12rpx;
        font-size: 28rpx;
        font-weight: bold;
        color: #ff6b6b;
      }
    }
  }
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;

  .empty-icon {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 40rpx;
  }

  .empty-text {
    margin-bottom: 20rpx;
    font-size: 32rpx;
    color: #333;
  }

  .empty-desc {
    margin-bottom: 40rpx;
    font-size: 26rpx;
    color: #999;
  }
}

.settlement-bar {
  position: fixed;
  right: 0;
  bottom: env(safe-area-inset-bottom);
  left: 0;
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .select-all {
    margin-right: 20rpx;
  }

  .total-info {
    flex: 1;

    .price-detail {
      margin-bottom: 4rpx;

      .total-price {
        margin-right: 10rpx;
        font-size: 32rpx;
        font-weight: bold;
        color: #ff6b6b;
      }

      .discount-price {
        font-size: 24rpx;
        color: #ff6b6b;
      }
    }

    .total-desc {
      font-size: 24rpx;
      color: #999;
    }
  }

  .wd-button {
    width: 200rpx;
    margin-left: 20rpx;
  }
}

.coupon-popup {
  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1rpx solid #eee;

    .title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .coupon-list {
    max-height: 60vh;
    padding: 20rpx;
    overflow-y: auto;

    .coupon-item {
      position: relative;
      display: flex;
      margin-bottom: 20rpx;
      overflow: hidden;
      background: linear-gradient(135deg, #ff6b6b, #ff8787);
      border-radius: 12rpx;

      &.disabled {
        background: linear-gradient(135deg, #999, #bbb);
        opacity: 0.6;
      }

      &::before {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 200rpx;
        width: 20rpx;
        content: '';
        background-image: radial-gradient(
          circle at 0 6rpx,
          transparent 0,
          transparent 4rpx,
          #fff 4rpx,
          #fff 8rpx
        );
        background-position: 10rpx center;
        background-size: 20rpx 12rpx;
      }

      .coupon-left {
        width: 200rpx;
        padding: 20rpx;
        color: #fff;
        text-align: center;

        .amount {
          margin-bottom: 8rpx;
          font-size: 48rpx;
          font-weight: bold;
        }

        .condition {
          font-size: 24rpx;
        }
      }

      .coupon-right {
        flex: 1;
        padding: 20rpx;
        background-color: #fff;

        .desc {
          margin-bottom: 8rpx;
          font-size: 28rpx;
          color: #333;
        }

        .time {
          font-size: 24rpx;
          color: #999;
        }
      }
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
  height: 100rpx;
  padding: 0 20rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}
</style>
