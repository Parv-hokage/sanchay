'use client';

import React from 'react';
import { useAI, AIContextState } from '../../context/AIContext';
import { AIWorkspaceDrawer } from './AIWorkspaceDrawer';

interface AIButtonProps {
  context?: AIContextState;
}

export const AIButton: React.FC<AIButtonProps> = ({ context: propContext }) => {
  const { isDrawerOpen, openDrawer, closeDrawer, context: globalContext } = useAI();
  const activeContext = propContext || globalContext;

  return (
    <>
      {/* Global Floating Action Trigger */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => openDrawer(propContext)}
          className="flex items-center gap-2.5 px-4 py-3 bg-linear-to-r from-sanchay-navy-800 to-sanchay-navy-950 text-white rounded-full shadow-2xl hover:shadow-sanchay-gold-500/20 hover:scale-105 border border-sanchay-gold-500/30 transition-all cursor-pointer group"
          aria-label="Open SANCHAY AI Assistant"
        >
          <div className="w-6 h-6 rounded-full bg-sanchay-gold-500/20 flex items-center justify-center text-sanchay-gold-400 group-hover:rotate-12 transition-transform font-bold">
            ◯
          </div>
          <span className="text-xs font-bold tracking-wide">SANCHAY AI</span>
          <span className="w-2 h-2 rounded-full bg-sanchay-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* ChatGPT-Style Full Conversational Workspace Drawer */}
      <AIWorkspaceDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        context={activeContext}
      />
    </>
  );
};

