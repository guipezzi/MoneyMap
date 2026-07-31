import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/utils/formatCurrency"
import type { MonthlyEvolution } from "@/types/dashboard"

interface MonthlyBarChartProps {
  data: MonthlyEvolution[]
}

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Bar dataKey="income" name="Receitas" fill="#10b981" />
            <Bar dataKey="expense" name="Despesas" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}