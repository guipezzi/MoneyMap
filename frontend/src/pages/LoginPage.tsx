import * as React from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { ApiError } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const DEMO_USERNAME = import.meta.env.VITE_DEMO_USERNAME
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD

export function LoginPage() {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  async function performLogin(usernameValue: string, passwordValue: string) {
    setError(null)
    try {
      await login({ username: usernameValue, password: passwordValue })
      navigate("/", { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError("Usuário ou senha inválidos.")
      } else {
        setError("Erro ao conectar com o servidor.")
      }
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    await performLogin(username, password)
  }

  async function handleDemoLogin() {
    await performLogin(DEMO_USERNAME, DEMO_PASSWORD)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Entrar no MoneyMap</CardTitle>
          <CardDescription>
            Informe suas credenciais para acessar o dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" disabled={isLoading} className="mt-2">
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            {DEMO_USERNAME && DEMO_PASSWORD && (
              <>
                <div className="relative my-1 text-center text-xs text-muted-foreground">
                  <span className="bg-card px-2 relative z-10">ou</span>
                  <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={handleDemoLogin}
                >
                  Entrar como visitante
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}