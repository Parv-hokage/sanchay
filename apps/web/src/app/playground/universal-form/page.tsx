'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useAI } from '../../../context/AIContext';

interface FormState {
  // Profile backed
  fullName: string;
  dateOfBirth: string;
  gender: string;
  category: string;
  class10Board: string;
  class10PassingYear: string;
  class10Percentage: string;
  class12Board: string;
  class12PassingYear: string;
  class12Percentage: string;
  stream: string;

  // Application owned
  preferredCity: string;
  preferredCourse: string;
  preferredInstitution: string;
  applicationPreference: string;
  emergencyContact: string;

  // Documents
  twelfthMarksheetAttached: boolean;
  incomeCertificateUploaded: boolean;
}

export default function UniversalFormPlaygroundPage() {
  const { user, profile } = useAuth();
  const { setAIContext, openDrawer } = useAI();

  const [activeTab, setActiveTab] = useState<'form' | 'review' | 'submitted'>('form');
  const [activeSection, setActiveSection] = useState<number>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<{ referenceCode: string; timestamp: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [aiSyncNotification, setAiSyncNotification] = useState<string | null>(null);

  // Form State
  const [formState, setFormState] = useState<FormState>({
    fullName: profile?.fullName || '',
    dateOfBirth: profile?.dateOfBirth ? String(profile.dateOfBirth).split('T')[0] : '',
    gender: profile?.gender || '',
    category: profile?.category || '',
    class10Board: 'Central Board of Secondary Education (CBSE)',
    class10PassingYear: '2022',
    class10Percentage: '94.2',
    class12Board: 'Central Board of Secondary Education (CBSE)',
    class12PassingYear: '2024',
    class12Percentage: '92.5',
    stream: 'Science (PCM)',
    preferredCity: '',
    preferredCourse: 'Computer Science',
    preferredInstitution: '',
    applicationPreference: 'AIQ',
    emergencyContact: '',
    twelfthMarksheetAttached: true,
    incomeCertificateUploaded: false,
  });

  // Auto-sync profile attributes on load
  useEffect(() => {
    if (profile) {
      setFormState((prev) => ({
        ...prev,
        fullName: profile.fullName || prev.fullName,
        dateOfBirth: profile.dateOfBirth ? String(profile.dateOfBirth).split('T')[0] : prev.dateOfBirth,
        gender: profile.gender || prev.gender,
        category: profile.category || prev.category,
      }));
    }
  }, [profile]);

  // Set AI context for the playground
  useEffect(() => {
    setAIContext({
      department: 'Department of Digital Governance',
      organization: 'Sanchay Innovation Lab',
      service: 'Universal Form Playground',
      section: 'universal-form-test',
      workflow: `Playground Form State (City: ${formState.preferredCity || 'Unset'}, Course: ${formState.preferredCourse || 'Unset'})`,
      route: '/playground/universal-form',
    });
  }, [formState, setAIContext]);

  const handleFieldChange = (field: keyof FormState, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleQuickCommand = (commandText: string) => {
    setAiSyncNotification(`AI executing: "${commandText}"`);
    setTimeout(() => setAiSyncNotification(null), 4000);

    if (commandText.includes('Fill everything')) {
      setFormState((prev) => ({
        ...prev,
        fullName: profile?.fullName || 'Parv Garg',
        dateOfBirth: '2006-08-15',
        gender: profile?.gender || 'Female',
        category: profile?.category || 'OBC_NCL',
      }));
    } else if (commandText.includes('Noida')) {
      setFormState((prev) => ({ ...prev, preferredCity: 'Noida' }));
    } else if (commandText.includes('marksheet')) {
      setFormState((prev) => ({ ...prev, twelfthMarksheetAttached: true }));
    } else if (commandText.includes('Review')) {
      setActiveTab('review');
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formState.fullName) errors.fullName = 'Full name is required from Sanchay Profile.';
    if (!formState.preferredCity) errors.preferredCity = 'Preferred examination city is required.';
    if (!formState.preferredCourse) errors.preferredCourse = 'Preferred degree course is required.';
    if (!formState.preferredInstitution) errors.preferredInstitution = 'Target institution choice is required.';
    if (!formState.emergencyContact) {
      errors.emergencyContact = 'Emergency contact mobile number is required.';
    } else {
      const clean = formState.emergencyContact.replace(/[\s\-()]/g, '');
      if (!/^(\+91)?[6-9]\d{9}$/.test(clean)) {
        errors.emergencyContact = 'Must be a valid 10-digit mobile number starting with 6-9.';
      }
    }
    if (!formState.twelfthMarksheetAttached) {
      errors.twelfthMarksheetAttached = 'Class 12 Marksheet must be attached from Document Vault.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReviewClick = () => {
    if (validateForm()) {
      setActiveTab('review');
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    const testCode = `TEST-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    setSubmissionResult({
      referenceCode: testCode,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    });
    setActiveTab('submitted');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Top Banner: Absolute Isolation */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded text-xs tracking-wider uppercase">
              Isolated Test Bed
            </span>
            <span className="font-semibold text-amber-200">
              UNIVERSAL FORM PLAYGROUND — TEST ENVIRONMENT — NOT A GOVERNMENT APPLICATION
            </span>
          </div>
          <span className="text-amber-400/80 text-xs">
            Phase 8.1 Integration Gate • Zero authority writes • Synthetic mock engine
          </span>
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Universal Form Engine Playground
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 font-medium">
                Phase 8.1 Active
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Verifying canonical profile auto-fill, bidirectional AI synchronization, document vault linking, and confirmation safety.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab('form');
                setSubmissionResult(null);
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'form'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Interactive Form
            </button>
            <button
              type="button"
              onClick={handleReviewClick}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'review'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Review Sheet
            </button>
          </div>
        </div>

        {/* AI Sync Banner Notification */}
        {aiSyncNotification && (
          <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
              <span className="text-sm font-medium">{aiSyncNotification}</span>
            </div>
            <span className="text-xs text-blue-400/80 font-mono">Shared State Synchronized</span>
          </div>
        )}

        {/* Tab 1: Interactive Form */}
        {activeTab === 'form' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 Cols: Form Sections */}
            <div className="lg:col-span-8 space-y-8">
              {/* Section 1: Sovereign Profile Data */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <span>1. Personal Identity & Profile Data</span>
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                        PROFILE_VERIFIED
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Auto-resolved and locked from your authenticated Sanchay Profile (Single Source of Truth).
                    </p>
                  </div>
                  <Link
                    href="/profile"
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium underline flex items-center gap-1"
                  >
                    Manage Profile ↗
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Candidate Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={formState.fullName || 'Parv Garg'}
                        className="w-full bg-slate-950/70 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 cursor-not-allowed"
                      />
                      <span className="absolute right-3 top-2.5 text-emerald-400 text-xs font-medium flex items-center gap-1">
                        ✓ Profile Locked
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={formState.dateOfBirth || '2006-08-15'}
                        className="w-full bg-slate-950/70 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 cursor-not-allowed"
                      />
                      <span className="absolute right-3 top-2.5 text-emerald-400 text-xs font-medium flex items-center gap-1">
                        ✓ Verified
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Gender
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formState.gender || 'Female'}
                      className="w-full bg-slate-950/70 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Category / Caste
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formState.category || 'OBC_NCL'}
                      className="w-full bg-slate-950/70 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Academic History */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="border-b border-slate-800/80 pb-4 mb-6">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>2. Academic Qualifications</span>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                      PROFILE_VERIFIED
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Official 10th and 12th board records linked from verified education registry.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Class 10 Board
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formState.class10Board}
                      className="w-full bg-slate-950/70 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Class 10 Passing Year
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formState.class10PassingYear}
                      className="w-full bg-slate-950/70 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Class 10 Score (%)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`${formState.class10Percentage}%`}
                      className="w-full bg-slate-950/70 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Class 12 Board
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formState.class12Board}
                      className="w-full bg-slate-950/70 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Class 12 Passing Year
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formState.class12PassingYear}
                      className="w-full bg-slate-950/70 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Class 12 Score (%)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`${formState.class12Percentage}%`}
                      className="w-full bg-slate-950/70 border border-slate-700/60 rounded-lg px-3.5 py-2.5 text-xs text-slate-200 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Application Preferences (Interactive & AI Syncable) */}
              <div className="bg-slate-900/60 border border-blue-500/30 rounded-2xl p-6 relative">
                <div className="border-b border-slate-800/80 pb-4 mb-6">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>3. Application Preferences</span>
                    <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono">
                      USER_PROVIDED / AI_SYNCABLE
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Application-owned parameters that can be typed directly or modified conversationally by the AI assistant.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Preferred Examination City <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formState.preferredCity}
                      onChange={(e) => handleFieldChange('preferredCity', e.target.value)}
                      placeholder="e.g. Noida, Delhi, Bengaluru"
                      className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.preferredCity ? 'border-rose-500/80 ring-1 ring-rose-500' : 'border-slate-700'
                      }`}
                    />
                    {validationErrors.preferredCity && (
                      <p className="text-rose-400 text-xs mt-1">{validationErrors.preferredCity}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Preferred Degree Course <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formState.preferredCourse}
                      onChange={(e) => handleFieldChange('preferredCourse', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Computer Science">Computer Science & Engineering</option>
                      <option value="Electronics">Electronics & Communication</option>
                      <option value="Mechanical">Mechanical Engineering</option>
                      <option value="Data Science">Data Science & AI</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Target Institution Choice <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formState.preferredInstitution}
                      onChange={(e) => handleFieldChange('preferredInstitution', e.target.value)}
                      placeholder="e.g. IIT Delhi, NIT Trichy"
                      className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.preferredInstitution ? 'border-rose-500/80 ring-1 ring-rose-500' : 'border-slate-700'
                      }`}
                    />
                    {validationErrors.preferredInstitution && (
                      <p className="text-rose-400 text-xs mt-1">{validationErrors.preferredInstitution}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Emergency Contact Mobile <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formState.emergencyContact}
                      onChange={(e) => handleFieldChange('emergencyContact', e.target.value)}
                      placeholder="+91 98765 43210"
                      className={`w-full bg-slate-950 border rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.emergencyContact ? 'border-rose-500/80 ring-1 ring-rose-500' : 'border-slate-700'
                      }`}
                    />
                    {validationErrors.emergencyContact && (
                      <p className="text-rose-400 text-xs mt-1">{validationErrors.emergencyContact}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 4: Document Vault & Attachments */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                <div className="border-b border-slate-800/80 pb-4 mb-6">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>4. Sovereign Document Verification</span>
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
                      DOCUMENT_VAULT
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Attaching sovereign documents from your Private Document Vault.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Doc 1: 12th Marksheet */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                        PDF
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-200">
                          Class 12 Official Marksheet
                        </div>
                        <div className="text-xs text-slate-400">
                          File: class12_marksheet.pdf • ClamAV Clean • Digilocker Signed
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium">
                        ✓ Attached from Vault
                      </span>
                    </div>
                  </div>

                  {/* Doc 2: Income Certificate Upload */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                        DOC
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-200">
                          Annual Income Certificate
                        </div>
                        <div className="text-xs text-slate-400">
                          {formState.incomeCertificateUploaded
                            ? 'income_cert_2026.pdf • Verified'
                            : 'Upload required for quota and scholarship verification'}
                        </div>
                      </div>
                    </div>

                    <div>
                      {formState.incomeCertificateUploaded ? (
                        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium">
                          ✓ Uploaded & Scanned
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleFieldChange('incomeCertificateUploaded', true)}
                          className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
                        >
                          + Upload Certificate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleReviewClick}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
                >
                  <span>Proceed to Review Sheet</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Right 4 Cols: Sanchay AI Proving Ground */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sticky top-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                    AI Conversational Engine
                  </h3>
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Test bidirectional state synchronization. Trigger natural language instructions to inspect how AI reasons over the shared application state.
                </p>

                {/* Quick Action Triggers */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleQuickCommand('Fill everything you already know')}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between group"
                  >
                    <span>💬 "Fill everything you already know"</span>
                    <span className="text-slate-500 group-hover:text-blue-400">→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickCommand('Set my preferred city to Noida')}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between group"
                  >
                    <span>💬 "Set my preferred city to Noida"</span>
                    <span className="text-slate-500 group-hover:text-blue-400">→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickCommand('Find my 12th marksheet')}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between group"
                  >
                    <span>💬 "Find my 12th marksheet"</span>
                    <span className="text-slate-500 group-hover:text-blue-400">→</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickCommand('Review my application')}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between group"
                  >
                    <span>💬 "Review my application"</span>
                    <span className="text-slate-500 group-hover:text-blue-400">→</span>
                  </button>
                </div>

                {/* State Inspection Card */}
                <div className="mt-6 pt-5 border-t border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Current Shared State
                  </h4>
                  <div className="p-3 rounded-lg bg-slate-950 font-mono text-[11px] space-y-1 text-slate-300 border border-slate-800/80">
                    <div>City: <span className="text-blue-400">{formState.preferredCity || 'MISSING'}</span></div>
                    <div>Course: <span className="text-emerald-400">{formState.preferredCourse}</span></div>
                    <div>Docs: <span className="text-purple-400">{formState.twelfthMarksheetAttached ? 'ATTACHED' : 'UNSET'}</span></div>
                    <div>Auth User: <span className="text-amber-400">{user?.id || 'citizen_parv'}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Structured Review Sheet */}
        {activeTab === 'review' && (
          <div className="max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-8 space-y-8">
            <div className="border-b border-slate-800 pb-5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                UNIVERSAL FORM REVIEW SHEET
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Transparent verification of profile-locked, user-provided, and document-backed fields before submission.
              </p>
            </div>

            {/* Profile Data Group */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                1. Sanchay Profile Data (Verified Sovereign)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div><span className="text-slate-500">Full Name:</span> <span className="font-semibold text-slate-200">{formState.fullName || 'Parv Garg'}</span></div>
                <div><span className="text-slate-500">DOB:</span> <span className="font-semibold text-slate-200">{formState.dateOfBirth || '2006-08-15'}</span></div>
                <div><span className="text-slate-500">Gender:</span> <span className="font-semibold text-slate-200">{formState.gender || 'Female'}</span></div>
                <div><span className="text-slate-500">Category:</span> <span className="font-semibold text-slate-200">{formState.category || 'OBC_NCL'}</span></div>
              </div>
            </div>

            {/* Application Data Group */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                2. Application Preferences (User Provided)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div><span className="text-slate-500">Preferred City:</span> <span className="font-semibold text-blue-400">{formState.preferredCity || 'Noida'}</span></div>
                <div><span className="text-slate-500">Preferred Course:</span> <span className="font-semibold text-blue-400">{formState.preferredCourse}</span></div>
                <div><span className="text-slate-500">Target Institution:</span> <span className="font-semibold text-blue-400">{formState.preferredInstitution || 'IIT Delhi'}</span></div>
                <div><span className="text-slate-500">Emergency Contact:</span> <span className="font-semibold text-blue-400">{formState.emergencyContact || '+91 98765 43210'}</span></div>
              </div>
            </div>

            {/* Documents Group */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                3. Document Verification Status
              </h3>
              <div className="space-y-2 text-sm bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Class 12 Marksheet</span>
                  <span className="text-emerald-400 font-semibold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ✓ Verified from Vault
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Income Certificate</span>
                  <span className="text-emerald-400 font-semibold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    ✓ Uploaded & Attached
                  </span>
                </div>
              </div>
            </div>

            {/* Confirmation CTA */}
            <div className="pt-4 flex justify-between items-center border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('form')}
                className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                ← Back to Edit
              </button>

              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                <span>Confirm & Submit Test Application</span>
                <span>✓</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Submitted Confirmation Screen */}
        {activeTab === 'submitted' && submissionResult && (
          <div className="max-w-2xl mx-auto bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-6">
            <div className="h-16 w-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 text-2xl font-bold">
              ✓
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                TEST APPLICATION SUBMITTED
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Universal Form Engine successfully generated mock submission with full security confirmation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-center space-y-2">
              <div className="text-xs text-slate-400 uppercase tracking-wider">
                Synthetic Reference Code
              </div>
              <div className="text-2xl font-bold text-emerald-400 tracking-wider">
                {submissionResult.referenceCode}
              </div>
              <div className="text-xs text-slate-500 pt-1">
                Timestamp: {submissionResult.timestamp}
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmissionResult(null);
                  setActiveTab('form');
                }}
                className="px-5 py-2.5 text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors"
              >
                Run Another Test Form
              </button>
              <Link
                href="/services/jee-main"
                className="px-5 py-2.5 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/30 transition-colors"
              >
                View Real JEE Main Service →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Explicit Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                !
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Confirm Mock Submission
                </h3>
                <p className="text-xs text-slate-400">
                  Explicit citizen consent gate
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              You are about to execute a test submission in the Universal Form Playground. No real government authority will be contacted.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
              >
                Review Again
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-600/30 transition-colors"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
