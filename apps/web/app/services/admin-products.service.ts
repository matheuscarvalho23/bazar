import type { ICreateProductRequest } from '~/interfaces/products/create-product-request.interface'
import type { IListProductsQuery } from '~/interfaces/products/list-products-query.interface'
import type { IProductResponse } from '~/interfaces/products/product-response.interface'
import type { IUpdateProductRequest } from '~/interfaces/products/update-product-request.interface'
import type { IUpdateProductStatusRequest } from '~/interfaces/products/update-product-status-request.interface'

/**
 * List products for admin product management.
 *
 * @param query - Product listing filters : IListProductsQuery | undefined
 *
 * @returns Products response : Promise<IProductResponse[]>
 */
async function listProducts(query?: IListProductsQuery): Promise<IProductResponse[]> {
  const api = useApiClient()
  const response = await api.get<IProductResponse[]>('/admin/products', {
    params: query,
  })

  return response.data
}

/**
 * Create one product for admin product management.
 *
 * @param data - Product creation payload : ICreateProductRequest
 *
 * @returns Created product response : Promise<IProductResponse>
 */
async function createProduct(data: ICreateProductRequest): Promise<IProductResponse> {
  const api = useApiClient()
  const response = await api.post<IProductResponse>('/admin/products', data)

  return response.data
}

/**
 * Find one product by identifier.
 *
 * @param id - Product identifier : string
 *
 * @returns Product response : Promise<IProductResponse>
 */
async function findProductById(id: string): Promise<IProductResponse> {
  const api = useApiClient()
  const response = await api.get<IProductResponse>(`/admin/products/${id}`)

  return response.data
}

/**
 * Update one product for admin product management.
 *
 * @param id - Product identifier : string
 * @param data - Product update payload : IUpdateProductRequest
 *
 * @returns Updated product response : Promise<IProductResponse>
 */
async function updateProduct(id: string, data: IUpdateProductRequest): Promise<IProductResponse> {
  const api = useApiClient()
  const response = await api.patch<IProductResponse>(`/admin/products/${id}`, data)

  return response.data
}

/**
 * Update only product status for admin product management.
 *
 * @param id - Product identifier : string
 * @param data - Product status payload : IUpdateProductStatusRequest
 *
 * @returns Updated product response : Promise<IProductResponse>
 */
async function updateProductStatus(
  id: string,
  data: IUpdateProductStatusRequest,
): Promise<IProductResponse> {
  const api = useApiClient()
  const response = await api.patch<IProductResponse>(`/admin/products/${id}/status`, data)

  return response.data
}

export const adminProductsService = {
  listProducts,
  createProduct,
  findProductById,
  updateProduct,
  updateProductStatus,
}
