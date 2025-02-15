<template>
  <view class="follow-shops">
    <!-- 商家列表 -->
    <z-paging ref="paging" v-model="shopList" @query="queryShopList">
      <template #default>
        <view class="shop-list">
          <view v-for="shop in shopList" :key="shop.id" class="shop-item">
            <image :src="shop.logo" mode="aspectFill" class="shop-logo" />
            <view class="shop-info">
              <view class="shop-name">{{ shop.name }}</view>
              <view class="shop-desc">{{ shop.description }}</view>
              <view class="shop-data">
                <text>商品数: {{ shop.goodsCount }}</text>
                <text>关注数: {{ shop.followCount }}</text>
              </view>
            </view>
            <view class="shop-actions">
              <wd-button size="small" @click="handleViewShop(shop)">进店逛逛</wd-button>
              <wd-button type="danger" size="small" @click="handleUnfollow(shop)">
                取消关注
              </wd-button>
            </view>
          </view>
        </view>
      </template>
    </z-paging>

    <!-- 空状态 -->
    <view v-if="shopList.length === 0" class="empty-state">
      <image src="/static/images/empty/follow.png" mode="aspectFit" />
      <text>暂无关注商家</text>
      <wd-button type="primary" size="small" @click="handleGoShopping">去逛逛</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '@/hooks/router'

interface ShopItem {
  id: string
  name: string
  logo: string
  description: string
  goodsCount: number
  followCount: number
}

const router = useRouter()
const paging = ref()
const shopList = ref<ShopItem[]>([])

// 查询关注商家列表
const queryShopList = async (pageNo: number, pageSize: number) => {
  try {
    const res = await uni.$api.user.getFollowShops({ pageNo, pageSize })
    return {
      list: res.data.list,
      total: res.data.total,
    }
  } catch (error) {
    uni.showToast({
      title: '获取关注商家失败',
      icon: 'none',
    })
    return {
      list: [],
      total: 0,
    }
  }
}

// 查看商家店铺
const handleViewShop = (shop: ShopItem) => {
  router.navigate('/pages-sub/shop/detail', {
    id: shop.id,
  })
}

// 取消关注
const handleUnfollow = (shop: ShopItem) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消关注该商家吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await uni.$api.user.unfollowShop(shop.id)
          uni.showToast({
            title: '取消关注成功',
            icon: 'success',
          })
          paging.value?.reload()
        } catch (error) {
          uni.showToast({
            title: '取消关注失败',
            icon: 'none',
          })
        }
      }
    },
  })
}

// 去购物
const handleGoShopping = () => {
  router.switchTab('/pages/index/index')
}
</script>

<style lang="scss">
.follow-shops {
  min-height: 100vh;
  padding: 20rpx;
  background-color: #f8f8f8;

  .shop-list {
    .shop-item {
      display: flex;
      padding: 20rpx;
      margin-bottom: 20rpx;
      background-color: #fff;
      border-radius: 12rpx;

      .shop-logo {
        width: 120rpx;
        height: 120rpx;
        margin-right: 20rpx;
        border-radius: 8rpx;
      }

      .shop-info {
        display: flex;
        flex: 1;
        flex-direction: column;
        justify-content: space-between;

        .shop-name {
          font-size: 28rpx;
          font-weight: bold;
          color: #333;
        }

        .shop-desc {
          font-size: 24rpx;
          line-height: 1.4;
          color: #666;
        }

        .shop-data {
          display: flex;
          gap: 20rpx;
          font-size: 24rpx;
          color: #999;
        }
      }

      .shop-actions {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        margin-left: 20rpx;
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100rpx 0;

    image {
      width: 240rpx;
      height: 240rpx;
      margin-bottom: 20rpx;
    }

    text {
      margin-bottom: 30rpx;
      font-size: 28rpx;
      color: #999;
    }
  }
}
</style>
