interface TabBarItem {
  pagePath: string
  text: string
  iconPath: string
  selectedIconPath: string
}

interface TabBar {
  custom: boolean
  color: `#${string}`
  selectedColor: `#${string}`
  backgroundColor: `#${string}`
  list: TabBarItem[]
}

// 买家菜单配置
export const buyerTabBar: TabBar = {
  custom: true,
  color: '#999999',
  selectedColor: '#018d71',
  backgroundColor: '#f8f8f8',
  list: [
    {
      pagePath: 'pages/index/index',
      text: '商城',
      iconPath: 'static/tabbar/home.png',
      selectedIconPath: 'static/tabbar/homeHL.png',
    },
    {
      pagePath: 'pages/category/index',
      text: '分类',
      iconPath: 'static/tabbar/category.png',
      selectedIconPath: 'static/tabbar/categoryHL.png',
    },
    {
      pagePath: 'pages/message/index',
      text: '消息',
      iconPath: 'static/tabbar/message.png',
      selectedIconPath: 'static/tabbar/messageHL.png',
    },
    {
      pagePath: 'pages/cart/index',
      text: '购物车',
      iconPath: 'static/tabbar/cart.png',
      selectedIconPath: 'static/tabbar/cartHL.png',
    },
    {
      pagePath: 'pages/user/index',
      text: '我的',
      iconPath: 'static/tabbar/user.png',
      selectedIconPath: 'static/tabbar/userHL.png',
    },
  ],
}

// 卖家菜单配置
export const sellerTabBar: TabBar = {
  custom: true,
  color: '#999999',
  selectedColor: '#018d71',
  backgroundColor: '#f8f8f8',
  list: [
    {
      pagePath: 'pages/index/index',
      text: '商城',
      iconPath: 'static/tabbar/home.png',
      selectedIconPath: 'static/tabbar/homeHL.png',
    },
    {
      pagePath: 'pages/shelf/index',
      text: '货架',
      iconPath: 'static/tabbar/shelf.png',
      selectedIconPath: 'static/tabbar/shelfHL.png',
    },
    {
      pagePath: 'pages/message/index',
      text: '消息',
      iconPath: 'static/tabbar/message.png',
      selectedIconPath: 'static/tabbar/messageHL.png',
    },
    {
      pagePath: 'pages/user/index',
      text: '我的',
      iconPath: 'static/tabbar/user.png',
      selectedIconPath: 'static/tabbar/userHL.png',
    },
  ],
}
