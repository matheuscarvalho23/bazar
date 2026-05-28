import type { ProductStatus } from '../enums/product-status.enum'

export interface IProductListFilters {
  readonly search: string | null
  readonly status?: ProductStatus
  readonly categoryId?: string
}
