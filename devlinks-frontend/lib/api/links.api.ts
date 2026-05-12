import { apiService } from "./api-service";
import type { LinkItem, CreateLinkPayload, UpdateLinkPayload } from "@/types";

export const linksApi = {
  getAll: () => apiService.get<LinkItem[]>("/links"),

  create: (data: CreateLinkPayload) =>
    apiService.post<LinkItem>("/links", data),

  update: (id: string, data: UpdateLinkPayload) =>
    apiService.patch<LinkItem>(`/links/${id}`, data),

  remove: (id: string) =>
    apiService.delete<{ message: string }>(`/links/${id}`),

  reorder: (links: { id: string; displayOrder: number }[]) =>
    apiService.patch<{ message: string }>("/links/reorder", { links }),

  toggle: (id: string) =>
    apiService.patch<LinkItem>(`/links/${id}/toggle`),
};
