import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApplicationService } from './application.service';
import { CreateApplicationDto, UpdateFieldsDto, AutofillRequestDto } from './dto/application.dto';
import { ApplicationStatus } from '@prisma/client';

@ApiTags('Applications')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new draft application from capability requirements' })
  async createApplication(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationService.createApplication(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List citizen applications with optional filters' })
  @ApiQuery({ name: 'serviceId', required: false })
  @ApiQuery({ name: 'status', enum: ApplicationStatus, required: false })
  async getApplications(
    @CurrentUser('userId') userId: string,
    @Query('serviceId') serviceId?: string,
    @Query('status') status?: ApplicationStatus,
  ) {
    return this.applicationService.getUserApplications(userId, serviceId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application details and fields (ownership protected)' })
  async getApplication(
    @CurrentUser('userId') userId: string,
    @Param('id') applicationId: string,
  ) {
    return this.applicationService.getApplicationById(userId, applicationId);
  }

  @Patch(':id/fields')
  @ApiOperation({ summary: 'Update field values and advance wizard step' })
  async updateFields(
    @CurrentUser('userId') userId: string,
    @Param('id') applicationId: string,
    @Body() dto: UpdateFieldsDto,
  ) {
    return this.applicationService.updateFields(userId, applicationId, dto);
  }

  @Post(':id/autofill')
  @ApiOperation({ summary: 'Request deterministic auto-fill from verified citizen profile' })
  async autofillApplication(
    @CurrentUser('userId') userId: string,
    @Param('id') applicationId: string,
    @Body() dto: AutofillRequestDto,
  ) {
    return this.applicationService.autofillApplication(userId, applicationId, dto);
  }

  @Get(':id/review')
  @ApiOperation({ summary: 'Get application review representation' })
  async getReview(
    @CurrentUser('userId') userId: string,
    @Param('id') applicationId: string,
  ) {
    return this.applicationService.getApplicationReview(userId, applicationId);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: 'Explicit citizen confirmation of reviewed application' })
  async confirmApplication(
    @CurrentUser('userId') userId: string,
    @Param('id') applicationId: string,
  ) {
    return this.applicationService.confirmApplication(userId, applicationId);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit confirmed application to adapter boundary' })
  @ApiHeader({ name: 'Idempotency-Key', required: false, description: 'Unique idempotency key' })
  async submitApplication(
    @CurrentUser('userId') userId: string,
    @Param('id') applicationId: string,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.applicationService.submitApplication(userId, applicationId, idempotencyKey);
  }

  @Get(':id/events')
  @ApiOperation({ summary: 'Get application lifecycle events and audit timeline' })
  async getEvents(
    @CurrentUser('userId') userId: string,
    @Param('id') applicationId: string,
  ) {
    return this.applicationService.getApplicationEvents(userId, applicationId);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get application status' })
  async getStatus(
    @CurrentUser('userId') userId: string,
    @Param('id') applicationId: string,
  ) {
    const app = await this.applicationService.getApplicationById(userId, applicationId);
    return {
      applicationId: app.id,
      status: app.status,
      referenceNumber: app.externalApplicationReference,
      submittedAt: app.submittedAt,
      lastUpdated: app.updatedAt,
    };
  }
}
