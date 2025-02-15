import type { Http } from '@/utils/http'
import type { Api } from '@/types/api'

declare global {
  interface Uni {
    $http: Http
    $api: Api
  }
}

export {}
