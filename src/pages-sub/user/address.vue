<template>
  <view class="address">
    <!-- 地址列表 -->
    <view class="address-list" v-if="addressList.length">
      <view class="address-item" v-for="(item, index) in addressList" :key="index">
        <view class="info" @tap="selectAddress(item)">
          <view class="user">
            <text class="name">{{ item.name }}</text>
            <text class="phone">{{ item.phone }}</text>
            <text class="tag" v-if="item.isDefault">默认</text>
          </view>
          <view class="detail">
            {{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}
          </view>
        </view>
        <view class="actions">
          <view class="action-item" @tap="setDefault(index)" v-if="!item.isDefault">
            <text class="icon">⭐</text>
            <text>设为默认</text>
          </view>
          <view class="action-item" @tap="editAddress(item)">
            <text class="icon">✏️</text>
            <text>编辑</text>
          </view>
          <view class="action-item" @tap="deleteAddress(index)">
            <text class="icon">🗑️</text>
            <text>删除</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty" v-else>
      <image src="/static/address/empty.png" mode="aspectFit" />
      <text>暂无收货地址</text>
    </view>

    <!-- 新增地址按钮 -->
    <view class="add-btn" @tap="showAddressForm">
      <text>新增收货地址</text>
    </view>

    <!-- 地址表单弹窗 -->
    <wd-popup v-model="showForm" position="bottom">
      <view class="address-form">
        <view class="form-header">
          <text>{{ isEdit ? '编辑地址' : '新增地址' }}</text>
          <text class="close" @tap="closeForm">×</text>
        </view>

        <scroll-view scroll-y class="form-content">
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
            <view class="region-picker" @tap="showRegionPicker">
              <text v-if="formData.region">{{ formData.region }}</text>
              <text class="placeholder" v-else>请选择所在地区</text>
            </view>
          </view>

          <view class="form-item">
            <text class="label">详细地址</text>
            <textarea
              v-model="formData.detail"
              placeholder="请输入详细地址"
              placeholder-class="placeholder"
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
        </scroll-view>

        <view class="form-footer">
          <button class="save-btn" @tap="saveAddress">保存</button>
        </view>
      </view>
    </wd-popup>

    <!-- 地区选择器 -->
    <wd-popup v-model="showRegion" position="bottom">
      <view class="region-picker-popup">
        <view class="picker-header">
          <text>选择地区</text>
          <text class="close" @tap="closeRegionPicker">×</text>
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
          <button class="confirm-btn" @tap="confirmRegion">确定</button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 地址列表
const addressList = ref([
  {
    id: 1,
    name: '张三',
    phone: '13800138000',
    province: '广东省',
    city: '深圳市',
    district: '南山区',
    detail: '科技园南路XX号',
    isDefault: true,
  },
  {
    id: 2,
    name: '李四',
    phone: '13800138001',
    province: '广东省',
    city: '深圳市',
    district: '福田区',
    detail: '福田中心区XX号',
    isDefault: false,
  },
])

// 表单显示状态
const showForm = ref(false)
const isEdit = ref(false)
const currentAddress = ref<any>(null)

// 表单数据
const formData = ref({
  name: '',
  phone: '',
  region: '',
  detail: '',
  isDefault: false,
})

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

// 选择地址（从订单页进入时）
const selectAddress = (address: any) => {
  const pages = getCurrentPages()
  const prevPage = pages[pages.length - 2]
  if (prevPage?.route?.includes('/order/create')) {
    // 设置上一页的地址
    uni.navigateBack()
  }
}

// 设为默认地址
const setDefault = (index: number) => {
  addressList.value.forEach((item) => {
    item.isDefault = false
  })
  addressList.value[index].isDefault = true
}

// 编辑地址
const editAddress = (address: any) => {
  isEdit.value = true
  currentAddress.value = address
  formData.value = {
    name: address.name,
    phone: address.phone,
    region: `${address.province}${address.city}${address.district}`,
    detail: address.detail,
    isDefault: address.isDefault,
  }
  showForm.value = true
}

// 删除地址
const deleteAddress = (index: number) => {
  uni.showModal({
    title: '提示',
    content: '确认删除该地址？',
    success: (res) => {
      if (res.confirm) {
        addressList.value.splice(index, 1)
      }
    },
  })
}

// 显示地址表单
const showAddressForm = () => {
  isEdit.value = false
  currentAddress.value = null
  formData.value = {
    name: '',
    phone: '',
    region: '',
    detail: '',
    isDefault: false,
  }
  showForm.value = true
}

// 关闭地址表单
const closeForm = () => {
  showForm.value = false
}

// 显示地区选择器
const showRegionPicker = () => {
  showRegion.value = true
}

// 关闭地区选择器
const closeRegionPicker = () => {
  showRegion.value = false
}

// 地区选择变化
const onRegionChange = (e: any) => {
  regionValue.value = e.detail.value
}

// 确认地区选择
const confirmRegion = () => {
  const province = provinces.value[regionValue.value[0]]
  const city = cities.value[regionValue.value[1]]
  const district = districts.value[regionValue.value[2]]
  formData.value.region = `${province}${city}${district}`
  closeRegionPicker()
}

// 保存地址
const saveAddress = () => {
  // 表单验证
  if (!formData.value.name) {
    uni.showToast({
      title: '请输入收货人姓名',
      icon: 'none',
    })
    return
  }
  if (!formData.value.phone) {
    uni.showToast({
      title: '请输入手机号码',
      icon: 'none',
    })
    return
  }
  if (!/^1\d{10}$/.test(formData.value.phone)) {
    uni.showToast({
      title: '手机号码格式不正确',
      icon: 'none',
    })
    return
  }
  if (!formData.value.region) {
    uni.showToast({
      title: '请选择所在地区',
      icon: 'none',
    })
    return
  }
  if (!formData.value.detail) {
    uni.showToast({
      title: '请输入详细地址',
      icon: 'none',
    })
    return
  }

  // 解析地区
  const [province, city, district] = formData.value.region.match(/.{2,}/g) || []

  // 构建地址对象
  const address = {
    id: isEdit.value ? currentAddress.value.id : Date.now(),
    name: formData.value.name,
    phone: formData.value.phone,
    province,
    city,
    district,
    detail: formData.value.detail,
    isDefault: formData.value.isDefault,
  }

  if (formData.value.isDefault) {
    // 将其他地址设为非默认
    addressList.value.forEach((item) => {
      item.isDefault = false
    })
  }

  if (isEdit.value) {
    // 更新地址
    const index = addressList.value.findIndex((item) => item.id === currentAddress.value.id)
    if (index > -1) {
      addressList.value[index] = address
    }
  } else {
    // 新增地址
    addressList.value.push(address)
  }

  closeForm()
}
</script>

<style lang="scss">
.address {
  min-height: 100vh;
  background-color: #f8f8f8;

  text {
    font-size: 28rpx;
    color: #333;
  }

  &-list {
    padding: 20rpx;

    .address-item {
      padding: 30rpx;
      margin-bottom: 20rpx;
      background-color: #fff;
      border-radius: 12rpx;

      .info {
        .name-phone {
          margin-bottom: 16rpx;
          font-size: 32rpx;
          font-weight: bold;

          .phone {
            margin-left: 20rpx;
            font-weight: normal;
            color: #666;
          }
        }

        .address-detail {
          font-size: 28rpx;
          line-height: 1.5;
          color: #666;
        }
      }

      .actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 20rpx;
        margin-top: 20rpx;
        border-top: 2rpx solid #f5f5f5;

        .default {
          display: flex;
          align-items: center;
          color: #666;
        }

        .action-buttons {
          display: flex;
          gap: 20rpx;

          .action-item {
            display: flex;
            align-items: center;
            color: #666;

            text {
              margin-left: 6rpx;
            }
          }
        }
      }
    }
  }

  .add-btn {
    position: fixed;
    right: 40rpx;
    bottom: 40rpx;
    left: 40rpx;
    height: 88rpx;
    font-size: 32rpx;
    line-height: 88rpx;
    color: #fff;
    text-align: center;
    background-color: #018d71;
    border-radius: 44rpx;
  }
}
</style>
