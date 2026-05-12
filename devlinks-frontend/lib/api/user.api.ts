import { apiService } from "./api-service";
import type { UserProfile, PublicProfile, UpdateProfilePayload, Project, PinnedRepoPayload, PlacedSticker } from "@/types";

export interface GeoResult {
  city: string | null;
  country: string | null;
  countryCode: string | null;
  formatted: string | null;
}

export const userApi = {
  me: () => apiService.get<UserProfile>("/user/me"),

  updateProfile: (data: UpdateProfilePayload) =>
    apiService.patch<UserProfile>("/user/me", data),

  getPublicProfile: (username: string) =>
    apiService.get<PublicProfile>(`/user/${username}`),

  getMyProjects: () =>
    apiService.get<Project[]>("/user/me/projects"),

  setPinnedRepos: (repos: PinnedRepoPayload[]) =>
    apiService.post<void>("/user/me/pinned-repos", { repos }),

  getPublicProjects: (username: string) =>
    apiService.get<Project[]>(`/user/${username}/projects`),

  getLocationSuggestion: () =>
    apiService.get<GeoResult>("/user/me/location-suggestion"),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiService.post<{ message: string }>("/user/me/change-password", data),

  deactivateAccount: () =>
    apiService.delete<{ message: string }>("/user/me"),

  updateStickers: (stickers: PlacedSticker[]) =>
    apiService.patch<void>("/user/me/stickers", { stickers }),
};
