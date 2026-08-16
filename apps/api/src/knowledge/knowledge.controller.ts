import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeSearchDto, CreateSourceDto } from './dto/knowledge.dto';

@ApiTags('Knowledge & RAG')
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('search')
  @ApiOperation({ summary: 'Hybrid RAG retrieval searching official government knowledge with citations' })
  async searchKnowledge(@Query() searchDto: KnowledgeSearchDto) {
    return this.knowledgeService.searchKnowledge(searchDto);
  }

  @Get('sources')
  @ApiOperation({ summary: 'List registered official government knowledge sources' })
  async listSources(@Query('serviceId') serviceId?: string) {
    return this.knowledgeService.listSources(serviceId);
  }

  @Post('sources')
  @ApiOperation({ summary: 'Register an official government source (Protected by SSRF allowlist)' })
  async registerSource(@Body() createDto: CreateSourceDto) {
    return this.knowledgeService.registerSource(createDto);
  }

  @Post('sources/:id/sync')
  @ApiOperation({ summary: 'Trigger ingestion synchronization for an official knowledge source' })
  async syncSource(@Param('id') id: string) {
    return this.knowledgeService.syncSource(id);
  }
}
