export type CategoryType = "income" | "expense"

export interface Category {
  id: number
  name: string
  type: CategoryType
  color: string
  created_at: string 
}

export interface CategoryInput {
  name: string
  type: CategoryType
  color?: string
}