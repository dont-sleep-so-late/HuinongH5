<template>
  <view class="chat-list">
    <z-paging ref="paging" v-model="list" @query="queryList">
      <template v-if="list.length > 0">
        <view
          class="chat-item"
          v-for="item in list"
          :key="item.id"
          @click="goDetail(item)"
          @longpress="showActions(item)"
        >
          <view class="avatar">
            <image :src="item.targetAvatar" mode="aspectFill" />
            <view class="badge" v-if="item.unreadCount > 0">{{ item.unreadCount }}</view>
          </view>
          <view class="content">
            <view class="header">
              <text class="name">{{ item.targetUsername }}</text>
              <text class="time">{{ formatTime(item.lastMessageTime) }}</text>
            </view>
            <view class="message">
              <text class="text">{{ item.lastMessage }}</text>
            </view>
          </view>
        </view>
      </template>
      <template v-else>
        <wd-status-tip type="search" tip="暂无聊天记录" />
      </template>
    </z-paging>

    <!-- 操作菜单 -->
    <wd-action-sheet
      v-model="showActionSheet"
      :actions="actions"
      title="选择操作"
      @select="handleAction"
    />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import { formatTime } from '@/utils/time'
import { getChatSessions, deleteChatMessages } from '@/api/chat'
import type { ChatSession } from '@/types/chat'

const router = useRouter()
const paging = ref()
const list = ref<ChatSession[]>([])
const showActionSheet = ref(false)
const currentChat = ref<ChatSession | null>(null)

// 操作菜单
const actions = [{ name: '删除会话', value: 'delete' }]

// 查询列表
const queryList = async (pageNum: number, pageSize: number) => {
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

// 跳转详情
const goDetail = (item: ChatSession) => {
  router.navigate('/pages-sub/chat/detail', {
    targetId: item.targetUserId,
    name: item.targetUsername,
    role: item.targetRole,
  })
}

// 显示操作菜单
const showActions = (item: ChatSession) => {
  currentChat.value = item
  showActionSheet.value = true
}

// 处理操作
const handleAction = async (action: { name: string; value: string }) => {
  if (action.value === 'delete' && currentChat.value) {
    try {
      const res = await uni.showModal({
        title: '提示',
        content: '确定要删除该会话吗？',
      })
      if (res.confirm) {
        const deleteRes = await deleteChatMessages(currentChat.value.targetUserId)
        if (deleteRes.code === 200) {
          showToast('删除成功')
          // 刷新列表
          paging.value.reload()
        }
      }
    } catch (error: any) {
      showToast(error.message || '删除失败')
    }
  }
}
</script>

<style lang="scss">
.chat-list {
  min-height: 100vh;
  background-color: #f8f8f8;

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
        .text {
          font-size: 28rpx;
          color: #666;
        }
      }
    }
  }
}
</style>
