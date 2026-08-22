import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { JeeMainAdapter } from './adapters/jee-main.adapter';
import { NationalScholarshipAdapter } from './adapters/national-scholarship.adapter';
import { ServiceRegistryService } from './service-registry.service';

@Module({
  controllers: [CatalogController],
  providers: [
    CatalogService,
    JeeMainAdapter,
    NationalScholarshipAdapter,
    ServiceRegistryService,
  ],
  exports: [
    CatalogService,
    JeeMainAdapter,
    NationalScholarshipAdapter,
    ServiceRegistryService,
  ],
})
export class CatalogModule {}
