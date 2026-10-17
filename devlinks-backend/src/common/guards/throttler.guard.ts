import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import { getClientIp } from '../utils/client-ip';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    return Promise.resolve(getClientIp(req as unknown as Request));
  }
}
