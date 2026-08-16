'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in UI component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[350px] w-full flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-sanchay-slate-900">
            Something went wrong while rendering this section
          </h3>
          <p className="mt-1 text-xs text-sanchay-slate-600 max-w-md">
            The platform remains secure and operational. Your application data has not been affected.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-sanchay-navy-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sanchay-navy-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reload Component</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
