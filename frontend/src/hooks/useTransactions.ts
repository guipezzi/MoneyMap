import { useCallback, useEffect, useState } from "react"
import {
    createTransaction as apiCreateTransaction,
    deleteTransaction as apiDeleteTransaction,
    listTransactions,
    updateTransaction as apiUpdateTransaction,
    type TransactionFilters,
} from "@/api/transactions"
import { ApiError } from "@/api/client"
import type { Transaction, TransactionInput } from "@/types/transaction"

const DEFAULT_PAGE_SIZE = 20

interface UseTransactionsOptions {
    initialFilters?: Omit<TransactionFilters, "page">
}

export function useTransactions(options: UseTransactionsOptions = {}) {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [count, setCount] = useState(0)
    const [page, setPage] = useState(1)
    const [filters, setFilters] = useState<Omit<TransactionFilters, "page">>(
        options.initialFilters ?? {}
    )
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await listTransactions({ ...filters, page })
            setTransactions(response.results)
            setCount(response.count)
        } catch (err) {
            setError(
                err instanceof ApiError
                    ? err.message
                    : "Erro ao carregar transações. Tente novamente."
            )
        } finally {
            setIsLoading(false)
        }
    }, [filters, page])

    useEffect(() => {
        fetchTransactions()
    }, [fetchTransactions])

    // Sempre que os filtros mudam, volta pra primeira página
    const updateFilters = useCallback(
        (newFilters: Omit<TransactionFilters, "page">) => {
            setFilters(newFilters)
            setPage(1)
        },
        []
    )

    const createTransaction = useCallback(
        async (data: TransactionInput) => {
            const created = await apiCreateTransaction(data)
            await fetchTransactions()
            return created
        },
        [fetchTransactions]
    )

    const updateTransaction = useCallback(
        async (id: number, data: Partial<TransactionInput>) => {
            const updated = await apiUpdateTransaction(id, data)
            await fetchTransactions()
            return updated
        },
        [fetchTransactions]
    )

    const deleteTransaction = useCallback(
        async (id: number) => {
            await apiDeleteTransaction(id)
            await fetchTransactions()
        },
        [fetchTransactions]
    )

    const totalPages = Math.max(1, Math.ceil(count / DEFAULT_PAGE_SIZE))

    return {
        transactions,
        count,
        page,
        setPage,
        totalPages,
        filters,
        setFilters: updateFilters,
        isLoading,
        error,
        refetch: fetchTransactions,
        createTransaction,
        updateTransaction,
        deleteTransaction,
    }
}