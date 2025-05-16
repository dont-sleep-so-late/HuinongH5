<template>
  <view class="cart-page">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="title">购物车</text>
      <text class="edit-btn" @click="isEdit = !isEdit">{{ isEdit ? '完成' : '编辑' }}</text>
    </view>

    <!-- 购物车为空 -->
    <view class="empty" v-if="cartList.length === 0">
      <image src="" mode="aspectFit" class="empty-icon" />
      <text class="empty-text">购物车还是空的</text>
      <wd-button type="primary" size="small" @click="goShopping">去逛逛</wd-button>
    </view>

    <!-- 购物车列表 -->
    <scroll-view v-else scroll-y class="cart-list">
      <view class="goods-list">
        <view v-for="item in cartList" :key="item.id" class="goods-item">
          <wd-checkbox
            :model-value="item.selected === 1"
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
            <text class="goods-spec">{{ item.specName }} {{ item.specValue }}</text>
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
          :model-value="isAllChecked"
          @change="handleSelectAll"
          class="checkbox"
        ></wd-checkbox>
        <text>全选</text>
      </view>
      <view v-if="!isEdit" class="total-info">
        <view class="price-info">
          <text>合计：</text>
          <text class="total-price">{{ totalPrice }}</text>
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
import {
  getCartList,
  updateCartQuantity,
  updateCartItemSelected,
  updateAllSelected,
  deleteCartItems,
  type CartItem,
  type CartSummary,
  type CartListResponse,
} from '@/api/cart'
import { previewCartOrder } from '@/services/order'

const router = useRouter()

// 编辑模式
const isEdit = ref(false)

// 购物车数据
const cartList = ref<CartItem[]>([])
const cartSummary = computed(() => {
  const items = cartList.value
  return {
    totalCount: items.length,
    selectedCount: items.filter((item) => item.selected === 1).length,
    totalAmount: items.reduce((sum, item) => sum + item.totalPrice, 0),
    selectedAmount: items
      .filter((item) => item.selected === 1)
      .reduce((sum, item) => sum + item.totalPrice, 0),
  }
})

// 加载购物车数据
const loadCartList = async () => {
  try {
    const response = await getCartList()
    if (response.code === 200 && response.data) {
      cartList.value = response.data as unknown as CartListResponse
    } else {
      uni.showToast({
        title: response.message || '加载购物车失败',
        icon: 'none',
      })
    }
  } catch (error) {
    console.error('加载购物车失败:', error)
    uni.showToast({
      title: '加载购物车失败',
      icon: 'none',
    })
  }
}

// 计算是否全选
const isAllChecked = computed(() => {
  if (cartList.value.length === 0) return false
  return cartList.value.every((item) => item.selected === 1)
})

// 计算选中商品数量
const checkedCount = computed(() => cartSummary.value.selectedCount)

// 计算是否有选中商品
const hasChecked = computed(() => checkedCount.value > 0)

// 计算总价
const totalPrice = computed(() => cartSummary.value.selectedAmount.toFixed(2))

// 处理商品选择
const handleItemCheck = async (item: CartItem) => {
  try {
    await updateCartItemSelected(item.id, item.selected === 0 ? 1 : 0)
    await loadCartList() // 重新加载以获取最新汇总数据
  } catch (error: any) {
    showToast(error.message || '操作失败')
  }
}

// 全选/取消全选
const handleSelectAll = async () => {
  try {
    await updateAllSelected(isAllChecked.value ? 0 : 1)
    await loadCartList() // 重新加载以获取最新汇总数据
  } catch (error: any) {
    showToast(error.message || '操作失败')
  }
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
    await loadCartList() // 重新加载以获取最新数据
  } catch (error: any) {
    showToast(error.message || '更新数量失败')
  }
}

// 处理数量输入
const handleQuantityBlur = async (item: CartItem) => {
  let quantity = parseInt(String(item.quantity))
  if (isNaN(quantity) || quantity < 1) {
    quantity = 1
  } else if (quantity > item.stock) {
    quantity = item.stock
    showToast('超出库存数量')
  }

  if (quantity !== item.quantity) {
    try {
      await updateCartQuantity(item.id, quantity)
      await loadCartList() // 重新加载以获取最新数据
    } catch (error: any) {
      showToast(error.message || '更新数量失败')
    }
  }
}

// 删除选中商品
const deleteSelected = async () => {
  const selectedIds = cartList.value.filter((item) => item.selected).map((item) => item.id)

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
  router.navigate('/pages-sub/goods/detail', {
    id: String(productId),
  })
}

// 去结算
const settlement = async () => {
  const selectedItems = cartList.value.filter((item) => item.selected)

  if (selectedItems.length === 0) {
    showToast('请选择要结算的商品')
    return
  }

  try {
    const cartItemIds = selectedItems.map((item) => item.id)
    const res = await previewCartOrder(cartItemIds)

    if (res.code === 200 && res.data) {
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

onShow(() => {
  loadCartList()
})
</script>

<style lang="scss">
.cart-page {
  min-height: 100vh;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom) + 100rpx);
  background-color: #f7f8fa;
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
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);

  .title {
    font-size: 34rpx;
    font-weight: 600;
    color: #333;
  }

  .edit-btn {
    padding: 12rpx 24rpx;
    font-size: 28rpx;
    color: #666;
    background: #f5f7fa;
    border-radius: 28rpx;
    transition: all 0.3s ease;

    &:active {
      opacity: 0.8;
    }
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;

  .empty-icon {
    width: 280rpx;
    height: 280rpx;
    margin-bottom: 40rpx;
    opacity: 0.8;
  }

  .empty-text {
    margin-bottom: 40rpx;
    font-size: 28rpx;
    color: #999;
  }
}

.cart-list {
  height: calc(100vh - 208rpx - 100rpx);
  padding: 20rpx;
}

.goods-list {
  .goods-item {
    display: flex;
    align-items: center;
    padding: 24rpx;
    margin-bottom: 20rpx;
    background: #fff;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.02);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.99);
    }

    .checkbox {
      margin-right: 24rpx;
    }

    .goods-image {
      width: 180rpx;
      height: 180rpx;
      margin-right: 24rpx;
      border-radius: 12rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
    }

    .goods-info {
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: space-between;
      height: 180rpx;

      .goods-name {
        margin-bottom: 12rpx;
        font-size: 30rpx;
        font-weight: 600;
        line-height: 1.4;
        color: #333;
      }

      .goods-spec {
        display: inline-block;
        padding: 4rpx 12rpx;
        margin-bottom: 20rpx;
        font-size: 24rpx;
        color: #666;
        background: #f7f8fa;
        border-radius: 6rpx;
      }

      .goods-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .goods-price {
          font-size: 36rpx;
          font-weight: 600;
          color: #ff4d4f;

          &::before {
            margin-right: 2rpx;
            font-size: 24rpx;
            content: '¥';
          }
        }

        .quantity-control {
          display: flex;
          align-items: center;
          overflow: hidden;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 32rpx;

          .minus,
          .plus {
            width: 64rpx;
            height: 64rpx;
            font-size: 28rpx;
            line-height: 64rpx;
            color: #333;
            text-align: center;
            background-color: #f7f8fa;
            transition: all 0.3s ease;

            &:active {
              background-color: #f0f0f0;
            }

            &.disabled {
              color: #ccc;
              background-color: #fafafa;
            }
          }

          .quantity {
            width: 88rpx;
            height: 64rpx;
            font-size: 28rpx;
            line-height: 64rpx;
            color: #333;
            text-align: center;
            background: #fff;
            border-right: 1px solid #eee;
            border-left: 1px solid #eee;
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
  height: 120rpx;
  padding: 0 32rpx;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  box-shadow: 0 -1px 10rpx rgba(0, 0, 0, 0.05);

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
        font-size: 40rpx;
        font-weight: 600;
        color: #ff4d4f;

        &::before {
          margin-right: 2rpx;
          font-size: 28rpx;
          content: '¥';
        }
      }
    }

    .tip {
      font-size: 24rpx;
      color: #999;
    }
  }

  .action-btns {
    .wd-button {
      min-width: 220rpx;
      height: 80rpx;
      margin-left: 24rpx;
      font-size: 28rpx;
      font-weight: 600;
      border-radius: 40rpx;

      &[type='primary'] {
        background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
        border: none;

        &:active {
          opacity: 0.9;
        }

        &[disabled] {
          color: #999;
          background: #fafafa;
        }
      }

      &[type='warning'] {
        background: linear-gradient(135deg, #ff7875 0%, #ff9c6e 100%);
        border: none;

        &:active {
          opacity: 0.9;
        }

        &[disabled] {
          color: #999;
          background: #fafafa;
        }
      }
    }
  }
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom);
  background: #fff;
}
</style>
