<template>
  <view class="web-view-container">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="back" @click="handleBack">
        <text class="iconfont icon-arrow-left"></text>
      </text>
      <text class="title">{{ title }}</text>
    </view>

    <!-- web-view组件 -->
    <web-view v-if="url" :src="url" @message="handleMessage"></web-view>
    <web-view v-else-if="html" :src="htmlUrl" @message="handleMessage"></web-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from '@/hooks/router'

const router = useRouter()

// 页面参数
const url = ref('')
const html = ref('')
const title = ref('')
const htmlUrl = ref('')

// 处理返回按钮点击
const handleBack = () => {
  router.back()
}

// 处理web-view消息
const handleMessage = (event: any) => {
  console.log('web-view message:', event)
}

// 生命周期钩子
onMounted(() => {
  // 获取页面参数
  const query = uni.getLaunchOptionsSync().query

  if (query) {
    if (query.url) {
      url.value = decodeURIComponent(query.url)
    }
    if (query.html) {
      html.value = decodeURIComponent(query.html)
      // 创建data URL
      htmlUrl.value = `data:text/html;charset=utf-8,${encodeURIComponent(html.value)}`
    }
    if (query.title) {
      title.value = decodeURIComponent(query.title)
    }
  }
})

// 清理blob URL
onBeforeUnmount(() => {
  // 清理工作（如果需要）
})
</script>

<style lang="scss">
.web-view-container {
  min-height: 100vh;
  background-color: #fff;

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
}
</style>
