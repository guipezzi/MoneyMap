import { apiClient } from "./client"
import type { DashboardSummary } from "@/types/dashboard"

export function getDashboardSummary(month: string): Promise<DashboardSummary> {
    return apiClient.get<DashboardSummary>(`/dashboard/summary/?month=${month}`)
}

export async function downloadDashboardExport(month: string): Promise<void> {
    const blob = await apiClient.getBlob(`/dashboard/export/?month=${month}`)

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `relatorio-moneymap-${month}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}