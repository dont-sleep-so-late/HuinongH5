<template>
  <view class="address-page">
    <!-- 地址列表 -->
    <scroll-view scroll-y class="address-list" v-if="addressList.length > 0">
      <view
        class="address-item"
        v-for="item in addressList"
        :key="item.id"
        @click="handleSelect(item)"
      >
        <view class="info">
          <view class="user-info">
            <text class="name">{{ item.name }}</text>
            <text class="phone">{{ item.phone }}</text>
            <text class="tag" v-if="item.isDefault">默认</text>
          </view>
          <view class="address">
            {{ item.province }}{{ item.city }}{{ item.district }}{{ item.address }}
          </view>
        </view>
        <view class="actions">
          <view class="action-item" @click.stop="handleSetDefault(item)" v-if="!item.isDefault">
            <text class="iconfont icon-star"></text>
            <text>设为默认</text>
          </view>
          <view class="action-item" @click.stop="handleEdit(item)">
            <text class="iconfont icon-edit"></text>
            <text>编辑</text>
          </view>
          <view class="action-item" @click.stop="handleDelete(item)">
            <text class="iconfont icon-delete"></text>
            <text>删除</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view class="empty" v-else>
      <image src="/static/icons/empty-address.png" mode="aspectFit" class="empty-icon" />
      <text>暂无收货地址</text>
    </view>

    <!-- 新增按钮 -->
    <view class="add-btn" @click="handleAdd">
      <text>新增收货地址</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'

const router = useRouter()

// 地址列表
const addressList = ref([
  {
    id: 1,
    name: '张三',
    phone: '13800138000',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    address: '科技园南路88号',
    isDefault: true,
  },
])

// 选择地址
const handleSelect = (item: any) => {
  // 如果是从订单页面跳转来的，选择后返回
  const pages = getCurrentPages()
  const prevPage = pages[pages.length - 2]
  if (prevPage?.route === 'pages-sub/order/create') {
    // 设置选中的地址
    uni.$emit('addressSelected', item)
    router.back()
  }
}

// 设为默认
const handleSetDefault = async (item: any) => {
  try {
    // TODO: 调用设为默认地址接口
    addressList.value.forEach((address) => {
      address.isDefault = address.id === item.id
    })
    showToast('设置成功', { icon: 'success' })
  } catch (error) {
    showToast('设置失败')
  }
}

// 编辑地址
const handleEdit = (item: any) => {
  router.navigate(`/pages-sub/user/address-edit?id=${item.id}`)
}

// 删除地址
const handleDelete = (item: any) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该地址吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          // TODO: 调用删除地址接口
          const index = addressList.value.findIndex((address) => address.id === item.id)
          if (index > -1) {
            addressList.value.splice(index, 1)
          }
          showToast('删除成功', { icon: 'success' })
        } catch (error) {
          showToast('删除失败')
        }
      }
    },
  })
}

// 新增地址
const handleAdd = () => {
  router.navigate('/pages-sub/user/address-edit')
}
</script>

<style lang="scss">
.address-page {
  min-height: 100vh;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  background-color: #f8f8f8;
}

.address-list {
  padding: 20rpx;

  .address-item {
    padding: 30rpx;
    margin-bottom: 20rpx;
    background-color: #fff;
    border-radius: 16rpx;

    .info {
      margin-bottom: 20rpx;

      .user-info {
        margin-bottom: 16rpx;

        .name {
          margin-right: 20rpx;
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
        }

        .phone {
          font-size: 28rpx;
          color: #666;
        }

        .tag {
          padding: 4rpx 12rpx;
          margin-left: 20rpx;
          font-size: 24rpx;
          color: #018d71;
          background-color: rgba(1, 141, 113, 0.1);
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
      justify-content: flex-end;
      padding-top: 20rpx;
      border-top: 1rpx solid #eee;

      .action-item {
        display: flex;
        align-items: center;
        margin-left: 40rpx;

        .iconfont {
          margin-right: 8rpx;
          font-size: 32rpx;
          color: #999;
        }

        text {
          font-size: 28rpx;
          color: #666;
        }
      }
    }
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

.add-btn {
  position: fixed;
  right: 0;
  bottom: env(safe-area-inset-bottom);
  left: 0;
  height: 100rpx;
  font-size: 32rpx;
  line-height: 100rpx;
  color: #fff;
  text-align: center;
  background-color: #018d71;
}
</style>
