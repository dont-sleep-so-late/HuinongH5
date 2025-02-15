import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'
import { buyerTabBar } from './src/config/menu'

export default defineUniPages({
  globalStyle: {
    navigationStyle: 'default',
    navigationBarTitleText: '惠农商城',
    navigationBarBackgroundColor: '#f8f8f8',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FFFFFF',
  },
  easycom: {
    autoscan: true,
    custom: {
      '^wd-(.*)': 'wot-design-uni/components/wd-$1/wd-$1.vue',
      '^(?!z-paging-refresh|z-paging-load-more)z-paging(.*)':
        'z-paging/components/z-paging$1/z-paging$1.vue',
    },
  },
  tabBar: buyerTabBar,
  subPackages: [
    {
      root: 'pages-sub/data',
      pages: [
        {
          path: 'price',
          style: {
            navigationBarTitleText: '价格行情',
          },
        },
        {
          path: 'forecast',
          style: {
            navigationBarTitleText: '价格预测',
          },
        },
        {
          path: 'planting',
          style: {
            navigationBarTitleText: '种植指南',
          },
        },
      ],
    },
    {
      root: 'pages-sub/farm',
      pages: [
        {
          path: 'index',
          style: {
            navigationBarTitleText: '我的农场',
          },
        },
      ],
    },
    {
      root: 'pages-sub/user',
      pages: [
        {
          path: 'verify',
          style: {
            navigationBarTitleText: '实名认证',
          },
        },
        {
          path: 'settings',
          style: {
            navigationBarTitleText: '设置',
          },
        },
        {
          path: 'address',
          style: {
            navigationBarTitleText: '收货地址',
          },
        },
        {
          path: 'address-edit',
          style: {
            navigationBarTitleText: '编辑地址',
          },
        },
        {
          path: 'follow-goods',
          style: {
            navigationBarTitleText: '关注商品',
          },
        },
        {
          path: 'follow-shops',
          style: {
            navigationBarTitleText: '关注店铺',
          },
        },
        {
          path: 'footprints',
          style: {
            navigationBarTitleText: '浏览足迹',
          },
        },
        {
          path: 'purchase-records',
          style: {
            navigationBarTitleText: '采购记录',
          },
        },
      ],
    },
    {
      root: 'pages-sub/goods',
      pages: [
        {
          path: 'detail',
          style: {
            navigationBarTitleText: '商品详情',
          },
        },
        {
          path: 'edit',
          style: {
            navigationBarTitleText: '编辑商品',
          },
        },
      ],
    },
    {
      root: 'pages-sub/order',
      pages: [
        {
          path: 'list',
          style: {
            navigationBarTitleText: '订单列表',
          },
        },
        {
          path: 'detail',
          style: {
            navigationBarTitleText: '订单详情',
          },
        },
        {
          path: 'create',
          style: {
            navigationBarTitleText: '创建订单',
          },
        },
        {
          path: 'review',
          style: {
            navigationBarTitleText: '订单评价',
          },
        },
        {
          path: 'logistics',
          style: {
            navigationBarTitleText: '物流信息',
          },
        },
      ],
    },
  ],
})
