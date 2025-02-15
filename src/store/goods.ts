import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface GoodsSku {
  id: number
  goodsId: number
  name: string
  image: string
  price: number
  originalPrice: number
  stock: number
  specs: string[]
}

export interface Goods {
  id: number
  categoryId: number
  name: string
  subtitle: string
  price: number
  originalPrice: number
  sales: number
  stock: number
  images: string[]
  video?: string
  detail: string
  specs: string[][]
  skus: GoodsSku[]
  status: GoodsStatus
  isHot: boolean
  isNew: boolean
  createTime: string
}

export interface Category {
  id: number
  parentId: number
  name: string
  icon: string
  banner?: string
  sort: number
  children?: Category[]
}

// 商品状态
export enum GoodsStatus {
  // 上架
  ON = 'on',
  // 下架
  OFF = 'off',
  // 售罄
  SOLD_OUT = 'sold_out',
}

// 商品状态文案
export const GoodsStatusText: Record<GoodsStatus, string> = {
  [GoodsStatus.ON]: '上架',
  [GoodsStatus.OFF]: '下架',
  [GoodsStatus.SOLD_OUT]: '售罄',
}

export const useGoodsStore = defineStore('goods', () => {
  // 商品列表
  const goodsList = ref<Goods[]>([])

  // 分类列表
  const categoryList = ref<Category[]>([])

  // 获取商品列表
  const getGoodsList = (params?: {
    categoryId?: number
    keyword?: string
    isHot?: boolean
    isNew?: boolean
    status?: GoodsStatus
  }) => {
    const goods = uni.getStorageSync('goods') || []
    if (!params) {
      return goods
    }

    return goods.filter((item: Goods) => {
      // 分类筛选
      if (params.categoryId && item.categoryId !== params.categoryId) {
        return false
      }

      // 关键词搜索
      if (
        params.keyword &&
        !item.name.includes(params.keyword) &&
        !item.subtitle.includes(params.keyword)
      ) {
        return false
      }

      // 热门商品
      if (params.isHot && !item.isHot) {
        return false
      }

      // 新品
      if (params.isNew && !item.isNew) {
        return false
      }

      // 商品状态
      if (params.status && item.status !== params.status) {
        return false
      }

      return true
    })
  }

  // 获取商品详情
  const getGoodsDetail = (goodsId: number) => {
    const goods = uni.getStorageSync('goods') || []
    return goods.find((item: Goods) => item.id === goodsId)
  }

  // 获取商品SKU
  const getGoodsSku = (goodsId: number, skuId: number) => {
    const goods = getGoodsDetail(goodsId)
    if (!goods) {
      return null
    }
    return goods.skus.find((sku) => sku.id === skuId)
  }

  // 获取分类列表
  const getCategoryList = (parentId?: number) => {
    const categories = uni.getStorageSync('categories') || []
    if (parentId === undefined) {
      return categories
    }
    return categories.filter((item: Category) => item.parentId === parentId)
  }

  // 获取分类详情
  const getCategoryDetail = (categoryId: number) => {
    const categories = uni.getStorageSync('categories') || []
    return categories.find((item: Category) => item.id === categoryId)
  }

  // 获取分类路径
  const getCategoryPath = (categoryId: number) => {
    const path: Category[] = []
    let current = getCategoryDetail(categoryId)

    while (current) {
      path.unshift(current)
      if (current.parentId === 0) {
        break
      }
      current = getCategoryDetail(current.parentId)
    }

    return path
  }

  // 检查商品库存
  const checkStock = (goodsId: number, skuId: number, quantity: number) => {
    const sku = getGoodsSku(goodsId, skuId)
    if (!sku) {
      return {
        available: false,
        message: '商品不存在',
      }
    }

    if (sku.stock < quantity) {
      return {
        available: false,
        message: '库存不足',
      }
    }

    return {
      available: true,
      message: '库存充足',
    }
  }

  // 更新商品库存
  const updateStock = (goodsId: number, skuId: number, quantity: number) => {
    const goods = uni.getStorageSync('goods') || []
    const index = goods.findIndex((item: Goods) => item.id === goodsId)
    if (index === -1) {
      return false
    }

    const sku = goods[index].skus.find((item) => item.id === skuId)
    if (!sku) {
      return false
    }

    // 更新SKU库存
    sku.stock -= quantity
    // 更新商品总库存
    goods[index].stock -= quantity

    // 检查是否售罄
    if (goods[index].stock === 0) {
      goods[index].status = GoodsStatus.SOLD_OUT
    }

    uni.setStorageSync('goods', goods)
    return true
  }

  // 添加商品浏览记录
  const addViewHistory = (goodsId: number) => {
    const history = uni.getStorageSync('goods_history') || []
    const index = history.indexOf(goodsId)
    if (index > -1) {
      history.splice(index, 1)
    }
    history.unshift(goodsId)
    // 最多保存50条记录
    if (history.length > 50) {
      history.pop()
    }
    uni.setStorageSync('goods_history', history)
  }

  // 获取商品浏览记录
  const getViewHistory = () => {
    const history = uni.getStorageSync('goods_history') || []
    return history.map((goodsId: number) => getGoodsDetail(goodsId)).filter(Boolean)
  }

  // 清空商品浏览记录
  const clearViewHistory = () => {
    uni.removeStorageSync('goods_history')
  }

  return {
    goodsList,
    categoryList,
    getGoodsList,
    getGoodsDetail,
    getGoodsSku,
    getCategoryList,
    getCategoryDetail,
    getCategoryPath,
    checkStock,
    updateStock,
    addViewHistory,
    getViewHistory,
    clearViewHistory,
  }
})
