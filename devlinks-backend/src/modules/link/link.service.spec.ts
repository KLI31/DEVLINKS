import { BadRequestException } from '@nestjs/common';
import { LinkService } from './link.service';
import type { PrismaService } from '../../prisma/prisma.service';

describe('LinkService scheduling', () => {
  const prisma = {
    link: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
    },
  };
  const service = new LinkService(prisma as unknown as PrismaService);

  it('rechaza una fecha de fin anterior o igual al inicio', async () => {
    await expect(
      service.create('u1', {
        title: 'x',
        url: 'https://x.dev',
        scheduledStart: '2026-07-02T10:00:00.000Z',
        scheduledEnd: '2026-07-01T10:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.link.create).not.toHaveBeenCalled();
  });

  it('acepta una ventana válida', async () => {
    await service.create('u1', {
      title: 'x',
      url: 'https://x.dev',
      scheduledStart: '2026-07-01T10:00:00.000Z',
      scheduledEnd: '2026-07-02T10:00:00.000Z',
    });
    expect(prisma.link.create).toHaveBeenCalledTimes(1);
  });
});
