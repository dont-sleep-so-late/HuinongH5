import type { Api } from '@/types/api'
import { http } from './http'

export const api: Api = {
  // 商品相关
  getProducts: (params) => http.get('/products', params),
  getProductById: (id) => http.get('/products/' + id),
  createProduct: (data) => http.post('/products', data),
  updateProduct: (id, data) => http.put('/products/' + id, data),
  deleteProduct: (id) => http.delete('/products/' + id),

  // 分类相关
  getCategories: () => http.get('/categories'),
  getCategoryById: (id) => http.get('/categories/' + id),

  // 文件上传
  uploadFile: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return http.post('/upload', formData)
  },

  // 用户相关
  register: (data) => http.post('/auth/register', data),
  login: (data) => http.post('/auth/login', data),
  getUserInfo: () => http.get('/user/info'),
  updateUserInfo: (data) => http.put('/user/info', data),
  verify: (data) => http.post('/user/verify', data),

  // 浏览足迹
  getFootprints: (params) => http.get('/user/footprints', params),
  deleteFootprint: (id) => http.delete('/user/footprints/' + id),
  clearFootprints: () => http.delete('/user/footprints'),

  // 购买记录
  getPurchaseRecords: (params) => http.get('/user/purchase-records', params),
  confirmPurchase: (id) => http.post('/user/purchase-records/' + id + '/confirm'),
}

export default api
