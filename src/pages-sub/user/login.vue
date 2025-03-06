<template>
  <view class="login">
    <view class="header">
      <image src="/static/images/logo.png" mode="aspectFit" class="logo" />
      <text class="title">惠农商城</text>
      <text class="subtitle">优质农产品 产地直供</text>
    </view>

    <view class="form">
      <!-- 登录方式切换 -->
      <view class="login-type">
        <text
          class="type-item"
          v-for="(item, index) in loginTypes"
          :key="index"
          :class="{ active: currentType === index }"
          @tap="switchType(index)"
        >
          {{ item }}
        </text>
      </view>

      <!-- 手机号登录 -->
      <block v-if="currentType === 0">
        <view class="form-item">
          <text class="icon">📱</text>
          <input
            type="number"
            v-model="formData.phone"
            placeholder="请输入手机号"
            maxlength="11"
            @input="validatePhone"
          />
        </view>
        <view class="form-item">
          <text class="icon">🔒</text>
          <input type="password" v-model="formData.password" placeholder="请输入密码" password />
        </view>
      </block>

      <!-- 验证码登录 -->
      <block v-else>
        <view class="form-item">
          <text class="icon">📱</text>
          <input
            type="number"
            v-model="formData.phone"
            placeholder="请输入手机号"
            maxlength="11"
            @input="validatePhone"
          />
        </view>
        <view class="form-item">
          <text class="icon">🔑</text>
          <input type="number" v-model="formData.code" placeholder="请输入验证码" maxlength="6" />
          <text class="code-btn" :class="{ disabled: !canSendCode }" @tap="sendCode">
            {{ codeText }}
          </text>
        </view>
      </block>

      <button class="submit-btn" @tap="handleLogin">登录</button>

      <view class="other-login">
        <view class="divider">
          <text class="line"></text>
          <text class="text">其他登录方式</text>
          <text class="line"></text>
        </view>
        <view class="login-methods">
          <view class="method-item" @tap="handleWechatLogin">
            <text class="icon">💚</text>
            <text>微信登录</text>
          </view>
        </view>
      </view>

      <view class="agreement">
        <checkbox :checked="agreed" @tap="agreed = !agreed" color="#018d71"></checkbox>
        <text class="text">
          登录即代表您已同意
          <text class="link" @tap="viewAgreement('user')">《用户协议》</text>
          和
          <text class="link" @tap="viewAgreement('privacy')">《隐私政策》</text>
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { setToken, setUserInfo } from '@/utils/auth'

// 登录方式
const loginTypes = ['密码登录', '验证码登录']
const currentType = ref(0)

// 表单数据
const formData = ref({
  phone: '',
  password: '',
  code: '',
})

// 协议同意
const agreed = ref(false)

// 验证码相关
const canSendCode = ref(false)
const countdown = ref(0)
const codeText = ref('获取验证码')
let timer: number

// 切换登录方式
const switchType = (index: number) => {
  currentType.value = index
  formData.value = {
    phone: formData.value.phone,
    password: '',
    code: '',
  }
}

// 验证手机号
const validatePhone = () => {
  const phoneReg = /^1[3-9]\d{9}$/
  canSendCode.value = phoneReg.test(formData.value.phone)
}

// 发送验证码
const sendCode = () => {
  if (!canSendCode.value || countdown.value > 0) return

  // 发送验证码
  uni.showLoading({
    title: '发送中',
  })

  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '验证码已发送',
      icon: 'success',
    })

    // 开始倒计时
    countdown.value = 60
    codeText.value = `${countdown.value}s后重新获取`
    canSendCode.value = false

    timer = setInterval(() => {
      countdown.value--
      codeText.value = `${countdown.value}s后重新获取`
      if (countdown.value === 0) {
        clearInterval(timer)
        codeText.value = '获取验证码'
        canSendCode.value = true
      }
    }, 1000)
  }, 1000)
}

// 处理登录
const handleLogin = () => {
  // 验证表单
  if (!formData.value.phone) {
    uni.showToast({
      title: '请输入手机号',
      icon: 'none',
    })
    return
  }

  if (!agreed.value) {
    uni.showToast({
      title: '请先同意用户协议和隐私政策',
      icon: 'none',
    })
    return
  }

  if (currentType.value === 0) {
    if (!formData.value.password) {
      uni.showToast({
        title: '请输入密码',
        icon: 'none',
      })
      return
    }
  } else {
    if (!formData.value.code) {
      uni.showToast({
        title: '请输入验证码',
        icon: 'none',
      })
      return
    }
  }

  // 显示加载提示
  uni.showLoading({
    title: '登录中',
  })

  // 模拟登录
  setTimeout(() => {
    // 保存登录信息
    setToken('mock_token')
    setUserInfo({
      id: 1,
      phone: formData.value.phone,
      nickname: '测试用户',
      avatar: '',
    })

    uni.hideLoading()
    uni.showToast({
      title: '登录成功',
      icon: 'success',
    })

    // 返回上一页
    setTimeout(() => {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
      } else {
        uni.switchTab({
          url: '/pages/index/index',
        })
      }
    }, 1500)
  }, 1000)
}

// 微信登录
const handleWechatLogin = () => {
  uni.showToast({
    title: '暂未开放',
    icon: 'none',
  })
}

// 查看协议
const viewAgreement = (type: 'user' | 'privacy') => {
  uni.navigateTo({
    url: `/pages-sub/common/agreement?type=${type}`,
  })
}

// 组件销毁时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<style lang="scss">
.login {
  min-height: 100vh;
  background-color: #fff;

  .text {
    padding: 0 20rpx;
    font-size: 28rpx;
    color: #999;
    background-color: #fff;
  }

  .header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100rpx 0;

    .logo {
      width: 160rpx;
      height: 160rpx;
      margin-bottom: 30rpx;
    }

    .title {
      margin-bottom: 16rpx;
      font-size: 40rpx;
      font-weight: bold;
      color: #333;
    }

    .subtitle {
      font-size: 28rpx;
      color: #999;
    }
  }

  .form {
    padding: 0 60rpx;

    .login-type {
      display: flex;
      justify-content: center;
      margin-bottom: 60rpx;

      .type-item {
        position: relative;
        padding: 0 30rpx;
        font-size: 32rpx;
        color: #999;

        &.active {
          font-weight: bold;
          color: #333;

          &::after {
            position: absolute;
            bottom: -16rpx;
            left: 50%;
            width: 40rpx;
            height: 4rpx;
            content: '';
            background-color: #018d71;
            transform: translateX(-50%);
          }
        }
      }
    }

    .form-item {
      display: flex;
      align-items: center;
      height: 100rpx;
      padding: 0 30rpx;
      margin-bottom: 40rpx;
      background-color: #f8f8f8;
      border-radius: 50rpx;

      .icon {
        margin-right: 20rpx;
        font-size: 40rpx;
      }

      input {
        flex: 1;
        height: 100%;
        font-size: 28rpx;
      }

      .code-btn {
        padding-left: 30rpx;
        font-size: 28rpx;
        color: #018d71;
        border-left: 2rpx solid #eee;

        &.disabled {
          color: #999;
        }
      }
    }

    .submit-btn {
      width: 100%;
      height: 88rpx;
      margin: 60rpx 0;
      font-size: 32rpx;
      line-height: 88rpx;
      color: #fff;
      text-align: center;
      background-color: #018d71;
      border-radius: 44rpx;
    }

    .other-login {
      .divider {
        position: relative;
        margin: 40rpx 0;
        text-align: center;

        &::before,
        &::after {
          position: absolute;
          top: 50%;
          width: calc(50% - 100rpx);
          height: 1rpx;
          content: '';
          background-color: #eee;
        }

        &::before {
          left: 0;
        }

        &::after {
          right: 0;
        }
      }

      .login-methods {
        display: flex;
        justify-content: center;

        .method-item {
          display: flex;
          flex-direction: column;
          align-items: center;

          .icon {
            margin-bottom: 16rpx;
            font-size: 64rpx;
          }

          text {
            font-size: 24rpx;
            color: #666;
          }
        }
      }
    }

    .agreement {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 60rpx;

      .text {
        margin-left: 8rpx;
        font-size: 24rpx;
        color: #999;

        .link {
          color: #018d71;
        }
      }
    }
  }
}
</style>
