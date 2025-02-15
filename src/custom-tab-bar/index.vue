<template>
  <view class="tab-bar" :style="{ paddingBottom: safeAreaInsetBottom }">
    <view
      v-for="(item, index) in currentTabs"
      :key="index"
      class="tab-bar-item"
      :class="{ active: selected === index }"
      @click="switchTab(item.pagePath, index)"
    >
      <image :src="selected === index ? item.selectedIconPath : item.iconPath" />
      <text>{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

// 买家菜单
const buyerTabs = [
  {
    pagePath: '/pages/index/index',
    text: '首页',
    iconPath: '/static/tabbar/home.png',
    selectedIconPath: '/static/tabbar/homeHL.png',
  },
  {
    pagePath: '/pages/category/index',
    text: '分类',
    iconPath: '/static/tabbar/example.png',
    selectedIconPath: '/static/tabbar/exampleHL.png',
  },
  {
    pagePath: '/pages/message/index',
    text: '消息',
    iconPath: '/static/tabbar/message.png',
    selectedIconPath: '/static/tabbar/messageHL.png',
  },
  {
    pagePath: '/pages/cart/index',
    text: '购物车',
    iconPath: '/static/tabbar/cart.png',
    selectedIconPath: '/static/tabbar/cartHL.png',
  },
  {
    pagePath: '/pages/user/index',
    text: '我的',
    iconPath: '/static/tabbar/person.png',
    selectedIconPath: '/static/tabbar/personHL.png',
  },
]

// 卖家菜单
const sellerTabs = [
  {
    pagePath: '/pages/index/index',
    text: '首页',
    iconPath: '/static/tabbar/home.png',
    selectedIconPath: '/static/tabbar/homeHL.png',
  },
  {
    pagePath: '/pages/shelf/index',
    text: '货架',
    iconPath: '/static/tabbar/shelf.png',
    selectedIconPath: '/static/tabbar/shelfHL.png',
  },
  {
    pagePath: '/pages/message/index',
    text: '消息',
    iconPath: '/static/tabbar/message.png',
    selectedIconPath: '/static/tabbar/messageHL.png',
  },
  {
    pagePath: '/pages/publish/index',
    text: '上架',
    iconPath: '/static/tabbar/publish.png',
    selectedIconPath: '/static/tabbar/publishHL.png',
  },
  {
    pagePath: '/pages/user/index',
    text: '我的',
    iconPath: '/static/tabbar/person.png',
    selectedIconPath: '/static/tabbar/personHL.png',
  },
]

const selected = ref(0)
const safeAreaInsetBottom = ref('0px')

// 根据用户角色显示对应的菜单
const currentTabs = computed(() => {
  const userRole = uni.getStorageSync('userRole')
  return userRole === 'seller' ? sellerTabs : buyerTabs
})

// 切换标签页
const switchTab = (path: string, index: number) => {
  if (selected.value === index) return
  selected.value = index
  uni.switchTab({ url: path })
}

// 监听页面显示
const setSelected = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const path = '/' + currentPage?.route
  const index = currentTabs.value.findIndex((item) => item.pagePath === path)
  if (index > -1) {
    selected.value = index
  }
}

// 获取底部安全区域高度
const getSafeAreaInsetBottom = () => {
  uni.getSystemInfo({
    success: (res) => {
      const safeArea = res.safeArea
      const screenHeight = res.screenHeight
      if (safeArea && screenHeight) {
        safeAreaInsetBottom.value = screenHeight - safeArea.bottom + 'px'
      }
    },
  })
}

onMounted(() => {
  getSafeAreaInsetBottom()
  setSelected()
})

// 监听页面切换
watch(
  () => uni.getStorageSync('userRole'),
  () => {
    setSelected()
  },
)
</script>

<style lang="scss">
.tab-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  height: 100rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);

  .tab-bar-item {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    image {
      width: 48rpx;
      height: 48rpx;
      margin-bottom: 6rpx;
    }

    text {
      font-size: 24rpx;
      color: #999;
    }

    &.active {
      text {
        color: #018d71;
      }
    }
  }
}
</style>
