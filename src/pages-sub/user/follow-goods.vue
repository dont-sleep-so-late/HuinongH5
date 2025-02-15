<template>
  <view class="follow-goods">
    <!-- 商品列表 -->
    <z-paging ref="paging" v-model="goodsList" @query="queryGoodsList">
      <template #default>
        <view class="goods-list">
          <view v-for="goods in goodsList" :key="goods.id" class="goods-item">
            <image :src="goods.cover" mode="aspectFill" class="goods-image" />
            <view class="goods-info">
              <view class="goods-name">{{ goods.name }}</view>
              <view class="goods-price">¥{{ goods.price }}</view>
              <view class="goods-actions">
                <wd-button size="small" @click="handleViewDetail(goods)">查看详情</wd-button>
                <wd-button type="danger" size="small" @click="handleUnfollow(goods)">
                  取消关注
                </wd-button>
              </view>
            </view>
          </view>
        </view>
      </template>
    </z-paging>

    <!-- 空状态 -->
    <view v-if="goodsList.length === 0" class="empty-state">
      <image src="/static/images/empty/follow.png" mode="aspectFit" />
      <text>暂无关注商品</text>
      <wd-button type="primary" size="small" @click="handleGoShopping">去逛逛</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { GoodsItem } from '@/types/goods'
import { useRouter } from '@/hooks/router'

const router = useRouter()
const paging = ref()
const goodsList = ref<GoodsItem[]>([])

// 查询关注商品列表
const queryGoodsList = async (pageNo: number, pageSize: number) => {
  try {
    const res = await uni.$api.user.getFollowGoods({ pageNo, pageSize })
    return {
      list: res.data.list,
      total: res.data.total,
    }
  } catch (error) {
    uni.showToast({
      title: '获取关注商品失败',
      icon: 'none',
    })
    return {
      list: [],
      total: 0,
    }
  }
}

// 查看商品详情
const handleViewDetail = (goods: GoodsItem) => {
  router.navigate('/pages-sub/goods/detail', {
    id: goods.id,
  })
}

// 取消关注
const handleUnfollow = (goods: GoodsItem) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消关注该商品吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await uni.$api.user.unfollowGoods(goods.id)
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
.follow-goods {
  min-height: 100vh;
  padding: 20rpx;
  background-color: #f8f8f8;

  .goods-list {
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
        justify-content: space-between;

        .goods-name {
          font-size: 28rpx;
          line-height: 1.4;
          color: #333;
        }

        .goods-price {
          font-size: 32rpx;
          font-weight: bold;
          color: #ff4d4f;
        }

        .goods-actions {
          display: flex;
          gap: 20rpx;
        }
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
