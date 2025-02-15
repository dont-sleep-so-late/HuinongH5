<template>
  <view class="settings-container">
    <!-- 基本设置 -->
    <view class="section">
      <view class="section-title">基本设置</view>
      <view class="menu-list">
        <view class="menu-item" @click="handleEditProfile">
          <text>个人资料</text>
          <text class="arrow">></text>
        </view>
        <view class="menu-item" @click="handleChangePassword">
          <text>修改密码</text>
          <text class="arrow">></text>
        </view>
        <view class="menu-item" @click="handlePrivacySettings">
          <text>隐私设置</text>
          <text class="arrow">></text>
        </view>
      </view>
    </view>

    <!-- 消息设置 -->
    <view class="section">
      <view class="section-title">消息设置</view>
      <view class="menu-list">
        <view class="menu-item">
          <text>订单消息</text>
          <wd-switch v-model="settings.orderNotification" />
        </view>
        <view class="menu-item">
          <text>系统消息</text>
          <wd-switch v-model="settings.systemNotification" />
        </view>
        <view class="menu-item">
          <text>营销消息</text>
          <wd-switch v-model="settings.marketingNotification" />
        </view>
      </view>
    </view>

    <!-- 其他设置 -->
    <view class="section">
      <view class="section-title">其他设置</view>
      <view class="menu-list">
        <view class="menu-item" @click="handleClearCache">
          <text>清除缓存</text>
          <text class="cache-size">{{ cacheSize }}</text>
        </view>
        <view class="menu-item" @click="handleAbout">
          <text>关于我们</text>
          <text class="arrow">></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'

const router = useRouter()

// 设置状态
const settings = ref({
  orderNotification: true,
  systemNotification: true,
  marketingNotification: false,
})

// 缓存大小
const cacheSize = ref('0MB')

// 获取缓存大小
const getCacheSize = () => {
  // TODO: 实现获取缓存大小的逻辑
  cacheSize.value = '2.5MB'
}

// 编辑个人资料
const handleEditProfile = () => {
  router.navigate('/pages-sub/user/profile')
}

// 修改密码
const handleChangePassword = () => {
  router.navigate('/pages-sub/user/change-password')
}

// 隐私设置
const handlePrivacySettings = () => {
  router.navigate('/pages-sub/user/privacy')
}

// 清除缓存
const handleClearCache = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清除缓存吗？',
    success: (res) => {
      if (res.confirm) {
        // TODO: 实现清除缓存的逻辑
        uni.showToast({
          title: '清除成功',
          icon: 'success',
        })
        getCacheSize()
      }
    },
  })
}

// 关于我们
const handleAbout = () => {
  router.navigate('/pages/about/about')
}

onMounted(() => {
  getCacheSize()
})
</script>

<style lang="scss">
.settings-container {
  min-height: 100vh;
  padding: 20rpx;
  background-color: #f8f8f8;

  .section {
    margin-bottom: 20rpx;
    overflow: hidden;
    background-color: #fff;
    border-radius: 12rpx;

    .section-title {
      padding: 20rpx;
      font-size: 28rpx;
      color: #999;
    }

    .menu-list {
      .menu-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 30rpx 20rpx;
        font-size: 28rpx;
        color: #333;
        border-bottom: 1px solid #f5f5f5;

        &:last-child {
          border-bottom: none;
        }

        .arrow {
          color: #999;
        }

        .cache-size {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
}
</style>
