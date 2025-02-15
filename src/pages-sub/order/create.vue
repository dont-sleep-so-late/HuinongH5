<template>
  <view class="order-create">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="back" @click="router.back()">
        <text class="iconfont icon-arrow-left"></text>
      </text>
      <text class="title">确认订单</text>
    </view>

    <!-- 收货地址 -->
    <view class="address-card" @click="selectAddress">
      <view v-if="address" class="address-info">
        <view class="user-info">
          <text class="name">{{ address.name }}</text>
          <text class="phone">{{ address.phone }}</text>
        </view>
        <view class="address">
          {{ address.province }}{{ address.city }}{{ address.district }}{{ address.address }}
        </view>
      </view>
      <view v-else class="no-address">
        <text class="iconfont icon-location"></text>
        <text>请选择收货地址</text>
      </view>
      <text class="iconfont icon-arrow-right"></text>
    </view>

    <!-- 商品列表 -->
    <view class="goods-list">
      <view v-for="shop in shopList" :key="shop.id" class="shop-group">
        <!-- 店铺信息 -->
        <view class="shop-header">
          <image :src="shop.avatar" mode="aspectFill" class="shop-avatar" />
          <text class="shop-name">{{ shop.name }}</text>
        </view>

        <!-- 商品列表 -->
        <view class="goods-items">
          <view v-for="goods in shop.goodsList" :key="goods.id" class="goods-item">
            <image :src="goods.image" mode="aspectFill" class="goods-image" />
            <view class="goods-info">
              <text class="goods-name">{{ goods.name }}</text>
              <text class="goods-spec">{{ goods.spec }}</text>
              <view class="goods-bottom">
                <text class="goods-price">¥{{ goods.price }}</text>
                <text class="goods-quantity">x{{ goods.quantity }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 店铺优惠券 -->
        <view class="shop-coupon" @click="selectCoupon(shop)">
          <text class="label">优惠券</text>
          <view class="coupon-info">
            <text v-if="shop.selectedCoupon" class="selected">
              已选择{{ shop.selectedCoupon.name }}
            </text>
            <text v-else class="none">暂无可用</text>
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>

        <!-- 配送方式 -->
        <view class="delivery">
          <text class="label">配送方式</text>
          <view class="delivery-info">
            <text class="method">快递配送</text>
            <text class="fee">¥{{ shop.deliveryFee }}</text>
          </view>
        </view>

        <!-- 店铺小计 -->
        <view class="shop-total">
          <text>共{{ shop.totalQuantity }}件</text>
          <text>小计：</text>
          <text class="price">¥{{ shop.totalPrice }}</text>
        </view>
      </view>
    </view>

    <!-- 支付方式 -->
    <view class="payment-method">
      <text class="label">支付方式</text>
      <view class="method-list">
        <view
          v-for="method in paymentMethods"
          :key="method.id"
          class="method-item"
          :class="{ active: selectedPayment === method.id }"
          @click="selectedPayment = method.id"
        >
          <text class="iconfont" :class="method.icon"></text>
          <text class="name">{{ method.name }}</text>
          <text class="selected" v-if="selectedPayment === method.id">✓</text>
        </view>
      </view>
    </view>

    <!-- 订单备注 -->
    <view class="remark">
      <text class="label">订单备注</text>
      <input
        type="text"
        v-model="remark"
        placeholder="选填，填写订单备注信息"
        placeholder-class="placeholder"
      />
    </view>

    <!-- 底部结算栏 -->
    <view class="bottom-bar">
      <view class="price-info">
        <text>实付款：</text>
        <text class="total-price">¥{{ totalPrice }}</text>
      </view>
      <view class="submit-btn" @click="submitOrder">提交订单</view>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'

const router = useRouter()

// 收货地址
const address = ref<any>(null)

// 店铺列表
interface GoodsItem {
  id: number
  name: string
  spec: string
  price: number
  quantity: number
  image: string
}

interface ShopItem {
  id: number
  name: string
  avatar: string
  deliveryFee: number
  selectedCoupon: any
  goodsList: GoodsItem[]
  totalQuantity?: number
  totalPrice?: string
}

const shopList = ref<ShopItem[]>([
  {
    id: 1,
    name: '生鲜专卖店',
    avatar: '/static/shops/shop1.png',
    deliveryFee: 8,
    selectedCoupon: null,
    goodsList: [
      {
        id: 1,
        name: '新鲜水果玉米',
        spec: '5斤装',
        price: 29.9,
        quantity: 1,
        image: '/static/goods/corn.jpg',
      },
      {
        id: 2,
        name: '有机胡萝卜',
        spec: '2.5kg',
        price: 15.8,
        quantity: 2,
        image: '/static/goods/carrot.jpg',
      },
    ],
  },
])

// 计算店铺商品总数和总价
shopList.value.forEach((shop) => {
  shop.totalQuantity = shop.goodsList.reduce((sum, goods) => sum + goods.quantity, 0)
  shop.totalPrice = shop.goodsList
    .reduce((sum, goods) => sum + goods.price * goods.quantity, 0)
    .toFixed(2)
})

// 支付方式
const paymentMethods = [
  { id: 1, name: '微信支付', icon: 'icon-wechat' },
  { id: 2, name: '支付宝', icon: 'icon-alipay' },
]
const selectedPayment = ref(1)

// 订单备注
const remark = ref('')

// 计算总价
const totalPrice = computed(() => {
  return shopList.value
    .reduce((sum, shop) => {
      const subtotal = parseFloat(shop.totalPrice)
      const discount = shop.selectedCoupon ? shop.selectedCoupon.amount : 0
      return sum + subtotal + shop.deliveryFee - discount
    }, 0)
    .toFixed(2)
})

// 监听地址选择
onMounted(() => {
  uni.$on('addressSelected', (selectedAddress: any) => {
    address.value = selectedAddress
  })
})

// 选择收货地址
const selectAddress = () => {
  router.navigate('/pages-sub/user/address')
}

// 选择优惠券
const selectCoupon = (shop: any) => {
  router.navigate(`/pages-sub/shop/coupons?id=${shop.id}`)
}

// 提交订单
const submitOrder = async () => {
  if (!address.value) {
    showToast('请选择收货地址')
    return
  }

  if (!selectedPayment.value) {
    showToast('请选择支付方式')
    return
  }

  try {
    // TODO: 调用创建订单接口
    showToast('订单提交成功', { icon: 'success' })
    setTimeout(() => {
      router.navigate('/pages/order/list')
    }, 1500)
  } catch (error) {
    showToast('订单提交失败')
  }
}
</script>

<style lang="scss">
.order-create {
  min-height: 100vh;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  background-color: #f8f8f8;
}

.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 32rpx;
  background: linear-gradient(to bottom, #fff, rgba(255, 255, 255, 0.98));
  backdrop-filter: blur(10px);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .back {
    padding: 20rpx;
    margin: -20rpx;
    margin-right: 0;

    .iconfont {
      font-size: 36rpx;
      color: #333;
    }
  }

  .title {
    flex: 1;
    margin-left: 32rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
}

.address-card {
  display: flex;
  align-items: center;
  padding: 30rpx;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;

  .address-info {
    flex: 1;
    margin-right: 20rpx;

    .user-info {
      margin-bottom: 16rpx;

      .name {
        margin-right: 20rpx;
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .phone {
        font-size: 28rpx;
        color: #666;
      }
    }

    .address {
      font-size: 28rpx;
      line-height: 1.5;
      color: #333;
    }
  }

  .no-address {
    display: flex;
    flex: 1;
    align-items: center;
    margin-right: 20rpx;

    .iconfont {
      margin-right: 8rpx;
      font-size: 32rpx;
      color: #999;
    }

    text {
      font-size: 28rpx;
      color: #999;
    }
  }

  .iconfont {
    font-size: 32rpx;
    color: #999;
  }
}

.goods-list {
  margin: 20rpx;

  .shop-group {
    margin-bottom: 20rpx;
    overflow: hidden;
    background-color: #fff;
    border-radius: 16rpx;

    .shop-header {
      display: flex;
      align-items: center;
      padding: 20rpx;
      border-bottom: 1rpx solid #f5f5f5;

      .shop-avatar {
        width: 48rpx;
        height: 48rpx;
        margin-right: 16rpx;
        border-radius: 8rpx;
      }

      .shop-name {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }
    }

    .goods-items {
      .goods-item {
        display: flex;
        padding: 20rpx;
        border-bottom: 1rpx solid #f5f5f5;

        .goods-image {
          width: 160rpx;
          height: 160rpx;
          margin-right: 20rpx;
          border-radius: 12rpx;
        }

        .goods-info {
          display: flex;
          flex: 1;
          flex-direction: column;

          .goods-name {
            margin-bottom: 12rpx;
            font-size: 28rpx;
            font-weight: bold;
            color: #333;
          }

          .goods-spec {
            margin-bottom: 20rpx;
            font-size: 24rpx;
            color: #999;
          }

          .goods-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .goods-price {
              font-size: 32rpx;
              font-weight: bold;
              color: #ff6b6b;
            }

            .goods-quantity {
              font-size: 28rpx;
              color: #999;
            }
          }
        }
      }
    }

    .shop-coupon,
    .delivery {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20rpx;
      border-bottom: 1rpx solid #f5f5f5;

      .label {
        font-size: 28rpx;
        color: #333;
      }

      .coupon-info,
      .delivery-info {
        display: flex;
        align-items: center;

        text {
          font-size: 28rpx;
          color: #666;

          &.selected {
            color: #ff6b6b;
          }

          &.none {
            color: #999;
          }
        }

        .iconfont {
          margin-left: 8rpx;
          font-size: 32rpx;
          color: #999;
        }

        .fee {
          color: #ff6b6b;
        }
      }
    }

    .shop-total {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 20rpx;

      text {
        margin-left: 20rpx;
        font-size: 28rpx;
        color: #666;

        &.price {
          font-size: 32rpx;
          font-weight: bold;
          color: #ff6b6b;
        }
      }
    }
  }
}

.payment-method {
  padding: 20rpx;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;

  .label {
    margin-bottom: 20rpx;
    font-size: 28rpx;
    color: #333;
  }

  .method-list {
    .method-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      &.active {
        .name {
          color: #018d71;
        }
      }

      .iconfont {
        margin-right: 16rpx;
        font-size: 40rpx;

        &.icon-wechat {
          color: #07c160;
        }

        &.icon-alipay {
          color: #1677ff;
        }
      }

      .name {
        flex: 1;
        font-size: 28rpx;
        color: #333;
      }

      .selected {
        font-size: 32rpx;
        color: #018d71;
      }
    }
  }
}

.remark {
  padding: 20rpx;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;

  .label {
    margin-bottom: 20rpx;
    font-size: 28rpx;
    color: #333;
  }

  input {
    width: 100%;
    font-size: 28rpx;
    color: #333;

    &.placeholder {
      color: #999;
    }
  }
}

.bottom-bar {
  position: fixed;
  right: 0;
  bottom: env(safe-area-inset-bottom);
  left: 0;
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 0 32rpx;
  background: linear-gradient(to bottom, #fff, rgba(255, 255, 255, 0.98));
  backdrop-filter: blur(10px);
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .price-info {
    flex: 1;

    text {
      font-size: 28rpx;
      color: #333;
    }

    .total-price {
      font-size: 36rpx;
      font-weight: bold;
      color: #ff6b6b;
    }
  }

  .submit-btn {
    width: 240rpx;
    height: 80rpx;
    font-size: 32rpx;
    line-height: 80rpx;
    color: #fff;
    text-align: center;
    background-color: #018d71;
    border-radius: 40rpx;
  }
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom);
}
</style>
