<template>
  <view class="goods-edit">
    <wd-form :model="formData" :rules="rules" ref="formRef">
      <!-- 商品名称 -->
      <wd-form-item label="商品名称" prop="name">
        <wd-input v-model="formData.name" placeholder="请输入商品名称" />
      </wd-form-item>

      <!-- 商品分类 -->
      <wd-form-item label="商品分类" prop="categoryId">
        <wd-picker
          v-model="formData.categoryId"
          :columns="categoryOptions"
          label-key="name"
          value-key="id"
          placeholder="请选择商品分类"
        />
      </wd-form-item>

      <!-- 商品价格 -->
      <wd-form-item label="商品价格" prop="price">
        <wd-input v-model="formData.price" type="number" placeholder="请输入商品价格">
          <template #prefix>¥</template>
        </wd-input>
      </wd-form-item>

      <!-- 商品库存 -->
      <wd-form-item label="商品库存" prop="stock">
        <wd-input v-model="formData.stock" type="number" placeholder="请输入商品库存" />
      </wd-form-item>

      <!-- 商品封面 -->
      <wd-form-item label="商品封面" prop="cover">
        <view class="upload-wrapper">
          <wd-upload
            v-model="formData.cover"
            :action="uploadAction"
            :headers="uploadHeaders"
            :before-upload="beforeUpload"
            :limit="1"
          >
            <wd-button size="small" type="primary">上传封面</wd-button>
          </wd-upload>
          <image v-if="formData.cover" :src="formData.cover" class="preview-image" />
        </view>
      </wd-form-item>

      <!-- 商品图片 -->
      <wd-form-item label="商品图片" prop="images">
        <view class="upload-wrapper">
          <wd-upload
            v-model="formData.images"
            :action="uploadAction"
            :headers="uploadHeaders"
            :before-upload="beforeUpload"
            multiple
            :limit="9"
          >
            <wd-button size="small" type="primary">上传图片</wd-button>
          </wd-upload>
          <view class="image-list">
            <image
              v-for="(url, index) in formData.images"
              :key="index"
              :src="url"
              class="preview-image"
            />
          </view>
        </view>
      </wd-form-item>

      <!-- 商品描述 -->
      <wd-form-item label="商品描述" prop="description">
        <wd-textarea
          v-model="formData.description"
          placeholder="请输入商品描述"
          :maxlength="500"
          show-count
        />
      </wd-form-item>

      <!-- 商品状态 -->
      <wd-form-item label="商品状态" prop="status">
        <wd-radio-group v-model="formData.status">
          <wd-radio value="on">上架</wd-radio>
          <wd-radio value="off">下架</wd-radio>
        </wd-radio-group>
      </wd-form-item>
    </wd-form>

    <!-- 底部按钮 -->
    <view class="bottom-buttons">
      <wd-button type="info" block @click="handleCancel">取消</wd-button>
      <wd-button type="primary" block @click="handleSubmit">保存</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { GoodsFormData } from '@/types/goods'

// 表单ref
const formRef = ref()

// 表单数据
const formData = ref<GoodsFormData>({
  name: '',
  categoryId: '',
  price: 0,
  stock: 0,
  cover: '',
  images: [],
  description: '',
  status: 'off',
})

// 表单校验规则
const rules = {
  name: [{ required: true, message: '请输入商品名称' }],
  categoryId: [{ required: true, message: '请选择商品分类' }],
  price: [
    { required: true, message: '请输入商品价格' },
    { type: 'number', min: 0.01, message: '价格必须大于0' },
  ],
  stock: [
    { required: true, message: '请输入商品库存' },
    { type: 'number', min: 0, message: '库存不能小于0' },
  ],
  cover: [{ required: true, message: '请上传商品封面' }],
  images: [{ required: true, message: '请上传商品图片' }],
  description: [{ required: true, message: '请输入商品描述' }],
  status: [{ required: true, message: '请选择商品状态' }],
}

// 分类选项
const categoryOptions = ref([])

// 获取分类列表
const getCategoryOptions = async () => {
  try {
    const res = await uni.$api.category.getList()
    categoryOptions.value = res.data
  } catch (error) {
    uni.showToast({
      title: '获取分类列表失败',
      icon: 'none',
    })
  }
}

// 上传相关配置
const uploadAction = uni.$api.upload.url
const uploadHeaders = {
  Authorization: uni.getStorageSync('token'),
}

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

  // 验证文件大小（2MB）
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    uni.showToast({
      title: '图片大小不能超过2MB',
      icon: 'none',
    })
    return false
  }

  return true
}

// 获取商品详情
const getGoodsDetail = async (id: string) => {
  try {
    const res = await uni.$api.goods.getDetail(id)
    Object.assign(formData.value, res.data)
  } catch (error) {
    uni.showToast({
      title: '获取商品详情失败',
      icon: 'none',
    })
  }
}

// 提交表单
const handleSubmit = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return

    try {
      const id = uni.getQueryString('id')
      if (id) {
        await uni.$api.goods.update({
          id,
          ...formData.value,
        })
      } else {
        await uni.$api.goods.create(formData.value)
      }

      uni.showToast({
        title: '保存成功',
        icon: 'success',
      })

      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } catch (error) {
      uni.showToast({
        title: '保存失败',
        icon: 'none',
      })
    }
  })
}

// 取消
const handleCancel = () => {
  uni.navigateBack()
}

onMounted(() => {
  // 获取分类列表
  getCategoryOptions()

  // 如果是编辑模式，获取商品详情
  const id = uni.getQueryString('id')
  if (id) {
    getGoodsDetail(id)
  }
})
</script>

<style lang="scss">
.goods-edit {
  min-height: 100vh;
  padding: 20rpx;
  background-color: #f8f8f8;

  .upload-wrapper {
    .preview-image {
      width: 160rpx;
      height: 160rpx;
      margin-top: 20rpx;
      border-radius: 8rpx;
    }

    .image-list {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;
      margin-top: 20rpx;
    }
  }

  .bottom-buttons {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    gap: 20rpx;
    padding: 20rpx;
    background-color: #fff;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  }
}
</style>
