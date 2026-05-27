import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { lookupIp, hashIp } from '../user/helpers/geo-ip.helper';

const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  US: [37.09, -95.71], MX: [23.63, -102.55], CA: [56.13, -106.35],
  GB: [55.38, -3.44], DE: [51.17, 10.45], FR: [46.23, 2.21],
  ES: [40.46, -3.75], IT: [41.87, 12.57], BR: [-14.24, -51.93],
  AR: [-38.42, -63.62], CO: [4.57, -74.3], CL: [-35.68, -71.54],
  PE: [-9.19, -75.02], VE: [6.42, -66.59], EC: [-1.83, -78.18],
  CN: [35.86, 104.2], JP: [36.2, 138.25], KR: [35.91, 127.77],
  IN: [20.59, 78.96], RU: [61.52, 105.32], AU: [-25.27, 133.78],
  NL: [52.13, 5.29], PL: [51.92, 19.15], SE: [60.13, 18.64],
  NO: [60.47, 8.47], DK: [56.26, 9.5], FI: [61.92, 25.75],
  PT: [39.4, -8.22], ZA: [-30.56, 22.94], NG: [9.08, 8.68],
  EG: [26.82, 30.8], KE: [-0.02, 37.91], MA: [31.79, -7.09],
  IL: [31.05, 34.85], TR: [38.96, 35.24], SA: [23.89, 45.08],
  AE: [23.42, 53.85], SG: [1.35, 103.82], TH: [15.87, 100.99],
  ID: [-0.79, 113.92], PH: [12.88, 121.77], VN: [14.06, 108.28],
  NZ: [-40.9, 174.89],
};

function getStartDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
}

function parseDays(daysQuery: string | undefined): number {
  const num = Number.parseInt(daysQuery ?? '30', 10);
  if (num === 7 || num === 30 || num === 90) return num;
  return 30;
}

function parseUserAgent(userAgent: string | undefined): string {
  if (!userAgent) return 'Unknown';
  const ua = userAgent.toLowerCase();
  if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider')) {
    return 'Bot';
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'Tablet';
  }
  if (
    ua.includes('mobile') ||
    ua.includes('android') ||
    ua.includes('iphone')
  ) {
    return 'Mobile';
  }
  return 'Desktop';
}

function cleanReferrer(referrer: string | null | undefined): string {
  if (!referrer || referrer === 'null' || referrer === '') {
    return 'direct';
  }
  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./, '');
  } catch {
    return referrer;
  }
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(userId: string, daysQuery: string | undefined) {
    const days = parseDays(daysQuery);
    const startDate = getStartDate(days);

    const [totalClicksResult, profileViewsResult, countriesResult, topLink] =
      await Promise.all([
        this.prisma.link.aggregate({
          where: { userId },
          _sum: { clicksCount: true },
        }),
        this.prisma.profileView.count({
          where: { userId, viewedAt: { gte: startDate } },
        }),
        this.prisma.linkAnalytic.findMany({
          where: {
            link: { userId },
            clickedAt: { gte: startDate },
            countryCode: { not: null },
          },
          distinct: ['countryCode'],
          select: { countryCode: true },
        }),
        this.prisma.link.findFirst({
          where: { userId },
          orderBy: { clicksCount: 'desc' },
          select: { id: true, title: true, clicksCount: true },
        }),
      ]);

    return {
      totalClicks: totalClicksResult._sum.clicksCount ?? 0,
      profileViews: profileViewsResult,
      countriesReached: countriesResult.length,
      topLink: topLink
        ? {
            id: topLink.id,
            title: topLink.title,
            clicks: topLink.clicksCount,
          }
        : null,
    };
  }

  async getClicksTimeline(userId: string, daysQuery: string | undefined) {
    const days = parseDays(daysQuery);
    const startDate = getStartDate(days);

    const analytics = await this.prisma.linkAnalytic.findMany({
      where: {
        link: { userId },
        clickedAt: { gte: startDate },
      },
      select: { clickedAt: true },
      orderBy: { clickedAt: 'asc' },
    });

    const groups = new Map<string, number>();

    for (const a of analytics) {
      const key = a.clickedAt.toISOString().slice(0, 10);
      groups.set(key, (groups.get(key) ?? 0) + 1);
    }

    const result: { date: string; count: number }[] = [];
    const current = new Date(startDate);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    while (current <= end) {
      const key = current.toISOString().slice(0, 10);
      result.push({ date: key, count: groups.get(key) ?? 0 });
      current.setDate(current.getDate() + 1);
    }

    return result;
  }

  async getLinksStats(userId: string, daysQuery: string | undefined) {
    const days = parseDays(daysQuery);
    const startDate = getStartDate(days);

    const links = await this.prisma.link.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        url: true,
        icon: true,
        clicksCount: true,
      },
      orderBy: { displayOrder: 'asc' },
    });

    const analytics = await this.prisma.linkAnalytic.groupBy({
      by: ['linkId'],
      where: {
        link: { userId },
        clickedAt: { gte: startDate },
      },
      _count: { linkId: true },
    });

    const clicksMap = new Map(
      analytics.map((a) => [a.linkId, a._count.linkId]),
    );

    const totalClicksInRange = analytics.reduce(
      (sum, a) => sum + a._count.linkId,
      0,
    );

    return links.map((link) => {
      const clicks = clicksMap.get(link.id) ?? 0;
      const percentage =
        totalClicksInRange > 0
          ? Math.round((clicks / totalClicksInRange) * 100)
          : 0;

      return {
        id: link.id,
        title: link.title,
        url: link.url,
        icon: link.icon,
        clicks,
        percentage,
      };
    });
  }

  async getCountries(userId: string, daysQuery: string | undefined) {
    const days = parseDays(daysQuery);
    const startDate = getStartDate(days);

    const rows = await this.prisma.linkAnalytic.groupBy({
      by: ['countryCode'],
      where: {
        link: { userId },
        clickedAt: { gte: startDate },
        countryCode: { not: null },
      },
      _count: { countryCode: true },
    });

    const displayNames = new Intl.DisplayNames(['es'], { type: 'region' });
    return rows.map((row) => {
      const countryCode = row.countryCode!;
      const [lat, lng] = COUNTRY_CENTROIDS[countryCode] ?? [0, 0];
      const countryName = displayNames.of(countryCode) ?? countryCode;

      return {
        countryCode,
        country: countryName,
        count: row._count.countryCode,
        lat,
        lng,
      };
    });
  }

  async getReferrers(userId: string, daysQuery: string | undefined) {
    const days = parseDays(daysQuery);
    const startDate = getStartDate(days);

    const analytics = await this.prisma.linkAnalytic.findMany({
      where: {
        link: { userId },
        clickedAt: { gte: startDate },
      },
      select: { referrer: true },
    });

    const groups = new Map<string, number>();
    for (const a of analytics) {
      const key = cleanReferrer(a.referrer);
      groups.set(key, (groups.get(key) ?? 0) + 1);
    }

    const total = analytics.length;
    const result = Array.from(groups.entries())
      .map(([referrer, count]) => ({
        referrer,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    return result;
  }

  async getDevices(userId: string, daysQuery: string | undefined) {
    const days = parseDays(daysQuery);
    const startDate = getStartDate(days);

    const analytics = await this.prisma.linkAnalytic.findMany({
      where: {
        link: { userId },
        clickedAt: { gte: startDate },
      },
      select: { userAgent: true },
    });

    const groups = new Map<string, number>();
    for (const a of analytics) {
      const device = parseUserAgent(a.userAgent ?? undefined);
      groups.set(device, (groups.get(device) ?? 0) + 1);
    }

    return Array.from(groups.entries())
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);
  }

  async recordLinkClick(
    linkId: string,
    userId: string,
    rawIp: string | undefined,
    userAgent: string | undefined,
    referrer: string | undefined,
  ): Promise<void> {
    const ip = rawIp ? hashIp(rawIp) : null;
    const geo = rawIp ? lookupIp(rawIp) : null;

    await this.prisma.$transaction([
      this.prisma.link.update({
        where: { id: linkId },
        data: { clicksCount: { increment: 1 } },
      }),
      this.prisma.linkAnalytic.create({
        data: {
          linkId,
          visitorIp: ip,
          userAgent: userAgent ?? null,
          referrer: referrer ?? null,
          countryCode: geo?.countryCode ?? null,
        },
      }),
    ]);
  }

  async recordProfileView(
    userId: string,
    rawIp: string | undefined,
    userAgent: string | undefined,
    referrer: string | undefined,
  ): Promise<void> {
    const ip = rawIp ? hashIp(rawIp) : null;
    const geo = rawIp ? lookupIp(rawIp) : null;

    await this.prisma.profileView.create({
      data: {
        userId,
        visitorIp: ip,
        userAgent: userAgent ?? null,
        referrer: referrer ?? null,
        countryCode: geo?.countryCode ?? null,
      },
    });
  }
}
