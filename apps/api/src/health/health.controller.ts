import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { appConfig } from '@sanchay/config';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'System Health Check' })
  async getHealth() {
    let dbStatus = 'UNKNOWN';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'CONNECTED';
    } catch {
      dbStatus = 'DISCONNECTED';
    }

    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'SANCHAY API',
      version: '0.1.0',
      environment: appConfig.NODE_ENV,
      database: dbStatus,
      uptimeSeconds: process.uptime(),
    };
  }
}
