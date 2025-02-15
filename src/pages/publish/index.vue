<template>
  <view class="publish-container">
    <view class="form-container">
      <!-- 商品图片 -->
      <view class="form-group">
        <view class="group-title">商品图片</view>
        <view class="image-uploader">
          <view
            class="image-item"
            v-for="(image, index) in form.images"
            :key="index"
            @click="previewImage(index)"
          >
            <image :src="image" mode="aspectFill" />
            <text class="delete-btn" @click.stop="deleteImage(index)">×</text>
          </view>
          <view class="upload-btn" @click="chooseImage" v-if="form.images.length < 9">
            <text class="iconfont icon-add"></text>
            <text class="text">上传图片</text>
          </view>
        </view>
      </view>

      <!-- 商品信息 -->
      <view class="form-group">
        <view class="group-title">基本信息</view>
        <view class="input-group">
          <wd-input v-model="form.name" placeholder="请输入商品名称" />
        </view>
        <view class="input-group">
          <wd-input
            v-model="form.price"
            type="digit"
            placeholder="请输入商品价格"
            right-icon="yen"
          />
        </view>
        <view class="input-group">
          <wd-input v-model="form.stock" type="number" placeholder="请输入商品库存" />
        </view>
      </view>

      <!-- 商品分类 -->
      <view class="form-group">
        <view class="group-title">商品分类</view>
        <view class="input-group" @click="showCategoryPicker = true">
          <wd-input
            v-model="selectedCategory"
            placeholder="请选择商品分类"
            readonly
            right-icon="arrow-right"
          />
        </view>
      </view>

      <!-- 商品规格 -->
      <view class="form-group">
        <view class="group-header">
          <text class="group-title">商品规格</text>
          <text class="add-btn" @click="addSpec">添加规格</text>
        </view>
        <view class="spec-list">
          <view class="spec-item" v-for="(spec, index) in form.specs" :key="index">
            <view class="spec-header">
              <text class="spec-title">规格{{ index + 1 }}</text>
              <text class="delete-btn" @click="deleteSpec(index)">删除</text>
            </view>
            <view class="input-group">
              <wd-input v-model="spec.name" placeholder="规格名称（如：重量）" />
            </view>
            <view class="input-group">
              <wd-input v-model="spec.value" placeholder="规格值（如：5kg）" />
            </view>
            <view class="input-group">
              <wd-input v-model="spec.price" type="digit" placeholder="规格价格" right-icon="yen" />
            </view>
            <view class="input-group">
              <wd-input v-model="spec.stock" type="number" placeholder="规格库存" />
            </view>
          </view>
        </view>
      </view>

      <!-- 商品详情 -->
      <view class="form-group">
        <view class="group-title">商品详情</view>
        <view class="input-group">
          <wd-textarea
            v-model="form.description"
            placeholder="请输入商品详情描述"
            :maxlength="500"
            show-count
          />
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <wd-button plain @click="saveDraft">保存草稿</wd-button>
      <wd-button type="primary" :loading="loading" @click="handlePublish">立即发布</wd-button>
    </view>

    <!-- 分类选择器 -->
    <wd-popup v-model="showCategoryPicker" position="bottom">
      <wd-picker
        v-model="categoryValue"
        :columns="categories"
        title="选择商品分类"
        @confirm="handleCategoryConfirm"
        @cancel="showCategoryPicker = false"
      />
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'

const router = useRouter()
const loading = ref(false)

// 表单数据
const form = reactive({
  images: [],
  name: '',
  price: '',
  stock: '',
  category: '',
  specs: [],
  description: '',
})

// 分类选择器
const showCategoryPicker = ref(false)
const categoryValue = ref('')
const categories = ref([
  { value: '1', label: '新鲜水果' },
  { value: '2', label: '时令蔬菜' },
  { value: '3', label: '肉禽蛋品' },
  { value: '4', label: '海鲜水产' },
  { value: '5', label: '粮油调味' },
])

const selectedCategory = computed(() => {
  const category = categories.value.find((item) => item.value === categoryValue.value)
  return category ? category.label : ''
})

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 9 - form.images.length,
    success: (res) => {
      form.images = [...form.images, ...res.tempFilePaths]
    },
  })
}

// 预览图片
const previewImage = (index: number) => {
  uni.previewImage({
    urls: form.images,
    current: index,
  })
}

// 删除图片
const deleteImage = (index: number) => {
  form.images.splice(index, 1)
}

// 添加规格
const addSpec = () => {
  form.specs.push({
    name: '',
    value: '',
    price: '',
    stock: '',
  })
}

// 删除规格
const deleteSpec = (index: number) => {
  form.specs.splice(index, 1)
}

// 处理分类选择
const handleCategoryConfirm = (value: string) => {
  categoryValue.value = value
  showCategoryPicker.value = false
}

// 表单验证
const validateForm = () => {
  if (form.images.length === 0) {
    showToast('请上传商品图片')
    return false
  }
  if (!form.name) {
    showToast('请输入商品名称')
    return false
  }
  if (!form.price) {
    showToast('请输入商品价格')
    return false
  }
  if (!form.stock) {
    showToast('请输入商品库存')
    return false
  }
  if (!categoryValue.value) {
    showToast('请选择商品分类')
    return false
  }
  if (!form.description) {
    showToast('请输入商品详情')
    return false
  }
  return true
}

// 保存草稿
const saveDraft = async () => {
  try {
    // TODO: 调用保存草稿接口
    await new Promise((resolve) => setTimeout(resolve, 1000))
    showToast('保存成功', { icon: 'success' })
  } catch (error) {
    showToast('保存失败')
  }
}

// 发布商品
const handlePublish = async () => {
  if (!validateForm()) return
  if (loading.value) return

  try {
    loading.value = true
    // TODO: 调用发布商品接口
    await new Promise((resolve) => setTimeout(resolve, 1000))
    showToast('发布成功', { icon: 'success' })
    setTimeout(() => {
      router.switchTab('/pages/shelf/index')
    }, 1500)
  } catch (error) {
    showToast('发布失败')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss">
.publish-container {
  min-height: 100vh;
  padding-bottom: 120rpx;
  background-color: #f8f8f8;
}

.form-container {
  .form-group {
    padding: 30rpx;
    margin-bottom: 20rpx;
    background-color: #fff;

    .group-title {
      margin-bottom: 30rpx;
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .group-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30rpx;

      .add-btn {
        font-size: 28rpx;
        color: #018d71;
      }
    }

    .input-group {
      margin-bottom: 20rpx;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.image-uploader {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;

  .image-item,
  .upload-btn {
    position: relative;
    width: 200rpx;
    height: 200rpx;
    overflow: hidden;
    border-radius: 12rpx;
  }

  .image-item {
    image {
      width: 100%;
      height: 100%;
    }

    .delete-btn {
      position: absolute;
      top: 10rpx;
      right: 10rpx;
      width: 40rpx;
      height: 40rpx;
      font-size: 32rpx;
      line-height: 40rpx;
      color: #fff;
      text-align: center;
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
    }
  }

  .upload-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;

    .iconfont {
      margin-bottom: 10rpx;
      font-size: 48rpx;
      color: #999;
    }

    .text {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.spec-list {
  .spec-item {
    padding: 20rpx;
    margin-bottom: 30rpx;
    background-color: #f8f8f8;
    border-radius: 12rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .spec-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20rpx;

      .spec-title {
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
      }

      .delete-btn {
        font-size: 28rpx;
        color: #ff6b6b;
      }
    }
  }
}

.bottom-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;

  .wd-button {
    width: 340rpx;
  }
}
</style>
