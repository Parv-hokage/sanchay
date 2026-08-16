import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { CatalogModule } from './catalog/catalog.module';
import { ApplicationModule } from './application/application.module';
import { StorageModule } from './storage/storage.module';
import { DocumentModule } from './document/document.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { AiModule } from './ai/ai.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    AuthModule,
    MeModule,
    CatalogModule,
    ApplicationModule,
    StorageModule,
    DocumentModule,
    KnowledgeModule,
    AiModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
