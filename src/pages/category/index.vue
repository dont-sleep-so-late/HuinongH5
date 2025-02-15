<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <wd-input
        v-model="searchKeyword"
        placeholder="搜索商品"
        prefix-icon="search"
        clearable
        @click-input="handleSearch"
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
      <scroll-view scroll-y class="category-content" @scrolltolower="loadMore">
        <!-- 分类广告图 -->
        <image
          v-if="currentCategory.banner"
          :src="currentCategory.banner"
          mode="widthFix"
          class="category-banner"
        />

        <!-- 子分类列表 -->
        <view class="sub-categories" v-if="currentCategory.children">
          <view
            class="sub-category"
            v-for="sub in currentCategory.children"
            :key="sub.id"
            @click="handleSubCategoryClick(sub)"
          >
            <image :src="sub.icon" mode="aspectFit" class="sub-icon" />
            <text class="sub-name">{{ sub.name }}</text>
          </view>
        </view>

        <!-- 商品列表 -->
        <view class="goods-list">
          <view
            class="goods-item"
            v-for="item in goodsList"
            :key="item.id"
            @click="navigateToDetail(item)"
          >
            <image :src="item.image" mode="aspectFill" class="goods-image" />
            <view class="goods-info">
              <text class="goods-name">{{ item.name }}</text>
              <text class="goods-desc">{{ item.desc }}</text>
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
        <view class="empty" v-if="goodsList.length === 0 && !isLoading">
          <image src="/static/icons/empty-search.png" mode="aspectFit" class="empty-icon" />
          <text>暂无相关商品</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// 搜索关键词
const searchKeyword = ref('')

// 加载状态
const isLoading = ref(false)
const page = ref(1)
const pageSize = ref(10)

// 当前选中的分类
const activeCategory = ref(1)

// 分类数据
const categories = ref([
  {
    id: 1,
    name: '新鲜水果',
    banner: '/static/category/fruit-banner.jpg',
    children: [
      { id: 11, name: '苹果', icon: '/static/category/apple.png' },
      { id: 12, name: '橙子', icon: '/static/category/orange.png' },
      { id: 13, name: '香蕉', icon: '/static/category/banana.png' },
      { id: 14, name: '葡萄', icon: '/static/category/grape.png' },
      { id: 15, name: '草莓', icon: '/static/category/strawberry.png' },
      { id: 16, name: '火龙果', icon: '/static/category/dragon-fruit.png' },
    ],
  },
  {
    id: 2,
    name: '时令蔬菜',
    banner: '/static/category/vegetable-banner.jpg',
    children: [
      { id: 21, name: '白菜', icon: '/static/category/cabbage.png' },
      { id: 22, name: '胡萝卜', icon: '/static/category/carrot.png' },
      { id: 23, name: '土豆', icon: '/static/category/potato.png' },
      { id: 24, name: '茄子', icon: '/static/category/eggplant.png' },
      { id: 25, name: '青椒', icon: '/static/category/pepper.png' },
      { id: 26, name: '西红柿', icon: '/static/category/tomato.png' },
    ],
  },
  {
    id: 3,
    name: '肉禽蛋品',
    banner: '/static/category/meat-banner.jpg',
    children: [
      { id: 31, name: '猪肉', icon: '/static/category/pork.png' },
      { id: 32, name: '牛肉', icon: '/static/category/beef.png' },
      { id: 33, name: '羊肉', icon: '/static/category/mutton.png' },
      { id: 34, name: '鸡肉', icon: '/static/category/chicken.png' },
      { id: 35, name: '鸭肉', icon: '/static/category/duck.png' },
      { id: 36, name: '鸡蛋', icon: '/static/category/egg.png' },
    ],
  },
  {
    id: 4,
    name: '海鲜水产',
    banner: '/static/category/seafood-banner.jpg',
    children: [
      { id: 41, name: '鱼类', icon: '/static/category/fish.png' },
      { id: 42, name: '虾类', icon: '/static/category/shrimp.png' },
      { id: 43, name: '蟹类', icon: '/static/category/crab.png' },
      { id: 44, name: '贝类', icon: '/static/category/shell.png' },
      { id: 45, name: '海参', icon: '/static/category/sea-cucumber.png' },
      { id: 46, name: '鱿鱼', icon: '/static/category/squid.png' },
    ],
  },
  {
    id: 5,
    name: '粮油调味',
    banner: '/static/category/grocery-banner.jpg',
    children: [
      { id: 51, name: '大米', icon: '/static/category/rice.png' },
      { id: 52, name: '面粉', icon: '/static/category/flour.png' },
      { id: 53, name: '食用油', icon: '/static/category/oil.png' },
      { id: 54, name: '调味料', icon: '/static/category/seasoning.png' },
      { id: 55, name: '干货', icon: '/static/category/dried-food.png' },
      { id: 56, name: '酱料', icon: '/static/category/sauce.png' },
    ],
  },
])

// 商品列表
const goodsList = ref([])

// 计算当前分类
const currentCategory = computed(() => {
  return categories.value.find((item) => item.id === activeCategory.value) || categories.value[0]
})

// 处理分类点击
const handleCategoryClick = (category: any) => {
  activeCategory.value = category.id
  page.value = 1
  goodsList.value = []
  loadGoods()
}

// 处理子分类点击
const handleSubCategoryClick = (subCategory: any) => {
  uni.navigateTo({
    url: '/pages-sub/goods/list?categoryId=' + subCategory.id + '&name=' + subCategory.name,
  })
}

// 加载商品数据
const loadGoods = async () => {
  if (isLoading.value) return
  isLoading.value = true

  try {
    // 模拟数据加载
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const newGoods = Array(pageSize.value)
      .fill(null)
      .map((_, index) => ({
        id: page.value * pageSize.value + index,
        name: '商品' + (page.value * pageSize.value + index),
        desc: '商品描述信息',
        price: (Math.random() * 100 + 1).toFixed(2),
        sales: Math.floor(Math.random() * 1000),
        image: '/static/goods/default.jpg',
      }))

    goodsList.value = [...goodsList.value, ...newGoods]
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
    url: '/pages-sub/goods/search?keyword=' + encodeURIComponent(searchKeyword.value),
  })
}

// 跳转到商品详情
const navigateToDetail = (item: any) => {
  uni.navigateTo({
    url: '/pages-sub/goods/detail?id=' + item.id + '&name=' + encodeURIComponent(item.name),
  })
}

// 加载更多
const loadMore = () => {
  loadGoods()
}

// 监听分类变化
watch(activeCategory, () => {
  loadGoods()
})

// 页面加载
onMounted(() => {
  loadGoods()
})
</script>

<style lang="scss">
.container {
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
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
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

.category-content {
  flex: 1;
  height: calc(100vh - 120rpx);
  background-color: #fff;

  .category-banner {
    width: 100%;
    height: 300rpx;
  }

  .sub-categories {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20rpx;
    padding: 20rpx;
    background-color: #fff;

    .sub-category {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20rpx;

      .sub-icon {
        width: 80rpx;
        height: 80rpx;
        margin-bottom: 10rpx;
      }

      .sub-name {
        font-size: 24rpx;
        color: #333;
      }
    }
  }

  .goods-list {
    padding: 20rpx;

    .goods-item {
      display: flex;
      padding: 20rpx;
      margin-bottom: 20rpx;
      background-color: #fff;
      border-radius: 12rpx;
      box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

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
          margin-bottom: 10rpx;
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
