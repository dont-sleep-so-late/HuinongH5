<template>
  <view class="cart-page">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="title">购物车</text>
      <text class="edit-btn" @click="isEdit = !isEdit">{{ isEdit ? '完成' : '编辑' }}</text>
    </view>

    <!-- 购物车为空 -->
    <view class="empty" v-if="cartList.length === 0">
      <image src="/static/icons/empty-cart.png" mode="aspectFit" class="empty-icon" />
      <text class="empty-text">购物车还是空的</text>
      <wd-button type="primary" size="small" @click="goShopping">去逛逛</wd-button>
    </view>

    <!-- 购物车列表 -->
    <scroll-view v-else scroll-y class="cart-list">
      <!-- 商家分组 -->
      <view v-for="shop in cartList" :key="shop.id" class="shop-group">
        <!-- 商家信息 -->
        <view class="shop-header">
          <view class="shop-info">
            <wd-checkbox
              v-model="shop.checked"
              @change="handleShopCheck(shop)"
              class="checkbox"
            ></wd-checkbox>
            <image :src="shop.avatar" mode="aspectFill" class="shop-avatar" />
            <text class="shop-name">{{ shop.name }}</text>
          </view>
          <view class="shop-coupon" @click="viewShopCoupons(shop)">
            <text class="coupon-text">领券</text>
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>

        <!-- 商品列表 -->
        <view class="goods-list">
          <view v-for="goods in shop.goodsList" :key="goods.id" class="goods-item">
            <wd-checkbox
              v-model="goods.checked"
              @change="handleGoodsCheck(shop, goods)"
              class="checkbox"
            ></wd-checkbox>
            <image
              :src="goods.image"
              mode="aspectFill"
              class="goods-image"
              @click="viewGoodsDetail(goods)"
            />
            <view class="goods-info">
              <text class="goods-name" @click="viewGoodsDetail(goods)">{{ goods.name }}</text>
              <text class="goods-spec">{{ goods.spec }}</text>
              <view class="goods-bottom">
                <text class="goods-price">¥{{ goods.price }}</text>
                <view class="quantity-control">
                  <text
                    class="minus"
                    :class="{ disabled: goods.quantity <= 1 }"
                    @click="updateQuantity(shop, goods, -1)"
                  >
                    -
                  </text>
                  <input
                    type="number"
                    class="quantity"
                    v-model="goods.quantity"
                    @blur="handleQuantityBlur(shop, goods)"
                  />
                  <text class="plus" @click="updateQuantity(shop, goods, 1)">+</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部结算栏 -->
    <view class="bottom-bar">
      <view class="select-all">
        <wd-checkbox
          v-model="isAllChecked"
          @change="handleSelectAll"
          class="checkbox"
        ></wd-checkbox>
        <text>全选</text>
      </view>
      <view v-if="!isEdit" class="total-info">
        <view class="price-info">
          <text>合计：</text>
          <text class="total-price">¥{{ totalPrice }}</text>
        </view>
        <text class="tip">不含运费</text>
      </view>
      <view class="action-btns">
        <wd-button v-if="isEdit" type="warning" :disabled="!hasChecked" @click="deleteSelected">
          删除
        </wd-button>
        <wd-button v-else type="primary" :disabled="!hasChecked" @click="settlement">
          结算({{ checkedCount }})
        </wd-button>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'

const router = useRouter()

// 编辑模式
const isEdit = ref(false)

// 购物车数据
const cartList = ref([
  {
    id: 1,
    name: '生鲜专卖店',
    avatar: '/static/shops/shop1.png',
    checked: false,
    goodsList: [
      {
        id: 1,
        name: '新鲜水果玉米',
        spec: '5斤装',
        price: 29.9,
        quantity: 1,
        image: '/static/goods/corn.jpg',
        checked: false,
      },
      {
        id: 2,
        name: '有机胡萝卜',
        spec: '2.5kg',
        price: 15.8,
        quantity: 2,
        image: '/static/goods/carrot.jpg',
        checked: false,
      },
    ],
  },
  {
    id: 2,
    name: '农产品直营店',
    avatar: '/static/shops/shop2.png',
    checked: false,
    goodsList: [
      {
        id: 3,
        name: '新鲜土豆',
        spec: '10斤装',
        price: 39.9,
        quantity: 1,
        image: '/static/goods/potato.jpg',
        checked: false,
      },
    ],
  },
])

// 计算是否全选
const isAllChecked = computed(() => {
  if (cartList.value.length === 0) return false
  return cartList.value.every(
    (shop) => shop.checked && shop.goodsList.every((goods) => goods.checked),
  )
})

// 计算选中商品数量
const checkedCount = computed(() => {
  return cartList.value.reduce((count, shop) => {
    return count + shop.goodsList.filter((goods) => goods.checked).length
  }, 0)
})

// 计算是否有选中商品
const hasChecked = computed(() => checkedCount.value > 0)

// 计算总价
const totalPrice = computed(() => {
  return cartList.value
    .reduce((total, shop) => {
      return (
        total +
        shop.goodsList.reduce((shopTotal, goods) => {
          return shopTotal + (goods.checked ? goods.price * goods.quantity : 0)
        }, 0)
      )
    }, 0)
    .toFixed(2)
})

// 处理商家选择
const handleShopCheck = (shop: any) => {
  shop.goodsList.forEach((goods: any) => {
    goods.checked = shop.checked
  })
}

// 处理商品选择
const handleGoodsCheck = (shop: any, goods: any) => {
  shop.checked = shop.goodsList.every((item: any) => item.checked)
}

// 全选/取消全选
const handleSelectAll = () => {
  const checked = !isAllChecked.value
  cartList.value.forEach((shop) => {
    shop.checked = checked
    shop.goodsList.forEach((goods) => {
      goods.checked = checked
    })
  })
}

// 更新商品数量
const updateQuantity = (shop: any, goods: any, delta: number) => {
  const newQuantity = goods.quantity + delta
  if (newQuantity < 1) return
  if (newQuantity > 99) {
    showToast('最多购买99件')
    return
  }
  goods.quantity = newQuantity
}

// 处理数量输入
const handleQuantityBlur = (shop: any, goods: any) => {
  let quantity = parseInt(goods.quantity)
  if (isNaN(quantity) || quantity < 1) {
    quantity = 1
  } else if (quantity > 99) {
    quantity = 99
    showToast('最多购买99件')
  }
  goods.quantity = quantity
}

// 删除选中商品
const deleteSelected = () => {
  uni.showModal({
    title: '提示',
    content: '确定要删除选中的商品吗？',
    success: (res) => {
      if (res.confirm) {
        cartList.value = cartList.value.filter((shop) => {
          // 过滤未选中的商品
          shop.goodsList = shop.goodsList.filter((goods) => !goods.checked)
          // 返回还有商品的店铺
          return shop.goodsList.length > 0
        })
        showToast('删除成功')
      }
    },
  })
}

// 查看商品详情
const viewGoodsDetail = (goods: any) => {
  router.navigate(`/pages-sub/goods/detail?id=${goods.id}`)
}

// 查看店铺优惠券
const viewShopCoupons = (shop: any) => {
  router.navigate(`/pages-sub/shop/coupons?id=${shop.id}`)
}

// 去结算
const settlement = () => {
  const selectedGoods = cartList.value.reduce((result: any[], shop) => {
    const shopGoods = shop.goodsList
      .filter((goods) => goods.checked)
      .map((goods) => ({
        shopId: shop.id,
        shopName: shop.name,
        goodsId: goods.id,
        quantity: goods.quantity,
      }))
    return result.concat(shopGoods)
  }, [])

  if (selectedGoods.length === 0) {
    showToast('请选择要结算的商品')
    return
  }

  // 将选中的商品信息传递给订单创建页面
  uni.setStorageSync('settlement_goods', selectedGoods)
  router.navigate('/pages-sub/order/create')
}

// 去购物
const goShopping = () => {
  router.switchTab('/pages/index/index')
}
</script>

<style lang="scss">
.cart-page {
  min-height: 100vh;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom) + 100rpx);
  background-color: #f8f8f8;
}

.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
  background: linear-gradient(to bottom, #fff, rgba(255, 255, 255, 0.98));
  backdrop-filter: blur(10px);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .edit-btn {
    font-size: 28rpx;
    color: #666;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;

  .empty-icon {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: 40rpx;
  }

  .empty-text {
    margin-bottom: 40rpx;
    font-size: 28rpx;
    color: #999;
  }
}

.cart-list {
  height: calc(100vh - 208rpx - 100rpx);
}

.shop-group {
  margin-bottom: 20rpx;
  overflow: hidden;
  background-color: #fff;
  border-radius: 16rpx;

  .shop-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx;
    border-bottom: 1rpx solid #f5f5f5;

    .shop-info {
      display: flex;
      align-items: center;

      .checkbox {
        margin-right: 20rpx;
      }

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

    .shop-coupon {
      display: flex;
      align-items: center;
      padding: 8rpx 20rpx;
      background-color: #fff5f5;
      border-radius: 100rpx;

      .coupon-text {
        margin-right: 4rpx;
        font-size: 24rpx;
        color: #ff6b6b;
      }

      .iconfont {
        font-size: 24rpx;
        color: #ff6b6b;
      }
    }
  }

  .goods-list {
    .goods-item {
      display: flex;
      align-items: center;
      padding: 20rpx;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .checkbox {
        margin-right: 20rpx;
      }

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

          .quantity-control {
            display: flex;
            align-items: center;
            border: 1rpx solid #eee;
            border-radius: 8rpx;

            .minus,
            .plus {
              width: 60rpx;
              height: 60rpx;
              font-size: 28rpx;
              line-height: 60rpx;
              color: #333;
              text-align: center;
              background-color: #f8f8f8;

              &.disabled {
                color: #ccc;
              }
            }

            .quantity {
              width: 80rpx;
              height: 60rpx;
              font-size: 28rpx;
              line-height: 60rpx;
              color: #333;
              text-align: center;
              border-right: 1rpx solid #eee;
              border-left: 1rpx solid #eee;
            }
          }
        }
      }
    }
  }
}

.bottom-bar {
  position: fixed;
  right: 0;
  bottom: calc(env(safe-area-inset-bottom) + 100rpx);
  left: 0;
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 0 32rpx;
  background: linear-gradient(to bottom, #fff, rgba(255, 255, 255, 0.98));
  backdrop-filter: blur(10px);
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .select-all {
    display: flex;
    align-items: center;

    .checkbox {
      margin-right: 16rpx;
    }

    text {
      font-size: 28rpx;
      color: #333;
    }
  }

  .total-info {
    flex: 1;
    margin-left: 40rpx;

    .price-info {
      display: flex;
      align-items: baseline;

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

    .tip {
      font-size: 24rpx;
      color: #999;
    }
  }

  .action-btns {
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
