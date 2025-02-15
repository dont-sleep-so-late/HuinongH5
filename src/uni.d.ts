/// <reference types="@dcloudio/types" />

import 'vue'
import type { Api } from './types/api'

declare const uni: Uni
declare const wx: WechatMiniprogram.Wx
declare const getCurrentPages: () => any[]

declare module 'vue' {
  type Uni = typeof uni

  interface Uni {
    $api: Api
    getQueryString: (name: string) => string | null
  }
}

export {}
