<template>
  <view class="search-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <wd-input
        v-model="searchKeyword"
        placeholder="搜索你想要的吧"
        prefix-icon="search"
        clearable
        @click-input="handleSearch"
        @enter="handleSearch"
      />
    </view>

    <!-- 搜索结果 -->
    <scroll-view scroll-y class="search-content" @scrolltolower="loadMore">
      <!-- 结果统计 -->
      <view class="result-stats" v-if="searchResults.length > 0">找到 {{ total }} 个相关商品</view>

      <!-- 结果列表 -->
      <view class="product-list" v-if="searchResults.length > 0">
        <view
          class="product-item"
          v-for="item in searchResults"
          :key="item.id"
          @click="handleProductClick(item)"
        >
          <image :src="item.image" mode="aspectFill" class="product-image" />
          <view class="product-info">
            <text class="product-name">{{ item.name }}</text>
            <view class="product-meta">
              <text class="product-price">¥{{ item.price }}/{{ item.unit }}</text>
              <text class="product-sales">销量: {{ item.sales }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else-if="!isLoading">
        <image src="" mode="aspectFit" class="empty-icon" />
        <text class="empty-text">未找到相关商品</text>
        <text class="empty-tips">换个关键词试试吧</text>
      </view>

      <!-- 加载更多 -->
      <view class="loading" v-if="isLoading">
        <wd-loading size="20" />
        <text>加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 搜索关键词
const searchKeyword = ref('')
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const isLoading = ref(false)
const searchResults = ref([])

// 获取URL参数
const getUrlParam = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const keyword = currentPage.$page?.options?.keyword
  if (keyword) {
    searchKeyword.value = decodeURIComponent(keyword)
    search()
  }
}

// 搜索
const search = async () => {
  if (!searchKeyword.value.trim()) return

  page.value = 1
  searchResults.value = []
  await loadSearchResults()
}

// 加载搜索结果
const loadSearchResults = async () => {
  if (isLoading.value) return
  isLoading.value = true

  try {
    // TODO: 调用后端API获取搜索结果
    // 模拟数据加载
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const newResults = Array(pageSize.value)
      .fill(null)
      .map((_, index) => ({
        id: page.value * pageSize.value + index,
        name: `${searchKeyword.value}相关商品${page.value * pageSize.value + index}`,
        price: (Math.random() * 10 + 1).toFixed(1),
        unit: '斤',
        sales: Math.floor(Math.random() * 1000),
        image: '/static/products/default.jpg',
      }))

    searchResults.value = [...searchResults.value, ...newResults]
    total.value = 100 // 模拟总数
    page.value++
  } catch (error) {
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    })
  } finally {
    isLoading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    uni.showToast({
      title: '请输入搜索关键词',
      icon: 'none',
    })
    return
  }
  search()
}

// 处理商品点击
const handleProductClick = (product: any) => {
  uni.navigateTo({
    url: `/pages-sub/data/price-detail?id=${product.id}&name=${encodeURIComponent(product.name)}`,
  })
}

// 加载更多
const loadMore = () => {
  if (searchResults.value.length < total.value) {
    loadSearchResults()
  }
}

// 页面加载
onMounted(() => {
  getUrlParam()
})
</script>

<style lang="scss">
.search-page {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 20rpx;
  background-color: #fff;
}

.search-content {
  height: calc(100vh - 120rpx);
}

.result-stats {
  padding: 20rpx;
  font-size: 24rpx;
  color: #999;
}

.product-list {
  padding: 0 20rpx;

  .product-item {
    display: flex;
    padding: 20rpx;
    margin-bottom: 20rpx;
    background-color: #fff;
    border-radius: 12rpx;

    .product-image {
      width: 160rpx;
      height: 160rpx;
      margin-right: 20rpx;
      border-radius: 8rpx;
    }

    .product-info {
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: space-between;

      .product-name {
        font-size: 28rpx;
        color: #333;
      }

      .product-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .product-price {
          font-size: 32rpx;
          font-weight: bold;
          color: #ff6b6b;
        }

        .product-sales {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;

  .empty-icon {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 40rpx;
  }

  .empty-text {
    margin-bottom: 20rpx;
    font-size: 28rpx;
    color: #333;
  }

  .empty-tips {
    font-size: 24rpx;
    color: #999;
  }
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  font-size: 24rpx;
  color: #999;

  .wd-loading {
    margin-right: 10rpx;
  }
}
</style>
