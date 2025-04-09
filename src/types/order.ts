// 订单状态
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'

// 订单商品项
export interface OrderItem {
  productId: number
  productName: string
  productImage: string
  specName?: string
  specValue?: string
  price: number
  quantity: number
}

// 订单详情
export interface OrderDetail {
  orderId: number
  orderNo: string
  status: OrderStatus
  createTime: string
  payTime?: string
  deliveryTime?: string
  receiveTime?: string
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  shopName: string
  shopAvatar: string
  deliveryType: 'express' | 'self'
  remark?: string
  totalAmount: number
  freightAmount: number
  couponAmount: number
  payableAmount: number
  orderItems: OrderItem[]
}
