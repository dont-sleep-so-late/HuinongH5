# 惠农商城系统

基于 uniapp + Vue3 + TypeScript + Vite5 开发的多功能电商系统

## 项目功能

### 1. 商城基础功能

- 首页展示
  - 轮播广告
  - 商品分类导航
  - 热销商品推荐
  - 新品上架
  - 限时特惠
- 商品模块
  - 商品分类管理
  - 商品列表展示
  - 商品详情页
  - 商品搜索
  - 商品规格管理
  - 商品上下架
- 购物车模块

  - 商品加入购物车
  - 购物车商品管理
  - 商品数量修改
  - 商品规格修改
  - 购物车结算

- 订单模块
  - 订单创建
  - 订单支付
  - 订单列表
  - 订单详情
  - 订单状态跟踪
  - 订单评价
  - 退款/售后

### 2. 营销功能

- 优惠券系统
  - 优惠券领取
  - 优惠券使用
  - 优惠券管理
- 积分系统
  - 积分获取
  - 积分使用
  - 积分明细
- 拼团活动
  - 拼团商品
  - 拼团规则
  - 拼团状态
- 秒杀活动
  - 秒杀商品
  - 秒杀时间段
  - 库存管理
- 砍价活动
  - 砍价商品
  - 砍价规则
  - 砍价记录

### 3. 会员系统

- 用户中心
  - 用户注册
  - 用户登录
  - 个人信息管理
  - 收货地址管理
- 会员等级
  - 会员权益
  - 等级规则
  - 成长值系统
- 账户管理
  - 余额充值
  - 消费记录
  - 积分明细

### 4. 商户管理

- 店铺管理
  - 店铺信息
  - 营业状态
  - 配送范围
- 商品管理
  - 商品上架
  - 库存管理
  - 价格管理
- 订单管理
  - 订单处理
  - 发货管理
  - 退款处理

### 5. 分销系统

- 分销商管理
  - 分销商申请
  - 分销商等级
  - 佣金规则
- 佣金管理
  - 佣金计算
  - 佣金提现
  - 佣金明细

## 技术架构

- 前端框架：uniapp + Vue3 + TypeScript
- 构建工具：Vite5
- UI组件：wot-design-uni
- 状态管理：Pinia
- 样式方案：UnoCSS
- 请求库：uni-request

## 开发规范

1. 组件化开发

   - 公共组件放置在 components 目录
   - 页面组件放置在 pages 目录
   - 布局组件放置在 layouts 目录

2. 数据管理

   - 使用 Pinia 进行状态管理
   - API 接口统一管理
   - 数据格式统一规范

3. 样式规范

   - 使用 UnoCSS 原子化 CSS
   - 主题色统一配置
   - 响应式布局

4. 代码规范
   - ESLint + Prettier 代码格式化
   - TypeScript 类型检查
   - Git Commit 规范

## 项目结构

```
src/
├── components/        # 公共组件
├── pages/            # 页面文件
├── pages-sub/        # 子页面
├── store/            # 状态管理
├── service/          # API 服务
├── utils/            # 工具函数
├── hooks/            # 组合式函数
├── types/            # 类型定义
└── static/           # 静态资源
```

## 开发计划

1. 第一阶段：基础功能开发

   - 首页展示
   - 商品模块
   - 购物车
   - 订单系统
   - 用户中心

2. 第二阶段：营销功能开发

   - 优惠券系统
   - 积分系统
   - 拼团功能
   - 秒杀功能

3. 第三阶段：高级功能开发

   - 会员系统
   - 分销系统
   - 商户管理
   - 数据统计

4. 第四阶段：系统优化
   - 性能优化
   - 体验优化
   - 安全加固
   - 测试完善

## 运行环境

- Node.js >= 18
- pnpm >= 7.30
- 开发工具：VSCode/WebStorm

## 安装和运行

```bash
# 安装依赖
pnpm install

# 开发环境运行
pnpm dev:h5         # H5
pnpm dev:mp-weixin  # 微信小程序
pnpm dev:app        # App

# 打包
pnpm build:h5         # H5
pnpm build:mp-weixin  # 微信小程序
pnpm build:app        # App
```
