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
      <view class="goods-list">
        <view v-for="item in cartList" :key="item.id" class="goods-item">
          <wd-checkbox
            v-model="item.selected"
            @change="handleItemCheck(item)"
            class="checkbox"
          ></wd-checkbox>
          <image
            :src="item.productImage"
            mode="aspectFill"
            class="goods-image"
            @click="viewGoodsDetail(item.productId)"
          />
          <view class="goods-info">
            <text class="goods-name" @click="viewGoodsDetail(item.productId)">
              {{ item.productName }}
            </text>
            <text class="goods-spec">{{ item.specName }}</text>
            <view class="goods-bottom">
              <text class="goods-price">¥{{ item.price }}</text>
              <view class="quantity-control">
                <text
                  class="minus"
                  :class="{ disabled: item.quantity <= 1 }"
                  @click="updateQuantity(item, -1)"
                >
                  -
                </text>
                <input
                  type="number"
                  class="quantity"
                  v-model="item.quantity"
                  @blur="handleQuantityBlur(item)"
                />
                <text class="plus" @click="updateQuantity(item, 1)">+</text>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import { getCartList, updateCartQuantity, deleteCartItems } from '@/services/cart'
import { previewCartOrder } from '@/services/order'
import type { CartItem } from '@/services/cart'

const router = useRouter()

// 编辑模式
const isEdit = ref(false)

// 购物车数据
const cartList = ref<CartItem[]>([])

// 加载购物车数据
const loadCartList = async () => {
  try {
    const res = await getCartList()
    if (res.data) {
      cartList.value = res.data
    }
  } catch (error: any) {
    showToast(error.message || '获取购物车失败')
  }
}

// 计算是否全选
const isAllChecked = computed(() => {
  if (cartList.value.length === 0) return false
  return cartList.value.every((item) => item.selected === 1)
})

// 计算选中商品数量
const checkedCount = computed(() => {
  return cartList.value.filter((item) => item.selected === 1).length
})

// 计算是否有选中商品
const hasChecked = computed(() => checkedCount.value > 0)

// 计算总价
const totalPrice = computed(() => {
  return cartList.value
    .filter((item) => item.selected === 1)
    .reduce((total, item) => total + item.totalPrice, 0)
    .toFixed(2)
})

// 处理商品选择
const handleItemCheck = async (item: CartItem) => {
  // TODO: 调用后端接口更新选中状态
  item.selected = item.selected === 1 ? 0 : 1
}

// 全选/取消全选
const handleSelectAll = () => {
  const newSelected = !isAllChecked.value ? 1 : 0
  cartList.value.forEach((item) => {
    item.selected = newSelected
  })
  // TODO: 调用后端接口批量更新选中状态
}

// 更新商品数量
const updateQuantity = async (item: CartItem, delta: number) => {
  const newQuantity = item.quantity + delta
  if (newQuantity < 1) return
  if (newQuantity > item.stock) {
    showToast('超出库存数量')
    return
  }

  try {
    await updateCartQuantity(item.id, newQuantity)
    item.quantity = newQuantity
    item.totalPrice = item.price * newQuantity
  } catch (error: any) {
    showToast(error.message || '更新数量失败')
  }
}

// 处理数量输入
const handleQuantityBlur = (item: CartItem) => {
  let quantity = parseInt(String(item.quantity))
  if (isNaN(quantity) || quantity < 1) {
    quantity = 1
  } else if (quantity > item.stock) {
    quantity = item.stock
    showToast('超出库存数量')
  }
  updateQuantity(item, quantity - item.quantity)
}

// 删除选中商品
const deleteSelected = async () => {
  const selectedIds = cartList.value.filter((item) => item.selected === 1).map((item) => item.id)

  if (selectedIds.length === 0) {
    showToast('请选择要删除的商品')
    return
  }

  uni.showModal({
    title: '提示',
    content: '确定要删除选中的商品吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteCartItems(selectedIds)
          showToast('删除成功')
          loadCartList() // 重新加载购物车列表
        } catch (error: any) {
          showToast(error.message || '删除失败')
        }
      }
    },
  })
}

// 查看商品详情
const viewGoodsDetail = (productId: number) => {
  router.navigate(`/pages-sub/goods/detail?id=${productId}`)
}

// 去结算
const settlement = async () => {
  const selectedItems = cartList.value.filter((item) => item.selected === 1)

  if (selectedItems.length === 0) {
    showToast('请选择要结算的商品')
    return
  }

  try {
    const cartItemIds = selectedItems.map((item) => item.id)
    const res = await previewCartOrder(cartItemIds)

    if (res.data) {
      // 将预览数据存储到本地，用于订单确认页面
      uni.setStorageSync('order_preview', {
        type: 'cart',
        data: res.data,
        params: {
          cartItemIds,
        },
      })
      router.navigate('/pages-sub/order/create')
    }
  } catch (error: any) {
    showToast(error.message || '获取订单信息失败')
  }
}

// 去购物
const goShopping = () => {
  router.switchTab('/pages/index/index')
}

// 页面加载时获取购物车数据
onMounted(() => {
  loadCartList()
})
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
