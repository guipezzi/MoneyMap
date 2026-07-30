import { Routes, Route } from "react-router-dom"
import { LoginPage } from "@/pages/LoginPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { AppLayout } from "@/components/layout/AppLayout"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App