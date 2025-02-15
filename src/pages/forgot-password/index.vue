<template>
  <view class="forgot-password-container">
    <view class="header">
      <view class="nav-back" @click="router.back()">
        <text class="iconfont icon-arrow-left"></text>
      </view>
      <text class="title">重置密码</text>
    </view>

    <view class="form-container">
      <view class="welcome">
        <text class="title">找回密码</text>
        <text class="subtitle">请填写以下信息重置您的密码</text>
      </view>

      <view class="form-group">
        <view class="input-group">
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

        <view class="input-group">
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

        <view class="input-group">
          <wd-input
            v-model="form.password"
            placeholder="请设置新密码"
            :type="showPassword ? 'text' : 'password'"
            clearable
          >
            <template #prefix>
              <text class="iconfont icon-lock"></text>
            </template>
            <template #suffix>
              <text
                class="iconfont"
                :class="showPassword ? 'icon-eye-open' : 'icon-eye-close'"
                @click="showPassword = !showPassword"
              ></text>
            </template>
          </wd-input>
        </view>

        <view class="input-group">
          <wd-input
            v-model="form.confirmPassword"
            placeholder="请确认新密码"
            :type="showConfirmPassword ? 'text' : 'password'"
            clearable
          >
            <template #prefix>
              <text class="iconfont icon-lock"></text>
            </template>
            <template #suffix>
              <text
                class="iconfont"
                :class="showConfirmPassword ? 'icon-eye-open' : 'icon-eye-close'"
                @click="showConfirmPassword = !showConfirmPassword"
              ></text>
            </template>
          </wd-input>
        </view>
      </view>

      <view class="tips">
        <text class="iconfont icon-info"></text>
        <text class="text">密码由6-20位字母、数字或符号组成</text>
      </view>

      <view class="action-group">
        <wd-button block type="primary" :loading="loading" @click="handleReset">重置密码</wd-button>

        <view class="login-link">
          想起密码了？
          <text class="link" @click="router.back()">立即登录</text>
        </view>
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
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const counting = ref(false)
const count = ref(60)

const form = reactive({
  phone: '',
  code: '',
  password: '',
  confirmPassword: '',
})

// 发送验证码
const handleSendCode = async () => {
  if (counting.value) return
  if (!form.phone) {
    showToast('请输入手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    showToast('请输入正确的手机号')
    return
  }

  try {
    counting.value = true
    // TODO: 调用发送验证码接口
    const timer = setInterval(() => {
      if (count.value > 0) {
        count.value--
      } else {
        clearInterval(timer)
        counting.value = false
        count.value = 60
      }
    }, 1000)
  } catch (error) {
    counting.value = false
    showToast('发送失败，请重试')
  }
}

// 重置密码
const handleReset = async () => {
  if (loading.value) return

  if (!form.phone) {
    showToast('请输入手机号')
    return
  }
  if (!form.code) {
    showToast('请输入验证码')
    return
  }
  if (!form.password) {
    showToast('请设置新密码')
    return
  }
  if (!form.confirmPassword) {
    showToast('请确认新密码')
    return
  }
  if (form.password !== form.confirmPassword) {
    showToast('两次输入的密码不一致')
    return
  }
  if (!/^[a-zA-Z0-9!@#$%^&*]{6,20}$/.test(form.password)) {
    showToast('密码格式不正确')
    return
  }

  try {
    loading.value = true
    // TODO: 调用重置密码接口
    await new Promise((resolve) => setTimeout(resolve, 1000))
    showToast('密码重置成功', { icon: 'success' })
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error) {
    showToast('重置失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
.forgot-password-container {
  min-height: 100vh;
  padding-bottom: 40rpx;
  background-color: #fff;

  .header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    padding: 0 32rpx;
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
    padding: 40rpx;

    .welcome {
      margin-bottom: 60rpx;

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

    .form-group {
      .input-group {
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
    }

    .tips {
      display: flex;
      align-items: center;
      padding: 0 20rpx;
      margin: 40rpx 0;

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

    .action-group {
      margin-top: 60rpx;

      .login-link {
        margin-top: 32rpx;
        font-size: 28rpx;
        color: #666;
        text-align: center;

        .link {
          color: #018d71;
        }
      }
    }
  }
}
</style>
