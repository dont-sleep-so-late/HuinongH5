<template>
  <view class="footprints">
    <view class="header">
      <text class="title">浏览足迹</text>
      <text class="clear-btn" @click="handleClear">清空足迹</text>
    </view>

    <scroll-view
      scroll-y
      class="goods-list"
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
    >
      <view class="goods-items" v-if="goodsList.length > 0">
        <view
          v-for="item in goodsList"
          :key="item.productId"
          class="goods-item"
          @click="goToDetail(item.productId)"
        >
          <image :src="item.mainImage" mode="aspectFill" class="goods-image" />
          <view class="goods-info">
            <text class="goods-name">{{ item.productName }}</text>
            <view class="shop-info">
              <image :src="item.sellerAvatar" mode="aspectFill" class="shop-avatar" />
              <text class="shop-name">{{ item.sellerName }}</text>
            </view>
            <view class="goods-bottom">
              <text class="goods-price">¥{{ item.price }}</text>
              <text class="goods-sales">销量 {{ item.salesVolume }}</text>
            </view>
            <text class="browsing-time">{{ item.browsingTime }}</text>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view class="loading" v-if="isLoading">
        <wd-loading size="20" />
        <text>加载中...</text>
      </view>

      <!-- 空状态 -->
      <view class="empty" v-if="goodsList.length === 0 && !isLoading">
        <image src="/static/images/empty-footprint.png" mode="aspectFit" class="empty-icon" />
        <text>暂无浏览记录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import { getBrowsingHistory, clearBrowsingHistory, type BrowsingHistory } from '@/api/profile'
import type { PageResponse } from '@/types/api'

const router = useRouter()

// 加载状态
const isLoading = ref(false)
const isRefreshing = ref(false)
const page = ref(1)
const pageSize = ref(10)

// 商品列表
const goodsList = ref<BrowsingHistory[]>([])

// 加载商品列表
const loadGoods = async () => {
  if (isLoading.value) return
  isLoading.value = true

  try {
    const res = await getBrowsingHistory({
      pageNum: page.value,
      pageSize: pageSize.value,
    })

    if (res.code === 200 && res.data) {
      const pageData = res.data as unknown as PageResponse<BrowsingHistory>
      if (page.value === 1) {
        goodsList.value = pageData.records
      } else {
        goodsList.value = [...goodsList.value, ...pageData.records]
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

// 跳转到商品详情
const goToDetail = (id: number) => {
  router.navigate(`/pages-sub/goods/detail?id=${id}`)
}

// 清空足迹
const handleClear = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空浏览足迹吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const res = await clearBrowsingHistory()
          if (res.code === 200) {
            showToast('清空成功')
            goodsList.value = []
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
  loadGoods()
}

// 下拉刷新
const onRefresh = async () => {
  isRefreshing.value = true
  page.value = 1
  goodsList.value = []
  await loadGoods()
}

// 页面加载
onMounted(() => {
  loadGoods()
})
</script>

<style lang="scss">
.footprints {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  background-color: #fff;

  .title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }

  .clear-btn {
    font-size: 28rpx;
    color: #666;
  }
}

.goods-list {
  height: calc(100vh - 92rpx);
  padding: 20rpx;
}

.goods-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;

  .goods-item {
    overflow: hidden;
    background-color: #fff;
    border-radius: 16rpx;

    .goods-image {
      width: 100%;
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

      .shop-info {
        display: flex;
        align-items: center;
        margin-bottom: 16rpx;

        .shop-avatar {
          width: 32rpx;
          height: 32rpx;
          margin-right: 8rpx;
          border-radius: 50%;
        }

        .shop-name {
          font-size: 24rpx;
          color: #666;
        }
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

      .browsing-time {
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
