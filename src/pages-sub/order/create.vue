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
      <view class="goods-items">
        <view v-for="item in orderPreview.productList" :key="item.productId" class="goods-item">
          <image :src="item.mainImage" mode="aspectFill" class="goods-image" />
          <view class="goods-info">
            <text class="goods-name">{{ item.productName }}</text>
            <text class="goods-spec">{{ item.specName }}</text>
            <view class="goods-bottom">
              <text class="goods-price">¥{{ item.price.toFixed(2) }}</text>
              <text class="goods-quantity">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 配送方式 -->
      <view class="delivery">
        <text class="label">配送方式</text>
        <view class="delivery-info">
          <text class="method">快递配送</text>
          <text class="fee">¥{{ orderPreview.freightAmount.toFixed(2) }}</text>
        </view>
      </view>

      <!-- 商品总计 -->
      <view class="goods-total">
        <text>
          共{{ orderPreview.productList.reduce((sum, item) => sum + item.quantity, 0) }}件
        </text>
        <text>小计：</text>
        <text class="price">¥{{ orderPreview.totalAmount.toFixed(2) }}</text>
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
        <text class="total-price">¥{{ orderPreview.payableAmount.toFixed(2) }}</text>
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
import { createBuyNowOrder, createCartOrder } from '@/api/order'
import { getAddressList } from '@/api/address'
import { createPayOrder, getPayResult, type PaymentMethod } from '@/api/pay'
import type { ApiResponse } from '@/types/api'
import type { CreateOrderResponse } from '@/api/order'

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

// 支付方式列表
const paymentMethods = [
  {
    id: 'ALIPAY' as PaymentMethod,
    name: '支付宝支付',
    icon: 'icon-alipay',
  },
  {
    id: 'WECHAT' as PaymentMethod,
    name: '微信支付',
    icon: 'icon-wechat',
  },
]

// 选中的支付方式
const selectedPayment = ref<PaymentMethod>('ALIPAY')

// 订单预览数据类型定义
interface OrderPreviewItem {
  productId: number
  productName: string
  mainImage: string
  specId: number
  specName: string
  price: number
  quantity: number
  subtotal: number
}

interface OrderPreviewData {
  productList: OrderPreviewItem[]
  totalAmount: number
  freightAmount: number
  discountAmount: number | null
  payableAmount: number
  availableCoupons: any[] | null
  address: any | null
}

const orderPreview = ref<OrderPreviewData>({
  productList: [],
  totalAmount: 0,
  freightAmount: 0,
  discountAmount: null,
  payableAmount: 0,
  availableCoupons: null,
  address: null,
})

// 订单类型和参数
const orderType = ref<'buy_now' | 'cart'>('buy_now')
const orderParams = ref<any>(null)

// 定义响应式变量
const remark = ref<string>('') // 初始化为空字符串

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

// 获取默认地址
const fetchDefaultAddress = async () => {
  try {
    const res = await getAddressList()
    if (res.code === 200 && Array.isArray(res.data)) {
      // 查找默认地址
      const defaultAddress = res.data.find((addr) => addr.isDefault === true)
      if (defaultAddress) {
        address.value = {
          id: defaultAddress.id,
          name: defaultAddress.name,
          phone: defaultAddress.phone,
          province: defaultAddress.province,
          city: defaultAddress.city,
          district: defaultAddress.district,
          detail: defaultAddress.detail,
          fullAddress: `${defaultAddress.province}${defaultAddress.city}${defaultAddress.district}${defaultAddress.detail}`,
        }
      }
    }
  } catch (error) {
    console.error('获取默认地址失败:', error)
  }
}

// 监听地址选择
onMounted(async () => {
  // 获取本地存储的订单预览数据
  const preview = uni.getStorageSync('order_preview')
  if (preview) {
    orderType.value = preview.type
    orderPreview.value = preview.data
    orderParams.value = preview.params

    // 获取默认地址
    await fetchDefaultAddress()
  } else {
    showToast('订单信息不存在')
    setTimeout(() => {
      router.back()
    }, 1500)
  }

  // 监听地址选择
  uni.$on('onAddressSelect', (selectedAddress: any) => {
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

// 轮询查询支付结果
const startPollingPayResult = (orderId: string) => {
  const maxAttempts = 60 // 最多轮询60次，即10分钟
  let attempts = 0

  const poll = async () => {
    try {
      const res = await getPayResult(orderId)
      if (res.code === 200 && res.data) {
        const result = res.data
        if (result.status === 'PAID') {
          // 支付成功
          showToast('支付成功')
          // 跳转到订单详情页
          router.redirect(`/pages-sub/order/detail?orderId=${orderId}`)
          return
        } else if (result.status === 'CLOSED') {
          // 订单关闭
          showToast('订单已关闭')
          return
        }
      }

      // 继续轮询
      attempts++
      if (attempts < maxAttempts) {
        setTimeout(poll, 10000) // 每10秒查询一次
      }
    } catch (error) {
      console.error('查询支付结果失败：', error)
    }
  }

  // 开始轮询
  poll()
}

// 处理支付
const handlePayment = async (orderId: string) => {
  try {
    if (!orderId) {
      showToast('订单不存在')
      return
    }
    // 创建支付订单
    const res = await createPayOrder(orderId, selectedPayment.value)
    if (res.code === 200 && res.data) {
      const payData = res.data
      if (payData.paymentMethod === 'ALIPAY') {
        // 使用web-view打开支付宝支付页面
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>支付宝支付</title>
            </head>
            <body>
              ${payData.paymentForm}
            </body>
          </html>
        `
        // 打开web-view页面
        uni.navigateTo({
          url: `/pages-sub/common/web-view?html=${encodeURIComponent(htmlContent)}&title=支付宝支付`,
        })

        // 启动轮询查询支付结果
        startPollingPayResult(orderId)
      } else if (payData.paymentMethod === 'WECHAT') {
        // 微信支付，调用微信支付SDK
        uni.requestPayment({
          provider: 'wxpay',
          ...JSON.parse(payData.paymentForm),
          success: () => {
            showToast('支付成功')
            // 跳转到订单详情页
            router.redirect(`/pages-sub/order/detail?orderId=${orderId}`)
          },
          fail: () => {
            showToast('支付失败')
          },
        })
      }
    } else {
      showToast('创建支付订单失败')
    }
  } catch (error: any) {
    showToast(error.message || '支付失败')
  }
}

// 提交订单
const submitOrder = async () => {
  try {
    // 校验表单
    if (!address.value) {
      showToast('请选择收货地址')
      return
    }
    if (!selectedPayment.value) {
      showToast('请选择支付方式')
      return
    }

    // 创建订单
    let orderId: string
    if (orderType.value === 'buy_now') {
      // 立即购买下单
      const res = await createBuyNowOrder({
        ...orderParams.value,
        addressId: address.value.id,
        ...(remark.value ? { remark: remark.value } : {}),
        paymentMethod: selectedPayment.value,
      })
      if (res.code === 200 && res.data) {
        orderId = res.data.orderId
      } else {
        throw new Error('下单失败')
      }
    } else {
      // 购物车下单
      const res = await createCartOrder({
        ...orderParams.value,
        addressId: address.value.id,
        ...(remark.value ? { remark: remark.value } : {}),
        paymentMethod: selectedPayment.value,
      })
      if (res.code === 200 && res.data) {
        orderId = res.data.orderId
      } else {
        throw new Error('下单失败')
      }
    }

    // 创建订单成功，进行支付
    await handlePayment(orderId)
  } catch (error: any) {
    showToast(error.message || '提交订单失败')
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
    margin-left: -20rpx;
    font-size: 36rpx;
    color: #333;
  }

  .title {
    flex: 1;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
  }
}

.address-card {
  display: flex;
  align-items: center;
  padding: 32rpx;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;

  .address-info {
    flex: 1;

    .user-info {
      margin-bottom: 12rpx;

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
      color: #333;
    }
  }

  .no-address {
    flex: 1;
    font-size: 28rpx;
    color: #666;

    .iconfont {
      margin-right: 12rpx;
      font-size: 32rpx;
    }
  }

  .icon-arrow-right {
    font-size: 32rpx;
    color: #999;
  }
}

.goods-list {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;

  .goods-items {
    .goods-item {
      display: flex;
      padding: 20rpx;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .goods-image {
        width: 160rpx;
        height: 160rpx;
        margin-right: 20rpx;
        border-radius: 12rpx;
      }

      .goods-info {
        flex: 1;

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
            color: #666;
          }
        }
      }
    }
  }

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

    .delivery-info {
      .method {
        margin-right: 20rpx;
        font-size: 28rpx;
        color: #666;
      }

      .fee {
        font-size: 28rpx;
        color: #ff6b6b;
      }
    }
  }

  .goods-total {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 20rpx;

    text {
      font-size: 28rpx;
      color: #666;
    }

    .price {
      margin-left: 12rpx;
      font-size: 32rpx;
      font-weight: bold;
      color: #ff6b6b;
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
    display: block;
    margin-bottom: 16rpx;
    font-size: 28rpx;
    color: #333;
  }

  input {
    width: 100%;
    height: 80rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    color: #333;
    background-color: #f8f8f8;
    border-radius: 8rpx;
  }

  .placeholder {
    color: #999;
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
    font-weight: bold;
    line-height: 80rpx;
    color: #fff;
    text-align: center;
    background-color: #ff6b6b;
    border-radius: 40rpx;
  }
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom);
}
</style>
