<template>
  <view class="forecast-page">
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

    <view class="content">
      <!-- 左侧分类菜单 -->
      <scroll-view scroll-y class="category-menu">
        <view
          v-for="item in categories"
          :key="item.id"
          :class="['category-item', activeCategory === item.id ? 'active' : '']"
          @click="handleCategoryClick(item)"
        >
          {{ item.name }}
        </view>
      </scroll-view>

      <!-- 右侧内容区 -->
      <scroll-view scroll-y class="forecast-content" @scrolltolower="loadMore">
        <!-- 热门搜索 -->
        <view class="section" v-if="activeCategory === 1 || !activeCategory">
          <view class="section-title">热门搜索</view>
          <view class="product-grid">
            <view
              class="product-item"
              v-for="item in hotProducts"
              :key="item.id"
              @click="handleProductClick(item)"
            >
              <image :src="item.image" mode="aspectFill" class="product-image" />
              <text class="product-name">{{ item.name }}</text>
              <view class="forecast-info">
                <text class="current-price">¥{{ item.currentPrice }}/{{ item.unit }}</text>
                <text class="forecast-price" :class="item.trend">
                  预测：¥{{ item.forecastPrice }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 推荐 -->
        <view class="section" v-if="activeCategory === 1 || !activeCategory">
          <view class="section-title">推荐</view>
          <view class="product-grid">
            <view
              class="product-item"
              v-for="item in recommendProducts"
              :key="item.id"
              @click="handleProductClick(item)"
            >
              <image :src="item.image" mode="aspectFill" class="product-image" />
              <text class="product-name">{{ item.name }}</text>
              <view class="forecast-info">
                <text class="current-price">¥{{ item.currentPrice }}/{{ item.unit }}</text>
                <text class="forecast-price" :class="item.trend">
                  预测：¥{{ item.forecastPrice }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 常用搜索 -->
        <view class="section" v-if="activeCategory === 1 || !activeCategory">
          <view class="section-title">常用搜索</view>
          <view class="product-grid">
            <view
              class="product-item"
              v-for="item in commonProducts"
              :key="item.id"
              @click="handleProductClick(item)"
            >
              <image :src="item.image" mode="aspectFill" class="product-image" />
              <text class="product-name">{{ item.name }}</text>
              <view class="forecast-info">
                <text class="current-price">¥{{ item.currentPrice }}/{{ item.unit }}</text>
                <text class="forecast-price" :class="item.trend">
                  预测：¥{{ item.forecastPrice }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 分类商品列表 -->
        <view class="section" v-if="activeCategory !== 1">
          <view class="product-grid">
            <view
              class="product-item"
              v-for="item in categoryProducts"
              :key="item.id"
              @click="handleProductClick(item)"
            >
              <image :src="item.image" mode="aspectFill" class="product-image" />
              <text class="product-name">{{ item.name }}</text>
              <view class="forecast-info">
                <text class="current-price">¥{{ item.currentPrice }}/{{ item.unit }}</text>
                <text class="forecast-price" :class="item.trend">
                  预测：¥{{ item.forecastPrice }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view class="loading" v-if="isLoading">
          <wd-loading size="20" />
          <text>加载中...</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 搜索关键词
const searchKeyword = ref('')

// 当前选中的分类
const activeCategory = ref(1)

// 加载状态
const isLoading = ref(false)
const page = ref(1)
const pageSize = ref(10)

// 分类商品数据
const categoryProducts = ref([])

// 分类数据
const categories = ref([
  { id: 1, name: '热门搜索' },
  { id: 2, name: '蔬菜' },
  { id: 3, name: '水果' },
  { id: 4, name: '禽畜牧蛋肉' },
  { id: 5, name: '种苗' },
  { id: 6, name: '农副食品' },
  { id: 7, name: '水产' },
  { id: 8, name: '坚果干果' },
  { id: 9, name: '中药材' },
  { id: 10, name: '粮油作物' },
])

// 热门搜索数据
const hotProducts = ref([
  {
    id: 1,
    name: '鸡蛋',
    image: '/static/products/egg.jpg',
    currentPrice: '8.50',
    forecastPrice: '9.20',
    unit: '斤',
    trend: 'up',
  },
  {
    id: 2,
    name: '苹果',
    image: '/static/products/apple.jpg',
    currentPrice: '5.80',
    forecastPrice: '5.50',
    unit: '斤',
    trend: 'down',
  },
  {
    id: 3,
    name: '大蒜',
    image: '/static/products/garlic.jpg',
    currentPrice: '3.20',
    forecastPrice: '3.50',
    unit: '斤',
    trend: 'up',
  },
])

// 推荐数据
const recommendProducts = ref([
  {
    id: 4,
    name: '大葱',
    image: '/static/products/green-onion.jpg',
    currentPrice: '2.80',
    forecastPrice: '3.00',
    unit: '斤',
    trend: 'up',
  },
  {
    id: 5,
    name: '生姜',
    image: '/static/products/ginger.jpg',
    currentPrice: '6.50',
    forecastPrice: '6.20',
    unit: '斤',
    trend: 'down',
  },
  {
    id: 6,
    name: '茄子',
    image: '/static/products/eggplant.jpg',
    currentPrice: '3.50',
    forecastPrice: '3.80',
    unit: '斤',
    trend: 'up',
  },
])

// 常用搜索数据
const commonProducts = ref([
  {
    id: 7,
    name: '萝卜',
    image: '/static/products/radish.jpg',
    currentPrice: '2.00',
    forecastPrice: '2.20',
    unit: '斤',
    trend: 'up',
  },
  {
    id: 8,
    name: '香菇',
    image: '/static/products/mushroom.jpg',
    currentPrice: '8.80',
    forecastPrice: '8.50',
    unit: '斤',
    trend: 'down',
  },
  {
    id: 9,
    name: '土豆',
    image: '/static/products/potato.jpg',
    currentPrice: '2.50',
    forecastPrice: '2.80',
    unit: '斤',
    trend: 'up',
  },
])

// 处理分类点击
const handleCategoryClick = (category: any) => {
  activeCategory.value = category.id
  page.value = 1
  categoryProducts.value = []
  loadCategoryProducts()
}

// 加载分类商品数据
const loadCategoryProducts = async () => {
  if (isLoading.value) return
  isLoading.value = true

  try {
    // TODO: 调用后端API获取分类商品数据
    // 模拟数据加载
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const newProducts = Array(pageSize.value)
      .fill(null)
      .map((_, index) => ({
        id: page.value * pageSize.value + index,
        name: `商品${page.value * pageSize.value + index}`,
        currentPrice: (Math.random() * 10 + 1).toFixed(1),
        forecastPrice: (Math.random() * 10 + 1).toFixed(1),
        unit: '斤',
        trend: Math.random() > 0.5 ? 'up' : 'down',
        image: '/static/products/default.jpg',
      }))

    categoryProducts.value = [...categoryProducts.value, ...newProducts]
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

  uni.navigateTo({
    url: `/pages-sub/data/search?keyword=${encodeURIComponent(searchKeyword.value)}`,
  })
}

// 处理商品点击
const handleProductClick = (product: any) => {
  uni.navigateTo({
    url: `/pages-sub/data/forecast-detail?id=${product.id}&name=${encodeURIComponent(product.name)}`,
  })
}

// 加载更多
const loadMore = () => {
  if (activeCategory.value !== 1) {
    loadCategoryProducts()
  }
}

// 页面加载
onMounted(() => {
  // 初始化加载数据
  if (activeCategory.value !== 1) {
    loadCategoryProducts()
  }
})
</script>

<style lang="scss">
.forecast-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f8f8;
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 20rpx;
  background-color: #fff;
}

.content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.category-menu {
  width: 180rpx;
  height: calc(100vh - 120rpx);
  background-color: #f5f5f5;

  .category-item {
    position: relative;
    height: 90rpx;
    font-size: 26rpx;
    line-height: 90rpx;
    color: #333;
    text-align: center;

    &.active {
      font-weight: bold;
      color: #018d71;
      background-color: #fff;

      &::before {
        position: absolute;
        top: 50%;
        left: 0;
        width: 6rpx;
        height: 36rpx;
        content: '';
        background-color: #018d71;
        transform: translateY(-50%);
      }
    }
  }
}

.forecast-content {
  flex: 1;
  height: calc(100vh - 120rpx);
  background-color: #fff;

  .section {
    padding: 20rpx;

    .section-title {
      margin-bottom: 20rpx;
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20rpx;

      .product-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .product-image {
          width: 160rpx;
          height: 160rpx;
          margin-bottom: 12rpx;
          border-radius: 12rpx;
        }

        .product-name {
          margin-bottom: 8rpx;
          font-size: 24rpx;
          color: #333;
          text-align: center;
        }

        .forecast-info {
          display: flex;
          flex-direction: column;
          align-items: center;

          .current-price {
            margin-bottom: 4rpx;
            font-size: 24rpx;
            color: #666;
          }

          .forecast-price {
            font-size: 24rpx;
            font-weight: bold;

            &.up {
              color: #ff6b6b;
            }

            &.down {
              color: #018d71;
            }
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
</style>
