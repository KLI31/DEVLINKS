import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AUTH_MESSAGES } from '../../common/messages';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { jwtConfig, parseDurationToDate } from '../../config/jwt.config';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import type { SignOptions } from 'jsonwebtoken';
import { JwtPayload } from './strategies/jwt.strategy';
import type { GithubProfileUser } from './strategies/github.strategy';
import { encryptGitHubToken } from './helpers/crypto.helper';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthUserPublic = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  githubUsername: string | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(
    dto: RegisterAuthDto,
  ): Promise<{ user: AuthUserPublic } & AuthTokens> {
    const taken = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (taken) {
      throw new ConflictException(AUTH_MESSAGES.EMAIL_OR_USERNAME_TAKEN);
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        passwordHash,
        displayName: dto.displayName,
      },
    });
    const tokens = await this.generateTokens(user.id, user.email);
    await this.persistRefreshToken(user.id, tokens.refreshToken);
    return { user: this.toPublicUser(user), ...tokens };
  }

  async login(
    dto: LoginAuthDto,
  ): Promise<{ user: AuthUserPublic } & AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user?.isActive) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }
    const tokens = await this.generateTokens(user.id, user.email);
    await this.persistRefreshToken(user.id, tokens.refreshToken);
    return { user: this.toPublicUser(user), ...tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const record = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });
    if (
      !record ||
      record.isRevoked ||
      record.expiresAt.getTime() <= Date.now()
    ) {
      throw new UnauthorizedException(AUTH_MESSAGES.REFRESH_TOKEN_INVALID);
    }
    if (!record.user.isActive) {
      throw new UnauthorizedException(AUTH_MESSAGES.ACCOUNT_INACTIVE);
    }
    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { isRevoked: true },
    });
    const tokens = await this.generateTokens(record.user.id, record.user.email);
    await this.persistRefreshToken(record.user.id, tokens.refreshToken);
    return tokens;
  }

  async getMe(userId: string): Promise<AuthUserPublic> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException(AUTH_MESSAGES.TOKEN_INVALID_OR_EXPIRED);
    }
    return this.toPublicUser(user);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken, isRevoked: false },
      data: { isRevoked: true },
    });
  }

  /**
   * Tras OAuth de GitHub: enlaza por email o githubUsername, o crea usuario OAuth-only.
   */
  async loginWithGithub(
    profile: GithubProfileUser,
  ): Promise<{ user: AuthUserPublic } & AuthTokens> {
    const githubTokenStored = encryptGitHubToken(profile.accessToken);
    const email =
      profile.email?.trim() || `oauth-${profile.githubId}@github.local`;

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(profile.username ? [{ githubUsername: profile.username }] : []),
          { email },
        ],
      },
    });

    if (!user) {
      const rawBase =
        profile.username?.replace(/[^a-zA-Z0-9._-]/g, '_') ||
        `gh${profile.githubId}`;
      let username = rawBase.slice(0, 50);
      let n = 0;
      while (await this.prisma.user.findUnique({ where: { username } })) {
        n += 1;
        const suffix = `_${n}`;
        username = `${rawBase.slice(0, 50 - suffix.length)}${suffix}`;
      }
      const passwordHash = await bcrypt.hash(
        randomBytes(32).toString('hex'),
        12,
      );
      user = await this.prisma.user.create({
        data: {
          username,
          email,
          passwordHash,
          displayName: profile.displayName?.trim() || username,
          githubUsername: profile.username ?? null,
          githubToken: githubTokenStored,
          avatarUrl: profile.avatarUrl ?? null,
        },
      });
    } else {
      if (!user.isActive) {
        throw new UnauthorizedException(AUTH_MESSAGES.ACCOUNT_INACTIVE);
      }
      const isGithubAvatar =
        !user.avatarUrl ||
        user.avatarUrl.includes('githubusercontent.com') ||
        user.avatarUrl.includes('github.com');

      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          githubToken: githubTokenStored,
          githubUsername: profile.username ?? user.githubUsername,
          avatarUrl: isGithubAvatar
            ? (profile.avatarUrl ?? user.avatarUrl)
            : user.avatarUrl,
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.persistRefreshToken(user.id, tokens.refreshToken);
    return { user: this.toPublicUser(user), ...tokens };
  }

  private async persistRefreshToken(
    userId: string,
    rawRefreshToken: string,
  ): Promise<void> {
    const raw =
      this.config.get<string>('REFRESH_TOKEN_EXPIRY') ??
      jwtConfig.refreshExpiresIn;
    const expiresAt = parseDurationToDate(raw);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: rawRefreshToken,
        expiresAt,
      },
    });
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: userId, email };
    const accessExpires =
      this.config.get<string>('JWT_EXPIRES_IN') ??
      this.config.get<string>('JWT_EXPIRY') ??
      '15m';
    const signOpts = { expiresIn: accessExpires } as SignOptions;
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, signOpts),
      Promise.resolve(randomBytes(48).toString('base64url')),
    ]);
    return { accessToken, refreshToken };
  }

  private toPublicUser(user: User): AuthUserPublic {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio ?? null,
      location:
        ((user as Record<string, unknown>).location as string | null) ?? null,
      avatarUrl: user.avatarUrl ?? null,
      githubUsername: user.githubUsername ?? null,
    };
  }
}
