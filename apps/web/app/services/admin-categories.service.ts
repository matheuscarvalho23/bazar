import type { ICategoryResponse } from '~/interfaces/categories/category-response.interface'
import type { ICreateCategoryRequest } from '~/interfaces/categories/create-category-request.interface'
import type { IUpdateCategoryRequest } from '~/interfaces/categories/update-category-request.interface'

/**
 * List categories for admin product management.
 *
 * @returns Categories response : Promise<ICategoryResponse[]>
 */
async function listCategories(): Promise<ICategoryResponse[]> {
  const api = useApiClient()
  const response = await api.get<ICategoryResponse[]>('/admin/categories')

  return response.data
}

/**
 * Create one category for admin product management.
 *
 * @param data - Category creation payload : ICreateCategoryRequest
 *
 * @returns Created category response : Promise<ICategoryResponse>
 */
async function createCategory(data: ICreateCategoryRequest): Promise<ICategoryResponse> {
  const api = useApiClient()
  const response = await api.post<ICategoryResponse>('/admin/categories', data)

  return response.data
}

/**
 * Update one category for admin product management.
 *
 * @param id - Category identifier : string
 * @param data - Category update payload : IUpdateCategoryRequest
 *
 * @returns Updated category response : Promise<ICategoryResponse>
 */
async function updateCategory(
  id: string,
  data: IUpdateCategoryRequest,
): Promise<ICategoryResponse> {
  const api = useApiClient()
  const response = await api.patch<ICategoryResponse>(`/admin/categories/${id}`, data)

  return response.data
}

export const adminCategoriesService = {
  listCategories,
  createCategory,
  updateCategory,
}
