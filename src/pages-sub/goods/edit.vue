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

      <!-- 商品产地 -->
      <wd-form-item label="商品产地" prop="region">
        <wd-input v-model="formData.region" placeholder="请输入商品产地" />
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
      <wd-form-item label="商品封面" prop="mainImage">
        <view class="upload-wrapper">
          <wd-upload
            v-model="formData.mainImage"
            :action="uploadAction"
            :headers="uploadHeaders"
            :before-upload="beforeUpload"
            :limit="1"
          >
            <wd-button size="small" type="primary">上传封面</wd-button>
          </wd-upload>
          <image v-if="formData.mainImage" :src="formData.mainImage" class="preview-image" />
        </view>
      </wd-form-item>

      <!-- 商品图片 -->
      <wd-form-item label="商品图片" prop="detailImages">
        <view class="upload-wrapper">
          <wd-upload
            v-model="formData.detailImages"
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
              v-for="(url, index) in formData.detailImages"
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

      <!-- 商品规格 -->
      <wd-form-item label="商品规格" prop="specs">
        <view class="specs-list">
          <view v-for="(spec, index) in formData.specs" :key="index" class="spec-item">
            <wd-input v-model="spec.specValue" placeholder="规格值" style="flex: 1" />
            <wd-input v-model="spec.price" type="number" placeholder="价格" style="width: 150rpx" />
            <wd-input v-model="spec.stock" type="number" placeholder="库存" style="width: 150rpx" />
            <wd-button type="danger" size="small" @click="removeSpec(index)">删除</wd-button>
          </view>
          <wd-button type="primary" size="small" @click="addSpec">添加规格</wd-button>
        </view>
      </wd-form-item>

      <!-- 商品状态 -->
      <wd-form-item label="商品状态" prop="status">
        <wd-radio-group v-model="formData.status">
          <wd-radio :value="1">上架</wd-radio>
          <wd-radio :value="0">下架</wd-radio>
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
import type { GoodsFormData, SpecItem } from '@/types/goods'

// 表单ref
const formRef = ref()

// 表单数据
const formData = ref<GoodsFormData>({
  name: '',
  categoryId: '',
  region: '',
  price: 0,
  stock: 0,
  mainImage: '',
  detailImages: [],
  description: '',
  status: 0,
  specs: [
    {
      specName: '规格',
      specValue: '',
      price: 0,
      stock: 0,
    },
  ],
})

// 表单校验规则
const rules = {
  name: [{ required: true, message: '请输入商品名称' }],
  categoryId: [{ required: true, message: '请选择商品分类' }],
  region: [{ required: true, message: '请输入商品产地' }],
  price: [
    { required: true, message: '请输入商品价格' },
    { type: 'number', min: 0.01, message: '价格必须大于0' },
  ],
  stock: [
    { required: true, message: '请输入商品库存' },
    { type: 'number', min: 0, message: '库存不能小于0' },
  ],
  mainImage: [{ required: true, message: '请上传商品封面' }],
  detailImages: [{ required: true, message: '请上传商品图片' }],
  description: [{ required: true, message: '请输入商品描述' }],
  specs: [{ required: true, message: '请添加商品规格' }],
  status: [{ required: true, message: '请选择商品状态' }],
}

// 添加规格
const addSpec = () => {
  formData.value.specs.push({
    specName: '规格',
    specValue: '',
    price: 0,
    stock: 0,
  })
}

// 删除规格
const removeSpec = (index: number) => {
  formData.value.specs.splice(index, 1)
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
    const res = await uni.$api.seller.products.getDetail(id)
    const { specs = [], ...rest } = res.data
    Object.assign(formData.value, {
      ...rest,
      specs: specs.length
        ? specs
        : [
            {
              specName: '规格',
              specValue: '',
              price: 0,
              stock: 0,
            },
          ],
    })
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
        // 更新商品
        await uni.$api.seller.products.update(id, formData.value)
        // 更新商品状态
        await uni.$api.seller.products.updateStatus(id, formData.value.status)
      } else {
        // 创建商品
        await uni.$api.seller.products.publish(formData.value)
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

  .specs-list {
    .spec-item {
      display: flex;
      gap: 20rpx;
      margin-bottom: 20rpx;
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
