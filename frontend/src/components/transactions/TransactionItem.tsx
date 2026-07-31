import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { MoreHorizontalIcon } from "lucide-react"
import { formatCurrency } from "@/utils/formatCurrency"
import { formatDate } from "@/utils/dateHelpers"
import type { Category } from "@/types/category"
import type { Transaction } from "@/types/transaction"

interface TransactionItemProps {
    transaction: Transaction
    category?: Category
    onEdit: (transaction: Transaction) => void
    onDelete: (transaction: Transaction) => void
}

export function TransactionItem({
    transaction,
    category,
    onEdit,
    onDelete,
}: TransactionItemProps) {
    const isIncome = transaction.type === "income"

    return (
        <TableRow>
            <TableCell className="font-medium">
                {transaction.description}
            </TableCell>
            <TableCell>
                {category ? (
                    <span className="inline-flex items-center gap-2">
                        <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                    </span>
                ) : (
                    <span className="text-muted-foreground">—</span>
                )}
            </TableCell>
            <TableCell>{formatDate(transaction.date)}</TableCell>
            <TableCell
                className={isIncome ? "text-emerald-600" : "text-destructive"}
            >
                {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
            </TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                            <MoreHorizontalIcon />
                            <span className="sr-only">Ações</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(transaction)}>
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(transaction)}
                        >
                            Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}