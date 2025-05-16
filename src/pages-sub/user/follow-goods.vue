<template>
  <view class="follow-goods">
    <scroll-view
      scroll-y
      class="goods-list"
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="goods-items" v-if="goodsList && goodsList.length > 0">
        <view
          v-for="item in goodsList"
          :key="item.productId"
          class="goods-item"
          @click="goToDetail(item.productId)"
        >
          <image :src="item.mainImage" mode="aspectFill" class="goods-image" />
          <view class="goods-info">
            <text class="goods-name">{{ item.productName }}</text>
            <view class="goods-bottom">
              <text class="goods-price">¥{{ item.price }}</text>
              <text class="goods-sales">销量 {{ item.salesVolume }}</text>
            </view>
            <text class="favorite-time">{{ item.favoriteTime }}</text>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="loading" v-if="isLoading">
        <wd-loading size="20" />
        <text>加载中...</text>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-if="(!goodsList || goodsList.length === 0) && !isLoading">
        <image src="/static/images/empty-favorite.png" mode="aspectFit" class="empty-icon" />
        <text>暂无关注商品</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import { getFavoriteProducts, type FavoriteProduct } from '@/api/profile'
import type { PageResponse } from '@/types/api'

const router = useRouter()

// 加载状态
const isLoading = ref(false)
const isRefreshing = ref(false)
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)

// 商品列表
const goodsList = ref<FavoriteProduct[]>([])

// 加载商品列表
const loadGoods = async () => {
  if (isLoading.value || !hasMore.value) return
  isLoading.value = true

  try {
    const res = await getFavoriteProducts({
      pageNum: page.value,
      pageSize: pageSize.value,
    })

    if (res.code === 200 && res.data) {
      const pageData = res.data as unknown as PageResponse<FavoriteProduct>
      if (page.value === 1) {
        goodsList.value = pageData.list || []
      } else {
        goodsList.value = [...goodsList.value, ...(pageData.list || [])]
      }
      // 如果没有更多数据了，禁止继续加载
      hasMore.value = page.value < pageData.pages
      if (hasMore.value) {
        page.value++
      }
    }
  } catch (error: any) {
    showToast(error.message || '加载失败')
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

// 跳转到商品详情
const goToDetail = (id: number) => {
  router.navigate(`/pages-sub/goods/detail?id=${id}`)
}

// 加载更多
const loadMore = () => {
  if (!isLoading.value && hasMore.value) {
    loadGoods()
  }
}

// 下拉刷新
const onRefresh = async () => {
  isRefreshing.value = true
  page.value = 1
  hasMore.value = true
  goodsList.value = []
  await loadGoods()
}

// 页面加载
onMounted(() => {
  loadGoods()
})

// 页面卸载前清理
onBeforeUnmount(() => {
  // 重置所有状态
  isLoading.value = false
  isRefreshing.value = false
  page.value = 1
  hasMore.value = true
  goodsList.value = []
})
</script>

<style lang="scss">
.follow-goods {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.goods-list {
  height: 100vh;
  padding: 20rpx;
}

.goods-items {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 20rpx;

  .goods-item {
    overflow: hidden;
    background-color: #fff;
    border-radius: 16rpx;

    .goods-image {
      width: 40%;
      height: 345rpx;
    }

    .goods-info {
      padding: 20rpx;

      .goods-name {
        display: -webkit-box;
        margin-bottom: 16rpx;
        overflow: hidden;
        font-size: 28rpx;
        color: #333;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }

      .goods-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12rpx;

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

      .favorite-time {
        display: block;
        font-size: 24rpx;
        color: #999;
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
