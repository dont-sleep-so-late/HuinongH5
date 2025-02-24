<template>
  <view class="bind-phone-container">
    <view class="header">
      <view class="nav-back" @click="router.back()">
        <text class="iconfont icon-arrow-left"></text>
      </view>
      <text class="title">绑定手机号</text>
    </view>

    <view class="form-container">
      <!-- 手机号输入 -->
      <view class="form-item">
        <wd-input
          v-model="form.phone"
          placeholder="请输入手机号"
          type="number"
          :maxlength="11"
          clearable
        >
          <template #prefix>
            <text class="iconfont icon-phone"></text>
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
        <text class="text">绑定手机号后，可用于登录、找回密码等操作</text>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-btn">
        <wd-button block type="primary" :loading="loading" @click="handleSubmit">
          确认绑定
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
import { sendPhoneCode } from '@/services/auth'
import { updateUserInfo } from '@/services/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const counting = ref(false)
const count = ref(60)

const form = reactive({
  phone: '',
  code: '',
})

// 验证手机号格式
const validatePhone = (phone: string) => {
  return /^1[3-9]\d{9}$/.test(phone)
}

// 发送验证码
const handleSendCode = async () => {
  if (counting.value) return
  if (!form.phone) {
    showToast('请输入手机号')
    return
  }

  if (!validatePhone(form.phone)) {
    showToast('请输入正确的手机号')
    return
  }

  try {
    counting.value = true
    await sendPhoneCode({
      phone: form.phone,
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

  if (!form.phone) {
    showToast('请输入手机号')
    return
  }

  if (!validatePhone(form.phone)) {
    showToast('请输入正确的手机号')
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
      phone: form.phone,
    })

    // 更新用户信息
    if (userStore.userInfo) {
      userStore.updateUserInfo({
        ...userStore.userInfo,
        phone: form.phone,
      })
    }

    showToast('绑定成功')
    router.back()
  } catch (error: any) {
    showToast(error.message || '绑定失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
.bind-phone-container {
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
