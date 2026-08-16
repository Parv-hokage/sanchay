'use client';

import React from 'react';
import Link from 'next/link';

interface ServiceCardProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  officialUrl: string;
  organization?: {
    name: string;
    department?: {
      name: string;
      slug: string;
    };
  };
  capabilities?: {
    id: string;
    name: string;
    type: string;
  }[];
  isFeatured?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  name,
  slug,
  description,
  organization,
  capabilities = [],
  isFeatured = false,
}) => {
  return (
    <div
      className={`group bg-white rounded-2xl border transition-all flex flex-col justify-between p-6 ${
        isFeatured
          ? 'border-sanchay-navy-300 shadow-md hover:shadow-xl hover:border-sanchay-navy-600 ring-1 ring-sanchay-navy-100'
          : 'border-slate-200 shadow-xs hover:shadow-md hover:border-slate-400'
      }`}
    >
      <div>
        {/* Department & Org Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {organization?.department && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-sanchay-navy-700 bg-sanchay-navy-50 px-2 py-0.5 rounded-md border border-sanchay-navy-100">
              {organization.department.name}
            </span>
          )}
          <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[200px]">
            {organization?.name || 'Government Organization'}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-sanchay-emerald-700 bg-sanchay-emerald-50 px-2 py-0.5 rounded-full border border-sanchay-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sanchay-emerald-500 animate-pulse" />
            Active
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-sanchay-navy-900 group-hover:text-sanchay-navy-700 transition-colors mb-2">
          {name}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
          {description}
        </p>

        {/* Capabilities Preview */}
        {capabilities.length > 0 && (
          <div className="mb-4">
            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
              Available Digital Capabilities:
            </span>
            <div className="flex flex-wrap gap-1">
              {capabilities.slice(0, 3).map((cap) => (
                <span
                  key={cap.id}
                  className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded"
                >
                  {cap.name}
                </span>
              ))}
              {capabilities.length > 3 && (
                <span className="text-[10px] text-slate-400 font-medium self-center px-1">
                  +{capabilities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <Link
          href={`/services/${slug}`}
          className="w-full text-center py-2 px-4 bg-sanchay-navy-700 hover:bg-sanchay-navy-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
        >
          <span>Access Unified Service</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
};
