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
import type { CategoryInput, CategoryType } from "@/types/category"

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Informe um nome")
    .max(100, "Nome muito longo"),
  type: z.enum(["income", "expense"], {
    required_error: "Selecione o tipo",
  }),
  color: z.string().min(1, "Escolha uma cor"),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
  initialValues?: Partial<CategoryFormValues>
  onSubmit: (data: CategoryInput) => Promise<void>
  isSubmitting?: boolean
  submitLabel?: string
  // Quando fornecido, o campo Tipo fica fixo nesse valor e não pode ser
  // trocado pelo usuário — usado quando a categoria está sendo criada a
  // partir de um contexto que já exige um tipo específico (ex: atalho
  // rápido dentro do formulário de transação), para impedir criar uma
  // categoria com tipo divergente do que o contexto precisa.
  lockedType?: CategoryType
}

export function CategoryForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Salvar",
  lockedType,
}: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      type: lockedType ?? initialValues?.type ?? "expense",
      color: initialValues?.color ?? "#6366F1",
    },
  })

  async function handleSubmit(values: CategoryFormValues) {
    await onSubmit(values)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Alimentação" {...field} />
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
                {lockedType ? (
                  <p className="flex h-9 items-center rounded-full bg-muted px-3 text-sm text-muted-foreground">
                    {lockedType === "income" ? "Receita" : "Despesa"}
                  </p>
                ) : (
                  <Select onValueChange={field.onChange} value={field.value}>
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
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor</FormLabel>
                <FormControl>
                  <div className="flex h-9 items-center gap-2 rounded-full bg-muted px-3">
                    <input
                      type="color"
                      className="h-6 w-6 cursor-pointer rounded-full border-none bg-transparent p-0"
                      {...field}
                    />
                    <span className="text-sm text-muted-foreground">
                      {field.value}
                    </span>
                  </div>
                </FormControl>
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