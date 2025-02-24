<template>
  <view class="change-email-container">
    <view class="header">
      <view class="nav-back" @click="router.back()">
        <text class="iconfont icon-arrow-left"></text>
      </view>
      <text class="title">更换邮箱</text>
    </view>

    <view class="form-container">
      <!-- 原邮箱 -->
      <view class="form-item">
        <text class="label">当前邮箱</text>
        <text class="value">{{ userStore.userInfo?.email || '-' }}</text>
      </view>

      <!-- 新邮箱输入 -->
      <view class="form-item">
        <wd-input v-model="form.email" placeholder="请输入新邮箱" type="text" clearable>
          <template #prefix>
            <text class="iconfont icon-email"></text>
          </template>
        </wd-input>
      </view>

      <!-- 验证码输入 -->
      <view class="form-item">
        <wd-input
          v-model="form.code"
          placeholder="请输入验证码"
          type="number"
          :maxlength="6"
          clearable
        >
          <template #prefix>
            <text class="iconfont icon-safe"></text>
          </template>
          <template #suffix>
            <text class="code-btn" :class="{ disabled: counting }" @click="handleSendCode">
              {{ counting ? `${count}s后重发` : '获取验证码' }}
            </text>
          </template>
        </wd-input>
      </view>

      <!-- 提示信息 -->
      <view class="tips">
        <text class="iconfont icon-info"></text>
        <text class="text">更换邮箱后，下次可使用新邮箱登录</text>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-btn">
        <wd-button block type="primary" :loading="loading" @click="handleSubmit">
          确认更换
        </wd-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from '@/hooks/router'
import { useUserStore } from '@/stores/user'
import { showToast } from '@/utils/toast'
import { sendEmailCode } from '@/services/auth'
import { updateUserInfo } from '@/services/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const counting = ref(false)
const count = ref(60)

const form = reactive({
  email: '',
  code: '',
})

// 验证邮箱格式
const validateEmail = (email: string) => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
}

// 发送验证码
const handleSendCode = async () => {
  if (counting.value) return
  if (!form.email) {
    showToast('请输入新邮箱')
    return
  }

  if (!validateEmail(form.email)) {
    showToast('请输入正确的邮箱')
    return
  }

  if (form.email === userStore.userInfo?.email) {
    showToast('新邮箱不能与当前邮箱相同')
    return
  }

  try {
    counting.value = true
    await sendEmailCode({
      email: form.email,
      type: 'bind',
    })

    // 开始倒计时
    const timer = setInterval(() => {
      if (count.value > 0) {
        count.value--
      } else {
        clearInterval(timer)
        counting.value = false
        count.value = 60
      }
    }, 1000)

    showToast('验证码已发送')
  } catch (error: any) {
    counting.value = false
    count.value = 60
    showToast(error.message || '发送失败，请重试')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (loading.value) return

  if (!form.email) {
    showToast('请输入新邮箱')
    return
  }

  if (!validateEmail(form.email)) {
    showToast('请输入正确的邮箱')
    return
  }

  if (form.email === userStore.userInfo?.email) {
    showToast('新邮箱不能与当前邮箱相同')
    return
  }

  if (!form.code) {
    showToast('请输入验证码')
    return
  }

  if (!/^\d{6}$/.test(form.code)) {
    showToast('请输入正确的验证码')
    return
  }

  try {
    loading.value = true
    await updateUserInfo({
      email: form.email,
    })

    // 更新用户信息
    if (userStore.userInfo) {
      userStore.updateUserInfo({
        ...userStore.userInfo,
        email: form.email,
      })
    }

    showToast('更换成功')
    router.back()
  } catch (error: any) {
    showToast(error.message || '更换失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
.change-email-container {
  min-height: 100vh;
  background-color: #f8f8f8;

  .header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    background-color: #fff;
    border-bottom: 1px solid #f5f5f5;

    .nav-back {
      position: absolute;
      left: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 88rpx;
      height: 88rpx;
      margin-left: -32rpx;

      .iconfont {
        font-size: 40rpx;
        color: #333;
      }
    }

    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .form-container {
    padding: 32rpx;
    margin-top: 20rpx;
    background-color: #fff;

    .form-item {
      margin-bottom: 32rpx;

      .label {
        display: block;
        margin-bottom: 16rpx;
        font-size: 28rpx;
        color: #666;
      }

      .value {
        font-size: 32rpx;
        color: #333;
      }

      .code-btn {
        padding: 0 20rpx;
        font-size: 28rpx;
        color: #018d71;

        &.disabled {
          color: #999;
        }
      }
    }

    .tips {
      display: flex;
      align-items: center;
      margin-bottom: 60rpx;

      .iconfont {
        margin-right: 8rpx;
        font-size: 28rpx;
        color: #999;
      }

      .text {
        font-size: 26rpx;
        color: #999;
      }
    }
  }
}
</style>
