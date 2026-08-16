import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';

@ApiTags('Service Catalog')
@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ==========================================
  // 1. Departments
  // ==========================================
  @Get('departments')
  @ApiOperation({ summary: 'Get all Active Government Departments' })
  async getDepartments() {
    return this.catalogService.getDepartments();
  }

  @Get('departments/:idOrSlug')
  @ApiOperation({ summary: 'Get Department details and associated services' })
  async getDepartment(@Param('idOrSlug') idOrSlug: string) {
    return this.catalogService.getDepartmentBySlugOrId(idOrSlug);
  }

  // ==========================================
  // 2. Organizations
  // ==========================================
  @Get('organizations')
  @ApiOperation({ summary: 'Get Government Organizations' })
  @ApiQuery({ name: 'departmentId', required: false })
  async getOrganizations(@Query('departmentId') departmentId?: string) {
    return this.catalogService.getOrganizations(departmentId);
  }

  @Get('organizations/:idOrSlug')
  @ApiOperation({ summary: 'Get Organization details and services' })
  async getOrganization(@Param('idOrSlug') idOrSlug: string) {
    return this.catalogService.getOrganizationBySlugOrId(idOrSlug);
  }

  // ==========================================
  // 3. Government Services
  // ==========================================
  @Get('services')
  @ApiOperation({ summary: 'Search and Filter Government Services' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'departmentId', required: false })
  @ApiQuery({ name: 'departmentSlug', required: false })
  @ApiQuery({ name: 'organizationId', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getServices(
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
    @Query('departmentSlug') departmentSlug?: string,
    @Query('organizationId') organizationId?: string,
    @Query('status') status?: string,
  ) {
    return this.catalogService.getServices({
      search,
      departmentId,
      departmentSlug,
      organizationId,
      status,
    });
  }

  @Get('services/recommendations')
  @ApiOperation({ summary: 'Get Featured / Recommended Services' })
  async getRecommendations() {
    return this.catalogService.getRecommendedServices();
  }

  @Get('services/:idOrSlug')
  @ApiOperation({ summary: 'Get Complete Government Service Details, Capabilities, and Requirements' })
  async getService(@Param('idOrSlug') idOrSlug: string) {
    return this.catalogService.getServiceBySlugOrId(idOrSlug);
  }

  // ==========================================
  // 4. Capabilities
  // ==========================================
  @Get('services/:idOrSlug/capabilities')
  @ApiOperation({ summary: 'Get Capabilities of a Specific Government Service' })
  async getCapabilities(@Param('idOrSlug') serviceIdOrSlug: string) {
    return this.catalogService.getCapabilities(serviceIdOrSlug);
  }

  @Get('services/:idOrSlug/capabilities/:capIdOrSlug')
  @ApiOperation({ summary: 'Get Specific Capability Details and its Requirements' })
  async getCapability(
    @Param('idOrSlug') serviceIdOrSlug: string,
    @Param('capIdOrSlug') capIdOrSlug: string,
  ) {
    return this.catalogService.getCapability(serviceIdOrSlug, capIdOrSlug);
  }
}
