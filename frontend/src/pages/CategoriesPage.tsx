import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CategoryForm } from "@/components/categories/CategoryForm"
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/categories"
import { ApiError } from "@/api/client"
import type { Category, CategoryInput, CategoryType } from "@/types/category"

function CategoryTable({
  title,
  categories,
  onEdit,
  onDelete,
}: {
  title: string
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium">{title}</h2>
      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma categoria cadastrada.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <span
                    className="inline-block h-4 w-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                </TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(category)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(category)}
                  >
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(
    null
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  function refetch() {
    setLoading(true)
    setError(null)
    listCategories()
      .then((response) => setCategories(response.results))
      .catch(() => setError("Não foi possível carregar as categorias."))
      .finally(() => setLoading(false))
  }

  useEffect(refetch, [])

  function openCreateDialog() {
    setEditingCategory(null)
    setActionError(null)
    setIsDialogOpen(true)
  }

  function openEditDialog(category: Category) {
    setEditingCategory(category)
    setActionError(null)
    setIsDialogOpen(true)
  }

  async function handleFormSubmit(data: CategoryInput) {
    setIsSubmitting(true)
    setActionError(null)
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data)
      } else {
        await createCategory(data)
      }
      setIsDialogOpen(false)
      refetch()
    } catch {
      setActionError("Não foi possível salvar a categoria. Tente novamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Excluir a categoria "${category.name}"? Essa ação não pode ser desfeita.`
    )
    if (!confirmed) return

    try {
      await deleteCategory(category.id)
      refetch()
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        const detail = (err.data as { detail?: string })?.detail
        window.alert(
          detail ??
            "Não foi possível excluir esta categoria (ela pode estar em uso)."
        )
      } else {
        window.alert("Não foi possível excluir a categoria. Tente novamente.")
      }
    }
  }

  const expenseCategories = categories.filter(
    (c) => c.type === ("expense" as CategoryType)
  )
  const incomeCategories = categories.filter(
    (c) => c.type === ("income" as CategoryType)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categorias</h1>
        <Button onClick={openCreateDialog}>Nova categoria</Button>
      </div>

      {loading && <p className="text-muted-foreground">Carregando...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {!loading && !error && (
        <div className="grid gap-8 lg:grid-cols-2">
          <CategoryTable
            title="Despesas"
            categories={expenseCategories}
            onEdit={openEditDialog}
            onDelete={handleDelete}
          />
          <CategoryTable
            title="Receitas"
            categories={incomeCategories}
            onEdit={openEditDialog}
            onDelete={handleDelete}
          />
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Editar categoria" : "Nova categoria"}
            </DialogTitle>
          </DialogHeader>
          {actionError && (
            <p className="text-sm text-destructive">{actionError}</p>
          )}
          <CategoryForm
            initialValues={editingCategory ?? undefined}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            submitLabel={editingCategory ? "Salvar alterações" : "Criar"}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}