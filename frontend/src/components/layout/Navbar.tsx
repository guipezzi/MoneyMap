import { NavLink } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/transactions", label: "Transações" },
]

export function Navbar() {
  const { logout } = useAuth()

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <span className="text-lg font-semibold text-foreground">
            MoneyMap
          </span>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <Button variant="outline" size="sm" onClick={logout}>
          Sair
        </Button>
      </div>
    </header>
  )
}