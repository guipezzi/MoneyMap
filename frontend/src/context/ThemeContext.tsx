import * as React from "react"

type Theme = "light" | "dark"

interface ThemeContextValue {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
    undefined
)

function getInitialTheme(): Theme {
    const stored = localStorage.getItem("theme")
    if (stored === "light" || stored === "dark") {
        return stored
    }
    
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    return prefersDark ? "dark" : "light"
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = React.useState<Theme>(getInitialTheme)

    React.useEffect(() => {
        const root = document.documentElement
        if (theme === "dark") {
            root.classList.add("dark")
        } else {
            root.classList.remove("dark")
        }
        localStorage.setItem("theme", theme)
    }, [theme])

    const toggleTheme = React.useCallback(() => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"))
    }, [])

    const value = React.useMemo(
        () => ({ theme, toggleTheme }),
        [theme, toggleTheme]
    )

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = React.useContext(ThemeContext)
    if (!context) {
        throw new Error("useTheme deve ser usado dentro de um ThemeProvider")
    }
    return context
}