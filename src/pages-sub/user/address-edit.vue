<template>
  <view class="address-edit">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="back" @click="router.back()">
        <text class="iconfont icon-arrow-left"></text>
      </text>
      <text class="title">{{ id ? '编辑地址' : '新增地址' }}</text>
    </view>

    <!-- 智能识别 -->
    <view class="smart-parse">
      <textarea
        class="parse-input"
        v-model="parseText"
        placeholder="粘贴整段地址信息，自动识别姓名、电话和地址"
        :maxlength="500"
        @input="handleParseInput"
      />
      <view class="parse-btn" @click="parseAddress">
        <text class="iconfont icon-parse"></text>
        <text>智能识别</text>
      </view>
    </view>

    <!-- 表单 -->
    <wd-form :model="form" :rules="rules" ref="formRef">
      <wd-form-item label="收货人" prop="receiverName">
        <wd-input v-model="form.receiverName" placeholder="请输入收货人姓名" maxlength="20" />
      </wd-form-item>

      <wd-form-item label="手机号码" prop="receiverPhone">
        <wd-input
          v-model="form.receiverPhone"
          type="number"
          placeholder="请输入手机号码"
          maxlength="11"
        />
      </wd-form-item>

      <wd-form-item label="所在地区" prop="region">
        <view class="region" @click="handleRegionClick">
          <text v-if="form.province" class="region-text">
            {{ form.province }}{{ form.city }}{{ form.district }}
          </text>
          <text v-else class="placeholder">请选择所在地区</text>
          <text class="iconfont icon-arrow-right"></text>
        </view>
      </wd-form-item>

      <wd-form-item label="详细地址" prop="detailAddress">
        <wd-textarea
          v-model="form.detailAddress"
          placeholder="请输入详细地址，如街道、门牌号等"
          maxlength="100"
          show-count
        />
      </wd-form-item>

      <wd-form-item label="设为默认">
        <wd-switch v-model="form.isDefault" />
      </wd-form-item>
    </wd-form>

    <!-- 保存按钮 -->
    <view class="bottom-buttons">
      <wd-button type="info" block @click="router.back()">取消</wd-button>
      <wd-button type="primary" block @click="handleSave">保存</wd-button>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import type { AddressFormData } from '@/types/address'
import { addressRules } from '@/types/address'
import { addressService } from '@/services/address'

const router = useRouter()

// 表单ref
const formRef = ref()

// 地址ID
const id = ref<number>()

// 表单数据
const form = ref<AddressFormData>({
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  isDefault: false,
})

// 表单校验规则
const rules = addressRules

// 智能识别文本
const parseText = ref('')

// 智能识别
const handleParseInput = () => {
  if (parseText.value.length > 0) {
    parseAddress()
  }
}

const parseAddress = () => {
  if (!parseText.value) {
    uni.showToast({
      title: '请输入或粘贴地址信息',
      icon: 'none',
    })
    return
  }

  // 解析姓名（2-4个汉字）
  const nameMatch = parseText.value.match(/[\u4e00-\u9fa5]{2,4}/)
  if (nameMatch) {
    form.value.receiverName = nameMatch[0]
  }

  // 解析手机号
  const phoneMatch = parseText.value.match(/1[3-9]\d{9}/)
  if (phoneMatch) {
    form.value.receiverPhone = phoneMatch[0]
  }

  // 解析地址
  // 移除姓名和手机号
  let addressText = parseText.value
    .replace(form.value.receiverName, '')
    .replace(form.value.receiverPhone, '')
    .trim()

  // 尝试匹配省市区
  const regionMatch = addressText.match(
    /([\u4e00-\u9fa5]{2,}省)?([\u4e00-\u9fa5]{2,}市)?([\u4e00-\u9fa5]{2,}[区县])?/,
  )
  if (regionMatch) {
    const [, province, city, district] = regionMatch
    if (province && city && district) {
      form.value.province = province
      form.value.city = city
      form.value.district = district
      // 剩余部分作为详细地址
      addressText = addressText.replace(province, '').replace(city, '').replace(district, '').trim()
    }
  }

  // 设置详细地址
  if (addressText) {
    form.value.detailAddress = addressText
  }

  // 清空识别文本
  parseText.value = ''
}

// 选择地区
const handleRegionClick = () => {
  uni.navigateTo({
    url: '/pages-sub/common/region-picker',
    events: {
      // 选择地区回调
      regionSelected: (region: { province: string; city: string; district: string }) => {
        form.value.province = region.province
        form.value.city = region.city
        form.value.district = region.district
      },
    },
  })
}

// 获取地址详情
const loadAddressDetail = async () => {
  try {
    const { data } = await addressService.getDetail(id.value!)
    Object.assign(form.value, {
      receiverName: data.receiverName,
      receiverPhone: data.receiverPhone,
      province: data.province,
      city: data.city,
      district: data.district,
      detailAddress: data.detailAddress,
      isDefault: data.isDefault,
    })
  } catch (error: any) {
    uni.showToast({
      title: error.message || '获取地址详情失败',
      icon: 'none',
    })
  }
}

// 保存地址
const handleSave = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return

    try {
      if (id.value) {
        await addressService.update(id.value, form.value)
      } else {
        await addressService.create(form.value)
      }

      uni.showToast({
        title: '保存成功',
        icon: 'success',
      })

      setTimeout(() => {
        router.back()
      }, 1500)
    } catch (error: any) {
      uni.showToast({
        title: error.message || '保存失败',
        icon: 'none',
      })
    }
  })
}

onMounted(() => {
  // 获取路由参数
  const query = router.getQuery()
  if (query.id) {
    id.value = Number(query.id)
    loadAddressDetail()
  }
})
</script>

<style lang="scss">
.address-edit {
  min-height: 100vh;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  background-color: #f8f8f8;
}

.nav-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 32rpx;
  background: linear-gradient(to bottom, #fff, rgba(255, 255, 255, 0.98));
  backdrop-filter: blur(10px);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .back {
    padding: 20rpx;
    margin-left: -20rpx;
    font-size: 36rpx;
    color: #333;
  }

  .title {
    flex: 1;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
  }
}

.smart-parse {
  padding: 20rpx;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;

  .parse-input {
    width: 100%;
    height: 160rpx;
    padding: 20rpx;
    font-size: 28rpx;
    line-height: 1.5;
    background-color: #f8f8f8;
    border-radius: 8rpx;
  }

  .parse-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80rpx;
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #018d71;
    background-color: rgba(1, 141, 113, 0.1);
    border-radius: 8rpx;

    .iconfont {
      margin-right: 8rpx;
      font-size: 32rpx;
    }
  }
}

.region {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
  font-size: 28rpx;
  background-color: #fff;
  border-radius: 8rpx;

  .region-text {
    color: #333;
  }

  .placeholder {
    color: #999;
  }

  .iconfont {
    font-size: 32rpx;
    color: #999;
  }
}

.bottom-buttons {
  position: fixed;
  right: 0;
  bottom: env(safe-area-inset-bottom);
  left: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom);
}
</style>
