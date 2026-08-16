'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { IdentityProviderType } from '@sanchay/types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, verifyOtp } = useAuth();
  const [step, setStep] = useState<'IDENTIFIER' | 'OTP'>('IDENTIFIER');
  const [provider, setProvider] = useState<IdentityProviderType>(IdentityProviderType.MOCK_IDP);
  const [identifier, setIdentifier] = useState('citizen_demo');
  const [challengeId, setChallengeId] = useState('');
  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await login(provider, identifier);
      setChallengeId(data.sessionChallengeId);
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await verifyOtp(challengeId, otp);
      onClose();
      setStep('IDENTIFIER');
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-sanchay-navy-950/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-sanchay-navy-900">Sign in to SANCHAY</h2>
            <p className="text-xs text-slate-500">Unified Citizen Digital Identity</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {step === 'IDENTIFIER' ? (
          <form onSubmit={handleStartLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Authentication Method
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as IdentityProviderType)}
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
              >
                <option value={IdentityProviderType.MOCK_IDP}>Mock Citizen ID (Instant Demo)</option>
                <option value={IdentityProviderType.MOBILE_OTP}>Mobile Number OTP</option>
                <option value={IdentityProviderType.EMAIL_OTP}>Email OTP</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {provider === IdentityProviderType.MOBILE_OTP
                  ? 'Mobile Number'
                  : provider === IdentityProviderType.EMAIL_OTP
                  ? 'Email Address'
                  : 'Citizen Username / ID'}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  provider === IdentityProviderType.MOBILE_OTP
                    ? '9876543210'
                    : provider === IdentityProviderType.EMAIL_OTP
                    ? 'citizen@example.gov.in'
                    : 'citizen_demo'
                }
                required
                className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sanchay-navy-700 hover:bg-sanchay-navy-800 text-white font-medium rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Requesting OTP...' : 'Continue to Verification'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-xs text-slate-600">
              Enter the verification code sent to <span className="font-semibold text-sanchay-navy-900">{identifier}</span>.
              <span className="block mt-1 text-slate-400 italic">Tip: Use 123456 in dev/test mode.</span>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verification Code (OTP)
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
                maxLength={6}
                className="w-full text-center tracking-widest text-lg font-bold border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('IDENTIFIER')}
                className="w-1/3 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg text-sm hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-2.5 bg-sanchay-gold-600 hover:bg-sanchay-gold-700 text-white font-medium rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
