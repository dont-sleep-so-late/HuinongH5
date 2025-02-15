<template>
  <view class="footprints">
    <!-- 日期分组列表 -->
    <z-paging ref="paging" v-model="footprintsList" @query="queryFootprints">
      <template #default>
        <view class="date-groups">
          <view v-for="group in groupedFootprints" :key="group.date" class="date-group">
            <view class="date-header">{{ group.date }}</view>
            <view class="goods-list">
              <view v-for="goods in group.items" :key="goods.id" class="goods-item">
                <image :src="goods.cover" mode="aspectFill" class="goods-image" />
                <view class="goods-info">
                  <view class="goods-name">{{ goods.name }}</view>
                  <view class="goods-price">¥{{ goods.price }}</view>
                  <view class="browse-time">{{ goods.browseTime }}</view>
                  <view class="goods-actions">
                    <wd-button size="small" @click="handleViewDetail(goods)">查看详情</wd-button>
                    <wd-button type="danger" size="small" @click="handleDelete(goods)">
                      删除记录
                    </wd-button>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </template>
    </z-paging>

    <!-- 空状态 -->
    <view v-if="footprintsList.length === 0" class="empty-state">
      <image src="/static/images/empty/footprint.png" mode="aspectFit" />
      <text>暂无浏览记录</text>
      <wd-button type="primary" size="small" @click="handleGoShopping">去逛逛</wd-button>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <wd-button type="danger" block @click="handleClearAll">清空足迹</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { GoodsItem } from '@/types/goods'
import { useRouter } from '@/hooks/router'
import dayjs from 'dayjs'

interface FootprintItem extends GoodsItem {
  browseTime: string
}

const router = useRouter()
const paging = ref()
const footprintsList = ref<FootprintItem[]>([])

// 按日期分组
const groupedFootprints = computed(() => {
  const groups: { [key: string]: FootprintItem[] } = {}
  footprintsList.value.forEach((item) => {
    const date = dayjs(item.browseTime).format('YYYY-MM-DD')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
  })

  return Object.entries(groups).map(([date, items]) => ({
    date,
    items,
  }))
})

// 查询浏览记录
const queryFootprints = async (pageNo: number, pageSize: number) => {
  try {
    const res = await uni.$api.user.getFootprints({ pageNo, pageSize })
    return {
      list: res.data.list,
      total: res.data.total,
    }
  } catch (error) {
    uni.showToast({
      title: '获取浏览记录失败',
      icon: 'none',
    })
    return {
      list: [],
      total: 0,
    }
  }
}

// 查看商品详情
const handleViewDetail = (goods: FootprintItem) => {
  router.navigate('/pages-sub/goods/detail', {
    id: goods.id,
  })
}

// 删除单条记录
const handleDelete = (goods: FootprintItem) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该浏览记录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await uni.$api.user.deleteFootprint(goods.id)
          uni.showToast({
            title: '删除成功',
            icon: 'success',
          })
          paging.value?.reload()
        } catch (error) {
          uni.showToast({
            title: '删除失败',
            icon: 'none',
          })
        }
      }
    },
  })
}

// 清空所有记录
const handleClearAll = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清空所有浏览记录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await uni.$api.user.clearFootprints()
          uni.showToast({
            title: '清空成功',
            icon: 'success',
          })
          paging.value?.reload()
        } catch (error) {
          uni.showToast({
            title: '清空失败',
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
.footprints {
  min-height: 100vh;
  padding: 20rpx;
  padding-bottom: calc(20rpx + 120rpx);
  background-color: #f8f8f8;

  .date-groups {
    .date-group {
      margin-bottom: 20rpx;

      .date-header {
        padding: 20rpx;
        font-size: 28rpx;
        color: #999;
      }

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

            .browse-time {
              font-size: 24rpx;
              color: #999;
            }

            .goods-actions {
              display: flex;
              gap: 20rpx;
            }
          }
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

  .bottom-bar {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 20rpx;
    background-color: #fff;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  }
}
</style>
