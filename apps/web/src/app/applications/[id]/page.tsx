'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { apiRequest } from '../../../lib/api-client';
import { ApplicationWizard } from '../../../components/application/ApplicationWizard';
import { ApplicationReview } from '../../../components/application/ApplicationReview';
import { ApplicationSuccess } from '../../../components/application/ApplicationSuccess';
import { useAI } from '../../../context/AIContext';

interface ApplicationData {
  id: string;
  userId: string;
  serviceId: string;
  status: string;
  currentStep: string;
  externalApplicationReference: string | null;
  submittedAt: string | null;
  service: {
    id: string;
    name: string;
    slug: string;
    organization?: { name: string; department?: { name: string; slug: string } };
  };
  capability?: {
    id: string;
    name: string;
    slug: string;
  };
  fields: {
    id: string;
    fieldKey: string;
    fieldValue: string;
    source: 'USER' | 'PROFILE' | 'GOVERNMENT' | 'SYSTEM';
    verified: boolean;
  }[];
}

interface ReviewPayload {
  applicationId: string;
  service: { name: string };
  capability: { name: string };
  sections: any[];
  isComplete: boolean;
  missingRequiredCount: number;
}

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { setAIContext } = useAI();
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wizard vs Review vs Success views
  const [viewMode, setViewMode] = useState<'WIZARD' | 'REVIEW' | 'SUCCESS'>('WIZARD');
  const [reviewData, setReviewData] = useState<ReviewPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    referenceNumber: string;
    submittedAt: string;
  } | null>(null);

  useEffect(() => {
    fetchApplication();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (application) {
      setAIContext({
        department: application.service?.organization?.department?.name || 'Government Services',
        organization: application.service?.organization?.name,
        service: application.service?.name,
        capability: application.capability?.name || 'Application Form',
        workflow: 'application',
        route: `/applications/${application.id}`,
      });
    }
  }, [application, setAIContext]);

  const fetchApplication = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<ApplicationData>(`/applications/${resolvedParams.id}`);
      setApplication(res.data);
      if (res.data.status === 'SUBMITTED' && res.data.externalApplicationReference) {
        setSubmissionResult({
          referenceNumber: res.data.externalApplicationReference,
          submittedAt: res.data.submittedAt || new Date().toISOString(),
        });
        setViewMode('SUCCESS');
      }
    } catch (err: any) {
      setError(err.message || 'Application not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToReview = async () => {
    try {
      const res = await apiRequest<ReviewPayload>(`/applications/${resolvedParams.id}/review`);
      setReviewData(res.data);
      setViewMode('REVIEW');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(err.message || 'Failed to load review sheet.');
    }
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    try {
      // 1. Explicit Citizen Confirmation
      await apiRequest(`/applications/${resolvedParams.id}/confirm`, {
        method: 'POST',
      });

      // 2. Submit to Adapter Boundary with unique Idempotency Key
      const idempotencyKey = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const res = await apiRequest<{
        referenceNumber: string;
        submittedAt: string;
      }>(`/applications/${resolvedParams.id}/submit`, {
        method: 'POST',
        headers: { 'idempotency-key': idempotencyKey },
      });

      setSubmissionResult(res.data);
      setViewMode('SUCCESS');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto py-12">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-44 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="h-96 bg-slate-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="text-3xl">⚠️</div>
        <h1 className="text-lg font-bold text-slate-800">Application Error</h1>
        <p className="text-xs text-slate-500">{error || 'Could not load the requested application.'}</p>
        <Link
          href="/"
          className="px-4 py-2 bg-sanchay-navy-700 text-white rounded-xl text-xs font-semibold inline-block"
        >
          Return to Service Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 space-y-6">

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-sanchay-navy-700">Home</Link>
        <span>/</span>
        <Link href="/applications" className="hover:text-sanchay-navy-700">Applications</Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">{application.service?.name}</span>
      </nav>

      {/* View Mode Switching */}
      {viewMode === 'WIZARD' && (
        <ApplicationWizard
          applicationId={application.id}
          serviceName={application.service?.name || 'Government Service'}
          capabilityName={application.capability?.name || 'Application Form'}
          fields={application.fields}
          currentStep={application.currentStep}
          onFieldsUpdated={(updatedFields) => {
            setApplication({ ...application, fields: updatedFields });
          }}
          onProceedToReview={handleProceedToReview}
        />
      )}

      {viewMode === 'REVIEW' && reviewData && (
        <ApplicationReview
          applicationId={application.id}
          serviceName={application.service?.name || 'Government Service'}
          capabilityName={application.capability?.name || 'Application Form'}
          sections={reviewData.sections}
          isComplete={reviewData.isComplete}
          missingRequiredCount={reviewData.missingRequiredCount}
          onEditStep={() => setViewMode('WIZARD')}
          onSubmitApplication={handleSubmitApplication}
          isSubmitting={isSubmitting}
        />
      )}

      {viewMode === 'SUCCESS' && submissionResult && (
        <ApplicationSuccess
          applicationId={application.id}
          serviceName={application.service?.name || 'Government Service'}
          referenceNumber={submissionResult.referenceNumber}
          submittedAt={submissionResult.submittedAt}
        />
      )}
    </div>
  );
}
