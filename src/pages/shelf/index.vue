<template>
  <view class="shelf-container">
    <!-- 顶部操作栏 -->
    <view class="action-bar">
      <wd-button type="primary" size="small" @click="handleAddGoods">添加商品</wd-button>
      <view class="filter-group">
        <wd-button-group>
          <wd-button
            :type="status === '' ? 'primary' : 'default'"
            size="small"
            @click="handleFilterStatus('')"
          >
            全部
          </wd-button>
          <wd-button
            :type="status === 'on' ? 'primary' : 'default'"
            size="small"
            @click="handleFilterStatus('on')"
          >
            已上架
          </wd-button>
          <wd-button
            :type="status === 'off' ? 'primary' : 'default'"
            size="small"
            @click="handleFilterStatus('off')"
          >
            已下架
          </wd-button>
        </wd-button-group>
      </view>
    </view>

    <!-- 商品列表 -->
    <z-paging ref="paging" v-model="goodsList" @query="queryGoodsList">
      <template #default>
        <view class="goods-list">
          <view v-for="goods in goodsList" :key="goods.id" class="goods-item">
            <image :src="goods.cover" mode="aspectFill" class="goods-image" />
            <view class="goods-info">
              <view class="goods-name">{{ goods.name }}</view>
              <view class="goods-price">¥{{ goods.price }}</view>
              <view class="goods-stock">库存: {{ goods.stock }}</view>
              <view class="goods-status" :class="goods.status === 'on' ? 'on' : 'off'">
                {{ goods.status === 'on' ? '已上架' : '已下架' }}
              </view>
            </view>
            <view class="goods-actions">
              <wd-button type="warning" size="small" @click="handleEditGoods(goods)">
                编辑
              </wd-button>
              <wd-button
                :type="goods.status === 'on' ? 'danger' : 'success'"
                size="small"
                @click="handleToggleStatus(goods)"
              >
                {{ goods.status === 'on' ? '下架' : '上架' }}
              </wd-button>
              <wd-button type="danger" size="small" @click="handleDeleteGoods(goods)">
                删除
              </wd-button>
            </view>
          </view>
        </view>
      </template>
    </z-paging>

    <!-- 操作确认弹窗 -->
    <wd-message-box
      v-model="showConfirm"
      :title="confirmTitle"
      :content="confirmContent"
      @confirm="handleConfirm"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { GoodsItem } from '@/types/goods'

// 状态过滤
const status = ref('')
const handleFilterStatus = (newStatus: string) => {
  status.value = newStatus
  paging.value?.reload()
}

// 分页列表
const paging = ref()
const goodsList = ref<GoodsItem[]>([])

// 查询商品列表
const queryGoodsList = async (pageNo: number, pageSize: number) => {
  try {
    const params = {
      pageNo,
      pageSize,
      status: status.value,
    }
    const res = await uni.$api.goods.getSellerGoods(params)
    return {
      list: res.data.list,
      total: res.data.total,
    }
  } catch (error) {
    uni.showToast({
      title: '获取商品列表失败',
      icon: 'none',
    })
    return {
      list: [],
      total: 0,
    }
  }
}

// 添加商品
const handleAddGoods = () => {
  uni.navigateTo({
    url: '/pages-sub/goods/edit',
  })
}

// 编辑商品
const handleEditGoods = (goods: GoodsItem) => {
  uni.navigateTo({
    url: '/pages-sub/goods/edit?id=' + goods.id,
  })
}

// 确认弹窗
const showConfirm = ref(false)
const confirmTitle = ref('')
const confirmContent = ref('')
const confirmCallback = ref<() => void>()

const handleConfirm = async () => {
  try {
    await confirmCallback.value?.()
    uni.showToast({
      title: '操作成功',
      icon: 'success',
    })
    paging.value?.reload()
  } catch (error) {
    uni.showToast({
      title: '操作失败',
      icon: 'none',
    })
  }
}

// 切换商品状态
const handleToggleStatus = (goods: GoodsItem) => {
  const newStatus = goods.status === 'on' ? 'off' : 'on'
  confirmTitle.value = newStatus === 'on' ? '上架商品' : '下架商品'
  confirmContent.value =
    '确定要' + (newStatus === 'on' ? '上架' : '下架') + '商品【' + goods.name + '】吗？'
  confirmCallback.value = async () => {
    await uni.$api.goods.updateGoodsStatus({
      id: goods.id,
      status: newStatus,
    })
  }
  showConfirm.value = true
}

// 删除商品
const handleDeleteGoods = (goods: GoodsItem) => {
  confirmTitle.value = '删除商品'
  confirmContent.value = '确定要删除商品【' + goods.name + '】吗？'
  confirmCallback.value = async () => {
    await uni.$api.goods.deleteGoods(goods.id)
  }
  showConfirm.value = true
}
</script>

<style lang="scss">
.shelf-container {
  min-height: 100vh;
  padding: 20rpx;
  background-color: #f8f8f8;

  .action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx;
    margin-bottom: 20rpx;
    background-color: #fff;
    border-radius: 8rpx;
  }

  .goods-list {
    .goods-item {
      display: flex;
      padding: 20rpx;
      margin-bottom: 20rpx;
      background-color: #fff;
      border-radius: 8rpx;

      .goods-image {
        width: 160rpx;
        height: 160rpx;
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
          font-weight: bold;
          color: #333;
        }

        .goods-price {
          font-size: 32rpx;
          font-weight: bold;
          color: #ff4d4f;
        }

        .goods-stock {
          font-size: 24rpx;
          color: #999;
        }

        .goods-status {
          display: inline-block;
          padding: 4rpx 12rpx;
          font-size: 24rpx;
          border-radius: 4rpx;

          &.on {
            color: #1890ff;
            background-color: #e6f7ff;
          }

          &.off {
            color: #ff4d4f;
            background-color: #fff1f0;
          }
        }
      }

      .goods-actions {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        margin-left: 20rpx;

        .wd-button {
          margin: 6rpx 0;
        }
      }
    }
  }
}
</style>
