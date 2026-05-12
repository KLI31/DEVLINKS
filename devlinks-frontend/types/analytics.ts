export interface AnalyticsSummary {
  totalClicks: number;
  profileViews: number;
  countriesReached: number;
  topLink: { id: string; title: string; clicks: number } | null;
}

export interface ClicksTimelinePoint {
  date: string;
  count: number;
}

export interface LinkStat {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  clicks: number;
  percentage: number;
}

export interface CountryStat {
  countryCode: string;
  country: string;
  count: number;
  lat: number;
  lng: number;
}

export interface ReferrerStat {
  referrer: string;
  count: number;
  percentage: number;
}

export interface DeviceStat {
  device: string;
  count: number;
}
