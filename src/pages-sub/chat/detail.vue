<template>
  <view class="chat-page">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <view class="nav-back" @click="router.back()">
        <text class="iconfont icon-arrow-left"></text>
      </view>
      <text class="nav-title">{{ chatTitle }}</text>
      <view class="nav-right">
        <text class="iconfont icon-more" @click="showMore"></text>
      </view>
    </view>

    <!-- 商品信息卡片 -->
    <view class="product-card" v-if="currentProduct">
      <image :src="currentProduct.mainImage" mode="aspectFill" class="product-image" />
      <view class="product-info">
        <text class="product-name">{{ currentProduct.name }}</text>
        <view class="product-meta">
          <text class="product-price">¥{{ currentProduct.price }}</text>
          <text class="product-sales">销量 {{ currentProduct.salesVolume }}</text>
        </view>
        <view class="seller-info">
          <image :src="chatInfo.avatar" mode="aspectFill" class="seller-avatar" />
          <text class="seller-name">{{ chatInfo.name }}</text>
          <view class="follow-btn" :class="{ followed: isFollowing }" @click="handleFollow">
            {{ isFollowing ? '已关注' : '关注' }}
          </view>
        </view>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view
      class="message-list"
      scroll-y
      :scroll-top="scrollTop"
      :scroll-into-view="lastMessageId"
      @scrolltoupper="loadMoreHistory"
    >
      <!-- 加载更多 -->
      <view class="loading" v-if="isLoading">
        <wd-loading size="20" />
        <text>加载中...</text>
      </view>

      <!-- 消息内容 -->
      <view class="messages-wrapper">
        <view
          v-for="message in messages"
          :key="message.id"
          :id="'msg-' + message.id"
          class="message-item"
          :class="{ 'message-self': message.senderId === currentUserId }"
        >
          <!-- 时间分割线 -->
          <view class="time-divider" v-if="shouldShowTime(message)">
            <text>{{ formatTime(message.createdTime) }}</text>
          </view>

          <!-- 消息气泡 -->
          <view class="message-content">
            <image
              v-if="message.senderId !== currentUserId"
              :src="message.receiverAvatar"
              class="avatar"
              mode="aspectFill"
            />
            <view
              class="bubble"
              :class="{
                'bubble-self': message.senderId === currentUserId,
              }"
            >
              <!-- 文本消息 -->
              <text v-if="message.messageType === 'text'" class="text">{{ message.content }}</text>
              <!-- 图片消息 -->
              <image
                v-else-if="message.messageType === 'image'"
                :src="message.content"
                class="image-content"
                mode="widthFix"
                @click="previewImage(message.content)"
              />
              <!-- 商品卡片 -->
              <view
                v-else-if="message.messageType === 'product' && message.product"
                class="product-card"
                @click="viewProduct(message.product)"
              >
                <view class="product-info">
                  <text class="product-name">{{ message.product.name }}</text>
                  <text class="product-price">¥{{ message.product.price }}</text>
                </view>
                <image :src="message.product.image" mode="aspectFill" class="product-image" />
              </view>
            </view>
            <image
              v-if="message.senderId === currentUserId"
              :src="message.senderAvatar"
              class="avatar"
              mode="aspectFill"
            />
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 输入区域 -->
    <view class="input-area" :style="{ bottom: keyboardHeight + 'px' }">
      <view class="input-toolbar">
        <text class="iconfont icon-emoji" @click="toggleEmojiPanel"></text>
        <text class="iconfont icon-image" @click="chooseImage"></text>
        <text class="iconfont icon-goods" @click="showProductList"></text>
      </view>
      <view class="input-box">
        <textarea
          v-model="inputMessage"
          class="input"
          :adjust-position="false"
          :cursor-spacing="20"
          :show-confirm-bar="false"
          :hold-keyboard="true"
          :focus="false"
          :auto-height="true"
          :maxlength="200"
          @focus="onInputFocus"
          @blur="onInputBlur"
          @confirm="sendChatMessage"
        />
        <view
          class="send-btn"
          :class="{ active: inputMessage.trim() }"
          @click="() => sendChatMessage()"
        >
          发送
        </view>
      </view>
    </view>

    <!-- 表情面板 -->
    <view class="emoji-panel" v-if="showEmoji" :style="{ bottom: keyboardHeight + 'px' }">
      <scroll-view scroll-y class="emoji-list">
        <text
          v-for="(emoji, index) in emojiList"
          :key="index"
          class="emoji-item"
          @click="insertEmoji(emoji)"
        >
          {{ emoji }}
        </text>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from '@/hooks/router'
import { showToast } from '@/utils/toast'
import { formatTime } from '@/utils/time'
import { getChatMessages, sendMessage, markMessagesRead } from '@/api/chat'
import { useUserStore } from '@/stores/user'
import type { ChatMessage, MessageType, ProductMessage } from '@/types/chat'

interface ChatInfo {
  id: number
  name: string
  avatar: string
  role: 'buyer' | 'seller'
}

const router = useRouter()
const userStore = useUserStore()

// 当前用户ID
const currentUserId = computed(() => userStore.userInfo?.id || 0)

// 聊天信息
const chatInfo = ref<ChatInfo>({
  id: 0,
  name: '',
  avatar: '',
  role: 'seller',
})

// 计算标题
const chatTitle = computed(() => chatInfo.value.name)

// 消息列表
const messages = ref<ChatMessage[]>([])

// 输入相关
const inputMessage = ref('')
const keyboardHeight = ref(0)
const showEmoji = ref(false)
const emojiList = ['😊', '😂', '🤔', '👍', '❤️', '🙏', '🎉', '🌹']

// 加载状态
const isLoading = ref(false)
const scrollTop = ref(0)
const lastMessageId = computed(() => {
  const lastMessage = messages.value[messages.value.length - 1]
  return lastMessage ? 'msg-' + lastMessage.id : ''
})

// 商品信息
interface Product {
  id: number
  name: string
  mainImage: string
  price: number
  salesVolume: number
}

const currentProduct = ref<Product | null>(null)
const isFollowing = ref(false)

// 关注商家
const handleFollow = async () => {
  if (!chatInfo.value.id) return

  try {
    const res = await uni.request({
      url: `/m/profile/favorites/sellers/${chatInfo.value.id}`,
      method: 'POST',
    })

    if (res.statusCode === 200) {
      isFollowing.value = !isFollowing.value
      showToast(isFollowing.value ? '关注成功' : '取消关注成功')
    } else {
      throw new Error('操作失败')
    }
  } catch (error: any) {
    showToast(error.message || '操作失败')
  }
}

// 判断是否需要显示时间
const shouldShowTime = (message: ChatMessage) => {
  const index = messages.value.findIndex((m) => m.id === message.id)
  if (index === 0) return true

  const prevMessage = messages.value[index - 1]
  const currentTime = new Date(message.createdTime).getTime()
  const prevTime = new Date(prevMessage.createdTime).getTime()
  return currentTime - prevTime > 5 * 60 * 1000 // 5分钟显示一次时间
}

// 处理输入框焦点
const onInputFocus = (e: any) => {
  keyboardHeight.value = e.detail.height || 0
  showEmoji.value = false
}

const onInputBlur = () => {
  keyboardHeight.value = 0
}

// 切换表情面板
const toggleEmojiPanel = () => {
  showEmoji.value = !showEmoji.value
  if (showEmoji.value) {
    keyboardHeight.value = 300
  } else {
    keyboardHeight.value = 0
  }
}

// 插入表情
const insertEmoji = (emoji: string) => {
  inputMessage.value += emoji
}

// 发送消息
const sendChatMessage = async (messageType: MessageType = 'text', content?: string) => {
  const messageContent = content || inputMessage.value.trim()
  if (!messageContent) return

  try {
    const res = await sendMessage({
      receiverId: chatInfo.value.id,
      content: messageContent,
      messageType,
    })

    if (res.code === 200 && res.data) {
      messages.value.push(res.data)
      // 清空输入框
      if (messageType === 'text') {
        inputMessage.value = ''
      }
      scrollToBottom()
    } else {
      throw new Error(res.message || '发送失败')
    }
  } catch (error: any) {
    showToast(error.message || '发送失败')
    console.error('发送消息失败:', error)
  }
}

// 发送商品消息
const sendProductMessage = async (productId: number) => {
  try {
    const res = await sendMessage({
      receiverId: chatInfo.value.id,
      content: JSON.stringify({ productId }),
      messageType: 'product',
    })

    if (res.code === 200 && res.data) {
      messages.value.push(res.data)
      scrollToBottom()
    } else {
      throw new Error(res.message || '发送商品消息失败')
    }
  } catch (error: any) {
    showToast(error.message || '发送商品消息失败')
    console.error('发送商品消息失败:', error)
  }
}

// 发送图片消息
const sendImageMessage = async (imageUrl: string) => {
  try {
    const res = await sendMessage({
      receiverId: chatInfo.value.id,
      content: imageUrl,
      messageType: 'image',
    })

    if (res.code === 200 && res.data) {
      messages.value.push(res.data)
      scrollToBottom()
    } else {
      throw new Error(res.message || '发送图片消息失败')
    }
  } catch (error: any) {
    showToast(error.message || '发送图片消息失败')
    console.error('发送图片消息失败:', error)
  }
}

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    success: async (res) => {
      try {
        const tempFilePath = res.tempFilePaths[0]
        const uploadRes = await uni.uploadFile({
          url: '/api/upload',
          filePath: tempFilePath,
          name: 'file',
        })
        const data = JSON.parse(uploadRes.data)
        if (data.code === 200 && data.data) {
          await sendImageMessage(data.data.url)
        } else {
          throw new Error(data.message || '上传失败')
        }
      } catch (error: any) {
        showToast(error.message || '发送失败')
        console.error('上传图片失败:', error)
      }
    },
    fail: (error) => {
      console.error('选择图片失败:', error)
      showToast('选择图片失败')
    },
  })
}

// 预览图片
const previewImage = (url: string) => {
  uni.previewImage({
    urls: [url],
  })
}

// 查看商品详情
const viewProduct = (product: ProductMessage) => {
  router.navigate('/pages-sub/goods/detail', { id: product.id })
}

// 显示商品列表
const showProductList = () => {
  uni.showActionSheet({
    itemList: ['选择商品'],
    success: (res) => {
      if (res.tapIndex === 0) {
        // TODO: 实现商品选择功能
        showToast('商品列表开发中')
      }
    },
  })
}

// 显示更多操作
const showMore = () => {
  uni.showActionSheet({
    itemList: ['清空聊天记录', '投诉商家', '加入黑名单'],
    success: (res) => {
      switch (res.tapIndex) {
        case 0:
          clearChat()
          break
        case 1:
          report()
          break
        case 2:
          block()
          break
      }
    },
  })
}

// 清空聊天记录
const clearChat = async () => {
  try {
    const res = await uni.showModal({
      title: '提示',
      content: '确定要清空聊天记录吗？',
    })
    if (res.confirm) {
      messages.value = []
      showToast('清空成功')
    }
  } catch (error) {
    console.error('清空聊天记录失败', error)
  }
}

// 投诉商家
const report = () => {
  router.navigate('/pages-sub/user/report', {
    targetId: chatInfo.value.id,
  })
}

// 加入黑名单
const block = async () => {
  try {
    const res = await uni.showModal({
      title: '提示',
      content: '确定要将该商家加入黑名单吗？',
    })
    if (res.confirm) {
      showToast('已加入黑名单')
      router.back()
    }
  } catch (error) {
    console.error('加入黑名单失败', error)
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    const query = uni.createSelectorQuery()
    query
      .select('.message-list')
      .boundingClientRect((res: any) => {
        if (res) {
          scrollTop.value = res.height
        }
      })
      .exec()
  })
}

// 加载更多历史记录
const loadMoreHistory = async () => {
  if (isLoading.value) return
  isLoading.value = true

  try {
    const res = await getChatMessages(chatInfo.value.id, {
      pageNum: Math.ceil(messages.value.length / 20) + 1,
      pageSize: 20,
    })
    if (res.code === 200 && res.data) {
      messages.value = [...res.data.records, ...messages.value]
    }
  } catch (error: any) {
    showToast(error.message || '加载失败')
  } finally {
    isLoading.value = false
  }
}

// 标记已读
const markMessageRead = async () => {
  try {
    await markMessagesRead(chatInfo.value.id)
  } catch (error) {
    console.error('标记已读失败', error)
  }
}

// 获取页面参数
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const {
    targetId,
    name,
    role = 'seller',
    productId,
    productName,
    productImage,
    productPrice,
    productSales,
  } = currentPage?.options || {}

  if (targetId) {
    chatInfo.value = {
      id: Number(targetId),
      name: decodeURIComponent(name || ''),
      avatar: role === 'seller' ? '/static/shops/shop1.png' : '/static/avatar/default.png',
      role: role as 'buyer' | 'seller',
    }

    // 设置商品信息
    if (productId) {
      currentProduct.value = {
        id: Number(productId),
        name: decodeURIComponent(productName || ''),
        mainImage: decodeURIComponent(productImage || ''),
        price: Number(productPrice || 0),
        salesVolume: Number(productSales || 0),
      }
    }

    // 获取聊天记录
    loadMoreHistory()
    // 标记已读
    markMessageRead()
  } else {
    showToast('聊天对象信息不完整')
    setTimeout(() => {
      router.back()
    }, 1500)
  }
})

// 页面卸载时清理
onUnmounted(() => {
  keyboardHeight.value = 0
  showEmoji.value = false
})
</script>

<style lang="scss">
.chat-page {
  min-height: 100vh;
  padding-bottom: env(safe-area-inset-bottom);
  background-color: #f8f8f8;
}

.nav-bar {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 32rpx;
  background: linear-gradient(to bottom, #fff, rgba(255, 255, 255, 0.98));
  backdrop-filter: blur(10px);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  .nav-back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 88rpx;
    height: 88rpx;
    margin-left: -32rpx;

    .iconfont {
      font-size: 40rpx;
      color: #333;
    }
  }

  .nav-title {
    flex: 1;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    text-align: center;
  }

  .nav-right {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 88rpx;
    height: 88rpx;

    .iconfont {
      font-size: 40rpx;
      color: #333;
    }
  }
}

.product-card {
  display: flex;
  padding: 20rpx;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  .product-image {
    width: 160rpx;
    height: 160rpx;
    margin-right: 20rpx;
    border-radius: 12rpx;
  }

  .product-info {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: space-between;

    .product-name {
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
    }

    .product-meta {
      display: flex;
      align-items: center;
      margin: 12rpx 0;

      .product-price {
        margin-right: 20rpx;
        font-size: 32rpx;
        font-weight: bold;
        color: #ff4d4f;
      }

      .product-sales {
        font-size: 24rpx;
        color: #999;
      }
    }

    .seller-info {
      display: flex;
      align-items: center;

      .seller-avatar {
        width: 40rpx;
        height: 40rpx;
        margin-right: 12rpx;
        border-radius: 50%;
      }

      .seller-name {
        flex: 1;
        font-size: 24rpx;
        color: #666;
      }

      .follow-btn {
        padding: 8rpx 24rpx;
        font-size: 24rpx;
        color: #fff;
        background-color: #018d71;
        border-radius: 24rpx;
        transition: all 0.3s ease;

        &.followed {
          color: #999;
          background-color: #f5f5f5;
        }
      }
    }
  }
}

.message-list {
  height: calc(100vh - 220rpx);
  padding: 20rpx;
  margin-top: 88rpx;

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
}

.messages-wrapper {
  .message-item {
    margin-bottom: 30rpx;

    .time-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 20rpx 0;

      text {
        padding: 4rpx 16rpx;
        font-size: 24rpx;
        color: #999;
        background-color: rgba(0, 0, 0, 0.05);
        border-radius: 8rpx;
      }
    }

    .message-content {
      display: flex;
      align-items: flex-start;

      .avatar {
        width: 80rpx;
        height: 80rpx;
        border: 2rpx solid rgba(0, 0, 0, 0.05);
        border-radius: 40rpx;
      }
      .bubble {
        max-width: 60%;
        padding: 20rpx;
        margin: 0 20rpx;
        background-color: #fff;
        border-radius: 16rpx;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

        .text {
          font-size: 28rpx;
          line-height: 1.6;
          color: #333;
        }

        .image-content {
          max-width: 100%;
          border-radius: 8rpx;
        }

        .product-card {
          display: flex;
          align-items: center;
          padding: 20rpx;
          background-color: #f8f8f8;
          border-radius: 12rpx;

          .product-info {
            flex: 1;
            margin-right: 20rpx;

            .product-name {
              display: block;
              margin-bottom: 8rpx;
              font-size: 28rpx;
              font-weight: bold;
              color: #333;
            }

            .product-price {
              display: block;
              font-size: 24rpx;
              font-weight: bold;
              color: #ff4d4f;
            }
          }

          .product-image {
            width: 120rpx;
            height: 120rpx;
            border-radius: 8rpx;
          }
        }
      }

      .bubble-self {
        background-color: #018d71;

        .text {
          color: #fff;
        }
      }
    }

    &.message-self {
      .message-content {
        flex-direction: row-reverse;

        .bubble {
          margin: 0 20rpx;
        }
      }
    }

    &.message-right {
      .message-content {
        flex-direction: row-reverse;
      }
    }
  }
}

.input-area {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  padding: 20rpx;
  background: linear-gradient(to bottom, #fff, rgba(255, 255, 255, 0.98));
  backdrop-filter: blur(10px);
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  .input-toolbar {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .iconfont {
      margin-right: 40rpx;
      font-size: 48rpx;
      color: #666;
    }
  }

  .input-box {
    position: relative;
    z-index: 1001;
    display: flex;
    align-items: flex-end;

    .input {
      position: relative;
      z-index: 1002;
      flex: 1;
      min-height: 80rpx;
      max-height: 160rpx;
      padding: 20rpx;
      margin-right: 20rpx;
      font-size: 28rpx;
      line-height: 1.5;
      background-color: #f5f5f5;
      border-radius: 16rpx;
    }

    .send-btn {
      position: relative;
      z-index: 1002;
      width: 120rpx;
      height: 80rpx;
      font-size: 28rpx;
      line-height: 80rpx;
      color: #fff;
      text-align: center;
      background-color: #ccc;
      border-radius: 16rpx;
      transition: all 0.3s ease;

      &.active {
        background-color: #018d71;
      }
    }
  }
}

.emoji-panel {
  position: fixed;
  right: 0;
  left: 0;
  height: 300rpx;
  background-color: #fff;
  transition: all 0.3s ease;

  .emoji-list {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    height: 100%;
    padding: 20rpx;

    .emoji-item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80rpx;
      height: 80rpx;
      font-size: 40rpx;
    }
  }
}
</style>
