'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import { useAI } from '../../../../context/AIContext';

// ==========================================
// Wizard Steps Definition
// ==========================================
const STEPS = [
  { id: 'personal', title: '1. Personal Details', isProfile: true },
  { id: 'contact', title: '2. Contact Details', isProfile: true },
  { id: 'academic', title: '3. Academic Qualifications', isProfile: true },
  { id: 'exam', title: '4. Examination Options', isProfile: false },
  { id: 'centres', title: '5. Centre Preferences', isProfile: false },
  { id: 'documents', title: '6. Documents Proofs', isProfile: false },
  { id: 'review', title: '7. Citizen Review', isProfile: false },
  { id: 'confirmation', title: '8. Confirmation', isProfile: false },
];

export default function JeeMainApplyPage() {
  const { user, profile } = useAuth();
  const { setAIContext } = useAI();

  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    referenceNumber: string;
    submittedAt: string;
  } | null>(null);

  // Application-Specific Choices (Genuinely non-profile examination preferences)
  const [appSpecificChoices, setAppSpecificChoices] = useState({
    applyFor: 'Paper 1 (B.E./B.Tech.)',
    sessionChoice: 'Session 1 (January 2026)',
    questionPaperMedium: 'English',
    centreChoice1State: 'Delhi (NCT)',
    centreChoice1City: 'New Delhi',
    centreChoice2State: 'Uttar Pradesh',
    centreChoice2City: 'Noida',
    centreChoice3State: 'Haryana',
    centreChoice3City: 'Gurugram',
    centreChoice4State: 'Haryana',
    centreChoice4City: 'Faridabad',
    photoUploaded: true,
    signatureUploaded: true,
    categoryDocUploaded: true,
    citizenDeclaration: false,
  });

  useEffect(() => {
    setAIContext({
      department: 'Education',
      organization: 'National Testing Agency (NTA)',
      service: 'JEE (Main) 2026',
      section: 'apply',
      workflow: `Step ${activeStep + 1}: ${STEPS[activeStep].title}`,
      route: '/services/jee-main/apply',
    });
  }, [activeStep, setAIContext]);

  // Derived citizen values from Sanchay Profile (Single Source of Truth)
  const citizenData = {
    fullName: profile?.fullName || '',
    dateOfBirth: profile?.dateOfBirth || '',
    gender: profile?.gender || '',
    category: profile?.category
      ? profile.category === 'GENERAL'
        ? 'General / Unreserved'
        : profile.category === 'EWS'
        ? 'EWS'
        : profile.category === 'OBC_NCL'
        ? 'OBC-NCL'
        : profile.category === 'SC'
        ? 'SC'
        : profile.category === 'ST'
        ? 'ST'
        : profile.category
      : null,
    fatherName: 'Rajesh Mittal',
    motherName: 'Sunita Mittal',
    nationality: 'Indian',
    pwdStatus: 'No',
    mobile: '+91 98765 43210',
    email: 'parv.mittal@example.gov.in',
    permanentAddress: 'House 42, Civil Lines, Sector 14, Near District Court',
    city: 'New Delhi',
    state: 'Delhi (NCT)',
    pincode: '110001',
    tenthPassingYear: '2023',
    tenthBoard: 'Central Board of Secondary Education (CBSE)',
    tenthPercentage: '94.6%',
    twelfthStatus: 'Passed',
    twelfthPassingYear: '2025',
    twelfthBoard: 'Central Board of Secondary Education (CBSE)',
    twelfthSubjects: 'Physics, Mathematics, Chemistry, English, Computer Science',
  };

  const handleChoiceChange = (field: string, value: any) => {
    setAppSpecificChoices((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSandboxSubmit = async () => {
    if (!appSpecificChoices.citizenDeclaration) {
      alert('Please check the citizen declaration before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const referenceNumber = `SANDBOX-JEE-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const submittedAt = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'medium',
      });

      setSubmissionResult({
        referenceNumber,
        submittedAt,
      });
      setActiveStep(STEPS.length - 1);
    } catch (err: any) {
      alert(err.message || 'Sandbox submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-6 font-sans">
      {/* Breadcrumb Hierarchy */}
      <nav className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
        <Link href="/" className="hover:text-slate-950 text-slate-700">Home</Link>
        <span>/</span>
        <Link href="/departments" className="hover:text-slate-950 text-slate-700">Education</Link>
        <span>/</span>
        <Link href="/services/jee-main" className="hover:text-slate-950 text-slate-700">JEE (Main) 2026</Link>
        <span>/</span>
        <span className="font-extrabold text-slate-950">Application Sandbox</span>
      </nav>

      {/* Sandbox Identification & Single Source of Truth Banner */}
      <div
        className="bg-slate-900 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-700 relative overflow-hidden"
        style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-xs"
                style={{ backgroundColor: '#fbbf24', color: '#020617' }}
              >
                JEE Main 2026 — Application Sandbox
              </span>
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border"
                style={{ backgroundColor: 'rgba(6, 78, 59, 0.8)', borderColor: 'rgba(52, 211, 153, 0.4)', color: '#6ee7b7' }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Simulation Environment</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              National Testing Agency (NTA) — JEE (Main) Registration
            </h1>
            <p className="text-xs text-slate-200 leading-relaxed max-w-2xl font-medium">
              Sanchay Profile is the single source of truth for citizen identity. All personal and academic data is read-only in this application.
            </p>
          </div>

          <div
            className="text-right shrink-0 px-4 py-2.5 rounded-2xl border"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <span className="text-[10px] text-amber-300 uppercase font-black block">Single Source of Truth</span>
            <span className="text-xs font-bold text-white">✓ Sanchay Profile Connected</span>
          </div>
        </div>
      </div>

      {/* Progress Stepper Wizard */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between min-w-max gap-2">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < activeStep || submissionResult !== null;
            const isCurrent = idx === activeStep && submissionResult === null;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (submissionResult === null && idx <= activeStep) {
                      setActiveStep(idx);
                    }
                  }}
                  disabled={submissionResult !== null || idx > activeStep}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : isCompleted
                      ? 'bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 cursor-pointer'
                      : 'text-slate-400 font-medium cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-950'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span className="text-xs">{step.title}</span>
                </button>

                {idx < STEPS.length - 1 && (
                  <div className="w-4 h-0.5 bg-slate-200 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ========================================== */}
      {/* STEP 0: PERSONAL DETAILS (READ ONLY FROM PROFILE) */}
      {/* ========================================== */}
      {activeStep === 0 && !submissionResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-base font-black text-slate-950">1. Personal Information</h2>
              <p className="text-xs text-slate-500">Candidate identification as verified in your Sanchay sovereign profile</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span>✓</span> Read-Only from Sanchay Profile
              </span>
              <Link
                href="/profile"
                className="text-xs font-bold text-slate-800 hover:text-slate-950 underline px-2 py-1 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Open My Profile ↗
              </Link>
            </div>
          </div>

          {/* Profile Notice Banner */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-950">
            <div className="flex items-center gap-2.5">
              <span className="text-base">ℹ️</span>
              <p className="font-medium">
                Personal identity data cannot be directly edited in application forms. To update your name, DOB, or category, update your <strong>Sanchay Profile</strong>.
              </p>
            </div>
            <Link
              href="/profile"
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs shrink-0"
            >
              Edit in Profile
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-xs font-bold text-slate-500 mb-1">Full Legal Name</span>
              <span className="text-sm font-black text-slate-900">{citizenData.fullName}</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1.5">
                ✓ Verified from Sanchay Profile
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-xs font-bold text-slate-500 mb-1">Date of Birth</span>
              <span className="text-sm font-black text-slate-900">{citizenData.dateOfBirth}</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1.5">
                ✓ Verified from Sanchay Profile
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-xs font-bold text-slate-500 mb-1">Gender</span>
              <span className="text-sm font-black text-slate-900">{citizenData.gender}</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1.5">
                ✓ Verified from Sanchay Profile
              </span>
            </div>

            {citizenData.category ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="block text-xs font-bold text-slate-500 mb-1">Category</span>
                <span className="text-sm font-black text-slate-900">{citizenData.category}</span>
                <span className="text-[10px] text-emerald-700 font-bold block mt-1.5">
                  ✓ From Sanchay Profile
                </span>
              </div>
            ) : (
              <div className="p-4 bg-amber-50/50 border border-amber-300 rounded-2xl">
                <span className="block text-xs font-bold text-slate-500 mb-1">Category</span>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="text-xs font-bold text-amber-800">
                    ⚠ Missing from Sanchay Profile
                  </span>
                  <Link
                    href="/profile"
                    className="text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-1 rounded-lg shrink-0"
                  >
                    Complete Profile ↗
                  </Link>
                </div>
              </div>
            )}

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-xs font-bold text-slate-500 mb-1">Father&apos;s / Guardian&apos;s Name</span>
              <span className="text-sm font-black text-slate-900">{citizenData.fatherName}</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1.5">
                ✓ Sourced from Sanchay Profile
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-xs font-bold text-slate-500 mb-1">Mother&apos;s Name</span>
              <span className="text-sm font-black text-slate-900">{citizenData.motherName}</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1.5">
                ✓ Sourced from Sanchay Profile
              </span>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Continue to Contact Details →
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEP 1: CONTACT DETAILS (READ ONLY FROM PROFILE) */}
      {/* ========================================== */}
      {activeStep === 1 && !submissionResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-base font-black text-slate-950">2. Contact &amp; Address Details</h2>
              <p className="text-xs text-slate-500">Official communication address and verified OTP contacts from your Sanchay Profile</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span>✓</span> Verified Contact Methods
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-xs font-bold text-slate-500 mb-1">Mobile Number (SMS Alerts)</span>
              <span className="text-sm font-black text-slate-900">{citizenData.mobile}</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1.5">
                ✓ Verified via Sanchay Mobile OTP
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-xs font-bold text-slate-500 mb-1">Email Address</span>
              <span className="text-sm font-black text-slate-900">{citizenData.email}</span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1.5">
                ✓ Verified via Sanchay Identity
              </span>
            </div>

            <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="block text-xs font-bold text-slate-500 mb-1">Permanent Residential Address</span>
              <span className="text-sm font-bold text-slate-900 block">{citizenData.permanentAddress}</span>
              <span className="text-xs font-semibold text-slate-700 block mt-1">
                {citizenData.city}, {citizenData.state} — {citizenData.pincode}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block mt-2">
                ✓ Verified from Sanchay Address Registry
              </span>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              ← Back to Personal Details
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Continue to Academic Details →
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEP 2: ACADEMIC DETAILS (READ ONLY FROM PROFILE) */}
      {/* ========================================== */}
      {activeStep === 2 && !submissionResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-base font-black text-slate-950">3. Academic Qualifications</h2>
              <p className="text-xs text-slate-500">Qualifying examination records verified from your sovereign educational profile</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span>✓</span> Verified Academic Profile
              </span>
              <Link
                href="/profile"
                className="text-xs font-bold text-slate-800 hover:text-slate-950 underline px-2 py-1 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Update in Profile ↗
              </Link>
            </div>
          </div>

          {/* Academic Info Banner */}
          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-blue-950">
            <div className="flex items-center gap-2.5">
              <span className="text-base">🎓</span>
              <p className="font-medium">
                Academic qualifications are managed in your Sanchay Profile. If your Class 12 passing year or subjects need correction, update your profile.
              </p>
            </div>
            <Link
              href="/profile"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shrink-0"
            >
              Edit in Profile
            </Link>
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-wide text-slate-800">Class 10 or Equivalent</h3>
                <span className="text-[10px] text-emerald-700 font-bold">✓ Verified</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Board</span>
                  <span className="font-bold text-slate-900">{citizenData.tenthBoard}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Passing Year</span>
                  <span className="font-bold text-slate-900">{citizenData.tenthPassingYear}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Percentage / CGPA</span>
                  <span className="font-bold text-slate-900">{citizenData.tenthPercentage}</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-wide text-slate-800">Class 12 or Qualifying Exam</h3>
                <span className="text-[10px] text-emerald-700 font-bold">✓ Verified PCM Eligibility</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Status</span>
                  <span className="font-bold text-slate-900">{citizenData.twelfthStatus}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Passing Year</span>
                  <span className="font-bold text-slate-900">{citizenData.twelfthPassingYear}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Board</span>
                  <span className="font-bold text-slate-900">{citizenData.twelfthBoard}</span>
                </div>
                <div className="sm:col-span-3">
                  <span className="text-slate-500 block">Subjects Studied</span>
                  <span className="font-bold text-slate-900">{citizenData.twelfthSubjects}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              ← Back to Contact Details
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Continue to Examination Options →
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEP 3: EXAMINATION OPTIONS (APPLICATION SPECIFIC) */}
      {/* ========================================== */}
      {activeStep === 3 && !submissionResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-950">4. Examination Details</h2>
              <p className="text-xs text-slate-500">Select Paper, Session, and Question Paper Medium for JEE Main 2026</p>
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full">
              Application-Specific Choices
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Applying For Paper <span className="text-red-500">*</span>
              </label>
              <select
                value={appSpecificChoices.applyFor}
                onChange={(e) => handleChoiceChange('applyFor', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="Paper 1 (B.E./B.Tech.)">Paper 1 (B.E./B.Tech.)</option>
                <option value="Paper 2A (B.Arch.)">Paper 2A (B.Arch.)</option>
                <option value="Paper 2B (B.Planning)">Paper 2B (B.Planning)</option>
                <option value="Paper 1 & Paper 2A (Both)">Both Paper 1 &amp; Paper 2A</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Session Choice <span className="text-red-500">*</span>
              </label>
              <select
                value={appSpecificChoices.sessionChoice}
                onChange={(e) => handleChoiceChange('sessionChoice', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="Session 1 (January 2026)">Session 1 (January 2026)</option>
                <option value="Session 2 (April 2026)">Session 2 (April 2026)</option>
                <option value="Both Sessions (Session 1 & Session 2)">Both Sessions (Session 1 &amp; Session 2)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Question Paper Medium <span className="text-red-500">*</span>
              </label>
              <select
                value={appSpecificChoices.questionPaperMedium}
                onChange={(e) => handleChoiceChange('questionPaperMedium', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Assamese">Assamese</option>
                <option value="Bengali">Bengali</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Kannada">Kannada</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Marathi">Marathi</option>
                <option value="Odia">Odia</option>
                <option value="Punjabi">Punjabi</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Urdu">Urdu</option>
              </select>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              ← Back to Academic Details
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Continue to Centre Preferences →
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEP 4: CENTRE PREFERENCES */}
      {/* ========================================== */}
      {activeStep === 4 && !submissionResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-950">5. Examination Centre Preferences</h2>
              <p className="text-xs text-slate-500">Provide 4 preferred test cities in order of priority</p>
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full">
              4 Preferences
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Choice 1: State</label>
                <select
                  value={appSpecificChoices.centreChoice1State}
                  onChange={(e) => handleChoiceChange('centreChoice1State', e.target.value)}
                  className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Delhi (NCT)">Delhi (NCT)</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Choice 1: City</label>
                <select
                  value={appSpecificChoices.centreChoice1City}
                  onChange={(e) => handleChoiceChange('centreChoice1City', e.target.value)}
                  className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="New Delhi">New Delhi</option>
                  <option value="Delhi East">Delhi East</option>
                  <option value="Delhi West">Delhi West</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Choice 2: State</label>
                <select
                  value={appSpecificChoices.centreChoice2State}
                  onChange={(e) => handleChoiceChange('centreChoice2State', e.target.value)}
                  className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Delhi (NCT)">Delhi (NCT)</option>
                  <option value="Haryana">Haryana</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Choice 2: City</label>
                <select
                  value={appSpecificChoices.centreChoice2City}
                  onChange={(e) => handleChoiceChange('centreChoice2City', e.target.value)}
                  className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Noida">Noida</option>
                  <option value="Ghaziabad">Ghaziabad</option>
                  <option value="Meerut">Meerut</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              ← Back to Examination Options
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Continue to Document Proofs →
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEP 5: DOCUMENT PROOFS */}
      {/* ========================================== */}
      {activeStep === 5 && !submissionResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-950">6. Documents &amp; Identity Proofs</h2>
              <p className="text-xs text-slate-500">Candidate Photograph, Signature, and Identity Proof verification</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full">
              Verified from Sovereign Vault
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  📷
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Recent Passport Size Photograph</h4>
                  <p className="text-[11px] text-slate-500">White background, 80% face coverage without mask</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                ✓ Ready in Sanchay Vault
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  ✍️
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Candidate Signature</h4>
                  <p className="text-[11px] text-slate-500">Black ink pen on white paper</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                ✓ Ready in Sanchay Vault
              </span>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              ← Back to Centres
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Continue to Comprehensive Review →
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEP 6: CITIZEN REVIEW SHEET (READ ONLY SUMMARY) */}
      {/* ========================================== */}
      {activeStep === 6 && !submissionResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-base font-black text-slate-950">7. Citizen Review Sheet (Read-Only)</h2>
              <p className="text-xs text-slate-500">Verify all application values and provenance before final confirmation</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full">
                ✓ Verified Provenance Summary
              </span>
              <Link
                href="/profile"
                className="text-xs font-bold text-slate-800 hover:text-slate-950 underline px-2 py-1 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Open My Profile ↗
              </Link>
            </div>
          </div>

          {/* Sanchay Notice */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
            <p className="font-bold text-slate-900">Need to update personal or academic data?</p>
            <p className="text-slate-600">
              Personal and academic details are read directly from your <strong>Sanchay Profile</strong>. To change any value, update your profile. The application will immediately reflect your updated profile values.
            </p>
          </div>

          {/* Section 1 Review */}
          <div className="p-5 border border-slate-200 rounded-2xl space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2">
              1. Personal &amp; Identification Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Full Name</span>
                <span className="font-bold text-slate-900">{citizenData.fullName}</span>
                <span className="text-[10px] text-emerald-700 block">✓ Sanchay Profile</span>
              </div>
              <div>
                <span className="text-slate-500 block">Date of Birth</span>
                <span className="font-bold text-slate-900">{citizenData.dateOfBirth}</span>
                <span className="text-[10px] text-emerald-700 block">✓ Sanchay Profile</span>
              </div>
              <div>
                <span className="text-slate-500 block">Gender</span>
                <span className="font-bold text-slate-900">{citizenData.gender}</span>
                <span className="text-[10px] text-emerald-700 block">✓ Sanchay Profile</span>
              </div>
              <div>
                <span className="text-slate-500 block">Category</span>
                {citizenData.category ? (
                  <>
                    <span className="font-bold text-slate-900">{citizenData.category}</span>
                    <span className="text-[10px] text-emerald-700 block">✓ Sanchay Profile</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-amber-800">⚠ Missing from Sanchay Profile</span>
                    <Link href="/profile" className="text-[10px] text-amber-700 underline block font-bold">
                      Complete Profile ↗
                    </Link>
                  </>
                )}
              </div>
              <div>
                <span className="text-slate-500 block">Father&apos;s Name</span>
                <span className="font-bold text-slate-900">{citizenData.fatherName}</span>
                <span className="text-[10px] text-emerald-700 block">✓ Sanchay Profile</span>
              </div>
              <div>
                <span className="text-slate-500 block">Mother&apos;s Name</span>
                <span className="font-bold text-slate-900">{citizenData.motherName}</span>
                <span className="text-[10px] text-emerald-700 block">✓ Sanchay Profile</span>
              </div>
            </div>
          </div>

          {/* Section 2 Review */}
          <div className="p-5 border border-slate-200 rounded-2xl space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2">
              2. Academic Qualifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Class 12 Passing Year</span>
                <span className="font-bold text-slate-900">{citizenData.twelfthPassingYear}</span>
                <span className="text-[10px] text-emerald-700 block">✓ Sanchay Profile</span>
              </div>
              <div>
                <span className="text-slate-500 block">Class 12 Status</span>
                <span className="font-bold text-slate-900">{citizenData.twelfthStatus}</span>
                <span className="text-[10px] text-emerald-700 block">✓ Sanchay Profile</span>
              </div>
              <div>
                <span className="text-slate-500 block">Subjects</span>
                <span className="font-bold text-slate-900">{citizenData.twelfthSubjects}</span>
                <span className="text-[10px] text-emerald-700 block">✓ Sanchay Profile</span>
              </div>
            </div>
          </div>

          {/* Section 3 Review */}
          <div className="p-5 border border-slate-200 rounded-2xl space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-900 border-b border-slate-100 pb-2">
              3. Examination &amp; Centre Choices
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Paper Selected</span>
                <span className="font-bold text-slate-900">{appSpecificChoices.applyFor}</span>
                <span className="text-[10px] text-amber-700 block">User Selection</span>
              </div>
              <div>
                <span className="text-slate-500 block">Session Choice</span>
                <span className="font-bold text-slate-900">{appSpecificChoices.sessionChoice}</span>
                <span className="text-[10px] text-amber-700 block">User Selection</span>
              </div>
              <div>
                <span className="text-slate-500 block">Medium</span>
                <span className="font-bold text-slate-900">{appSpecificChoices.questionPaperMedium}</span>
                <span className="text-[10px] text-amber-700 block">User Selection</span>
              </div>
              <div className="sm:col-span-3">
                <span className="text-slate-500 block">Primary Test Centre Preference</span>
                <span className="font-bold text-slate-900">{appSpecificChoices.centreChoice1City}, {appSpecificChoices.centreChoice1State}</span>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              ← Back to Documents
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Proceed to Consequential Confirmation →
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEP 7: CONSEQUENTIAL CONFIRMATION & SANDBOX SUBMIT */}
      {/* ========================================== */}
      {activeStep === 7 && !submissionResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-950">8. Statutory Declaration &amp; Submission</h2>
              <p className="text-xs text-slate-500">Consequential citizen confirmation required before sandbox submission</p>
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full">
              Final Confirmation
            </span>
          </div>

          <div className="p-5 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="declaration"
                checked={appSpecificChoices.citizenDeclaration}
                onChange={(e) => handleChoiceChange('citizenDeclaration', e.target.checked)}
                className="mt-1 w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-slate-900 cursor-pointer"
              />
              <label htmlFor="declaration" className="text-xs text-slate-900 leading-relaxed font-medium cursor-pointer">
                <strong>Statutory Candidate Declaration:</strong> I hereby declare that all particulars given in this application have been verified by me from my Sanchay sovereign profile. I understand that this is a simulated sandbox submission for demonstration purposes and adheres to all NTA information bulletin guidelines.
              </label>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors"
            >
              ← Back to Review Sheet
            </button>
            <button
              type="button"
              onClick={handleSandboxSubmit}
              disabled={!appSpecificChoices.citizenDeclaration || isSubmitting}
              className="px-7 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-sm font-black rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Submitting to Sandbox...' : 'Confirm & Submit Application →'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* SUBMISSION SUCCESSFUL RESULT */}
      {/* ========================================== */}
      {submissionResult && (
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl space-y-6 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto">
            ✓
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Sandbox Submission Successful
            </span>
            <h2 className="text-2xl font-black text-slate-900">
              JEE Main 2026 Application Registered
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your application has been received and processed by the Sanchay NTA sandbox adapter using your verified sovereign profile.
            </p>
          </div>

          <div className="max-w-md mx-auto p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Application Number:</span>
              <code className="font-mono font-black text-slate-950 bg-white px-2.5 py-1 rounded border border-slate-200">
                {submissionResult.referenceNumber}
              </code>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Submission Timestamp:</span>
              <span className="font-semibold text-slate-800">{submissionResult.submittedAt}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-emerald-700">SUBMITTED (SANDBOX)</span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/services/jee-main"
              className="px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
            >
              Return to JEE Main Portal
            </Link>
            <Link
              href="/profile"
              className="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl transition-colors"
            >
              View in My Profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
