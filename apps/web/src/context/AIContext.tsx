'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export interface AIContextState {
  department?: string;
  organization?: string;
  service?: string;
  section?: string;
  activeItem?: string;
  route?: string;
  capability?: string;
  workflow?: string;
}

interface AIContextValue {
  context: AIContextState;
  setAIContext: (ctx: Partial<AIContextState> | ((prev: AIContextState) => AIContextState)) => void;
  resetAIContext: () => void;
  isDrawerOpen: boolean;
  openDrawer: (customContext?: Partial<AIContextState>) => void;
  closeDrawer: () => void;
}

const AIContext = createContext<AIContextValue | undefined>(undefined);

export const AIContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [context, setContextState] = useState<AIContextState>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Automatically update base context based on route
  useEffect(() => {
    if (!pathname) return;

    if (pathname.startsWith('/services/jee-main')) {
      setContextState((prev) => ({
        ...prev,
        department: 'Education',
        organization: 'NTA',
        service: 'JEE Main',
        route: pathname,
      }));
    } else if (pathname.startsWith('/services/ayushman-bharat')) {
      setContextState((prev) => ({
        ...prev,
        department: 'Health & Family Welfare',
        organization: 'NHA',
        service: 'Ayushman Bharat',
        route: pathname,
      }));
    } else if (pathname.startsWith('/applications')) {
      setContextState({
        service: 'My Applications',
        route: pathname,
      });
    } else if (pathname.startsWith('/documents')) {
      setContextState({
        service: 'Document Vault',
        route: pathname,
      });
    } else if (pathname.startsWith('/knowledge')) {
      setContextState({
        service: 'Official Knowledge Directory',
        route: pathname,
      });
    } else {
      setContextState({
        service: 'National Service Directory',
        route: pathname,
      });
    }
  }, [pathname]);

  const setAIContext = (ctx: Partial<AIContextState> | ((prev: AIContextState) => AIContextState)) => {
    if (typeof ctx === 'function') {
      setContextState(ctx);
    } else {
      setContextState((prev) => ({ ...prev, ...ctx }));
    }
  };

  const resetAIContext = () => {
    setContextState({
      service: 'National Service Directory',
      route: pathname,
    });
  };

  const openDrawer = (customContext?: Partial<AIContextState>) => {
    if (customContext) {
      setContextState((prev) => ({ ...prev, ...customContext }));
    }
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <AIContext.Provider
      value={{
        context,
        setAIContext,
        resetAIContext,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = (): AIContextValue => {
  const ctx = useContext(AIContext);
  if (!ctx) {
    throw new Error('useAI must be used within an AIContextProvider');
  }
  return ctx;
};
