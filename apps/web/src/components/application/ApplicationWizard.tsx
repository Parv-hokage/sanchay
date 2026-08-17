'use client';

import React, { useState } from 'react';
import { apiRequest } from '../../lib/api-client';

interface ApplicationField {
  id: string;
  fieldKey: string;
  fieldValue: string;
  source: 'USER' | 'PROFILE' | 'GOVERNMENT' | 'SYSTEM';
  verified: boolean;
  label?: string;
  required?: boolean;
}

interface ApplicationWizardProps {
  applicationId: string;
  serviceName: string;
  capabilityName: string;
  fields: ApplicationField[];
  currentStep: string;
  onFieldsUpdated: (fields: ApplicationField[]) => void;
  onProceedToReview: () => void;
}

export const ApplicationWizard: React.FC<ApplicationWizardProps> = ({
  applicationId,
  serviceName,
  capabilityName,
  fields,
  onFieldsUpdated,
  onProceedToReview,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    fields.forEach((f) => {
      init[f.fieldKey] = f.fieldValue || '';
    });
    return init;
  });

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Group fields into 3 logical steps
  const personalKeys = ['fullName', 'dateOfBirth', 'dob', 'gender', 'category'];
  const contactKeys = ['phone', 'phoneNumber', 'email', 'permanentAddress', 'address', 'state', 'pincode'];

  const personalFields = fields.filter((f) => personalKeys.includes(f.fieldKey));
  const contactFields = fields.filter((f) => contactKeys.includes(f.fieldKey));
  const requirementFields = fields.filter(
    (f) => !personalKeys.includes(f.fieldKey) && !contactKeys.includes(f.fieldKey),
  );

  const steps = [
    { title: 'Personal Information', fields: personalFields.length > 0 ? personalFields : fields.slice(0, 2) },
    { title: 'Contact & Residential', fields: contactFields.length > 0 ? contactFields : fields.slice(2, 4) },
    { title: 'Application Specifics', fields: requirementFields.length > 0 ? requirementFields : fields.slice(4) },
  ].filter((s) => s.fields.length > 0);

  const currentStepFields = steps[activeStepIndex]?.fields || [];

  const handleInputChange = (fieldKey: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const handleAutoFill = async () => {
    setIsAutoFilling(true);
    setSaveMessage(null);
    try {
      const res = await apiRequest<{ fields: ApplicationField[] }>(
        `/applications/${applicationId}/autofill`,
        { method: 'POST', body: JSON.stringify({}) },
      );

      const newFormData: Record<string, string> = {};
      res.data.fields.forEach((f) => {
        newFormData[f.fieldKey] = f.fieldValue;
      });
      setFormData(newFormData);
      onFieldsUpdated(res.data.fields);
      setSaveMessage('✨ Verified citizen profile fields auto-filled successfully!');
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Auto-fill failed.');
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const fieldPayload = Object.entries(formData).map(([fieldKey, fieldValue]) => ({
        fieldKey,
        fieldValue,
      }));

      const res = await apiRequest<{ fields: ApplicationField[] }>(
        `/applications/${applicationId}/fields`,
        {
          method: 'PATCH',
          body: JSON.stringify({ fields: fieldPayload, currentStep: steps[activeStepIndex]?.title }),
        },
      );

      onFieldsUpdated(res.data.fields);
      setSaveMessage('Draft saved securely to your account.');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save draft.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    await handleSaveDraft();
    if (activeStepIndex < steps.length - 1) {
      setActiveStepIndex(activeStepIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onProceedToReview();
    }
  };

  const formatLabel = (key: string): string => {
    const labels: Record<string, string> = {
      fullName: 'Full Name',
      dateOfBirth: 'Date of Birth (YYYY-MM-DD)',
      dob: 'Date of Birth (YYYY-MM-DD)',
      gender: 'Gender',
      category: 'Category (GEN / OBC-NCL / SC / ST / EWS)',
      twelfthMarks: 'Class 12 Passing Status / Percentage',
      permanentAddress: 'Permanent Residential Address',
      address: 'Permanent Address',
      state: 'Residential State',
      pincode: 'PIN Code',
      phone: 'Mobile Number',
      phoneNumber: 'Mobile Number',
      email: 'Email Address',
      rationCardNumber: 'Ration Card Number / SECC ID',
    };
    return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Wizard Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-sanchay-gold-700 bg-sanchay-gold-50 px-2 py-0.5 rounded border border-sanchay-gold-200">
            {serviceName}
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-sanchay-navy-900 mt-1.5">
            {capabilityName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Step {activeStepIndex + 1} of {steps.length}: {steps[activeStepIndex]?.title}
          </p>
        </div>

        {/* Auto-fill Action Button */}
        <button
          onClick={handleAutoFill}
          disabled={isAutoFilling}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sanchay-navy-800 to-sanchay-navy-900 hover:from-sanchay-navy-900 hover:to-black text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          <span>✨</span>
          <span>{isAutoFilling ? 'Auto-Filling...' : 'Auto-Fill from Profile'}</span>
        </button>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  idx === activeStepIndex
                    ? 'bg-sanchay-navy-800 text-white shadow-xs'
                    : idx < activeStepIndex
                    ? 'bg-sanchay-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {idx < activeStepIndex ? '✓' : idx + 1}
              </div>
              <span
                className={`text-xs font-semibold hidden md:inline ${
                  idx === activeStepIndex ? 'text-sanchay-navy-900' : 'text-slate-400'
                }`}
              >
                {step.title}
              </span>
              {idx < steps.length - 1 && (
                <div className="w-8 sm:w-16 h-0.5 bg-slate-200 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Draft Toast Notice */}
      {saveMessage && (
        <div className="bg-sanchay-emerald-50 border border-sanchay-emerald-200 text-sanchay-emerald-900 p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <span>✓</span>
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Dynamic Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-sanchay-navy-900 pb-3 border-b border-slate-100">
          {steps[activeStepIndex]?.title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {currentStepFields.map((field) => {
            const val = formData[field.fieldKey] || '';
            const matchingField = fields.find((f) => f.fieldKey === field.fieldKey);
            const isAutoFilled = matchingField?.source === 'PROFILE' && val !== '';

            return (
              <div
                key={field.fieldKey}
                className={field.fieldKey.includes('Address') ? 'md:col-span-2' : ''}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {formatLabel(field.fieldKey)}
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  {isAutoFilled && (
                    <span className="text-[10px] font-semibold text-sanchay-emerald-700 bg-sanchay-emerald-50 border border-sanchay-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>🛡️</span> Verified Sanchay Profile
                    </span>
                  )}
                </div>

                {field.fieldKey === 'gender' ? (
                  <select
                    value={val}
                    onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other / Third Gender</option>
                  </select>
                ) : field.fieldKey === 'category' ? (
                  <select
                    value={val}
                    onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
                  >
                    <option value="">Select Category</option>
                    <option value="GENERAL">General (GEN)</option>
                    <option value="EWS">General - Economically Weaker Section (EWS)</option>
                    <option value="OBC_NCL">Other Backward Class (OBC-NCL)</option>
                    <option value="SC">Scheduled Caste (SC)</option>
                    <option value="ST">Scheduled Tribe (ST)</option>
                  </select>
                ) : field.fieldKey.includes('Address') ? (
                  <textarea
                    rows={3}
                    value={val}
                    onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                    placeholder="Enter full address..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500 resize-none"
                  />
                ) : (
                  <input
                    type={field.fieldKey.toLowerCase().includes('date') ? 'date' : 'text'}
                    value={val}
                    onChange={(e) => handleInputChange(field.fieldKey, e.target.value)}
                    placeholder={`Enter ${formatLabel(field.fieldKey)}...`}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {isSaving ? 'Saving...' : '💾 Save Draft'}
          </button>

          <div className="flex items-center gap-3">
            {activeStepIndex > 0 && (
              <button
                type="button"
                onClick={() => setActiveStepIndex(activeStepIndex - 1)}
                className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                ← Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-sanchay-navy-700 hover:bg-sanchay-navy-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {activeStepIndex === steps.length - 1 ? 'Proceed to Review →' : 'Save & Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
