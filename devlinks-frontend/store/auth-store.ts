import { create } from "zustand";
import type {
  AuthStore,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";
import { apiService } from "@/lib/api/api-service";

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setLoading: (value) => set({ isLoading: value }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  login: async (payload: LoginPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.post<{ user: AuthUser }>(
        "/auth/login",
        payload,
      );
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al iniciar sesión";
      set({
        error: message,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },

  register: async (payload: RegisterPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.post<{ user: AuthUser }>(
        "/auth/register",
        payload,
      );
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al crear cuenta";
      set({
        error: message,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiService.post("/auth/logout");
    } catch {
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  hydrate: async () => {
    set({ isLoading: true });
    try {
      const user = await apiService.get<AuthUser>("/auth/me");

      set({ user, isAuthenticated: true, isLoading: false, error: null });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },
}));
