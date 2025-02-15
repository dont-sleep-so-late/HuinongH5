<template>
  <view class="order-create">
    <!-- 收货地址 -->
    <view class="address-section" @tap="chooseAddress">
      <view class="address-content" v-if="address.name">
        <view class="info">
          <text class="name">{{ address.name }}</text>
          <text class="phone">{{ address.phone }}</text>
        </view>
        <view class="detail">
          {{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}
        </view>
      </view>
      <view class="no-address" v-else>
        <text>请选择收货地址</text>
      </view>
      <text class="icon">></text>
    </view>

    <!-- 商品列表 -->
    <view class="goods-section">
      <view class="goods-item" v-for="(item, index) in orderInfo.goods" :key="index">
        <image :src="item.image" mode="aspectFill" />
        <view class="goods-info">
          <view class="name">{{ item.name }}</view>
          <view class="spec">{{ item.spec }}</view>
          <view class="price-wrap">
            <text class="price">¥{{ item.price }}</text>
            <text class="quantity">x{{ item.quantity }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 优惠券 -->
    <view class="coupon-section" @tap="chooseCoupon">
      <text>优惠券</text>
      <view class="right">
        <text class="value" v-if="selectedCoupon">-¥{{ selectedCoupon.value }}</text>
        <text class="placeholder" v-else>{{ availableCoupons.length }}张可用</text>
        <text class="icon">></text>
      </view>
    </view>

    <!-- 配送方式 -->
    <view class="delivery-section">
      <text>配送方式</text>
      <view class="right">
        <text>快递配送</text>
        <text class="delivery-fee">¥{{ orderInfo.deliveryFee }}</text>
      </view>
    </view>

    <!-- 订单备注 -->
    <view class="remark-section">
      <text>订单备注</text>
      <input
        type="text"
        v-model="remark"
        placeholder="选填，请先和商家协商一致"
        placeholder-class="placeholder"
      />
    </view>

    <!-- 金额明细 -->
    <view class="amount-section">
      <view class="amount-item">
        <text>商品金额</text>
        <text>¥{{ orderInfo.goodsAmount }}</text>
      </view>
      <view class="amount-item">
        <text>运费</text>
        <text>¥{{ orderInfo.deliveryFee }}</text>
      </view>
      <view class="amount-item" v-if="selectedCoupon">
        <text>优惠券</text>
        <text class="minus">-¥{{ selectedCoupon.value }}</text>
      </view>
    </view>

    <!-- 支付方式 -->
    <view class="payment-section">
      <view class="section-title">支付方式</view>
      <view class="payment-list">
        <view
          class="payment-item"
          v-for="(item, index) in paymentMethods"
          :key="index"
          :class="{ active: selectedPayment === index }"
          @tap="selectPayment(index)"
        >
          <image :src="item.icon" mode="aspectFit" />
          <text>{{ item.name }}</text>
          <text class="check">✓</text>
        </view>
      </view>
    </view>

    <!-- 底部结算栏 -->
    <view class="submit-bar">
      <view class="total">
        <text>合计：</text>
        <text class="price">¥{{ totalAmount }}</text>
      </view>
      <button class="submit-btn" @tap="submitOrder">提交订单</button>
    </view>

    <!-- 优惠券弹窗 -->
    <wd-popup v-model="showCoupon" position="bottom">
      <view class="coupon-popup">
        <view class="popup-header">
          <text>优惠券</text>
          <text class="close" @tap="closeCoupon">×</text>
        </view>
        <scroll-view scroll-y class="coupon-list">
          <view
            class="coupon-item"
            v-for="(item, index) in availableCoupons"
            :key="index"
            :class="{ active: selectedCouponIndex === index }"
            @tap="selectCoupon(index)"
          >
            <view class="left">
              <text class="value">¥{{ item.value }}</text>
              <text class="condition">满{{ item.condition }}可用</text>
            </view>
            <view class="right">
              <text class="name">{{ item.name }}</text>
              <text class="time">{{ item.validTime }}</text>
            </view>
            <text class="check">✓</text>
          </view>
        </scroll-view>
        <view class="popup-footer">
          <button class="confirm-btn" @tap="confirmCoupon">确定</button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 收货地址
const address = ref({
  name: '张三',
  phone: '13800138000',
  province: '广东省',
  city: '深圳市',
  district: '南山区',
  detail: '科技园南路XX号',
})

// 订单信息
const orderInfo = ref({
  goods: [
    {
      id: 1,
      name: '新鲜水蜜桃',
      spec: '2.5kg装',
      price: 29.9,
      quantity: 2,
      image: '/static/goods/peach.jpg',
    },
  ],
  goodsAmount: 59.8,
  deliveryFee: 8,
})

// 优惠券
const showCoupon = ref(false)
const selectedCouponIndex = ref(-1)
const availableCoupons = ref([
  {
    id: 1,
    name: '新人专享券',
    value: 10,
    condition: 50,
    validTime: '2024-12-31到期',
  },
  {
    id: 2,
    name: '满减优惠券',
    value: 20,
    condition: 100,
    validTime: '2024-12-31到期',
  },
])

// 支付方式
const paymentMethods = ref([
  {
    name: '微信支付',
    icon: '/static/payment/wechat.png',
  },
  {
    name: '支付宝',
    icon: '/static/payment/alipay.png',
  },
])
const selectedPayment = ref(0)

// 订单备注
const remark = ref('')

// 选中的优惠券
const selectedCoupon = computed(() => {
  if (selectedCouponIndex.value === -1) return null
  return availableCoupons.value[selectedCouponIndex.value]
})

// 总金额
const totalAmount = computed(() => {
  let total = orderInfo.value.goodsAmount + orderInfo.value.deliveryFee
  if (selectedCoupon.value) {
    total -= selectedCoupon.value.value
  }
  return total.toFixed(2)
})

// 选择收货地址
const chooseAddress = () => {
  uni.navigateTo({
    url: '/pages-sub/user/address',
  })
}

// 选择优惠券
const chooseCoupon = () => {
  showCoupon.value = true
}

// 关闭优惠券弹窗
const closeCoupon = () => {
  showCoupon.value = false
}

// 选择优惠券
const selectCoupon = (index: number) => {
  selectedCouponIndex.value = index
}

// 确认优惠券选择
const confirmCoupon = () => {
  closeCoupon()
}

// 选择支付方式
const selectPayment = (index: number) => {
  selectedPayment.value = index
}

// 提交订单
const submitOrder = () => {
  if (!address.value.name) {
    uni.showToast({
      title: '请选择收货地址',
      icon: 'none',
    })
    return
  }

  // 模拟订单提交
  uni.showLoading({
    title: '正在创建订单',
  })

  setTimeout(() => {
    uni.hideLoading()
    uni.showModal({
      title: '提示',
      content: '订单创建成功，是否立即支付？',
      success: (res) => {
        if (res.confirm) {
          // 跳转到支付页面
          uni.navigateTo({
            url: '/pages-sub/order/payment',
          })
        } else {
          // 跳转到订单列表
          uni.redirectTo({
            url: '/pages-sub/order/list',
          })
        }
      },
    })
  }, 1500)
}
</script>

<style lang="scss">
.order-create {
  min-height: 100vh;
  background-color: #f8f8f8;

  .placeholder {
    font-size: 28rpx;
    color: #999;
  }

  .price {
    font-size: 32rpx;
    font-weight: bold;
    color: #f56c6c;
  }

  .check {
    width: 40rpx;
    height: 40rpx;
    border: 2rpx solid #ddd;
    border-radius: 50%;

    &.active {
      background-color: #018d71;
      border-color: #018d71;
    }
  }

  .section {
    margin-bottom: 20rpx;
    background-color: #fff;
    border-radius: 12rpx;
  }

  .address-section {
    position: relative;
    padding: 30rpx;
    margin-bottom: 20rpx;
    background-color: #fff;

    .address-content {
      padding-right: 40rpx;

      .info {
        margin-bottom: 10rpx;

        .name {
          margin-right: 20rpx;
          font-size: 32rpx;
          color: #333;
        }

        .phone {
          font-size: 28rpx;
          color: #666;
        }
      }

      .detail {
        font-size: 28rpx;
        line-height: 1.4;
        color: #666;
      }
    }

    .no-address {
      padding: 30rpx 0;
      font-size: 28rpx;
      color: #999;
      text-align: center;
    }

    .icon {
      position: absolute;
      top: 50%;
      right: 30rpx;
      font-size: 32rpx;
      color: #999;
      transform: translateY(-50%);
    }
  }

  .goods-section {
    padding: 20rpx;
    margin-bottom: 20rpx;
    background-color: #fff;

    .goods-item {
      display: flex;
      padding: 20rpx 0;

      image {
        width: 160rpx;
        height: 160rpx;
        margin-right: 20rpx;
        border-radius: 8rpx;
      }

      .goods-info {
        flex: 1;

        .name {
          margin-bottom: 10rpx;
          font-size: 28rpx;
          color: #333;
        }

        .spec {
          margin-bottom: 20rpx;
          font-size: 24rpx;
          color: #999;
        }

        .price-wrap {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .price {
          font-size: 32rpx;
          font-weight: bold;
          color: #ff6b6b;
        }
      }
    }
  }

  .coupon-section,
  .delivery-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    margin-bottom: 20rpx;
    font-size: 28rpx;
    background-color: #fff;

    .right {
      flex: 1;
      color: #ff6b6b;
      text-align: right;

      .value {
        margin-right: 10rpx;
        color: #f04c41;
      }

      .placeholder {
        margin-right: 10rpx;
        color: #999;
      }

      .icon {
        color: #999;
      }

      .delivery-fee {
        margin-left: 20rpx;
      }
    }
  }

  .remark-section {
    display: flex;
    align-items: center;
    padding: 30rpx;
    margin-bottom: 20rpx;
    font-size: 28rpx;
    background-color: #fff;

    text {
      margin-right: 20rpx;
    }

    input {
      flex: 1;
      font-size: 28rpx;
    }

    .placeholder {
      color: #999;
    }
  }

  .amount-section {
    padding: 30rpx;
    margin-bottom: 20rpx;
    background-color: #fff;

    .amount-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20rpx;
      font-size: 28rpx;
      color: #666;

      &:last-child {
        margin-bottom: 0;
      }

      .minus {
        color: #f04c41;
      }
    }
  }

  .payment-section {
    padding: 30rpx;
    margin-bottom: 20rpx;
    background-color: #fff;

    .section-title {
      margin-bottom: 20rpx;
      font-size: 28rpx;
      color: #333;
    }

    .payment-list {
      .payment-item {
        position: relative;
        display: flex;
        align-items: center;
        padding: 20rpx 0;

        image {
          width: 48rpx;
          height: 48rpx;
          margin-right: 20rpx;
        }

        text {
          font-size: 28rpx;
          color: #333;
        }

        .check {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40rpx;
          height: 40rpx;
          color: transparent;
          border: 2rpx solid #ddd;
          border-radius: 50%;
        }

        &.active {
          background-color: rgba(1, 141, 113, 0.1);

          .check {
            opacity: 1;
          }
        }
      }
    }
  }

  .submit-bar {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx 30rpx;
    background-color: #fff;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

    .total {
      font-size: 28rpx;

      .price {
        font-size: 36rpx;
        font-weight: bold;
        color: #f04c41;
      }
    }

    .submit-btn {
      width: 240rpx;
      height: 80rpx;
      font-size: 28rpx;
      line-height: 80rpx;
      color: #fff;
      text-align: center;
      background-color: #018d71;
      border-radius: 40rpx;
    }
  }

  .coupon-popup {
    .popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 30rpx;
      font-size: 32rpx;
      border-bottom: 2rpx solid #f5f5f5;

      .close {
        font-size: 48rpx;
        color: #999;
      }
    }

    .coupon-list {
      max-height: 60vh;
      padding: 30rpx;

      .coupon-item {
        position: relative;
        display: flex;
        padding: 20rpx;
        margin-bottom: 20rpx;
        background-color: #f8f8f8;
        border-radius: 12rpx;

        .left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 200rpx;
          padding-right: 20rpx;
          border-right: 2rpx dashed #ddd;

          .value {
            font-size: 40rpx;
            font-weight: bold;
            color: #f04c41;
          }

          .condition {
            font-size: 24rpx;
            color: #999;
          }
        }

        .right {
          flex: 1;
          padding-left: 20rpx;

          .name {
            margin-bottom: 10rpx;
            font-size: 28rpx;
            color: #333;
          }

          .time {
            font-size: 24rpx;
            color: #999;
          }
        }

        .check {
          position: absolute;
          top: 50%;
          right: 20rpx;
          color: #018d71;
          opacity: 0;
          transform: translateY(-50%);
        }

        &.active {
          background-color: rgba(1, 141, 113, 0.1);

          .check {
            opacity: 1;
          }
        }
      }
    }

    .popup-footer {
      padding: 20rpx;
      border-top: 2rpx solid #f5f5f5;

      .confirm-btn {
        width: 100%;
        height: 80rpx;
        font-size: 28rpx;
        line-height: 80rpx;
        color: #fff;
        text-align: center;
        background-color: #018d71;
        border-radius: 40rpx;
      }
    }
  }
}
</style>
