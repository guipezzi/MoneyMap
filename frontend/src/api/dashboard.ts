import { apiClient } from "./client"
import type { DashboardSummary } from "@/types/dashboard"

export function getDashboardSummary(month: string): Promise<DashboardSummary> {
    return apiClient.get<DashboardSummary>(`/dashboard/summary/?month=${month}`)
}