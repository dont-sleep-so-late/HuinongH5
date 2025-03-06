<template>
  <view class="goods-list">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view
        class="filter-item"
        v-for="(item, index) in filterItems"
        :key="index"
        :class="{ active: currentFilter === index }"
        @tap="switchFilter(index)"
      >
        <text>{{ item.name }}</text>
        <text class="icon" v-if="item.sortable">{{ getSortIcon(index) }}</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <z-paging ref="paging" v-model="goodsList" @query="queryList">
      <view class="goods-grid">
        <view
          class="goods-item"
          v-for="(item, index) in goodsList"
          :key="index"
          @tap="navigateToDetail(item.id)"
        >
          <image :src="item.image" mode="aspectFill" />
          <view class="goods-info">
            <text class="name">{{ item.name }}</text>
            <text class="desc">{{ item.desc }}</text>
            <view class="price-section">
              <text class="price">¥{{ item.price }}</text>
              <text class="sales">已售{{ item.sales }}件</text>
            </view>
          </view>
        </view>
      </view>
    </z-paging>

    <!-- 筛选弹窗 -->
    <wd-popup v-model="showFilter" position="right">
      <view class="filter-popup">
        <view class="popup-header">
          <text>筛选</text>
          <text class="close" @tap="closeFilter">×</text>
        </view>

        <scroll-view scroll-y class="popup-content">
          <!-- 价格区间 -->
          <view class="filter-section">
            <view class="section-title">价格区间</view>
            <view class="price-range">
              <input type="number" v-model="filterParams.minPrice" placeholder="最低价" />
              <text>-</text>
              <input type="number" v-model="filterParams.maxPrice" placeholder="最高价" />
            </view>
          </view>

          <!-- 商品分类 -->
          <view class="filter-section">
            <view class="section-title">商品分类</view>
            <view class="category-list">
              <view
                class="category-item"
                v-for="(item, index) in categories"
                :key="index"
                :class="{ active: filterParams.categoryId === item.id }"
                @tap="selectCategory(item.id)"
              >
                {{ item.name }}
              </view>
            </view>
          </view>

          <!-- 其他筛选条件 -->
          <view class="filter-section">
            <view class="section-title">其他</view>
            <view class="tag-list">
              <view
                class="tag-item"
                v-for="(item, index) in filterTags"
                :key="index"
                :class="{ active: filterParams.tags.includes(item.id) }"
                @tap="toggleTag(item.id)"
              >
                {{ item.name }}
              </view>
            </view>
          </view>
        </scroll-view>

        <view class="popup-footer">
          <button class="reset-btn" @tap="resetFilter">重置</button>
          <button class="confirm-btn" @tap="confirmFilter">确定</button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Ref } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import { getProductList } from '@/api/product'
import type { ProductBase, AdvancedQueryParams } from '@/api/product'

const router = useRouter()

// 筛选项
const filterItems = [
  { name: '综合', sortable: false },
  { name: '销量', sortField: 'sales' as const },
  { name: '价格', sortField: 'price' as const },
  { name: '筛选', sortable: false },
]

// 商品列表
const goodsList = ref<ProductBase[]>([])
const paging = ref()

// 筛选状态
const currentFilter = ref(0)
const showFilter = ref(false)
const sortDirection = ref<Record<number, 'asc' | 'desc' | ''>>({})

// 筛选参数
const filterParams = ref<AdvancedQueryParams>({
  pageNum: 1,
  pageSize: 10,
  minPrice: undefined,
  maxPrice: undefined,
  categoryId: undefined,
  region: undefined,
  sortField: undefined,
  sortOrder: undefined,
})

// 分类数据
const categories = ref([
  { id: 1, name: '新鲜水果' },
  { id: 2, name: '时令蔬菜' },
  { id: 3, name: '肉禽蛋品' },
  { id: 4, name: '海鲜水产' },
  { id: 5, name: '粮油调味' },
])

// 切换筛选项
const switchFilter = (index: number) => {
  if (index === 3) {
    showFilter.value = true
    return
  }

  if (filterItems[index].sortField) {
    // 处理排序
    const current = sortDirection.value[index] || ''
    if (!current) {
      sortDirection.value[index] = 'desc'
    } else if (current === 'desc') {
      sortDirection.value[index] = 'asc'
    } else {
      sortDirection.value[index] = ''
    }

    // 更新排序参数
    filterParams.value.sortField = filterItems[index].sortField
    filterParams.value.sortOrder = sortDirection.value[index] || undefined
  }

  currentFilter.value = index
  reloadList()
}

// 获取排序图标
const getSortIcon = (index: number) => {
  const direction = sortDirection.value[index]
  if (!direction) return '↕'
  return direction === 'asc' ? '↑' : '↓'
}

// 选择分类
const selectCategory = (id: number) => {
  filterParams.value.categoryId = id
}

// 重置筛选
const resetFilter = () => {
  filterParams.value = {
    pageNum: 1,
    pageSize: 10,
  }
}

// 确认筛选
const confirmFilter = () => {
  closeFilter()
  reloadList()
}

// 关闭筛选弹窗
const closeFilter = () => {
  showFilter.value = false
}

// 重新加载列表
const reloadList = () => {
  if (paging.value) {
    paging.value.reload()
  }
}

// 查询列表数据
const queryList = async (pageNo: number, pageSize: number) => {
  try {
    const params: AdvancedQueryParams = {
      ...filterParams.value,
      pageNum: pageNo,
      pageSize,
    }

    const res = await getProductList(params)
    if (res.code === 200 && res.data) {
      return {
        list: res.data.records,
        total: res.data.total,
      }
    }
    return {
      list: [],
      total: 0,
    }
  } catch (error: any) {
    showToast(error.message || '加载失败')
    return {
      list: [],
      total: 0,
    }
  }
}

// 跳转到详情页
const navigateToDetail = (id: number) => {
  router.navigate('/pages-sub/goods/detail', {
    id,
  })
}
</script>

<style lang="scss">
.goods-list {
  min-height: 100vh;
  background-color: #f8f8f8;

  .filter-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    height: 88rpx;
    background-color: #fff;
    border-bottom: 2rpx solid #f5f5f5;

    .filter-item {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      font-size: 28rpx;
      color: #333;

      &.active {
        color: #018d71;
      }

      .icon {
        margin-left: 6rpx;
      }
    }
  }

  .goods-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
    padding: 20rpx;

    .goods-item {
      overflow: hidden;
      background-color: #fff;
      border-radius: 12rpx;

      image {
        width: 100%;
        height: 345rpx;
      }

      .goods-info {
        padding: 16rpx;

        .name {
          margin-bottom: 8rpx;
          font-size: 28rpx;
          color: #333;
        }

        .desc {
          margin-bottom: 16rpx;
          font-size: 24rpx;
          color: #999;
        }

        .price-section {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .price {
            font-size: 32rpx;
            font-weight: bold;
            color: #f04c41;
          }

          .sales {
            font-size: 24rpx;
            color: #999;
          }
        }
      }
    }
  }

  .filter-popup {
    display: flex;
    flex-direction: column;
    width: 580rpx;
    height: 100vh;
    background-color: #fff;

    .popup-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 88rpx;
      padding: 0 30rpx;
      font-size: 32rpx;
      border-bottom: 2rpx solid #f5f5f5;

      .close {
        font-size: 48rpx;
        color: #999;
      }
    }

    .popup-content {
      flex: 1;
      padding: 30rpx;

      .filter-section {
        margin-bottom: 40rpx;

        .section-title {
          margin-bottom: 20rpx;
          font-size: 28rpx;
          color: #333;
        }

        .price-range {
          display: flex;
          align-items: center;

          input {
            flex: 1;
            height: 72rpx;
            padding: 0 20rpx;
            font-size: 28rpx;
            background-color: #f8f8f8;
            border-radius: 8rpx;
          }

          text {
            padding: 0 20rpx;
            color: #999;
          }
        }

        .category-list,
        .tag-list {
          display: flex;
          flex-wrap: wrap;

          .category-item,
          .tag-item {
            padding: 12rpx 24rpx;
            margin: 0 20rpx 20rpx 0;
            font-size: 28rpx;
            color: #666;
            background-color: #f8f8f8;
            border-radius: 8rpx;

            &.active {
              color: #018d71;
              background-color: rgba(1, 141, 113, 0.1);
            }
          }
        }
      }
    }

    .popup-footer {
      display: flex;
      padding: 20rpx;
      border-top: 2rpx solid #f5f5f5;

      button {
        flex: 1;
        height: 80rpx;
        font-size: 28rpx;
        line-height: 80rpx;
        text-align: center;
        border-radius: 40rpx;

        &.reset-btn {
          margin-right: 20rpx;
          color: #666;
          background-color: #f8f8f8;
        }

        &.confirm-btn {
          color: #fff;
          background-color: #018d71;
        }
      }
    }
  }
}
</style>
