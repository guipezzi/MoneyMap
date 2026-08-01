// frontend/src/pages/DashboardPage.tsx
import { useState } from "react"
import { useDashboard } from "@/hooks/useDashboard"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { SummaryCards } from "@/components/dashboard/SummaryCards"
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart"
import { MonthlyBarChart } from "@/components/dashboard/MonthlyBarChart"
import { downloadDashboardExport } from "@/api/dashboard"

const MONTHS = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
]

function getYearOptions(): string[] {
    const currentYear = new Date().getFullYear()
    const years: string[] = []
    for (let y = currentYear; y >= currentYear - 4; y--) {
        years.push(String(y))
    }
    return years
}

export function DashboardPage() {
    const today = new Date()
    const [month, setMonth] = useState(String(today.getMonth() + 1).padStart(2, "0"))
    const [year, setYear] = useState(String(today.getFullYear()))
    const [isExporting, setIsExporting] = useState(false)
    const [exportError, setExportError] = useState<string | null>(null)

    const monthStr = `${year}-${month}`
    const { data, loading, error } = useDashboard(monthStr)
    const years = getYearOptions()

    async function handleExport() {
        setIsExporting(true)
        setExportError(null)
        try {
            await downloadDashboardExport(monthStr)
        } catch {
            setExportError("Não foi possível gerar o PDF. Tente novamente.")
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <div className="flex gap-2">
                    <Select value={month} onValueChange={setMonth}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                            {MONTHS.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                    {m.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map((y) => (
                                <SelectItem key={y} value={y}>
                                    {y}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                        {isExporting ? "Gerando PDF..." : "Exportar PDF"}
                    </Button>
                </div>
            </div>

            {exportError && <p className="text-destructive text-sm">{exportError}</p>}

            {loading && <p className="text-muted-foreground">Carregando...</p>}
            {error && <p className="text-destructive">{error}</p>}

            {data && !loading && !error && (
                <>
                    <SummaryCards summary={data} />
                    <div className="grid gap-4 lg:grid-cols-2">
                        <CategoryPieChart data={data.by_category} />
                        <MonthlyBarChart data={data.monthly_evolution} />
                    </div>
                </>
            )}
        </div>
    )
}