export interface Query {
  type?: string
  cartIds?: string
  productId?: string
  specId?: string
  quantity?: string
  [key: string]: string | undefined
}
