<template>
  <view class="verify-container">
    <wd-form :model="formData" :rules="rules" ref="formRef">
      <!-- 真实姓名 -->
      <wd-form-item label="真实姓名" prop="realName">
        <wd-input v-model="formData.realName" placeholder="请输入真实姓名" />
      </wd-form-item>

      <!-- 身份证号 -->
      <wd-form-item label="身份证号" prop="idCard">
        <wd-input v-model="formData.idCard" placeholder="请输入身份证号" />
      </wd-form-item>

      <!-- 身份证正面照 -->
      <wd-form-item label="身份证正面照" prop="idCardFront">
        <view class="upload-wrapper">
          <wd-upload
            v-model="formData.idCardFront"
            :action="uploadAction"
            :headers="uploadHeaders"
            :before-upload="beforeUpload"
            :limit="1"
          >
            <wd-button size="small" type="primary">上传正面照</wd-button>
          </wd-upload>
          <image v-if="formData.idCardFront" :src="formData.idCardFront" class="preview-image" />
        </view>
      </wd-form-item>

      <!-- 身份证背面照 -->
      <wd-form-item label="身份证背面照" prop="idCardBack">
        <view class="upload-wrapper">
          <wd-upload
            v-model="formData.idCardBack"
            :action="uploadAction"
            :headers="uploadHeaders"
            :before-upload="beforeUpload"
            :limit="1"
          >
            <wd-button size="small" type="primary">上传背面照</wd-button>
          </wd-upload>
          <image v-if="formData.idCardBack" :src="formData.idCardBack" class="preview-image" />
        </view>
      </wd-form-item>

      <!-- 手持身份证照片 -->
      <wd-form-item label="手持身份证照片" prop="idCardHold">
        <view class="upload-wrapper">
          <wd-upload
            v-model="formData.idCardHold"
            :action="uploadAction"
            :headers="uploadHeaders"
            :before-upload="beforeUpload"
            :limit="1"
          >
            <wd-button size="small" type="primary">上传手持照</wd-button>
          </wd-upload>
          <image v-if="formData.idCardHold" :src="formData.idCardHold" class="preview-image" />
        </view>
      </wd-form-item>
    </wd-form>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <wd-button type="primary" block @click="handleSubmit">提交认证</wd-button>
    </view>

    <!-- 认证说明 -->
    <view class="notice-section">
      <view class="title">认证说明：</view>
      <view class="content">
        <view>1. 请确保上传的证件照片清晰完整</view>
        <view>2. 手持身份证照片需要本人手持身份证正面拍摄</view>
        <view>3. 所有信息仅用于实名认证，我们将严格保护您的隐私</view>
        <view>4. 认证成功后将无法修改，请认真填写</view>
      </view>
    </view>

    <!-- 认证状态弹窗 -->
    <view v-if="showStatusDialog" class="status-dialog">
      <view class="status-content">
        <image :src="statusIcon" class="status-icon" />
        <view class="status-text">{{ statusText }}</view>
        <view class="status-desc">{{ statusDesc }}</view>
        <wd-button type="primary" block @click="handleStatusConfirm">确定</wd-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref()
const submitting = ref(false)

// 表单数据
interface VerifyForm {
  realName: string
  idCard: string
  phone: string
  address: string
  idCardFront: string
  idCardBack: string
  idCardHold: string
}

const formData = ref<VerifyForm>({
  realName: '',
  idCard: '',
  phone: '',
  address: '',
  idCardFront: '',
  idCardBack: '',
  idCardHold: '',
})

// 表单规则
const rules = {
  realName: [
    { required: true, message: '请输入真实姓名' },
    { pattern: /^[\u4e00-\u9fa5]{2,}$/, message: '请输入正确的中文姓名' },
  ],
  idCard: [
    { required: true, message: '请输入身份证号' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号' },
  ],
  phone: [
    { required: true, message: '请输入手机号码' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' },
  ],
  address: [
    { required: true, message: '请输入详细地址' },
    { min: 10, message: '地址至少需要10个字符' },
  ],
  idCardFront: [{ required: true, message: '请上传身份证正面照' }],
  idCardBack: [{ required: true, message: '请上传身份证背面照' }],
  idCardHold: [{ required: true, message: '请上传手持身份证照片' }],
}

// 上传相关配置
const uploadAction = computed(() => '/upload')
const uploadHeaders = computed(() => ({
  Authorization: 'Bearer ' + uni.getStorageSync('token'),
}))

// 上传前校验
const beforeUpload = (file: File) => {
  // 验证文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    uni.showToast({
      title: '只能上传图片文件',
      icon: 'none',
    })
    return false
  }

  // 验证文件大小（5MB）
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    uni.showToast({
      title: '图片大小不能超过5MB',
      icon: 'none',
    })
    return false
  }

  return true
}

// 认证状态弹窗
const showStatusDialog = ref(false)
const verifyStatus = ref<'success' | 'error' | 'pending'>('pending')

// 状态相关的计算属性
const statusIcon = computed(() => {
  const icons = {
    success: '/static/images/verify/success.png',
    error: '/static/images/verify/error.png',
    pending: '/static/images/verify/pending.png',
  }
  return icons[verifyStatus.value]
})

const statusText = computed(() => {
  const texts = {
    success: '认证成功',
    error: '认证失败',
    pending: '审核中',
  }
  return texts[verifyStatus.value]
})

const statusDesc = computed(() => {
  const descs = {
    success: '您的实名认证已通过，现在可以使用更多功能了',
    error: '很抱歉，您的实名认证未通过，请检查信息是否正确',
    pending: '您的认证信息已提交，我们将在1-2个工作日内完成审核',
  }
  return descs[verifyStatus.value]
})

// 处理状态确认
const handleStatusConfirm = () => {
  if (verifyStatus.value === 'success') {
    uni.navigateBack()
  }
}

// 提交表单
const handleSubmit = () => {
  if (submitting.value) return

  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return

    try {
      submitting.value = true
      await uni.$api.user.verify(formData.value)

      // 更新用户信息
      const res = await uni.$api.user.getInfo()
      userStore.setUserInfo(res.data)

      // 显示成功状态
      verifyStatus.value = 'success'
      showStatusDialog.value = true
    } catch (error: any) {
      // 显示错误状态
      verifyStatus.value = 'error'
      showStatusDialog.value = true
    } finally {
      submitting.value = false
    }
  })
}
</script>

<style lang="scss">
.verify-container {
  min-height: 100vh;
  padding: 20rpx;
  background-color: #f8f8f8;

  .upload-wrapper {
    .preview-image {
      width: 240rpx;
      height: 150rpx;
      margin-top: 20rpx;
      border-radius: 8rpx;
    }
  }

  .submit-section {
    margin: 40rpx 0;
  }

  .notice-section {
    padding: 20rpx;
    background-color: #fff;
    border-radius: 8rpx;

    .title {
      margin-bottom: 20rpx;
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
    }

    .content {
      view {
        margin-bottom: 10rpx;
        font-size: 24rpx;
        line-height: 1.5;
        color: #666;
      }
    }
  }

  .status-dialog {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.5);

    .status-content {
      padding: 40rpx;
      text-align: center;
      background-color: #fff;
      border-radius: 8rpx;

      .status-icon {
        width: 100rpx;
        height: 100rpx;
        margin-bottom: 20rpx;
      }

      .status-text {
        margin-bottom: 10rpx;
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }

      .status-desc {
        margin-bottom: 20rpx;
        font-size: 24rpx;
        color: #666;
      }

      .wd-button {
        margin-top: 20rpx;
      }
    }
  }
}
</style>
