'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api-client';
import { Evidence, KnowledgeSearchResult, AuthorityLevel } from '@sanchay/types';

interface KnowledgeSearchWidgetProps {
  initialServiceId?: string;
  placeholder?: string;
}

export const KnowledgeSearchWidget: React.FC<KnowledgeSearchWidgetProps> = ({
  initialServiceId,
  placeholder = 'Search official government rules, eligibility, bulletins & circulars...',
}) => {
  const [query, setQuery] = useState('');
  const [serviceId, setServiceId] = useState<string>(initialServiceId || '');
  const [results, setResults] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const sampleQueries = [
    { text: 'JEE Main Eligibility & Qualifications', service: 'jee-main' },
    { text: 'Ayushman Bharat Hospital Cover Limit', service: 'ayushman-bharat' },
    { text: 'JEE Marking Scheme & Exam Pattern', service: 'jee-main' },
    { text: 'Ayushman Beneficiary Identification SECC', service: 'ayushman-bharat' },
  ];

  const handleSearch = async (searchQuery?: string, targetService?: string) => {
    const q = searchQuery !== undefined ? searchQuery : query;
    const s = targetService !== undefined ? targetService : serviceId;

    if (!q.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({ query: q.trim() });
      if (s) params.append('serviceId', s);

      const res = await apiRequest<KnowledgeSearchResult>(`/knowledge/search?${params.toString()}`);
      setResults(res.data.evidence);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAuthorityBadge = (level: AuthorityLevel) => {
    switch (level) {
      case AuthorityLevel.TIER_1_OFFICIAL_GOV:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sanchay-navy-50 text-sanchay-navy-800 border border-sanchay-navy-200 flex items-center gap-1">
            <span>🏛️</span> Tier 1 Official Gov
          </span>
        );
      case AuthorityLevel.TIER_2_OFFICIAL_AGENCY:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
            <span>🏢</span> Official Agency
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
            Official Source
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Search Header */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-sanchay-gold-700 bg-sanchay-gold-50 px-2 py-0.5 rounded border border-sanchay-gold-200">
          Source-Grounded Government Knowledge
        </span>
        <h2 className="text-xl font-bold text-sanchay-navy-900 mt-1.5">
          Ask Official Knowledge Base
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          All results are directly retrieved with verified citations from official government bulletins and guidelines.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={placeholder}
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
            />
          </div>

          {!initialServiceId && (
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sanchay-navy-500"
            >
              <option value="">All Services</option>
              <option value="jee-main">JEE (Main) 2026</option>
              <option value="ayushman-bharat">Ayushman Bharat PM-JAY</option>
            </select>
          )}

          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 bg-sanchay-navy-700 hover:bg-sanchay-navy-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search Evidence'}
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400">Try:</span>
          {sampleQueries.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(s.text);
                setServiceId(s.service);
                handleSearch(s.text, s.service);
              }}
              className="text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              {s.text}
            </button>
          ))}
        </div>
      </div>

      {/* Results Container */}
      {isLoading ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-sanchay-navy-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Retrieving official evidence and scoring citations...</p>
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100 space-y-2">
          <p className="text-xs font-bold text-slate-700">No authoritative evidence found</p>
          <p className="text-[11px] text-slate-400">
            Try adjusting your search terms or selecting a different service category.
          </p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>Retrieved Evidence ({results.length} verified sources)</span>
            <span>Hybrid Match Score</span>
          </div>

          <div className="space-y-3.5">
            {results.map((item, idx) => (
              <div
                key={item.chunkId || idx}
                className="bg-slate-50/70 hover:bg-slate-50 rounded-2xl p-5 border border-slate-200 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getAuthorityBadge(item.authorityLevel)}
                    <span className="text-xs font-bold text-sanchay-navy-900">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-sanchay-emerald-700 bg-sanchay-emerald-50 px-2 py-0.5 rounded border border-sanchay-emerald-200">
                    Relevance: {Math.round(item.score * 100)}%
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {item.snippet}
                </p>

                {/* Structured Citation Bar */}
                <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[11px] text-slate-500 font-medium">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.section && (
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                        📌 Section: {item.section}
                      </span>
                    )}
                    {item.page && (
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                        📄 Page {item.page}
                      </span>
                    )}
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sanchay-navy-700 hover:text-sanchay-navy-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>View Official Source</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
