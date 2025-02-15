import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Address {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

export const useAddressStore = defineStore('address', () => {
  // 地址列表
  const addressList = ref<Address[]>([])

  // 默认地址
  const defaultAddress = computed(() => {
    return addressList.value.find((item) => item.isDefault)
  })

  // 添加地址
  const addAddress = (address: Omit<Address, 'id'>) => {
    const newAddress: Address = {
      ...address,
      id: Date.now(),
    }

    // 如果是默认地址，需要将其他地址设为非默认
    if (newAddress.isDefault) {
      addressList.value.forEach((item) => {
        item.isDefault = false
      })
    }

    // 如果是第一个地址，自动设为默认地址
    if (addressList.value.length === 0) {
      newAddress.isDefault = true
    }

    addressList.value.push(newAddress)
    saveToStorage()
  }

  // 编辑地址
  const editAddress = (address: Address) => {
    const index = addressList.value.findIndex((item) => item.id === address.id)
    if (index > -1) {
      // 如果设为默认地址，需要将其他地址设为非默认
      if (address.isDefault) {
        addressList.value.forEach((item) => {
          item.isDefault = false
        })
      }
      addressList.value[index] = address
      saveToStorage()
    }
  }

  // 删除地址
  const deleteAddress = (id: number) => {
    const index = addressList.value.findIndex((item) => item.id === id)
    if (index > -1) {
      const isDefault = addressList.value[index].isDefault
      addressList.value.splice(index, 1)

      // 如果删除的是默认地址，且还有其他地址，则将第一个地址设为默认地址
      if (isDefault && addressList.value.length > 0) {
        addressList.value[0].isDefault = true
      }

      saveToStorage()
    }
  }

  // 设置默认地址
  const setDefaultAddress = (id: number) => {
    addressList.value.forEach((item) => {
      item.isDefault = item.id === id
    })
    saveToStorage()
  }

  // 获取地址详情
  const getAddressDetail = (id: number) => {
    return addressList.value.find((item) => item.id === id)
  }

  // 保存到本地存储
  const saveToStorage = () => {
    uni.setStorageSync('address', addressList.value)
  }

  // 从本地存储加载
  const loadFromStorage = () => {
    const address = uni.getStorageSync('address')
    if (address) {
      addressList.value = address
    }
  }

  // 初始化时加载数据
  loadFromStorage()

  return {
    addressList,
    defaultAddress,
    addAddress,
    editAddress,
    deleteAddress,
    setDefaultAddress,
    getAddressDetail,
  }
})
