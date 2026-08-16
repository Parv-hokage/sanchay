'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '../../lib/api-client';
import { useAuth } from '../../context/AuthContext';

interface ApplicationItem {
  id: string;
  status: string;
  currentStep: string;
  externalApplicationReference: string | null;
  submittedAt: string | null;
  updatedAt: string;
  service: {
    id: string;
    name: string;
    slug: string;
    organization?: { name: string; department?: { name: string } };
  };
  fields: {
    fieldKey: string;
    fieldValue: string;
  }[];
}

export default function ApplicationsDashboardPage() {
  const { isAuthenticated, openLogin } = useAuth();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<ApplicationItem[]>('/applications');
      setApplications(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-sanchay-emerald-50 text-sanchay-emerald-800 border-sanchay-emerald-200';
      case 'READY_FOR_REVIEW':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'IN_PROGRESS':
        return 'bg-sanchay-gold-50 text-sanchay-gold-800 border-sanchay-gold-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-sanchay-navy-50 text-sanchay-navy-800 flex items-center justify-center text-2xl mx-auto">
          🔒
        </div>
        <h1 className="text-xl font-bold text-sanchay-navy-900">Citizen Sign In Required</h1>
        <p className="text-xs text-slate-600">
          Sign in with your verified Sanchay UID or OTP to access your active government applications.
        </p>
        <button
          onClick={openLogin}
          className="px-6 py-2.5 bg-sanchay-navy-800 hover:bg-sanchay-navy-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-sanchay-navy-700">Home</Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">My Applications</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-sanchay-gold-700">
            Citizen Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-sanchay-navy-900 mt-1">
            My Government Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track real-time status, manage draft submissions, and inspect official application receipts.
          </p>
        </div>

        <Link
          href="/"
          className="px-5 py-2.5 bg-sanchay-navy-800 hover:bg-sanchay-navy-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          + New Application
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-xs border border-red-200">
          {error}
        </div>
      )}

      {/* Application List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center space-y-3">
          <div className="text-3xl">📂</div>
          <h3 className="text-base font-bold text-slate-800">No applications created yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You have not started any government applications. Browse the service catalog to discover exams and healthcare assurance.
          </p>
          <Link
            href="/"
            className="px-4 py-2 bg-sanchay-navy-700 text-white rounded-xl text-xs font-semibold inline-block mt-2"
          >
            Browse Services Directory
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(
                      app.status,
                    )}`}
                  >
                    {app.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Last updated: {new Date(app.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-base font-bold text-sanchay-navy-900">
                  {app.service?.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Authority: {app.service?.organization?.name || 'Central Agency'}
                </p>

                {app.externalApplicationReference && (
                  <div className="mt-2 text-xs text-sanchay-navy-800">
                    <span>Reference ID: </span>
                    <code className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {app.externalApplicationReference}
                    </code>
                  </div>
                )}
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                <Link
                  href={`/applications/${app.id}`}
                  className="w-full sm:w-auto inline-block text-center px-5 py-2 bg-sanchay-navy-50 hover:bg-sanchay-navy-100 text-sanchay-navy-800 text-xs font-bold rounded-xl border border-sanchay-navy-200 transition-colors"
                >
                  {app.status === 'SUBMITTED' ? 'View Details & Status →' : 'Continue Application →'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
