import type { ProductCondition } from '~/types/products/product-condition.type'
import type { ProductStatus } from '~/types/products/product-status.type'
import type { IProductCategorySummary } from './product-category-summary.interface'
import type { IProductImageResponse } from './product-image-response.interface'
import type { IProductInventorySummary } from './product-inventory-summary.interface'

export interface IProductResponse {
  id: string
  categoryId: string | null
  name: string
  description: string | null
  brand: string | null
  size: string | null
  color: string | null
  gender: string | null
  condition: ProductCondition | null
  price: string
  status: ProductStatus
  externalCode: string | null
  importSource: string | null
  createdByAdminId: string | null
  category: IProductCategorySummary | null
  images: IProductImageResponse[]
  inventory: IProductInventorySummary
  createdAt: string
  updatedAt: string
}
