<template>
  <view class="change-password">
    <view class="header">
      <view class="nav-back" @click="router.back()">
        <text class="iconfont icon-arrow-left"></text>
      </view>
      <text class="title">修改密码</text>
    </view>

    <view class="form-container">
      <!-- 旧密码 -->
      <view class="form-item">
        <wd-input
          v-model="form.oldPassword"
          :type="showOldPassword ? 'text' : 'password'"
          placeholder="请输入旧密码"
          clearable
        >
          <template #prefix>
            <text class="iconfont icon-lock"></text>
          </template>
          <template #suffix>
            <text
              class="iconfont"
              :class="showOldPassword ? 'icon-eye-open' : 'icon-eye-close'"
              @click="showOldPassword = !showOldPassword"
            ></text>
          </template>
        </wd-input>
      </view>

      <!-- 新密码 -->
      <view class="form-item">
        <wd-input
          v-model="form.newPassword"
          :type="showNewPassword ? 'text' : 'password'"
          placeholder="请输入新密码"
          clearable
        >
          <template #prefix>
            <text class="iconfont icon-lock"></text>
          </template>
          <template #suffix>
            <text
              class="iconfont"
              :class="showNewPassword ? 'icon-eye-open' : 'icon-eye-close'"
              @click="showNewPassword = !showNewPassword"
            ></text>
          </template>
        </wd-input>
      </view>

      <!-- 确认新密码 -->
      <view class="form-item">
        <wd-input
          v-model="form.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="请确认新密码"
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

      <!-- 密码规则提示 -->
      <view class="tips">
        <text class="iconfont icon-info"></text>
        <text class="text">密码由6-20位字母、数字或符号组成</text>
      </view>
    </view>

    <view class="submit-btn">
      <wd-button block type="primary" :loading="loading" @click="handleSubmit">确认修改</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import { updatePassword } from '@/services/user'
import { md5 } from '@/utils/crypto'

const router = useRouter()
const loading = ref(false)

// 密码显示状态
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// 表单数据
const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 提交表单
const handleSubmit = async () => {
  if (loading.value) return

  // 表单验证
  if (!form.oldPassword) {
    showToast('请输入旧密码')
    return
  }
  if (!form.newPassword) {
    showToast('请输入新密码')
    return
  }
  if (!form.confirmPassword) {
    showToast('请确认新密码')
    return
  }
  if (form.newPassword !== form.confirmPassword) {
    showToast('两次输入的密码不一致')
    return
  }
  if (!/^[a-zA-Z0-9!@#$%^&*]{6,20}$/.test(form.newPassword)) {
    showToast('密码格式不正确')
    return
  }

  try {
    loading.value = true
    await updatePassword({
      oldPassword: md5(form.oldPassword),
      newPassword: md5(form.newPassword),
    })
    showToast('密码修改成功')
    router.back()
  } catch (error: any) {
    showToast(error.message || '修改失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
.change-password {
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
    margin-top: 20rpx;
    background-color: #fff;

    .form-item {
      padding: 32rpx;
      border-bottom: 1px solid #f5f5f5;
    }

    .tips {
      display: flex;
      align-items: center;
      padding: 20rpx 32rpx;

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

  .submit-btn {
    padding: 40rpx;
  }
}
</style>
