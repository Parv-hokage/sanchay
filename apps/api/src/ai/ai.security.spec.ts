import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToolRegistryService } from './tools/tool-registry.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import { RiskLevel } from '@sanchay/types';

describe('AI Security, Prompt Injection & Consequential Confirmation Tests', () => {
  let toolRegistry: ToolRegistryService;
  let mockKnowledge: any;
  let mockApplication: any;
  let mockDocument: any;

  beforeEach(() => {
    mockKnowledge = { searchKnowledge: vi.fn() };
    mockApplication = {
      autofillApplication: vi.fn().mockResolvedValue({ success: true }),
      submitApplication: vi.fn().mockResolvedValue({ referenceCode: 'JEE2026-NTA-999' }),
    };
    mockDocument = { listDocuments: vi.fn() };

    toolRegistry = new ToolRegistryService(
      mockKnowledge as any,
      mockApplication as any,
      mockDocument as any,
    );
  });

  it('rejects unauthenticated user attempts to execute protected tools', async () => {
    await expect(
      toolRegistry.executeTool('application.autofill', { applicationId: 'app-1' }, null),
    ).rejects.toThrow(ForbiddenException);
  });

  it('rejects unregistered or unallowed tool calls (Tool Injection Defense)', async () => {
    await expect(
      toolRegistry.executeTool('database.raw_query', { sql: 'SELECT * FROM users' }, { id: 'user-1' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('blocks immediate execution of high-risk actions without explicit confirmation', async () => {
    const user = { id: 'user-100' };
    const { result, actionCard } = await toolRegistry.executeTool(
      'application.submit_mock',
      { applicationId: 'app-100' },
      user,
      false, // isConfirmed = false
    );

    expect(result.status).toBe('PENDING_CONFIRMATION');
    expect(actionCard).toBeDefined();
    expect(actionCard?.riskLevel).toBe(RiskLevel.HIGH);
    expect(actionCard?.confirmationRequired).toBe(true);
    expect(mockApplication.submitApplication).not.toHaveBeenCalled();
  });

  it('executes high-risk action only after explicit citizen confirmation is verified', async () => {
    const user = { id: 'user-100' };
    const { result } = await toolRegistry.executeTool(
      'application.submit_mock',
      { applicationId: 'app-100' },
      user,
      true, // isConfirmed = true
    );

    expect(result.referenceCode).toBe('JEE2026-NTA-999');
    expect(mockApplication.submitApplication).toHaveBeenCalledWith('app-100', user);
  });
});
