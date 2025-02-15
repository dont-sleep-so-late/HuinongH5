<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <wd-input
        v-model="searchKeyword"
        placeholder="搜索消息内容"
        prefix-icon="search"
        clearable
        @input="handleSearch"
      />
    </view>

    <!-- 消息类型切换 -->
    <wd-tabs v-model="activeTab" sticky>
      <wd-tab title="智能助手" name="robot">
        <view class="tab-header">
          <text class="unread-count" v-if="robotUnreadCount > 0">{{ robotUnreadCount }}条未读</text>
          <text class="clear-btn" @click="clearRobotUnread">全部已读</text>
        </view>
        <view class="message-list" v-if="filteredRobotMessages.length > 0">
          <view
            class="message-item"
            v-for="item in filteredRobotMessages"
            :key="item.id"
            :class="{ unread: !item.isRead }"
            @click="markMessageRead(item)"
          >
            <view class="message-header">
              <view class="sender-info">
                <image src="/static/avatar/robot.png" class="sender-avatar" mode="aspectFill" />
                <text class="sender-name">智能助手</text>
              </view>
              <text class="message-time">{{ item.time }}</text>
            </view>
            <view class="message-content">
              <text class="message-title">{{ item.title }}</text>
              <text class="message-text">{{ item.content }}</text>
            </view>
          </view>
        </view>
        <view class="empty-message" v-else>
          <image src="/static/icons/empty-message.png" mode="aspectFit" class="empty-icon" />
          <text class="empty-text">{{ searchKeyword ? '未找到相关消息' : '暂无系统消息' }}</text>
        </view>
      </wd-tab>

      <wd-tab title="店铺消息" name="shop">
        <view class="tab-header">
          <text class="unread-count" v-if="shopUnreadCount > 0">{{ shopUnreadCount }}条未读</text>
          <text class="clear-btn" @click="clearShopUnread">全部已读</text>
        </view>
        <view class="chat-list" v-if="filteredShopMessages.length > 0">
          <view
            class="chat-item"
            v-for="shop in filteredShopMessages"
            :key="shop.id"
            @click="navigateToChat(shop)"
          >
            <view class="shop-avatar">
              <image :src="shop.avatar" mode="aspectFill" />
              <view class="unread-badge" v-if="shop.unreadCount > 0">{{ shop.unreadCount }}</view>
            </view>
            <view class="chat-info">
              <view class="chat-header">
                <text class="shop-name">{{ shop.name }}</text>
                <text class="last-time">{{ shop.lastMessageTime }}</text>
              </view>
              <view class="chat-content">
                <text class="last-message">{{ shop.lastMessage }}</text>
                <view class="message-status" v-if="shop.status">{{ shop.status }}</view>
              </view>
            </view>
          </view>
        </view>
        <view class="empty-message" v-else>
          <image src="/static/icons/empty-message.png" mode="aspectFit" class="empty-icon" />
          <text class="empty-text">{{ searchKeyword ? '未找到相关店铺' : '暂无店铺消息' }}</text>
        </view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from '@/hooks/router'

const router = useRouter()
const searchKeyword = ref('')
const activeTab = ref('robot')

// 机器人消息数据
const robotMessages = ref([
  {
    id: 1,
    title: '订单发货提醒',
    content: '您购买的有机大米已发货，预计3天内送达，请注意查收。',
    time: '2024-03-14 15:30',
    isRead: false,
  },
  {
    id: 2,
    title: '农场收获提醒',
    content: '您的农场白菜已经成熟，快去收获吧！',
    time: '2024-03-14 14:00',
    isRead: false,
  },
  {
    id: 3,
    title: '新功能上线通知',
    content: '智能农业数据分析功能已上线，欢迎体验使用！',
    time: '2024-03-10 10:00',
    isRead: true,
  },
])

// 店铺消息数据
const shopMessages = ref([
  {
    id: 1,
    name: '有机蔬菜专营店',
    avatar: '/static/shops/shop1.png',
    lastMessage: '您好，您购买的蔬菜已经采摘完成，预计明天发货',
    lastMessageTime: '15:30',
    unreadCount: 2,
    status: '订单处理中',
  },
  {
    id: 2,
    name: '阳光果园',
    avatar: '/static/shops/shop2.png',
    lastMessage: '水果已经发货，请注意查收',
    lastMessageTime: '昨天',
    unreadCount: 0,
    status: '已发货',
  },
  {
    id: 3,
    name: '东北大米直供',
    avatar: '/static/shops/shop3.png',
    lastMessage: '感谢您的购买，欢迎下次光临',
    lastMessageTime: '星期一',
    unreadCount: 1,
    status: '交易完成',
  },
])

// 筛选后的机器人消息
const filteredRobotMessages = computed(() => {
  if (!searchKeyword.value) return robotMessages.value
  const keyword = searchKeyword.value.toLowerCase()
  return robotMessages.value.filter(
    (msg) =>
      msg.title.toLowerCase().includes(keyword) || msg.content.toLowerCase().includes(keyword),
  )
})

// 筛选后的店铺消息
const filteredShopMessages = computed(() => {
  if (!searchKeyword.value) return shopMessages.value
  const keyword = searchKeyword.value.toLowerCase()
  return shopMessages.value.filter(
    (shop) =>
      shop.name.toLowerCase().includes(keyword) || shop.lastMessage.toLowerCase().includes(keyword),
  )
})

// 未读消息数量
const robotUnreadCount = computed(() => robotMessages.value.filter((msg) => !msg.isRead).length)
const shopUnreadCount = computed(() =>
  shopMessages.value.reduce((total, shop) => total + shop.unreadCount, 0),
)

// 处理搜索
const handleSearch = () => {
  // 搜索后自动滚动到顶部
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300,
  })
}

// 标记消息已读
const markMessageRead = (message: any) => {
  message.isRead = true
  // 跳转到消息详情
  router.navigate(`/pages-sub/chat/detail?id=${message.id}&name=智能助手&type=robot`)
}

// 清除机器人消息未读状态
const clearRobotUnread = () => {
  robotMessages.value.forEach((msg) => (msg.isRead = true))
}

// 清除店铺消息未读状态
const clearShopUnread = () => {
  shopMessages.value.forEach((shop) => (shop.unreadCount = 0))
}

// 跳转到聊天详情
const navigateToChat = (shop: any) => {
  shop.unreadCount = 0
  router.navigate(
    `/pages-sub/chat/detail?id=${shop.id}&name=${encodeURIComponent(shop.name)}&type=shop`,
  )
}
</script>

<style lang="scss">
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.multi-ellipsis {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.container {
  min-height: 100vh;
  padding-bottom: env(safe-area-inset-bottom);
  background-color: #f8f8f8;
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 20rpx;
  background-color: #fff;
}

.tab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #fff;

  .unread-count {
    font-size: 24rpx;
    color: #999;
  }

  .clear-btn {
    font-size: 24rpx;
    color: #018d71;
  }
}

.message-list {
  .message-item {
    display: flex;
    flex-direction: column;
    padding: 30rpx 20rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #f5f5f5;

    .message-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16rpx;

      .sender-info {
        display: flex;
        align-items: center;

        .sender-avatar {
          width: 80rpx;
          height: 80rpx;
          margin-right: 20rpx;
          border-radius: 50%;
        }

        .sender-name {
          font-size: 28rpx;
          font-weight: bold;
          color: #333;
        }
      }

      .message-time {
        font-size: 24rpx;
        color: #999;
      }
    }

    .message-content {
      .message-title {
        display: block;
        margin-bottom: 8rpx;
        overflow: hidden;
        font-size: 28rpx;
        font-weight: bold;
        color: #333;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .message-text {
        display: -webkit-box;
        overflow: hidden;
        font-size: 26rpx;
        color: #666;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
    }

    &.unread {
      position: relative;

      &::after {
        position: absolute;
        top: 20rpx;
        right: 20rpx;
        width: 16rpx;
        height: 16rpx;
        content: '';
        background-color: #ff6b6b;
        border-radius: 50%;
      }
    }
  }
}

.chat-list {
  .chat-item {
    display: flex;
    padding: 30rpx 20rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #f5f5f5;

    .shop-avatar {
      position: relative;
      margin-right: 20rpx;

      image {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
      }

      .unread-badge {
        position: absolute;
        top: -8rpx;
        right: -8rpx;
        min-width: 32rpx;
        height: 32rpx;
        padding: 0 8rpx;
        font-size: 20rpx;
        line-height: 32rpx;
        color: #fff;
        text-align: center;
        background-color: #ff6b6b;
        border-radius: 16rpx;
      }
    }

    .chat-info {
      flex: 1;
      overflow: hidden;

      .chat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12rpx;

        .shop-name {
          overflow: hidden;
          font-size: 28rpx;
          font-weight: bold;
          color: #333;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .last-time {
          font-size: 24rpx;
          color: #999;
        }
      }

      .chat-content {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .last-message {
          flex: 1;
          margin-right: 20rpx;
          overflow: hidden;
          font-size: 26rpx;
          color: #666;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .message-status {
          font-size: 24rpx;
          color: #999;
        }
      }
    }
  }
}

.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;

  .empty-icon {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  font-size: 24rpx;
  color: #999;

  .wd-loading {
    margin-right: 10rpx;
  }
}
</style>
