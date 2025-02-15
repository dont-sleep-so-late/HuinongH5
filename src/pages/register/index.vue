<template>
  <view class="register-container">
    <view class="header">
      <view class="nav-back" @click="router.back()">
        <text class="iconfont icon-arrow-left"></text>
      </view>
      <text class="title">注册账号</text>
    </view>

    <view class="form-container">
      <view class="welcome">
        <text class="title">欢迎加入农选</text>
        <text class="subtitle">请填写以下信息完成注册</text>
      </view>

      <!-- 注册方式切换 -->
      <view class="register-type">
        <text
          :class="['type-item', registerType === 'phone' ? 'active' : '']"
          @click="registerType = 'phone'"
        >
          手机号注册
        </text>
        <text
          :class="['type-item', registerType === 'email' ? 'active' : '']"
          @click="registerType = 'email'"
        >
          邮箱注册
        </text>
      </view>

      <view class="form-group">
        <!-- 手机号/邮箱输入 -->
        <view class="input-group">
          <wd-input
            v-if="registerType === 'phone'"
            v-model="form.account"
            placeholder="请输入手机号"
            type="number"
            :maxlength="11"
            clearable
          >
            <template #prefix>
              <text class="iconfont icon-phone"></text>
            </template>
          </wd-input>
          <wd-input v-else v-model="form.account" placeholder="请输入邮箱" type="text" clearable>
            <template #prefix>
              <text class="iconfont icon-email"></text>
            </template>
          </wd-input>
        </view>

        <!-- 验证码输入 -->
        <view class="input-group">
          <wd-input
            v-model="form.code"
            :placeholder="registerType === 'phone' ? '请输入短信验证码' : '请输入邮箱验证码'"
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

        <!-- 密码设置 -->
        <view class="input-group">
          <wd-input
            v-model="form.password"
            placeholder="请设置登录密码"
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
            placeholder="请确认登录密码"
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

      <!-- 密码规则提示 -->
      <view class="tips">
        <text class="iconfont icon-info"></text>
        <text class="text">密码由6-20位字母、数字或符号组成</text>
      </view>

      <view class="agreement">
        <checkbox :checked="agreed" @click="agreed = !agreed" color="#018d71"></checkbox>
        <text class="text">
          我已阅读并同意
          <text class="link" @click="handleViewAgreement('user')">《用户协议》</text>
          和
          <text class="link" @click="handleViewAgreement('privacy')">《隐私政策》</text>
        </text>
      </view>

      <view class="action-group">
        <wd-button block type="primary" :loading="loading" @click="handleRegister">注册</wd-button>

        <view class="login-link">
          已有账号？
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
const registerType = ref('phone')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const counting = ref(false)
const count = ref(60)
const agreed = ref(false)

const form = reactive({
  account: '',
  code: '',
  password: '',
  confirmPassword: '',
})

// 验证邮箱格式
const validateEmail = (email: string) => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
}

// 验证手机号格式
const validatePhone = (phone: string) => {
  return /^1[3-9]\d{9}$/.test(phone)
}

// 发送验证码
const handleSendCode = async () => {
  if (counting.value) return
  if (!form.account) {
    showToast(`请输入${registerType.value === 'phone' ? '手机号' : '邮箱'}`)
    return
  }

  // 验证格式
  if (registerType.value === 'phone' && !validatePhone(form.account)) {
    showToast('请输入正确的手机号')
    return
  }
  if (registerType.value === 'email' && !validateEmail(form.account)) {
    showToast('请输入正确的邮箱')
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

// 查看协议
const handleViewAgreement = (type: 'user' | 'privacy') => {
  const url = type === 'user' ? '/pages/agreement/user' : '/pages/agreement/privacy'
  router.navigate(url)
}

// 注册
const handleRegister = async () => {
  if (loading.value) return

  if (!form.account) {
    showToast(`请输入${registerType.value === 'phone' ? '手机号' : '邮箱'}`)
    return
  }

  // 验证格式
  if (registerType.value === 'phone' && !validatePhone(form.account)) {
    showToast('请输入正确的手机号')
    return
  }
  if (registerType.value === 'email' && !validateEmail(form.account)) {
    showToast('请输入正确的邮箱')
    return
  }

  if (!form.code) {
    showToast('请输入验证码')
    return
  }
  if (!form.password) {
    showToast('请设置登录密码')
    return
  }
  if (!form.confirmPassword) {
    showToast('请确认登录密码')
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
  if (!agreed.value) {
    showToast('请阅读并同意用户协议和隐私政策')
    return
  }

  try {
    loading.value = true
    // TODO: 调用注册接口
    await new Promise((resolve) => setTimeout(resolve, 1000))
    showToast('注册成功', { icon: 'success' })
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error) {
    showToast('注册失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
.register-container {
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

    .register-type {
      display: flex;
      justify-content: center;
      margin-bottom: 40rpx;

      .type-item {
        position: relative;
        padding: 20rpx 40rpx;
        font-size: 32rpx;
        color: #666;
        transition: all 0.3s;

        &.active {
          font-weight: bold;
          color: #018d71;

          &::after {
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 40rpx;
            height: 4rpx;
            content: '';
            background-color: #018d71;
            border-radius: 2rpx;
            transform: translateX(-50%);
          }
        }
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
      margin-bottom: 32rpx;

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

    .agreement {
      display: flex;
      align-items: center;
      padding: 0 20rpx;
      margin: 40rpx 0;

      .text {
        margin-left: 16rpx;
        font-size: 26rpx;
        color: #666;

        .link {
          color: #018d71;
        }
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
