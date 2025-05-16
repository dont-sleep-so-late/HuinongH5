<template>
  <view class="alipay-container">
    <web-view :src="payUrl" @message="handleMessage"></web-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'

const router = useRouter()

// 获取支付表单数据
const payUrl = ref('')

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const payData = decodeURIComponent(currentPage.$page?.options?.payData || '')

  if (!payData) {
    uni.showToast({
      title: '支付参数错误',
      icon: 'none',
    })
    setTimeout(() => {
      router.back()
    }, 1500)
    return
  }

  // 创建临时支付页面
  const tempPage = document.createElement('div')
  tempPage.innerHTML = payData
  const form = tempPage.querySelector('form')

  if (form) {
    const formAction = form.action
    const formData = new FormData(form)
    const params = new URLSearchParams()

    for (const [key, value] of formData.entries()) {
      params.append(key, value as string)
    }

    payUrl.value = `${formAction}?${params.toString()}`
  } else {
    uni.showToast({
      title: '支付表单解析失败',
      icon: 'none',
    })
    setTimeout(() => {
      router.back()
    }, 1500)
  }
})

// 处理web-view消息
const handleMessage = (event: any) => {
  console.log('web-view message:', event)
  // 处理支付结果回调
  if (event.detail?.data?.type === 'payment_result') {
    const result = event.detail.data.result
    if (result === 'success') {
      uni.showToast({
        title: '支付成功',
        icon: 'success',
      })
      // 跳转到订单详情页
      setTimeout(() => {
        router.redirect(`/pages-sub/order/detail?orderId=${event.detail.data.orderId}`)
      }, 1500)
    } else {
      uni.showToast({
        title: '支付失败',
        icon: 'none',
      })
      setTimeout(() => {
        router.back()
      }, 1500)
    }
  }
}
</script>

<style lang="scss">
.alipay-container {
  width: 100%;
  height: 100vh;
}
</style>
