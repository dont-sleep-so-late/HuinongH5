import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Coupon {
  id: number
  name: string
  type: CouponType
  value: number
  condition: number
  startTime: string
  endTime: string
  useTime?: string
  status: CouponStatus
  description?: string
}

// 优惠券类型
export enum CouponType {
  // 满减券
  DISCOUNT = 'discount',
  // 无门槛券
  DIRECT = 'direct',
}

// 优惠券状态
export enum CouponStatus {
  // 未使用
  UNUSED = 'unused',
  // 已使用
  USED = 'used',
  // 已过期
  EXPIRED = 'expired',
}

// 优惠券状态文案
export const CouponStatusText: Record<CouponStatus, string> = {
  [CouponStatus.UNUSED]: '未使用',
  [CouponStatus.USED]: '已使用',
  [CouponStatus.EXPIRED]: '已过期',
}

export const useCouponStore = defineStore('coupon', () => {
  // 优惠券列表
  const couponList = ref<Coupon[]>([])

  // 获取优惠券列表
  const getCouponList = (status?: CouponStatus) => {
    const coupons = uni.getStorageSync('coupons') || []
    if (status) {
      return coupons.filter((coupon: Coupon) => coupon.status === status)
    }
    return coupons
  }

  // 获取可用优惠券
  const getAvailableCoupons = (amount: number) => {
    const now = new Date().toISOString()
    return getCouponList(CouponStatus.UNUSED).filter((coupon: Coupon) => {
      // 检查有效期
      if (coupon.startTime > now || coupon.endTime < now) {
        return false
      }

      // 检查使用条件
      if (coupon.type === CouponType.DISCOUNT && amount < coupon.condition) {
        return false
      }

      return true
    })
  }

  // 领取优惠券
  const receiveCoupon = (coupon: Omit<Coupon, 'status'>) => {
    const coupons = uni.getStorageSync('coupons') || []
    const newCoupon: Coupon = {
      ...coupon,
      status: CouponStatus.UNUSED,
    }
    coupons.unshift(newCoupon)
    uni.setStorageSync('coupons', coupons)
  }

  // 使用优惠券
  const useCoupon = (couponId: number) => {
    const coupons = uni.getStorageSync('coupons') || []
    const coupon = coupons.find((item: Coupon) => item.id === couponId)
    if (coupon && coupon.status === CouponStatus.UNUSED) {
      coupon.status = CouponStatus.USED
      coupon.useTime = new Date().toISOString()
      uni.setStorageSync('coupons', coupons)
    }
  }

  // 检查优惠券是否可用
  const checkCouponAvailable = (couponId: number, amount: number) => {
    const coupon = getCouponList().find((item: Coupon) => item.id === couponId)
    if (!coupon) {
      return {
        available: false,
        message: '优惠券不存在',
      }
    }

    if (coupon.status !== CouponStatus.UNUSED) {
      return {
        available: false,
        message: CouponStatusText[coupon.status],
      }
    }

    const now = new Date().toISOString()
    if (coupon.startTime > now) {
      return {
        available: false,
        message: '优惠券未生效',
      }
    }

    if (coupon.endTime < now) {
      return {
        available: false,
        message: '优惠券已过期',
      }
    }

    if (coupon.type === CouponType.DISCOUNT && amount < coupon.condition) {
      return {
        available: false,
        message: `未满${coupon.condition}元`,
      }
    }

    return {
      available: true,
      message: '可使用',
    }
  }

  // 计算优惠金额
  const calculateDiscount = (couponId: number, amount: number) => {
    const coupon = getCouponList().find((item: Coupon) => item.id === couponId)
    if (!coupon) {
      return 0
    }

    const { available } = checkCouponAvailable(couponId, amount)
    if (!available) {
      return 0
    }

    return coupon.value
  }

  // 更新优惠券状态
  const updateCouponStatus = () => {
    const coupons = uni.getStorageSync('coupons') || []
    const now = new Date().toISOString()
    let updated = false

    coupons.forEach((coupon: Coupon) => {
      if (coupon.status === CouponStatus.UNUSED && coupon.endTime < now) {
        coupon.status = CouponStatus.EXPIRED
        updated = true
      }
    })

    if (updated) {
      uni.setStorageSync('coupons', coupons)
    }
  }

  // 初始化时更新优惠券状态
  updateCouponStatus()

  return {
    couponList,
    getCouponList,
    getAvailableCoupons,
    receiveCoupon,
    useCoupon,
    checkCouponAvailable,
    calculateDiscount,
    updateCouponStatus,
  }
})
