import { useState, useEffect, useCallback } from "react"
import { getDashboardSummary } from "@/api/dashboard"
import type { DashboardSummary } from "@/types/dashboard"

export function useDashboard(month: string) {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getDashboardSummary(month)
      setData(result)
    } catch (err) {
      setError("Erro ao carregar o resumo financeiro.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return { data, loading, error, refetch: fetchSummary }
}