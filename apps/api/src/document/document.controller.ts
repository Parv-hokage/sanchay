import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { DocumentService } from './document.service';
import { UploadDocumentDto, DocumentQueryDto, AccessDocumentDto } from './dto/document.dto';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload and securely register a citizen document' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  async uploadDocument(
    @Req() req: Request & { user: any; requestId: string },
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    const doc = await this.documentService.uploadDocument(
      req.user.id,
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
      dto,
      req.requestId || 'req-' + Date.now(),
      req.ip,
      req.headers['user-agent'],
    );

    return {
      success: true,
      message: 'Document uploaded successfully and queued for security scanning.',
      data: doc,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List citizen documents in private vault' })
  async listDocuments(
    @Req() req: Request & { user: any },
    @Query() query: DocumentQueryDto,
  ) {
    const docs = await this.documentService.listDocuments(req.user.id, query);
    return {
      success: true,
      data: docs,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document metadata by ID' })
  async getDocument(
    @Req() req: Request & { user: any },
    @Param('id') id: string,
  ) {
    const doc = await this.documentService.getDocumentById(req.user.id, id);
    return {
      success: true,
      data: doc,
    };
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Securely download verified citizen document' })
  async downloadDocument(
    @Req() req: Request & { user: any; requestId: string },
    @Param('id') id: string,
    @Query() accessDto: AccessDocumentDto,
    @Res() res: Response,
  ) {
    const { buffer, mimeType, filename } = await this.documentService.downloadDocument(
      req.user.id,
      id,
      accessDto.purpose,
      req.requestId || 'req-' + Date.now(),
      req.ip,
      req.headers['user-agent'],
    );

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete citizen document' })
  async deleteDocument(
    @Req() req: Request & { user: any; requestId: string },
    @Param('id') id: string,
  ) {
    const result = await this.documentService.deleteDocument(
      req.user.id,
      id,
      req.requestId || 'req-' + Date.now(),
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get document access audit logs' })
  async getAccessLogs(
    @Req() req: Request & { user: any },
    @Param('id') id: string,
  ) {
    const logs = await this.documentService.getAccessLogs(req.user.id, id);
    return {
      success: true,
      data: logs,
    };
  }
}
