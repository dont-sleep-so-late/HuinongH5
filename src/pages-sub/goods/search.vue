<template>
  <view class="search-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <wd-input
        v-model="searchKeyword"
        placeholder="搜索商品"
        prefix-icon="search"
        clearable
        :autofocus="true"
        @enter="handleSearch"
      >
        <template #suffix>
          <text class="cancel-btn" @click="handleCancel">取消</text>
        </template>
      </wd-input>
    </view>

    <!-- 搜索历史和热门搜索 -->
    <view class="search-content" v-if="!showResults">
      <!-- 搜索历史 -->
      <view class="section" v-if="searchHistory.length > 0">
        <view class="section-header">
          <text class="title">搜索历史</text>
          <text class="clear-btn" @click="clearHistory">清空</text>
        </view>
        <view class="tag-list">
          <text v-for="item in searchHistory" :key="item" class="tag" @click="searchKeyword = item">
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
          <text v-for="item in hotSearches" :key="item" class="tag" @click="searchKeyword = item">
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
          @click="navigateToDetail(item)"
        >
          <image :src="item.image" mode="aspectFill" class="goods-image" />
          <view class="goods-info">
            <text class="goods-name">{{ item.name }}</text>
            <text class="goods-desc">{{ item.description }}</text>
            <view class="goods-meta">
              <text class="goods-price">¥{{ item.price }}</text>
              <text class="goods-sales">已售{{ item.sales }}件</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="loading" v-if="isLoading">
        <wd-loading size="20" />
        <text>加载中...</text>
      </view>

      <!-- 无数据提示 -->
      <view class="empty" v-if="searchResults.length === 0 && !isLoading">
        <image src="" mode="aspectFit" class="empty-icon" />
        <text>暂无相关商品</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'

const router = useRouter()

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
const searchResults = ref([])

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
    // TODO: 调用搜索API
    // 模拟数据加载
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const newResults = Array(pageSize.value)
      .fill(null)
      .map((_, index) => ({
        id: page.value * pageSize.value + index,
        name: `${searchKeyword.value}相关商品${page.value * pageSize.value + index}`,
        description: '这是一段商品描述文本',
        price: (Math.random() * 100 + 1).toFixed(2),
        sales: Math.floor(Math.random() * 1000),
        image: '/static/goods/default.jpg',
      }))

    if (page.value === 1) {
      searchResults.value = newResults
    } else {
      searchResults.value = [...searchResults.value, ...newResults]
    }
    page.value++
  } catch (error) {
    uni.showToast({
      title: '加载失败',
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
    router.back()
  }
}

// 跳转到商品详情
const navigateToDetail = (item: any) => {
  router.navigate('/pages-sub/goods/detail?id=' + item.id)
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

  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const { keyword } = currentPage?.options || {}
  if (keyword) {
    searchKeyword.value = decodeURIComponent(keyword)
    handleSearch()
  }
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

  .cancel-btn {
    padding-left: 20rpx;
    font-size: 28rpx;
    color: #666;
  }
}

.search-content {
  padding: 20rpx;

  .section {
    margin-bottom: 40rpx;

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20rpx;

      .title {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }

      .clear-btn {
        font-size: 26rpx;
        color: #999;
      }
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;

      .tag {
        padding: 12rpx 24rpx;
        font-size: 26rpx;
        color: #666;
        background-color: #f5f5f5;
        border-radius: 100rpx;
      }
    }
  }
}

.search-results {
  height: calc(100vh - 120rpx);

  .goods-list {
    padding: 20rpx;

    .goods-item {
      display: flex;
      padding: 20rpx;
      margin-bottom: 20rpx;
      background-color: #fff;
      border-radius: 12rpx;

      .goods-image {
        width: 200rpx;
        height: 200rpx;
        margin-right: 20rpx;
        border-radius: 8rpx;
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

        .goods-desc {
          margin-bottom: 20rpx;
          font-size: 24rpx;
          color: #999;
        }

        .goods-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .goods-price {
            font-size: 32rpx;
            font-weight: bold;
            color: #ff6b6b;
          }

          .goods-sales {
            font-size: 24rpx;
            color: #999;
          }
        }
      }
    }
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

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;

  .empty-icon {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 20rpx;
  }

  text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>
