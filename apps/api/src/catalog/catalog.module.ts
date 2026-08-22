import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { JeeMainAdapter } from './adapters/jee-main.adapter';
import { NationalScholarshipAdapter } from './adapters/national-scholarship.adapter';
import { PlaygroundAdapter } from './adapters/playground.adapter';
import { ServiceRegistryService } from './service-registry.service';

@Module({
  controllers: [CatalogController],
  providers: [
    CatalogService,
    JeeMainAdapter,
    NationalScholarshipAdapter,
    PlaygroundAdapter,
    ServiceRegistryService,
  ],
  exports: [
    CatalogService,
    JeeMainAdapter,
    NationalScholarshipAdapter,
    PlaygroundAdapter,
    ServiceRegistryService,
  ],
})
export class CatalogModule {}
