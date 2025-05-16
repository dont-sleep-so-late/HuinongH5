<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="搜索商品"
        placeholder-class="placeholder"
        @confirm="handleSearch"
      />
      <text class="search-icon" @click="handleSearch">搜索</text>
    </view>

    <!-- 分类内容 -->
    <view class="content">
      <!-- 左侧分类列表 -->
      <scroll-view class="category-list" scroll-y>
        <view
          v-for="item in categories"
          :key="item.id"
          class="category-item"
          :class="{ active: activeCategory === item.id }"
          @click="handleCategoryClick(item)"
        >
          {{ item.name }}
        </view>
      </scroll-view>

      <!-- 右侧商品列表 -->
      <scroll-view class="goods-list" scroll-y @scrolltolower="loadMore">
        <!-- 当前分类信息 -->
        <view v-if="currentCategory" class="category-info">
          <image class="category-banner" :src="currentCategory.banner" mode="aspectFill" />
          <view class="category-name">{{ currentCategory.name }}</view>
        </view>

        <!-- 子分类列表 -->
        <view v-if="currentCategory?.children?.length" class="sub-category-list">
          <view
            v-for="item in currentCategory.children"
            :key="item.id"
            class="sub-category-item"
            @click="handleSubCategoryClick(item)"
          >
            <image class="sub-category-icon" :src="item.icon" mode="aspectFit" />
            <text class="sub-category-name">{{ item.name }}</text>
          </view>
        </view>

        <!-- 商品列表 -->
        <view class="goods-grid">
          <view
            v-for="item in goodsList"
            :key="item.id"
            class="goods-item"
            @click="navigateToDetail(item)"
          >
            <image class="goods-image" :src="item.mainImage" mode="aspectFill" />
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

        <!-- 加载状态 -->
        <view v-if="isLoading" class="loading">加载中...</view>
      </scroll-view>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import { getCategoryTree, getCategoryProducts } from '@/api/category'
import type { Category, ProductBase, ProductQueryParams } from '@/api/category'

const router = useRouter()

// 搜索关键词
const searchKeyword = ref('')

// 加载状态
const isLoading = ref(false)
const page = ref(1)
const pageSize = ref(10)

// 当前选中的分类
const activeCategory = ref(0)

// 分类数据
const categories = ref<Category[]>([])

// 商品列表
const goodsList = ref<ProductBase[]>([])

// 计算当前分类
const currentCategory = computed(() => {
  return (
    categories.value.find((item: Category) => item.id === activeCategory.value) ||
    categories.value[0]
  )
})

// 加载分类数据
const loadCategories = async () => {
  try {
    const res = await getCategoryTree()
    if (res.code === 200 && res.data) {
      categories.value = res.data
      if (categories.value.length > 0) {
        activeCategory.value = categories.value[0].id
        loadGoods()
      }
    }
  } catch (error: any) {
    showToast(error.message || '加载分类失败')
  }
}

// 处理分类点击
const handleCategoryClick = (category: Category) => {
  activeCategory.value = category.id
  page.value = 1
  goodsList.value = []
  loadGoods()
}

// 处理子分类点击
const handleSubCategoryClick = (subCategory: Category) => {
  router.navigate('/pages-sub/goods/list', {
    categoryId: subCategory.id,
    name: subCategory.name,
  })
}

// 加载商品数据
const loadGoods = async () => {
  if (isLoading.value || !activeCategory.value) return
  isLoading.value = true

  try {
    const params: ProductQueryParams = {
      pageNum: page.value,
      pageSize: pageSize.value,
      categoryId: activeCategory.value,
      sort: 'new',
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
    showToast(error.message || '加载失败')
  } finally {
    isLoading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    showToast('请输入搜索关键词')
    return
  }

  router.navigate('/pages-sub/goods/search', {
    keyword: searchKeyword.value,
  })
}

// 跳转到商品详情
const navigateToDetail = (item: ProductBase) => {
  router.navigate('/pages-sub/goods/detail', {
    id: item.id,
  })
}

// 加载更多
const loadMore = () => {
  if (!isLoading.value) {
    loadGoods()
  }
}

// 页面加载
onMounted(() => {
  loadCategories()
})
</script>

<style lang="scss">
.container {
  height: 100vh;
  background-color: #f5f5f5;
}

.search-bar {
  position: relative;
  padding: 20rpx;
  background-color: #fff;

  input {
    width: 100%;
    height: 80rpx;
    padding: 0 80rpx 0 20rpx;
    font-size: 28rpx;
    background-color: #f5f5f5;
    border-radius: 40rpx;
  }

  .search-icon {
    position: absolute;
    top: 50%;
    right: 40rpx;
    font-size: 28rpx;
    color: #666;
    transform: translateY(-50%);
  }

  .placeholder {
    color: #999;
  }
}

.content {
  display: flex;
  height: calc(100vh - 120rpx);
}

.category-list {
  width: 180rpx;
  height: 100%;
  background-color: #f5f5f5;

  .category-item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100rpx;
    font-size: 28rpx;
    color: #333;
    background-color: #f5f5f5;

    &.active {
      font-weight: bold;
      color: #ff6b35;
      background-color: #fff;

      &::before {
        position: absolute;
        top: 50%;
        left: 0;
        width: 6rpx;
        height: 36rpx;
        content: '';
        background-color: #ff6b35;
        border-radius: 0 4rpx 4rpx 0;
        transform: translateY(-50%);
      }
    }
  }
}

.goods-list {
  flex: 1;
  height: 100%;
  background-color: #fff;

  .category-info {
    position: relative;
    height: 300rpx;
    background-color: #fff;

    .category-banner {
      width: 100%;
      height: 100%;
    }

    .category-name {
      position: absolute;
      bottom: 20rpx;
      left: 20rpx;
      font-size: 28rpx;
      font-weight: bold;
      color: #fff;
      text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
    }
  }

  .sub-category-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 20rpx;
    background-color: #fff;
    border-bottom: 2rpx solid #f5f5f5;

    .sub-category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20rpx;

      .sub-category-icon {
        width: 80rpx;
        height: 80rpx;
        margin-bottom: 10rpx;
      }

      .sub-category-name {
        font-size: 24rpx;
        color: #333;
      }
    }
  }

  .goods-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
    padding: 20rpx;

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
        height: 320rpx;
        background-color: #f7f8fa;
        transition: transform 0.3s ease;
      }

      .goods-info {
        position: relative;
        flex: 1;
        padding: 20rpx 24rpx;

        .goods-name {
          display: block;
          margin-bottom: 12rpx;
          font-size: 28rpx;
          font-weight: 600;
          line-height: 1.4;
          color: #333;
          @in (2);
        }

        .goods-desc {
          display: block;
          margin-bottom: 16rpx;
          font-size: 24rpx;
          line-height: 1.4;
          color: #999;
        }

        .goods-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .goods-price {
            font-size: 36rpx;
            font-weight: 600;
            line-height: 1;
            color: #ff4d4f;

            &::before {
              margin-right: 2rpx;
              font-size: 24rpx;
              font-weight: normal;
              content: '¥';
            }
          }

          .goods-sales {
            padding: 4rpx 12rpx;
            font-size: 22rpx;
            color: #999;
            background-color: #f7f8fa;
            border-radius: 20rpx;
          }
        }
      }

      // 添加商品标签（如果需要）
      .goods-tag {
        position: absolute;
        top: 16rpx;
        left: 16rpx;
        padding: 4rpx 12rpx;
        font-size: 20rpx;
        color: #fff;
        background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
        border-radius: 8rpx 8rpx 8rpx 0;
        opacity: 0.9;
      }

      // 添加收藏按钮（如果需要）
      .favorite-btn {
        position: absolute;
        top: 16rpx;
        right: 16rpx;
        width: 56rpx;
        height: 56rpx;
        line-height: 56rpx;
        color: #fff;
        text-align: center;
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(4px);
        border-radius: 50%;
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
}

@keyframes loading {
  to {
    transform: rotate(360deg);
  }
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom);
}
</style>
