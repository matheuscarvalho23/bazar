import type { ProductStatus } from '~/types/products/product-status.type'

export interface IUpdateProductStatusRequest {
  status: ProductStatus
}
