import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { CustomLogger } from './common/logger/custom-logger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
  });

  app.use(helmet());
  app.use(cookieParser());

  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter));

  if (process.env.ENABLE_SWAGGER === 'true') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('DevLinks API')
      .setDescription(
        'API para la plataforma DevLinks — hub de links para desarrolladores',
      )
      .setVersion('1.0')
      .addCookieAuth('accessToken')
      .addTag('auth', 'Autenticación y gestión de sesión')
      .addTag('user', 'Perfil de usuario')
      .addTag('links', 'Gestión de links')
      .addTag('github', 'Integración con GitHub')
      .addTag('analytics', 'Analítica de clicks y visitas')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  app.enableShutdownHooks();

  const PORT = process.env.PORT || 3001;

  await app.listen(PORT, () => {
    Logger.log(`🚀 Server running on port ${PORT}`, 'Bootstrap');
  });

  Logger.log(
    `📚 API Docs disponibles en: http://localhost:${PORT}/api/docs`,
    'Bootstrap',
  );
}

void bootstrap();
