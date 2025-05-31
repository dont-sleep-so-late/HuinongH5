<template>
  <view class="profile-container">
    <view class="header">
      <view class="nav-back" @click="router.back()">
        <text class="iconfont icon-arrow-left"></text>
      </view>
      <text class="title">编辑资料</text>
    </view>

    <view class="form-container">
      <!-- 头像 -->
      <view class="form-item avatar-item" @click="handleUploadAvatar">
        <text class="label">头像</text>
        <view class="avatar-wrapper">
          <image :src="form.avatar || '/static/images/Ayo.png'" class="avatar" mode="aspectFill" />
          <text class="iconfont icon-camera"></text>
        </view>
      </view>

      <!-- 昵称 -->
      <view class="form-item">
        <text class="label">昵称</text>
        <wd-input v-model="form.nickname" placeholder="请输入昵称" maxlength="20" />
      </view>

      <!-- 手机号 -->
      <view class="form-item">
        <text class="label">手机号</text>
        <view class="phone-wrapper">
          <text>{{ form.phone || '未绑定' }}</text>
          <text class="bind-btn" @click="handleBindPhone" v-if="!form.phone">去绑定</text>
          <text class="bind-btn" @click="handleChangePhone" v-else>更换</text>
        </view>
      </view>

      <!-- 邮箱 -->
      <view class="form-item">
        <text class="label">邮箱</text>
        <view class="email-wrapper">
          <text>{{ form.email || '未绑定' }}</text>
          <text class="bind-btn" @click="handleBindEmail" v-if="!form.email">去绑定</text>
          <text class="bind-btn" @click="handleChangeEmail" v-else>更换</text>
        </view>
      </view>
    </view>

    <view class="submit-btn">
      <wd-button block type="primary" :loading="loading" @click="handleSubmit">保存</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from '@/hooks/router'
import { useUserStore } from '@/stores/user'
import { showToast } from '@/utils/toast'
import { updateUserInfo, uploadFile, updateAvatar } from '@/services/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

// 表单数据
const form = reactive({
  avatar: userStore.userInfo?.avatar || '',
  nickname: userStore.userInfo?.nickname || '',
  phone: userStore.userInfo?.phone || '',
  email: userStore.userInfo?.email || '',
})

// 上传头像
const handleUploadAvatar = async () => {
  try {
    // 选择图片
    const { tempFilePaths } = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    })

    if (tempFilePaths && tempFilePaths.length > 0) {
      loading.value = true
      showToast('上传中...', { icon: 'loading' })

      // 上传头像
      const res = await updateAvatar(tempFilePaths[0])

      // 更新用户信息
      if (userStore.userInfo && res.code === 200 && res.data) {
        // 去除返回URL中的引号
        const avatarUrl = res.data.replace(/["']/g, '')
        form.avatar = avatarUrl
        userStore.updateUserInfo({
          ...userStore.userInfo,
          avatar: avatarUrl,
        })
        showToast('头像更新成功', { icon: 'success' })
      } else {
        throw new Error('更新头像失败')
      }
    }
  } catch (error: any) {
    showToast(error.message || '上传失败', { icon: 'error' })
  } finally {
    loading.value = false
  }
}

// 绑定手机号
const handleBindPhone = () => {
  router.navigate('/pages-sub/user/bind-phone')
}

// 更换手机号
const handleChangePhone = () => {
  router.navigate('/pages-sub/user/change-phone')
}

// 绑定邮箱
const handleBindEmail = () => {
  router.navigate('/pages-sub/user/bind-email')
}

// 更换邮箱
const handleChangeEmail = () => {
  router.navigate('/pages-sub/user/change-email')
}

// 提交表单
const handleSubmit = async () => {
  if (loading.value) return

  if (!form.nickname) {
    showToast('请输入昵称')
    return
  }

  try {
    loading.value = true
    // 更新用户信息
    await updateUserInfo({
      nickname: form.nickname,
      email: form.email,
      phone: form.phone,
    })

    // 更新本地用户信息
    if (userStore.userInfo) {
      userStore.updateUserInfo({
        ...userStore.userInfo,
        nickname: form.nickname,
        email: form.email,
        phone: form.phone,
      })
    }

    showToast('保存成功')
    router.back()
  } catch (error: any) {
    showToast(error.message || '保存失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
.profile-container {
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
      display: flex;
      align-items: center;
      padding: 32rpx;
      border-bottom: 1px solid #f5f5f5;

      .label {
        width: 140rpx;
        font-size: 32rpx;
        color: #333;
      }

      &.avatar-item {
        .avatar-wrapper {
          position: relative;
          margin-left: auto;

          .avatar {
            width: 120rpx;
            height: 120rpx;
            border-radius: 60rpx;
          }

          .iconfont {
            position: absolute;
            right: -20rpx;
            bottom: -20rpx;
            padding: 10rpx;
            font-size: 40rpx;
            color: #fff;
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
          }
        }
      }

      .phone-wrapper,
      .email-wrapper {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: space-between;
        font-size: 32rpx;
        color: #333;

        .bind-btn {
          padding: 10rpx 20rpx;
          font-size: 28rpx;
          color: #018d71;
        }
      }
    }
  }

  .submit-btn {
    padding: 40rpx;
  }
}
</style>
