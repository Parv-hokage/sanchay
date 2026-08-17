import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { MeService } from './me.service';
import { AuthGuard, AuthenticatedUser } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  UpdateProfileSchema,
  CreateAddressSchema,
  UpdateAddressSchema,
  AddContactSchema,
  CreateIdentityLinkSchema,
  GrantConsentSchema,
} from '../validation';
import {
  UpdateProfileDto,
  CreateAddressDto,
  UpdateAddressDto,
  AddContactDto,
  CreateIdentityLinkDto,
  GrantConsentDto,
} from '../types';
import { REQUEST_ID_HEADER } from '../common/middleware/request-id.middleware';

@ApiTags('Me (Citizen Profile & Resources)')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  // ==========================================
  // Account Overview
  // ==========================================
  @Get()
  @ApiOperation({ summary: 'Get Authenticated Citizen Account Overview & Sanchay UID' })
  async getOverview(@CurrentUser() user: AuthenticatedUser) {
    return this.meService.getAccountOverview(user.id);
  }

  // ==========================================
  // Profile
  // ==========================================
  @Get('profile')
  @ApiOperation({ summary: 'Get Current Authenticated Citizen Profile' })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.meService.getProfile(user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update Current Citizen Profile' })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateProfileDto,
    @Req() req: Request,
    @Headers(REQUEST_ID_HEADER) headerReqId?: string,
  ) {
    const validated = UpdateProfileSchema.parse(body);
    const requestId = (req as Request & { id?: string }).id || headerReqId || 'anon';
    const ip = req.ip || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];

    return this.meService.updateProfile(user.id, validated, requestId, ip, ua);
  }

  // ==========================================
  // Addresses
  // ==========================================
  @Get('addresses')
  @ApiOperation({ summary: 'Get Current Citizen Addresses' })
  async getAddresses(@CurrentUser() user: AuthenticatedUser) {
    return this.meService.getAddresses(user.id);
  }

  @Post('addresses')
  @ApiOperation({ summary: 'Add New Address for Current Citizen' })
  async createAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateAddressDto,
    @Req() req: Request,
    @Headers(REQUEST_ID_HEADER) headerReqId?: string,
  ) {
    const validated = CreateAddressSchema.parse(body);
    const requestId = (req as Request & { id?: string }).id || headerReqId || 'anon';
    const ip = req.ip || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];

    return this.meService.createAddress(user.id, validated, requestId, ip, ua);
  }

  @Patch('addresses/:id')
  @ApiOperation({ summary: 'Update Own Address' })
  async updateAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') addressId: string,
    @Body() body: UpdateAddressDto,
    @Req() req: Request,
    @Headers(REQUEST_ID_HEADER) headerReqId?: string,
  ) {
    const validated = UpdateAddressSchema.parse(body);
    const requestId = (req as Request & { id?: string }).id || headerReqId || 'anon';
    const ip = req.ip || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];

    return this.meService.updateAddress(user.id, addressId, validated, requestId, ip, ua);
  }

  @Delete('addresses/:id')
  @ApiOperation({ summary: 'Delete Own Address' })
  async deleteAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') addressId: string,
    @Req() req: Request,
    @Headers(REQUEST_ID_HEADER) headerReqId?: string,
  ) {
    const requestId = (req as Request & { id?: string }).id || headerReqId || 'anon';
    const ip = req.ip || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];

    return this.meService.deleteAddress(user.id, addressId, requestId, ip, ua);
  }

  // ==========================================
  // Contacts
  // ==========================================
  @Get('contacts')
  @ApiOperation({ summary: 'Get Current Citizen Contact Methods' })
  async getContacts(@CurrentUser() user: AuthenticatedUser) {
    return this.meService.getContacts(user.id);
  }

  @Post('contacts')
  @ApiOperation({ summary: 'Add Verified Contact Method' })
  async addContact(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: AddContactDto,
  ) {
    const validated = AddContactSchema.parse(body);
    return this.meService.addContact(user.id, validated);
  }

  // ==========================================
  // Identity Links
  // ==========================================
  @Get('identity-links')
  @ApiOperation({ summary: 'Get Linked Government Service Identities' })
  async getIdentityLinks(@CurrentUser() user: AuthenticatedUser) {
    return this.meService.getIdentityLinks(user.id);
  }

  @Post('identity-links')
  @ApiOperation({ summary: 'Link External Government Service Identity' })
  async createIdentityLink(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateIdentityLinkDto,
    @Req() req: Request,
    @Headers(REQUEST_ID_HEADER) headerReqId?: string,
  ) {
    const validated = CreateIdentityLinkSchema.parse(body);
    const requestId = (req as Request & { id?: string }).id || headerReqId || 'anon';
    const ip = req.ip || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];

    return this.meService.createIdentityLink(user.id, validated, requestId, ip, ua);
  }

  @Delete('identity-links/:id')
  @ApiOperation({ summary: 'Unlink External Identity' })
  async deleteIdentityLink(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') linkId: string,
    @Req() req: Request,
    @Headers(REQUEST_ID_HEADER) headerReqId?: string,
  ) {
    const requestId = (req as Request & { id?: string }).id || headerReqId || 'anon';
    const ip = req.ip || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];

    return this.meService.deleteIdentityLink(user.id, linkId, requestId, ip, ua);
  }

  // ==========================================
  // Consents
  // ==========================================
  @Get('consents')
  @ApiOperation({ summary: 'Get Purpose-Specific Consents' })
  async getConsents(@CurrentUser() user: AuthenticatedUser) {
    return this.meService.getConsents(user.id);
  }

  @Post('consents')
  @ApiOperation({ summary: 'Grant Purpose-Specific Consent' })
  async grantConsent(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: GrantConsentDto,
    @Req() req: Request,
    @Headers(REQUEST_ID_HEADER) headerReqId?: string,
  ) {
    const validated = GrantConsentSchema.parse(body);
    const requestId = (req as Request & { id?: string }).id || headerReqId || 'anon';
    const ip = req.ip || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];

    return this.meService.grantConsent(user.id, validated, requestId, ip, ua);
  }

  @Patch('consents/:id/revoke')
  @ApiOperation({ summary: 'Revoke Purpose-Specific Consent' })
  async revokeConsent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') consentId: string,
    @Req() req: Request,
    @Headers(REQUEST_ID_HEADER) headerReqId?: string,
  ) {
    const requestId = (req as Request & { id?: string }).id || headerReqId || 'anon';
    const ip = req.ip || req.socket.remoteAddress;
    const ua = req.headers['user-agent'];

    return this.meService.revokeConsent(user.id, consentId, requestId, ip, ua);
  }
}
