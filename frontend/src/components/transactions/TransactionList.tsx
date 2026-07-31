import { useMemo } from "react"
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { TransactionItem } from "./TransactionItem"
import type { Category } from "@/types/category"
import type { Transaction } from "@/types/transaction"

interface TransactionListProps {
    transactions: Transaction[]
    categories: Category[]
    isLoading: boolean
    page: number
    totalPages: number
    onPageChange: (page: number) => void
    onEdit: (transaction: Transaction) => void
    onDelete: (transaction: Transaction) => void
}

export function TransactionList({
    transactions,
    categories,
    isLoading,
    page,
    totalPages,
    onPageChange,
    onEdit,
    onDelete,
}: TransactionListProps) {
    const categoryMap = useMemo(() => {
        return new Map(categories.map((category) => [category.id, category]))
    }, [categories])

    if (isLoading) {
        return (
            <p className="py-8 text-center text-sm text-muted-foreground">
                Carregando transações...
            </p>
        )
    }

    if (transactions.length === 0) {
        return (
            <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma transação encontrada.
            </p>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((transaction) => (
                        <TransactionItem
                            key={transaction.id}
                            transaction={transaction}
                            category={categoryMap.get(transaction.category)}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </TableBody>
            </Table>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Página {page} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => onPageChange(page - 1)}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages}
                            onClick={() => onPageChange(page + 1)}
                        >
                            Próxima
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}