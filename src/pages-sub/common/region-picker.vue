<template>
  <view class="region-picker">
    <!-- 导航栏 -->
    <view class="nav-bar">
      <text class="back" @click="router.back()">
        <text class="iconfont icon-arrow-left"></text>
      </text>
      <text class="title">选择地区</text>
    </view>

    <!-- 选择器 -->
    <picker-view
      class="picker-view"
      :value="pickerValue"
      @change="handleChange"
      :indicator-style="'height: 88rpx;'"
    >
      <picker-view-column>
        <view class="picker-item" v-for="(item, index) in provinces" :key="index">
          {{ item.name }}
        </view>
      </picker-view-column>
      <picker-view-column>
        <view class="picker-item" v-for="(item, index) in cities" :key="index">
          {{ item.name }}
        </view>
      </picker-view-column>
      <picker-view-column>
        <view class="picker-item" v-for="(item, index) in districts" :key="index">
          {{ item.name }}
        </view>
      </picker-view-column>
    </picker-view>

    <!-- 确定按钮 -->
    <view class="confirm-btn" @click="handleConfirm">确定</view>

    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import { regionData, type Region } from '@/utils/region'

const router = useRouter()

// 选择器值
const pickerValue = ref([0, 0, 0])

// 省份列表
const provinces = computed(() => regionData)

// 城市列表
const cities = computed(() => {
  const province = provinces.value[pickerValue.value[0]]
  return province?.children || []
})

// 区县列表
const districts = computed(() => {
  const city = cities.value[pickerValue.value[1]]
  return city?.children || []
})

// 选择器值改变
const handleChange = (e: any) => {
  const { value } = e.detail
  // 如果省份改变，重置城市和区县
  if (value[0] !== pickerValue.value[0]) {
    value[1] = 0
    value[2] = 0
  }
  // 如果城市改变，重置区县
  if (value[1] !== pickerValue.value[1]) {
    value[2] = 0
  }
  pickerValue.value = value
}

// 确定选择
const handleConfirm = () => {
  const province = provinces.value[pickerValue.value[0]]
  const city = cities.value[pickerValue.value[1]]
  const district = districts.value[pickerValue.value[2]]

  if (!province || !city || !district) {
    return showToast('请选择完整的地区信息')
  }

  // 返回选中的地区
  const eventChannel = router.getOpenerEventChannel()
  eventChannel.emit('regionSelected', {
    province: province.name,
    city: city.name,
    district: district.name,
  })
  router.back()
}
</script>

<style lang="scss">
.region-picker {
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

.picker-view {
  height: 480rpx;
  margin-top: 20rpx;
  background-color: #fff;

  .picker-item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 88rpx;
    font-size: 28rpx;
    color: #333;
  }
}

.confirm-btn {
  position: fixed;
  right: 0;
  bottom: env(safe-area-inset-bottom);
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100rpx;
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(to right, #ff6b6b, #ff8585);
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.safe-area-bottom {
  height: env(safe-area-inset-bottom);
}
</style>
