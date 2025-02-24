/// <reference types="@dcloudio/types" />
import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'
import type { TabBar as UniTabBar } from '@uni-helper/vite-plugin-uni-pages'
import { getTabBarByRole } from './src/config/menu'
import type { UserRole } from './src/config/menu'

// 从缓存或状态管理中获取用户角色
const getUserRole = (): UserRole => {
  try {
    const role = uni.getStorageSync('userRole') as UserRole
    return role || 'buyer' // 默认返回买家角色
  } catch (e) {
    console.error('获取用户角色失败:', e)
    return 'buyer'
  }
}

// 转换菜单配置为uni-pages要求的格式
const convertTabBar = (tabBar: ReturnType<typeof getTabBarByRole>): UniTabBar => {
  const list = tabBar.list.slice(0, 5)
  return {
    color: tabBar.color,
    selectedColor: tabBar.selectedColor,
    backgroundColor: tabBar.backgroundColor,
    list: [list[0], list[1], list[2], list[3], list[4]] as UniTabBar['list'],
  }
}

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
  tabBar: convertTabBar(getTabBarByRole(getUserRole())),
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
        {
          path: 'forecast-detail',
          style: {
            navigationBarTitleText: '价格预测详情',
          },
        },
        {
          path: 'price-detail',
          style: {
            navigationBarTitleText: '价格详情',
          },
        },
        {
          path: 'search',
          style: {
            navigationBarTitleText: '搜索',
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
        {
          path: 'profile',
          style: {
            navigationBarTitleText: '编辑资料',
          },
        },
        {
          path: 'change-password',
          style: {
            navigationBarTitleText: '修改密码',
          },
        },
        {
          path: 'privacy',
          style: {
            navigationBarTitleText: '隐私政策',
          },
        },
        {
          path: 'agreement',
          style: {
            navigationBarTitleText: '用户协议',
          },
        },
        {
          path: 'bind-phone',
          style: {
            navigationBarTitleText: '绑定手机号',
          },
        },
        {
          path: 'bind-email',
          style: {
            navigationBarTitleText: '绑定邮箱',
          },
        },
        {
          path: 'change-phone',
          style: {
            navigationBarTitleText: '更换手机号',
          },
        },
        {
          path: 'change-email',
          style: {
            navigationBarTitleText: '更换邮箱',
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
