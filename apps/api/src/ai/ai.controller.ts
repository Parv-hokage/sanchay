import { Controller, Post, Get, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AiChatDto } from '@sanchay/types';

@ApiTags('AI Orchestrator')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Conversational AI endpoint with intent resolution, RAG citations, and tool actions' })
  async chat(@Body() dto: AiChatDto, @Req() req: any) {
    return this.aiService.processChatMessage(dto, req.user);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'List citizen AI conversations' })
  async listConversations(@Req() req: any) {
    return this.aiService.listConversations(req.user);
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get AI conversation history with citations and action payloads' })
  async getConversation(@Param('id') id: string, @Req() req: any) {
    return this.aiService.getConversation(id, req.user);
  }

  @Post('conversations/:id/confirm')
  @ApiOperation({ summary: 'Confirm consequential high-risk AI action with anti-replay protection' })
  async confirmAction(
    @Param('id') conversationId: string,
    @Body() body: { actionCardId: string; toolId: string; payload: Record<string, any> },
    @Req() req: any,
  ) {
    const result = await this.aiService.confirmToolAction(
      conversationId,
      body.actionCardId,
      body.toolId,
      body.payload,
      req.user,
    );
    return result;
  }
}
