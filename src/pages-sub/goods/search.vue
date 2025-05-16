<template>
  <view class="search-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <input
          v-model="searchKeyword"
          class="search-input"
          type="text"
          placeholder="搜索商品"
          confirm-type="search"
          @confirm="handleSearch"
          @input="onInput"
        />
        <text class="search-icon">🔍</text>
        <text v-if="searchKeyword" class="clear-icon" @tap="clearKeyword">×</text>
      </view>
      <text class="cancel-btn" @tap="handleCancel">取消</text>
    </view>

    <!-- 搜索历史和热门搜索 -->
    <view class="search-content" v-if="!showResults">
      <!-- 搜索历史 -->
      <view class="section" v-if="searchHistory.length > 0">
        <view class="section-header">
          <text class="title">搜索历史</text>
          <text class="clear-btn" @tap="clearHistory">清空</text>
        </view>
        <view class="tag-list">
          <text v-for="item in searchHistory" :key="item" class="tag" @tap="onTagClick(item)">
            {{ item }}
          </text>
        </view>
      </view>

      <!-- 热门搜索 -->
      <view class="section">
        <view class="section-header">
          <text class="title">热门搜索</text>
        </view>
        <view class="tag-list">
          <text v-for="item in hotSearches" :key="item" class="tag" @tap="onTagClick(item)">
            {{ item }}
          </text>
        </view>
      </view>
    </view>

    <!-- 搜索结果 -->
    <scroll-view
      v-else
      scroll-y
      class="search-results"
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="goods-list" v-if="searchResults.length > 0">
        <view
          class="goods-item"
          v-for="item in searchResults"
          :key="item.id"
          @tap="navigateToDetail(item)"
        >
          <image :src="item.mainImage" mode="aspectFill" class="goods-image" />
          <view class="goods-info">
            <text class="goods-name">{{ item.name }}</text>
            <text class="goods-desc">{{ item.description }}</text>
            <view class="goods-meta">
              <text class="goods-price">¥{{ item.price }}</text>
              <text class="goods-sales">已售{{ item.salesVolume }}件</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="loading" v-if="isLoading">
        <text>加载中...</text>
      </view>

      <!-- 无数据提示 -->
      <view class="empty" v-if="searchResults.length === 0 && !isLoading">
        <text>暂无相关商品</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { searchProducts } from '@/api/product'
import type { ProductBase, SearchParams } from '@/api/product'

// 搜索关键词
const searchKeyword = ref('')
const showResults = ref(false)

// 加载状态
const isLoading = ref(false)
const isRefreshing = ref(false)
const page = ref(1)
const pageSize = ref(10)

// 搜索历史
const searchHistory = ref<string[]>([])

// 热门搜索
const hotSearches = ref([
  '新鲜水果',
  '有机蔬菜',
  '土鸡蛋',
  '大米',
  '食用油',
  '牛肉',
  '猪肉',
  '海鲜',
])

// 搜索结果
const searchResults = ref<ProductBase[]>([])

// 从本地存储加载搜索历史
const loadSearchHistory = () => {
  const history = uni.getStorageSync('searchHistory')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

// 保存搜索历史到本地存储
const saveSearchHistory = (keyword: string) => {
  const history = new Set([keyword, ...searchHistory.value])
  searchHistory.value = Array.from(history).slice(0, 10)
  uni.setStorageSync('searchHistory', JSON.stringify(searchHistory.value))
}

// 清空搜索历史
const clearHistory = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空搜索历史吗？',
    success: (res) => {
      if (res.confirm) {
        searchHistory.value = []
        uni.removeStorageSync('searchHistory')
      }
    },
  })
}

// 清空搜索关键词
const clearKeyword = () => {
  searchKeyword.value = ''
  showResults.value = false
}

// 处理输入
const onInput = (e: any) => {
  searchKeyword.value = e.detail.value
}

// 处理标签点击
const onTagClick = (keyword: string) => {
  searchKeyword.value = keyword
  handleSearch()
}

// 处理搜索
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    uni.showToast({
      title: '请输入搜索关键词',
      icon: 'none',
    })
    return
  }

  showResults.value = true
  page.value = 1
  searchResults.value = []
  saveSearchHistory(searchKeyword.value.trim())
  await loadSearchResults()
}

// 加载搜索结果
const loadSearchResults = async () => {
  if (isLoading.value) return
  isLoading.value = true

  try {
    const params: SearchParams = {
      pageNum: page.value,
      pageSize: pageSize.value,
      keyword: searchKeyword.value.trim(),
      sort: 'new',
    }

    const res = await searchProducts(params)
    if (res.code === 200 && res.data) {
      if (page.value === 1) {
        searchResults.value = res.data.records
      } else {
        searchResults.value = [...searchResults.value, ...res.data.records]
      }

      // 更新页码
      if (res.data.current >= res.data.pages) {
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
    isRefreshing.value = false
  }
}

// 处理取消
const handleCancel = () => {
  if (showResults.value) {
    showResults.value = false
    searchKeyword.value = ''
  } else {
    uni.navigateBack()
  }
}

// 跳转到商品详情
const navigateToDetail = (item: ProductBase) => {
  uni.navigateTo({
    url: `/pages-sub/goods/detail?id=${item.id}`,
  })
}

// 加载更多
const loadMore = () => {
  if (showResults.value) {
    loadSearchResults()
  }
}

// 下拉刷新
const onRefresh = async () => {
  isRefreshing.value = true
  page.value = 1
  await loadSearchResults()
}

// 监听搜索关键词变化
watch(searchKeyword, (newVal) => {
  if (!newVal) {
    showResults.value = false
  }
})

// 页面加载
onMounted(() => {
  loadSearchHistory()
})
</script>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
}

.search-input-wrap {
  position: relative;
  flex: 1;
  margin-right: 20rpx;
}

.search-input {
  width: 100%;
  height: 72rpx;
  padding: 0 60rpx;
  font-size: 28rpx;
  background-color: #f5f5f5;
  border-radius: 36rpx;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 20rpx;
  font-size: 32rpx;
  color: #999;
  transform: translateY(-50%);
}

.clear-icon {
  position: absolute;
  top: 50%;
  right: 20rpx;
  padding: 10rpx;
  font-size: 40rpx;
  color: #999;
  transform: translateY(-50%);
}

.cancel-btn {
  padding: 10rpx;
  font-size: 28rpx;
  color: #666;
}

.search-content {
  padding: 20rpx;
}

.section {
  padding: 20rpx;
  margin-bottom: 30rpx;
  background-color: #fff;
  border-radius: 12rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.clear-btn {
  font-size: 24rpx;
  color: #999;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.tag {
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 6rpx;
}

.search-results {
  height: calc(100vh - 112rpx);
}

.goods-list {
  padding: 20rpx;
}

.goods-item {
  margin-bottom: 20rpx;
  overflow: hidden;
  background-color: #fff;
  border-radius: 12rpx;
}

.goods-image {
  width: 100%;
  height: 400rpx;
}

.goods-info {
  padding: 20rpx;
}

.goods-name {
  margin-bottom: 10rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.goods-desc {
  margin-bottom: 10rpx;
  font-size: 24rpx;
  color: #999;
}

.goods-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.goods-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff4d4f;
}

.goods-sales {
  font-size: 24rpx;
  color: #999;
}

.loading {
  padding: 20rpx;
  font-size: 24rpx;
  color: #999;
  text-align: center;
}

.empty {
  padding: 100rpx 0;
  font-size: 28rpx;
  color: #999;
  text-align: center;
}
</style>
