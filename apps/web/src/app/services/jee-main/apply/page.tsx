'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import { useAI } from '../../../../context/AIContext';
import { apiRequest } from '../../../../lib/api-client';

// Field provenance enum
type ProvenanceType = 'VERIFIED_PROFILE' | 'USER_PROVIDED' | 'NEEDS_CONFIRMATION' | 'MISSING';

interface FieldMeta {
  key: string;
  label: string;
  value: string;
  provenance: ProvenanceType;
  required: boolean;
}

const STEPS = [
  { id: 'personal', title: 'Personal Details', icon: '👤' },
  { id: 'contact', title: 'Contact & Address', icon: '📍' },
  { id: 'academic', title: 'Academic Details', icon: '🎓' },
  { id: 'exam', title: 'Examination Paper', icon: '📝' },
  { id: 'centres', title: 'Centre Preferences', icon: '🏛️' },
  { id: 'documents', title: 'Documents & Upload', icon: '📂' },
  { id: 'review', title: 'Review & Verify', icon: '🔍' },
  { id: 'confirmation', title: 'Confirmation & Submit', icon: '🛡️' },
];

export default function JeeMainApplyPage() {
  const router = useRouter();
  const { user, profile, isAuthenticated, openLogin } = useAuth();
  const { setAIContext } = useAI();

  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    referenceNumber: string;
    submittedAt: string;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    fullName: '',
    dateOfBirth: '',
    gender: '',
    category: 'General',
    fatherName: 'Sunil Mittal',
    motherName: 'Anita Mittal',
    nationality: 'Indian',
    isPwd: 'No',

    // Step 2: Contact
    mobile: '',
    email: '',
    permanentAddress: '',
    state: '',
    district: '',
    pincode: '',

    // Step 3: Academic
    tenthBoard: 'Central Board of Secondary Education (CBSE)',
    tenthPassingYear: '2023',
    tenthPercentage: '94.2%',
    twelfthStatus: 'Passed',
    twelfthPassingYear: '2025',
    twelfthBoard: 'Central Board of Secondary Education (CBSE)',
    twelfthPhysics: true,
    twelfthMaths: true,
    twelfthChemistry: true,
    twelfthOptional: 'Computer Science',

    // Step 4: Exam
    paperApplied: 'Paper 1 (B.E./B.Tech.)',
    sessionChoice: 'Session 1 (January 2026)',
    questionPaperMedium: 'English',

    // Step 5: Centres
    stateChoice1: 'Delhi',
    cityChoice1: 'New Delhi / Central Delhi',
    stateChoice2: 'Uttar Pradesh',
    cityChoice2: 'Noida / Greater Noida',
    stateChoice3: 'Haryana',
    cityChoice3: 'Gurugram',
    stateChoice4: 'Haryana',
    cityChoice4: 'Faridabad',

    // Step 6: Documents
    photoUploaded: true,
    signatureUploaded: true,
    tenthCertUploaded: true,
    categoryCertUploaded: false,
  });

  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Prefill from verified Sanchay citizen profile
  useEffect(() => {
    const name = profile?.fullName || user?.id ? 'Parv Mittal' : 'Rahul Sharma';
    const dob = profile?.dateOfBirth ? String(profile.dateOfBirth).split('T')[0] : '2007-06-15';
    const gender = profile?.gender || 'Male';

    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || name,
      dateOfBirth: prev.dateOfBirth || dob,
      gender: prev.gender || gender,
      mobile: prev.mobile || '+91 98765 43210',
      email: prev.email || 'parv.mittal@example.gov.in',
      permanentAddress: prev.permanentAddress || 'Flat 402, Block B, Vikas Kunj, Sector 62',
      state: prev.state || 'Delhi',
      district: prev.district || 'New Delhi',
      pincode: prev.pincode || '110001',
    }));
  }, [user, profile]);

  // Set AI context for the active step
  useEffect(() => {
    setAIContext({
      department: 'Education',
      organization: 'NTA',
      service: 'JEE Main',
      section: `Apply Sandbox — ${STEPS[activeStep]?.title}`,
      workflow: 'application_filling',
      route: '/services/jee-main/apply',
    });
  }, [activeStep, setAIContext]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep(activeStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSandboxSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate submission to statutory NTA Sandbox Adapter
      await new Promise((r) => setTimeout(r, 900));

      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const referenceNumber = `SANDBOX-JEE-2026-${randomSuffix}`;
      const submittedAt = new Date().toISOString();

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
      <nav className="flex items-center gap-2 text-xs text-slate-600 font-medium">
        <Link href="/" className="hover:text-sanchay-navy-800 text-slate-700">Home</Link>
        <span>/</span>
        <Link href="/departments" className="hover:text-sanchay-navy-800 text-slate-700">Education</Link>
        <span>/</span>
        <Link href="/services/jee-main" className="hover:text-sanchay-navy-800 text-slate-700">JEE (Main) 2026</Link>
        <span>/</span>
        <span className="font-bold text-sanchay-navy-950">Application Sandbox</span>
      </nav>

      {/* Sandbox Identification Banner */}
      <div
        className="bg-slate-900 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-700 relative overflow-hidden"
        style={{ backgroundColor: '#0f172a', color: '#ffffff' }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-950 bg-amber-400 px-2.5 py-0.5 rounded-md shadow-xs">
                JEE Main 2026 — Application Sandbox
              </span>
              <span className="text-xs bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Simulation Environment</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              National Testing Agency (NTA) — JEE (Main) Registration
            </h1>
            <p className="text-xs text-slate-200 leading-relaxed max-w-2xl font-normal">
              Experience Sanchay’s zero-friction application workflow. Verified citizen credentials from your sovereign profile pre-fill the official schema deterministically.
            </p>
          </div>

          <div className="text-right shrink-0 bg-white/10 px-3.5 py-2 rounded-2xl border border-white/15">
            <span className="text-[10px] text-amber-300 uppercase font-black block">Profile Mapping</span>
            <span className="text-xs font-bold text-white">18 Verified Fields</span>
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
                      ? 'bg-sanchay-navy-900 text-white shadow-xs font-bold'
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
      {/* STEP 0: PERSONAL DETAILS */}
      {/* ========================================== */}
      {activeStep === 0 && !submissionResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-sanchay-navy-950">1. Personal Information</h2>
              <p className="text-xs text-slate-500">Candidate identification as per Class 10 certificate</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span>🛡️</span> Verified from Sanchay Profile
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Candidate Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
              />
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                ✓ Verified from Sanchay Sovereign Profile
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Date of Birth (YYYY-MM-DD) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
              />
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                ✓ Verified from Sanchay Sovereign Profile
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Third Gender">Third Gender</option>
              </select>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                ✓ Verified from Sanchay Sovereign Profile
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Category (GEN / EWS / OBC / SC / ST) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
              >
                <option value="General">General (Unreserved)</option>
                <option value="General-EWS">General-EWS (Economically Weaker Section)</option>
                <option value="OBC-NCL">OBC-NCL (Other Backward Class - Non Creamy Layer)</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="ST">Scheduled Tribe (ST)</option>
              </select>
              <span className="text-[10px] text-amber-600 font-semibold mt-1 block">
                ⚠ Please confirm category matching Central List
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Father&apos;s / Guardian&apos;s Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => handleChange('fatherName', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Mother&apos;s Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.motherName}
                onChange={(e) => handleChange('motherName', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
              />
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-sanchay-navy-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save & Continue to Contact Details →
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEP 1: CONTACT & RESIDENTIAL */}
      {/* ========================================== */}
      {activeStep === 1 && !submissionResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-sanchay-navy-950">2. Contact & Address Details</h2>
              <p className="text-xs text-slate-500">Official communication address and verified OTP contacts</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span>🛡️</span> Verified Contact Methods
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Mobile Number (SMS Alerts) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
              />
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                ✓ Verified via Sanchay OTP
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
              />
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                ✓ Verified via Sanchay Login
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Permanent Residential Address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={formData.permanentAddress}
                onChange={(e) => handleChange('permanentAddress', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
              />
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                ✓ Verified from Sanchay Address Registry
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                State / UT <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
              />
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-sanchay-navy-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save & Continue to Academic Details →
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEP 2: ACADEMIC DETAILS */}
      {/* ========================================== */}
      {activeStep === 2 && !submissionResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-sanchay-navy-950">3. Academic Details (Class 10 & Class 12)</h2>
              <p className="text-xs text-slate-500">Qualifying examination credentials for JEE Main 2026 eligibility</p>
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              Eligibility Rule: Pass in 2024, 2025, or Appearing in 2026
            </span>
          </div>

          {/* Class 10 Section */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-black uppercase text-sanchay-navy-900 tracking-wider">
              Class 10 or Equivalent Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Board Name</label>
                <input
                  type="text"
                  value={formData.tenthBoard}
                  onChange={(e) => handleChange('tenthBoard', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Passing Year</label>
                <input
                  type="text"
                  value={formData.tenthPassingYear}
                  onChange={(e) => handleChange('tenthPassingYear', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Marks Percentage / CGPA</label>
                <input
                  type="text"
                  value={formData.tenthPercentage}
                  onChange={(e) => handleChange('tenthPercentage', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Class 12 Section */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-black uppercase text-sanchay-navy-900 tracking-wider">
              Class 12 / Qualifying Examination Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Qualifying Status</label>
                <select
                  value={formData.twelfthStatus}
                  onChange={(e) => handleChange('twelfthStatus', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                >
                  <option value="Passed">Passed</option>
                  <option value="Appearing">Appearing in 2026</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Year of Passing / Appearing <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.twelfthPassingYear}
                  onChange={(e) => handleChange('twelfthPassingYear', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                >
                  <option value="2026">2026 (Appearing / Passed)</option>
                  <option value="2025">2025 (Passed)</option>
                  <option value="2024">2024 (Passed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">School / Board Name</label>
                <input
                  type="text"
                  value={formData.twelfthBoard}
                  onChange={(e) => handleChange('twelfthBoard', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Subjects Selection */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-800 mb-2">
                Mandatory & Qualifying Subjects in Class 12 (Minimum 5 Subjects):
              </label>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.twelfthPhysics} readOnly className="w-4 h-4 text-emerald-600 rounded" />
                  <span>Physics (Compulsory)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.twelfthMaths} readOnly className="w-4 h-4 text-emerald-600 rounded" />
                  <span>Mathematics (Compulsory)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.twelfthChemistry}
                    onChange={(e) => handleChange('twelfthChemistry', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Chemistry</span>
                </label>
                <span className="text-slate-500 font-normal">
                  + Optional Subject: <strong>{formData.twelfthOptional}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-sanchay-navy-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save & Continue to Exam Paper →
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEP 3: EXAMINATION SELECTION */}
      {/* ========================================== */}
      {activeStep === 3 && !submissionResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-black text-sanchay-navy-950">4. Examination Paper & Session Details</h2>
            <p className="text-xs text-slate-500">Select candidate paper choices, test sessions, and question medium</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Applying For (Paper Choice) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.paperApplied}
                onChange={(e) => handleChange('paperApplied', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
              >
                <option value="Paper 1 (B.E./B.Tech.)">Paper 1 (B.E. / B.Tech.)</option>
                <option value="Paper 2A (B.Arch.)">Paper 2A (B.Arch.)</option>
                <option value="Paper 2B (B.Planning)">Paper 2B (B.Planning)</option>
                <option value="Paper 1 & Paper 2A (B.E./B.Tech & B.Arch)">Paper 1 & Paper 2A (Both)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Session Applying For <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sessionChoice}
                onChange={(e) => handleChange('sessionChoice', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
              >
                <option value="Session 1 (January 2026)">Session 1 (January 2026)</option>
                <option value="Session 2 (April 2026)">Session 2 (April 2026)</option>
                <option value="Both Sessions (Session 1 & Session 2)">Both Sessions (Session 1 & Session 2)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Medium of Question Paper <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.questionPaperMedium}
                onChange={(e) => handleChange('questionPaperMedium', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
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
              onClick={handleBack}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-sanchay-navy-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save & Continue to Centre Choices →
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEP 4: CENTRE PREFERENCES */}
      {/* ========================================== */}
      {activeStep === 4 && !submissionResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-black text-sanchay-navy-950">5. Examination City Preferences</h2>
            <p className="text-xs text-slate-500">Choose 4 preferred examination test cities in order of priority</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Choice 1: State</label>
                <input
                  type="text"
                  value={formData.stateChoice1}
                  onChange={(e) => handleChange('stateChoice1', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Choice 1: City</label>
                <input
                  type="text"
                  value={formData.cityChoice1}
                  onChange={(e) => handleChange('cityChoice1', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Choice 2: State</label>
                <input
                  type="text"
                  value={formData.stateChoice2}
                  onChange={(e) => handleChange('stateChoice2', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Choice 2: City</label>
                <input
                  type="text"
                  value={formData.cityChoice2}
                  onChange={(e) => handleChange('cityChoice2', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-sanchay-navy-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save & Continue to Documents →
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEP 5: DOCUMENTS & UPLOADS */}
      {/* ========================================== */}
      {activeStep === 5 && !submissionResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-black text-sanchay-navy-950">6. Documents & Identity Proofs</h2>
            <p className="text-xs text-slate-500">Candidate photograph, signature, and mandatory eligibility certificates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-900">Candidate Photograph (JPG)</h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ Uploaded (42 KB)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Passport photograph with 80% face coverage and white background.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-900">Candidate Signature (JPG)</h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ Uploaded (18 KB)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Clear signature on white paper with black/blue ink.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-900">Class 10 Certificate / Date of Birth</h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ✓ Sanchay Vault Verified
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Verified sovereign document attached from Sanchay Citizen Vault.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-900">Category Certificate (if applicable)</h3>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Not Applicable (General)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Only required for EWS, OBC-NCL, SC, ST, or PwD candidates.</p>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-sanchay-navy-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save & Proceed to Review Sheet →
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEP 6: CITIZEN REVIEW SHEET */}
      {/* ========================================== */}
      {activeStep === 6 && !submissionResult && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              Pre-Submission Verification
            </span>
            <h2 className="text-xl font-black text-sanchay-navy-950 mt-1">
              Review JEE (Main) 2026 Application Sheet
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review all fields and their verification provenance before providing explicit confirmation.
            </p>
          </div>

          {/* Personal Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-sanchay-navy-900">Personal Details</h3>
              <button
                type="button"
                onClick={() => setActiveStep(0)}
                className="text-xs font-bold text-sanchay-navy-700 hover:underline cursor-pointer"
              >
                Edit Section ✎
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 font-semibold block">Candidate Name</span>
                <span className="font-bold text-slate-900">{formData.fullName}</span>
                <span className="text-[9px] text-emerald-600 block mt-0.5">✓ Verified</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 font-semibold block">Date of Birth</span>
                <span className="font-bold text-slate-900">{formData.dateOfBirth}</span>
                <span className="text-[9px] text-emerald-600 block mt-0.5">✓ Verified</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 font-semibold block">Gender</span>
                <span className="font-bold text-slate-900">{formData.gender}</span>
                <span className="text-[9px] text-emerald-600 block mt-0.5">✓ Verified</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 font-semibold block">Category</span>
                <span className="font-bold text-slate-900">{formData.category}</span>
                <span className="text-[9px] text-amber-600 block mt-0.5">⚠ User Input</span>
              </div>
            </div>
          </div>

          {/* Academic Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-sanchay-navy-900">Academic Eligibility</h3>
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="text-xs font-bold text-sanchay-navy-700 hover:underline cursor-pointer"
              >
                Edit Section ✎
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 font-semibold block">Class 12 Passing Year</span>
                <span className="font-bold text-slate-900">{formData.twelfthPassingYear}</span>
                <span className="text-[9px] text-emerald-600 block mt-0.5">✓ Eligible (2024-2026)</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 font-semibold block">Qualifying Subjects</span>
                <span className="font-bold text-slate-900">Physics, Mathematics, Chemistry</span>
                <span className="text-[9px] text-emerald-600 block mt-0.5">✓ Mandatory Subjects Present</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 font-semibold block">Board Name</span>
                <span className="font-bold text-slate-900">{formData.twelfthBoard}</span>
              </div>
            </div>
          </div>

          {/* Exam & Centre Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-sanchay-navy-900">Exam & Centre Selection</h3>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="text-xs font-bold text-sanchay-navy-700 hover:underline cursor-pointer"
              >
                Edit Section ✎
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 font-semibold block">Paper Applied</span>
                <span className="font-bold text-slate-900">{formData.paperApplied}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 font-semibold block">Session Choice</span>
                <span className="font-bold text-slate-900">{formData.sessionChoice}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 font-semibold block">1st Centre Choice</span>
                <span className="font-bold text-slate-900">{formData.cityChoice1} ({formData.stateChoice1})</span>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-sanchay-navy-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Proceed to Consequential Confirmation →
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEP 7: CONSEQUENTIAL CITIZEN CONFIRMATION */}
      {/* ========================================== */}
      {activeStep === 7 && !submissionResult && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6 animate-in fade-in">
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs text-amber-950 flex items-start gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="font-black">ZERO-TRUST CONSEQUENTIAL SUBMISSION GUARDRAIL</p>
              <p className="text-[11px] text-amber-900 mt-1 leading-relaxed">
                By providing explicit confirmation, you authorize Sanchay to package your verified demographic and academic details and transmit them to the <strong>National Testing Agency (NTA) Sandbox Adapter</strong>. Sanchay AI is barred from submitting on your behalf without this explicit step.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasConfirmed}
              onChange={(e) => setHasConfirmed(e.target.checked)}
              className="w-5 h-5 mt-0.5 text-sanchay-navy-900 rounded border-slate-300 focus:ring-sanchay-navy-500 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-800 leading-relaxed">
              I hereby declare that all particulars stated in this application are true and correct to the best of my knowledge. I authorize submission of this application to the Sanchay JEE Main 2026 Sandbox Environment.
            </span>
          </label>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              ← Back to Review
            </button>

            <button
              type="button"
              disabled={!hasConfirmed || isSubmitting}
              onClick={handleSandboxSubmit}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>{isSubmitting ? 'Transmitting to Sandbox Adapter...' : 'Confirm & Submit to JEE Sandbox ✓'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* STEP 8: SUBMISSION SUCCESS & STATUS */}
      {/* ========================================== */}
      {submissionResult && (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto border border-emerald-200 shadow-inner">
            ✓
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Sandbox Submission Successful
            </span>
            <h2 className="text-2xl font-black text-sanchay-navy-950 mt-3">
              JEE (Main) 2026 Application Registered
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your application package has been processed and accepted by the National Testing Agency (NTA) Sandbox Adapter.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center max-w-md mx-auto">
            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">
              Official Application Reference Number
            </span>
            <code className="text-xl font-mono font-black text-sanchay-navy-950 bg-white px-4 py-2 rounded-xl border border-slate-200 inline-block shadow-xs">
              {submissionResult.referenceNumber}
            </code>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">
              Timestamp: {new Date(submissionResult.submittedAt).toLocaleString()}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left max-w-lg mx-auto flex items-start gap-2.5">
            <span className="text-base">ℹ️</span>
            <div>
              <p className="font-bold">Sandbox Environment Acknowledgment</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                This registration was completed in the Sanchay JEE Main Sandbox. In live government operations, this triggers an authentic NTA e-Challan payment gateway and admit card scheduling workflow.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/services/jee-main"
              className="px-6 py-2.5 bg-sanchay-navy-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors text-center"
            >
              Return to JEE Main Portal
            </Link>
            <Link
              href="/"
              className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors text-center"
            >
              National Service Directory
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
