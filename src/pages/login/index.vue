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
        <view
          v-for="type in loginTypes"
          :key="type.value"
          :class="['type-item', loginType === type.value ? 'active' : '']"
          @click="handleTypeChange(type.value)"
        >
          {{ type.label }}
          <text class="active-line" v-if="loginType === type.value"></text>
        </view>
      </view>

      <!-- 登录方式切换 -->
      <view class="login-method">
        <view
          v-for="method in loginMethods"
          :key="method.value"
          :class="['method-item', loginMethod === method.value ? 'active' : '']"
          @click="handleMethodChange(method.value)"
        >
          {{ method.label }}
          <text class="active-line" v-if="loginMethod === method.value"></text>
        </view>
      </view>

      <view class="form-group">
        <!-- 账号输入 -->
        <view class="input-group">
          <wd-input
            v-model="form.account"
            :placeholder="loginType === 'phone' ? '请输入手机号' : '请输入邮箱'"
            :type="loginType === 'phone' ? 'number' : 'text'"
            :maxlength="loginType === 'phone' ? 11 : 50"
            clearable
          >
            <template #prefix>
              <text
                class="iconfont"
                :class="loginType === 'phone' ? 'icon-phone' : 'icon-email'"
              ></text>
            </template>
          </wd-input>
        </view>

        <!-- 验证码/密码输入 -->
        <view class="input-group">
          <wd-input
            v-if="loginMethod === 'code'"
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
          <wd-input
            v-else
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
import {
  loginByPhone,
  loginByPhoneCode,
  loginByEmail,
  loginByEmailCode,
  sendPhoneCode,
  sendEmailCode,
} from '@/services/auth'
import { md5 } from '@/utils/crypto'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const loginType = ref('phone') // phone, email
const loginMethod = ref('code') // code, password
const showPassword = ref(false)
const counting = ref(false)
const count = ref(60)

const form = reactive({
  account: '',
  code: '',
  password: '',
})

// 登录方式配置
const loginTypes = [
  { label: '手机号登录', value: 'phone' },
  { label: '邮箱登录', value: 'email' },
] as const

// 登录类型配置
const loginMethods = [
  { label: '验证码登录', value: 'code' },
  { label: '密码登录', value: 'password' },
] as const

// 登录方式切换处理
const handleTypeChange = (type: (typeof loginTypes)[number]['value']) => {
  if (type === loginType.value) return
  // 重置表单
  form.account = ''
  form.code = ''
  form.password = ''
  // 重置倒计时
  if (counting.value) {
    counting.value = false
    count.value = 60
  }
  loginType.value = type
}

// 登录类型切换处理
const handleMethodChange = (method: (typeof loginMethods)[number]['value']) => {
  if (method === loginMethod.value) return
  // 重置验证码/密码
  if (method === 'code') {
    form.password = ''
  } else {
    form.code = ''
    // 重置倒计时
    if (counting.value) {
      counting.value = false
      count.value = 60
    }
  }
  loginMethod.value = method
}

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
    showToast(`请输入${loginType.value === 'phone' ? '手机号' : '邮箱'}`)
    return
  }

  // 验证格式
  if (loginType.value === 'phone' && !validatePhone(form.account)) {
    showToast('请输入正确的手机号')
    return
  }
  if (loginType.value === 'email' && !validateEmail(form.account)) {
    showToast('请输入正确的邮箱')
    return
  }

  try {
    counting.value = true

    if (loginType.value === 'email') {
      // 调用发送邮箱验证码接口
      await sendEmailCode({
        email: form.account,
        type: 'login',
      })
    } else {
      // 调用发送手机验证码接口
      await sendPhoneCode({
        phone: form.account,
        type: 'login',
      })
    }

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

// 处理登录成功
const handleLoginSuccess = (data: { token: string; userInfo: any }) => {
  // 存储token
  uni.setStorageSync('token', data.token)

  // 更新用户信息
  const userInfo = {
    id: data.userInfo.id,
    username: data.userInfo.username,
    nickname: data.userInfo.nickname,
    avatar: data.userInfo.avatar,
    phone: data.userInfo.phone,
    email: data.userInfo.email,
    role: data.userInfo.role,
    isVerified: data.userInfo.isVerified,
    createTime: data.userInfo.createTime,
  }
  userStore.login(userInfo)

  // 处理登录后跳转
  handleLoginRedirect(userInfo)
}

// 处理登录后跳转
const handleLoginRedirect = (userInfo: any) => {
  // 如果是卖家且未认证，跳转到认证页面
  if (userInfo.role === 'seller' && !userInfo.isVerified) {
    showToast('请先完成实名认证')
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
  showToast('登录成功')
  router.switchTab('/pages/index/index')
}

// 登录
const handleLogin = async () => {
  if (loading.value) return

  try {
    loading.value = true
    const role = uni.getStorageSync('userRole') || 'buyer'

    // 表单验证
    if (!form.account) {
      showToast(`请输入${loginType.value === 'phone' ? '手机号' : '邮箱'}`)
      return
    }

    if (loginType.value === 'phone') {
      // 手机号格式验证
      if (!validatePhone(form.account)) {
        showToast('请输入正确的手机号')
        return
      }

      if (loginMethod.value === 'code') {
        // 验证码登录
        if (!form.code) {
          showToast('请输入验证码')
          return
        }
        if (!/^\d{6}$/.test(form.code)) {
          showToast('请输入正确的验证码')
          return
        }

        const { data } = await loginByPhoneCode({
          phone: form.account,
          code: form.code,
          role,
        })
        handleLoginSuccess(data)
      } else {
        // 密码登录
        if (!form.password) {
          showToast('请输入密码')
          return
        }
        if (form.password.length < 6) {
          showToast('密码不能少于6位')
          return
        }

        const { data } = await loginByPhone({
          phone: form.account,
          password: md5(form.password),
          role,
        })
        handleLoginSuccess(data)
      }
    } else {
      // 邮箱格式验证
      if (!validateEmail(form.account)) {
        showToast('请输入正确的邮箱')
        return
      }

      if (loginMethod.value === 'code') {
        // 验证码登录
        if (!form.code) {
          showToast('请输入验证码')
          return
        }
        if (!/^\d{6}$/.test(form.code)) {
          showToast('请输入正确的验证码')
          return
        }

        const { data } = await loginByEmailCode({
          email: form.account,
          code: form.code,
          role,
        })
        handleLoginSuccess(data)
      } else {
        // 密码登录
        if (!form.password) {
          showToast('请输入密码')
          return
        }
        if (form.password.length < 6) {
          showToast('密码不能少于6位')
          return
        }

        const { data } = await loginByEmail({
          email: form.account,
          password: md5(form.password),
          role,
        })
        handleLoginSuccess(data)
      }
    }
  } catch (error: any) {
    showToast(error.message || '登录失败，请重试')
  } finally {
    loading.value = false
  }
}

// 第三方登录
const handleOtherLogin = (type: 'wechat' | 'alipay') => {
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
    .login-type,
    .login-method {
      display: flex;
      justify-content: center;
      margin-bottom: 40rpx;

      .type-item,
      .method-item {
        position: relative;
        padding: 20rpx 40rpx;
        font-size: 32rpx;
        color: #666;
        cursor: pointer;
        transition: all 0.3s ease;

        &.active {
          font-weight: bold;
          color: #018d71;
        }

        .active-line {
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 40rpx;
          height: 4rpx;
          background-color: #018d71;
          border-radius: 2rpx;
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }

        &:hover {
          color: #018d71;
          opacity: 0.8;
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
