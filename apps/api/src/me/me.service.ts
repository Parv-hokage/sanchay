import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  UpdateProfileDto,
  CreateAddressDto,
  UpdateAddressDto,
  AddContactDto,
  CreateIdentityLinkDto,
  GrantConsentDto,
  AuditActionType,
  ConsentStatus,
} from '@sanchay/types';

@Injectable()
export class MeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // ==========================================
  // User Overview
  // ==========================================
  async getAccountOverview(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        addresses: { where: { isPrimary: true }, take: 1 },
        contactMethods: { where: { isPrimary: true }, take: 2 },
        identityLinks: { select: { id: true, provider: true, isVerified: true } },
        consents: { where: { status: 'GRANTED' }, select: { id: true, serviceId: true, purpose: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('Citizen account not found.');
    }

    return {
      id: user.id,
      sanchayUid: user.sanchayUid,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      profile: user.profile,
      primaryAddress: user.addresses[0] || null,
      primaryContacts: user.contactMethods,
      linkedIdentityProviders: user.identityLinks,
      activeConsentsCount: user.consents.length,
    };
  }

  // ==========================================
  // Profile
  // ==========================================
  async getProfile(userId: string) {
    let profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      // Auto-create default profile if missing
      profile = await this.prisma.profile.create({
        data: {
          userId,
          fullName: 'Citizen',
          preferredLanguage: 'en',
        },
      });
    }

    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, requestId: string, ip?: string, ua?: string) {
    const existing = await this.getProfile(userId);

    const updated = await this.prisma.profile.update({
      where: { id: existing.id },
      data: {
        fullName: dto.fullName !== undefined ? dto.fullName : existing.fullName,
        dateOfBirth: dto.dateOfBirth !== undefined ? dto.dateOfBirth : existing.dateOfBirth,
        gender: dto.gender !== undefined ? dto.gender : existing.gender,
        category: dto.category !== undefined ? (dto.category as any) : existing.category,
        preferredLanguage: dto.preferredLanguage !== undefined ? dto.preferredLanguage : existing.preferredLanguage,
      },
    });

    await this.auditService.recordEvent({
      actorId: userId,
      actorType: 'USER',
      action: AuditActionType.PROFILE_UPDATED,
      resourceType: 'PROFILE',
      resourceId: updated.id,
      requestId,
      ipAddress: ip,
      userAgent: ua,
      metadata: { changedFields: Object.keys(dto) },
    });

    return updated;
  }

  // ==========================================
  // Addresses (With Ownership Enforcement)
  // ==========================================
  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto, requestId: string, ip?: string, ua?: string) {
    if (dto.isPrimary) {
      // Unset previous primary
      await this.prisma.address.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const address = await this.prisma.address.create({
      data: {
        userId,
        addressType: dto.addressType,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2 || null,
        city: dto.city,
        district: dto.district,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country || 'India',
        isPrimary: dto.isPrimary ?? false,
      },
    });

    await this.auditService.recordEvent({
      actorId: userId,
      actorType: 'USER',
      action: AuditActionType.ADDRESS_CREATED,
      resourceType: 'ADDRESS',
      resourceId: address.id,
      requestId,
      ipAddress: ip,
      userAgent: ua,
    });

    return address;
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto, requestId: string, ip?: string, ua?: string) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found.');
    }

    // Ownership Enforcement
    if (address.userId !== userId) {
      throw new ForbiddenException('Access denied. You do not own this address record.');
    }

    if (dto.isPrimary) {
      await this.prisma.address.updateMany({
        where: { userId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const updated = await this.prisma.address.update({
      where: { id: addressId },
      data: {
        addressType: dto.addressType !== undefined ? dto.addressType : address.addressType,
        addressLine1: dto.addressLine1 !== undefined ? dto.addressLine1 : address.addressLine1,
        addressLine2: dto.addressLine2 !== undefined ? dto.addressLine2 : address.addressLine2,
        city: dto.city !== undefined ? dto.city : address.city,
        district: dto.district !== undefined ? dto.district : address.district,
        state: dto.state !== undefined ? dto.state : address.state,
        postalCode: dto.postalCode !== undefined ? dto.postalCode : address.postalCode,
        country: dto.country !== undefined ? dto.country : address.country,
        isPrimary: dto.isPrimary !== undefined ? dto.isPrimary : address.isPrimary,
      },
    });

    await this.auditService.recordEvent({
      actorId: userId,
      actorType: 'USER',
      action: AuditActionType.ADDRESS_UPDATED,
      resourceType: 'ADDRESS',
      resourceId: updated.id,
      requestId,
      ipAddress: ip,
      userAgent: ua,
    });

    return updated;
  }

  async deleteAddress(userId: string, addressId: string, requestId: string, ip?: string, ua?: string) {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found.');
    }

    // Ownership Enforcement
    if (address.userId !== userId) {
      throw new ForbiddenException('Access denied. You do not own this address record.');
    }

    await this.prisma.address.delete({
      where: { id: addressId },
    });

    await this.auditService.recordEvent({
      actorId: userId,
      actorType: 'USER',
      action: AuditActionType.ADDRESS_DELETED,
      resourceType: 'ADDRESS',
      resourceId: addressId,
      requestId,
      ipAddress: ip,
      userAgent: ua,
    });

    return { success: true, message: 'Address deleted successfully.' };
  }

  // ==========================================
  // Contacts
  // ==========================================
  async getContacts(userId: string) {
    return this.prisma.contactMethod.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addContact(userId: string, dto: AddContactDto) {
    if (dto.isPrimary) {
      await this.prisma.contactMethod.updateMany({
        where: { userId, type: dto.type, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.contactMethod.create({
      data: {
        userId,
        type: dto.type,
        valueReference: dto.value,
        isVerified: true,
        isPrimary: dto.isPrimary ?? false,
      },
    });
  }

  // ==========================================
  // Identity Links
  // ==========================================
  async getIdentityLinks(userId: string) {
    const links = await this.prisma.identityLink.findMany({
      where: { userId },
      include: { service: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return links.map((l) => ({
      id: l.id,
      provider: l.provider,
      service: l.service,
      externalSubjectReferenceMasked: this.maskRef(l.externalSubjectReference),
      isVerified: l.isVerified,
      verifiedAt: l.verifiedAt,
      createdAt: l.createdAt,
    }));
  }

  async createIdentityLink(userId: string, dto: CreateIdentityLinkDto, requestId: string, ip?: string, ua?: string) {
    const link = await this.prisma.identityLink.create({
      data: {
        userId,
        provider: dto.provider as unknown as import('@prisma/client').IdentityProvider,
        externalSubjectReference: dto.externalSubjectReference,
        serviceId: dto.serviceId || null,
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    await this.auditService.recordEvent({
      actorId: userId,
      actorType: 'USER',
      action: AuditActionType.IDENTITY_LINKED,
      resourceType: 'IDENTITY_LINK',
      resourceId: link.id,
      requestId,
      ipAddress: ip,
      userAgent: ua,
      metadata: { provider: dto.provider },
    });

    return link;
  }

  async deleteIdentityLink(userId: string, linkId: string, requestId: string, ip?: string, ua?: string) {
    const link = await this.prisma.identityLink.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      throw new NotFoundException('Identity link not found.');
    }

    if (link.userId !== userId) {
      throw new ForbiddenException('Access denied. You do not own this identity link.');
    }

    await this.prisma.identityLink.delete({
      where: { id: linkId },
    });

    await this.auditService.recordEvent({
      actorId: userId,
      actorType: 'USER',
      action: AuditActionType.IDENTITY_UNLINKED,
      resourceType: 'IDENTITY_LINK',
      resourceId: linkId,
      requestId,
      ipAddress: ip,
      userAgent: ua,
    });

    return { success: true, message: 'Identity link removed successfully.' };
  }

  // ==========================================
  // Consents
  // ==========================================
  async getConsents(userId: string) {
    return this.prisma.consent.findMany({
      where: { userId },
      include: { service: { select: { id: true, name: true, slug: true } } },
      orderBy: { grantedAt: 'desc' },
    });
  }

  async grantConsent(userId: string, dto: GrantConsentDto, requestId: string, ip?: string, ua?: string) {
    const consent = await this.prisma.consent.create({
      data: {
        userId,
        serviceId: dto.serviceId,
        purpose: dto.purpose,
        scope: dto.scope,
        status: ConsentStatus.GRANTED,
        version: '1.0',
      },
      include: { service: { select: { id: true, name: true, slug: true } } },
    });

    await this.auditService.recordEvent({
      actorId: userId,
      actorType: 'USER',
      action: AuditActionType.CONSENT_GRANTED,
      resourceType: 'CONSENT',
      resourceId: consent.id,
      requestId,
      ipAddress: ip,
      userAgent: ua,
      metadata: { serviceId: dto.serviceId, purpose: dto.purpose },
    });

    return consent;
  }

  async revokeConsent(userId: string, consentId: string, requestId: string, ip?: string, ua?: string) {
    const consent = await this.prisma.consent.findUnique({
      where: { id: consentId },
    });

    if (!consent) {
      throw new NotFoundException('Consent record not found.');
    }

    if (consent.userId !== userId) {
      throw new ForbiddenException('Access denied. You do not own this consent record.');
    }

    const revoked = await this.prisma.consent.update({
      where: { id: consentId },
      data: {
        status: ConsentStatus.REVOKED,
        revokedAt: new Date(),
      },
    });

    await this.auditService.recordEvent({
      actorId: userId,
      actorType: 'USER',
      action: AuditActionType.CONSENT_REVOKED,
      resourceType: 'CONSENT',
      resourceId: consentId,
      requestId,
      ipAddress: ip,
      userAgent: ua,
      metadata: { serviceId: consent.serviceId },
    });

    return revoked;
  }

  private maskRef(ref: string): string {
    if (ref.length <= 4) return '***';
    return ref.substring(0, 2) + '****' + ref.substring(ref.length - 2);
  }
}
