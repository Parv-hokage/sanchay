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
    const result = await this.knowledgeService.searchKnowledge(searchDto);
    return {
      success: true,
      data: result,
    };
  }

  @Get('sources')
  @ApiOperation({ summary: 'List registered official government knowledge sources' })
  async listSources(@Query('serviceId') serviceId?: string) {
    const sources = await this.knowledgeService.listSources(serviceId);
    return {
      success: true,
      data: sources,
    };
  }

  @Post('sources')
  @ApiOperation({ summary: 'Register an official government source (Protected by SSRF allowlist)' })
  async registerSource(@Body() createDto: CreateSourceDto) {
    const source = await this.knowledgeService.registerSource(createDto);
    return {
      success: true,
      message: 'Official government source registered and verified.',
      data: source,
    };
  }

  @Post('sources/:id/sync')
  @ApiOperation({ summary: 'Trigger ingestion synchronization for an official knowledge source' })
  async syncSource(@Param('id') id: string) {
    const result = await this.knowledgeService.syncSource(id);
    return {
      success: true,
      data: result,
    };
  }
}
