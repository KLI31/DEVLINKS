import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LinkService } from './link.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { ReorderLinksDto } from './dto/reorder-links.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guards';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtValidatedUser } from '../auth/strategies/jwt.strategy';
import type { Request } from 'express';

@Controller('links')
@UseGuards(JwtAuthGuard)
export class LinkController {
  constructor(
    private readonly linkService: LinkService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /** Listar todos los links del usuario */
  @Get()
  findAll(@CurrentUser() user: JwtValidatedUser) {
    return this.linkService.findAll(user.userId);
  }

  /** Crear nuevo link */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@CurrentUser() user: JwtValidatedUser, @Body() dto: CreateLinkDto) {
    return this.linkService.create(user.userId, dto);
  }

  /** Reordenar links (bulk update) — debe ir antes de /:id */
  @Patch('reorder')
  @HttpCode(HttpStatus.OK)
  reorder(@CurrentUser() user: JwtValidatedUser, @Body() dto: ReorderLinksDto) {
    return this.linkService.reorder(user.userId, dto);
  }

  /** Editar link (título, URL, ícono, activo) */
  @Patch(':id')
  update(
    @CurrentUser() user: JwtValidatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateLinkDto,
  ) {
    return this.linkService.update(user.userId, id, dto);
  }

  /** Activar / desactivar link */
  @Patch(':id/toggle')
  @HttpCode(HttpStatus.OK)
  toggle(@CurrentUser() user: JwtValidatedUser, @Param('id') id: string) {
    return this.linkService.toggle(user.userId, id);
  }

  /** Eliminar link */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@CurrentUser() user: JwtValidatedUser, @Param('id') id: string) {
    return this.linkService.remove(user.userId, id);
  }

  /** Registrar click en un link (público) */
  @Public()
  @Post(':id/click')
  @HttpCode(HttpStatus.OK)
  async trackClick(@Param('id') id: string, @Req() req: Request) {
    const link = await this.linkService.findById(id);
    if (!link) {
      return { message: 'Link no encontrado' };
    }

    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : (req.socket?.remoteAddress ?? '127.0.0.1');
    const userAgent = req.headers['user-agent'];
    const referrer = req.headers['referer'];

    await this.analyticsService.recordLinkClick(
      link.id,
      link.userId,
      ip,
      userAgent,
      referrer,
    );

    return { message: 'Click registrado' };
  }
}
