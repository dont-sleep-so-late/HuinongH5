<template>
  <view class="address-list">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="back" @click="router.back()">
        <text class="iconfont icon-arrow-left"></text>
      </text>
      <text class="title">收货地址</text>
    </view>

    <!-- 地址列表 -->
    <view class="list-container">
      <view v-if="addressList.length === 0" class="empty">
        <text class="iconfont icon-location"></text>
        <text class="text">暂无收货地址</text>
      </view>
      <view v-else class="address-items">
        <view
          v-for="item in addressList"
          :key="item.id"
          class="address-item"
          @click="handleSelect(item)"
        >
          <view class="info">
            <view class="user-info">
              <text class="name">{{ item.receiverName }}</text>
              <text class="phone">{{ item.receiverPhone }}</text>
              <text v-if="item.isDefault" class="default-tag">默认</text>
            </view>
            <view class="address">
              {{ item.province }}{{ item.city }}{{ item.district }}{{ item.detailAddress }}
            </view>
          </view>
          <view class="actions">
            <view
              class="action-btn default"
              @click.stop="handleSetDefault(item)"
              v-if="!item.isDefault"
            >
              <text class="iconfont icon-star"></text>
            </view>
            <view class="action-btn edit" @click.stop="handleEdit(item)">
              <text class="iconfont icon-edit"></text>
            </view>
            <view class="action-btn delete" @click.stop="handleDelete(item)">
              <text class="iconfont icon-delete"></text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 新增地址按钮 -->
    <view class="add-btn" @click="handleAdd">
      <text class="iconfont icon-add"></text>
      <text>新增收货地址</text>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import type { AddressInfo } from '@/types/address'
import { addressService } from '@/services/address'

const router = useRouter()

// 地址列表
const addressList = ref<AddressInfo[]>([])

// 是否从订单页面进入
const isFromOrder = ref(false)

// 获取地址列表
const loadAddressList = async () => {
  try {
    const { data } = await addressService.list()
    addressList.value = data
  } catch (error: any) {
    uni.showToast({
      title: error.message || '获取地址列表失败',
      icon: 'none',
    })
  }
}

// 选择地址
const handleSelect = (item: AddressInfo) => {
  if (isFromOrder.value) {
    uni.$emit('addressSelected', item)
    router.back()
  }
}

// 编辑地址
const handleEdit = (item: AddressInfo) => {
  router.navigate('/pages-sub/user/address-edit', { id: item.id })
}

// 新增地址
const handleAdd = () => {
  router.navigate('/pages-sub/user/address-edit')
}

// 设为默认地址
const handleSetDefault = async (item: AddressInfo) => {
  try {
    await uni.showModal({
      title: '提示',
      content: '确定要将该地址设为默认地址吗？',
    })
    await addressService.setDefault(item.id)
    uni.showToast({
      title: '设置成功',
      icon: 'success',
    })
    loadAddressList()
  } catch (error: any) {
    if (error.errMsg !== 'showModal:fail cancel') {
      uni.showToast({
        title: error.message || '设置失败',
        icon: 'none',
      })
    }
  }
}

// 删除地址
const handleDelete = async (item: AddressInfo) => {
  try {
    await uni.showModal({
      title: '提示',
      content: '确定要删除该地址吗？',
    })
    await addressService.delete(item.id)
    uni.showToast({
      title: '删除成功',
      icon: 'success',
    })
    loadAddressList()
  } catch (error: any) {
    if (error.errMsg !== 'showModal:fail cancel') {
      uni.showToast({
        title: error.message || '删除失败',
        icon: 'none',
      })
    }
  }
}

onMounted(() => {
  // 判断是否从订单页面进入
  const pages = getCurrentPages()
  const prevPage = pages[pages.length - 2]
  if (prevPage?.route?.includes('/pages-sub/order/create')) {
    isFromOrder.value = true
  }

  loadAddressList()
})
</script>

<style lang="scss">
.address-list {
  min-height: 100vh;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  background-color: #f8f8f8;
}

.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 32rpx;
  background: linear-gradient(to bottom, #fff, rgba(255, 255, 255, 0.98));
  backdrop-filter: blur(10px);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .back {
    padding: 20rpx;
    margin-left: -20rpx;
    font-size: 36rpx;
    color: #333;
  }

  .title {
    flex: 1;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
  }
}

.list-container {
  padding: 20rpx;

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60rpx 0;

    .iconfont {
      margin-bottom: 20rpx;
      font-size: 80rpx;
      color: #999;
    }

    .text {
      font-size: 28rpx;
      color: #999;
    }
  }

  .address-items {
    .address-item {
      display: flex;
      align-items: flex-start;
      padding: 32rpx;
      margin-bottom: 20rpx;
      background-color: #fff;
      border-radius: 16rpx;

      .info {
        flex: 1;
        margin-right: 20rpx;

        .user-info {
          margin-bottom: 12rpx;

          .name {
            margin-right: 20rpx;
            font-size: 32rpx;
            font-weight: bold;
            color: #333;
          }

          .phone {
            margin-right: 20rpx;
            font-size: 28rpx;
            color: #666;
          }

          .default-tag {
            padding: 4rpx 12rpx;
            font-size: 24rpx;
            color: #ff6b6b;
            background-color: rgba(255, 107, 107, 0.1);
            border-radius: 4rpx;
          }
        }

        .address {
          font-size: 28rpx;
          line-height: 1.5;
          color: #333;
        }
      }

      .actions {
        display: flex;
        gap: 20rpx;

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48rpx;
          height: 48rpx;
          font-size: 32rpx;
          border-radius: 50%;

          &.default {
            color: #ffc107;
            background-color: rgba(255, 193, 7, 0.1);
          }

          &.edit {
            color: #018d71;
            background-color: rgba(1, 141, 113, 0.1);
          }

          &.delete {
            color: #ff6b6b;
            background-color: rgba(255, 107, 107, 0.1);
          }
        }
      }
    }
  }
}

.add-btn {
  position: fixed;
  right: 0;
  bottom: env(safe-area-inset-bottom);
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100rpx;
  font-size: 32rpx;
  color: #fff;
  background-color: #018d71;

  .iconfont {
    margin-right: 12rpx;
    font-size: 36rpx;
  }
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom);
}
</style>
