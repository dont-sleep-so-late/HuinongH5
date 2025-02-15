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
      <wd-tab title="系统消息" name="system">
        <view class="tab-header">
          <text class="unread-count" v-if="systemUnreadCount > 0">
            {{ systemUnreadCount }}条未读
          </text>
          <text class="clear-btn" @click="clearSystemUnread">全部已读</text>
        </view>
        <view class="message-list" v-if="filteredSystemMessages.length > 0">
          <view
            class="message-item"
            v-for="item in filteredSystemMessages"
            :key="item.id"
            :class="{ unread: !item.isRead }"
            @click="markMessageRead(item)"
          >
            <view class="message-header">
              <text class="message-title">{{ item.title }}</text>
              <text class="message-time">{{ item.time }}</text>
            </view>
            <text class="message-content">{{ item.content }}</text>
          </view>
        </view>
        <view class="empty-message" v-else>
          <image src="/static/icons/empty-message.png" mode="aspectFit" class="empty-icon" />
          <text class="empty-text">{{ searchKeyword ? '未找到相关消息' : '暂无系统消息' }}</text>
        </view>
      </wd-tab>

      <wd-tab title="客服消息" name="customer">
        <view class="tab-header">
          <text class="unread-count" v-if="customerUnreadCount > 0">
            {{ customerUnreadCount }}条未读
          </text>
          <text class="clear-btn" @click="clearCustomerUnread">全部已读</text>
        </view>
        <view class="chat-container">
          <!-- 聊天记录 -->
          <scroll-view
            scroll-y
            class="chat-messages"
            :scroll-top="scrollTop"
            @scrolltoupper="loadMoreMessages"
          >
            <view class="message-list">
              <view
                v-for="message in filteredChatMessages"
                :key="message.id"
                :class="[
                  'message-item',
                  message.type === 'send' ? 'send' : 'receive',
                  { unread: !message.isRead },
                ]"
                @click="markMessageRead(message)"
              >
                <image :src="message.avatar" mode="aspectFill" class="avatar" />
                <view class="message-content">
                  <text class="message-text">{{ message.content }}</text>
                  <text class="message-time">{{ message.time }}</text>
                </view>
              </view>
            </view>
          </scroll-view>

          <!-- 输入框 -->
          <view class="chat-input">
            <wd-input
              v-model="inputMessage"
              placeholder="请输入消息"
              clearable
              @enter="sendMessage"
            >
              <template #suffix>
                <wd-button size="small" type="primary" @click="sendMessage">发送</wd-button>
              </template>
            </wd-input>
          </view>
        </view>
      </wd-tab>
    </wd-tabs>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

// 搜索关键词
const searchKeyword = ref('')

// 当前激活的标签页
const activeTab = ref('system')

// 系统消息数据
const systemMessages = ref([
  {
    id: 1,
    title: '系统维护通知',
    content:
      '尊敬的用户，系统将于2024年3月15日凌晨2:00-4:00进行例行维护，期间可能影响部分功能的使用。',
    time: '2024-03-14 15:30',
    isRead: false,
  },
  {
    id: 2,
    title: '新功能上线通知',
    content: '智能农业数据分析功能已上线，欢迎体验使用！',
    time: '2024-03-10 10:00',
    isRead: true,
  },
])

// 聊天消息数据
const chatMessages = ref([
  {
    id: 1,
    type: 'receive',
    content: '您好，我是智慧农业客服小惠，很高兴为您服务！',
    time: '10:00',
    avatar: '/static/avatar/customer-service.png',
    isRead: true,
  },
  {
    id: 2,
    type: 'send',
    content: '你好，我想咨询一下种植相关的问题',
    time: '10:01',
    avatar: '/static/avatar/default.png',
    isRead: true,
  },
  {
    id: 3,
    type: 'receive',
    content: '好的，请问您想咨询什么问题呢？',
    time: '10:01',
    avatar: '/static/avatar/customer-service.png',
    isRead: false,
  },
])

// 筛选后的系统消息
const filteredSystemMessages = computed(() => {
  if (!searchKeyword.value) return systemMessages.value
  const keyword = searchKeyword.value.toLowerCase()
  return systemMessages.value.filter(
    (msg) =>
      msg.title.toLowerCase().includes(keyword) || msg.content.toLowerCase().includes(keyword),
  )
})

// 筛选后的聊天消息
const filteredChatMessages = computed(() => {
  if (!searchKeyword.value) return chatMessages.value
  const keyword = searchKeyword.value.toLowerCase()
  return chatMessages.value.filter((msg) => msg.content.toLowerCase().includes(keyword))
})

// 未读消息数量
const systemUnreadCount = computed(() => systemMessages.value.filter((msg) => !msg.isRead).length)

const customerUnreadCount = computed(
  () => chatMessages.value.filter((msg) => !msg.isRead && msg.type === 'receive').length,
)

// 输入框消息
const inputMessage = ref('')
const scrollTop = ref(0)

// 处理搜索
const handleSearch = () => {
  // 搜索后自动滚动到顶部
  scrollTop.value = 0
}

// 标记消息已读
const markMessageRead = (message: any) => {
  message.isRead = true
}

// 清除系统消息未读状态
const clearSystemUnread = () => {
  systemMessages.value.forEach((msg) => (msg.isRead = true))
}

// 清除客服消息未读状态
const clearCustomerUnread = () => {
  chatMessages.value.forEach((msg) => (msg.isRead = true))
}

// 发送消息
const sendMessage = () => {
  if (!inputMessage.value.trim()) {
    uni.showToast({
      title: '请输入消息内容',
      icon: 'none',
    })
    return
  }

  // 添加发送的消息
  chatMessages.value.push({
    id: Date.now(),
    type: 'send',
    content: inputMessage.value,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    avatar: '/static/avatar/default.png',
    isRead: true,
  })

  // 清空输入框
  inputMessage.value = ''

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })

  // 模拟客服回复
  setTimeout(() => {
    chatMessages.value.push({
      id: Date.now() + 1,
      type: 'receive',
      content: '您的问题我已经收到，请稍等，我马上为您解答。',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      avatar: '/static/avatar/customer-service.png',
      isRead: false,
    })
    scrollToBottom()
  }, 1000)
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    const query = uni.createSelectorQuery()
    query.select('.chat-messages').boundingClientRect()
    query.select('.message-list').boundingClientRect()
    query.exec((res) => {
      if (res[0] && res[1]) {
        scrollTop.value = res[1].height - res[0].height
      }
    })
  })
}

// 加载更多消息
const loadMoreMessages = () => {
  // TODO: 实现加载历史消息的逻辑
}

// 页面加载完成后滚动到底部
onMounted(() => {
  scrollToBottom()
})
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f8f8f8;
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 101;
  padding: 20rpx;
  background-color: #fff;
}

.tab-header {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 20rpx;
  background-color: #fff;

  .unread-count {
    margin-right: 20rpx;
    font-size: 24rpx;
    color: #ff6b6b;
  }

  .clear-btn {
    font-size: 24rpx;
    color: #018d71;
  }
}

.message-list {
  padding: 20rpx;
}

.message-item {
  position: relative;
  padding: 20rpx;
  margin-bottom: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;

  &.unread::after {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    width: 16rpx;
    height: 16rpx;
    content: '';
    background-color: #ff6b6b;
    border-radius: 50%;
  }

  .message-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;

    .message-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
    }

    .message-time {
      font-size: 24rpx;
      color: #999;
    }
  }

  .message-content {
    font-size: 26rpx;
    line-height: 1.6;
    color: #666;
  }
}

.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;

  .empty-icon {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 40rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 88rpx);
}

.chat-messages {
  flex: 1;
  padding: 20rpx;
  background-color: #f8f8f8;

  .message-list {
    .message-item {
      display: flex;
      padding: 0;
      margin-bottom: 30rpx;
      background-color: transparent;

      .avatar {
        width: 80rpx;
        height: 80rpx;
        margin: 0 20rpx;
        border-radius: 40rpx;
      }

      .message-content {
        max-width: 60%;

        .message-text {
          display: inline-block;
          padding: 20rpx;
          font-size: 28rpx;
          line-height: 1.4;
          word-break: break-all;
          border-radius: 12rpx;
        }

        .message-time {
          display: block;
          margin-top: 8rpx;
          font-size: 24rpx;
          color: #999;
        }
      }

      &.receive {
        .message-content {
          .message-text {
            color: #333;
            background-color: #fff;
          }
        }
      }

      &.send {
        flex-direction: row-reverse;

        .message-content {
          text-align: right;

          .message-text {
            color: #fff;
            background-color: #018d71;
          }
        }
      }
    }
  }
}

.chat-input {
  padding: 20rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;

  .wd-input {
    padding: 0 20rpx;
    background-color: #f5f5f5;
    border-radius: 8rpx;
  }
}
</style>
