import { Injectable } from '@nestjs/common';
import { SanchayAIContext, Evidence } from '@sanchay/types';
import { ChatMessagePayload } from '../provider/ai-provider.interface';

@Injectable()
export class ContextBuilderService {
  /**
   * Assembles a task-scoped, least-privilege prompt context for Qwen3 with conversation history
   */
  buildPromptContext(
    userMessage: string,
    context?: SanchayAIContext,
    evidence: Evidence[] = [],
    toolResults?: Record<string, any>,
    conversationHistory: ChatMessagePayload[] = [],
  ): ChatMessagePayload[] {
    const messages: ChatMessagePayload[] = [];

    // 1. System Policy & Security Guardrails
    const systemPromptParts: string[] = [
      'You are Sanchay AI, the official digital assistant for the Government of India unified service platform.',
      'Core Principles:',
      '1. Ground every official answer in the provided official evidence with strict accuracy.',
      '2. Do NOT invent dates, fees, rules, or eligibility criteria.',
      '3. You do NOT have direct access to private databases or storage. All citizen actions are executed through authorized Sanchay tools with citizen confirmation.',
      '4. Sanchay Profile Single Source of Truth: Citizen identity, personal, contact, and academic information is strictly managed in My Profile (/profile). Government applications (such as JEE Main) are READ-ONLY consumers of profile data.',
      '5. Zero AI Profile Mutation: You have READ-ONLY access. You MUST NEVER mutate, edit, or claim to directly update citizen profile fields or application identity fields.',
      '6. Profile Correction Guidance: If a citizen mentions that a profile field is wrong or asks you to change it (e.g. "My Class 12 year is wrong", "Change my DOB to 15/08/2006"), state that the field is stored in their Sanchay Profile and must be updated in My Profile. Guide them to [Open My Profile](/profile).',
      '7. Application Preparation: When the citizen asks to prepare/apply (e.g., "Fill the JEE application for me"), explain that Sanchay will prepare the application using verified data from their Sanchay Profile. Summarize available vs missing profile fields and provide action to complete profile or review the application.',
      '8. Conversation Memory: Understand follow-up queries in the context of preceding messages in this conversation.',
    ];

    // 2. Active Service & Screen Context
    if (
      context?.serviceId ||
      context?.section ||
      context?.activeItem ||
      context?.workflow ||
      context?.page ||
      context?.route
    ) {
      systemPromptParts.push('\nCurrent Citizen Screen & Navigation Context:');
      if (context.serviceId) systemPromptParts.push(`- Active Service: ${context.serviceId}`);
      if (context.section) systemPromptParts.push(`- Active Section: ${context.section}`);
      if (context.activeItem) systemPromptParts.push(`- Active Item on Screen: "${context.activeItem}"`);
      if (context.workflow) systemPromptParts.push(`- Current Workflow: ${context.workflow}`);
      if (context.page) systemPromptParts.push(`- Active Page: ${context.page}`);
      if (context.route) systemPromptParts.push(`- Current Route: ${context.route}`);
    }

    // 3. Grounded Official Knowledge Evidence
    if (evidence.length > 0) {
      systemPromptParts.push('\nAuthoritative Retrieved Evidence from Official Sources:');
      evidence.forEach((ev, idx) => {
        systemPromptParts.push(
          `[Source ${idx + 1}] Title: "${ev.title}" | Section: "${ev.section || 'General'}" | Page: ${ev.page || 'N/A'} | Authority: ${ev.authorityLevel}\nContent: ${ev.snippet}`,
        );
      });
    }

    // 4. Authorized Tool Execution Results (if available)
    if (toolResults && Object.keys(toolResults).length > 0) {
      systemPromptParts.push('\nExecuted Tool Results (Verified by Sanchay Backend):');
      systemPromptParts.push(JSON.stringify(toolResults, null, 2));
    }

    // Push system prompt
    messages.push({
      role: 'system',
      content: systemPromptParts.join('\n'),
    });

    // 5. Append Conversation History (Recent messages window, excluding initial greetings)
    if (conversationHistory && conversationHistory.length > 0) {
      // Keep up to last 10 messages
      const windowedHistory = conversationHistory.slice(-10);
      for (const histMsg of windowedHistory) {
        messages.push({
          role: histMsg.role === 'user' ? 'user' : 'assistant',
          content: histMsg.content,
        });
      }
    }

    // 6. Citizen Current User Query
    messages.push({
      role: 'user',
      content: userMessage,
    });

    return messages;
  }
}
