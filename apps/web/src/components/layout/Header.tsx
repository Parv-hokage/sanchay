'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { user, profile, isAuthenticated, logout, openLogin } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-sanchay-navy-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                सं
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-sanchay-navy-900 leading-none">
                  SANCHAY
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                  संचय • Digital Governance
                </span>
              </div>
            </Link>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-sanchay-navy-700 text-white flex items-center justify-center text-xs font-bold">
                    {profile?.fullName?.charAt(0) || 'C'}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {profile?.fullName || 'Citizen'}
                    </span>
                    <span className="text-[10px] font-mono text-sanchay-gold-700 leading-tight">
                      UID: {user?.sanchayUid.substring(0, 8)}...
                    </span>
                  </div>
                </Link>

                <button
                  onClick={() => logout()}
                  className="text-xs font-semibold text-slate-600 hover:text-red-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={openLogin}
                className="px-4 py-2 bg-sanchay-navy-700 hover:bg-sanchay-navy-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
