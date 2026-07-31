// frontend/src/components/dashboard/CategoryPieChart.tsx
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/utils/formatCurrency"
import type { CategorySummary } from "@/types/dashboard"

interface CategoryPieChartProps {
    data: CategorySummary[]
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Despesas por categoria</CardTitle>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                        Nenhuma despesa neste período.
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="total"
                                nameKey="category_name"
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                label={(props: any) => props.category_name}
                            >
                                {data.map((entry) => (
                                    <Cell key={entry.category_id} fill={entry.category_color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}