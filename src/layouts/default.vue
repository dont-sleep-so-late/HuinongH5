<template>
  <wd-config-provider :themeVars="themeVars">
    <slot />
    <!-- <custom-tab-bar style="position: fixed; left: 0; bottom: 0" v-if="isTabbarPage" /> -->
    <wd-toast />
    <wd-message-box />
  </wd-config-provider>
</template>

<script lang="ts" setup>
import type { ConfigProviderThemeVars } from 'wot-design-uni'
import { ref, computed, onMounted } from 'vue'

const themeVars: ConfigProviderThemeVars = {
  // colorTheme: 'red',
  // buttonPrimaryBgColor: '#07c160',
  // buttonPrimaryColor: '#07c160',
}

// 判断当前页面是否是TabBar页面
const isTabbarPage = ref(false)

// TabBar页面路径列表
const tabbarPaths = [
  'pages/index/index',
  'pages/category/index',
  'pages/message/index',
  'pages/cart/index',
  'pages/user/index',
  'pages/shelf/index',
]

// 检查当前页面是否应该显示TabBar
const checkIsTabbarPage = () => {
  const pages = getCurrentPages()
  console.log('pages:', pages)
  if (pages.length === 0) return

  const currentPage = pages[pages.length - 1]
  const path = currentPage?.route
  console.log(isTabbarPage.value)
  // 判断当前页面是否在TabBar页面列表中
  isTabbarPage.value = tabbarPaths.some((item) => item === path)
}

onMounted(() => {
  checkIsTabbarPage()
})

defineExpose({
  onShow() {
    checkIsTabbarPage()
  },
})
</script>
