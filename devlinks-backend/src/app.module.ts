import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { LinkModule } from './modules/link/link.module';
import { GithubModule } from './modules/github/github.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ThrottlerRedisStorage } from './common/throttler-redis.storage';
import { RedisService } from './redis/redis.service';
import { JwtAuthGuard } from './modules/auth/guards/jwt.auth.guards';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      inject: [RedisService],
      useFactory: (redisService: RedisService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: 60000,
            limit: 100,
            blockDuration: 60000,
          },
        ],
        storage: new ThrottlerRedisStorage(redisService),
      }),
    }),
    UserModule,
    LinkModule,
    GithubModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
