/**
 * 格式化时间
 * @param time 时间字符串
 * @returns 格式化后的时间字符串
 */
export function formatTime(time: string): string {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 今天之内
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 一周之内
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return days[date.getDay()]
  }

  // 更早
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}
