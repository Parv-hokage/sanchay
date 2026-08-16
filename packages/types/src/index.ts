/**
 * SANCHAY Core Domain Types
 * Single source of truth for TypeScript interfaces across frontend, backend, workers, and adapters.
 */

// ==========================================
// 1. Identity & Profile Types
// ==========================================

export type SanchayUID = string; // Opaque UUID v4 format

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export interface UserSummary {
  id: string;
  sanchayUid: SanchayUID;
  status: UserStatus;
  createdAt: Date;
  lastLoginAt?: Date | null;
}

export enum IdentityProviderType {
  DIGILOCKER = 'DIGILOCKER',
  PARICHAAY = 'PARICHAAY',
  MOBILE_OTP = 'MOBILE_OTP',
  EMAIL_OTP = 'EMAIL_OTP',
  MOCK_IDP = 'MOCK_IDP',
}

export interface IdentityLink {
  id: string;
  userId: string;
  serviceId?: string | null;
  provider: IdentityProviderType;
  externalSubjectReference: string; // Masked / Protected in responses
  isVerified: boolean;
  verifiedAt?: Date | null;
  createdAt: Date;
}

export enum CitizenCategory {
  GENERAL = 'GENERAL',
  EWS = 'EWS',
  OBC_NCL = 'OBC_NCL',
  SC = 'SC',
  ST = 'ST',
}

export interface CitizenProfile {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  category?: CitizenCategory | null;
  preferredLanguage: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum AddressType {
  PERMANENT = 'PERMANENT',
  CORRESPONDENCE = 'CORRESPONDENCE',
}

export interface Address {
  id: string;
  userId: string;
  addressType: AddressType;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum ContactType {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
}

export interface ContactMethod {
  id: string;
  userId: string;
  type: ContactType;
  valueReference: string;
  isVerified: boolean;
  isPrimary: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ==========================================
// 2. Auth DTOs & Payloads
// ==========================================

export interface LoginRequestDto {
  provider: IdentityProviderType;
  identifier: string; // Phone number, email, or mock user identifier
}

export interface LoginResponseData {
  sessionChallengeId: string;
  provider: IdentityProviderType;
  message: string;
  expiresInSeconds: number;
}

export interface VerifyOtpRequestDto {
  sessionChallengeId: string;
  otp: string;
}

export interface AuthSessionData {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    sanchayUid: SanchayUID;
    status: UserStatus;
  };
  profile: CitizenProfile | null;
}

export interface UpdateProfileDto {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  category?: CitizenCategory | null;
  preferredLanguage?: string;
}

export interface CreateAddressDto {
  addressType: AddressType;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  country?: string;
  isPrimary?: boolean;
}

export interface UpdateAddressDto {
  addressType?: AddressType;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isPrimary?: boolean;
}

export interface AddContactDto {
  type: ContactType;
  value: string;
  isPrimary?: boolean;
}

export interface CreateIdentityLinkDto {
  provider: IdentityProviderType;
  externalSubjectReference: string;
  serviceId?: string;
}

export interface GrantConsentDto {
  serviceId: string;
  purpose: string;
  scope: string[];
}

// ==========================================
// 3. Consent & Authorization Types
// ==========================================

export enum ConsentStatus {
  GRANTED = 'GRANTED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export interface ConsentRecord {
  id: string;
  userId: string;
  serviceId: string;
  purpose: string;
  scope: string[];
  status: ConsentStatus;
  grantedAt: Date;
  revokedAt?: Date | null;
  version: string;
}

// ==========================================
// 4. Department, Organization, Service & Capabilities
// ==========================================

export enum EntityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export interface Department {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName?: string | null;
  status: EntityStatus;
}

export interface Organization {
  id: string;
  departmentId: string;
  name: string;
  slug: string;
  officialDomain: string;
  description: string;
  status: EntityStatus;
}

export interface GovernmentService {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  description: string;
  officialUrl: string;
  status: EntityStatus;
  version: string;
}

export enum CapabilityType {
  KNOWLEDGE = 'KNOWLEDGE',
  RETRIEVE = 'RETRIEVE',
  DOCUMENT = 'DOCUMENT',
  ACTION = 'ACTION',
  STATUS = 'STATUS',
  TRANSFORM = 'TRANSFORM',
}

export interface ServiceCapability {
  id: string;
  serviceId: string;
  name: string;
  slug: string;
  type: CapabilityType;
  description: string;
  requiresAuthentication: boolean;
  requiresConsent: boolean;
  requiresConfirmation: boolean;
  auditRequired: boolean;
  status: EntityStatus;
}

export interface CapabilityRequirement {
  id: string;
  capabilityId: string;
  fieldKey: string;
  label: string;
  required: boolean;
  source: string;
  validationRule?: string | null;
}

// ==========================================
// 5. Applications Domain Types
// ==========================================

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  READY_FOR_REVIEW = 'READY_FOR_REVIEW',
  SUBMITTING = 'SUBMITTING',
  SUBMITTED = 'SUBMITTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
}

export enum FieldSource {
  USER = 'USER',
  PROFILE = 'PROFILE',
  GOVERNMENT = 'GOVERNMENT',
  SYSTEM = 'SYSTEM',
  AI_ASSISTED = 'AI_ASSISTED',
}

export interface ApplicationField {
  id: string;
  applicationId: string;
  fieldKey: string;
  fieldValue: string;
  source: FieldSource;
  verified: boolean;
}

export interface Application {
  id: string;
  userId: string;
  serviceId: string;
  externalApplicationReference?: string | null;
  status: ApplicationStatus;
  currentStep: string;
  submittedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  fields?: ApplicationField[];
}

// ==========================================
// 6. Document Domain Types
// ==========================================

export enum DocumentType {
  IDENTITY_PROOF = 'IDENTITY_PROOF',
  ADDRESS_PROOF = 'ADDRESS_PROOF',
  EDUCATION_CERTIFICATE = 'EDUCATION_CERTIFICATE',
  PHOTOGRAPH = 'PHOTOGRAPH',
  SIGNATURE = 'SIGNATURE',
  INCOME_CERTIFICATE = 'INCOME_CERTIFICATE',
  CATEGORY_CERTIFICATE = 'CATEGORY_CERTIFICATE',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  PENDING_SCAN = 'PENDING_SCAN',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  QUARANTINED = 'QUARANTINED',
}

export interface CitizenDocument {
  id: string;
  userId: string;
  documentType: DocumentType;
  title: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  status: DocumentStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  versions?: DocumentVersion[];
  accessLogs?: DocumentAccessLog[];
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  storageKey: string;
  contentHash: string;
  mimeType: string;
  fileSize: number;
  createdAt: Date;
}

export interface DocumentAccessLog {
  id: string;
  documentId: string;
  userId: string;
  actorType: string;
  purpose: string;
  action: string;
  createdAt: Date;
}

export interface CreateDocumentDto {
  documentType: DocumentType;
  title: string;
}

// ==========================================
// 7. Knowledge & RAG Types
// ==========================================

export enum KnowledgeSourceType {
  WEBPAGE = 'WEBPAGE',
  PDF = 'PDF',
  NOTIFICATION = 'NOTIFICATION',
  CIRCULAR = 'CIRCULAR',
  FAQ = 'FAQ',
  GUIDELINE = 'GUIDELINE',
  RULE = 'RULE',
}

export enum AuthorityLevel {
  TIER_1_OFFICIAL_GOV = 'TIER_1_OFFICIAL_GOV',
  TIER_2_OFFICIAL_AGENCY = 'TIER_2_OFFICIAL_AGENCY',
  TIER_3_GOV_PUBLICATION = 'TIER_3_GOV_PUBLICATION',
  TIER_4_REFERENCE = 'TIER_4_REFERENCE',
}

export interface KnowledgeSource {
  id: string;
  serviceId?: string | null;
  organizationId?: string | null;
  sourceType: KnowledgeSourceType;
  url: string;
  title: string;
  authorityLevel: AuthorityLevel;
  status: EntityStatus;
  lastCheckedAt?: Date | null;
}

export interface KnowledgeChunk {
  id: string;
  knowledgeDocumentId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  metadata: {
    section?: string;
    heading?: string;
    page?: number;
    sourceUrl?: string;
    authorityLevel?: AuthorityLevel;
    publishedAt?: string;
  };
}

export interface Citation {
  sourceId: string;
  sourceTitle: string;
  organization?: string;
  url: string;
  section?: string;
  page?: number;
  authorityLevel: AuthorityLevel;
}

export interface Evidence {
  chunkId: string;
  documentId: string;
  sourceId: string;
  title: string;
  snippet: string;
  url: string;
  section?: string;
  page?: number;
  score: number;
  authorityLevel: AuthorityLevel;
  retrievedAt: Date;
  citation: Citation;
}

export interface KnowledgeSearchParams {
  query: string;
  serviceId?: string;
  organizationId?: string;
  limit?: number;
}

export interface KnowledgeSearchResult {
  query: string;
  count: number;
  evidence: Evidence[];
}

// ==========================================
// 8. AI & Context Types
// ==========================================

export interface SanchayAIContext {
  userId?: string;
  departmentId?: string;
  organizationId?: string;
  serviceId?: string;
  section?: string;
  activeItem?: string;
  route?: string;
  workflow?: string;
  page?: string;
  currentField?: string;
  availableCapabilities?: string[];
}

export enum IntentType {
  KNOWLEDGE_QUERY = 'KNOWLEDGE_QUERY',
  ELIGIBILITY_CHECK = 'ELIGIBILITY_CHECK',
  START_APPLICATION = 'START_APPLICATION',
  APPLICATION_ACTION = 'APPLICATION_ACTION',
  FILL_APPLICATION = 'FILL_APPLICATION',
  CHECK_APPLICATION_STATUS = 'CHECK_APPLICATION_STATUS',
  FIND_DOCUMENT = 'FIND_DOCUMENT',
  EXPLAIN_DOCUMENT_REQUIREMENT = 'EXPLAIN_DOCUMENT_REQUIREMENT',
  NAVIGATE_SERVICE = 'NAVIGATE_SERVICE',
  GENERAL_HELP = 'GENERAL_HELP',
  UNKNOWN = 'UNKNOWN',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface ActionCard {
  id: string;
  title: string;
  description: string;
  actionType: string;
  payload: Record<string, unknown>;
  riskLevel: RiskLevel;
  confirmationRequired: boolean;
  isConfirmed?: boolean;
}

export interface AiConversation {
  id: string;
  userId: string;
  serviceId?: string | null;
  title: string;
  contextMetadata?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  messages?: AIChatMessage[];
}

export enum MessageSender {
  USER = 'USER',
  AI = 'AI',
  SYSTEM = 'SYSTEM',
}

export interface AIChatMessage {
  id: string;
  conversationId: string;
  sender: MessageSender;
  content: string;
  citations?: Citation[];
  actionCard?: ActionCard;
  createdAt: Date;
}

export interface AiChatDto {
  conversationId?: string;
  message: string;
  context?: SanchayAIContext;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface AiChatResponse {
  conversationId: string;
  messageId: string;
  content: string;
  intent: IntentType;
  citations: Citation[];
  actionCard?: ActionCard;
}

// ==========================================
// 9. Audit Event Types
// ==========================================

export enum AuditActionType {
  AUTH_LOGIN = 'AUTH_LOGIN',
  AUTH_LOGIN_FAILED = 'AUTH_LOGIN_FAILED',
  AUTH_LOGOUT = 'AUTH_LOGOUT',
  SESSION_REVOKED = 'SESSION_REVOKED',
  IDENTITY_LINKED = 'IDENTITY_LINKED',
  IDENTITY_UNLINKED = 'IDENTITY_UNLINKED',
  CONSENT_GRANTED = 'CONSENT_GRANTED',
  CONSENT_REVOKED = 'CONSENT_REVOKED',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  ADDRESS_CREATED = 'ADDRESS_CREATED',
  ADDRESS_UPDATED = 'ADDRESS_UPDATED',
  ADDRESS_DELETED = 'ADDRESS_DELETED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_ACCESSED = 'DOCUMENT_ACCESSED',
  CAPABILITY_EXECUTED = 'CAPABILITY_EXECUTED',
  APPLICATION_CREATED = 'APPLICATION_CREATED',
  APPLICATION_SUBMITTED = 'APPLICATION_SUBMITTED',
  AI_TOOL_CALLED = 'AI_TOOL_CALLED',
}

export interface AuditEvent {
  id: string;
  actorId?: string | null;
  actorType: 'USER' | 'SYSTEM' | 'ADMIN' | 'AI_AGENT';
  action: AuditActionType;
  resourceType: string;
  resourceId?: string | null;
  requestId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}
