import type { ProductCondition } from '../enums/product-condition.enum'
import type { ProductStatus } from '../enums/product-status.enum'
import type { IProductCategorySummary } from './product-category-summary.interface'
import type { IProductImageResponse } from './product-image-response.interface'
import type { IProductInventorySummary } from './product-inventory-summary.interface'

export interface IProductResponse {
  readonly id: string
  readonly categoryId: string | null
  readonly name: string
  readonly description: string | null
  readonly brand: string | null
  readonly size: string | null
  readonly color: string | null
  readonly gender: string | null
  readonly condition: ProductCondition | null
  readonly price: string
  readonly status: ProductStatus
  readonly externalCode: string | null
  readonly importSource: string | null
  readonly createdByAdminId: string | null
  readonly category: IProductCategorySummary | null
  readonly images: IProductImageResponse[]
  readonly inventory: IProductInventorySummary
  readonly createdAt: Date
  readonly updatedAt: Date
}
