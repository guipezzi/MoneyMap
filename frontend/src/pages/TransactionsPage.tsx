import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TransactionForm } from "@/components/transactions/TransactionForm"
import { TransactionList } from "@/components/transactions/TransactionList"
import { useTransactions } from "@/hooks/useTransactions"
import { listCategories } from "@/api/categories"
import { ApiError } from "@/api/client"
import type { Category } from "@/types/category"
import type { Transaction, TransactionInput } from "@/types/transaction"

export function TransactionsPage() {
  const {
    transactions,
    page,
    setPage,
    totalPages,
    isLoading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions()

  const [categories, setCategories] = useState<Category[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    listCategories().then((response) => setCategories(response.results))
  }, [])

  function handleOpenCreate() {
    setEditingTransaction(null)
    setFormError(null)
    setIsDialogOpen(true)
  }

  function handleOpenEdit(transaction: Transaction) {
    setEditingTransaction(transaction)
    setFormError(null)
    setIsDialogOpen(true)
  }

  async function handleDelete(transaction: Transaction) {
    const confirmed = window.confirm(
      `Excluir a transação "${transaction.description}"? Essa ação não pode ser desfeita.`
    )
    if (!confirmed) return

    try {
      await deleteTransaction(transaction.id)
    } catch (err) {
      window.alert(
        err instanceof ApiError
          ? err.message
          : "Erro ao excluir a transação. Tente novamente."
      )
    }
  }

  async function handleSubmit(data: TransactionInput) {
    setIsSubmitting(true)
    setFormError(null)
    try {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, data)
      } else {
        await createTransaction(data)
      }
      setIsDialogOpen(false)
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : "Erro ao salvar a transação. Tente novamente."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Transações</h1>
        <Button onClick={handleOpenCreate}>Nova transação</Button>
      </div>

      {error && (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <TransactionList
        transactions={transactions}
        categories={categories}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Editar transação" : "Nova transação"}
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {formError}
            </p>
          )}

          <TransactionForm
            key={editingTransaction?.id ?? "new"}
            categories={categories}
            onCategoryCreated={(newCategory) =>
              setCategories((prev) => [...prev, newCategory])
            }
            isSubmitting={isSubmitting}
            submitLabel={editingTransaction ? "Salvar alterações" : "Criar"}
            initialValues={
              editingTransaction
                ? {
                  description: editingTransaction.description,
                  amount: Number(editingTransaction.amount),
                  type: editingTransaction.type,
                  date: editingTransaction.date,
                  category: editingTransaction.category,
                }
                : undefined
            }
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}