import { apiService } from "./api-service";
import type {
  AnalyticsSummary,
  ClicksTimelinePoint,
  LinkStat,
  CountryStat,
  ReferrerStat,
  DeviceStat,
} from "@/types/analytics";

export const analyticsApi = {
  trackLinkClick: (linkId: string) =>
    apiService.post<void>(`/links/${linkId}/click`),

  getSummary: (days: 7 | 30 | 90) =>
    apiService.get<AnalyticsSummary>(`/analytics/summary?days=${days}`),

  getClicksTimeline: (days: 7 | 30 | 90) =>
    apiService.get<ClicksTimelinePoint[]>(`/analytics/clicks-timeline?days=${days}`),

  getLinksStats: (days: 7 | 30 | 90) =>
    apiService.get<LinkStat[]>(`/analytics/links-stats?days=${days}`),

  getCountries: (days: 7 | 30 | 90) =>
    apiService.get<CountryStat[]>(`/analytics/countries?days=${days}`),

  getReferrers: (days: 7 | 30 | 90) =>
    apiService.get<ReferrerStat[]>(`/analytics/referrers?days=${days}`),

  getDevices: (days: 7 | 30 | 90) =>
    apiService.get<DeviceStat[]>(`/analytics/devices?days=${days}`),
};
