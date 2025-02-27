<route lang="json5">
{
  style: {
    navigationBarTitleText: '订单确认',
  },
}
</route>
<template>
  <view class="container">
    <!-- 收货地址 -->
    <view class="address-card" @click="navigateToAddressList">
      <template v-if="selectedAddress">
        <view class="address-info">
          <view class="name-phone">
            <text class="name">{{ selectedAddress.receiverName }}</text>
            <text class="phone">{{ selectedAddress.receiverPhone }}</text>
          </view>
          <view class="address-detail">
            {{ formatAddress(selectedAddress) }}
          </view>
        </view>
        <view class="address-right">
          <wd-icon name="arrow-right" color="#999" size="32" />
        </view>
      </template>
      <view class="no-address" v-else>
        <text>请选择收货地址</text>
        <view class="address-right">
          <wd-icon name="arrow-right" color="#999" size="32" />
        </view>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="goods-card">
      <view class="card-title">商品信息</view>
      <view class="goods-list">
        <view
          class="goods-item"
          v-for="item in orderPreview.items"
          :key="item.productId + '-' + item.specId"
        >
          <image class="goods-image" :src="item.productImage" mode="aspectFill" />
          <view class="goods-info">
            <view class="goods-name">{{ item.productName }}</view>
            <view class="goods-spec">{{ item.specName }}</view>
            <view class="goods-price-num">
              <text class="price">¥{{ item.price }}</text>
              <text class="num">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 优惠券 -->
    <view class="discount-card" @click="showCouponSelector = true">
      <view class="card-row">
        <view class="row-label">优惠券</view>
        <view class="row-value">
          <text v-if="selectedCoupon">
            {{ formatCouponValue(selectedCoupon) }}
          </text>
          <text v-else-if="availableCoupons.length > 0" class="available">
            {{ availableCoupons.length }}张可用
          </text>
          <text v-else class="unavailable">无可用优惠券</text>
          <wd-icon name="arrow-right" color="#999" size="32" />
        </view>
      </view>
    </view>

    <!-- 配送方式 -->
    <view class="delivery-card">
      <view class="card-row">
        <view class="row-label">配送方式</view>
        <view class="row-value">
          <text>普通快递</text>
        </view>
      </view>
      <view class="card-row">
        <view class="row-label">配送费用</view>
        <view class="row-value">
          <text>¥{{ orderPreview.freightAmount.toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 买家留言 -->
    <view class="remark-card">
      <view class="remark-title">买家留言</view>
      <wd-input
        v-model="remark"
        placeholder="选填，请先与商家协商一致"
        maxlength="50"
        show-word-limit
      />
    </view>

    <!-- 金额明细 -->
    <view class="amount-card">
      <view class="card-row">
        <view class="row-label">商品金额</view>
        <view class="row-value">
          <text>¥{{ orderPreview.totalAmount.toFixed(2) }}</text>
        </view>
      </view>
      <view class="card-row">
        <view class="row-label">运费</view>
        <view class="row-value">
          <text>¥{{ orderPreview.freightAmount.toFixed(2) }}</text>
        </view>
      </view>
      <view class="card-row" v-if="couponDiscount > 0">
        <view class="row-label">优惠券</view>
        <view class="row-value discount">
          <text>-¥{{ couponDiscount.toFixed(2) }}</text>
        </view>
      </view>
    </view>

    <!-- 底部结算栏 -->
    <view class="footer">
      <view class="total">
        <text>实付款：</text>
        <text class="total-price">¥{{ calculateFinalAmount().toFixed(2) }}</text>
      </view>
      <wd-button type="primary" class="pay-btn" :loading="submitting" @click="handleSubmitOrder">
        提交订单
      </wd-button>
    </view>

    <!-- 优惠券选择弹窗 -->
    <wd-popup
      v-model="showCouponSelector"
      position="bottom"
      round
      safe-area-inset-bottom
      class="coupon-popup"
    >
      <view class="popup-header">
        <text class="popup-title">选择优惠券</text>
        <wd-icon name="close" @click="showCouponSelector = false" />
      </view>
      <view class="popup-content">
        <view class="no-coupon" v-if="availableCoupons.length === 0">
          <image src="/static/images/empty/empty-coupon.png" mode="aspectFit"></image>
          <text>暂无可用优惠券</text>
        </view>
        <scroll-view scroll-y class="coupon-scroll" v-else>
          <view class="coupon-list">
            <view
              class="coupon-item"
              v-for="coupon in availableCoupons"
              :key="coupon.id"
              @click="selectCoupon(coupon)"
            >
              <view class="coupon-left">
                <view class="coupon-amount">
                  <text class="symbol" v-if="coupon.type === 'cash'">¥</text>
                  <text class="value">{{ formatCouponValue(coupon) }}</text>
                  <text class="unit" v-if="coupon.type === 'discount'">折</text>
                </view>
                <view class="coupon-limit">
                  {{ formatLimitDesc(coupon) }}
                </view>
              </view>
              <view class="coupon-center">
                <view class="coupon-name">{{ coupon.name }}</view>
                <view class="coupon-time">{{ formatTime(coupon) }}</view>
                <view class="coupon-desc">{{ coupon.description }}</view>
              </view>
              <view class="coupon-right">
                <view class="radio-wrapper">
                  <wd-icon
                    :name="selectedCoupon?.id === coupon.id ? 'check-round-fill' : 'check-round'"
                    :color="selectedCoupon?.id === coupon.id ? '#018d71' : '#ccc'"
                    size="40"
                  />
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
      <view class="popup-footer">
        <wd-button type="primary" block @click="confirmCoupon">确定</wd-button>
      </view>
    </wd-popup>

    <!-- 地址选择弹窗 -->
    <!-- 弹窗提示 -->
    <wd-toast ref="toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useToast } from '@/hooks/useToast'
import {
  OrderPreview,
  BuyNowPreviewParams,
  BuyNowOrderParams,
  CartOrderParams,
  previewBuyNowOrder,
  previewCartOrder,
  createBuyNowOrder,
  createCartOrder,
} from '@/services/order'
import { Coupon, getOrderCoupons } from '@/services/coupon'
import type { AddressInfo } from '@/types/address'
import { addressService } from '@/services/address'
import type { Query } from '@/types/query'

// 状态
const orderPreview = ref<OrderPreview>({
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
  freightAmount: 0,
  payAmount: 0,
})
const selectedAddress = ref<AddressInfo | null>(null)
const addresses = ref<AddressInfo[]>([])
const availableCoupons = ref<Coupon[]>([])
const selectedCoupon = ref<Coupon | null>(null)
const tempSelectedCoupon = ref<Coupon | null>(null)
const remark = ref('')
const submitting = ref(false)
const showCouponSelector = ref(false)

// 接收页面参数
const orderType = ref<'buyNow' | 'cart'>('buyNow')
const params = ref<any>({})

// hooks
const { toastRef: toast, success, error } = useToast()

// 生命周期
onLoad((query?: Query) => {
  // 解析参数
  if (query?.type === 'cart') {
    orderType.value = 'cart'
    if (query?.cartIds) {
      params.value.cartItemIds = String(query.cartIds).split(',').map(Number)
    }
  } else {
    orderType.value = 'buyNow'
    if (query?.productId && query?.specId && query?.quantity) {
      params.value = {
        productId: Number(query.productId),
        specId: Number(query.specId),
        quantity: Number(query.quantity),
      }
    }
  }
  loadData()
})

// 加载数据
const loadData = async () => {
  await Promise.all([loadAddressList(), loadOrderPreview(), loadCoupons()])
}

// 加载地址列表
const loadAddressList = async () => {
  try {
    const { data } = await addressService.list()
    addresses.value = data || []
    // 如果有默认地址，使用默认地址
    const defaultRes = await addressService.getDefault()
    if (defaultRes.data) {
      selectedAddress.value = defaultRes.data
    } else if (addresses.value.length > 0) {
      selectedAddress.value = addresses.value[0]
    }
  } catch (err) {
    console.error('获取地址列表失败', err)
    error('获取地址列表失败')
  }
}

// 加载订单预览数据
const loadOrderPreview = async () => {
  try {
    let res
    if (orderType.value === 'buyNow') {
      const previewParams: BuyNowPreviewParams = params.value
      res = await previewBuyNowOrder(previewParams)
    } else {
      res = await previewCartOrder(params.value.cartItemIds)
    }

    if (res.data) {
      orderPreview.value = res.data
    }
  } catch (err) {
    console.error('获取订单预览数据失败', err)
    error('获取订单预览数据失败，请稍后再试')
  }
}

// 加载可用优惠券
const loadCoupons = async () => {
  try {
    const res = await getOrderCoupons(orderPreview.value.totalAmount)
    availableCoupons.value = res.data || []
  } catch (err) {
    console.error('获取可用优惠券失败', err)
  }
}

// 导航到地址列表
const navigateToAddressList = () => {
  uni.navigateTo({
    url: '/pages-sub/user/address/list/index?select=true',
    events: {
      // 监听地址选择事件
      selectAddress: (address: AddressInfo) => {
        selectedAddress.value = address
      },
    },
  })
}

// 格式化地址
const formatAddress = (address: AddressInfo) => {
  return `${address.province}${address.city}${address.district}${address.detailAddress}`
}

// 选择优惠券
const selectCoupon = (coupon: Coupon) => {
  if (tempSelectedCoupon.value?.id === coupon.id) {
    tempSelectedCoupon.value = null
  } else {
    tempSelectedCoupon.value = coupon
  }
}

// 确认选择的优惠券
const confirmCoupon = () => {
  selectedCoupon.value = tempSelectedCoupon.value
  showCouponSelector.value = false
}

// 格式化优惠券金额
const formatCouponValue = (coupon: Coupon): string => {
  if (coupon.type === 'cash') {
    return `¥${coupon.value}优惠券`
  } else if (coupon.type === 'discount') {
    return `${coupon.value * 10}折优惠券`
  } else {
    return '无门槛优惠券'
  }
}

// 格式化使用限制描述
const formatLimitDesc = (coupon: Coupon): string => {
  if (coupon.minAmount > 0) {
    return `满${coupon.minAmount}元可用`
  } else {
    return '无门槛使用'
  }
}

// 格式化时间
const formatTime = (coupon: Coupon): string => {
  const end = new Date(coupon.endTime)
  const now = new Date()

  // 计算剩余天数
  const diff = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) {
    return '已过期'
  } else if (diff === 0) {
    return '今日到期'
  } else {
    return `${diff}天后到期`
  }
}

// 计算优惠券折扣金额
const couponDiscount = computed(() => {
  if (!selectedCoupon.value) return 0

  const totalAmount = orderPreview.value.totalAmount

  if (selectedCoupon.value.type === 'cash') {
    // 满减券
    if (totalAmount >= selectedCoupon.value.minAmount) {
      return selectedCoupon.value.value
    }
  } else if (selectedCoupon.value.type === 'discount') {
    // 折扣券
    if (totalAmount >= selectedCoupon.value.minAmount) {
      return totalAmount * (1 - selectedCoupon.value.value)
    }
  } else if (selectedCoupon.value.type === 'unlimited') {
    // 无门槛券，直接返回优惠金额
    return selectedCoupon.value.value
  }

  return 0
})

// 计算最终支付金额
const calculateFinalAmount = () => {
  const totalAmount = orderPreview.value.totalAmount
  const freightAmount = orderPreview.value.freightAmount

  // 减去优惠券折扣
  return totalAmount + freightAmount - couponDiscount.value
}

// 提交订单
const handleSubmitOrder = async () => {
  if (!selectedAddress.value) {
    error('请选择收货地址')
    return
  }

  try {
    submitting.value = true
    let orderId: string
    if (orderType.value === 'buyNow') {
      const { data } = await createBuyNowOrder({
        ...params.value,
        addressId: selectedAddress.value.id,
        couponId: selectedCoupon.value?.id,
        remark: remark.value,
      })
      orderId = data.toString()
    } else {
      const { data } = await createCartOrder({
        cartItemIds: params.value.cartItemIds,
        addressId: selectedAddress.value.id,
        couponId: selectedCoupon.value?.id,
        remark: remark.value,
      })
      orderId = data.toString()
    }
    handleOrderCreated(orderId)
  } catch (err) {
    console.error('提交订单失败', err)
    error('提交订单失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}

// 处理订单创建结果
const handleOrderCreated = (orderId: string) => {
  // 跳转到支付页面
  uni.redirectTo({
    url: `/pages-sub/order/pay?orderId=${orderId}`,
  })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding-bottom: 140rpx;
  background-color: #f5f6fa;
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

    .name-phone {
      margin-bottom: 16rpx;

      .name {
        margin-right: 20rpx;
        font-size: 32rpx;
        font-weight: bold;
      }

      .phone {
        font-size: 28rpx;
        color: #666;
      }
    }

    .address-detail {
      font-size: 28rpx;
      line-height: 1.5;
      color: #333;
    }
  }

  .no-address {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: space-between;
    font-size: 30rpx;
    color: #999;
  }
}

.goods-card,
.discount-card,
.delivery-card,
.remark-card,
.amount-card {
  margin: 20rpx;
  overflow: hidden;
  background-color: #fff;
  border-radius: 16rpx;
}

.card-title {
  padding: 30rpx;
  font-size: 30rpx;
  font-weight: bold;
  border-bottom: 1px solid #f5f5f5;
}

.goods-list {
  padding: 0 30rpx;
}

.goods-item {
  display: flex;
  padding: 30rpx 0;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  .goods-image {
    width: 160rpx;
    height: 160rpx;
    margin-right: 20rpx;
    border-radius: 8rpx;
  }

  .goods-info {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-between;

    .goods-name {
      margin-bottom: 10rpx;
      font-size: 28rpx;
      color: #333;
    }

    .goods-spec {
      font-size: 24rpx;
      color: #999;
    }

    .goods-price-num {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .price {
        font-size: 30rpx;
        font-weight: bold;
        color: #ff5000;
      }

      .num {
        font-size: 28rpx;
        color: #999;
      }
    }
  }
}

.card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }

  .row-label {
    font-size: 28rpx;
    color: #333;
  }

  .row-value {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: #333;

    .available {
      margin-right: 10rpx;
      color: #018d71;
    }

    .unavailable {
      margin-right: 10rpx;
      color: #999;
    }

    &.discount {
      color: #ff5000;
    }
  }
}

.remark-title {
  padding: 30rpx;
  padding-bottom: 20rpx;
  font-size: 28rpx;
  color: #333;
}

.footer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100rpx;
  padding: 0 30rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .total {
    font-size: 28rpx;
    color: #333;

    .total-price {
      font-size: 36rpx;
      font-weight: bold;
      color: #ff5000;
    }
  }

  .pay-btn {
    width: 240rpx;
    background-color: #018d71;
    border-color: #018d71;
    border-radius: 40rpx;
  }
}

.coupon-popup {
  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1px solid #f5f5f5;

    .popup-title {
      font-size: 32rpx;
      font-weight: bold;
    }
  }

  .popup-content {
    max-height: 60vh;
    padding-bottom: 100rpx;

    .no-coupon {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100rpx 0;

      image {
        width: 200rpx;
        height: 200rpx;
        margin-bottom: 20rpx;
      }

      text {
        font-size: 28rpx;
        color: #999;
      }
    }

    .coupon-scroll {
      max-height: 60vh;
    }
  }

  .coupon-list {
    padding: 30rpx;
  }

  .coupon-item {
    position: relative;
    display: flex;
    height: 200rpx;
    margin-bottom: 30rpx;
    overflow: hidden;
    background-color: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 16rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .coupon-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 200rpx;
    padding: 0 20rpx;
    color: #fff;
    background-color: #018d71;

    .coupon-amount {
      display: flex;
      align-items: baseline;

      .symbol {
        margin-right: 4rpx;
        font-size: 24rpx;
      }

      .value {
        font-size: 48rpx;
        font-weight: bold;
        line-height: 1;
      }

      .unit {
        margin-left: 4rpx;
        font-size: 24rpx;
      }
    }

    .coupon-limit {
      margin-top: 12rpx;
      font-size: 20rpx;
      text-align: center;
      opacity: 0.8;
    }
  }

  .coupon-center {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    padding: 20rpx;

    .coupon-name {
      margin-bottom: 12rpx;
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
    }

    .coupon-time {
      margin-bottom: 12rpx;
      font-size: 20rpx;
      color: #999;
    }

    .coupon-desc {
      display: -webkit-box;
      overflow: hidden;
      font-size: 20rpx;
      color: #666;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }

  .coupon-right {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100rpx;
  }

  .popup-footer {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 20rpx 30rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    background-color: #fff;
    border-top: 1px solid #f5f5f5;
  }
}
</style>
