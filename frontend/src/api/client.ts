const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, data: unknown, message: string) {
    super(message)
    this.status = status
    this.data = data
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("access_token")

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let data: unknown = null
    try {
      data = await response.json()
    } catch {
      // corpo vazio ou não-JSON
    }
    throw new ApiError(
      response.status,
      data,
      `Erro na requisição: ${response.status}`
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
}

export { ApiError }