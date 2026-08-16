'use client';

import React from 'react';
import Link from 'next/link';

interface ApplicationSuccessProps {
  applicationId: string;
  serviceName: string;
  referenceNumber: string;
  submittedAt: string;
}

export const ApplicationSuccess: React.FC<ApplicationSuccessProps> = ({
  serviceName,
  referenceNumber,
  submittedAt,
}) => {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-sanchay-emerald-50 text-sanchay-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto border border-sanchay-emerald-200 shadow-inner">
          ✓
        </div>

        {/* Heading */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-sanchay-emerald-700 bg-sanchay-emerald-50 px-3 py-1 rounded-full border border-sanchay-emerald-200">
            Application Submitted
          </span>
          <h1 className="text-2xl font-extrabold text-sanchay-navy-900 mt-3">
            {serviceName} Application Received
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Your application has been safely registered and forwarded to the statutory authority adapter.
          </p>
        </div>

        {/* Reference Number Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
          <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">
            Official Application Reference Number
          </span>
          <code className="text-lg sm:text-xl font-mono font-bold text-sanchay-navy-900 bg-white px-4 py-1.5 rounded-xl border border-slate-200 inline-block shadow-2xs">
            {referenceNumber}
          </code>
          <p className="text-[11px] text-slate-400 mt-2">
            Submitted at: {new Date(submittedAt).toLocaleString()}
          </p>
        </div>

        {/* Sandbox Disclaimer */}
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 text-left flex items-center gap-2">
          <span>ℹ️</span>
          <span>
            <strong>Phase 3 Sandbox Simulation:</strong> In Phases 7 and 8, this submission connects directly to live NTA / NHA government gateway endpoints.
          </span>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/applications"
            className="px-5 py-2.5 bg-sanchay-navy-800 hover:bg-sanchay-navy-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors text-center"
          >
            View My Applications Dashboard
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors text-center"
          >
            Return to Service Directory
          </Link>
        </div>
      </div>
    </div>
  );
};
