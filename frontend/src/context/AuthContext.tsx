import * as React from "react"
import { login as apiLogin } from "@/api/auth"
import type { LoginCredentials } from "@/types/auth"

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(
    () => !!localStorage.getItem("access_token")
  )
  const [isLoading, setIsLoading] = React.useState(false)

  const login = React.useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const tokens = await apiLogin(credentials)
      localStorage.setItem("access_token", tokens.access)
      localStorage.setItem("refresh_token", tokens.refresh)
      setIsAuthenticated(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = React.useCallback(() => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    setIsAuthenticated(false)
  }, [])

  React.useEffect(() => {
    function handleSessionExpired() {
      setIsAuthenticated(false)
    }

    window.addEventListener("auth:session-expired", handleSessionExpired)
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired)
    }
  }, [])

  const value = React.useMemo(
    () => ({ isAuthenticated, isLoading, login, logout }),
    [isAuthenticated, isLoading, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}