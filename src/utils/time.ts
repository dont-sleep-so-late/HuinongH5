import dayjs from 'dayjs'

/**
 * 格式化时间
 * @param time 时间
 * @param format 格式
 * @returns 格式化后的时间
 */
export const formatTime = (time: string | number | Date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!time) return ''
  return dayjs(time).format(format)
}
