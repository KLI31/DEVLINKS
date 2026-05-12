import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SetPinnedReposDto } from './dto/set-pinned-repos.dto';
import { UpdateStickersDto } from './dto/update-stickers.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guards';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { GithubService } from '../github/github.service';
import { AnalyticsService } from '../analytics/analytics.service';
import type { JwtValidatedUser } from '../auth/strategies/jwt.strategy';
import type { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly githubService: GithubService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: JwtValidatedUser) {
    return this.userService.findMe(user.userId);
  }

  @Get('me/location-suggestion')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  getLocationSuggestion(@Req() req: Request) {
    // const forwarded = req.headers['x-forwarded-for'];
    // const ip =
    //   typeof forwarded === 'string'
    //     ? forwarded
    //     : (req.socket?.remoteAddress ?? '127.0.0.1');
    const temporalIp = '8.8.8.8';
    return this.userService.getLocationSuggestion(temporalIp);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@CurrentUser() user: JwtValidatedUser, @Body() dto: UpdateUserDto) {
    return this.userService.updateMe(user.userId, dto);
  }

  @Patch('me/stickers')
  @UseGuards(JwtAuthGuard)
  updateStickers(
    @CurrentUser() user: JwtValidatedUser,
    @Body() dto: UpdateStickersDto,
  ) {
    return this.userService.updateStickers(user.userId, dto);
  }

  @Post('me/change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  changePassword(
    @CurrentUser() user: JwtValidatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(user.userId, dto);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  deactivateMe(@CurrentUser() user: JwtValidatedUser) {
    return this.userService.deactivateMe(user.userId);
  }

  @Get('me/projects')
  @UseGuards(JwtAuthGuard)
  getMyProjects(@CurrentUser() user: JwtValidatedUser) {
    return this.userService.getMyProjects(user.userId);
  }

  @Post('me/pinned-repos')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  setPinnedRepos(
    @CurrentUser() user: JwtValidatedUser,
    @Body() dto: SetPinnedReposDto,
  ) {
    return this.userService.setPinnedRepos(user.userId, dto);
  }

  @Delete('me/projects/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  removeProject(
    @CurrentUser() user: JwtValidatedUser,
    @Param('id') id: string,
  ) {
    return this.userService.removeProject(user.userId, id);
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get(':username/github-stats')
  async getPublicGithubStats(@Param('username') username: string) {
    const profile = await this.userService.getPublicProfile(username);
    if (!profile.githubUsername) {
      throw new NotFoundException('GitHub no conectado');
    }
    return this.githubService.getStats(profile.githubUsername);
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get(':username/projects')
  getPublicProjects(@Param('username') username: string) {
    return this.userService.getPublicProjects(username);
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Get(':username')
  async getPublicProfile(
    @Param('username') username: string,
    @Req() req: Request,
  ) {
    const profile = await this.userService.getPublicProfile(username);

    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : (req.socket?.remoteAddress ?? '127.0.0.1');
    const userAgent = req.headers['user-agent'];
    const referrer = req.headers['referer'];

    // Fire-and-forget: no await para no bloquear la respuesta
    this.analyticsService
      .recordProfileView(profile.id, ip, userAgent, referrer)
      .catch(() => {
        // Silenciar errores de tracking
      });

    return profile;
  }
}
