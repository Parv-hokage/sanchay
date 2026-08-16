'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { KnowledgeSearchWidget } from '../../components/knowledge/KnowledgeSearchWidget';
import { apiRequest } from '../../lib/api-client';
import { KnowledgeSource } from '@sanchay/types';

export default function KnowledgePage() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSources() {
      try {
        const res = await apiRequest<KnowledgeSource[]>('/knowledge/sources');
        setSources(res.data);
      } catch {
        setSources([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSources();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex gap-8">
        <Sidebar />

        <div className="flex-1 space-y-8 min-w-0">
          {/* Page Banner */}
          <div className="bg-linear-to-r from-sanchay-navy-900 to-sanchay-navy-800 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-sanchay-gold-300 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                Phase 5 — RAG & Knowledge Platform
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Official Government Knowledge Base
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
                Explore authoritative rules, examination bulletins, and welfare guidelines retrieved directly from official government authorities with traceable citations.
              </p>
            </div>
          </div>

          {/* Interactive Search Engine */}
          <KnowledgeSearchWidget />

          {/* Official Registered Sources Registry */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sanchay-navy-700 bg-sanchay-navy-50 px-2 py-0.5 rounded border border-sanchay-navy-200">
                Authoritative Registry
              </span>
              <h2 className="text-xl font-bold text-sanchay-navy-900 mt-1.5">
                Registered Government Sources
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Only explicitly allowlisted official government domains and verified publications enter the Sanchay Knowledge Index.
              </p>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading verified source registry...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sources.map((src) => (
                  <div
                    key={src.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                        <span>{src.sourceType}</span>
                        <span className="text-sanchay-emerald-600 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-sanchay-emerald-500"></span> Verified & Active
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-sanchay-navy-900">{src.title}</h3>
                      <p className="text-xs font-mono text-slate-500 truncate mt-1">{src.url}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Freshness: Synced Today</span>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sanchay-navy-700 hover:text-sanchay-navy-900 font-bold hover:underline"
                      >
                        Visit Portal ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
