import type { CategoryType } from "./category"

export type TransactionType = CategoryType

export interface Transaction {
    id: number
    description: string
    amount: string
    type: TransactionType
    date: string
    category: number
    created_at: string
    updated_at: string
}

export interface TransactionInput {
    description: string
    amount: string
    type: TransactionType
    date: string
    category: number
}