import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { Qwen3Adapter } from './provider/qwen3.adapter';
import { IntentDetectionService } from './services/intent-detection.service';
import { ContextBuilderService } from './services/context-builder.service';
import { CapabilityResolverService } from './services/capability-resolver.service';
import { ToolRegistryService } from './tools/tool-registry.service';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { ApplicationModule } from '../application/application.module';
import { DocumentModule } from '../document/document.module';
import { MeModule } from '../me/me.module';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [KnowledgeModule, ApplicationModule, DocumentModule, MeModule, CatalogModule],
  controllers: [AiController],
  providers: [
    AiService,
    Qwen3Adapter,
    IntentDetectionService,
    ContextBuilderService,
    CapabilityResolverService,
    ToolRegistryService,
  ],
  exports: [AiService],
})
export class AiModule {}
