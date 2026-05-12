import { apiService } from "./api-service";
import type { AuthResponse, RegisterPayload, LoginPayload } from "@/types/auth";

export const authApi = {
  register: (data: RegisterPayload) =>
    apiService.post<AuthResponse>("/auth/register", data),

  login: (data: LoginPayload) =>
    apiService.post<AuthResponse>("/auth/login", data),

  logout: () => apiService.post<void>("/auth/logout"),

  githubLogin: () => {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    window.location.assign(`${backendUrl}/auth/github`);
  },
};
