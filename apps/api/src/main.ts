import './common/bootstrap-aliases';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { appConfig } from '@sanchay/config';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security Headers (Helmet)
  app.use(
    helmet({
      contentSecurityPolicy: appConfig.NODE_ENV === 'production' ? undefined : false,
    }),
  );

  // CORS Configuration
  const allowedOrigins = appConfig.CORS_ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS origin blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'Idempotency-Key'],
  });

  // Global Prefix for Versioned API
  app.setGlobalPrefix('api/v1');

  // Global Pipelines & Filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SANCHAY API')
    .setDescription('Unified Government Digital Service Platform — API Specification')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // Graceful Shutdown
  app.enableShutdownHooks();

  const port = appConfig.PORT;
  await app.listen(port);
  logger.log(`SANCHAY API running on http://localhost:${port}/api/v1 (Environment: ${appConfig.NODE_ENV})`);
  logger.log(`API Documentation available at http://localhost:${port}/docs`);
}

bootstrap().catch((err) => {
  console.error('Fatal error during application startup:', err);
  process.exit(1);
});
