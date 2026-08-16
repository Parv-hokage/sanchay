'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { apiRequest } from '../../lib/api-client';
import {
  AiChatResponse,
  Citation,
  ActionCard,
  MessageSender,
} from '@sanchay/types';

interface AIWorkspaceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    department?: string;
    organization?: string;
    service?: string;
    section?: string;
    activeItem?: string;
    route?: string;
    capability?: string;
    workflow?: string;
  };
}

interface MessageItem {
  id: string;
  sender: MessageSender;
  content: string;
  citations?: Citation[];
  actionCard?: ActionCard;
  createdAt: Date;
}

export const AIWorkspaceDrawer: React.FC<AIWorkspaceDrawerProps> = ({
  isOpen,
  onClose,
  context,
}) => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome-1',
      sender: MessageSender.AI,
      content:
        'Namaste! I am Sanchay AI, your unified government digital service assistant. How can I assist you with official government services today?',
      createdAt: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    'What is the eligibility for JEE Main 2026?',
    'What documents are required for category reservation?',
    'Open the JEE Main syllabus',
    'Where is the final answer key for Session 1?',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : input).trim();
    if (!text || isLoading) return;

    setInput('');
    const userMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      sender: MessageSender.USER,
      content: text,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome-1')
        .slice(-8)
        .map((m) => ({
          role: m.sender === MessageSender.USER ? ('user' as const) : ('assistant' as const),
          content: m.content,
        }));

      const res = await apiRequest<AiChatResponse>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          conversationId,
          message: text,
          history: historyPayload,
          context: {
            serviceId: context?.service?.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            departmentId: context?.department,
            section: context?.section,
            activeItem: context?.activeItem,
            route: context?.route,
            workflow: context?.workflow,
          },
        }),
      });

      const rawData = res.data as any;
      const data: AiChatResponse = rawData?.data ? rawData.data : rawData;

      if (data?.conversationId) {
        setConversationId(data.conversationId);
      }

      const content =
        data?.content ||
        rawData?.content ||
        rawData?.message ||
        'Namaste! I am Sanchay AI. How can I help you with government services today?';

      const aiMsg: MessageItem = {
        id: data?.messageId || `ai-${Date.now()}`,
        sender: MessageSender.AI,
        content,
        citations: data?.citations || [],
        actionCard: data?.actionCard,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: MessageItem = {
        id: `err-${Date.now()}`,
        sender: MessageSender.AI,
        content:
          'I apologize, but I could not connect to the Sanchay AI service. Please verify your connection or try again.',
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = async (card: ActionCard) => {
    if (!conversationId) return;

    setIsLoading(true);
    try {
      const res = await apiRequest<{ message: string; data: any }>(
        `/ai/conversations/${conversationId}/confirm`,
        {
          method: 'POST',
          body: JSON.stringify({
            actionCardId: card.id,
            toolId: card.actionType,
            payload: card.payload,
          }),
        },
      );

      const confirmNotice: MessageItem = {
        id: `conf-${Date.now()}`,
        sender: MessageSender.SYSTEM,
        content: `✅ Action Confirmed: ${res.data.message}`,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, confirmNotice]);
    } catch {
      const failNotice: MessageItem = {
        id: `fail-${Date.now()}`,
        sender: MessageSender.SYSTEM,
        content: '⚠️ Failed to confirm action. Please ensure you are signed in.',
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, failNotice]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200 font-sans">
        {/* Workspace Header */}
        <div className="p-4 sm:p-5 bg-sanchay-navy-950 text-white flex items-center justify-between border-b border-sanchay-navy-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-sanchay-gold-500 to-sanchay-gold-400 text-sanchay-navy-950 flex items-center justify-center font-bold text-base shadow-xs">
              ◯
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight text-white">Sanchay AI Workspace</h2>
                <span className="text-[10px] font-mono bg-sanchay-emerald-950 text-sanchay-emerald-400 border border-sanchay-emerald-800/80 px-1.5 py-0.2 rounded">
                  Qwen3 Reasoning
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Authoritative Government Information & Tool Execution
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Dynamic Citizen Context Banner */}
        <div className="px-4 py-2 bg-sanchay-navy-50/90 border-b border-sanchay-navy-100/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-sanchay-navy-900 font-medium truncate min-w-0">
            <span className="text-xs shrink-0">🏛️</span>
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider shrink-0">Context:</span>
            <span className="text-xs font-bold text-sanchay-navy-800 truncate" title={[context?.department, context?.organization, context?.service, context?.section].filter(Boolean).join(' → ')}>
              {[context?.department, context?.organization, context?.service, context?.section]
                .filter(Boolean)
                .join(' → ') || 'National Service Directory'}
            </span>
          </div>
          {context?.capability && (
            <span className="text-[10px] bg-white px-2 py-0.5 rounded font-mono text-slate-600 border border-slate-200 truncate shrink-0 ml-2">
              {context.capability}
            </span>
          )}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === MessageSender.USER
                  ? 'items-end'
                  : msg.sender === MessageSender.SYSTEM
                  ? 'items-center'
                  : 'items-start'
              }`}
            >
              {msg.sender === MessageSender.SYSTEM ? (
                <div className="bg-slate-200 text-slate-700 text-[11px] px-3 py-1 rounded-full font-medium my-1">
                  {msg.content}
                </div>
              ) : (
                <div className="space-y-2 max-w-[88%]">
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === MessageSender.USER
                        ? 'bg-sanchay-navy-700 text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Citations Attached to AI Message */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="bg-white rounded-xl p-3 border border-slate-200 text-[11px] space-y-2 shadow-2xs">
                      <div className="flex items-center gap-1 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                        <span>📜</span>
                        <span>Verified Citations ({msg.citations.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {msg.citations.map((cite, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-slate-50 rounded-lg border border-slate-150 flex items-center justify-between gap-2"
                          >
                            <div className="truncate">
                              <span className="font-bold text-sanchay-navy-900 block truncate">
                                {cite.sourceTitle}
                              </span>
                              <span className="text-slate-500 text-[10px]">
                                {cite.section ? `Section: ${cite.section}` : ''}
                                {cite.page ? ` (Page ${cite.page})` : ''}
                              </span>
                            </div>
                            <a
                              href={cite.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sanchay-navy-700 hover:text-sanchay-navy-900 font-bold hover:underline shrink-0 text-[10px]"
                            >
                              Source ↗
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Card Attached to AI Message */}
                  {msg.actionCard && (
                    <div className="bg-linear-to-r from-sanchay-navy-900 to-sanchay-navy-800 text-white rounded-2xl p-4 space-y-3 shadow-md border border-sanchay-navy-700">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sanchay-gold-300">
                          {msg.actionCard.confirmationRequired ? 'Consequential Action' : 'Action Suggestion'}
                        </span>
                        <h4 className="text-xs font-bold text-white mt-0.5">{msg.actionCard.title}</h4>
                        <p className="text-[11px] text-slate-300 mt-1">{msg.actionCard.description}</p>
                      </div>

                      {msg.actionCard.confirmationRequired ? (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleConfirmAction(msg.actionCard!)}
                            disabled={isLoading}
                            className="flex-1 py-2 bg-sanchay-gold-500 hover:bg-sanchay-gold-600 text-sanchay-navy-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Confirm & Execute
                          </button>
                        </div>
                      ) : (
                        <Link
                          href={`/applications/new?serviceSlug=${(msg.actionCard.payload as any)?.serviceSlug || 'jee-main'}`}
                          onClick={onClose}
                          className="block text-center py-2 bg-sanchay-gold-500 hover:bg-sanchay-gold-600 text-sanchay-navy-950 font-bold text-xs rounded-xl shadow-xs transition-colors"
                        >
                          Review & Start Application →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <div className="w-4 h-4 border-2 border-sanchay-navy-600 border-t-transparent rounded-full animate-spin" />
              <span>Sanchay AI is reasoning and retrieving official sources...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-2.5 bg-slate-100 border-t border-slate-200 overflow-x-auto flex gap-1.5 no-scrollbar">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-[11px] font-medium bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input Footer */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Sanchay AI or request an action..."
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-2.5 bg-sanchay-navy-700 hover:bg-sanchay-navy-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
