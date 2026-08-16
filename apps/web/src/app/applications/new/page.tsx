'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest } from '../../../lib/api-client';
import { useAuth } from '../../../context/AuthContext';

function NewApplicationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, openLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const serviceSlug = searchParams.get('serviceSlug') || 'jee-main';
  const capabilitySlug = searchParams.get('capabilitySlug') || 'registration';

  useEffect(() => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    initializeApplication();
  }, [isAuthenticated, serviceSlug, capabilitySlug]);

  const initializeApplication = async () => {
    try {
      const res = await apiRequest<{ id: string }>('/applications', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: serviceSlug,
          capabilityId: capabilitySlug,
        }),
      });

      router.replace(`/applications/${res.data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize application.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-24 text-center space-y-4">
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-sm font-bold text-red-800 mb-2">Initialization Error</p>
          <p className="text-xs text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-sanchay-navy-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Return to Directory
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 border-3 border-sanchay-navy-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-sm font-bold text-sanchay-navy-900">Preparing Application Form</h2>
          <p className="text-xs text-slate-500">
            Constructing dynamic schema from capability requirements...
          </p>
        </div>
      )}
    </div>
  );
}

export default function NewApplicationPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-24 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading application initiator...</p>
        </div>
      }
    >
      <NewApplicationContent />
    </Suspense>
  );
}
