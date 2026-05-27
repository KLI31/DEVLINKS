import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guards';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtValidatedUser } from '../auth/strategies/jwt.strategy';

@ApiTags('analytics')
@ApiCookieAuth('accessToken')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  getSummary(
    @CurrentUser() user: JwtValidatedUser,
    @Query('days') days: string,
  ) {
    return this.analyticsService.getSummary(user.userId, days);
  }

  @Get('clicks-timeline')
  getClicksTimeline(
    @CurrentUser() user: JwtValidatedUser,
    @Query('days') days: string,
  ) {
    return this.analyticsService.getClicksTimeline(user.userId, days);
  }

  @Get('links-stats')
  getLinksStats(
    @CurrentUser() user: JwtValidatedUser,
    @Query('days') days: string,
  ) {
    return this.analyticsService.getLinksStats(user.userId, days);
  }

  @Get('countries')
  getCountries(
    @CurrentUser() user: JwtValidatedUser,
    @Query('days') days: string,
  ) {
    return this.analyticsService.getCountries(user.userId, days);
  }

  @Get('referrers')
  getReferrers(
    @CurrentUser() user: JwtValidatedUser,
    @Query('days') days: string,
  ) {
    return this.analyticsService.getReferrers(user.userId, days);
  }

  @Get('devices')
  getDevices(
    @CurrentUser() user: JwtValidatedUser,
    @Query('days') days: string,
  ) {
    return this.analyticsService.getDevices(user.userId, days);
  }
}
