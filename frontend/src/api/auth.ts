import { apiClient } from "./client"
import type { AuthTokens, LoginCredentials, RegisterData } from "@/types/auth"

export function login(credentials: LoginCredentials): Promise<AuthTokens> {
  return apiClient.post<AuthTokens>("/auth/login/", credentials)
}

export function register(data: RegisterData): Promise<{ id: number; username: string; email: string }> {
  return apiClient.post("/auth/register/", data)
}

export function refreshToken(refresh: string): Promise<{ access: string }> {
  return apiClient.post<{ access: string }>("/auth/refresh/", { refresh })
}