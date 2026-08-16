'use client';

import React, { useState } from 'react';

interface ReviewSection {
  title: string;
  fields: {
    fieldKey: string;
    label: string;
    value: string;
    source: string;
    verified: boolean;
    required: boolean;
    status: 'AUTO_FILLED' | 'USER_ENTERED' | 'MISSING';
  }[];
}

interface ApplicationReviewProps {
  applicationId: string;
  serviceName: string;
  capabilityName: string;
  sections: ReviewSection[];
  isComplete: boolean;
  missingRequiredCount: number;
  onEditStep: () => void;
  onSubmitApplication: () => void;
  isSubmitting: boolean;
}

export const ApplicationReview: React.FC<ApplicationReviewProps> = ({
  serviceName,
  capabilityName,
  sections,
  isComplete,
  missingRequiredCount,
  onEditStep,
  onSubmitApplication,
  isSubmitting,
}) => {
  const [hasConfirmed, setHasConfirmed] = useState(false);

  return (
    <div className="space-y-6">
      {/* Review Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-sanchay-gold-700 bg-sanchay-gold-50 px-2 py-0.5 rounded border border-sanchay-gold-200">
          Final Citizen Review
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-sanchay-navy-900 mt-1.5">
          Review Application: {serviceName}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verify all details before providing explicit confirmation for consequential submission.
        </p>
      </div>

      {/* Missing Fields Warning */}
      {!isComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="font-bold">Missing Required Fields ({missingRequiredCount})</p>
            <p className="text-[11px] text-amber-700">
              Please go back and complete all required fields before submitting this application.
            </p>
          </div>
        </div>
      )}

      {/* Review Sections */}
      <div className="space-y-5">
        {sections.map((sec, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-sanchay-navy-900">{sec.title}</h2>
              <button
                onClick={onEditStep}
                className="text-xs font-semibold text-sanchay-navy-700 hover:text-sanchay-navy-900 underline cursor-pointer"
              >
                Edit Details
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sec.fields.map((field) => (
                <div key={field.fieldKey} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[11px] font-semibold text-slate-500">{field.label}</span>
                    {field.status === 'AUTO_FILLED' ? (
                      <span className="text-[9px] font-bold text-sanchay-emerald-700 bg-sanchay-emerald-50 border border-sanchay-emerald-200 px-1.5 py-0.5 rounded">
                        Auto-Filled (Profile)
                      </span>
                    ) : field.status === 'MISSING' ? (
                      <span className="text-[9px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                        Missing
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-600 bg-slate-200/70 px-1.5 py-0.5 rounded">
                        User Provided
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-800 break-words">
                    {field.value || <span className="text-red-500 italic">Not Provided</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Explicit Citizen Confirmation Agreement */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="p-4 rounded-2xl bg-sanchay-gold-50/70 border border-sanchay-gold-200 text-xs text-sanchay-gold-950 flex items-start gap-3">
          <span className="text-xl">🛡️</span>
          <div>
            <p className="font-bold">Zero-Trust Consequential Submission Guardrail</p>
            <p className="text-[11px] text-sanchay-gold-900 mt-0.5">
              By confirming, you authorize Sanchay to package your verified details into the official schema of {serviceName}. AI systems cannot perform this action on your behalf.
            </p>
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={hasConfirmed}
            onChange={(e) => setHasConfirmed(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-slate-300 text-sanchay-navy-700 focus:ring-sanchay-navy-500 cursor-pointer"
          />
          <span className="text-xs font-semibold text-slate-700 leading-relaxed">
            I hereby confirm that all information provided is true and accurate to the best of my knowledge, and I explicitly authorize submission to the statutory authority.
          </span>
        </label>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onEditStep}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            ← Back to Edit
          </button>

          <button
            type="button"
            disabled={!hasConfirmed || !isComplete || isSubmitting}
            onClick={onSubmitApplication}
            className="px-6 py-2.5 bg-sanchay-emerald-600 hover:bg-sanchay-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>{isSubmitting ? 'Submitting Application...' : 'Confirm & Submit Application ✓'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
