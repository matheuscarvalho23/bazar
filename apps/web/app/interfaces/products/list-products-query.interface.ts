import type { ProductStatus } from '~/types/products/product-status.type'

export interface IListProductsQuery {
  search?: string
  status?: ProductStatus
  categoryId?: string
}
