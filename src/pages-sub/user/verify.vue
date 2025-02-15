<template>
  <view class="verify-container">
    <view class="header">
      <text class="title">实名认证</text>
      <text class="subtitle">为了保障您的合法权益，请完成实名认证</text>
    </view>

    <view class="form-container">
      <view class="form-group">
        <view class="input-group">
          <wd-input v-model="form.name" placeholder="请输入您的真实姓名" clearable>
            <template #prefix>
              <text class="iconfont icon-user"></text>
            </template>
          </wd-input>
        </view>

        <view class="input-group">
          <wd-input
            v-model="form.idCard"
            placeholder="请输入您的身份证号"
            :maxlength="18"
            clearable
          >
            <template #prefix>
              <text class="iconfont icon-safe"></text>
            </template>
          </wd-input>
        </view>
      </view>

      <view class="tips">
        <text class="iconfont icon-info"></text>
        <text class="text">请确保填写的信息真实有效，认证通过后将不可修改</text>
      </view>

      <view class="action-group">
        <wd-button block type="primary" :loading="loading" @click="handleVerify">
          提交认证
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'

const router = useRouter()
const loading = ref(false)

const form = reactive({
  name: '',
  idCard: '',
})

// 验证身份证号
const validateIdCard = (idCard: string) => {
  return /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/.test(idCard)
}

// 提交认证
const handleVerify = async () => {
  if (loading.value) return

  if (!form.name) {
    showToast('请输入真实姓名')
    return
  }
  if (!form.idCard) {
    showToast('请输入身份证号')
    return
  }
  if (!validateIdCard(form.idCard)) {
    showToast('请输入正确的身份证号')
    return
  }

  try {
    loading.value = true
    // TODO: 调用实名认证接口
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 存储认证状态
    uni.setStorageSync('isVerified', true)
    showToast('认证成功', { icon: 'success' })

    // 跳转到首页
    setTimeout(() => {
      router.switchTab('/pages/index/index')
    }, 1500)
  } catch (error) {
    showToast('认证失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
.verify-container {
  min-height: 100vh;
  padding: 60rpx 40rpx;
  background-color: #fff;

  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 80rpx;

    .title {
      margin-bottom: 16rpx;
      font-size: 48rpx;
      font-weight: bold;
      color: #333;
    }

    .subtitle {
      font-size: 28rpx;
      color: #666;
    }
  }

  .form-container {
    .form-group {
      .input-group {
        margin-bottom: 32rpx;
      }
    }

    .tips {
      display: flex;
      align-items: center;
      padding: 0 20rpx;
      margin: 40rpx 0;

      .iconfont {
        margin-right: 8rpx;
        font-size: 28rpx;
        color: #ff6b6b;
      }

      .text {
        font-size: 26rpx;
        color: #666;
      }
    }

    .action-group {
      margin-top: 60rpx;
    }
  }
}
</style>
