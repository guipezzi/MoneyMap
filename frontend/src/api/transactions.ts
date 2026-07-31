import { apiClient } from "./client"
import type { PaginatedResponse } from "@/types/api"
import type { Transaction, TransactionInput } from "@/types/transaction"

export interface TransactionFilters {
    type?: "income" | "expense"
    category?: number
    date_after?: string
    date_before?: string
    page?: number
}

function buildQueryString(filters?: TransactionFilters): string {
    if (!filters) return ""
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            params.append(key, String(value))
        }
    })
    const query = params.toString()
    return query ? `?${query}` : ""
}

export function listTransactions(
    filters?: TransactionFilters
): Promise<PaginatedResponse<Transaction>> {
    return apiClient.get<PaginatedResponse<Transaction>>(
        `/transactions/${buildQueryString(filters)}`
    )
}

export function createTransaction(
    data: TransactionInput
): Promise<Transaction> {
    return apiClient.post<Transaction>("/transactions/", data)
}

export function updateTransaction(
    id: number,
    data: Partial<TransactionInput>
): Promise<Transaction> {
    return apiClient.patch<Transaction>(`/transactions/${id}/`, data)
}

export function deleteTransaction(id: number): Promise<void> {
    return apiClient.delete<void>(`/transactions/${id}/`)
}