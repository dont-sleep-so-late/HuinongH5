// 高德地图配置
export const AMAP_CONFIG = {
  key: '2198e11db9d26efd65e305e5109c2385',
  securityJsCode: 'ff4310e84e4987bf72b0c2cbb93d662d',
  // 服务
  webServiceKey: '2198e11db9d26efd65e305e5109c2385',
}

// 高德地图状态
export const AMAP_STATUS = {
  LOADING: '加载中',
  NO_DATA: '暂无物流信息',
  ERROR: '加载失败',
}

// 物流节点图标配置
export const LOGISTICS_MARKER = {
  // 当前节点
  current: {
    iconPath: '/static/images/logistics/current.png',
    width: 25,
    height: 25,
  },
  // 历史节点
  history: {
    iconPath: '/static/images/logistics/history.png',
    width: 20,
    height: 20,
  },
}
