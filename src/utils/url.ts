/**
 * 获取URL参数
 * @param name 参数名
 * @returns 参数值
 */
export const getQueryString = (name: string): string | null => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage?.options || {}
  return options[name] || null
}

// 扩展uni对象
uni.getQueryString = getQueryString

export default {
  getQueryString,
}
