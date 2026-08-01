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

// Paths que nunca devem disparar o fluxo de refresh (evita loop infinito)
const REFRESH_EXEMPT_PATHS = ["/auth/login/", "/auth/refresh/"]

// Deduplicação: se várias chamadas 401'arem ao mesmo tempo, só uma
// dispara o refresh de verdade; as outras esperam essa mesma Promise.
let refreshPromise: Promise<string> | null = null

async function performRefresh(): Promise<string> {
  const refresh = localStorage.getItem("refresh_token")

  if (!refresh) {
    throw new Error("Nenhum refresh token disponível")
  }

  // fetch nativo direto, sem passar por apiClient/auth.ts,
  // para evitar import circular entre client.ts e auth.ts
  const response = await fetch(`${API_URL}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  })

  if (!response.ok) {
    throw new Error("Refresh token inválido ou expirado")
  }

  const data = (await response.json()) as { access: string }
  localStorage.setItem("access_token", data.access)
  return data.access
}

function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

function handleSessionExpired() {
  localStorage.removeItem("access_token")
  localStorage.removeItem("refresh_token")
  window.dispatchEvent(new Event("auth:session-expired"))
}

/**
 * Faz o fetch com o token de autenticação, tratando automaticamente o
 * refresh no 401 (com retry único da requisição original). Retorna o
 * Response já validado (response.ok garantido) — quem chama decide como
 * ler o corpo (.json() para dados normais, .blob() para arquivos como PDF).
 */
async function fetchWithAuth(
  path: string,
  options: RequestInit = {},
  isRetry = false
): Promise<Response> {
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

  if (response.status === 401 && !isRetry && !REFRESH_EXEMPT_PATHS.includes(path)) {
    try {
      await refreshAccessToken()
    } catch {
      handleSessionExpired()
      throw new ApiError(401, null, "Sessão expirada. Faça login novamente.")
    }
    // refaz a requisição original UMA vez, já com o token novo
    return fetchWithAuth(path, options, true)
  }

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

  return response
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetchWithAuth(path, options)

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

async function requestBlob(path: string, options: RequestInit = {}): Promise<Blob> {
  const response = await fetchWithAuth(path, options)
  return response.blob()
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
  getBlob: (path: string) => requestBlob(path, { method: "GET" }),
}

export { ApiError }