<template>
  <view class="shelf-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <wd-search v-model="searchParams.name" placeholder="搜索商品名称" @search="handleSearch" />
    </view>

    <!-- 顶部操作栏 -->
    <view class="action-bar">
      <view class="left">
        <wd-button type="primary" size="small" @click="handleAddGoods">
          <template #icon>
            <wd-icon name="add" />
          </template>
          添加商品
        </wd-button>
      </view>
      <view class="right">
        <wd-button-group>
          <wd-button
            v-for="btn in statusButtons"
            :key="btn.value"
            :type="searchParams.status === btn.value ? 'primary' : 'default'"
            size="small"
            @click="handleFilterStatus(btn.value)"
          >
            {{ btn.text }}
          </wd-button>
        </wd-button-group>
        <wd-dropdown>
          <wd-button size="small">
            {{ currentSort.text }}
            <wd-icon name="arrow-down" />
          </wd-button>
          <template #content>
            <wd-dropdown-item
              v-for="item in sortOptions"
              :key="item.value"
              :value="item.value"
              :label="item.text"
              @click="handleSort(item)"
            />
          </template>
        </wd-dropdown>
      </view>
    </view>

    <!-- 商品列表 -->
    <z-paging ref="paging" v-model="goodsList" @query="queryGoodsList">
      <template #default>
        <view class="goods-list">
          <view v-for="goods in goodsList" :key="goods.id" class="goods-item">
            <image :src="goods.mainImage" mode="aspectFill" class="goods-image" />
            <view class="goods-info">
              <view class="goods-name">{{ goods.name }}</view>
              <view class="goods-price">¥{{ goods.price }}</view>
              <view class="goods-stats">
                <text>库存: {{ goods.stock }}{{ goods.unit || '件' }}</text>
                <text>销量: {{ goods.sales || 0 }}</text>
              </view>
              <view
                class="goods-status"
                :class="{ on: goods.status === 1, off: goods.status === 0 }"
              >
                {{ goods.status === 1 ? '已上架' : '已下架' }}
              </view>
            </view>
            <view class="goods-actions">
              <wd-button type="warning" size="small" @click="handleEditGoods(goods)">
                编辑
              </wd-button>
              <wd-button
                :type="goods.status === 1 ? 'danger' : 'success'"
                size="small"
                @click="handleToggleStatus(goods)"
              >
                {{ goods.status === 1 ? '下架' : '上架' }}
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
      v-model="confirmState.show"
      :title="confirmState.title"
      :content="confirmState.content"
      @confirm="handleConfirm"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { GoodsItem, GoodsStatus, GoodsQueryParams } from '@/types/goods'

// 搜索参数
const searchParams = ref<GoodsQueryParams>({
  pageNum: 1,
  pageSize: 10,
  name: '',
  status: undefined,
  categoryId: undefined,
  sort: undefined,
})

// 状态按钮配置
const statusButtons = [
  { text: '全部', value: undefined },
  { text: '已上架', value: 1 as GoodsStatus },
  { text: '已下架', value: 0 as GoodsStatus },
]

// 排序选项
const sortOptions = [
  { text: '默认排序', value: '' },
  { text: '价格升序', value: 'price_asc' },
  { text: '价格降序', value: 'price_desc' },
  { text: '最新上架', value: 'time_desc' },
  { text: '最早上架', value: 'time_asc' },
]

// 当前排序
const currentSort = computed(() => {
  return sortOptions.find((item) => item.value === searchParams.value.sort) || sortOptions[0]
})

// 分页列表
const paging = ref()
const goodsList = ref<GoodsItem[]>([])

// 重载列表
const reloadList = () => {
  paging.value?.reload()
}

// 搜索处理
const handleSearch = () => {
  reloadList()
}

// 状态筛选
const handleFilterStatus = (status?: GoodsStatus) => {
  searchParams.value.status = status
  reloadList()
}

// 排序处理
const handleSort = (sort: (typeof sortOptions)[0]) => {
  searchParams.value.sort = sort.value || undefined
  reloadList()
}

// 查询商品列表
const queryGoodsList = async (pageNum: number, pageSize: number) => {
  try {
    const params = {
      ...searchParams.value,
      pageNum,
      pageSize,
    }
    const { data } = await uni.$api.seller.products.getList(params)
    return {
      list: data.list,
      total: data.total,
    }
  } catch (error) {
    showError('获取商品列表失败')
    return {
      list: [],
      total: 0,
    }
  }
}

// 统一的错误提示
const showError = (message: string) => {
  uni.showToast({
    title: message,
    icon: 'none',
  })
}

// 统一的成功提示
const showSuccess = (message: string) => {
  uni.showToast({
    title: message,
    icon: 'success',
  })
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
    url: `/pages-sub/goods/edit?id=${goods.id}`,
  })
}

// 确认弹窗状态
interface ConfirmState {
  show: boolean
  title: string
  content: string
  callback?: () => Promise<void>
}

const confirmState = ref<ConfirmState>({
  show: false,
  title: '',
  content: '',
})

// 显示确认弹窗
const showConfirm = (title: string, content: string, callback: () => Promise<void>) => {
  confirmState.value = {
    show: true,
    title,
    content,
    callback,
  }
}

// 确认操作
const handleConfirm = async () => {
  try {
    await confirmState.value.callback?.()
    showSuccess('操作成功')
    reloadList()
  } catch (error) {
    showError('操作失败')
  }
}

// 切换商品状态
const handleToggleStatus = (goods: GoodsItem) => {
  const newStatus = goods.status === 1 ? 0 : 1
  const action = newStatus === 1 ? '上架' : '下架'

  showConfirm(`${action}商品`, `确定要${action}商品【${goods.name}】吗？`, async () => {
    await uni.$api.seller.products.updateStatus(goods.id, newStatus)
  })
}

// 删除商品
const handleDeleteGoods = (goods: GoodsItem) => {
  showConfirm('删除商品', `确定要删除商品【${goods.name}】吗？`, async () => {
    await uni.$api.seller.products.delete(goods.id)
  })
}
</script>

<style lang="scss">
.shelf-container {
  min-height: 100vh;
  padding: 20rpx;
  background-color: #f8f8f8;

  .search-bar {
    margin-bottom: 20rpx;
  }

  .action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20rpx;
    margin-bottom: 20rpx;
    background-color: #fff;
    border-radius: 8rpx;

    .right {
      display: flex;
      gap: 20rpx;
      align-items: center;
    }
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

        .goods-stats {
          display: flex;
          gap: 20rpx;
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
