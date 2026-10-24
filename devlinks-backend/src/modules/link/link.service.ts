import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { ReorderLinksDto } from './dto/reorder-links.dto';
import { LINK_MESSAGES } from '../../common/messages';
import type { Link } from '@prisma/client';

export type LinkPublic = Pick<
  Link,
  | 'id'
  | 'userId'
  | 'title'
  | 'url'
  | 'icon'
  | 'previewImage'
  | 'isPrimary'
  | 'layout'
  | 'displayOrder'
  | 'isActive'
  | 'clicksCount'
  | 'scheduledStart'
  | 'scheduledEnd'
  | 'createdAt'
  | 'updatedAt'
>;

const LINK_SELECT = {
  id: true,
  userId: true,
  title: true,
  url: true,
  icon: true,
  previewImage: true,
  isPrimary: true,
  layout: true,
  displayOrder: true,
  isActive: true,
  clicksCount: true,
  scheduledStart: true,
  scheduledEnd: true,
  createdAt: true,
  updatedAt: true,
} as const;

function assertValidSchedule(start?: Date | null, end?: Date | null) {
  if (start && end && end <= start) {
    throw new BadRequestException(LINK_MESSAGES.INVALID_SCHEDULE);
  }
}

function toDate(value?: string | null): Date | null | undefined {
  return value === undefined || value === null ? value : new Date(value);
}

@Injectable()
export class LinkService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<LinkPublic[]> {
    return this.prisma.link.findMany({
      where: { userId },
      orderBy: { displayOrder: 'asc' },
      select: LINK_SELECT,
    });
  }

  async create(userId: string, dto: CreateLinkDto): Promise<LinkPublic> {
    const last = await this.prisma.link.findFirst({
      where: { userId },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });

    const displayOrder = last ? last.displayOrder + 1 : 0;

    assertValidSchedule(toDate(dto.scheduledStart), toDate(dto.scheduledEnd));

    return this.prisma.link.create({
      data: {
        userId,
        title: dto.title,
        url: dto.url,
        icon: dto.icon ?? null,
        previewImage: dto.previewImage ?? null,
        isPrimary: dto.isPrimary ?? false,
        layout: dto.layout ?? 'classic',
        scheduledStart: toDate(dto.scheduledStart) ?? null,
        scheduledEnd: toDate(dto.scheduledEnd) ?? null,
        displayOrder,
      },
      select: LINK_SELECT,
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateLinkDto,
  ): Promise<LinkPublic> {
    const current = await this.assertOwnership(userId, id);

    const start =
      dto.scheduledStart !== undefined
        ? toDate(dto.scheduledStart)
        : current.scheduledStart;
    const end =
      dto.scheduledEnd !== undefined
        ? toDate(dto.scheduledEnd)
        : current.scheduledEnd;
    assertValidSchedule(start, end);

    return this.prisma.link.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.url !== undefined && { url: dto.url }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.previewImage !== undefined && {
          previewImage: dto.previewImage,
        }),
        ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.layout !== undefined && { layout: dto.layout }),
        ...(dto.scheduledStart !== undefined && { scheduledStart: start }),
        ...(dto.scheduledEnd !== undefined && { scheduledEnd: end }),
      },
      select: LINK_SELECT,
    });
  }

  async remove(userId: string, id: string): Promise<{ message: string }> {
    await this.assertOwnership(userId, id);

    await this.prisma.link.delete({ where: { id } });

    return { message: LINK_MESSAGES.DELETED };
  }

  async reorder(
    userId: string,
    dto: ReorderLinksDto,
  ): Promise<{ message: string }> {
    const ids = dto.links.map((l) => l.id);

    const owned = await this.prisma.link.findMany({
      where: { id: { in: ids }, userId },
      select: { id: true },
    });

    if (owned.length !== ids.length) {
      throw new ForbiddenException(LINK_MESSAGES.FORBIDDEN);
    }

    await this.prisma.$transaction(
      dto.links.map(({ id, displayOrder }) =>
        this.prisma.link.update({
          where: { id },
          data: { displayOrder },
        }),
      ),
    );

    return { message: LINK_MESSAGES.REORDERED };
  }

  async toggle(userId: string, id: string): Promise<LinkPublic> {
    const link = await this.assertOwnership(userId, id);

    return this.prisma.link.update({
      where: { id },
      data: { isActive: !link.isActive },
      select: LINK_SELECT,
    });
  }

  async findById(id: string): Promise<LinkPublic | null> {
    return this.prisma.link.findUnique({
      where: { id },
      select: LINK_SELECT,
    });
  }

  private async assertOwnership(
    userId: string,
    id: string,
  ): Promise<
    Pick<Link, 'id' | 'userId' | 'isActive' | 'scheduledStart' | 'scheduledEnd'>
  > {
    const link = await this.prisma.link.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        isActive: true,
        scheduledStart: true,
        scheduledEnd: true,
      },
    });

    if (!link) {
      throw new NotFoundException(LINK_MESSAGES.NOT_FOUND);
    }

    if (link.userId !== userId) {
      throw new ForbiddenException(LINK_MESSAGES.FORBIDDEN);
    }

    return link;
  }
}
