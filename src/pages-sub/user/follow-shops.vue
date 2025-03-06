<template>
  <view class="follow-shops">
    <scroll-view
      scroll-y
      class="shop-list"
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="shop-items" v-if="shopList.length > 0">
        <view
          v-for="item in shopList"
          :key="item.sellerId"
          class="shop-item"
          @click="goToShop(item.sellerId)"
        >
          <image :src="item.avatar" mode="aspectFill" class="shop-avatar" />
          <view class="shop-info">
            <text class="shop-name">{{ item.sellerName }}</text>
            <view class="shop-stats">
              <text>商品数量：{{ item.productCount }}</text>
              <text>关注人数：{{ item.followerCount }}</text>
            </view>
            <text class="favorite-time">{{ item.favoriteTime }}</text>
          </view>
          <wd-button size="small" type="primary" @click.stop="handleUnfollow(item)">
            取消关注
          </wd-button>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="loading" v-if="isLoading">
        <wd-loading size="20" />
        <text>加载中...</text>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-if="shopList.length === 0 && !isLoading">
        <image src="/static/images/empty-favorite.png" mode="aspectFit" class="empty-icon" />
        <text>暂无关注商家</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import { getFavoriteSellers, toggleFavoriteSeller, type FavoriteSeller } from '@/api/profile'
import type { PageResponse } from '@/types/api'

const router = useRouter()

// 加载状态
const isLoading = ref(false)
const isRefreshing = ref(false)
const page = ref(1)
const pageSize = ref(10)

// 商家列表
const shopList = ref<FavoriteSeller[]>([])

// 加载商家列表
const loadShops = async () => {
  if (isLoading.value) return
  isLoading.value = true

  try {
    const res = await getFavoriteSellers({
      pageNum: page.value,
      pageSize: pageSize.value,
    })

    if (res.code === 200 && res.data) {
      const pageData = res.data as unknown as PageResponse<FavoriteSeller>
      if (page.value === 1) {
        shopList.value = pageData.records
      } else {
        shopList.value = [...shopList.value, ...pageData.records]
      }
      // 如果没有更多数据了，禁止继续加载
      if (pageData.current >= pageData.pages) {
        isLoading.value = false
      } else {
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

// 跳转到商家店铺
const goToShop = (sellerId: number) => {
  router.navigate(`/pages-sub/shop/index?id=${sellerId}`)
}

// 取消关注商家
const handleUnfollow = async (shop: FavoriteSeller) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消关注该商家吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const res = await toggleFavoriteSeller(shop.sellerId)
          if (res.code === 200) {
            showToast('取消关注成功')
            // 重新加载列表
            page.value = 1
            shopList.value = []
            loadShops()
          }
        } catch (error: any) {
          showToast(error.message || '操作失败')
        }
      }
    },
  })
}

// 加载更多
const loadMore = () => {
  loadShops()
}

// 下拉刷新
const onRefresh = async () => {
  isRefreshing.value = true
  page.value = 1
  shopList.value = []
  await loadShops()
}

// 页面加载
onMounted(() => {
  loadShops()
})
</script>

<style lang="scss">
.follow-shops {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.shop-list {
  height: 100vh;
  padding: 20rpx;
}

.shop-items {
  .shop-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    margin-bottom: 20rpx;
    background-color: #fff;
    border-radius: 16rpx;

    .shop-avatar {
      width: 100rpx;
      height: 100rpx;
      margin-right: 20rpx;
      border-radius: 50%;
    }

    .shop-info {
      flex: 1;
      margin-right: 20rpx;

      .shop-name {
        display: block;
        margin-bottom: 12rpx;
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }

      .shop-stats {
        margin-bottom: 12rpx;
        font-size: 24rpx;
        color: #666;

        text {
          margin-right: 20rpx;
        }
      }

      .favorite-time {
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
