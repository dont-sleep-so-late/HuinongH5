<template>
  <view class="goods-list">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view
        class="filter-item"
        v-for="(item, index) in filterItems"
        :key="index"
        :class="{ active: currentFilter === index }"
        @tap="switchFilter(index)"
      >
        <text>{{ item.name }}</text>
        <text class="icon" v-if="item.sortable">{{ getSortIcon(index) }}</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <scroll-view
      scroll-y
      class="goods-grid"
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="goods-grid">
        <view
          class="goods-item"
          v-for="(item, index) in goodsList"
          :key="index"
          @tap="navigateToDetail(item.id)"
        >
          <image :src="item.mainImage" mode="aspectFill" class="goods-image" />
          <view class="goods-info">
            <text class="name text-ellipsis-2">{{ item.name }}</text>
            <text class="desc text-ellipsis-2">{{ item.description }}</text>
            <view class="price-section">
              <view class="price-wrap">
                <text class="price-symbol">¥</text>
                <text class="price">{{ item.price }}</text>
              </view>
              <text class="sales">已售{{ item.salesVolume }}件</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="loading" v-if="isLoading">
        <text>加载中...</text>
      </view>

      <!-- 无数据提示 -->
      <view class="empty" v-if="goodsList.length === 0 && !isLoading">
        <text>暂无相关商品</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCategoryProducts } from '@/api/category'
import type { ProductBase, ProductQueryParams } from '@/api/category'

// 筛选项
const filterItems = [
  { name: '综合', sortable: false },
  { name: '销量', sortField: 'sales' as const },
  { name: '价格', sortField: 'price' as const },
]

// 商品列表
const goodsList = ref<ProductBase[]>([])
const isLoading = ref(false)
const isRefreshing = ref(false)
const page = ref(1)
const pageSize = ref(10)

// 筛选状态
const currentFilter = ref(0)
const popup = ref()
const sortDirection = ref<Record<number, 'asc' | 'desc' | ''>>({})

// 筛选参数
const filterParams = ref<ProductQueryParams>({
  pageNum: 1,
  pageSize: 10,
  categoryId: undefined,
  sort: 'new',
})

// 分类数据
const categories = ref([
  { id: 1, name: '新鲜水果' },
  { id: 2, name: '时令蔬菜' },
  { id: 3, name: '肉禽蛋品' },
  { id: 4, name: '海鲜水产' },
  { id: 5, name: '粮油调味' },
])

// 切换筛选项
const switchFilter = (index: number) => {
  if (index === 3) {
    popup.value.open()
    return
  }

  if (filterItems[index].sortField) {
    // 处理排序
    const current = sortDirection.value[index] || ''
    if (!current) {
      sortDirection.value[index] = 'desc'
    } else if (current === 'desc') {
      sortDirection.value[index] = 'asc'
    } else {
      sortDirection.value[index] = ''
    }

    // 更新排序参数
    filterParams.value.sortField = filterItems[index].sortField
    filterParams.value.sortOrder = sortDirection.value[index] || undefined
  }

  currentFilter.value = index
  reloadList()
}

// 获取排序图标
const getSortIcon = (index: number) => {
  const direction = sortDirection.value[index]
  if (!direction) return '↕'
  return direction === 'asc' ? '↑' : '↓'
}

// 选择分类
const selectCategory = (id: number) => {
  filterParams.value.categoryId = id
}

// 重置筛选
const resetFilter = () => {
  filterParams.value = {
    pageNum: 1,
    pageSize: 10,
    categoryId: undefined,
    sort: 'new',
  }
}

// 确认筛选
const confirmFilter = () => {
  closeFilter()
  reloadList()
}

// 关闭筛选弹窗
const closeFilter = () => {
  popup.value.close()
}

// 弹窗状态变化
const onPopupChange = (e: any) => {
  if (!e.show) {
    // 弹窗关闭时重置筛选条件
    resetFilter()
  }
}

// 重新加载列表
const reloadList = () => {
  page.value = 1
  goodsList.value = []
  loadList()
}

// 加载更多
const loadMore = () => {
  if (!isLoading.value) {
    page.value++
    loadList()
  }
}

// 下拉刷新
const onRefresh = async () => {
  isRefreshing.value = true
  page.value = 1
  await loadList()
  isRefreshing.value = false
}

// 加载列表数据
const loadList = async () => {
  if (isLoading.value) return
  isLoading.value = true

  try {
    const params: ProductQueryParams = {
      ...filterParams.value,
      pageNum: page.value,
      pageSize: pageSize.value,
    }

    const res = await getCategoryProducts(params)
    if (res.code === 200 && res.data) {
      const { records, current, pages } = res.data
      if (page.value === 1) {
        goodsList.value = records
      } else {
        goodsList.value = [...goodsList.value, ...records]
      }

      // 如果没有更多数据了，禁止继续加载
      if (current >= pages) {
        isLoading.value = false
      } else {
        page.value++
      }
    }
  } catch (error: any) {
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none',
    })
  } finally {
    isLoading.value = false
  }
}

// 跳转到商品详情
const navigateToDetail = (id: number) => {
  uni.navigateTo({
    url: `/pages-sub/goods/detail?id=${id}`,
  })
}

// 页面加载
onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const { categoryId, name } = currentPage.$page?.options || {}

  if (categoryId) {
    filterParams.value.categoryId = Number(categoryId)
    // 设置页面标题
    uni.setNavigationBarTitle({
      title: name || '商品列表',
    })
  }

  loadList()
})
</script>

<style lang="scss" scoped>
.goods-list {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.filter-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  height: 88rpx;
  background-color: #fff;
  border-bottom: 2rpx solid #f5f5f5;

  .filter-item {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #333;

    &.active {
      color: #018d71;
    }

    .icon {
      margin-left: 6rpx;
    }
  }
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  height: calc(60vh - 88rpx);
}

.goods-item {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;

  &:active {
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.02);
    transform: translateY(2rpx);
  }

  .goods-image {
    width: 100%;
    height: 345rpx;
    background-color: #f7f8fa;
    transition: transform 0.3s ease;
  }

  .goods-info {
    position: relative;
    flex: 1;
    padding: 20rpx 24rpx;

    .name {
      display: block;
      margin-bottom: 12rpx;
      font-size: 28rpx;
      font-weight: 600;
      line-height: 1.4;
      color: #333;
    }

    .desc {
      display: block;
      margin-bottom: 16rpx;
      font-size: 24rpx;
      line-height: 1.4;
      color: #999;
    }

    .price-section {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .price-wrap {
        display: flex;
        align-items: baseline;

        .price-symbol {
          font-size: 24rpx;
          color: #ff4d4f;
        }

        .price {
          font-size: 36rpx;
          font-weight: 600;
          line-height: 1;
          color: #ff4d4f;
        }
      }

      .sales {
        padding: 4rpx 12rpx;
        font-size: 22rpx;
        color: #999;
        background-color: #f7f8fa;
        border-radius: 20rpx;
      }
    }
  }
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
  font-size: 24rpx;
  color: #999;

  &::before {
    width: 30rpx;
    height: 30rpx;
    margin-right: 10rpx;
    content: '';
    border: 2rpx solid #ddd;
    border-top-color: #999;
    border-radius: 50%;
    animation: loading 0.8s linear infinite;
  }
}

.empty {
  padding: 100rpx 0;
  font-size: 28rpx;
  color: #999;
  text-align: center;
}

.filter-popup {
  display: flex;
  flex-direction: column;
  width: 580rpx;
  height: 100vh;
  background-color: #fff;

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 30rpx;
    font-size: 32rpx;
    border-bottom: 2rpx solid #f5f5f5;

    .close {
      font-size: 48rpx;
      color: #999;
    }
  }

  .popup-content {
    flex: 1;
    padding: 30rpx;

    .filter-section {
      margin-bottom: 40rpx;

      .section-title {
        margin-bottom: 20rpx;
        font-size: 28rpx;
        color: #333;
      }

      .price-range {
        display: flex;
        align-items: center;

        input {
          flex: 1;
          height: 72rpx;
          padding: 0 20rpx;
          font-size: 28rpx;
          background-color: #f8f8f8;
          border-radius: 8rpx;
        }

        text {
          padding: 0 20rpx;
          color: #999;
        }
      }

      .category-list {
        display: flex;
        flex-wrap: wrap;

        .category-item {
          padding: 12rpx 24rpx;
          margin: 0 20rpx 20rpx 0;
          font-size: 28rpx;
          color: #666;
          background-color: #f8f8f8;
          border-radius: 8rpx;

          &.active {
            color: #018d71;
            background-color: rgba(1, 141, 113, 0.1);
          }
        }
      }
    }
  }

  .popup-footer {
    display: flex;
    padding: 20rpx;
    border-top: 2rpx solid #f5f5f5;

    button {
      flex: 1;
      height: 80rpx;
      font-size: 28rpx;
      line-height: 80rpx;
      text-align: center;
      border-radius: 40rpx;

      &.reset-btn {
        margin-right: 20rpx;
        color: #666;
        background-color: #f8f8f8;
      }

      &.confirm-btn {
        color: #fff;
        background-color: #018d71;
      }
    }
  }
}

@keyframes loading {
  to {
    transform: rotate(360deg);
  }
}

// 文本省略
.text-ellipsis-2 {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
