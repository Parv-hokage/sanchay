import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { CatalogModule } from './catalog/catalog.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({
  imports: [PrismaModule, AuditModule, AuthModule, MeModule, CatalogModule, HealthModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
