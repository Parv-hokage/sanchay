'use client';

import React, { useState } from 'react';

interface AIButtonProps {
  context?: {
    department?: string;
    organization?: string;
    service?: string;
    capability?: string;
  };
}

export const AIButton: React.FC<AIButtonProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Trigger */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-sanchay-navy-800 to-sanchay-navy-950 text-white rounded-full shadow-2xl hover:shadow-sanchay-gold-500/20 hover:scale-105 border border-sanchay-gold-500/30 transition-all cursor-pointer group"
          aria-label="Open SANCHAY AI Assistant"
        >
          <div className="w-6 h-6 rounded-full bg-sanchay-gold-500/20 flex items-center justify-center text-sanchay-gold-400 group-hover:rotate-12 transition-transform">
            ✨
          </div>
          <span className="text-xs font-bold tracking-wide">SANCHAY AI</span>
          <span className="w-2 h-2 rounded-full bg-sanchay-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* AI Assistant Sheet Shell */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-sanchay-navy-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sanchay-gold-500/20 text-sanchay-gold-400 flex items-center justify-center text-sm">
                ✨
              </div>
              <div>
                <h3 className="text-xs font-bold leading-tight">SANCHAY Citizen Assistant</h3>
                <span className="text-[10px] text-slate-400">Context-Aware AI Orchestrator</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>

          {/* Context Banner */}
          {context?.service && (
            <div className="bg-sanchay-navy-50 px-4 py-2 border-b border-sanchay-navy-100 flex items-center gap-1.5 text-[11px] text-sanchay-navy-800">
              <span className="font-bold">Active Context:</span>
              <span className="truncate">{context.service}</span>
              {context.capability && <span className="text-slate-500">({context.capability})</span>}
            </div>
          )}

          {/* Chat Body */}
          <div className="p-4 flex-1 h-72 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-700 shadow-2xs">
              <p className="font-semibold text-sanchay-navy-900 mb-1">
                Namaste! I am your SANCHAY Digital Assistant.
              </p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {context?.service
                  ? `I am currently anchored to ${context.service}. In Phase 6 (AI Orchestration), I will answer RAG-grounded official questions and prepare auto-fill actions with your consent.`
                  : 'I can help you discover government services, verify eligibility requirements, and track active applications across all departments.'}
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-sanchay-gold-50/70 border border-sanchay-gold-200/80 text-[10px] text-sanchay-gold-900">
              🛡️ <strong>Zero-Trust Guardrail:</strong> AI cannot execute consequential submissions or access your documents without explicit citizen confirmation.
            </div>
          </div>

          {/* Chat Input Placeholder */}
          <div className="p-3 bg-white border-t border-slate-200">
            <div className="flex gap-2">
              <input
                type="text"
                disabled
                placeholder="AI orchestration active in Phase 6..."
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
              />
              <button
                disabled
                className="px-3 py-2 bg-slate-200 text-slate-400 rounded-xl text-xs font-semibold cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
