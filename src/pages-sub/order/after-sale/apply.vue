<template>
  <view class="after-sale-apply">
    <!-- 商品信息 -->
    <view class="card">
      <view class="card-title">商品信息</view>
      <view class="goods-info">
        <image class="goods-image" :src="detail.goodsImage" mode="aspectFill" />
        <view class="goods-detail">
          <text class="goods-name">{{ detail.goodsName }}</text>
          <text class="goods-spec">{{ detail.goodsSpec }}</text>
          <text class="goods-price">¥{{ detail.goodsPrice }}</text>
        </view>
      </view>
    </view>

    <!-- 申请表单 -->
    <view class="card">
      <view class="card-title">申请信息</view>
      <view class="form">
        <wd-cell-group>
          <wd-cell title="售后类型" required>
            <template #right>
              <wd-radio-group v-model="form.type">
                <wd-radio value="refund">仅退款</wd-radio>
                <wd-radio value="return">退货退款</wd-radio>
              </wd-radio-group>
            </template>
          </wd-cell>
          <wd-cell title="申请原因" required is-link @click="showReasonPicker = true">
            <template #right>
              <text class="placeholder" v-if="!form.reason">请选择</text>
              <text v-else>{{ form.reason }}</text>
            </template>
          </wd-cell>
          <wd-cell title="退款金额" required>
            <template #right>
              <wd-input
                v-model="form.refundAmount"
                type="number"
                placeholder="请输入退款金额"
                :max="detail.goodsPrice"
              />
            </template>
          </wd-cell>
          <wd-cell title="申请说明">
            <template #right>
              <wd-textarea
                v-model="form.description"
                placeholder="请输入申请说明（选填）"
                :maxlength="200"
                show-count
              />
            </template>
          </wd-cell>
          <wd-cell title="凭证图片">
            <template #right>
              <wd-upload-img
                v-model="form.images"
                :max-count="6"
                :size-type="['compressed']"
                @delete="handleDeleteImage"
                @oversize="handleOversize"
              />
            </template>
          </wd-cell>
        </wd-cell-group>
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
import { getOrderDetail, applyAfterSale } from '@/api/order'

const router = useRouter()
const detail = ref<any>({})
const submitting = ref(false)
const showReasonPicker = ref(false)

// 表单数据
const form = reactive({
  type: 'refund',
  reason: '',
  refundAmount: '',
  description: '',
  images: [] as string[],
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
    if (res.code === 200) {
      detail.value = res.data
      // 设置默认退款金额
      form.refundAmount = detail.value.goodsPrice
    }
  } catch (error: any) {
    showToast(error.message || '获取数据失败')
  }
}

// 选择原因
const handleSelectReason = (item: any) => {
  form.reason = item.value
}

// 删除图片
const handleDeleteImage = (index: number) => {
  form.images.splice(index, 1)
}

// 图片超出大小限制
const handleOversize = () => {
  showToast('图片大小不能超过5MB')
}

// 表单验证
const validate = () => {
  if (!form.type) {
    showToast('请选择售后类型')
    return false
  }
  if (!form.reason) {
    showToast('请选择申请原因')
    return false
  }
  if (!form.refundAmount) {
    showToast('请输入退款金额')
    return false
  }
  const amount = Number(form.refundAmount)
  if (isNaN(amount) || amount <= 0 || amount > detail.value.goodsPrice) {
    showToast('退款金额不正确')
    return false
  }
  return true
}

// 提交申请
const submit = async () => {
  if (!validate()) return
  try {
    submitting.value = true
    const res = await applyAfterSale({
      orderId: detail.value.id,
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

        .goods-price {
          font-size: 32rpx;
          font-weight: bold;
          color: #ff4d4f;
        }
      }
    }

    .form {
      .placeholder {
        color: #999;
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
