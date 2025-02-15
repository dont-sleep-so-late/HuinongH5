<template>
  <view class="login-container">
    <view class="header">
      <image class="logo" src="/static/images/logo.png" mode="aspectFit" />
      <text class="title">欢迎来到农选</text>
      <text class="subtitle">3000万人在农选轻松买卖农产品</text>
    </view>

    <view class="form-container">
      <!-- 登录方式切换 -->
      <view class="login-type">
        <text
          :class="['type-item', loginType === 'phone' ? 'active' : '']"
          @click="loginType = 'phone'"
        >
          手机号登录
        </text>
        <text
          :class="['type-item', loginType === 'password' ? 'active' : '']"
          @click="loginType = 'password'"
        >
          密码登录
        </text>
      </view>

      <!-- 手机号登录 -->
      <view v-if="loginType === 'phone'" class="form-group">
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
      </view>

      <!-- 密码登录 -->
      <view v-else class="form-group">
        <view class="input-group">
          <wd-input v-model="form.account" placeholder="请输入手机号/邮箱" clearable>
            <template #prefix>
              <text class="iconfont icon-user"></text>
            </template>
          </wd-input>
        </view>
        <view class="input-group">
          <wd-input
            v-model="form.password"
            placeholder="请输入密码"
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
      </view>

      <!-- 操作按钮 -->
      <view class="action-group">
        <wd-button block type="primary" :loading="loading" @click="handleLogin">登录</wd-button>

        <view class="links">
          <text @click="router.navigate('/pages/register/index')">注册账号</text>
          <text @click="router.navigate('/pages/forgot-password/index')">忘记密码</text>
        </view>
      </view>
    </view>

    <!-- 其他登录方式 -->
    <view class="other-login">
      <view class="divider">
        <text class="line"></text>
        <text class="text">其他登录方式</text>
        <text class="line"></text>
      </view>
      <view class="icons">
        <view class="icon-item" @click="handleOtherLogin('wechat')">
          <text class="iconfont icon-wechat"></text>
          <text class="text">微信</text>
        </view>
        <view class="icon-item" @click="handleOtherLogin('alipay')">
          <text class="iconfont icon-alipay"></text>
          <text class="text">支付宝</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const loading = ref(false)
const loginType = ref('phone')
const showPassword = ref(false)
const counting = ref(false)
const count = ref(60)

const form = reactive({
  phone: '',
  code: '',
  account: '',
  password: '',
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

// 登录
const handleLogin = async () => {
  if (loading.value) return

  if (loginType.value === 'phone') {
    if (!form.phone) {
      showToast('请输入手机号')
      return
    }
    if (!form.code) {
      showToast('请输入验证码')
      return
    }
  } else {
    if (!form.account) {
      showToast('请输入账号')
      return
    }
    if (!form.password) {
      showToast('请输入密码')
      return
    }
  }

  try {
    loading.value = true
    // TODO: 调用登录接口
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 模拟登录成功返回的用户信息
    const mockUserInfo = {
      id: 1,
      username: 'test',
      nickname: '测试用户',
      avatar: '/static/avatar/default.png',
      phone: form.phone || form.account,
      email: '',
      role: uni.getStorageSync('userRole') || 'buyer',
      isVerified: false,
      createTime: new Date().toISOString(),
    }

    const userStore = useUserStore()
    // 更新用户信息和登录状态
    userStore.login(mockUserInfo)

    // 如果是卖家且未认证，跳转到认证页面
    if (mockUserInfo.role === 'seller' && !mockUserInfo.isVerified) {
      router.navigate('/pages-sub/user/verify')
      return
    }

    // 如果有重定向地址，跳转到重定向地址
    const redirect = uni.getStorageSync('redirect')
    if (redirect) {
      uni.removeStorageSync('redirect')
      const decodedRedirect = decodeURIComponent(redirect)
      if (decodedRedirect.startsWith('/pages/')) {
        router.switchTab(decodedRedirect)
      } else {
        router.navigate(decodedRedirect)
      }
      return
    }

    // 默认跳转到首页
    router.switchTab('/pages/index/index')
  } catch (error) {
    showToast('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

// 第三方登录
const handleOtherLogin = (type: 'wechat' | 'alipay') => {
  // TODO: 实现第三方登录
  showToast(`${type}登录开发中`)
}
</script>

<style lang="scss">
.login-container {
  min-height: 100vh;
  padding: 60rpx 40rpx;
  background-color: #fff;

  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 80rpx;

    .logo {
      width: 120rpx;
      height: 120rpx;
      margin-bottom: 20rpx;
    }

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
    .login-type {
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

    .action-group {
      margin-top: 60rpx;

      .links {
        display: flex;
        justify-content: space-between;
        margin-top: 32rpx;
        font-size: 28rpx;
        color: #018d71;
      }
    }
  }

  .other-login {
    margin-top: 100rpx;

    .divider {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 40rpx;

      .line {
        width: 100rpx;
        height: 1px;
        background-color: #eee;
      }

      .text {
        padding: 0 20rpx;
        font-size: 24rpx;
        color: #999;
      }
    }

    .icons {
      display: flex;
      gap: 80rpx;
      justify-content: center;

      .icon-item {
        display: flex;
        flex-direction: column;
        align-items: center;

        .iconfont {
          margin-bottom: 16rpx;
          font-size: 80rpx;

          &.icon-wechat {
            color: #07c160;
          }

          &.icon-alipay {
            color: #1677ff;
          }
        }

        .text {
          font-size: 24rpx;
          color: #666;
        }
      }
    }
  }
}
</style>
