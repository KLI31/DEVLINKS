import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SetPinnedReposDto } from './dto/set-pinned-repos.dto';
import { UpdateStickersDto } from './dto/update-stickers.dto';
import { ImportProfileDto } from './dto/import-profile.dto';
import { USER_MESSAGES } from '../../common/messages';
import { lookupIp, hashIp, type GeoResult } from './helpers/geo-ip.helper';
import type { User, Link, Prisma } from '@prisma/client';

export type UserPublic = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string | null;
  location: string | null;
  avatarUrl: string | null;
  githubUsername: string | null;
  theme: string;
  accentColor: string;
  buttonStyle: string;
  fontFamily: string;
  bgType: string;
  bgColor: string;
  profileLayout: string;
  coverImageUrl: string;
  stickers: Prisma.JsonValue | null;
  createdAt: Date;
};

export type UserProfile = Omit<UserPublic, 'email'> & {
  links: Pick<Link, 'id' | 'title' | 'url' | 'icon' | 'previewImage' | 'isPrimary' | 'layout' | 'displayOrder'>[];
};

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findMe(userId: string): Promise<UserPublic> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }
    return this.toUserPublic(user);
  }

  async updateMe(userId: string, dto: UpdateUserDto): Promise<UserPublic> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }

    if (dto.username && dto.username !== user.username) {
      const taken = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });
      if (taken) {
        throw new ConflictException(USER_MESSAGES.USERNAME_TAKEN);
      }
    }

    const data: Partial<{
      username: string;
      displayName: string;
      bio: string;
      location: string;
      avatarUrl: string;
      theme: string;
      accentColor: string;
      buttonStyle: string;
      fontFamily: string;
      bgType: string;
      bgColor: string;
      profileLayout: string;
      coverImageUrl: string;
      passwordHash: string;
    }> = {};

    if (dto.username !== undefined) data.username = dto.username;
    if (dto.displayName !== undefined) data.displayName = dto.displayName;
    if (dto.bio !== undefined) data.bio = dto.bio;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.avatarUrl !== undefined) data.avatarUrl = dto.avatarUrl;
    if (dto.theme !== undefined) data.theme = dto.theme;
    if (dto.accentColor !== undefined) data.accentColor = dto.accentColor;
    if (dto.buttonStyle !== undefined) data.buttonStyle = dto.buttonStyle;
    if (dto.fontFamily !== undefined) data.fontFamily = dto.fontFamily;
    if (dto.bgType !== undefined) data.bgType = dto.bgType;
    if (dto.bgColor !== undefined) data.bgColor = dto.bgColor;
    if (dto.profileLayout !== undefined) data.profileLayout = dto.profileLayout;
    if (dto.coverImageUrl !== undefined) data.coverImageUrl = dto.coverImageUrl;
    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 12);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return this.toUserPublic(updated);
  }

  async updateStickers(
    userId: string,
    dto: UpdateStickersDto,
  ): Promise<UserPublic> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        stickers: dto.stickers as unknown as Prisma.InputJsonValue,
      },
    });

    return this.toUserPublic(updated);
  }

  async getPublicProfile(username: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        links: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            title: true,
            url: true,
            icon: true,
            previewImage: true,
            isPrimary: true,
            layout: true,
            displayOrder: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio ?? null,
      location:
        ((user as Record<string, unknown>).location as string | null) ?? null,
      avatarUrl: user.avatarUrl ?? null,
      githubUsername: user.githubUsername ?? null,
      theme: user.theme,
      accentColor: user.accentColor,
      buttonStyle: user.buttonStyle,
      fontFamily: user.fontFamily,
      bgType: user.bgType,
      bgColor: user.bgColor,
      profileLayout: user.profileLayout,
      coverImageUrl: user.coverImageUrl,
      stickers: user.stickers ?? null,
      createdAt: user.createdAt,
      links: user.links,
    };
  }

  async getPublicProjects(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user || !user.isActive) {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }
    return this.prisma.project.findMany({
      where: { userId: user.id, isActive: true },
      orderBy: [{ pinned: 'desc' }, { stars: 'desc' }, { displayOrder: 'asc' }],
      select: {
        id: true,
        title: true,
        description: true,
        url: true,
        githubRepo: true,
        stars: true,
        language: true,
        imageUrl: true,
        pinned: true,
        displayOrder: true,
      },
    });
  }

  async getMyProjects(userId: string) {
    return this.prisma.project.findMany({
      where: { userId, isActive: true },
      orderBy: [{ pinned: 'desc' }, { stars: 'desc' }, { displayOrder: 'asc' }],
      select: {
        id: true,
        title: true,
        description: true,
        url: true,
        githubRepo: true,
        stars: true,
        language: true,
        pinned: true,
        displayOrder: true,
      },
    });
  }

  async setPinnedRepos(userId: string, dto: SetPinnedReposDto): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.project.deleteMany({ where: { userId } }),
      this.prisma.project.createMany({
        data: dto.repos.map((repo, index) => ({
          userId,
          title: repo.name,
          description: repo.description ?? null,
          url: repo.url,
          githubRepo: repo.githubRepo,
          stars: repo.stars,
          language: repo.language ?? null,
          pinned: true,
          displayOrder: index,
          isActive: true,
        })),
      }),
    ]);
  }

  async removeProject(userId: string, projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project || project.userId !== userId) {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }
    await this.prisma.project.delete({ where: { id: projectId } });
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException(USER_MESSAGES.WRONG_CURRENT_PASSWORD);
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: USER_MESSAGES.PASSWORD_CHANGED };
  }

  async deactivateMe(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    return { message: USER_MESSAGES.ACCOUNT_DEACTIVATED };
  }

  async getLocationSuggestion(rawIp: string): Promise<GeoResult> {
    const ip = rawIp.trim() || '127.0.0.1';
    const key = `geoip:${hashIp(ip)}`;
    const cached = await this.redis.getClient().get(key);

    if (cached) {
      return JSON.parse(cached) as GeoResult;
    }

    const result = lookupIp(ip);
    await this.redis.getClient().setex(key, 86400, JSON.stringify(result));
    return result;
  }

  async exportProfile(userId: string): Promise<Record<string, unknown>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        links: { orderBy: { displayOrder: 'asc' } },
        projects: { orderBy: { displayOrder: 'asc' } },
      },
    });

    if (!user || !user.isActive) {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }

    return {
      version: '1.0',
      profile: {
        displayName: user.displayName,
        bio: user.bio,
        location: user.location,
        avatarUrl: user.avatarUrl,
        githubUsername: user.githubUsername,
        theme: user.theme,
        accentColor: user.accentColor,
        buttonStyle: user.buttonStyle,
        fontFamily: user.fontFamily,
        bgType: user.bgType,
        bgColor: user.bgColor,
        profileLayout: user.profileLayout,
        coverImageUrl: user.coverImageUrl,
      },
      links: user.links.map((link) => ({
        title: link.title,
        url: link.url,
        icon: link.icon,
        previewImage: link.previewImage,
        isPrimary: link.isPrimary,
        layout: link.layout,
        displayOrder: link.displayOrder,
        isActive: link.isActive,
      })),
      stickers: (user.stickers as unknown as Array<Record<string, unknown>> | null) ?? [],
      projects: user.projects.map((project) => ({
        title: project.title,
        description: project.description,
        url: project.url,
        githubRepo: project.githubRepo,
        stars: project.stars,
        language: project.language,
        imageUrl: project.imageUrl,
        pinned: project.pinned,
        displayOrder: project.displayOrder,
      })),
    };
  }

  async importProfile(userId: string, dto: ImportProfileDto): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      if (dto.profile) {
        const data: Prisma.UserUpdateInput = {};
        const p = dto.profile;
        if (p.displayName !== undefined) data.displayName = p.displayName;
        if (p.bio !== undefined) data.bio = p.bio;
        if (p.location !== undefined) data.location = p.location;
        if (p.avatarUrl !== undefined) data.avatarUrl = p.avatarUrl;
        if (p.githubUsername !== undefined) data.githubUsername = p.githubUsername;
        if (p.theme !== undefined) data.theme = p.theme;
        if (p.accentColor !== undefined) data.accentColor = p.accentColor;
        if (p.buttonStyle !== undefined) data.buttonStyle = p.buttonStyle;
        if (p.fontFamily !== undefined) data.fontFamily = p.fontFamily;
        if (p.bgType !== undefined) data.bgType = p.bgType;
        if (p.bgColor !== undefined) data.bgColor = p.bgColor;
        if (p.profileLayout !== undefined) data.profileLayout = p.profileLayout;
        if (p.coverImageUrl !== undefined) data.coverImageUrl = p.coverImageUrl;

        await tx.user.update({ where: { id: userId }, data });
      }

      if (dto.links) {
        await tx.link.deleteMany({ where: { userId } });
        if (dto.links.length > 0) {
          await tx.link.createMany({
            data: dto.links.map((l, i) => ({
              userId,
              title: l.title,
              url: l.url,
              icon: l.icon ?? null,
              previewImage: l.previewImage ?? null,
              isPrimary: l.isPrimary ?? false,
              layout: l.layout ?? 'classic',
              displayOrder: l.displayOrder ?? i,
              isActive: l.isActive ?? true,
            })),
          });
        }
      }

      if (dto.stickers !== undefined) {
        await tx.user.update({
          where: { id: userId },
          data: { stickers: dto.stickers as unknown as Prisma.InputJsonValue },
        });
      }

      if (dto.projects) {
        await tx.project.deleteMany({ where: { userId } });
        if (dto.projects.length > 0) {
          await tx.project.createMany({
            data: dto.projects.map((p, i) => ({
              userId,
              title: p.title,
              description: p.description ?? null,
              url: p.url ?? null,
              githubRepo: p.githubRepo ?? null,
              stars: p.stars ?? 0,
              language: p.language ?? null,
              imageUrl: p.imageUrl ?? null,
              pinned: p.pinned ?? false,
              displayOrder: p.displayOrder ?? i,
              isActive: true,
            })),
          });
        }
      }
    });
  }

  private toUserPublic(user: User): UserPublic {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio ?? null,
      location: (user as User & { location?: string | null }).location ?? null,
      avatarUrl: user.avatarUrl ?? null,
      githubUsername: user.githubUsername ?? null,
      theme: user.theme,
      accentColor: user.accentColor,
      buttonStyle: user.buttonStyle,
      fontFamily: user.fontFamily,
      bgType: user.bgType,
      bgColor: user.bgColor,
      profileLayout: user.profileLayout,
      coverImageUrl: user.coverImageUrl,
      stickers: user.stickers ?? null,
      createdAt: user.createdAt,
    };
  }
}
