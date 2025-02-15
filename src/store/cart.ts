import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface CartItem {
  id: number
  goodsId: number
  skuId: number
  name: string
  spec: string
  price: number
  image: string
  quantity: number
  checked: boolean
  stock: number
}

export const useCartStore = defineStore('cart', () => {
  // 购物车列表
  const cartList = ref<CartItem[]>([])

  // 是否全选
  const isAllSelected = computed(() => {
    return cartList.value.length > 0 && cartList.value.every((item) => item.checked)
  })

  // 选中商品数量
  const selectedCount = computed(() => {
    return cartList.value.filter((item) => item.checked).length
  })

  // 选中商品总价
  const totalPrice = computed(() => {
    return cartList.value
      .filter((item) => item.checked)
      .reduce((total, item) => {
        return total + item.price * item.quantity
      }, 0)
      .toFixed(2)
  })

  // 添加商品到购物车
  const addToCart = (item: Omit<CartItem, 'checked' | 'quantity'>) => {
    const existItem = cartList.value.find(
      (cartItem) => cartItem.goodsId === item.goodsId && cartItem.skuId === item.skuId,
    )

    if (existItem) {
      // 已存在，增加数量
      if (existItem.quantity < existItem.stock) {
        existItem.quantity++
      } else {
        uni.showToast({
          title: '库存不足',
          icon: 'none',
        })
      }
    } else {
      // 不存在，添加新商品
      cartList.value.push({
        ...item,
        checked: true,
        quantity: 1,
      })
    }

    // 保存到本地存储
    saveToStorage()
  }

  // 从购物车移除商品
  const removeFromCart = (goodsId: number, skuId: number) => {
    const index = cartList.value.findIndex(
      (item) => item.goodsId === goodsId && item.skuId === skuId,
    )
    if (index > -1) {
      cartList.value.splice(index, 1)
      saveToStorage()
    }
  }

  // 更新商品数量
  const updateQuantity = (goodsId: number, skuId: number, quantity: number) => {
    const item = cartList.value.find((item) => item.goodsId === goodsId && item.skuId === skuId)
    if (item) {
      if (quantity > item.stock) {
        uni.showToast({
          title: '库存不足',
          icon: 'none',
        })
        return
      }
      item.quantity = quantity
      saveToStorage()
    }
  }

  // 切换商品选中状态
  const toggleSelect = (goodsId: number, skuId: number) => {
    const item = cartList.value.find((item) => item.goodsId === goodsId && item.skuId === skuId)
    if (item) {
      item.checked = !item.checked
      saveToStorage()
    }
  }

  // 切换全选状态
  const toggleSelectAll = () => {
    const newStatus = !isAllSelected.value
    cartList.value.forEach((item) => {
      item.checked = newStatus
    })
    saveToStorage()
  }

  // 清空购物车
  const clearCart = () => {
    cartList.value = []
    saveToStorage()
  }

  // 获取选中的商品
  const getSelectedGoods = () => {
    return cartList.value.filter((item) => item.checked)
  }

  // 保存到本地存储
  const saveToStorage = () => {
    uni.setStorageSync('cart', cartList.value)
  }

  // 从本地存储加载
  const loadFromStorage = () => {
    const cart = uni.getStorageSync('cart')
    if (cart) {
      cartList.value = cart
    }
  }

  // 初始化时加载数据
  loadFromStorage()

  return {
    cartList,
    isAllSelected,
    selectedCount,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleSelect,
    toggleSelectAll,
    clearCart,
    getSelectedGoods,
  }
})
