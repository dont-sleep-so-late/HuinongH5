<template>
  <view class="address-edit">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="back" @click="router.back()">
        <text class="iconfont icon-arrow-left"></text>
      </text>
      <text class="title">{{ isEdit ? '编辑地址' : '新增地址' }}</text>
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
    <view class="form">
      <view class="form-item">
        <text class="label">收货人</text>
        <input
          type="text"
          v-model="formData.name"
          placeholder="请输入收货人姓名"
          placeholder-class="placeholder"
        />
      </view>

      <view class="form-item">
        <text class="label">手机号码</text>
        <input
          type="number"
          v-model="formData.phone"
          placeholder="请输入手机号码"
          placeholder-class="placeholder"
          maxlength="11"
        />
      </view>

      <view class="form-item">
        <text class="label">所在地区</text>
        <view class="region-picker" @click="showRegionPicker">
          <text v-if="formData.region">{{ formData.region }}</text>
          <text class="placeholder" v-else>请选择所在地区</text>
          <text class="iconfont icon-arrow-right"></text>
        </view>
      </view>

      <view class="form-item">
        <text class="label">详细地址</text>
        <textarea
          v-model="formData.address"
          placeholder="请输入详细地址，如街道、门牌号等"
          placeholder-class="placeholder"
          :maxlength="100"
          auto-height
        />
      </view>

      <view class="form-item switch">
        <text class="label">设为默认地址</text>
        <switch
          :checked="formData.isDefault"
          @change="(e) => (formData.isDefault = e.detail.value)"
          color="#018d71"
        />
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-btn" @click="handleSave">保存</view>

    <!-- 地区选择器 -->
    <wd-popup v-model="showRegion" position="bottom">
      <view class="region-picker-popup">
        <view class="picker-header">
          <text>选择地区</text>
          <text class="close" @click="showRegion = false">×</text>
        </view>
        <picker-view
          class="picker-view"
          :value="regionValue"
          @change="onRegionChange"
          :indicator-style="'height: 88rpx;'"
        >
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in provinces" :key="index">
              {{ item }}
            </view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in cities" :key="index">
              {{ item }}
            </view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in districts" :key="index">
              {{ item }}
            </view>
          </picker-view-column>
        </picker-view>
        <view class="picker-footer">
          <button class="confirm-btn" @click="confirmRegion">确定</button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'

const router = useRouter()
const { proxy } = getCurrentInstance()
const route = {
  query: proxy?.$page?.options || {},
}

// 编辑模式
const isEdit = ref(false)
const addressId = ref<number | null>(null)

// 表单数据
const formData = ref({
  name: '',
  phone: '',
  region: '',
  address: '',
  isDefault: false,
})

// 智能识别文本
const parseText = ref('')

// 地区选择器
const showRegion = ref(false)
const regionValue = ref([0, 0, 0])
const provinces = ref(['广东省', '浙江省', '江苏省'])
const cities = computed(() => {
  const cityMap: Record<string, string[]> = {
    广东省: ['深圳市', '广州市', '东莞市'],
    浙江省: ['杭州市', '宁波市', '温州市'],
    江苏省: ['南京市', '苏州市', '无锡市'],
  }
  return cityMap[provinces.value[regionValue.value[0]]] || []
})
const districts = computed(() => {
  const districtMap: Record<string, Record<string, string[]>> = {
    广东省: {
      深圳市: ['南山区', '福田区', '罗湖区'],
      广州市: ['天河区', '越秀区', '海珠区'],
      东莞市: ['松山湖', '长安镇', '虎门镇'],
    },
  }
  return (
    districtMap[provinces.value[regionValue.value[0]]]?.[cities.value[regionValue.value[1]]] || []
  )
})

// 获取路由参数
const onLoad = (options: Record<string, string>) => {
  const id = options.id
  if (id) {
    isEdit.value = true
    addressId.value = Number(id)
    // TODO: 获取地址详情
    const address = {
      id: 1,
      name: '张三',
      phone: '13800138000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      address: '科技园南路88号',
      isDefault: true,
    }
    formData.value = {
      name: address.name,
      phone: address.phone,
      region: `${address.province}${address.city}${address.district}`,
      address: address.address,
      isDefault: address.isDefault,
    }
  }
}

defineExpose({
  onLoad,
})

// 智能识别
const handleParseInput = () => {
  if (parseText.value.length > 0) {
    parseAddress()
  }
}

const parseAddress = () => {
  if (!parseText.value) {
    showToast('请输入或粘贴地址信息')
    return
  }

  // 解析姓名（2-4个汉字）
  const nameMatch = parseText.value.match(/[\u4e00-\u9fa5]{2,4}/)
  if (nameMatch) {
    formData.value.name = nameMatch[0]
  }

  // 解析手机号
  const phoneMatch = parseText.value.match(/1[3-9]\d{9}/)
  if (phoneMatch) {
    formData.value.phone = phoneMatch[0]
  }

  // 解析地址
  // 移除姓名和手机号
  let addressText = parseText.value
    .replace(formData.value.name, '')
    .replace(formData.value.phone, '')
    .trim()

  // 尝试匹配省市区
  const regionMatch = addressText.match(
    /([\u4e00-\u9fa5]{2,}省)?([\u4e00-\u9fa5]{2,}市)?([\u4e00-\u9fa5]{2,}[区县])?/,
  )
  if (regionMatch) {
    const [, province, city, district] = regionMatch
    if (province && city && district) {
      formData.value.region = province + city + district
      // 剩余部分作为详细地址
      addressText = addressText.replace(province, '').replace(city, '').replace(district, '').trim()
    }
  }

  // 设置详细地址
  if (addressText) {
    formData.value.address = addressText
  }

  // 清空识别文本
  parseText.value = ''
}

// 地区选择
const showRegionPicker = () => {
  showRegion.value = true
}

const onRegionChange = (e: any) => {
  regionValue.value = e.detail.value
}

const confirmRegion = () => {
  const province = provinces.value[regionValue.value[0]]
  const city = cities.value[regionValue.value[1]]
  const district = districts.value[regionValue.value[2]]
  formData.value.region = `${province}${city}${district}`
  showRegion.value = false
}

// 保存地址
const handleSave = async () => {
  // 表单验证
  if (!formData.value.name) {
    showToast('请输入收货人姓名')
    return
  }
  if (!formData.value.phone) {
    showToast('请输入手机号码')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(formData.value.phone)) {
    showToast('手机号码格式不正确')
    return
  }
  if (!formData.value.region) {
    showToast('请选择所在地区')
    return
  }
  if (!formData.value.address) {
    showToast('请输入详细地址')
    return
  }

  try {
    // TODO: 调用保存地址接口
    showToast('保存成功', { icon: 'success' })
    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error) {
    showToast('保存失败')
  }
}
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
    margin: -20rpx;
    margin-right: 0;

    .iconfont {
      font-size: 36rpx;
      color: #333;
    }
  }

  .title {
    flex: 1;
    margin-left: 32rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
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
    color: #333;
    background-color: #f8f8f8;
    border-radius: 8rpx;
  }

  .parse-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20rpx;
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

.form {
  padding: 0 20rpx;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;

  .form-item {
    display: flex;
    align-items: flex-start;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .label {
      width: 160rpx;
      font-size: 28rpx;
      color: #333;
    }

    input,
    textarea {
      flex: 1;
      font-size: 28rpx;
      color: #333;

      &.placeholder {
        color: #999;
      }
    }

    textarea {
      height: 120rpx;
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
        margin-left: 8rpx;
        font-size: 32rpx;
        color: #999;
      }
    }

    &.switch {
      justify-content: space-between;
    }
  }
}

.save-btn {
  position: fixed;
  right: 0;
  bottom: env(safe-area-inset-bottom);
  left: 0;
  height: 100rpx;
  font-size: 32rpx;
  line-height: 100rpx;
  color: #fff;
  text-align: center;
  background-color: #018d71;
}

.region-picker-popup {
  .picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 32rpx;
    background-color: #f8f8f8;

    text {
      font-size: 32rpx;
      color: #333;
    }

    .close {
      padding: 20rpx;
      margin: -20rpx;
      font-size: 40rpx;
      color: #999;
    }
  }

  .picker-view {
    height: 480rpx;
    background-color: #fff;

    .picker-item {
      font-size: 28rpx;
      line-height: 88rpx;
      color: #333;
      text-align: center;
    }
  }

  .picker-footer {
    padding: 20rpx 32rpx;
    background-color: #fff;

    .confirm-btn {
      height: 88rpx;
      font-size: 32rpx;
      line-height: 88rpx;
      color: #fff;
      text-align: center;
      background-color: #018d71;
      border-radius: 44rpx;
    }
  }
}
</style>
