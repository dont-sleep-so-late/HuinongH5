import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface OrderGoods {
  id: number
  goodsId: number
  skuId: number
  name: string
  spec: string
  price: number
  image: string
  quantity: number
}

export interface OrderAddress {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
}

export interface OrderInfo {
  id: number
  orderNo: string
  userId: number
  status: OrderStatus
  statusText: string
  totalAmount: number
  payAmount: number
  freightAmount: number
  discountAmount: number
  payTime?: string
  deliveryTime?: string
  receiveTime?: string
  createTime: string
  remark?: string
  address: OrderAddress
  goods: OrderGoods[]
}

// 订单状态
export enum OrderStatus {
  // 待付款
  UNPAID = 'unpaid',
  // 待发货
  UNSHIPPED = 'unshipped',
  // 待收货
  UNRECEIVED = 'unreceived',
  // 已完成
  COMPLETED = 'completed',
  // 已取消
  CANCELLED = 'cancelled',
  // 已退款
  REFUNDED = 'refunded',
}

// 订单状态文案
export const OrderStatusText: Record<OrderStatus, string> = {
  [OrderStatus.UNPAID]: '待付款',
  [OrderStatus.UNSHIPPED]: '待发货',
  [OrderStatus.UNRECEIVED]: '待收货',
  [OrderStatus.COMPLETED]: '已完成',
  [OrderStatus.CANCELLED]: '已取消',
  [OrderStatus.REFUNDED]: '已退款',
}

export const useOrderStore = defineStore('order', () => {
  // 创建订单的商品信息
  const orderGoods = ref<OrderGoods[]>([])

  // 创建订单的收货地址
  const orderAddress = ref<OrderAddress | null>(null)

  // 创建订单的备注
  const orderRemark = ref('')

  // 设置订单商品
  const setOrderGoods = (goods: OrderGoods[]) => {
    orderGoods.value = goods
  }

  // 设置收货地址
  const setOrderAddress = (address: OrderAddress) => {
    orderAddress.value = address
  }

  // 设置订单备注
  const setOrderRemark = (remark: string) => {
    orderRemark.value = remark
  }

  // 清空订单信息
  const clearOrderInfo = () => {
    orderGoods.value = []
    orderAddress.value = null
    orderRemark.value = ''
  }

  // 计算订单总金额
  const calculateTotal = () => {
    return orderGoods.value.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)
  }

  // 创建订单
  const createOrder = async () => {
    if (!orderAddress.value) {
      uni.showToast({
        title: '请选择收货地址',
        icon: 'none',
      })
      return
    }

    if (orderGoods.value.length === 0) {
      uni.showToast({
        title: '请选择商品',
        icon: 'none',
      })
      return
    }

    // 显示加载提示
    uni.showLoading({
      title: '正在创建订单',
    })

    try {
      // 模拟创建订单
      const order: OrderInfo = {
        id: Date.now(),
        orderNo: `${Date.now()}${Math.floor(Math.random() * 1000)}`,
        userId: 1,
        status: OrderStatus.UNPAID,
        statusText: OrderStatusText[OrderStatus.UNPAID],
        totalAmount: calculateTotal(),
        payAmount: calculateTotal(),
        freightAmount: 0,
        discountAmount: 0,
        createTime: new Date().toISOString(),
        address: orderAddress.value,
        goods: orderGoods.value,
        remark: orderRemark.value,
      }

      // 保存订单
      const orders = uni.getStorageSync('orders') || []
      orders.unshift(order)
      uni.setStorageSync('orders', orders)

      // 清空订单信息
      clearOrderInfo()

      uni.hideLoading()

      // 返回订单信息
      return order
    } catch (error) {
      uni.hideLoading()
      uni.showToast({
        title: '创建订单失败',
        icon: 'none',
      })
      throw error
    }
  }

  // 获取订单列表
  const getOrderList = (status?: OrderStatus) => {
    const orders = uni.getStorageSync('orders') || []
    if (status) {
      return orders.filter((order: OrderInfo) => order.status === status)
    }
    return orders
  }

  // 获取订单详情
  const getOrderDetail = (orderId: number) => {
    const orders = uni.getStorageSync('orders') || []
    return orders.find((order: OrderInfo) => order.id === orderId)
  }

  // 更新订单状态
  const updateOrderStatus = (orderId: number, status: OrderStatus) => {
    const orders = uni.getStorageSync('orders') || []
    const order = orders.find((order: OrderInfo) => order.id === orderId)
    if (order) {
      order.status = status
      order.statusText = OrderStatusText[status]

      // 更新时间
      switch (status) {
        case OrderStatus.UNSHIPPED:
          order.payTime = new Date().toISOString()
          break
        case OrderStatus.UNRECEIVED:
          order.deliveryTime = new Date().toISOString()
          break
        case OrderStatus.COMPLETED:
          order.receiveTime = new Date().toISOString()
          break
      }

      uni.setStorageSync('orders', orders)
    }
  }

  // 删除订单
  const deleteOrder = (orderId: number) => {
    const orders = uni.getStorageSync('orders') || []
    const index = orders.findIndex((order: OrderInfo) => order.id === orderId)
    if (index > -1) {
      orders.splice(index, 1)
      uni.setStorageSync('orders', orders)
    }
  }

  return {
    orderGoods,
    orderAddress,
    orderRemark,
    setOrderGoods,
    setOrderAddress,
    setOrderRemark,
    clearOrderInfo,
    calculateTotal,
    createOrder,
    getOrderList,
    getOrderDetail,
    updateOrderStatus,
    deleteOrder,
  }
})
