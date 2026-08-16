'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navigation: { name: string; href: string; icon: string; badge?: string }[] = [
    { name: 'Service Directory', href: '/', icon: '🏛️' },
    { name: 'My Profile & UID', href: '/profile', icon: '👤' },
    { name: 'My Applications', href: '/applications', icon: '📋' },
    { name: 'Document Vault', href: '/documents', icon: '📁' },
    { name: 'Official Knowledge', href: '/knowledge', icon: '📖' },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:block">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs sticky top-24">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Platform Hub
        </div>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-sanchay-navy-700 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-4 border-t border-slate-100">
          <div className="bg-sanchay-navy-50 rounded-xl p-3 border border-sanchay-navy-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-sanchay-emerald-500" />
              <span className="text-xs font-bold text-sanchay-navy-900">Zero Trust Identity</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              Every request is verified against strict server-side ownership boundaries.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
