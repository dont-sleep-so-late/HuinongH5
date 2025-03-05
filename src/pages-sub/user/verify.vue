<template>
  <view class="verify-container">
    <view class="header">
      <view class="nav-back" @click="router.back()">
        <text class="iconfont icon-arrow-left"></text>
      </view>
      <text class="title">实名认证</text>
    </view>

    <!-- 认证状态展示 -->
    <template v-if="verificationInfo">
      <view class="status-card">
        <view class="status-icon">
          <wd-icon :name="statusIcon" :color="statusColor" size="80" />
        </view>
        <view class="status-text" :style="{ color: statusColor }">
          {{ statusText }}
        </view>
        <view v-if="verificationInfo.status === 'rejected'" class="reject-reason">
          {{ verificationInfo.rejectReason }}
        </view>
        <view v-if="verificationInfo.status === 'pending'" class="tips">
          认证信息审核中，请耐心等待
        </view>
        <template v-if="!verificationInfo.status">
          <view class="tips">请完成实名认证以获得更多权限</view>
          <wd-button type="primary" block @click="showForm = true">立即认证</wd-button>
        </template>
        <wd-button
          v-if="verificationInfo.status === 'rejected'"
          type="primary"
          block
          @click="showForm = true"
        >
          重新认证
        </wd-button>
      </view>
    </template>

    <!-- 认证表单 -->
    <template
      v-if="
        !verificationInfo ||
        !verificationInfo.status ||
        (verificationInfo.status === 'rejected' && showForm)
      "
    >
      <view class="form-container">
        <view class="form-group">
          <view class="form-item">
            <text class="label">真实姓名</text>
            <wd-input v-model="form.realName" placeholder="请输入真实姓名" clearable />
          </view>

          <view class="form-item">
            <text class="label">身份证号码</text>
            <wd-input
              v-model="form.idCard"
              placeholder="请输入身份证号码"
              :maxlength="18"
              clearable
            />
          </view>

          <view class="form-item">
            <text class="label">身份证正面照片</text>
            <wd-upload-image
              v-model="form.idCardFront"
              placeholder="上传身份证正面照片"
              @change="handleImageChange('front', $event)"
            />
          </view>

          <view class="form-item">
            <text class="label">身份证背面照片</text>
            <wd-upload-image
              v-model="form.idCardBack"
              placeholder="上传身份证背面照片"
              @change="handleImageChange('back', $event)"
            />
          </view>

          <view class="form-item">
            <text class="label">手持身份证照片</text>
            <wd-upload-image
              v-model="form.idCardHand"
              placeholder="上传手持身份证照片"
              @change="handleImageChange('hand', $event)"
            />
          </view>

          <view class="form-item">
            <text class="label">店铺名称</text>
            <wd-input
              v-model="form.shopName"
              placeholder="建议使用：农户姓名+农产品类型，如：张三的水果店"
              clearable
            />
          </view>

          <view class="form-item">
            <text class="label">店铺地址</text>
            <wd-input
              v-model="form.shopAddress"
              placeholder="请输入详细地址，具体到村，如：北京市朝阳区xx镇xx村"
              clearable
            />
          </view>

          <view class="form-item">
            <text class="label">联系电话</text>
            <wd-input
              v-model="form.contactPhone"
              placeholder="请输入11位手机号码"
              :maxlength="11"
              type="number"
              clearable
            />
          </view>
        </view>

        <view class="tips">
          <text class="iconfont icon-info"></text>
          <text>请确保上传的证件照片清晰完整，并按要求填写店铺信息，否则可能导致认证失败</text>
        </view>

        <view class="action">
          <wd-button type="primary" block :loading="submitting" @click="handleSubmit">
            提交认证
          </wd-button>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import { submitVerification, getVerificationStatus } from '@/api/verify'
import type { Verification } from '@/types/verify'

const router = useRouter()
const submitting = ref(false)
const showForm = ref(false)
const verificationInfo = ref<Verification | null>(null)

// 表单数据
const form = ref({
  realName: '',
  idCard: '',
  idCardFront: '',
  idCardBack: '',
  idCardHand: '',
  shopName: '',
  shopAddress: '',
  contactPhone: '',
})

// 状态相关的计算属性
const statusIcon = computed(() => {
  const status = verificationInfo.value?.status
  switch (status) {
    case 'approved':
      return 'success'
    case 'rejected':
      return 'error'
    case 'pending':
      return 'time'
    default:
      return 'add'
  }
})

const statusColor = computed(() => {
  const status = verificationInfo.value?.status
  switch (status) {
    case 'approved':
      return '#52c41a'
    case 'rejected':
      return '#ff4d4f'
    case 'pending':
      return '#1890ff'
    default:
      return '#666'
  }
})

const statusText = computed(() => {
  const status = verificationInfo.value?.status
  switch (status) {
    case 'approved':
      return '认证已通过'
    case 'rejected':
      return '认证未通过'
    case 'pending':
      return '认证审核中'
    default:
      return '未认证'
  }
})

// 获取认证状态
const fetchVerificationStatus = async () => {
  try {
    const res = await getVerificationStatus()
    if (res.code === 200) {
      verificationInfo.value = res.data
    }
  } catch (error: any) {
    showToast(error.message || '获取认证状态失败')
  }
}

// 处理图片变更
const handleImageChange = (type: 'front' | 'back' | 'hand', url: string) => {
  if (type === 'front') {
    form.value.idCardFront = url
  } else if (type === 'back') {
    form.value.idCardBack = url
  } else {
    form.value.idCardHand = url
  }
}

// 验证身份证号
const validateIdCard = (idCard: string) => {
  return /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dX]$/.test(idCard)
}

// 验证手机号
const validatePhone = (phone: string) => {
  return /^1[3-9]\d{9}$/.test(phone)
}

// 生成店铺名称建议
const generateShopName = (realName: string) => {
  return `${realName}的农产品店`
}

// 监听姓名变化，自动生成店铺名称建议
watch(
  () => form.value.realName,
  (newName) => {
    if (newName && !form.value.shopName) {
      form.value.shopName = generateShopName(newName)
    }
  },
)

// 提交认证
const handleSubmit = async () => {
  // 验证姓名
  if (!form.value.realName) {
    showToast('请输入真实姓名')
    return
  }

  // 验证身份证号
  if (!form.value.idCard) {
    showToast('请输入身份证号码')
    return
  }
  if (!validateIdCard(form.value.idCard)) {
    showToast('身份证号码格式不正确')
    return
  }

  // 验证图片
  if (!form.value.idCardFront) {
    showToast('请上传身份证正面照片')
    return
  }
  if (!form.value.idCardBack) {
    showToast('请上传身份证背面照片')
    return
  }
  if (!form.value.idCardHand) {
    showToast('请上传手持身份证照片')
    return
  }

  // 验证店铺信息
  if (!form.value.shopName) {
    showToast('请输入店铺名称')
    return
  }
  if (!form.value.shopAddress) {
    showToast('请输入详细的店铺地址')
    return
  }
  if (!form.value.contactPhone) {
    showToast('请输入联系电话')
    return
  }
  if (!validatePhone(form.value.contactPhone)) {
    showToast('请输入正确的手机号码')
    return
  }

  // 验证图片URL格式
  const imageUrls = [form.value.idCardFront, form.value.idCardBack, form.value.idCardHand]
  if (!imageUrls.every((url) => url.startsWith('https://') || url.startsWith('http://'))) {
    showToast('图片地址无效')
    return
  }

  try {
    submitting.value = true
    const res = await submitVerification(form.value)
    if (res.code === 200) {
      showToast('提交成功', { icon: 'success' })
      showForm.value = false
      await fetchVerificationStatus()
    }
  } catch (error: any) {
    showToast(error.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchVerificationStatus()
})
</script>

<style lang="scss">
.verify-container {
  min-height: 100vh;
  padding-bottom: 40rpx;
  background-color: #f8f8f8;

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

  .status-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx;
    margin: 20rpx;
    background-color: #fff;
    border-radius: 12rpx;

    .status-icon {
      margin-bottom: 20rpx;
    }

    .status-text {
      margin-bottom: 16rpx;
      font-size: 32rpx;
      font-weight: bold;
    }

    .reject-reason {
      padding: 20rpx;
      margin: 20rpx 0;
      font-size: 28rpx;
      color: #ff4d4f;
      text-align: center;
      background-color: #fff1f0;
      border-radius: 8rpx;
    }

    .tips {
      margin-bottom: 32rpx;
      font-size: 28rpx;
      color: #666;
    }
  }

  .form-container {
    padding: 20rpx;

    .form-group {
      padding: 20rpx;
      margin-bottom: 20rpx;
      background-color: #fff;
      border-radius: 12rpx;

      .form-item {
        margin-bottom: 32rpx;

        .label {
          display: block;
          margin-bottom: 16rpx;
          font-size: 28rpx;
          color: #333;
        }

        .upload-box {
          overflow: hidden;
          border: 2rpx dashed #ddd;
          border-radius: 8rpx;

          .preview {
            width: 100%;
            height: 360rpx;
          }

          .upload-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 360rpx;
            color: #999;

            text {
              margin-top: 16rpx;
              font-size: 28rpx;
            }
          }
        }
      }
    }

    .tips {
      display: flex;
      align-items: center;
      padding: 20rpx;
      margin-bottom: 40rpx;
      font-size: 26rpx;
      color: #666;
      background-color: #fff;
      border-radius: 8rpx;

      .iconfont {
        margin-right: 8rpx;
        color: #1890ff;
      }
    }

    .action {
      padding: 0 20rpx;
    }
  }
}
</style>
