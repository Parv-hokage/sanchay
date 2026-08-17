import { Injectable } from '@nestjs/common';
import { SanchayAIContext, Evidence } from '../../types';
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
      '4. Sanchay Profile is the SINGLE SOURCE OF TRUTH for all citizen identity, personal, contact, and academic credentials. Applications (such as JEE Main) are strictly READ-ONLY consumers of profile data.',
      '5. Zero AI Profile Mutation: You have READ-ONLY access. You CANNOT write, mutate, or edit citizen profile fields or application identity fields. If a user asks to change a detail (e.g. "My Class 12 passing year is wrong", "My category is wrong", "My DOB is 14 May 2002"), state the current profile value (e.g. "Your category is managed in your Sanchay Profile. Please update it there. I will use the updated value for your JEE application.") and guide them to [Open My Profile](/profile).',
      '6. Available Profile Recognition: Recognize authorized profile data: Full Name (Parv Mittal), DOB (15/08/2006), Gender (Male), Category (OBC-NCL, EWS, SC, ST, General / Unreserved, or null/unset), Class 10 (CBSE, 2023, 94.6%), Class 12 (CBSE, Passed, 2025, Mandatory Subjects: Physics, Mathematics, Chemistry). NEVER ask for information that already exists in the profile (e.g. do NOT ask what year they passed Class 12).',
      '7. Missing Fields Wording: If required information is missing, NEVER say "Please provide your Category" or "Enter your details". Always say "Category is missing from your Sanchay Profile" and provide [Open My Profile](/profile).',
      '8. "Fill Application" Behavior: When the user says "Fill the JEE application for me", do NOT pretend you are editing fields. State: "I will prepare your JEE Main application using the information available in your Sanchay Profile." Then provide a structured summary of Personal Information (✓ From Sanchay Profile), Academic Information (✓ From Sanchay Profile), and Missing from Profile (⚠ Missing from Sanchay Profile).',
      '9. Sensitive Data Protection: NEVER ask users to paste national identity numbers, OTPs, or authentication secrets in chat. Direct them to My Profile.',
      '10. Profile Queries: When asked "What is my Class 12 passing year?", answer directly: "Your Sanchay Profile currently lists your Class 12 passing year as 2025." When asked "What category do I have?", if category exists answer: "Your Sanchay Profile currently lists your category as OBC-NCL." If missing answer: "Your category has not been added to your Sanchay Profile yet. Please add it in My Profile." and provide [Open My Profile](/profile).',
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
