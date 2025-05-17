<template>
  <view class="after-sale-apply">
    <!-- 商品信息 -->
    <view class="card">
      <view class="card-title">商品信息</view>
      <view class="goods-info" v-for="item in detail.orderItems" :key="item.productId">
        <image class="goods-image" :src="item.productImage" mode="aspectFill" />
        <view class="goods-detail">
          <text class="goods-name">{{ item.productName }}</text>
          <text class="goods-spec" v-if="item.specName || item.specValue">
            {{ item.specName }} {{ item.specValue }}
          </text>
          <view class="goods-price-info">
            <text class="goods-price">¥{{ item.price }}</text>
            <text class="goods-quantity">x{{ item.quantity }}</text>
          </view>
        </view>
      </view>
      <view class="order-amount">
        <text>订单实付金额：</text>
        <text class="amount">¥{{ detail.payableAmount }}</text>
      </view>
    </view>

    <!-- 申请表单 -->
    <view class="card">
      <view class="card-title">申请信息</view>
      <view class="form">
        <view class="form-item">
          <text class="label required">申请原因</text>
          <view class="input-wrapper" @click="showReasonPicker = true">
            <text class="value" :class="{ placeholder: !form.reason }">
              {{ form.reason || '请选择申请原因' }}
            </text>
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>

        <view class="form-item">
          <text class="label required">退款金额</text>
          <view class="input-wrapper">
            <input
              type="digit"
              v-model="form.refundAmount"
              class="input"
              placeholder="请输入退款金额"
              :max="detail.payableAmount"
            />
            <text class="unit">元</text>
          </view>
        </view>

        <view class="form-item">
          <text class="label">申请说明</text>
          <view class="textarea-wrapper">
            <textarea
              v-model="form.description"
              class="textarea"
              placeholder="请输入申请说明（选填）"
              :maxlength="200"
            />
            <text class="word-count">{{ (form.description || '').length }}/200</text>
          </view>
        </view>

        <view class="form-item">
          <text class="label">凭证图片</text>
          <view class="upload-list">
            <view v-for="(image, index) in form.images" :key="index" class="upload-item">
              <image :src="image" mode="aspectFill" class="preview-image" />
              <text class="delete-btn" @click="handleDeleteImage(index)">×</text>
            </view>
            <view
              v-if="(form.images || []).length < 6"
              class="upload-item upload-btn"
              @click="chooseImage"
            >
              <text class="iconfont icon-camera"></text>
              <text class="upload-text">上传图片</text>
            </view>
          </view>
          <text class="upload-tip">最多上传6张图片</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="footer">
      <wd-button type="primary" size="large" :loading="submitting" @click="submit">
        提交申请
      </wd-button>
    </view>

    <!-- 原因选择器 -->
    <wd-action-sheet
      v-model="showReasonPicker"
      :actions="reasonOptions"
      title="选择申请原因"
      @select="handleSelectReason"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import { getOrderDetail } from '@/api/order'
import { applyRefund, type RefundApplyRequest } from '@/api/refund'

const router = useRouter()
const detail = ref<any>({})
const submitting = ref(false)
const showReasonPicker = ref(false)

// 表单数据
const form = reactive<RefundApplyRequest>({
  orderId: 0,
  refundAmount: 0,
  reason: '',
  description: '',
  images: [],
})

// 原因选项
const reasonOptions = [
  { name: '商品质量问题', value: '商品质量问题' },
  { name: '商品与描述不符', value: '商品与描述不符' },
  { name: '商品损坏', value: '商品损坏' },
  { name: '商品缺少配件', value: '商品缺少配件' },
  { name: '发货太慢', value: '发货太慢' },
  { name: '不想要了', value: '不想要了' },
  { name: '其他', value: '其他' },
]

// 获取订单详情
const getDetail = async () => {
  try {
    const { orderId } = router.query()
    if (!orderId) {
      showToast('参数错误')
      return
    }
    const res = await getOrderDetail(Number(orderId))
    if (res.code === 200 && res.data) {
      detail.value = res.data
      // 设置默认退款金额
      form.orderId = Number(orderId)
      form.refundAmount = detail.value.payableAmount
    }
  } catch (error: any) {
    showToast(error.message || '获取数据失败')
  }
}

// 选择原因
const handleSelectReason = (item: any) => {
  console.log('选择原因：', item)
  form.reason = item.item.name // 修改这里，使用 item.name 而不是 item.value
  showReasonPicker.value = false
}

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 6 - (form.images?.length || 0),
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      // 这里应该先上传图片到服务器，获取URL后再添加到form.images
      // 暂时直接使用本地临时路径
      if (!form.images) {
        form.images = []
      }
      form.images.push(...res.tempFilePaths)
    },
    fail: () => {
      showToast('选择图片失败')
    },
  })
}

// 删除图片
const handleDeleteImage = (index: number) => {
  if (form.images) {
    form.images.splice(index, 1)
  }
}

// 表单验证
const validate = () => {
  if (!form.reason) {
    showToast('请选择申请原因')
    return false
  }
  if (!form.refundAmount) {
    showToast('请输入退款金额')
    return false
  }
  const amount = Number(form.refundAmount)
  if (isNaN(amount) || amount <= 0 || amount > detail.value.payableAmount) {
    showToast('退款金额不能超过实付金额')
    return false
  }
  return true
}

// 提交申请
const submit = async () => {
  if (!validate()) return
  try {
    submitting.value = true
    const res = await applyRefund({
      ...form,
      refundAmount: Number(form.refundAmount),
    })
    if (res.code === 200) {
      showToast('申请成功')
      // 返回列表页
      router.navigate('/pages-sub/order/after-sale/list')
    }
  } catch (error: any) {
    showToast(error.message || '申请失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  getDetail()
})
</script>

<style lang="scss">
.after-sale-apply {
  min-height: 100vh;
  padding-bottom: 120rpx;
  background-color: #f8f8f8;

  .card {
    padding: 20rpx;
    margin: 20rpx;
    background-color: #fff;
    border-radius: 12rpx;

    .card-title {
      margin-bottom: 20rpx;
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }

    .goods-info {
      display: flex;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .goods-image {
        width: 160rpx;
        height: 160rpx;
        margin-right: 20rpx;
        border-radius: 8rpx;
      }

      .goods-detail {
        display: flex;
        flex: 1;
        flex-direction: column;

        .goods-name {
          margin-bottom: 8rpx;
          font-size: 28rpx;
          color: #333;
        }

        .goods-spec {
          margin-bottom: 8rpx;
          font-size: 24rpx;
          color: #999;
        }

        .goods-price-info {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .goods-price {
            font-size: 32rpx;
            font-weight: bold;
            color: #ff4d4f;
          }

          .goods-quantity {
            font-size: 24rpx;
            color: #999;
          }
        }
      }
    }

    .order-amount {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 20rpx 0;
      font-size: 28rpx;
      color: #666;

      .amount {
        margin-left: 10rpx;
        font-size: 32rpx;
        font-weight: bold;
        color: #ff4d4f;
      }
    }

    .form {
      .form-item {
        margin-bottom: 30rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          display: block;
          margin-bottom: 16rpx;
          font-size: 28rpx;
          color: #333;

          &.required::before {
            margin-right: 4rpx;
            color: #ff4d4f;
            content: '*';
          }
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          padding: 20rpx;
          background-color: #f8f8f8;
          border-radius: 8rpx;

          .value {
            flex: 1;
            font-size: 28rpx;
            color: #333;

            &.placeholder {
              color: #999;
            }
          }

          .input {
            flex: 1;
            height: 40rpx;
            font-size: 28rpx;
            color: #333;
          }

          .unit {
            margin-left: 10rpx;
            font-size: 28rpx;
            color: #666;
          }

          .iconfont {
            font-size: 32rpx;
            color: #999;
          }
        }

        .textarea-wrapper {
          position: relative;
          padding: 20rpx;
          background-color: #f8f8f8;
          border-radius: 8rpx;

          .textarea {
            width: 100%;
            height: 200rpx;
            font-size: 28rpx;
            color: #333;
          }

          .word-count {
            position: absolute;
            right: 20rpx;
            bottom: 20rpx;
            font-size: 24rpx;
            color: #999;
          }
        }

        .upload-list {
          display: flex;
          flex-wrap: wrap;
          gap: 20rpx;

          .upload-item {
            position: relative;
            width: 200rpx;
            height: 200rpx;
            overflow: hidden;
            background-color: #f8f8f8;
            border-radius: 8rpx;

            .preview-image {
              width: 100%;
              height: 100%;
            }

            .delete-btn {
              position: absolute;
              top: 0;
              right: 0;
              width: 40rpx;
              height: 40rpx;
              font-size: 32rpx;
              line-height: 40rpx;
              color: #fff;
              text-align: center;
              background-color: rgba(0, 0, 0, 0.5);
            }

            &.upload-btn {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border: 1rpx dashed #ddd;

              .iconfont {
                font-size: 48rpx;
                color: #999;
              }

              .upload-text {
                margin-top: 10rpx;
                font-size: 24rpx;
                color: #999;
              }
            }
          }
        }

        .upload-tip {
          margin-top: 16rpx;
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }

  .footer {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 20rpx;
    background-color: #fff;
    box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  }
}
</style>
