'use client';

import React from 'react';
import Link from 'next/link';

interface DepartmentCardProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName?: string | null;
  serviceCount: number;
  organizationCount: number;
  featuredServices?: { id: string; name: string; slug: string }[];
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  name,
  slug,
  description,
  serviceCount,
  organizationCount,
  featuredServices = [],
}) => {
  const getIcon = (slugName: string) => {
    switch (slugName) {
      case 'education':
        return '🎓';
      case 'healthcare':
        return '🏥';
      case 'finance':
        return '💼';
      case 'transport':
        return '🚗';
      default:
        return '🏛️';
    }
  };

  return (
    <Link
      href={`/departments/${slug}`}
      className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-sanchay-navy-400 hover:shadow-lg transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-sanchay-navy-50 text-sanchay-navy-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
            {getIcon(slug)}
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            {serviceCount} {serviceCount === 1 ? 'Service' : 'Services'}
          </span>
        </div>

        <h3 className="text-base font-bold text-sanchay-navy-900 group-hover:text-sanchay-navy-700 transition-colors mb-1.5 line-clamp-1">
          {name}
        </h3>
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {description}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100">
        {featuredServices.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {featuredServices.map((srv) => (
              <span
                key={srv.id}
                className="text-[10px] bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium"
              >
                {srv.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">
            {organizationCount} {organizationCount === 1 ? 'Agency' : 'Agencies'} registered
          </span>
        )}
      </div>
    </Link>
  );
};
