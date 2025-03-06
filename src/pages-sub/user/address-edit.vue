# 创建地址编辑页面
<template>
  <view class="address-edit">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="back" @click="router.back()">
        <text class="iconfont icon-arrow-left"></text>
      </text>
      <text class="title">{{ isEdit ? '编辑地址' : '新增地址' }}</text>
    </view>

    <!-- 智能识别输入框 -->
    <view class="smart-input">
      <textarea
        class="input-area"
        v-model="smartText"
        placeholder="请输入或粘贴收货信息，如：张三 13812345678 北京市朝阳区三里屯街道1号楼"
        :maxlength="200"
      />
      <view class="btn-group">
        <button class="smart-btn paste" @click="handlePaste">粘贴</button>
        <button class="smart-btn parse" @click="handleParse">识别</button>
      </view>
    </view>

    <!-- 表单 -->
    <view class="form">
      <view class="form-item">
        <text class="label">收货人</text>
        <input
          class="input"
          type="text"
          v-model="form.name"
          placeholder="请输入收货人姓名"
          maxlength="20"
        />
      </view>
      <view class="form-item">
        <text class="label">手机号码</text>
        <input
          class="input"
          type="number"
          v-model="form.phone"
          placeholder="请输入手机号码"
          maxlength="11"
        />
      </view>
      <view class="form-item">
        <text class="label">所在地区</text>
        <picker
          mode="multiSelector"
          :range="areaRange"
          :value="areaIndex"
          @change="handleAreaChange"
          @columnchange="handleAreaColumnChange"
        >
          <view class="region-picker">
            <text v-if="form.province && form.city && form.district">
              {{ form.province }}{{ form.city }}{{ form.district }}
            </text>
            <text v-else class="placeholder">请选择所在地区</text>
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </picker>
      </view>
      <view class="form-item">
        <text class="label">详细地址</text>
        <textarea
          class="textarea"
          v-model="form.detail"
          placeholder="请输入详细地址，如街道、门牌号等"
          maxlength="100"
        />
      </view>
      <view class="form-item switch">
        <text class="label">设为默认地址</text>
        <view class="switch-wrapper">
          <switch :checked="form.isDefault" @change="handleSwitchChange" color="#018d71" />
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-btn" @click="handleSave">保存</view>

    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import { createAddress, updateAddress, getAddressDetail } from '@/api/address'
import type { AddressFormData } from '@/api/address'
import areaData from '@/utils/area-data'
import type { AreaItem } from '@/utils/area-data'

const router = useRouter()

// 是否为编辑模式
const isEdit = ref(false)

// 表单数据
const form = ref<AddressFormData>({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
})

// 地址ID
const addressId = ref<number>()

// 地区选择器数据
const provinces = areaData.map((item: AreaItem) => item.name)
const cities = ref<string[]>([])
const districts = ref<string[]>([])

const areaRange = ref([provinces, [], []])
const areaIndex = ref([0, 0, 0])

// 智能识别文本
const smartText = ref('')

// 初始化城市数据
const initCities = (provinceIndex: number) => {
  const province = areaData[provinceIndex]
  if (province?.children) {
    cities.value = province.children.map((item: AreaItem) => item.name)
    areaRange.value[1] = cities.value
    initDistricts(provinceIndex, 0)
  }
}

// 初始化区县数据
const initDistricts = (provinceIndex: number, cityIndex: number) => {
  const province = areaData[provinceIndex]
  const city = province?.children?.[cityIndex]
  if (city?.children) {
    districts.value = city.children.map((item: AreaItem) => item.name)
    areaRange.value[2] = districts.value
  }
}

// 处理地区选择器列变化
const handleAreaColumnChange = (e: { detail: { column: number; value: number } }) => {
  const { column, value } = e.detail
  if (column === 0) {
    areaIndex.value[0] = value
    areaIndex.value[1] = 0
    areaIndex.value[2] = 0
    initCities(value)
  } else if (column === 1) {
    areaIndex.value[1] = value
    areaIndex.value[2] = 0
    initDistricts(areaIndex.value[0], value)
  }
}

// 处理地区选择器确认
const handleAreaChange = (e: { detail: { value: number[] } }) => {
  const [provinceIndex, cityIndex, districtIndex] = e.detail.value
  form.value.province = provinces[provinceIndex]
  form.value.city = cities.value[cityIndex]
  form.value.district = districts.value[districtIndex]
}

// 处理开关切换
const handleSwitchChange = (e: { detail: { value: boolean } }) => {
  form.value.isDefault = e.detail.value
}

// 智能识别地址信息
const parseAddressInfo = (text: string) => {
  // 匹配手机号
  const phoneMatch = text.match(/1[3-9]\d{9}/)
  if (phoneMatch) {
    form.value.phone = phoneMatch[0]
  }

  // 匹配姓名（假设姓名在手机号前后10个字符内，2-4个汉字）
  const nameMatch = text.match(
    /[\u4e00-\u9fa5]{2,4}(?=.{0,10}1[3-9]\d{9})|(?<=1[3-9]\d{9}.{0,10})[\u4e00-\u9fa5]{2,4}/,
  )
  if (nameMatch) {
    form.value.name = nameMatch[0]
  }

  // 匹配省市区
  for (let i = 0; i < areaData.length; i++) {
    const province = areaData[i]
    if (text.includes(province.name)) {
      form.value.province = province.name
      areaIndex.value[0] = i
      initCities(i)

      const cities = province.children || []
      for (let j = 0; j < cities.length; j++) {
        const city = cities[j]
        if (text.includes(city.name)) {
          form.value.city = city.name
          areaIndex.value[1] = j
          initDistricts(i, j)

          const districts = city.children || []
          for (let k = 0; k < districts.length; k++) {
            const district = districts[k]
            if (text.includes(district.name)) {
              form.value.district = district.name
              areaIndex.value[2] = k
              break
            }
          }
          break
        }
      }
      break
    }
  }

  // 提取详细地址（去除已匹配的省市区和收件人信息）
  let detail = text
  if (form.value.province) detail = detail.replace(form.value.province, '')
  if (form.value.city) detail = detail.replace(form.value.city, '')
  if (form.value.district) detail = detail.replace(form.value.district, '')
  if (form.value.name) detail = detail.replace(form.value.name, '')
  if (form.value.phone) detail = detail.replace(form.value.phone, '')

  // 清理特殊字符和多余空格
  detail = detail.replace(/[，。；：、？！,.;?!]/g, '').trim()
  if (detail) {
    form.value.detail = detail
  }
}

// 处理手动识别
const handleParse = () => {
  if (!smartText.value) {
    showToast('请输入或粘贴收货信息')
    return
  }
  parseAddressInfo(smartText.value)
  showToast('识别成功')
}

// 处理粘贴
const handlePaste = async () => {
  try {
    const text = await uni.getClipboardData()
    if (text) {
      smartText.value = text.data
      parseAddressInfo(text.data)
      showToast('识别成功')
    }
  } catch (error) {
    showToast('获取剪贴板内容失败')
  }
}

// 表单验证
const validateForm = () => {
  if (!form.value.name) {
    showToast('请输入收货人姓名')
    return false
  }
  if (!form.value.phone) {
    showToast('请输入手机号码')
    return false
  }
  if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    showToast('请输入正确的手机号码')
    return false
  }
  if (!form.value.province || !form.value.city || !form.value.district) {
    showToast('请选择所在地区')
    return false
  }
  if (!form.value.detail) {
    showToast('请输入详细地址')
    return false
  }
  return true
}

// 保存地址
const handleSave = async () => {
  if (!validateForm()) return

  try {
    if (isEdit.value && addressId.value) {
      const res = await updateAddress(addressId.value, form.value)
      if (res.code === 200) {
        showToast('修改成功')
        // 发送刷新事件
        uni.$emit('addressListChanged')
        setTimeout(() => {
          router.back()
        }, 500)
      }
    } else {
      const res = await createAddress(form.value)
      if (res.code === 200) {
        showToast('添加成功')
        // 发送刷新事件
        uni.$emit('addressListChanged')
        setTimeout(() => {
          router.back()
        }, 500)
      }
    }
  } catch (error: any) {
    showToast(error.message || (isEdit.value ? '修改失败' : '添加失败'))
  }
}

// 获取地址详情
const loadAddressDetail = async (id: number) => {
  try {
    const { data } = await getAddressDetail(id)
    if (data?.data) {
      const { name, phone, province, city, district, detail, isDefault } = data.data
      form.value = {
        name,
        phone,
        province,
        city,
        district,
        detail,
        isDefault,
      }

      // 设置地区选择器的初始值
      const provinceIndex = provinces.findIndex((p: string) => p === province)
      if (provinceIndex !== -1) {
        areaIndex.value[0] = provinceIndex
        initCities(provinceIndex)

        const cityIndex = cities.value.findIndex((c: string) => c === city)
        if (cityIndex !== -1) {
          areaIndex.value[1] = cityIndex
          initDistricts(provinceIndex, cityIndex)

          const districtIndex = districts.value.findIndex((d: string) => d === district)
          if (districtIndex !== -1) {
            areaIndex.value[2] = districtIndex
          }
        }
      }
    }
  } catch (error: any) {
    showToast(error.message || '获取地址详情失败')
  }
}

onMounted(() => {
  // 初始化地区数据
  initCities(0)

  // 获取路由参数
  const query = router.getQuery()
  if (query.id) {
    isEdit.value = true
    addressId.value = Number(query.id)
    loadAddressDetail(addressId.value)
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

.smart-input {
  padding: 20rpx;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 8rpx;

  .input-area {
    width: 100%;
    height: 160rpx;
    padding: 20rpx;
    font-size: 28rpx;
    color: #333;
    background-color: #f8f8f8;
    border-radius: 8rpx;
  }

  .btn-group {
    display: flex;
    gap: 20rpx;
    margin-top: 20rpx;

    .smart-btn {
      flex: 1;
      height: 80rpx;
      margin: 0;
      font-size: 28rpx;
      line-height: 80rpx;
      color: #fff;
      border: none;
      border-radius: 8rpx;

      &::after {
        display: none;
      }

      &.paste {
        background-color: #018d71;
      }

      &.parse {
        background-color: #ff6b6b;
      }
    }
  }
}

.form {
  margin-top: 20rpx;
  background-color: #fff;

  .form-item {
    display: flex;
    align-items: flex-start;
    padding: 32rpx;
    border-bottom: 2rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .label {
      width: 160rpx;
      margin-top: 4rpx;
      font-size: 28rpx;
      color: #333;
    }

    .input {
      flex: 1;
      height: 44rpx;
      font-size: 28rpx;
      color: #333;
    }

    .textarea {
      flex: 1;
      height: 160rpx;
      font-size: 28rpx;
      color: #333;
    }

    .region-picker {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: space-between;
      font-size: 28rpx;
      color: #333;

      .placeholder {
        color: #999;
      }

      .iconfont {
        margin-left: 12rpx;
        font-size: 32rpx;
        color: #999;
      }
    }

    &.switch {
      align-items: center;

      .switch-wrapper {
        flex: 1;
      }
    }
  }
}

.save-btn {
  position: fixed;
  right: 0;
  bottom: env(safe-area-inset-bottom);
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100rpx;
  font-size: 32rpx;
  color: #fff;
  background-color: #018d71;
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom);
}
</style>
