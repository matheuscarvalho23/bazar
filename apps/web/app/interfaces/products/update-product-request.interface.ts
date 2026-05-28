import type { ProductCondition } from '~/types/products/product-condition.type'
import type { ProductStatus } from '~/types/products/product-status.type'
import type { IProductImageRequest } from './product-image-request.interface'

export interface IUpdateProductRequest {
  categoryId?: string
  name?: string
  description?: string
  brand?: string
  size?: string
  color?: string
  gender?: string
  condition?: ProductCondition
  price?: string
  status?: ProductStatus
  images?: IProductImageRequest[]
}
