import { apiClient } from "./client"
import type { PaginatedResponse } from "@/types/api"
import type { Category, CategoryInput } from "@/types/category"

export function listCategories(): Promise<PaginatedResponse<Category>> {
  return apiClient.get<PaginatedResponse<Category>>("/categories/")
}

export function createCategory(data: CategoryInput): Promise<Category> {
  return apiClient.post<Category>("/categories/", data)
}

export function updateCategory(
  id: number,
  data: Partial<CategoryInput>
): Promise<Category> {
  return apiClient.patch<Category>(`/categories/${id}/`, data)
}

export function deleteCategory(id: number): Promise<void> {
  return apiClient.delete<void>(`/categories/${id}/`)
}