import {
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import type { Response } from 'express';

type PrismaError = { code: string; meta?: unknown };

function isPrismaError(e: unknown): e is PrismaError {
  return typeof e === 'object' && e !== null && 'code' in e;
}

@Catch()
export class GlobalExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      super.catch(exception, host);
      return;
    }

    if (isPrismaError(exception)) {
      if (exception.code === 'P2002') {
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: 'El recurso ya existe',
        });
        return;
      }
      if (exception.code === 'P2025') {
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Recurso no encontrado',
        });
        return;
      }
    }

    this.logger.error(
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
