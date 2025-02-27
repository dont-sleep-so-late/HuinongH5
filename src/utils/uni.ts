declare module 'uni-app' {
  interface Uni {
    getQueryString(name: string): string | null
  }
}

uni.getQueryString = (name: string): string | null => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage?.options || {}
  return options[name] || null
}

export {}
