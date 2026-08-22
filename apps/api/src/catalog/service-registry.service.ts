import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import {
  ServiceAdapter,
  UniversalFormSchema,
  FormValidationResult,
} from './adapters/service-adapter.interface';
import { JeeMainAdapter } from './adapters/jee-main.adapter';
import { NationalScholarshipAdapter } from './adapters/national-scholarship.adapter';
import { ServiceRequirementField } from '../me/profile-resolver.service';

@Injectable()
export class ServiceRegistryService {
  private readonly logger = new Logger(ServiceRegistryService.name);
  private readonly adapters = new Map<string, ServiceAdapter>();

  constructor(
    private readonly jeeMainAdapter: JeeMainAdapter,
    private readonly nationalScholarshipAdapter: NationalScholarshipAdapter,
  ) {
    this.registerAdapter(this.jeeMainAdapter);
    this.registerAdapter(this.nationalScholarshipAdapter);
  }

  /**
   * Registers a service adapter
   */
  registerAdapter(adapter: ServiceAdapter): void {
    this.adapters.set(adapter.serviceId.toLowerCase(), adapter);
    this.adapters.set(adapter.slug.toLowerCase(), adapter);
    this.logger.log(`[ServiceRegistry] Registered Universal Adapter: ${adapter.name} (${adapter.slug})`);
  }

  /**
   * Looks up an adapter by slug or ID
   */
  getAdapter(serviceSlugOrId: string): ServiceAdapter | undefined {
    if (!serviceSlugOrId) return undefined;
    return this.adapters.get(serviceSlugOrId.toLowerCase().trim());
  }

  /**
   * Lists all unique registered service adapters
   */
  listRegisteredServices(): { serviceId: string; name: string; slug: string; organization: string; department: string }[] {
    const seen = new Set<string>();
    const list: any[] = [];

    for (const adapter of this.adapters.values()) {
      if (!seen.has(adapter.serviceId)) {
        seen.add(adapter.serviceId);
        list.push({
          serviceId: adapter.serviceId,
          name: adapter.name,
          slug: adapter.slug,
          organization: adapter.organization,
          department: adapter.department,
        });
      }
    }

    return list;
  }

  /**
   * Retrieves the declared requirements of a service
   */
  async getServiceRequirements(serviceSlugOrId: string): Promise<ServiceRequirementField[]> {
    const adapter = this.getAdapter(serviceSlugOrId);
    if (!adapter) {
      throw new NotFoundException(`No service adapter registered for "${serviceSlugOrId}"`);
    }
    return adapter.getRequirements();
  }

  /**
   * Retrieves the universal machine-readable form schema for a service
   */
  async getUniversalFormSchema(serviceSlugOrId: string): Promise<UniversalFormSchema | undefined> {
    const adapter = this.getAdapter(serviceSlugOrId);
    if (!adapter) return undefined;
    return adapter.getFormSchema();
  }

  /**
   * Deterministically validates form field submissions against the service rules
   */
  async validateServiceForm(
    serviceSlugOrId: string,
    fields: Record<string, string>,
  ): Promise<FormValidationResult> {
    const adapter = this.getAdapter(serviceSlugOrId);
    if (!adapter) {
      throw new NotFoundException(`No service adapter registered for "${serviceSlugOrId}"`);
    }
    return adapter.validateApplication(fields);
  }

  /**
   * Executes a service-specific action
   */
  async executeServiceAction(
    serviceSlugOrId: string,
    action: string,
    params: Record<string, any>,
    user?: any,
  ): Promise<any> {
    const adapter = this.getAdapter(serviceSlugOrId);
    if (!adapter) {
      throw new NotFoundException(`No service adapter registered for "${serviceSlugOrId}"`);
    }
    return adapter.executeAction(action, params, user);
  }
}
