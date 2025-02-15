<template>
  <view class="review-page">
    <!-- 商品信息 -->
    <view class="goods-section">
      <view class="shop-info">
        <image :src="shopInfo.avatar" mode="aspectFill" class="shop-avatar" />
        <text class="shop-name">{{ shopInfo.name }}</text>
      </view>
      <view class="goods-list">
        <view v-for="goods in goodsList" :key="goods.id" class="goods-item">
          <image :src="goods.image" mode="aspectFill" class="goods-image" />
          <view class="goods-info">
            <text class="goods-name">{{ goods.name }}</text>
            <text class="goods-spec">{{ goods.spec }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 评分区域 -->
    <view class="rating-section">
      <view class="rating-item">
        <text class="label">商品评分</text>
        <wd-rate v-model="form.goodsRating" size="24" color="#ff6b6b" />
      </view>
      <view class="rating-item">
        <text class="label">物流评分</text>
        <wd-rate v-model="form.logisticsRating" size="24" color="#ff6b6b" />
      </view>
      <view class="rating-item">
        <text class="label">服务评分</text>
        <wd-rate v-model="form.serviceRating" size="24" color="#ff6b6b" />
      </view>
    </view>

    <!-- 评价内容 -->
    <view class="content-section">
      <wd-textarea
        v-model="form.content"
        placeholder="宝贝满足你的期待吗？说说它的优点和美中不足的地方吧"
        :maxlength="500"
        :rows="4"
        show-count
      />
    </view>

    <!-- 图片上传 -->
    <view class="upload-section">
      <view class="section-title">
        <text>添加图片</text>
        <text class="upload-tip">{{ form.images.length }}/9</text>
      </view>
      <view class="upload-list">
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
          <text class="iconfont icon-camera"></text>
          <text class="text">上传图片</text>
        </view>
      </view>
    </view>

    <!-- 匿名评价 -->
    <view class="anonymous-section">
      <text>匿名评价</text>
      <wd-switch v-model="form.isAnonymous" />
    </view>

    <!-- 提交按钮 -->
    <view class="submit-btn">
      <wd-button block type="primary" :loading="loading" @click="handleSubmit">提交评价</wd-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'

const router = useRouter()
const loading = ref(false)

// 店铺信息
const shopInfo = ref({
  id: 1,
  name: '绿色有机农场',
  avatar: '/static/shop/avatar.png',
})

// 商品列表
const goodsList = ref([
  {
    id: 1,
    name: '有机大米',
    spec: '5kg装',
    image: '/static/goods/rice.jpg',
  },
])

// 表单数据
const form = reactive({
  goodsRating: 5,
  logisticsRating: 5,
  serviceRating: 5,
  content: '',
  images: [],
  isAnonymous: false,
})

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 9 - form.images.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
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

// 表单验证
const validateForm = () => {
  if (form.goodsRating === 0) {
    showToast('请对商品进行评分')
    return false
  }
  if (form.logisticsRating === 0) {
    showToast('请对物流进行评分')
    return false
  }
  if (form.serviceRating === 0) {
    showToast('请对服务进行评分')
    return false
  }
  if (!form.content.trim()) {
    showToast('请填写评价内容')
    return false
  }
  return true
}

// 提交评价
const handleSubmit = async () => {
  if (!validateForm()) return
  if (loading.value) return

  try {
    loading.value = true
    // TODO: 调用提交评价接口
    await new Promise((resolve) => setTimeout(resolve, 1000))
    showToast('评价成功', { icon: 'success' })
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error) {
    showToast('评价失败，请重试')
  } finally {
    loading.value = false
  }
}

// 获取订单信息
const getOrderInfo = async (id: string) => {
  try {
    // TODO: 调用获取订单信息接口
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // 模拟数据已在 shopInfo 和 goodsList 中
  } catch (error) {
    showToast('获取订单信息失败')
  }
}

onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const { id } = currentPage?.options || {}
  if (id) {
    getOrderInfo(id)
  }
})
</script>

<style lang="scss">
.review-page {
  min-height: 100vh;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  background-color: #f8f8f8;
}

.goods-section {
  padding: 30rpx;
  margin-bottom: 20rpx;
  background-color: #fff;

  .shop-info {
    display: flex;
    align-items: center;
    padding-bottom: 20rpx;
    margin-bottom: 20rpx;
    border-bottom: 1rpx solid #eee;

    .shop-avatar {
      width: 60rpx;
      height: 60rpx;
      margin-right: 16rpx;
      border-radius: 50%;
    }

    .shop-name {
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
    }
  }

  .goods-list {
    .goods-item {
      display: flex;
      align-items: center;

      .goods-image {
        width: 120rpx;
        height: 120rpx;
        margin-right: 20rpx;
        border-radius: 8rpx;
      }

      .goods-info {
        flex: 1;

        .goods-name {
          display: block;
          margin-bottom: 8rpx;
          font-size: 28rpx;
          color: #333;
        }

        .goods-spec {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
}

.rating-section {
  padding: 30rpx;
  margin-bottom: 20rpx;
  background-color: #fff;

  .rating-item {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      width: 140rpx;
      font-size: 28rpx;
      color: #333;
    }
  }
}

.content-section {
  padding: 30rpx;
  margin-bottom: 20rpx;
  background-color: #fff;
}

.upload-section {
  padding: 30rpx;
  margin-bottom: 20rpx;
  background-color: #fff;

  .section-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20rpx;

    text {
      font-size: 28rpx;
      color: #333;
    }

    .upload-tip {
      font-size: 24rpx;
      color: #999;
    }
  }

  .upload-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;

    .image-item,
    .upload-btn {
      position: relative;
      width: 200rpx;
      height: 200rpx;
      overflow: hidden;
      border-radius: 8rpx;
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
}

.anonymous-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  margin-bottom: 20rpx;
  background-color: #fff;

  text {
    font-size: 28rpx;
    color: #333;
  }
}

.submit-btn {
  position: fixed;
  right: 0;
  bottom: env(safe-area-inset-bottom);
  left: 0;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}
</style>
