import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { listCategories } from "@/api/categories"
import type { Category, CategoryType } from "@/types/category"
import type { TransactionInput } from "@/types/transaction"

const transactionSchema = z.object({
  description: z
    .string()
    .min(1, "Informe uma descrição")
    .max(255, "Descrição muito longa"),
  amount: z.coerce
    .number({ invalid_type_error: "Informe um valor válido" })
    .positive("O valor deve ser maior que zero"),
  type: z.enum(["income", "expense"], {
    required_error: "Selecione o tipo",
  }),
  date: z.string().min(1, "Selecione a data"),
  category: z.coerce.number({
    required_error: "Selecione uma categoria",
    invalid_type_error: "Selecione uma categoria",
  }),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  initialValues?: Partial<TransactionFormValues>
  onSubmit: (data: TransactionInput) => Promise<void>
  isSubmitting?: boolean
  submitLabel?: string
  categories?: Category[]
}

export function TransactionForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Salvar",
  categories: categoriesProp,
}: TransactionFormProps) {
  const [fetchedCategories, setFetchedCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(
    categoriesProp === undefined
  )

  const categories = categoriesProp ?? fetchedCategories

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: initialValues?.description ?? "",
      amount: initialValues?.amount,
      type: initialValues?.type ?? "expense",
      date: initialValues?.date ?? new Date().toISOString().slice(0, 10),
      category: initialValues?.category,
    },
  })

  const selectedType = form.watch("type") as CategoryType | undefined

  useEffect(() => {
    // Se as categorias já vieram via prop, não precisa buscar de novo
    if (categoriesProp !== undefined) return

    listCategories()
      .then((response) => setFetchedCategories(response.results))
      .finally(() => setIsLoadingCategories(false))
  }, [categoriesProp])

  const filteredCategories = categories.filter(
    (category) => category.type === selectedType
  )

  async function handleSubmit(values: TransactionFormValues) {
    await onSubmit({
      description: values.description,
      amount: values.amount.toFixed(2),
      type: values.type,
      date: values.date,
      category: values.category,
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Supermercado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    // categoria antiga pode não valer mais pro novo tipo
                    form.setValue("category", undefined as unknown as number)
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="income">Receita</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor (R$)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number(value))}
                  value={field.value ? String(field.value) : undefined}
                  disabled={isLoadingCategories || !selectedType}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          isLoadingCategories
                            ? "Carregando..."
                            : "Selecione"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={String(category.id)}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? "Salvando..." : submitLabel}
        </Button>
      </form>
    </Form>
  )
}