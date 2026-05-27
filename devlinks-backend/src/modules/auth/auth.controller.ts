import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { GithubAuthGuard } from './guards/github.auth.guards';
import type { GithubProfileUser } from './strategies/github.strategy';
import { JwtAuthGuard } from './guards/jwt.auth.guards';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { AUTH_MESSAGES } from '../../common/messages';

const ACCESS_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 15 * 60 * 1000, // 15 minutos
};

const REFRESH_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.register(dto);

    res.cookie('accessToken', accessToken, ACCESS_COOKIE);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE);
    return { user };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.login(dto);
    res.cookie('accessToken', accessToken, ACCESS_COOKIE);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE);
    return { user };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      req.cookies?.refreshToken ?? req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException(AUTH_MESSAGES.REFRESH_TOKEN_INVALID);
    }
    const tokens = await this.authService.refresh(refreshToken);
    res.cookie('accessToken', tokens.accessToken, ACCESS_COOKIE);
    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE);
    return tokens;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken =
      req.cookies?.refreshToken ?? req.cookies?.refresh_token;

    if (refreshToken) {
      await this.authService.logout(refreshToken).catch(() => null);
    }

    res.cookie('accessToken', '', { ...ACCESS_COOKIE, maxAge: 0 });
    res.cookie('refreshToken', '', { ...REFRESH_COOKIE, maxAge: 0 });
    return { message: AUTH_MESSAGES.LOGOUT_SUCCESS };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: { userId: string }) {
    return this.authService.getMe(user.userId);
  }

  @Public()
  @Get('github')
  @UseGuards(GithubAuthGuard)
  githubAuth(): void {
    // Passport redirige al authorize de GitHub
  }

  @Public()
  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  async githubCallback(
    @Req() req: Request & { user: GithubProfileUser },
    @Res() res: Response,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.loginWithGithub(req.user);

    res.cookie('accessToken', accessToken, ACCESS_COOKIE);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE);

    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?login=github`,
    );
  }
}
