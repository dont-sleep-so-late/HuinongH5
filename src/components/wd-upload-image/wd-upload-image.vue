<template>
  <view class="wd-upload-image">
    <!-- 已上传图片预览 -->
    <view v-if="modelValue" class="preview-wrapper">
      <image :src="modelValue" mode="aspectFill" class="preview-image" @click="handlePreview" />
      <view class="action-mask">
        <view class="action-btn delete" @click.stop="handleDelete">
          <wd-icon name="delete" color="#fff" size="36" />
        </view>
      </view>
    </view>

    <!-- 上传按钮 -->
    <view v-else class="upload-wrapper" @click="handleUpload">
      <slot>
        <view class="upload-default">
          <wd-icon name="camera" size="48" />
          <text class="upload-text">{{ placeholder }}</text>
        </view>
      </slot>
    </view>
  </view>
</template>

<script lang="ts"></script>

<script setup lang="ts">
import { computed } from 'vue'
import { showToast } from '@/utils/toast'
export interface Props {
  modelValue?: string // 图片URL
  placeholder?: string // 占位提示文字
  maxSize?: number // 最大文件大小，单位MB
  compress?: boolean // 是否压缩
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '上传图片',
  maxSize: 5,
  compress: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'delete'): void
}>()

// 验证文件
const validateFile = (file: UniApp.ChooseImageSuccessCallbackResultFile) => {
  // 验证大小
  const sizeInMB = file.size / 1024 / 1024
  if (sizeInMB > props.maxSize) {
    showToast(`图片大小不能超过${props.maxSize}MB`)
    return false
  }
  return true
}

// 处理上传
const handleUpload = () => {
  uni.chooseImage({
    count: 1,
    sizeType: props.compress ? ['compressed'] : ['original'],
    sourceType: ['album', 'camera'],
    success: async (res: UniApp.ChooseImageSuccessCallbackResult) => {
      const tempFiles = res.tempFiles as UniApp.ChooseImageSuccessCallbackResultFile[]
      if (!tempFiles || tempFiles.length === 0) {
        showToast('选择图片失败')
        return
      }

      const file = tempFiles[0]

      // 验证文件
      if (!validateFile(file)) return

      try {
        // 上传请求
        const uploadRes = await uni.uploadFile({
          url: 'http://localhost:8888/api/common/file/upload/image',
          filePath: file.path,
        })

        const result = JSON.parse(uploadRes.data)
        if (result.code === 200 && result.data) {
          emit('update:modelValue', result.data)
          emit('change', result.data)
        } else {
          showToast(result.message || '上传失败')
        }
      } catch (error: any) {
        showToast(error.message || '上传失败')
      }
    },
    fail: () => {
      showToast('选择图片失败')
    },
  })
}

// 预览图片
const handlePreview = () => {
  if (props.modelValue) {
    uni.previewImage({
      urls: [props.modelValue],
    })
  }
}

// 删除图片
const handleDelete = () => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这张图片吗？',
    success: ({ confirm }) => {
      if (confirm) {
        emit('update:modelValue', '')
        emit('delete')
      }
    },
  })
}
</script>

<style lang="scss">
.wd-upload-image {
  position: relative;
  width: 100%;
  border-radius: 8rpx;

  .preview-wrapper {
    position: relative;
    width: 100%;
    height: 360rpx;
    overflow: hidden;
    border-radius: 8rpx;

    .preview-image {
      width: 100%;
      height: 100%;
    }

    .action-mask {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.4);
      opacity: 0;
      transition: opacity 0.3s;

      .action-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80rpx;
        height: 80rpx;
        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 50%;
        transition: transform 0.3s;
        transform: scale(0.8);

        &:active {
          transform: scale(0.9);
        }
      }
    }

    &:active .action-mask {
      opacity: 1;
    }
  }

  .upload-wrapper {
    width: 100%;
    height: 360rpx;
    overflow: hidden;
    background-color: #f8f8f8;
    border: 2rpx dashed #ddd;
    border-radius: 8rpx;
    transition: all 0.3s;

    &:active {
      background-color: #f0f0f0;
      border-color: #ccc;
    }

    .upload-default {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #999;

      .upload-text {
        margin-top: 16rpx;
        font-size: 28rpx;
      }
    }
  }
}
</style>
