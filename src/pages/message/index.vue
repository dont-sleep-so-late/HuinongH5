<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <uni-search-bar v-model="searchKeyword" placeholder="搜索消息内容" @input="handleSearch" />
    </view>

    <!-- 消息列表 -->
    <z-paging ref="paging" v-model="chatSessions" @query="queryChatSessions">
      <template v-if="filteredSessions.length > 0">
        <view
          class="chat-item"
          v-for="item in filteredSessions"
          :key="item.id"
          @click="navigateToChat(item)"
          @longpress="showActions(item)"
        >
          <view class="avatar">
            <image :src="item.targetAvatar || '/static/avatar/default.png'" mode="aspectFill" />
            <view class="badge" v-if="item.unreadCount > 0">{{ item.unreadCount }}</view>
          </view>
          <view class="content">
            <view class="header">
              <text class="name">{{ item.targetUsername }}</text>
              <text class="time">{{ formatTime(item.lastMessageTime) }}</text>
            </view>
            <view class="message">
              <text class="text">{{ item.lastMessage }}</text>
              <text class="status" v-if="item.status === 0">已关闭</text>
            </view>
          </view>
        </view>
      </template>
      <template v-else>
        <uni-empty text="暂无聊天记录" />
      </template>
    </z-paging>

    <!-- 操作菜单 -->
    <uni-popup ref="popup" type="bottom">
      <uni-list>
        <uni-list-item
          v-for="action in actions"
          :key="action.value"
          :title="action.name"
          @click="handleAction(action)"
        />
      </uni-list>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import { formatTime } from '@/utils/time'
import { getChatSessions, deleteChatMessages, markMessagesRead, getUnreadCount } from '@/api/chat'
import type { ChatSession } from '@/types/chat'

const router = useRouter()
const searchKeyword = ref('')
const popup = ref()
const currentChat = ref<ChatSession | null>(null)

// 分页组件引用
const paging = ref()

// 会话列表数据
const chatSessions = ref<ChatSession[]>([])

// 操作菜单
const actions = [
  { name: '标记已读', value: 'read' },
  { name: '删除会话', value: 'delete' },
]

// 筛选后的会话列表
const filteredSessions = computed(() => {
  if (!searchKeyword.value) return chatSessions.value
  const keyword = searchKeyword.value.toLowerCase()
  return chatSessions.value.filter(
    (session) =>
      session.targetUsername.toLowerCase().includes(keyword) ||
      session.lastMessage.toLowerCase().includes(keyword),
  )
})

// 处理搜索
const handleSearch = () => {
  // 搜索后自动滚动到顶部
  uni.pageScrollTo({
    scrollTop: 0,
    duration: 300,
  })
}

// 查询会话列表
const queryChatSessions = async (pageNum: number, pageSize: number) => {
  try {
    const res = await getChatSessions({ pageNum, pageSize })
    if (res.code === 200 && res.data) {
      paging.value.complete(res.data.records)
    }
  } catch (error: any) {
    showToast(error.message || '获取数据失败')
    paging.value.complete(false)
  }
}

// 跳转到聊天详情
const navigateToChat = (item: ChatSession) => {
  router.navigate('/pages-sub/chat/detail', {
    targetId: item.targetUserId,
    name: item.targetUsername,
    role: item.targetRole,
  })
}

// 显示操作菜单
const showActions = (item: ChatSession) => {
  currentChat.value = item
  popup.value?.open()
}

// 处理操作
const handleAction = async (action: { name: string; value: string }) => {
  if (!currentChat.value) return
  popup.value?.close()

  try {
    switch (action.value) {
      case 'read': {
        await markMessagesRead(currentChat.value.targetUserId)
        showToast('标记已读成功')
        paging.value?.reload()
        break
      }
      case 'delete': {
        const res = await uni.showModal({
          title: '提示',
          content: '确定要删除该会话吗？',
        })
        if (res.confirm) {
          await deleteChatMessages(currentChat.value.targetUserId)
          showToast('删除成功')
          paging.value?.reload()
        }
        break
      }
    }
  } catch (error: any) {
    showToast(error.message || '操作失败')
  }
}

// 获取未读消息总数
const updateUnreadBadge = async () => {
  try {
    const res = await getUnreadCount()
    if (res.code === 200 && res.data > 0) {
      // 设置 TabBar 的未读数
      uni.setTabBarBadge({
        index: 2, // 消息 Tab 的索引
        text: String(res.data),
      })
    } else {
      uni.removeTabBarBadge({
        index: 2,
      })
    }
  } catch (error) {
    console.error('获取未读消息数失败', error)
  }
}

// 页面显示时更新未读数
onMounted(() => {
  updateUnreadBadge()
})
</script>

<style lang="scss">
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

.chat-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;

  .avatar {
    position: relative;
    margin-right: 20rpx;

    image {
      width: 100rpx;
      height: 100rpx;
      border-radius: 50%;
    }

    .badge {
      position: absolute;
      top: -6rpx;
      right: -6rpx;
      min-width: 32rpx;
      height: 32rpx;
      padding: 0 8rpx;
      font-size: 20rpx;
      line-height: 32rpx;
      color: #fff;
      text-align: center;
      background-color: #ff4d4f;
      border-radius: 16rpx;
    }
  }

  .content {
    flex: 1;
    overflow: hidden;

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8rpx;

      .name {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .time {
        font-size: 24rpx;
        color: #999;
      }
    }

    .message {
      display: flex;
      align-items: center;

      .text {
        flex: 1;
        margin-right: 20rpx;
        overflow: hidden;
        font-size: 28rpx;
        color: #666;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .status {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}
</style>
